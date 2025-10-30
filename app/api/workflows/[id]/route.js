import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getWorkflow,
  getWorkflowNodes,
  getWorkflowEdges,
  updateWorkflow,
  deleteWorkflow
} from '../../../actions/agents'

// GET /api/workflows/[id] - Fetch workflow with nodes and edges
export async function GET(request, { params }) {
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

    // ✅ PARALLEL FETCHING - Much faster than sequential!
    const [workflow, nodes, edges] = await Promise.all([
      getWorkflow(id, user.id),
      getWorkflowNodes(id),
      getWorkflowEdges(id)
    ])

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({
      workflow,
      nodes,
      edges
    })

    // Cache for 60 seconds with background revalidation
    response.headers.set(
      'Cache-Control',
      'private, s-maxage=60, stale-while-revalidate=30'
    )

    return response
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    )
  }
}

// PATCH /api/workflows/[id] - Update workflow
export async function PATCH(request, { params }) {
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

    // Validate update data
    const allowedFields = [
      'name',
      'description',
      'trigger_type',
      'trigger_config',
      'workflow_data',
      'settings',
      'is_active',
      'status'
    ]

    const updateData = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Add timestamp
    updateData.updated_at = new Date().toISOString()

    const updatedWorkflow = await updateWorkflow(id, updateData)

    const response = NextResponse.json({ workflow: updatedWorkflow })

    // Invalidate cache
    response.headers.set('Cache-Control', 'no-cache')

    return response
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    )
  }
}

// DELETE /api/workflows/[id] - Delete workflow
export async function DELETE(request, { params }) {
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

    // Verify ownership
    const workflow = await getWorkflow(id, user.id)

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    await deleteWorkflow(id)

    const response = NextResponse.json({ 
      success: true,
      message: 'Workflow deleted successfully'
    })

    // Invalidate cache
    response.headers.set('Cache-Control', 'no-cache')

    return response
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    )
  }
}