import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { VectorDB } from '../../../../../lib/vector/vectordb'
import {
  verifyAgentOwnership,
  addKnowledgeSource,
  updateKnowledgeSource
} from '../../../../actions/agents'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req, { params }) {
  const { id: agentId } = await params

  try {
    const body = await req.json()
    const { instructions, userId } = body

    if (!instructions || !userId) {
      return NextResponse.json(
        { error: 'Instructions and user ID are required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const agent = await verifyAgentOwnership(agentId, userId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      )
    }

    // Convert to structured knowledge
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Convert user instructions into clear, structured knowledge entries. Return ONLY the knowledge content, no meta-commentary.`
        },
        {
          role: 'user',
          content: `NEW INSTRUCTION:\n${instructions}\n\nConvert this into a clear knowledge base entry.`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })

    const structuredKnowledge = completion.choices[0]?.message?.content?.trim()

    if (!structuredKnowledge) {
      return NextResponse.json(
        { error: 'Failed to generate knowledge content' },
        { status: 500 }
      )
    }

    // Create knowledge source
    const knowledgeSource = await addKnowledgeSource(agentId, {
      source_type: 'instruction',
      file_name: `Instruction: ${instructions.substring(0, 50)}...`,
      content: structuredKnowledge,
      summary: JSON.stringify({
        type: 'user_instruction',
        instruction: instructions,
        created_at: new Date().toISOString()
      }),
      status: 'processing'
    })

    // Vectorize
    const vectorResult = await VectorDB.processKnowledgeSource(
      agentId,
      knowledgeSource.id,
      structuredKnowledge,
      {
        type: 'user_instruction',
        instruction: instructions,
        fileName: knowledgeSource.file_name
      }
    )

    // Update status
    await updateKnowledgeSource(knowledgeSource.id, {
      status: 'completed',
      vector_count: vectorResult.vectorCount,
      processed_at: new Date().toISOString()
    })

    console.log(`✅ Created ${vectorResult.vectorCount} vectors`)

    return NextResponse.json({
      success: true,
      agentId,
      userId,
      knowledgeSource: {
        id: knowledgeSource.id,
        vectorCount: vectorResult.vectorCount,
        chunkCount: vectorResult.chunkCount,
        content: structuredKnowledge.substring(0, 200) + '...'
      }
    })
  } catch (error) {
    console.error(`❌ Error:`, error)
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    )
  }
}