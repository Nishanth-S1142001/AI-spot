import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * API Route Handler for updating an agent's knowledge base via AI instructions.
 * Path: /api/v1/agents/[id]/knowledge-update
 */
export async function POST(req, { params }) {
  const { id } = params // The agent ID from the URL path

  try {
    // 1. Extract data from the client-side request body
    const body = await req.json()
    const {
      instruction, // Expected from client-side `instructionText`
      currentKnowledge, // Expected from client-side `botBody`
      userId
    } = body

    // 2. Validate required fields
    if (!instruction || !currentKnowledge) {
      return NextResponse.json(
        {
          error:
            'Missing instruction or current knowledge content to make changes to the bot.'
        },
        { status: 400 }
      )
    }

    // 3. Prepare the Prompt for OpenAI
    // The client sends instruction as a single string, so joining arrays isn't strictly necessary,
    // but we can keep the defensive logic for robustness.
    const joinedInstruction = instruction.trim()
    const joinedContent = currentKnowledge.trim()

    // 4. Call OpenAI to modify the content
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that makes changes to the content provided in the CURRENT KNOWLEDGE section by strictly applying the instruction provided by the user in the INSTRUCTION section. Only return the revised knowledge content, nothing else.'
        },
        {
          role: 'user',
          content: `CURRENT KNOWLEDGE:\n\n${joinedContent}\n\nINSTRUCTION:\n\n${joinedInstruction}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    })

    const revisedContent =
      completion.choices[0]?.message?.content?.trim() || null

    if (!revisedContent) {
      return NextResponse.json(
        { error: 'AI failed to generate revised content.' },
        { status: 500 }
      )
    }

    // 5. Success Response
    // The client expects 'knowledge_base' in the response data object.
    return NextResponse.json(
      {
        agentId: id,
        userId: userId,
        knowledge_base: revisedContent // Match client's expected key
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      `❌ Error processing knowledge update for agent ${params.id}:`,
      error
    )

    // Add logging here if needed, similar to the chat logic
    // try {
    //     await dbClient.logAnalytics(id, 'knowledge_update_failed', { error: error.message, userId })
    // } catch (logError) {
    //     console.error('Error logging failed analytics:', logError)
    // }

    return NextResponse.json(
      {
        error:
          error.message ||
          'An internal server error occurred during content revision.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// OPTIONS handler for CORS (Good practice for Next.js API routes)
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
