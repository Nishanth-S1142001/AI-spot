import { NextResponse } from 'next/server'
import { VectorDB } from '../../../../../../lib/vector/vectordb'
import { DocumentProcessor } from '../../../../../../lib/vector/document-processor'
import {
  verifyAgentOwnership,
  addKnowledgeSource,
  deleteKnowledgeSource,
  updateKnowledgeSource,
  getKnowledgeSources
} from '../../../../../actions/agents'

/**
 * POST /api/agents/[id]/knowledge/upload
 */
export async function POST(req, { params }) {
  const { id: agentId } = await params

  try {
    const formData = await req.formData()
    const userId = formData.get('userId')
    const sourceType = formData.get('type')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // ✅ FIXED: verifyAgentOwnership returns data directly, not { data, error }
    try {
      const agent = await verifyAgentOwnership(agentId, userId)
      
      if (!agent) {
        return NextResponse.json(
          { error: 'Agent not found or unauthorized' },
          { status: 404 }
        )
      }
    } catch (error) {
      console.error('Agent verification error:', error)
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      )
    }

    let processedContent
    let sourceName
    let sourceMetadata = {}
    let dbSourceType

    if (sourceType === 'file') {
      const file = formData.get('file')

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      try {
        DocumentProcessor.validateFile(file, 10)
      } catch (validationError) {
        return NextResponse.json(
          { error: validationError.message },
          { status: 400 }
        )
      }

      sourceName = file.name
      const fileType = file.type

      if (fileType === 'application/pdf') {
        dbSourceType = 'pdf'
      } else if (fileType === 'text/plain' || fileType === 'text/markdown') {
        dbSourceType = 'text'
      } else {
        return NextResponse.json(
          { error: 'Unsupported file type' },
          { status: 400 }
        )
      }

      processedContent = await DocumentProcessor.processFile(file, fileType)

      sourceMetadata = {
        ...processedContent.metadata,
        fileName: file.name,
        fileSize: file.size,
        fileType
      }
    } else if (sourceType === 'url') {
      const url = formData.get('url')

      if (!url) {
        return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
      }

      try {
        new URL(url)
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        )
      }

      sourceName = url
      dbSourceType = 'url'
      processedContent = await DocumentProcessor.processWebsite(url)

      sourceMetadata = {
        ...processedContent.metadata,
        url
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid source type. Must be "file" or "url"' },
        { status: 400 }
      )
    }

    if (!processedContent.success || !processedContent.text) {
      return NextResponse.json(
        { error: 'Failed to extract content from source' },
        { status: 500 }
      )
    }

    const sourceData = {
      source_type: dbSourceType,
      source_url: dbSourceType === 'url' ? sourceName : null,
      file_name: dbSourceType !== 'url' ? sourceName : null,
      content: processedContent.text,
      summary: JSON.stringify(sourceMetadata),
      status: 'processing'
    }

    // ✅ addKnowledgeSource returns data directly
    const knowledgeSource = await addKnowledgeSource(agentId, sourceData)

    if (!knowledgeSource) {
      return NextResponse.json(
        { error: 'Failed to create knowledge source record' },
        { status: 500 }
      )
    }

    // Process content and generate vectors
    try {
      const vectorResult = await VectorDB.processKnowledgeSource(
        agentId,
        knowledgeSource.id,
        processedContent.text,
        sourceMetadata
      )

      // Update status to completed
      await updateKnowledgeSource(knowledgeSource.id, {
        status: 'completed',
        vector_count: vectorResult.vectorCount,
        processed_at: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        knowledgeSource: {
          id: knowledgeSource.id,
          name: sourceName,
          type: dbSourceType,
          vectorCount: vectorResult.vectorCount,
          chunkCount: vectorResult.chunkCount,
          status: 'completed'
        }
      })
    } catch (vectorError) {
      console.error('Error processing vectors:', vectorError)

      await updateKnowledgeSource(knowledgeSource.id, {
        status: 'failed',
        error_message: vectorError.message
      })

      return NextResponse.json(
        {
          error: 'Failed to process knowledge vectors',
          details: vectorError.message
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in knowledge upload:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/agents/[id]/knowledge/upload
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

    // ✅ FIXED
    const agent = await verifyAgentOwnership(agentId, userId)

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      )
    }

    const sources = await getKnowledgeSources(agentId)

    const formattedSources = (sources || []).map((source) => ({
      id: source.id,
      name: source.file_name || source.source_url || 'Unknown Source',
      type: source.source_type,
      vectorCount: source.vector_count || 0,
      status: source.status,
      createdAt: source.created_at,
      processedAt: source.processed_at
    }))

    const stats = await VectorDB.getKnowledgeStats(agentId)

    return NextResponse.json({
      success: true,
      sources: formattedSources,
      statistics: stats
    })
  } catch (error) {
    console.error('Error fetching knowledge sources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge sources' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/agents/[id]/knowledge/upload
 */
export async function DELETE(req, { params }) {
  const { id: agentId } = await params
  const { searchParams } = new URL(req.url)
  const sourceId = searchParams.get('sourceId')
  const userId = searchParams.get('userId')

  try {
    if (!userId || !sourceId) {
      return NextResponse.json(
        { error: 'User ID and Source ID are required' },
        { status: 400 }
      )
    }

    // ✅ FIXED
    const agent = await verifyAgentOwnership(agentId, userId)

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      )
    }

    await VectorDB.deleteKnowledgeSource(sourceId)
    await deleteKnowledgeSource(sourceId, agentId)

    return NextResponse.json({
      success: true,
      message: 'Knowledge source deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting knowledge source:', error)
    return NextResponse.json(
      { error: 'Failed to delete knowledge source' },
      { status: 500 }
    )
  }
}