import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getWorkflow } from '../../../../actions/agents'
import { WorkflowEngine } from '../../../../../lib/workflow/engine'

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

    // Execute workflow
    const engine = new WorkflowEngine()
    if (!id) {
  return NextResponse.json({ error: 'Missing workflow ID' }, { status: 400 })
}
    const result = await engine.executeWorkflow(user.id, id, body.triggerData || {})

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error executing workflow:', error)
    return NextResponse.json(
      {
        error: 'Workflow execution failed',
        message: error.message
      },
      { status: 500 }
    )
  }
}
