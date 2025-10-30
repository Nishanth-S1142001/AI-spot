/**
 * Calendar Configuration API Route
 * Handles calendar settings CRUD operations
 * 
 * Path: /api/agents/[id]/calendar/route.js
 */

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request, context) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const params = await context.params
    const { id: agentId } = params

    // Verify agent exists and user has access
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, user_id')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Get calendar configuration
    const { data: calendar, error: calendarError } = await supabase
      .from('agent_calendars')
      .select('*')
      .eq('agent_id', agentId)
      .maybeSingle()

    if (calendarError && calendarError.code !== 'PGRST116') {
      console.error('Error fetching calendar:', calendarError)
      return NextResponse.json(
        { error: 'Failed to fetch calendar configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      calendar: calendar || null,
      agent: {
        id: agent.id,
        name: agent.name
      }
    })

  } catch (error) {
    console.error('GET calendar error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request, context) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const params = await context.params
    const { id: agentId } = params
    const body = await request.json()

    // Verify agent exists and user has access
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, user_id')
      .eq('id', agentId)
      .eq('user_id', session.user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found or access denied' },
        { status: 404 }
      )
    }

    // Validate required fields
    const {
      is_active,
      booking_duration,
      buffer_time,
      advance_booking_days,
      min_notice_hours,
      timezone,
      availability_rules,
      integration_type,
      calendly_url,
      send_confirmations,
      send_reminders,
      reminder_hours_before,
      required_fields
    } = body

    // Check if calendar config already exists
    const { data: existingCalendar } = await supabase
      .from('agent_calendars')
      .select('id')
      .eq('agent_id', agentId)
      .maybeSingle()

    const calendarData = {
      agent_id: agentId,
      is_active: is_active ?? true,
      booking_duration: booking_duration || 30,
      buffer_time: buffer_time || 0,
      advance_booking_days: advance_booking_days || 30,
      min_notice_hours: min_notice_hours || 2,
      timezone: timezone || 'UTC',
      availability_rules: availability_rules || {},
      integration_type: integration_type || 'manual',
      calendly_url: calendly_url || null,
      send_confirmations: send_confirmations ?? true,
      send_reminders: send_reminders ?? true,
      reminder_hours_before: reminder_hours_before || 24,
      required_fields: required_fields || ['name', 'email', 'phone'],
      updated_at: new Date().toISOString()
    }

    let calendar

    if (existingCalendar) {
      // Update existing calendar
      const { data, error } = await supabase
        .from('agent_calendars')
        .update(calendarData)
        .eq('id', existingCalendar.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating calendar:', error)
        return NextResponse.json(
          { error: 'Failed to update calendar configuration' },
          { status: 500 }
        )
      }

      calendar = data
    } else {
      // Create new calendar
      const { data, error } = await supabase
        .from('agent_calendars')
        .insert(calendarData)
        .select()
        .single()

      if (error) {
        console.error('Error creating calendar:', error)
        return NextResponse.json(
          { error: 'Failed to create calendar configuration' },
          { status: 500 }
        )
      }

      calendar = data
    }

    // Log analytics
    await supabase.from('analytics').insert({
      agent_id: agentId,
      event_type: 'agent_created', // or custom event_type
      event_data: {
        action: existingCalendar ? 'calendar_updated' : 'calendar_created',
        integration_type: calendar.integration_type
      },
      success: true
    })

    return NextResponse.json({
      success: true,
      calendar,
      message: existingCalendar 
        ? 'Calendar configuration updated successfully' 
        : 'Calendar configuration created successfully'
    })

  } catch (error) {
    console.error('POST calendar error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, context) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const params = await context.params
    const { id: agentId } = params

    // Verify agent exists and user has access
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, user_id')
      .eq('id', agentId)
      .eq('user_id', session.user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found or access denied' },
        { status: 404 }
      )
    }

    // Delete calendar configuration
    const { error: deleteError } = await supabase
      .from('agent_calendars')
      .delete()
      .eq('agent_id', agentId)

    if (deleteError) {
      console.error('Error deleting calendar:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete calendar configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Calendar configuration deleted successfully'
    })

  } catch (error) {
    console.error('DELETE calendar error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
