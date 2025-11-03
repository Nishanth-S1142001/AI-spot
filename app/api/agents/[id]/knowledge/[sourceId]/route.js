import { NextResponse } from 'next/server'
import { deleteKnowledgeSource } from '../../../../../actions/agents'
import { VectorDB } from '../../../../../../lib/vector/vectordb'

export async function DELETE(req, { params }) {
  try {
    const { id: agentId, sourceId } = await params
    
    // Delete vectors
    await VectorDB.deleteKnowledgeSource(agentId, sourceId)
    
    // Delete from database
    await deleteKnowledgeSource(sourceId)
    
    return NextResponse.json({
      success: true,
      message: 'Knowledge source deleted'
    })
  } catch (error) {
    console.error('Error deleting knowledge source:', error)
    return NextResponse.json(
      { error: 'Failed to delete knowledge source' },
      { status: 500 }
    )
  }
}