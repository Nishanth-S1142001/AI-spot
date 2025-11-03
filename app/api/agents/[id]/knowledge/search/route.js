import { NextResponse } from 'next/server'
import { VectorDB } from '../../../../../../lib/vector/vectordb'
import { supabaseAdmin } from '../../../../../lib/supabase/dbServer'

/**
 * POST /api/agents/[id]/knowledge/search
 * Search knowledge base using vector similarity
 */
export async function POST(req, { params }) {
  const { id: agentId } = await params

  try {
    const body = await req.json()
    const { query, limit = 5, threshold = 0.7, userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    // Verify agent exists and user has access
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id, user_id')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // For public agents or owned agents
    if (agent.user_id !== userId) {
      // Check if agent is public or user has access
      const { data: agentSettings } = await supabaseAdmin
        .from('agents')
        .select('is_public')
        .eq('id', agentId)
        .single()

      if (!agentSettings?.is_public) {
        return NextResponse.json(
          { error: 'Unauthorized access to agent' },
          { status: 403 }
        )
      }
    }

    // Perform vector search
    const results = await VectorDB.searchKnowledge(
      agentId,
      query,
      Math.min(limit, 20), // Max 20 results
      threshold
    )

    // Format results
    const formattedResults = results.map(result => ({
      content: result.content,
      similarity: result.similarity,
      metadata: result.metadata,
      sourceId: result.knowledge_source_id
    }))

    return NextResponse.json({
      success: true,
      query,
      results: formattedResults,
      count: formattedResults.length
    })

  } catch (error) {
    console.error('Error searching knowledge base:', error)
    return NextResponse.json(
      { 
        error: 'Failed to search knowledge base',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/agents/[id]/knowledge/search/stats
 * Get search statistics and knowledge base info
 */
export async function GET(req, { params }) {
  const { id: agentId } = await params
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  try {
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify agent ownership
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('id', agentId)
      .eq('user_id', userId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      )
    }

    // Get knowledge statistics
    const stats = await VectorDB.getKnowledgeStats(agentId)

    return NextResponse.json({
      success: true,
      statistics: stats
    })

  } catch (error) {
    console.error('Error fetching knowledge stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge statistics' },
      { status: 500 }
    )
  }
}