import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAgent } from '../../../../actions/agents'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// ------------------ POST: Sandbox Chat ------------------
export async function POST(request, context) {
  try {
    const params = await context.params
    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { message, userId, metadata = {} } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Fetch agent including knowledge_base and sys_prompt columns
    const agent = await getAgent(id, userId)
    if (!agent) {
      return NextResponse.json(
        { error: `Agent ${id} not found` },
        { status: 404 }
      )
    }

    if (!agent?.is_active) {
      return NextResponse.json({ error: 'Agent is inactive' }, { status: 400 })
    }

    const knowledgeContext = agent?.knowledge_base || ''
    const systemPrompt =
      agent?.system_prompt ||
      `
You are ${agent?.name}, an AI assistant.

${knowledgeContext ? `Use the following knowledge to answer questions accurately:\n${knowledgeContext}` : ''}

Important guidelines:
- Base your answers on the provided knowledge
- If you don't know something, say so
- Stay in character and maintain a helpful tone
- Keep responses concise
`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 800,
      temperature: 0.7
    })

    const agentResponse =
      completion.choices[0]?.message?.content ||
      'I could not generate a response.'

    return NextResponse.json({ response: agentResponse, agentId: id })
  } catch (error) {
    console.error('Sandbox chat error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    )
  }
}

// ------------------ OPTIONS ------------------
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}
