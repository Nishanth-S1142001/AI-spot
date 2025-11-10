/**
 * COMPLETE CHAT ROUTE WITH USER API KEY SUPPORT
 * Features:
 * - User-provided API keys OR platform keys
 * - Vector-based knowledge retrieval
 * - Booking flow handling
 * - Rate limiting, caching, credits
 * - Analytics and conversation logging
 */

import { NextResponse } from 'next/server'
import { checkRateLimit } from '../../../../../lib/api/rate-limiter'
import { BookingParser } from '../../../../../lib/booking/booking-utils'
import { VectorDB } from '../../../../../lib/vector/vectordb'
import { getOpenAIClient } from '../chat-helpers' // ✅ NEW IMPORT
import {
  deductCredits,
  getAgent,
  hasCredits,
  logAnalytics,
  saveConversation,
  checkConversationExists,
  getConversations,
  getKnowledgeSources,
  getAgentCalendar
} from '../../../../actions/agents'

// ❌ REMOVE MODULE-LEVEL OPENAI INITIALIZATION
// const openai = new OpenAI({ ... })

// Cache for agent data
const agentCache = new Map()
const AGENT_CACHE_TTL = 5 * 60 * 1000

function getCachedAgent(agentId) {
  const cached = agentCache.get(agentId)
  if (cached && Date.now() - cached.timestamp < AGENT_CACHE_TTL) {
    return cached.data
  }
  return null
}

function setCachedAgent(agentId, data) {
  agentCache.set(agentId, { data, timestamp: Date.now() })
}

// MAIN POST HANDLER
export async function POST(request, context) {
  const startTime = Date.now()
  let body
  const params = await context.params
  const { id: agentId } = params

  try {
    body = await request.json()
    const {
      message,
      sessionId,
      userId,
      metadata = {},
      useKnowledgeBase = true,
      knowledgeSearchThreshold = 0.7,
      knowledgeResultLimit = 3
    } = body

    // 1. Fast-fail validation
    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message too long. Maximum 5000 characters.' },
        { status: 400 }
      )
    }

    // 2. Rate limiting
    const rateKey = `chat:${userId || sessionId}`
    const rateCheck = checkRateLimit(rateKey, {
      limit: process.env.CHAT_RATE_LIMIT || 20,
      windowMs: 60 * 1000
    })

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': rateCheck.retryAfter.toString(),
            'X-RateLimit-Limit': rateCheck.limit.toString(),
            'X-RateLimit-Remaining': rateCheck.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateCheck.resetAt).toISOString()
          }
        }
      )
    }

    // 3. Parallel data fetching
    const [
      agent,
      existingConversations,
      recentConversations,
      knowledgeSources,
      creditCheck,
      agentCalendar
    ] = await Promise.all([
      (async () => {
        const cached = getCachedAgent(agentId)
        if (cached) return cached
        const freshAgent = await getAgent(agentId, userId)
        if (freshAgent) setCachedAgent(agentId, freshAgent)
        return freshAgent
      })(),
      checkConversationExists(agentId, sessionId),
      getConversations(agentId, sessionId, 10),
      getKnowledgeSources(agentId),
      userId ? hasCredits(userId, 1) : Promise.resolve(true),
      getAgentCalendar(agentId)
    ])

    // 4. Fast-fail checks
    if (!agent) {
      return NextResponse.json(
        { error: `Agent ${agentId} not found` },
        { status: 404 }
      )
    }

    if (!agent.is_active) {
      return NextResponse.json(
        { error: 'Agent is currently inactive' },
        { status: 400 }
      )
    }

    // ✅ NEW: Only check credits if using platform key
    if (userId && agent.use_platform_key && !creditCheck) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please top up your account or configure your own API key.' },
        { status: 402 }
      )
    }

    // ============================================================
    // ✅ NEW: GET OPENAI CLIENT WITH USER/PLATFORM KEY
    // ============================================================
    
    let openaiClient, apiKeySource, apiProvider
    
    try {
      const result = await getOpenAIClient(agentId, userId)
      openaiClient = result.client
      apiKeySource = result.source // 'user' or 'platform'
      apiProvider = result.provider // 'openai'
      
      console.log(`🔑 Using ${apiKeySource} API key (${apiProvider})`)
    } catch (keyError) {
      console.error('❌ Failed to get API key:', keyError)
      
      return NextResponse.json(
        { 
          error: keyError.message || 'Failed to initialize AI service. Please check your API key configuration.',
          errorCode: 'API_KEY_ERROR'
        },
        { status: 500 }
      )
    }

    // ============================================================
    // 5. VECTOR KNOWLEDGE BASE SEARCH
    // ============================================================

    let knowledgeContext = ''
    let retrievedSources = []
    let vectorSearchPerformed = false

    if (useKnowledgeBase && knowledgeSources && knowledgeSources.length > 0) {
      try {
        console.log('🔍 Performing vector search for:', message)

        const searchResults = await VectorDB.searchKnowledge(
          agentId,
          message,
          knowledgeResultLimit,
          knowledgeSearchThreshold
        )

        if (searchResults && searchResults.length > 0) {
          vectorSearchPerformed = true

          knowledgeContext = '\n\n=== KNOWLEDGE BASE CONTEXT ===\n'
          knowledgeContext +=
            'The following information is from documents the user has provided. This is THE SOURCE OF TRUTH - prioritize this information over your general knowledge:\n\n'

          searchResults.forEach((result, index) => {
            const relevancePercent = (result.similarity * 100).toFixed(1)
            knowledgeContext += `[Document ${index + 1}] (${result.metadata?.fileName || 'Uploaded Document'}) - Relevance: ${relevancePercent}%\n`
            knowledgeContext += `${result.content}\n\n`

            retrievedSources.push({
              sourceId: result.knowledge_source_id,
              sourceName:
                result.metadata?.fileName ||
                result.metadata?.url ||
                'Uploaded Document',
              similarity: result.similarity,
              relevanceScore: relevancePercent,
              content: result.content.substring(0, 200) + '...'
            })
          })

          knowledgeContext += '=== END KNOWLEDGE BASE CONTEXT ===\n\n'
          console.log(
            `✅ Found ${searchResults.length} relevant knowledge sources`
          )
        } else {
          // Fallback: Load all documents
          console.log('⚠️ Vector search found nothing - using fallback')

          if (knowledgeSources.length > 0) {
            vectorSearchPerformed = true

            knowledgeContext =
              '\n\n=== KNOWLEDGE BASE CONTEXT (FULL DOCUMENTS) ===\n'

            knowledgeSources.forEach((source, index) => {
              const fileName =
                source.file_name || source.source_url || 'Uploaded Document'
              const content = source.content || ''

              const truncatedContent =
                content.length > 3000
                  ? content.substring(0, 3000) +
                    '\n\n[... content truncated ...]'
                  : content

              knowledgeContext += `[Document ${index + 1}] ${fileName}\n`
              knowledgeContext += `${truncatedContent}\n\n`

              retrievedSources.push({
                sourceId: source.id,
                sourceName: fileName,
                similarity: 1.0,
                relevanceScore: '100.0',
                content: content.substring(0, 200) + '...'
              })
            })

            knowledgeContext += '=== END KNOWLEDGE BASE CONTEXT ===\n\n'
            console.log(
              `✅ Loaded ${knowledgeSources.length} full document(s) as fallback`
            )
          }
        }
      } catch (searchError) {
        console.error('❌ Knowledge base search error:', searchError)
      }
    }

    // ============================================================
    // 6. BOOKING SYSTEM INTEGRATION
    // ============================================================

    let bookingContext = null
    let isBookingFlow = false

    const isConfirmation = BookingParser.isConfirmationIntent(message)

    const recentBookingMessages = recentConversations
      .filter((conv) => conv.metadata?.booking_context)
      .slice(0, 3)

    const wasInBookingFlow = recentBookingMessages.length > 0
    const lastBookingContext =
      recentBookingMessages[0]?.metadata?.booking_context

    let accumulatedData = lastBookingContext?.extractedData || {
      date: null,
      time: null,
      timezone: null,
      name: null,
      email: null,
      phone: null,
      notes: null
    }

    const currentMessageIsBooking = BookingParser.isBookingIntent(message)

    if (
      agentCalendar?.is_active &&
      (currentMessageIsBooking ||
        (wasInBookingFlow &&
          !lastBookingContext?.isComplete &&
          !lastBookingContext?.bookingCreated))
    ) {
      isBookingFlow = true

      const parser = new BookingParser()
      const bookingData = parser.parseBookingRequest(message)

      let newDataCollected = false

      // Merge new data
      if (bookingData.date) {
        accumulatedData.date = bookingData.date
        newDataCollected = true
      }
      if (bookingData.time) {
        accumulatedData.time = bookingData.time
        newDataCollected = true
      }
      if (bookingData.timezone) {
        accumulatedData.timezone = bookingData.timezone
        newDataCollected = true
      }
      if (bookingData.name) {
        accumulatedData.name = bookingData.name
        newDataCollected = true
      }
      if (bookingData.email) {
        accumulatedData.email = bookingData.email
        newDataCollected = true
      }
      if (bookingData.phone) {
        accumulatedData.phone = bookingData.phone
        newDataCollected = true
      }
      if (bookingData.notes) {
        accumulatedData.notes = bookingData.notes
        newDataCollected = true
      }

      const required = ['date', 'time', 'name', 'email']
      const isComplete = required.every(
        (field) => accumulatedData[field] !== null
      )

      bookingContext = {
        isBookingFlow: true,
        extractedData: accumulatedData,
        isComplete: isComplete,
        confidence: bookingData.confidence,
        calendarConfig: {
          integration_type: agentCalendar.integration_type,
          calendly_url: agentCalendar.calendly_url,
          booking_duration: agentCalendar.booking_duration
        }
      }

      const shouldCreateBooking =
        isComplete &&
        (isConfirmation ||
          (newDataCollected && !lastBookingContext?.bookingCreated))

      if (shouldCreateBooking) {
        try {
          const bookingResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/agents/${agentId}/bookings`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                date: accumulatedData.date,
                time: accumulatedData.time,
                timezone: accumulatedData.timezone || 'UTC',
                customer_name: accumulatedData.name,
                customer_email: accumulatedData.email,
                customer_phone: accumulatedData.phone,
                customer_notes: accumulatedData.notes,
                session_id: sessionId,
                duration_minutes: agentCalendar.booking_duration
              })
            }
          )

          const bookingResult = await bookingResponse.json()

          if (bookingResponse.ok) {
            bookingContext.bookingCreated = true
            bookingContext.bookingId = bookingResult.booking.id
            bookingContext.externalUrl = bookingResult.booking.external_url
            console.log('✅ Booking created successfully')
          } else {
            bookingContext.bookingError = bookingResult.error
            console.error('❌ Booking creation failed:', bookingResult.error)
          }
        } catch (error) {
          console.error('❌ Booking API error:', error)
          bookingContext.bookingError = 'Failed to create booking'
        }
      }
    }

    // ============================================================
    // 7. BUILD ENHANCED SYSTEM PROMPT
    // ============================================================

    let systemPrompt = generateSystemPrompt(agent, agentCalendar)

    if (knowledgeContext) {
      systemPrompt += `\n${knowledgeContext}`
    }

    if (isBookingFlow) {
      systemPrompt += `\n\n=== BOOKING FLOW ACTIVE ===
Current booking data extracted:
${JSON.stringify(bookingContext.extractedData, null, 2)}

Completion status: ${bookingContext.isComplete ? 'COMPLETE' : 'INCOMPLETE'}
Confidence: ${(bookingContext.confidence * 100).toFixed(0)}%

${
  !bookingContext.isComplete
    ? `MISSING INFORMATION:
${!bookingContext.extractedData.date ? '- Date\n' : ''}
${!bookingContext.extractedData.time ? '- Time\n' : ''}
${!bookingContext.extractedData.name ? '- Name\n' : ''}
${!bookingContext.extractedData.email ? '- Email\n' : ''}`
    : ''
}

${
  bookingContext.isComplete && !bookingContext.bookingCreated
    ? `ALL INFORMATION COLLECTED! Please confirm.`
    : ''
}

${
  bookingContext.bookingCreated
    ? `✅ BOOKING CONFIRMED!
Booking ID: ${bookingContext.bookingId}`
    : ''
}
`
    }

    // ============================================================
    // 8. BUILD CONVERSATION HISTORY
    // ============================================================

    const conversationHistory = recentConversations
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .flatMap((conv) => [
        { role: 'user', content: conv.user_message },
        { role: 'assistant', content: conv.agent_response }
      ])

    // ============================================================
    // 9. CALL OPENAI WITH USER/PLATFORM KEY
    // ============================================================

    const completion = await openaiClient.chat.completions.create({
      model: agent.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10),
        { role: 'user', content: message }
      ],
      temperature: agent.temperature || 0.7,
      max_tokens: agent.max_tokens || 1000,
      frequency_penalty: 0.3,
      user: sessionId,
      stream: false
    })

    const agentResponse =
      completion.choices[0]?.message?.content ||
      'I apologize, but I could not generate a response at this time.'

    const tokensUsage = completion.usage
    const tokensUsed = completion.usage?.total_tokens || 0
    const responseTime = Date.now() - startTime

    // ============================================================
    // 10. SAVE CONVERSATION
    // ============================================================

    const conversationMetadata = {
      ...metadata,
      model: agent.model || 'gpt-4o-mini',
      tokens_used: tokensUsed,
      tokens_usage_metadata: tokensUsage,
      response_time_ms: responseTime,
      user_id: userId,
      api_key_source: apiKeySource, // ✅ NEW: Track which key was used
      vector_search_performed: vectorSearchPerformed,
      knowledge_sources_used: retrievedSources.length,
      knowledge_sources: retrievedSources
    }

    if (bookingContext) {
      conversationMetadata.booking_context = bookingContext
    }

    const conversation = await saveConversation(
      agentId,
      sessionId,
      message,
      agentResponse,
      conversationMetadata
    )

    // ============================================================
    // 11. ANALYTICS AND CREDITS
    // ============================================================

    // ✅ CRITICAL: Only deduct credits if using PLATFORM key
    const shouldDeductCredits = userId && apiKeySource === 'platform'

    Promise.all([
      logAnalytics(
        agentId,
        isBookingFlow ? 'booking_interaction' : 'conversation',
        {
          session_id: sessionId,
          user_id: userId,
          message_length: message.length,
          response_length: agentResponse.length,
          response_time_ms: responseTime,
          api_key_source: apiKeySource, // ✅ NEW: Track in analytics
          booking_flow: isBookingFlow,
          booking_complete: bookingContext?.isComplete || false,
          booking_created: bookingContext?.bookingCreated || false,
          vector_search_performed: vectorSearchPerformed,
          knowledge_sources_used: retrievedSources.length
        },
        tokensUsed,
        true
      ),
      shouldDeductCredits ? deductCredits(userId, 1) : Promise.resolve()
    ]).catch((err) => console.error('Background task error:', err))

    // ============================================================
    // 12. RETURN ENHANCED RESPONSE
    // ============================================================

    return NextResponse.json(
      {
        response: agentResponse,
        conversationId: conversation?.id,
        tokensUsed,
        responseTimeMs: responseTime,
        agentId,
        timestamp: new Date().toISOString(),
        apiKeySource, // ✅ NEW: Tell client which key was used
        knowledge: {
          searchPerformed: vectorSearchPerformed,
          sourcesFound: retrievedSources.length,
          sources: retrievedSources.map((s) => ({
            name: s.sourceName,
            relevance: s.relevanceScore,
            preview: s.content
          }))
        },
        bookingContext: bookingContext
          ? {
              isBookingFlow: bookingContext.isBookingFlow,
              isComplete: bookingContext.isComplete,
              confidence: bookingContext.confidence,
              bookingCreated: bookingContext.bookingCreated,
              bookingId: bookingContext.bookingId,
              externalUrl: bookingContext.externalUrl,
              extractedData: bookingContext.extractedData
            }
          : null
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-Response-Time': `${responseTime}ms`,
          'X-Tokens-Used': tokensUsed.toString(),
          'X-API-Key-Source': apiKeySource, // ✅ NEW: Header for debugging
          'X-Knowledge-Used': vectorSearchPerformed.toString(),
          'X-Knowledge-Sources': retrievedSources.length.toString()
        }
      }
    )
  } catch (error) {
    console.error('Chat API error:', error)

    const session_id = body?.sessionId
    const user_id = body?.userId
    const responseTime = Date.now() - startTime

    logAnalytics(
      agentId,
      'conversation',
      {
        error: error.message,
        error_type: error.constructor.name,
        session_id,
        user_id,
        response_time_ms: responseTime
      },
      0,
      false
    ).catch(() => {})

    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Service temporarily busy. Please try again in a moment.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    if (error.status === 401 || error.code === 'invalid_api_key') {
      return NextResponse.json(
        { 
          error: 'Invalid API key. Please check your API key configuration.',
          errorCode: 'INVALID_API_KEY'
        },
        { status: 401 }
      )
    }

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

// GET handler remains the same
export async function GET(request, context) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const conversations = await getConversations(id, sessionId, limit)

    return NextResponse.json(
      {
        conversations,
        count: conversations.length,
        sessionId
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=10',
          'X-Total-Count': conversations.length.toString()
        }
      }
    )
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation history' },
      { status: 500 }
    )
  }
}

// Helper function to generate system prompt
function generateSystemPrompt(agent, agentCalendar) {
  const purposeInstructions = {
    instagram:
      'You are an Instagram DM assistant. Respond professionally and help users with their inquiries.',
    messenger:
      'You are a Messenger chatbot. Provide helpful responses and guide users.',
    calendar:
      'You are a calendar booking assistant. Help users schedule appointments efficiently.',
    website:
      'You are a website customer support agent. Answer questions and provide assistance.',
    general:
      'You are a helpful AI assistant. Provide accurate and useful information.'
  }

  const toneAdjustments = {
    friendly: 'Use a warm, approachable, and friendly tone.',
    professional: 'Maintain a formal and business-like tone.',
    casual: 'Use a relaxed and conversational tone.',
    enthusiastic: 'Be energetic, excited, and positive.',
    helpful: 'Focus on being solution-oriented and supportive.'
  }

  let prompt = `You are ${agent?.name}, an AI assistant. ${purposeInstructions[agent?.purpose] || purposeInstructions.general}

${toneAdjustments[agent?.tone] || toneAdjustments.friendly}

${agent?.persona ? `Your personality: ${agent?.persona}\n` : ''}`

  if (agentCalendar?.is_active) {
    prompt += `\n\n=== CALENDAR BOOKING CAPABILITIES ===
You have access to a calendar booking system:
- Integration: ${agentCalendar.integration_type}
- Default duration: ${agentCalendar.booking_duration} minutes
- Timezone: ${agentCalendar.timezone}
${agentCalendar.calendly_url ? `- Calendly URL: ${agentCalendar.calendly_url}\n` : ''}

When users want to schedule appointments, collect: date, time, name, email.
Be conversational and confirm all details before finalizing.
`
  }

  if (agent?.system_prompt) {
    prompt += `\n\nAdditional Instructions:\n${agent.system_prompt}`
  }

  return prompt
}