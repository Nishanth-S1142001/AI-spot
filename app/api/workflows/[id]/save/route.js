import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getWorkflow,
  updateWorkflow,
  bulkUpsertWorkflowNodes,
  bulkUpsertWorkflowEdges
} from '../../../../actions/agents'

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

    const workflow = await getWorkflow(id, user.id)

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const { nodes, edges, workflow_data, is_active, agent_id } = body
    // Find the first AI agent node in the workflow

    // Update workflow data
    await updateWorkflow(id, {
      workflow_data: workflow_data || {},
      ...(typeof is_active !== 'undefined' && { is_active }),
      agent_id
    }) // <-- add this

    // Bulk upsert nodes
    const formattedNodes = nodes.map((node) => ({
      workflow_id: id,
      node_id: node.id,
      node_type: node.type,
      node_name: node.data.label || node.type,
      position_x: Math.round(node.position.x),
      position_y: Math.round(node.position.y),
      config: node.data.config || {}
    }))

    await bulkUpsertWorkflowNodes(id, formattedNodes)

    // Bulk upsert edges
    const formattedEdges = edges.map((edge) => ({
      workflow_id: id,
      edge_id: edge.id,
      source_node_id: edge.source,
      target_node_id: edge.target,
      condition: edge.data?.condition || null
    }))

    await bulkUpsertWorkflowEdges(id, formattedEdges)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving workflow:', error)
    return NextResponse.json(
      { error: 'Failed to save workflow' },
      { status: 500 }
    )
  }
}
