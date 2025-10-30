import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getWorkflow,
  updateWorkflow,
  bulkUpsertWorkflowNodes,
  bulkUpsertWorkflowEdges
} from '../../../../actions/agents'

// POST /api/workflows/[id]/save - Save workflow with nodes and edges
export async function POST(request, { params }) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify ownership
    const workflow = await getWorkflow(id, user.id)

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Validate request body
    if (!body.nodes || !Array.isArray(body.nodes)) {
      return NextResponse.json(
        { error: 'Invalid nodes data' },
        { status: 400 }
      )
    }

    if (!body.edges || !Array.isArray(body.edges)) {
      return NextResponse.json(
        { error: 'Invalid edges data' },
        { status: 400 }
      )
    }

    const { nodes, edges, workflow_data, is_active, agent_id } = body

    // Format nodes data
    const formattedNodes = nodes.map((node) => ({
      workflow_id: id,
      node_id: node.id,
      node_type: node.type,
      node_name: node.data?.label || node.type,
      position_x: Math.round(node.position?.x || 0),
      position_y: Math.round(node.position?.y || 0),
      config: node.data?.config || {}
    }))

    // Format edges data
    const formattedEdges = edges.map((edge) => ({
      workflow_id: id,
      edge_id: edge.id,
      source_node_id: edge.source,
      target_node_id: edge.target,
      condition: edge.data?.condition || null
    }))

    // Prepare workflow update data
    const workflowUpdateData = {
      workflow_data: workflow_data || {},
      updated_at: new Date().toISOString()
    }

    if (typeof is_active !== 'undefined') {
      workflowUpdateData.is_active = is_active
    }

    if (agent_id) {
      workflowUpdateData.agent_id = agent_id
    }

    // ✅ PARALLEL UPDATES - Much faster than sequential!
    await Promise.all([
      updateWorkflow(id, workflowUpdateData),
      bulkUpsertWorkflowNodes(id, formattedNodes),
      bulkUpsertWorkflowEdges(id, formattedEdges)
    ])

    const response = NextResponse.json({
      success: true,
      message: 'Workflow saved successfully',
      savedAt: new Date().toISOString()
    })

    // Invalidate cache
    response.headers.set('Cache-Control', 'no-cache')

    return response
  } catch (error) {
    console.error('Error saving workflow:', error)
    
    // Provide more specific error messages
    if (error.message?.includes('foreign key')) {
      return NextResponse.json(
        { error: 'Invalid node or edge reference' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save workflow' },
      { status: 500 }
    )
  }
}