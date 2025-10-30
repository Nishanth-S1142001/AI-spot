'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Mail, Phone, User, Check, X, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react'
import Card from '../ui/card'
import Button from '../ui/button'
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns'
import toast from 'react-hot-toast'

/**
 * FIXED Calendar Booking Tab Component
 * - Better date filtering logic
 * - Enhanced debugging
 * - Fixed timezone handling
 * - Shows raw booking data for debugging
 */

export default function CalendarBookingTab({ agent, id }) {
  const [bookings, setBookings] = useState([])
  const [allBookings, setAllBookings] = useState([]) // Store unfiltered bookings
  const [calendar, setCalendar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, past, cancelled
  const [updating, setUpdating] = useState(null)
  const [debugMode, setDebugMode] = useState(false) // Toggle debug info

  useEffect(() => {
    fetchBookings()
    fetchCalendarConfig()
  }, [id])

  // Separate effect for filtering
  useEffect(() => {
    if (allBookings.length > 0) {
      applyFilter()
    }
  }, [filter, allBookings])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      // Fetch ALL bookings without status filter
      const response = await fetch(`/api/agents/${id}/bookings?limit=100`)
      const data = await response.json()
      
      console.log('📊 Raw API Response:', data)
      console.log('📊 Bookings count:', data.bookings?.length || 0)
      
      if (response.ok && data.bookings) {
        // Log each booking for debugging
        data.bookings.forEach((booking, index) => {
          console.log(`Booking ${index + 1}:`, {
            id: booking.id?.slice(0, 8),
            date: booking.booking_date,
            time: booking.booking_time,
            status: booking.status,
            customer: booking.customer_name
          })
        })
        
        setAllBookings(data.bookings)
        applyFilter(data.bookings)
      } else {
        console.error('❌ API Error:', data)
        toast.error('Failed to load bookings')
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error)
      toast.error('Error loading bookings')
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = (bookingsToFilter = allBookings) => {
    const today = startOfDay(new Date())
    let filtered = [...bookingsToFilter]
    
    console.log('🔍 Applying filter:', filter)
    console.log('📅 Today:', format(today, 'yyyy-MM-dd'))
    
    if (filter === 'upcoming') {
      filtered = bookingsToFilter.filter(b => {
        try {
          const bookingDate = startOfDay(parseISO(b.booking_date))
          const isUpcoming = isAfter(bookingDate, today) || format(bookingDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
          const isConfirmed = b.status === 'confirmed'
          
          if (debugMode) {
            console.log(`Booking ${b.id?.slice(0, 8)}:`, {
              date: b.booking_date,
              bookingDate: format(bookingDate, 'yyyy-MM-dd'),
              isUpcoming,
              isConfirmed,
              status: b.status,
              included: isUpcoming && isConfirmed
            })
          }
          
          return isUpcoming && isConfirmed
        } catch (error) {
          console.error('Error parsing booking date:', b.booking_date, error)
          return false
        }
      })
    } else if (filter === 'past') {
      filtered = bookingsToFilter.filter(b => {
        try {
          const bookingDate = startOfDay(parseISO(b.booking_date))
          return isBefore(bookingDate, today)
        } catch (error) {
          console.error('Error parsing booking date:', b.booking_date, error)
          return false
        }
      })
    } else if (filter === 'cancelled') {
      filtered = bookingsToFilter.filter(b => b.status === 'cancelled')
    }
    
    console.log('✅ Filtered bookings:', filtered.length)
    setBookings(filtered)
  }

  const fetchCalendarConfig = async () => {
    try {
      const response = await fetch(`/api/agents/${id}/calendar`)
      const data = await response.json()
      
      if (response.ok) {
        setCalendar(data.calendar)
      }
    } catch (error) {
      console.error('Error fetching calendar config:', error)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      setUpdating(bookingId)
      const response = await fetch(`/api/agents/${id}/bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          action: 'cancel',
          cancellation_reason: 'Cancelled by agent'
        })
      })

      if (response.ok) {
        toast.success('Booking cancelled successfully')
        fetchBookings()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Error cancelling booking')
    } finally {
      setUpdating(null)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: 'bg-green-900/40 text-green-300 border border-green-600',
      pending: 'bg-yellow-900/40 text-yellow-300 border border-yellow-600',
      cancelled: 'bg-red-900/40 text-red-300 border border-red-600',
      completed: 'bg-blue-900/40 text-blue-300 border border-blue-600',
      no_show: 'bg-orange-900/40 text-orange-300 border border-orange-600',
      rescheduled: 'bg-purple-900/40 text-purple-300 border border-purple-600'
    }
    
    return badges[status] || badges.pending
  }

  if (loading && bookings.length === 0) {
    return (
      <div className='flex items-center justify-center py-12'>
        <RefreshCw className='h-8 w-8 animate-spin text-orange-500' />
        <span className='ml-3 text-neutral-400'>Loading bookings...</span>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Debug Toggle */}
      <div className='flex justify-end'>
        <button
          onClick={() => setDebugMode(!debugMode)}
          className='text-xs text-neutral-500 hover:text-neutral-300 flex items-center gap-1'
        >
          <AlertCircle className='h-3 w-3' />
          {debugMode ? 'Hide' : 'Show'} Debug Info
        </button>
      </div>

      {/* Debug Info */}
      {debugMode && (
        <Card className='bg-neutral-900 border-neutral-700'>
          <h4 className='text-sm font-semibold text-orange-400 mb-2'>Debug Information</h4>
          <div className='space-y-2 text-xs font-mono'>
            <div className='text-neutral-400'>
              Total bookings fetched: <span className='text-white'>{allBookings.length}</span>
            </div>
            <div className='text-neutral-400'>
              Current filter: <span className='text-white'>{filter}</span>
            </div>
            <div className='text-neutral-400'>
              Filtered results: <span className='text-white'>{bookings.length}</span>
            </div>
            <div className='text-neutral-400'>
              Today's date: <span className='text-white'>{format(new Date(), 'yyyy-MM-dd')}</span>
            </div>
            <div className='mt-4'>
              <div className='text-neutral-400 mb-2'>Status breakdown:</div>
              <div className='pl-4 space-y-1'>
                <div>Confirmed: <span className='text-green-400'>{allBookings.filter(b => b.status === 'confirmed').length}</span></div>
                <div>Pending: <span className='text-yellow-400'>{allBookings.filter(b => b.status === 'pending').length}</span></div>
                <div>Cancelled: <span className='text-red-400'>{allBookings.filter(b => b.status === 'cancelled').length}</span></div>
                <div>Completed: <span className='text-blue-400'>{allBookings.filter(b => b.status === 'completed').length}</span></div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Header with Stats */}
      <Card className='bg-gradient-to-r from-orange-900/20 to-neutral-900/20 border-orange-600/30'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-orange-400'>
              {allBookings.filter(b => b.status === 'confirmed').length}
            </div>
            <div className='text-sm text-neutral-400'>Confirmed</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-yellow-400'>
              {allBookings.filter(b => b.status === 'pending').length}
            </div>
            <div className='text-sm text-neutral-400'>Pending</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-red-400'>
              {allBookings.filter(b => b.status === 'cancelled').length}
            </div>
            <div className='text-sm text-neutral-400'>Cancelled</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-blue-400'>
              {allBookings.filter(b => b.status === 'completed').length}
            </div>
            <div className='text-sm text-neutral-400'>Completed</div>
          </div>
        </div>
      </Card>

      {/* Calendar Config Info */}
      {calendar && (
        <Card className='border-orange-600/30'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-orange-400'>
              Calendar Configuration
            </h3>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              calendar.is_active 
                ? 'bg-green-900/40 text-green-300' 
                : 'bg-red-900/40 text-red-300'
            }`}>
              {calendar.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
            <div>
              <span className='text-neutral-400'>Integration:</span>
              <p className='font-medium text-neutral-200 capitalize'>
                {calendar.integration_type}
              </p>
            </div>
            <div>
              <span className='text-neutral-400'>Duration:</span>
              <p className='font-medium text-neutral-200'>
                {calendar.booking_duration} mins
              </p>
            </div>
            <div>
              <span className='text-neutral-400'>Timezone:</span>
              <p className='font-medium text-neutral-200'>
                {calendar.timezone}
              </p>
            </div>
            <div>
              <span className='text-neutral-400'>Advance Booking:</span>
              <p className='font-medium text-neutral-200'>
                {calendar.advance_booking_days} days
              </p>
            </div>
          </div>
          {calendar.calendly_url && (
            <div className='mt-4 flex items-center gap-2'>
              <ExternalLink className='h-4 w-4 text-orange-400' />
              <a 
                href={calendar.calendly_url} 
                target='_blank' 
                rel='noopener noreferrer'
                className='text-sm text-orange-400 hover:text-orange-300 underline'
              >
                Calendly Booking Page
              </a>
            </div>
          )}
        </Card>
      )}

      {/* Filter Tabs */}
      <div className='flex gap-2 border-b border-neutral-700 pb-2'>
        {['all', 'upcoming', 'past', 'cancelled'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition ${
              filter === filterType
                ? 'bg-orange-700 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            {filter === filterType && (
              <span className='ml-2 text-xs'>({bookings.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card className='text-center py-12'>
          <Calendar className='h-16 w-16 mx-auto text-neutral-600 mb-4' />
          <p className='text-neutral-400'>
            {filter === 'all' 
              ? 'No bookings found' 
              : `No ${filter} bookings found`}
          </p>
          <p className='text-sm text-neutral-500 mt-2'>
            {filter === 'all' 
              ? 'Bookings will appear here once users schedule appointments'
              : allBookings.length > 0 
                ? 'Try changing the filter to see other bookings'
                : 'No bookings have been created yet'}
          </p>
          {filter !== 'all' && allBookings.length > 0 && (
            <Button
              onClick={() => setFilter('all')}
              variant='outline'
              className='mt-4'
            >
              View All Bookings
            </Button>
          )}
        </Card>
      ) : (
        <div className='space-y-4'>
          {bookings.map((booking) => (
            <Card key={booking.id} className='hover:border-orange-600/50 transition'>
              <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                {/* Booking Info */}
                <div className='flex-1 space-y-3'>
                  <div className='flex items-center gap-3'>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className='text-sm text-neutral-500'>
                      #{booking.id.slice(0, 8)}
                    </span>
                    {booking.duration_minutes && (
                      <span className='text-xs text-neutral-500'>
                        {booking.duration_minutes} min
                      </span>
                    )}
                  </div>

                  <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    <div className='flex items-center gap-2 text-neutral-300'>
                      <Calendar className='h-4 w-4 text-orange-400' />
                      <span className='font-medium'>
                        {format(parseISO(booking.booking_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-neutral-300'>
                      <Clock className='h-4 w-4 text-orange-400' />
                      <span className='font-medium'>
                        {booking.booking_time} ({booking.timezone})
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-neutral-300'>
                      <User className='h-4 w-4 text-orange-400' />
                      <span>{booking.customer_name}</span>
                    </div>
                    <div className='flex items-center gap-2 text-neutral-300'>
                      <Mail className='h-4 w-4 text-orange-400' />
                      <span className='text-sm'>{booking.customer_email}</span>
                    </div>
                    {booking.customer_phone && (
                      <div className='flex items-center gap-2 text-neutral-300'>
                        <Phone className='h-4 w-4 text-orange-400' />
                        <span className='text-sm'>{booking.customer_phone}</span>
                      </div>
                    )}
                  </div>

                  {booking.customer_notes && (
                    <div className='text-sm text-neutral-400'>
                      <span className='font-medium'>Notes:</span> {booking.customer_notes}
                    </div>
                  )}

                  {booking.external_booking_url && (
                    <a
                      href={booking.external_booking_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300'
                    >
                      <ExternalLink className='h-3 w-3' />
                      View External Booking
                    </a>
                  )}

                  {debugMode && (
                    <div className='text-xs font-mono text-neutral-500 pt-2 border-t border-neutral-700'>
                      Raw date: {booking.booking_date} | Status: {booking.status} | Created: {booking.created_at ? format(parseISO(booking.created_at), 'MMM dd, HH:mm') : 'N/A'}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className='flex gap-2'>
                  {booking.status === 'confirmed' && (
                    <Button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={updating === booking.id}
                      variant='destructive'
                      className='text-sm'
                    >
                      {updating === booking.id ? (
                        <RefreshCw className='h-4 w-4 animate-spin' />
                      ) : (
                        <>
                          <X className='mr-1 h-4 w-4' />
                          Cancel
                        </>
                      )}
                    </Button>
                  )}
                  {booking.status === 'pending' && (
                    <Button
                      variant='primary'
                      className='text-sm'
                    >
                      <Check className='mr-1 h-4 w-4' />
                      Confirm
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className='flex justify-center pt-4'>
        <Button
          onClick={fetchBookings}
          disabled={loading}
          variant='outline'
          className='flex items-center gap-2'
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Bookings
        </Button>
      </div>
    </div>
  )
}