import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { dbClient } from '../../../../../lib/supabase/dbClient'
import {
  deductCredits,
  getAgent,
  hasCredits,
  logAnalytics,
  saveConversation
} from '../../../../actions/agents' // Server actions for DB operations

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// ------------------ Rate Limiting ------------------
const rateLimitStore = new Map()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20

function checkRateLimit(identifier) {
  const now = Date.now()
  const userRequests = rateLimitStore.get(identifier) || []
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(
    (time) => now - time < RATE_LIMIT_WINDOW
  )
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) return false
  recentRequests.push(now)
  rateLimitStore.set(identifier, recentRequests)
  return true
}

// Clean up store periodically (interval logic retained)
setInterval(() => {
  const now = Date.now()
  for (const [key, requests] of rateLimitStore.entries()) {
    const recent = requests.filter((t) => now - t < RATE_LIMIT_WINDOW)
    if (recent.length === 0) rateLimitStore.delete(key)
    else rateLimitStore.set(key, recent)
  }
}, 60 * 1000)

// ------------------ POST ------------------
export async function POST(request, context) {
  const startTime = Date.now()
  let body
  const params = await context.params
  const { id } = params
  console.log('Received chat request for agent ID:', id)

  try {
    body = await request.json()

    const { message, sessionId, userId, metadata = {} } = body

    // 1. Initial Validation
    if (!message || !sessionId)
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      )

    if (message.length > 5000)
      return NextResponse.json(
        { error: 'Message too long. Maximum 5000 characters.' },
        { status: 400 }
      )

    // 2. Rate Limit Check
    const rateKey = userId || sessionId
    if (!checkRateLimit(rateKey))
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )

    // 3. Fetch Agent & Check Status
    console.log('Fetching agent with ID:', id)

    const agent = await getAgent(id, userId)
    const existingConversations = await dbClient.checkConversationExists(
      id,
      sessionId
    )
    const recentConversations = await dbClient.getConversations(
      id,
      sessionId,
      10
    )
    const knowledgeSources = await dbClient.getKnowledgeSources(id)

    console.log('Fetched agent:', agent)
    if (!agent) {
      return NextResponse.json(
        { error: `Agent ${id} not found` }, // Fixed string
        { status: 404 }
      )
    }
    if (!agent?.is_active) {
      return NextResponse.json(
        { error: 'Agent is currently inactive' },
        { status: 400 }
      )
    }
    // 4. Credit Check
    if (userId) {
      const enough = await hasCredits(userId, 1)
      if (!enough)
        return NextResponse.json(
          { error: 'Insufficient credits' },
          { status: 402 }
        )
    }

    // 5. Webhook: message received
    // await triggerWebhooks(id, 'message_received', {
    //   session_id: sessionId,
    //   user_message: message,
    //   user_id: userId,
    //   timestamp: new Date().toISOString(),
    //   metadata
    // })

    // 6. New Conversation Check (Restored Logic)

    // const isNewConversation =
    //   !existingConversations || existingConversations.length === 0

    // if (isNewConversation) {
    //   await triggerWebhooks(id, 'conversation_started', {
    //     session_id: sessionId,
    //     user_id: userId,
    //     first_message: message,
    //     timestamp: new Date().toISOString()
    //   })
    // }

    // 7. Conversation History
    // Assuming dbClient.getConversations now includes session_id filtering for efficiency
    // If not, it should be updated to do so. Here we revert to the explicit in-memory filter
    // to maintain the logic of the first file if dbClient can't be updated.

    const conversationHistory = (recentConversations || [])
      .reverse()
      .map((conv) => [
        { role: 'user', content: conv.user_message },
        { role: 'assistant', content: conv.agent_response }
      ])
      .flat()

    // 8. Knowledge Base & System Prompt (fetch separately for now)

    const knowledgeContext =
      knowledgeSources
        ?.filter((ks) => ks.status === 'completed')
        ?.map((ks) => ks.summary || ks.content?.slice(0, 500))
        ?.join('\n\n') || ''

    const systemPrompt =
      agent?.system_prompt ||
      generateDefaultSystemPrompt(agent, knowledgeContext)

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-20),
      { role: 'user', content: message }
    ]

    // 9. OpenAI API Call with Retry
    let completion
    let retries = 3

    while (retries > 0) {
      try {
        completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 800,
          temperature: 0.7,
          presence_penalty: 0.6,
          frequency_penalty: 0.3,
          user: sessionId
        })
        break
      } catch (err) {
        retries--
        if (retries === 0) throw err
        await new Promise((r) => setTimeout(r, (4 - retries) * 1000))
      }
    }

    const agentResponse =
      completion.choices[0]?.message?.content ||
      'I apologize, but I could not generate a response at this time.'
    const tokensUsage = completion.usage
    const tokensUsed = completion.usage?.total_tokens || 0
    const responseTime = Date.now() - startTime

    // 10. Persistence & Deductions (Using Server Actions)
    const conversation = await saveConversation(
      id,
      sessionId,
      message,
      agentResponse,
      {
        ...metadata,
        model: 'gpt-4o-mini',
        tokens_used: tokensUsed,
        tokens_usage_metadata: tokensUsage,
        response_time_ms: responseTime,
        user_id: userId
      }
    )

    await logAnalytics(
      id,
      'conversation',
      {
        session_id: sessionId,
        user_id: userId,
        message_length: message.length,
        response_length: agentResponse.length,
        response_time_ms: responseTime
      },
      tokensUsed,
      true
    )

    if (userId) await deductCredits(userId, 1)

    // // 11. Webhook: Agent Responded
    // await triggerWebhooks(id, 'agent_responded', {
    //   session_id: sessionId,
    //   user_message: message,
    //   agent_response: agentResponse,
    //   tokens_used: tokensUsed,
    //   response_time_ms: responseTime,
    //   user_id: userId,
    //   timestamp: new Date().toISOString()
    // })

    // // 12. Check Workflows (Action Execution Restored)
    // await checkAndTriggerWorkflows(
    //   dbClient,
    //   agent,
    //   message,
    //   agentResponse,
    //   sessionId
    // )

    // 13. Final Response
    return NextResponse.json(
      {
        response: agentResponse,
        sessionId,
        conversationId: conversation?.id, // Get ID from saveConversation if it returns one
        tokensUsed,
        responseTimeMs: responseTime,
        agentId: id,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-Response-Time': `${responseTime}ms`
        }
      }
    )
  } catch (error) {
    console.error('Chat API error:', error)

    const session_id = body?.sessionId
    const user_id = body?.userId

    // Log failed analytics (Restored Logic)
    try {
      await logAnalytics(
        id,
        'conversation',
        {
          error: error.message,
          error_type: error.constructor.name,
          session_id,
          user_id // Attempt to log if possible
        },
        0,
        false
      )
    } catch (logError) {
      console.error('Error logging failed analytics:', logError)
    }

    // Handle specific OpenAI errors (Restored Logic)
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please contact support.' },
        { status: 503 }
      )
    }

    if (error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'OpenAI rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      )
    }

    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'AI service configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    // Generic fallback
    return NextResponse.json(
      {
        error: 'An unexpected error occurred.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ------------------ GET ------------------
export async function GET(request, context) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!sessionId)
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )

    // Efficient fetching: Assuming dbClient.getConversations now handles
    // both agent_id and session_id filtering in the database query.
    const conversations = await dbClient.getConversations(id, sessionId, limit)

    return NextResponse.json({
      conversations,
      count: conversations.length,
      sessionId
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation history' },
      { status: 500 }
    )
  }
}

// ------------------ Helpers (Updated for Parity) ------------------

// Helper to check and execute workflow actions (Restored Logic)
// async function executeWorkflowActions(workflow, context) {
//   try {
//     const actions = workflow.workflow_data?.actions || []
//     for (const action of actions) {
//       switch (action.type) {
//         case 'webhook':
//           // Handled by the workflow_triggered webhook above
//           break
//         case 'email':
//           console.log(
//             'Executing Email action:',
//             action.config,
//             'Context:',
//             context.sessionId
//           )
//           // Integration with email service (e.g., SendGrid, Mailgun)
//           break
//         case 'update_crm':
//           console.log(
//             'Executing CRM update action:',
//             action.config,
//             'Context:',
//             context.sessionId
//           )
//           // Integration with CRM API (e.g., Salesforce, HubSpot)
//           break
//         default:
//           console.log('Unknown action type:', action.type)
//       }
//     }
//   } catch (error) {
//     console.error('Error executing workflow actions:', error)
//   }
// }

// Helper to check and trigger workflows (Action Execution Restored)
// async function checkAndTriggerWorkflows(
//   dbClient,
//   agent,
//   userMessage,
//   agentResponse,
//   sessionId
// ) {
//   try {
//     // Assuming dbClient.getWorkflows fetches active workflows
//     const workflows = await dbClient.getWorkflows(agent?.id)
//     if (!workflows || workflows.length === 0) return

//     for (const workflow of workflows) {
//       let shouldTrigger = false
//       switch (workflow.trigger_type) {
//         case 'message_received':
//           shouldTrigger = true
//           break
//         case 'keyword_match':
//           const keywords = workflow.workflow_data?.keywords || []
//           shouldTrigger = keywords.some((k) =>
//             userMessage.toLowerCase().includes(k.toLowerCase())
//           )
//           break
//         // Intent detection trigger omitted as it requires a classification step not present here
//       }

//       if (shouldTrigger) {
//         // Trigger webhook for the event
//         await triggerWebhooks(agent?.id, 'workflow_triggered', {
//           workflow_id: workflow.id,
//           workflow_name: workflow.name,
//           trigger_type: workflow.trigger_type,
//           session_id: sessionId,
//           user_message: userMessage,
//           agent_response: agentResponse,
//           timestamp: new Date().toISOString()
//         })

//         // Execute the associated actions (Restored Logic)
//         await executeWorkflowActions(workflow, {
//           userMessage,
//           agentResponse,
//           sessionId,
//           agentId: agent?.id
//         })
//       }
//     }
//   } catch (err) {
//     console.error('Error triggering workflows:', err)
//   }
// }

function generateDefaultSystemPrompt(agent, knowledgeContext) {
  const purposeInstructions = {
    instagram:
      'You are an Instagram DM assistant. Respond to direct messages professionally and help users with their inquiries. Keep responses concise and engaging.',
    messenger:
      'You are a Messenger chatbot. Provide helpful responses and guide users through conversations. Be friendly and efficient.',
    calendar:
      'You are a calendar booking assistant. Help users schedule appointments and manage their calendar. Ask clarifying questions to book meetings correctly.',
    website:
      'You are a website customer support agent?. Answer questions and provide assistance to website visitors. Be helpful and professional.',
    general:
      'You are a helpful AI assistant. Provide accurate and useful information to users.'
  }

  const toneAdjustments = {
    friendly: 'Use a warm, approachable, and friendly tone.',
    professional: 'Maintain a formal and business-like tone.',
    casual: 'Use a relaxed and conversational tone.',
    enthusiastic: 'Be energetic, excited, and positive.',
    helpful: 'Focus on being solution-oriented and supportive.'
  }

  const basePrompt = `You are ${agent?.name}, an AI assistant. ${purposeInstructions[agent?.purpose] || purposeInstructions.general}

${toneAdjustments[agent?.tone] || toneAdjustments.friendly}

${agent?.persona ? `Your personality and behavior: ${agent?.persona}\n` : ''}`

  const knowledgePrompt = knowledgeContext
    ? `
Use the following knowledge base to answer questions accurately:
${knowledgeContext}

Important guidelines:
- Base your answers on the provided knowledge base
- If you don't know something, say so - don't make up information
- Stay in character and maintain your assigned tone
- Keep responses concise but complete
- Ask clarifying questions when needed`
    : `
Important guidelines:
- Be helpful and accurate
- Stay in character and maintain your assigned tone
- If you don't know something, admit it
- Keep responses clear and concise`

  return basePrompt + knowledgePrompt
}

// ------------------ OPTIONS ------------------
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}
