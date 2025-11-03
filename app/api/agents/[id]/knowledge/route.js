import { NextResponse } from 'next/server'
import { getKnowledgeSources } from '../../../../actions/agents'

export async function GET(req, { params }) {
  try {
    const { id: agentId } = await params
    
    const sources = await getKnowledgeSources(agentId)
    
    return NextResponse.json({
      success: true,
      sources: sources || []
    })
  } catch (error) {
    console.error('Error fetching knowledge sources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge sources' },
      { status: 500 }
    )
  }
}