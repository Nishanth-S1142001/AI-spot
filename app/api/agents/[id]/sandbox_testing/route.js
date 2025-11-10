import { NextResponse } from 'next/server'
import { getOpenAIClient } from '../chat-helpers' // ✅ NEW IMPORT
import { getAgent } from '../../../../actions/agents'

// ❌ REMOVE MODULE-LEVEL OPENAI
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ------------------ POST: Sandbox Chat ------------------
export async function POST(request, context) {
  const startTime = Date.now()
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { message, userId, metadata = {} } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // 1. Fetch agent
    const agent = await getAgent(id, userId)
    if (!agent) {
      return NextResponse.json(
        { error: `Agent ${id} not found` },
        { status: 404 }
      )
    }
    if (!agent.is_active) {
      return NextResponse.json({ error: 'Agent is inactive' }, { status: 400 })
    }

    // ============================================================
    // ✅ GET OPENAI CLIENT WITH USER/PLATFORM KEY
    // ============================================================
    
    let openaiClient, apiKeySource
    
    try {
      const result = await getOpenAIClient(id, userId)
      openaiClient = result.client
      apiKeySource = result.source
      
      console.log(`🔑 Sandbox using ${apiKeySource} API key`)
    } catch (keyError) {
      return NextResponse.json(
        { 
          error: 'Failed to initialize AI service. Please configure your API key in settings.',
          errorCode: 'API_KEY_ERROR'
        },
        { status: 500 }
      )
    }

    // 2. Build system prompt
    const knowledgeContext = (agent.knowledge_base || '').slice(0, 2000) // safety limit
    const systemPrompt =
      agent.system_prompt ||
      `You are ${agent.name}, an AI assistant.${
        knowledgeContext
          ? ` Use the following knowledge to answer questions accurately:\n${knowledgeContext}`
          : ''
      }\n\nImportant guidelines:\n- Base answers on provided knowledge\n- If unsure, say so\n- Stay concise and helpful`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ]

    // 3. Retry logic for OpenAI API
    let completion
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // ✅ USE DYNAMIC CLIENT
        completion = await openaiClient.chat.completions.create({
          model: agent.model || 'gpt-4o-mini',
          messages,
          max_tokens: 800,
          temperature: agent.temperature || 0.7,
        })
        break
      } catch (err) {
        if (attempt === 3) {
          // Check for API key errors
          if (err.status === 401 || err.code === 'invalid_api_key') {
            return NextResponse.json(
              { 
                error: 'Invalid API key. Please check your API key configuration.',
                errorCode: 'INVALID_API_KEY'
              },
              { status: 401 }
            )
          }
          throw err
        }
        console.warn(`Retrying OpenAI request (attempt ${attempt})...`)
        await new Promise((r) => setTimeout(r, 1000 * attempt))
      }
    }

    const agentResponse =
      completion?.choices?.[0]?.message?.content?.trim() ||
      'I could not generate a response.'

    const tokensUsed = completion?.usage?.total_tokens || 0
    const duration = Date.now() - startTime

    // 4. Return response with useful metadata
    return NextResponse.json(
      {
        response: agentResponse,
        agentId: id,
        tokensUsed,
        responseTimeMs: duration,
        apiKeySource, // ✅ NEW: Track key source
        metadata
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-Response-Time': `${duration}ms`,
          'X-API-Key-Source': apiKeySource // ✅ NEW: Header
        }
      }
    )
  } catch (error) {
    console.error('Sandbox chat error:', error)
    
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return NextResponse.json(
        { 
          error: 'Invalid API key',
          errorCode: 'INVALID_API_KEY'
        },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ------------------ OPTIONS (CORS) ------------------
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