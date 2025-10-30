import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getWorkflow,
  getWorkflowExecution,
  getWorkflowExecutionLogs
} from '../../../../../actions/agents'

// GET /api/workflows/[id]/executions/[executionId] - Fetch execution details and logs
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

    const { id, executionId } = await params

    // Verify workflow ownership
    const workflow = await getWorkflow(id, user.id)

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // ✅ PARALLEL FETCHING - Get execution and logs simultaneously
    const [execution, logs] = await Promise.all([
      getWorkflowExecution(executionId),
      getWorkflowExecutionLogs(executionId)
    ])

    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      )
    }

    // Verify execution belongs to this workflow
    if (execution.workflow_id !== id) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({
      execution,
      logs: logs || []
    })

    // Cache completed executions longer, running executions shorter
    const cacheTime = execution.status === 'completed' || execution.status === 'failed' 
      ? 300 // 5 minutes for completed
      : 5   // 5 seconds for running

    response.headers.set(
      'Cache-Control',
      `private, s-maxage=${cacheTime}, stale-while-revalidate=${Math.floor(cacheTime / 2)}`
    )

    return response
  } catch (error) {
    console.error('Error fetching execution details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch execution details' },
      { status: 500 }
    )
  }
}