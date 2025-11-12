'use client'

import { Calendar, Check, Clock, Globe, Mail, Save, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Button from './ui/button'
import Card from './ui/card'

/**
 * Calendar Settings Component
 * Configure booking settings for an agent
 * 
 * Usage: Add this to your AgentManagement tabs or as a separate settings page
 */

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
]

const INTEGRATION_TYPES = [
  { value: 'manual', label: 'Manual Booking', description: 'Handle bookings through chat interface' },
  { value: 'calendly', label: 'Calendly', description: 'Redirect users to your Calendly page' },
  { value: 'google_calendar', label: 'Google Calendar', description: 'Direct integration with Google Calendar' },
]

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function CalendarSettings({ agent, id }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState({
    is_active: false,
    booking_duration: 30,
    buffer_time: 0,
    advance_booking_days: 30,
    min_notice_hours: 2,
    timezone: 'UTC',
    integration_type: 'manual',
    calendly_url: '',
    send_confirmations: true,
    send_reminders: true,
    reminder_hours_before: 24,
    required_fields: ['name', 'email', 'phone'],
    availability_rules: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: []
    }
  })

  useEffect(() => {
    fetchCalendarConfig()
  }, [id])

  const fetchCalendarConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/agents/${id}/calendar`)
      const data = await response.json()
      
      if (response.ok && data.calendar) {
        setConfig(data.calendar)
      }
    } catch (error) {
      console.error('Error fetching calendar config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/agents/${id}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Calendar settings saved successfully!')
      } else {
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving calendar config:', error)
      toast.error('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const updateAvailability = (day, index, field, value) => {
    setConfig(prev => ({
      ...prev,
      availability_rules: {
        ...prev.availability_rules,
        [day]: prev.availability_rules[day].map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }))
  }

  const addTimeSlot = (day) => {
    setConfig(prev => ({
      ...prev,
      availability_rules: {
        ...prev.availability_rules,
        [day]: [...(prev.availability_rules[day] || []), { start: '09:00', end: '17:00' }]
      }
    }))
  }

  const removeTimeSlot = (day, index) => {
    setConfig(prev => ({
      ...prev,
      availability_rules: {
        ...prev.availability_rules,
        [day]: prev.availability_rules[day].filter((_, i) => i !== index)
      }
    }))
  }

  // if (loading) {
  //   return (
  //     <div className='flex items-center justify-center py-12'>
  //       <Clock className='h-8 w-8 animate-spin text-orange-500' />
  //       <span className='ml-3 text-neutral-400'>Loading settings...</span>
  //     </div>
  //   )
  // }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-neutral-100'>Calendar Settings</h2>
          <p className='text-sm text-neutral-400 mt-1'>
            Configure booking availability and preferences for {agent?.name}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          variant='primary'
          className='flex items-center gap-2'
        >
          {saving ? (
            <>
              <Clock className='h-4 w-4 animate-spin' />
              Saving...
            </>
          ) : (
            <>
              <Save className='h-4 w-4' />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Activation Toggle */}
      <Card className='border-orange-600/30'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-neutral-100 flex items-center gap-2'>
              <Calendar className='h-5 w-5 text-orange-400' />
              Calendar Booking
            </h3>
            <p className='text-sm text-neutral-400 mt-1'>
              Enable calendar booking functionality for this agent
            </p>
          </div>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={config.is_active}
              onChange={(e) => setConfig({ ...config, is_active: e.target.checked })}
              className='sr-only peer'
            />
            <div className='w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600'></div>
          </label>
        </div>
      </Card>

      {/* Integration Type */}
      <Card>
        <h3 className='text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2'>
          <Settings className='h-5 w-5 text-orange-400' />
          Integration Type
        </h3>
        <div className='space-y-3'>
          {INTEGRATION_TYPES.map((type) => (
            <label
              key={type.value}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                config.integration_type === type.value
                  ? 'border-orange-600 bg-orange-900/20'
                  : 'border-neutral-700 hover:border-neutral-600'
              }`}
            >
              <input
                type='radio'
                name='integration_type'
                value={type.value}
                checked={config.integration_type === type.value}
                onChange={(e) => setConfig({ ...config, integration_type: e.target.value })}
                className='mt-1'
              />
              <div className='flex-1'>
                <div className='font-medium text-neutral-200'>{type.label}</div>
                <div className='text-sm text-neutral-400'>{type.description}</div>
              </div>
              {config.integration_type === type.value && (
                <Check className='h-5 w-5 text-orange-400' />
              )}
            </label>
          ))}
        </div>

        {config.integration_type === 'calendly' && (
          <div className='mt-4'>
            <label className='block text-sm font-medium text-neutral-300 mb-2'>
              Calendly URL
            </label>
            <input
              type='url'
              value={config.calendly_url}
              onChange={(e) => setConfig({ ...config, calendly_url: e.target.value })}
              placeholder='https://calendly.com/your-link'
              className='w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-orange-600'
            />
          </div>
        )}
      </Card>

      {/* Booking Settings */}
      <Card>
        <h3 className='text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2'>
          <Clock className='h-5 w-5 text-orange-400' />
          Booking Settings
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-neutral-300 mb-2'>
              Default Duration (minutes)
            </label>
            <input
              type='number'
              value={config.booking_duration}
              onChange={(e) => setConfig({ ...config, booking_duration: parseInt(e.target.value) })}
              min='15'
              step='15'
              className='w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-neutral-300 mb-2'>
              Buffer Time (minutes)
            </label>
            <input
              type='number'
              value={config.buffer_time}
              onChange={(e) => setConfig({ ...config, buffer_time: parseInt(e.target.value) })}
              min='0'
              step='5'
              className='w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-neutral-300 mb-2'>
              Advance Booking (days)
            </label>
            <input
              type='number'
              value={config.advance_booking_days}
              onChange={(e) => setConfig({ ...config, advance_booking_days: parseInt(e.target.value) })}
              min='1'
              className='w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-neutral-300 mb-2'>
              Minimum Notice (hours)
            </label>
            <input
              type='number'
              value={config.min_notice_hours}
              onChange={(e) => setConfig({ ...config, min_notice_hours: parseInt(e.target.value) })}
              min='0'
              className='w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200'
            />
          </div>
        </div>
      </Card>

      {/* Timezone */}
      <Card>
        <h3 className='text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2'>
          <Globe className='h-5 w-5 text-orange-400' />
          Timezone
        </h3>
        <select
          value={config.timezone}
          onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
          className='w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200'
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </Card>

      {/* Availability Rules */}
      <Card>
        <h3 className='text-lg font-semibold text-neutral-100 mb-4'>
          Weekly Availability
        </h3>
        <div className='space-y-4'>
          {WEEKDAYS.map((day) => (
            <div key={day} className='border-b border-neutral-800 pb-4 last:border-0'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-neutral-200 font-medium capitalize'>{day}</span>
                <Button
                  onClick={() => addTimeSlot(day)}
                  variant='outline'
                  className='text-xs'
                >
                  + Add Slot
                </Button>
              </div>
              {config.availability_rules[day]?.length > 0 ? (
                <div className='space-y-2'>
                  {config.availability_rules[day].map((slot, index) => (
                    <div key={index} className='flex items-center gap-3'>
                      <input
                        type='time'
                        value={slot.start}
                        onChange={(e) => updateAvailability(day, index, 'start', e.target.value)}
                        className='px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200'
                      />
                      <span className='text-neutral-400'>to</span>
                      <input
                        type='time'
                        value={slot.end}
                        onChange={(e) => updateAvailability(day, index, 'end', e.target.value)}
                        className='px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200'
                      />
                      <button
                        onClick={() => removeTimeSlot(day, index)}
                        className='text-red-400 hover:text-red-300 text-sm'
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-neutral-500'>No availability set</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h3 className='text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2'>
          <Mail className='h-5 w-5 text-orange-400' />
          Notifications
        </h3>
        <div className='space-y-4'>
          <label className='flex items-center gap-3'>
            <input
              type='checkbox'
              checked={config.send_confirmations}
              onChange={(e) => setConfig({ ...config, send_confirmations: e.target.checked })}
              className='w-4 h-4'
            />
            <span className='text-neutral-200'>Send booking confirmations</span>
          </label>
          <label className='flex items-center gap-3'>
            <input
              type='checkbox'
              checked={config.send_reminders}
              onChange={(e) => setConfig({ ...config, send_reminders: e.target.checked })}
              className='w-4 h-4'
            />
            <span className='text-neutral-200'>Send appointment reminders</span>
          </label>
          {config.send_reminders && (
            <div className='ml-7'>
              <label className='block text-sm text-neutral-300 mb-2'>
                Reminder time before appointment (hours)
              </label>
              <input
                type='number'
                value={config.reminder_hours_before}
                onChange={(e) => setConfig({ ...config, reminder_hours_before: parseInt(e.target.value) })}
                min='1'
                className='w-48 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200'
              />
            </div>
          )}
        </div>
      </Card>

      {/* Save Button at Bottom */}
      <div className='flex justify-end pt-4'>
        <Button
          onClick={handleSave}
          disabled={saving}
          variant='primary'
          className='flex items-center gap-2 px-8'
        >
          {saving ? (
            <>
              <Clock className='h-4 w-4 animate-spin' />
              Saving...
            </>
          ) : (
            <>
              <Save className='h-4 w-4' />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
