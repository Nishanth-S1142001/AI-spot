import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import { parseExpression } from 'cron-parser'
import {
  getWorkflow,
  getWorkflowSchedule,
  createWorkflowSchedule
} from '../../../../actions/agents'
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

    const { id } = await  params

    const workflow = await getWorkflow(id)

    if (!workflow || workflow.user_id !== user.id) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const schedule = await getWorkflowSchedule(id)

    return NextResponse.json({ schedule: schedule || null })
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const workflow = await getWorkflow(id)

    if (!workflow || workflow.user_id !== user.id) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Validate cron expression
    try {
      const interval = parseExpression(body.cron_expression, {
        tz: body.timezone || 'UTC'
      })
      const nextRun = interval.next().toDate()

      const schedule = await createWorkflowSchedule({
        workflow_id: id,
        cron_expression: body.cron_expression,
        timezone: body.timezone || 'UTC',
        next_run_at: nextRun.toISOString(),
        is_active: true
      })

      // Update workflow trigger type
      await updateWorkflow(id, {
        trigger_type: 'schedule',
        trigger_config: { schedule_id: schedule.id }
      })

      return NextResponse.json({ schedule })
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid cron expression'
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}
