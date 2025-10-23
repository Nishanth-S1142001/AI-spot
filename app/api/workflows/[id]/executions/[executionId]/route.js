import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import {
  getWorkflow,
  getWorkflowExecution,
  getWorkflowExecutionLogs
} from '../../../../../actions/agents'
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

    const workflow = await getWorkflow(id, user.id)

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const execution = await getWorkflowExecution(executionId)
    const logs = await getWorkflowExecutionLogs(executionId)

    return NextResponse.json({
      execution,
      logs
    })
  } catch (error) {
    console.error('Error fetching execution details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch execution details' },
      { status: 500 }
    )
  }
}
