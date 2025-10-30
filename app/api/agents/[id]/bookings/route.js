/**
 * Calendar Booking API Route
 * Handles booking creation, updates, cancellations
 * 
 * Path: /api/agents/[id]/bookings/route.js
 */

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { BookingParser, AvailabilityChecker } from '../../../../../lib/booking/booking-utils'
import { sendBookingConfirmation, sendBookingReminder } from '../../../../../lib/email/booking-emails'

export async function POST(request, context) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const params = await context.params
    const { id: agentId } = params
    const body = await request.json()
    
    const {
      date,
      time,
      timezone = 'UTC',
      customer_name,
      customer_email,
      customer_phone,
      customer_notes,
      session_id,
      duration_minutes,
      custom_fields = {}
    } = body

    // Validate required fields
    if (!date || !time || !customer_name || !customer_email) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      )
    }

    // Get agent calendar configuration
    const { data: agentCalendar, error: calendarError } = await supabase
      .from('agent_calendars')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .single()

    if (calendarError || !agentCalendar) {
      return NextResponse.json(
        { error: 'Calendar booking not available for this agent' },
        { status: 404 }
      )
    }

    // Check availability
    const availability = await AvailabilityChecker.isSlotAvailable(
      agentCalendar,
      date,
      time,
      duration_minutes || agentCalendar.booking_duration
    )

    if (!availability.available) {
      return NextResponse.json(
        { error: 'Time slot not available', reason: availability.reason },
        { status: 409 }
      )
    }

    // Check for existing bookings at this time
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('agent_id', agentId)
      .eq('booking_date', date)
      .eq('booking_time', time)
      .eq('status', 'confirmed')
      .maybeSingle()

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Time slot already booked' },
        { status: 409 }
      )
    }

    // Handle external integrations
    let externalBookingId = null
    let externalBookingUrl = null

    if (agentCalendar.integration_type === 'calendly' && agentCalendar.calendly_url) {
      // For Calendly, we'll return the URL for redirect
      externalBookingUrl = agentCalendar.calendly_url
    } else if (agentCalendar.integration_type === 'google_calendar') {
      // Google Calendar integration would go here
      // const gcalEvent = await createGoogleCalendarEvent(...)
      // externalBookingId = gcalEvent.id
    }

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        agent_id: agentId,
        agent_calendar_id: agentCalendar.id,
        session_id: session_id || 'direct',
        booking_date: date,
        booking_time: time,
        duration_minutes: duration_minutes || agentCalendar.booking_duration,
        timezone: timezone,
        customer_name,
        customer_email,
        customer_phone,
        customer_notes,
        custom_fields,
        status: externalBookingUrl ? 'pending' : 'confirmed',
        external_booking_id: externalBookingId,
        external_booking_url: externalBookingUrl
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Send confirmation email
    if (agentCalendar.send_confirmations && !externalBookingUrl) {
      try {
        await sendBookingConfirmation(booking, agentCalendar)
        
        await supabase
          .from('bookings')
          .update({ confirmation_sent_at: new Date().toISOString() })
          .eq('id', booking.id)
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Don't fail the booking if email fails
      }
    }

    // Log analytics
    await supabase.from('analytics').insert({
      agent_id: agentId,
      event_type: 'booking_interaction',
      event_data: {
        booking_id: booking.id,
        action: 'created',
        integration_type: agentCalendar.integration_type
      },
      success: true
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        date: booking.booking_date,
        time: booking.booking_time,
        timezone: booking.timezone,
        duration: booking.duration_minutes,
        status: booking.status,
        external_url: externalBookingUrl
      },
      message: externalBookingUrl 
        ? 'Please complete your booking using the provided link' 
        : 'Booking confirmed! You will receive a confirmation email shortly.'
    }, { status: 201 })

  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Retrieve bookings
export async function GET(request, context) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const params = await context.params
    const { id: agentId } = params
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const email = searchParams.get('email')
    const dateFrom = searchParams.get('from')
    const dateTo = searchParams.get('to')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    let query = supabase
      .from('bookings')
      .select('*')
      .eq('agent_id', agentId)
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true })
      .limit(limit)

    if (status) query = query.eq('status', status)
    if (email) query = query.eq('customer_email', email)
    if (dateFrom) query = query.gte('booking_date', dateFrom)
    if (dateTo) query = query.lte('booking_date', dateTo)

    const { data: bookings, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      bookings,
      count: bookings.length
    })

  } catch (error) {
    console.error('GET bookings error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// PATCH - Update booking (reschedule or cancel)
export async function PATCH(request, context) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const params = await context.params
    const { id: agentId } = params
    const body = await request.json()
    
    const {
      booking_id,
      action, // 'reschedule' or 'cancel'
      new_date,
      new_time,
      cancellation_reason
    } = body

    if (!booking_id || !action) {
      return NextResponse.json(
        { error: 'booking_id and action are required' },
        { status: 400 }
      )
    }

    // Get existing booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('agent_id', agentId)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    let updateData = {}

    if (action === 'cancel') {
      updateData = {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason
      }
    } else if (action === 'reschedule') {
      if (!new_date || !new_time) {
        return NextResponse.json(
          { error: 'new_date and new_time required for rescheduling' },
          { status: 400 }
        )
      }

      // Check new slot availability
      const { data: agentCalendar } = await supabase
        .from('agent_calendars')
        .select('*')
        .eq('id', booking.agent_calendar_id)
        .single()

      const availability = await AvailabilityChecker.isSlotAvailable(
        agentCalendar,
        new_date,
        new_time,
        booking.duration_minutes
      )

      if (!availability.available) {
        return NextResponse.json(
          { error: 'New time slot not available', reason: availability.reason },
          { status: 409 }
        )
      }

      updateData = {
        booking_date: new_date,
        booking_time: new_time,
        status: 'rescheduled'
      }
    }

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', booking_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      )
    }

    // Log analytics
    await supabase.from('analytics').insert({
      agent_id: agentId,
      event_type: 'booking_interaction',
      event_data: {
        booking_id: booking_id,
        action: action
      },
      success: true
    })

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: action === 'cancel' 
        ? 'Booking cancelled successfully' 
        : 'Booking rescheduled successfully'
    })

  } catch (error) {
    console.error('PATCH booking error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
