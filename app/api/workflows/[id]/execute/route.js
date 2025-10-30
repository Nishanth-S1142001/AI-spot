import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getWorkflow } from '../../../../actions/agents'
import { WorkflowEngine } from '../../../../../lib/workflow/engine'

// POST /api/workflows/[id]/execute - Execute workflow
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

    if (!id) {
      return NextResponse.json(
        { error: 'Missing workflow ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Verify workflow ownership and active status
    const workflow = await getWorkflow(id, user.id)

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Check if workflow is active (optional - you can remove this if you want to allow manual execution)
    // if (!workflow.is_active) {
    //   return NextResponse.json(
    //     { error: 'Workflow is not active' },
    //     { status: 403 }
    //   )
    // }

    // Execute workflow
    // Note: For production, consider moving this to a queue system
    // to prevent blocking the API response
    const engine = new WorkflowEngine()
    const result = await engine.executeWorkflow(
      user.id,
      id,
      body.triggerData || {}
    )

    const response = NextResponse.json({
      success: true,
      executionId: result.executionId,
      status: result.status,
      message: 'Workflow executed successfully'
    })

    // Don't cache execution results
    response.headers.set('Cache-Control', 'no-store')

    return response
  } catch (error) {
    console.error('Error executing workflow:', error)
    
    // Provide specific error messages
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        {
          error: 'Workflow execution timeout',
          message: 'The workflow took too long to execute'
        },
        { status: 504 }
      )
    }

    return NextResponse.json(
      {
        error: 'Workflow execution failed',
        message: error.message
      },
      { status: 500 }
    )
  }
}

/*
 * PRODUCTION OPTIMIZATION:
 * For better performance in production, use a queue system:
 *
 * import { workflowQueue } from '@/lib/queue'
 * 
 * // Instead of executing directly:
 * const job = await workflowQueue.add('execute-workflow', {
 *   userId: user.id,
 *   workflowId: id,
 *   triggerData: body.triggerData || {}
 * }, {
 *   priority: 5,
 *   attempts: 3,
 *   backoff: {
 *     type: 'exponential',
 *     delay: 2000
 *   }
 * })
 *
 * return NextResponse.json({
 *   success: true,
 *   message: 'Workflow execution queued',
 *   jobId: job.id,
 *   status: 'queued'
 * })
 */