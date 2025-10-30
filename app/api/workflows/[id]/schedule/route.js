import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { parseExpression } from 'cron-parser'
import {
  getWorkflow,
  getWorkflowSchedule,
  createWorkflowSchedule,
  updateWorkflow
} from '../../../../actions/agents'

// GET /api/workflows/[id]/schedule - Get workflow schedule
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

    // Verify ownership
    const workflow = await getWorkflow(id, user.id)

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    const schedule = await getWorkflowSchedule(id)

    const response = NextResponse.json({
      schedule: schedule || null
    })

    // Cache schedule for 60 seconds
    response.headers.set(
      'Cache-Control',
      'private, s-maxage=60, stale-while-revalidate=30'
    )

    return response
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

// POST /api/workflows/[id]/schedule - Create or update workflow schedule
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

    // Validate required fields
    if (!body.cron_expression) {
      return NextResponse.json(
        { error: 'Cron expression is required' },
        { status: 400 }
      )
    }

    // Validate cron expression
    try {
      const timezone = body.timezone || 'UTC'
      const interval = parseExpression(body.cron_expression, {
        tz: timezone
      })
      const nextRun = interval.next().toDate()

      // Create or update schedule
      const schedule = await createWorkflowSchedule({
        workflow_id: id,
        cron_expression: body.cron_expression,
        timezone,
        next_run_at: nextRun.toISOString(),
        is_active: body.is_active !== false // Default to true
      })

      // Update workflow trigger type
      await updateWorkflow(id, {
        trigger_type: 'schedule',
        trigger_config: { schedule_id: schedule.id }
      })

      const response = NextResponse.json({
        schedule,
        nextRun: nextRun.toISOString()
      })

      // Invalidate cache
      response.headers.set('Cache-Control', 'no-cache')

      return response
    } catch (error) {
      console.error('Cron validation error:', error)
      return NextResponse.json(
        {
          error: 'Invalid cron expression',
          message: 'Please provide a valid cron expression. Example: "0 9 * * *" for daily at 9 AM'
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