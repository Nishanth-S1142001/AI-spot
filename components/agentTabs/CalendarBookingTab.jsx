'use client'

import { format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns'
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  RefreshCw,
  User,
  X
} from 'lucide-react'
import { memo, useCallback, useMemo, useState } from 'react'
import Button from '../ui/button'
import Card from '../ui/card'

// Import React Query hooks
import {
  useBookings,
  useBookingStats,
  useCalendarConfig,
  useUpdateBooking
} from '../../lib/hooks/useAgentData'

/**
 * FULLY OPTIMIZED Calendar Booking Tab Component
 *
 * React Query Integration:
 * - Automatic data fetching with caching
 * - Optimistic updates
 * - Auto-refresh every 5 minutes
 * - No manual state management for server data
 *
 * Performance:
 * - Memoized components
 * - Memoized filtering logic
 * - Memoized callbacks
 * - Optimized rendering
 */

// =====================================================
// MEMOIZED STAT CARD COMPONENT
// =====================================================
const StatCard = memo(({ value, label, colorClass }) => (
  <div className='text-center'>
    <div className={`text-3xl font-bold text-${colorClass}-400`}>{value}</div>
    <div className='text-sm text-neutral-400'>{label}</div>
  </div>
))
StatCard.displayName = 'StatCard'

// =====================================================
// MEMOIZED CALENDAR CONFIG CARD
// =====================================================
const CalendarConfigCard = memo(({ calendar }) => {
  if (!calendar) return null

  return (
    <Card className='border-orange-600/30'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-orange-400'>
          Calendar Configuration
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            calendar.is_active
              ? 'bg-green-900/40 text-green-300'
              : 'bg-red-900/40 text-red-300'
          }`}
        >
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
          <p className='font-medium text-neutral-200'>{calendar.timezone}</p>
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
            className='text-sm text-orange-400 underline hover:text-orange-300'
          >
            Calendly Booking Page
          </a>
        </div>
      )}
    </Card>
  )
})
CalendarConfigCard.displayName = 'CalendarConfigCard'

// =====================================================
// MEMOIZED DEBUG INFO CARD
// =====================================================
const DebugInfoCard = memo(({ allBookings, filter, filteredCount }) => {
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <Card className='border-neutral-700 bg-neutral-900'>
      <h4 className='mb-2 text-sm font-semibold text-orange-400'>
        Debug Information
      </h4>
      <div className='space-y-2 font-mono text-xs'>
        <div className='text-neutral-400'>
          Total bookings fetched:{' '}
          <span className='text-white'>{allBookings.length}</span>
        </div>
        <div className='text-neutral-400'>
          Current filter: <span className='text-white'>{filter}</span>
        </div>
        <div className='text-neutral-400'>
          Filtered results: <span className='text-white'>{filteredCount}</span>
        </div>
        <div className='text-neutral-400'>
          Today's date: <span className='text-white'>{today}</span>
        </div>
        <div className='mt-4'>
          <div className='mb-2 text-neutral-400'>Status breakdown:</div>
          <div className='space-y-1 pl-4'>
            <div>
              Confirmed:{' '}
              <span className='text-green-400'>
                {allBookings.filter((b) => b.status === 'confirmed').length}
              </span>
            </div>
            <div>
              Pending:{' '}
              <span className='text-yellow-400'>
                {allBookings.filter((b) => b.status === 'pending').length}
              </span>
            </div>
            <div>
              Cancelled:{' '}
              <span className='text-red-400'>
                {allBookings.filter((b) => b.status === 'cancelled').length}
              </span>
            </div>
            <div>
              Completed:{' '}
              <span className='text-blue-400'>
                {allBookings.filter((b) => b.status === 'completed').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
})
DebugInfoCard.displayName = 'DebugInfoCard'

// =====================================================
// MEMOIZED BOOKING CARD COMPONENT
// =====================================================
const BookingCard = memo(({ booking, onCancel, isUpdating, debugMode }) => {
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

  return (
    <Card className='transition hover:border-orange-600/50'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        {/* Booking Info */}
        <div className='flex-1 space-y-3'>
          <div className='flex items-center gap-3'>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(booking.status)}`}
            >
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
              <span className='font-medium'>Notes:</span>{' '}
              {booking.customer_notes}
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
            <div className='border-t border-neutral-700 pt-2 font-mono text-xs text-neutral-500'>
              Raw date: {booking.booking_date} | Status: {booking.status} |
              Created:{' '}
              {booking.created_at
                ? format(parseISO(booking.created_at), 'MMM dd, HH:mm')
                : 'N/A'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='flex gap-2'>
          {booking.status === 'confirmed' && (
            <Button
              onClick={() => onCancel(booking.id)}
              disabled={isUpdating}
              variant='destructive'
              className='text-sm'
            >
              {isUpdating ? (
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
              onClick={() => onCancel(booking.id)} // You may want to add a confirm action
            >
              <Check className='mr-1 h-4 w-4' />
              Confirm
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
})
BookingCard.displayName = 'BookingCard'

// =====================================================
// MEMOIZED EMPTY STATE COMPONENT
// =====================================================
const EmptyState = memo(({ filter, allBookingsCount, onViewAll }) => (
  <Card className='py-12 text-center'>
    <Calendar className='mx-auto mb-4 h-16 w-16 text-neutral-600' />
    <p className='text-neutral-400'>
      {filter === 'all' ? 'No bookings found' : `No ${filter} bookings found`}
    </p>
    <p className='mt-2 text-sm text-neutral-500'>
      {filter === 'all'
        ? 'Bookings will appear here once users schedule appointments'
        : allBookingsCount > 0
          ? 'Try changing the filter to see other bookings'
          : 'No bookings have been created yet'}
    </p>
    {filter !== 'all' && allBookingsCount > 0 && (
      <Button onClick={onViewAll} variant='outline' className='mt-4'>
        View All Bookings
      </Button>
    )}
  </Card>
))
EmptyState.displayName = 'EmptyState'

// =====================================================
// MEMOIZED FILTER TABS COMPONENT
// =====================================================
const FilterTabs = memo(({ activeFilter, onFilterChange, counts }) => {
  const filters = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'past', label: 'Past', count: counts.past },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled }
  ]

  return (
    <div className='flex gap-2 border-b border-neutral-700 pb-2'>
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`rounded-t px-4 py-2 text-sm font-medium transition ${
            activeFilter === filter.id
              ? 'bg-orange-700 text-white'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {filter.label}
          {activeFilter === filter.id && (
            <span className='ml-2 text-xs'>({filter.count})</span>
          )}
        </button>
      ))}
    </div>
  )
})
FilterTabs.displayName = 'FilterTabs'

// =====================================================
// MAIN COMPONENT (MEMOIZED)
// =====================================================
const CalendarBookingTab = memo(({ agent, id }) => {
  // React Query hooks - MUST be called before any conditional returns
  const { data: bookings = [], isLoading, error, refetch } = useBookings(id)

  const { data: calendar } = useCalendarConfig(id)

  const updateBooking = useUpdateBooking(id)

  // Get booking stats
  const stats = useBookingStats(bookings)

  // Local UI state
  const [filter, setFilter] = useState('all')
  const [debugMode, setDebugMode] = useState(false)

  // Memoized filtered bookings - only recompute when bookings or filter changes
  const filteredBookings = useMemo(() => {
    const today = startOfDay(new Date())

    if (filter === 'all') return bookings

    if (filter === 'upcoming') {
      return bookings.filter((b) => {
        try {
          const bookingDate = startOfDay(parseISO(b.booking_date))
          const isUpcoming =
            isAfter(bookingDate, today) ||
            format(bookingDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
          return isUpcoming && b.status === 'confirmed'
        } catch (error) {
          console.error('Error parsing booking date:', b.booking_date, error)
          return false
        }
      })
    }

    if (filter === 'past') {
      return bookings.filter((b) => {
        try {
          const bookingDate = startOfDay(parseISO(b.booking_date))
          return isBefore(bookingDate, today)
        } catch (error) {
          console.error('Error parsing booking date:', b.booking_date, error)
          return false
        }
      })
    }

    if (filter === 'cancelled') {
      return bookings.filter((b) => b.status === 'cancelled')
    }

    return bookings
  }, [bookings, filter])

  // Memoized filter counts
  const filterCounts = useMemo(() => {
    const today = startOfDay(new Date())

    const upcoming = bookings.filter((b) => {
      try {
        const bookingDate = startOfDay(parseISO(b.booking_date))
        const isUpcoming =
          isAfter(bookingDate, today) ||
          format(bookingDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        return isUpcoming && b.status === 'confirmed'
      } catch {
        return false
      }
    }).length

    const past = bookings.filter((b) => {
      try {
        const bookingDate = startOfDay(parseISO(b.booking_date))
        return isBefore(bookingDate, today)
      } catch {
        return false
      }
    }).length

    const cancelled = bookings.filter((b) => b.status === 'cancelled').length

    return {
      all: bookings.length,
      upcoming,
      past,
      cancelled
    }
  }, [bookings])

  // Memoized handlers
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter)
  }, [])

  const handleCancelBooking = useCallback(
    async (bookingId) => {
      if (!confirm('Are you sure you want to cancel this booking?')) return

      await updateBooking.mutateAsync({
        bookingId,
        action: 'cancel',
        reason: 'Cancelled by agent'
      })
    },
    [updateBooking]
  )

  const handleViewAll = useCallback(() => {
    setFilter('all')
  }, [])

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const toggleDebugMode = useCallback(() => {
    setDebugMode((prev) => !prev)
  }, [])

  // Loading state
  // if (isLoading) {
  //   return <LoadingState message='Loading bookings...' />
  // }

  // Error state
  if (error) {
    return (
      <Card className='py-12 text-center'>
        <AlertCircle className='mx-auto mb-4 h-16 w-16 text-red-400' />
        <p className='text-red-400'>Failed to load bookings</p>
        <p className='mt-2 text-sm text-neutral-500'>{error.message}</p>
        <Button onClick={handleRefresh} variant='outline' className='mt-4'>
          Try Again
        </Button>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Debug Toggle */}
      <div className='flex justify-end'>
        <button
          onClick={toggleDebugMode}
          className='flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300'
        >
          <AlertCircle className='h-3 w-3' />
          {debugMode ? 'Hide' : 'Show'} Debug Info
        </button>
      </div>

      {/* Debug Info */}
      {debugMode && (
        <DebugInfoCard
          allBookings={bookings}
          filter={filter}
          filteredCount={filteredBookings.length}
        />
      )}

      {/* Header with Stats */}
      <Card className='border-orange-600/30 bg-gradient-to-r from-orange-900/20 to-neutral-900/20'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
          <StatCard
            value={stats.confirmed}
            label='Confirmed'
            colorClass='orange'
          />
          <StatCard value={stats.pending} label='Pending' colorClass='yellow' />
          <StatCard
            value={stats.cancelled}
            label='Cancelled'
            colorClass='red'
          />
          <StatCard
            value={stats.completed}
            label='Completed'
            colorClass='blue'
          />
        </div>
      </Card>

      {/* Calendar Config */}
      <CalendarConfigCard calendar={calendar} />

      {/* Filter Tabs */}
      <FilterTabs
        activeFilter={filter}
        onFilterChange={handleFilterChange}
        counts={filterCounts}
      />

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          filter={filter}
          allBookingsCount={bookings.length}
          onViewAll={handleViewAll}
        />
      ) : (
        <div className='space-y-4'>
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
              isUpdating={updateBooking.isPending}
              debugMode={debugMode}
            />
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className='flex justify-center pt-4'>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant='outline'
          className='flex items-center gap-2'
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Bookings
        </Button>
      </div>
    </div>
  )
})
CalendarBookingTab.displayName = 'CalendarBookingTab'

export default CalendarBookingTab
