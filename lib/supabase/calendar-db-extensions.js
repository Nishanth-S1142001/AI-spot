/**
 * Database Client Extensions for Calendar Booking
 * Add these methods to your existing dbClient in lib/supabase/dbClient.js
 */

// Add these methods to your existing dbClient object:

export const calendarDbExtensions = {
  // Calendar Configuration
  async getAgentCalendar(agentId) {
    const { data, error } = await supabase
      .from('agent_calendars')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .maybeSingle()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createOrUpdateCalendar(agentId, calendarData) {
    const { data: existing } = await supabase
      .from('agent_calendars')
      .select('id')
      .eq('agent_id', agentId)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('agent_calendars')
        .update({ ...calendarData, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('agent_calendars')
        .insert({ ...calendarData, agent_id: agentId })
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  // Bookings
  async getBookings(agentId, filters = {}) {
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('agent_id', agentId)
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.email) {
      query = query.eq('customer_email', filters.email)
    }

    if (filters.dateFrom) {
      query = query.gte('booking_date', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('booking_date', filters.dateTo)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getBookingById(bookingId) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()
    
    if (error) throw error
    return data
  },

  async createBooking(bookingData) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateBooking(bookingId, updates) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async cancelBooking(bookingId, reason, cancelledBy) {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledBy,
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getBookingsByTimeSlot(agentId, date, time) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('agent_id', agentId)
      .eq('booking_date', date)
      .eq('booking_time', time)
      .in('status', ['confirmed', 'pending'])
    
    if (error) throw error
    return data || []
  },

  // Booking Slots (for manual/internal scheduling)
  async getAvailableSlots(agentCalendarId, dateFrom, dateTo) {
    const { data, error } = await supabase
      .from('booking_slots')
      .select('*')
      .eq('agent_calendar_id', agentCalendarId)
      .eq('is_available', true)
      .gte('slot_date', dateFrom)
      .lte('slot_date', dateTo)
      .order('slot_date')
      .order('slot_time')
    
    if (error) throw error
    return data || []
  },

  async createBookingSlot(slotData) {
    const { data, error } = await supabase
      .from('booking_slots')
      .insert(slotData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateSlotAvailability(slotId, isAvailable) {
    const { data, error } = await supabase
      .from('booking_slots')
      .update({ 
        is_available: isAvailable,
        updated_at: new Date().toISOString()
      })
      .eq('id', slotId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Booking Conversations
  async linkBookingToConversation(bookingId, conversationId, extractedData, confidenceScore) {
    const { data, error } = await supabase
      .from('booking_conversations')
      .insert({
        booking_id: bookingId,
        conversation_id: conversationId,
        extracted_data: extractedData,
        confidence_score: confidenceScore
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getBookingConversations(bookingId) {
    const { data, error } = await supabase
      .from('booking_conversations')
      .select(`
        *,
        conversation:conversations(*),
        booking:bookings(*)
      `)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Analytics for bookings
  async getBookingAnalytics(agentId, dateFrom, dateTo) {
    let query = supabase
      .from('analytics')
      .select('*')
      .eq('agent_id', agentId)
      .eq('event_type', 'booking_interaction')
      .order('created_at', { ascending: false })

    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // Get upcoming bookings for notifications
  async getUpcomingBookings(hours = 24) {
    const now = new Date()
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000)
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        agent:agents(name, user_id),
        calendar:agent_calendars(send_reminders, reminder_hours_before)
      `)
      .eq('status', 'confirmed')
      .gte('booking_date', now.toISOString().split('T')[0])
      .lte('booking_date', futureTime.toISOString().split('T')[0])
      .is('reminder_sent_at', null)
    
    if (error) throw error
    return data || []
  },

  // Booking statistics
  async getBookingStats(agentId, dateFrom, dateTo) {
    const bookings = await this.getBookings(agentId, { dateFrom, dateTo })
    
    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      no_show: bookings.filter(b => b.status === 'no_show').length,
      rescheduled: bookings.filter(b => b.status === 'rescheduled').length,
    }
  }
}

// To use these in your existing dbClient, merge them:
// import { calendarDbExtensions } from './calendar-db-extensions'
// export const dbClient = {
//   ...existingMethods,
//   ...calendarDbExtensions
// }
