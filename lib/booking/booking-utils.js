/**
 * Calendar Booking Utilities - FIXED VERSION
 * Key fixes:
 * 1. Added isConfirmationIntent() method
 * 2. Updated isBookingIntent() to recognize confirmations
 * 3. Added confirmation keywords to patterns
 */

import { parseISO, parse, format, addDays, isAfter, isBefore, setHours, setMinutes, isValid } from 'date-fns'
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz'

export class BookingParser {
  constructor() {
    this.extractedData = {
      date: null,
      time: null,
      timezone: null,
      name: null,
      email: null,
      phone: null,
      notes: null,
      confidence: 0
    }
  }

  /**
   * Main parsing method - extracts booking info from message
   */
  parseBookingRequest(message) {
    const normalized = message.toLowerCase().trim()
    
    return {
      date: this.extractDate(message, normalized),
      time: this.extractTime(message, normalized),
      timezone: this.extractTimezone(message, normalized),
      name: this.extractName(message, normalized),
      email: this.extractEmail(message, normalized),
      phone: this.extractPhone(message, normalized),
      notes: this.extractNotes(message, normalized),
      isComplete: this.checkCompleteness(),
      confidence: this.calculateConfidence(),
      metadata: {
        parsedAt: new Date().toISOString(),
        originalMessage: message
      }
    }
  }

  /**
   * NEW METHOD: Detect if message is a confirmation
   */
  static isConfirmationIntent(message) {
    const normalized = message.toLowerCase().trim()
    
    const confirmationPatterns = [
      // Direct confirmations
      /^(yes|yep|yeah|yup|sure|ok|okay|correct|right)$/i,
      /^(confirm|confirmed|confirm it|book it|proceed)$/i,
      
      // With context
      /\b(yes|confirm|book it|proceed|go ahead|looks good|that'?s (right|correct|good|fine))\b/i,
      /\b(confirm|confirmation|book|schedule).*\b(appointment|booking|meeting)\b/i,
      
      // With optional modifiers
      /^(no notes?|no additional|nothing else),?\s*(confirm|yes|proceed|book it)/i,
      /^(confirm|yes|proceed|book it).*\b(please|thanks?|thank you)\b/i,
    ]
    
    return confirmationPatterns.some(pattern => pattern.test(normalized))
  }

  /**
   * UPDATED: Detect if message is booking-related (now includes confirmations)
   */
  static isBookingIntent(message) {
    const bookingPatterns = [
      // Explicit booking keywords
      /\b(book|schedule|appointment|meeting|reserve|set up|arrange)\b/i,
      /\b(available|availability|free time|open slot)\b/i,
      /\b(calendar|date|time|when can)\b/i,
      
      // Date patterns - relative
      /\b(today|tomorrow|tonight)\b/i,
      /\b(next (week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i,
      /\b(on (monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i,
      /\b(this (monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i,
      
      // Time patterns - flexible
      /\b(\d{1,2}:\d{2}\s*(am|pm)?)\b/i, // 4:00 pm, 16:00
      /\b(\d{1,2}\s*(am|pm))\b/i, // 4 pm, 4pm
      /\b(morning|afternoon|evening|noon|midnight)\b/i,
      
      // Date patterns - absolute
      /\b(\d{1,2}\/\d{1,2}(\/\d{2,4})?)\b/i, // MM/DD/YYYY
      /\b(\d{4}-\d{1,2}-\d{1,2})\b/i, // YYYY-MM-DD
      
      // Contact information patterns (strong signal for booking)
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i, // Email
      /\b(name|email|phone|mobile|contact|number)[-:\s]/i, // Contact field labels
      
      // Timezone mentions
      /\b(timezone|tz|time zone|utc|gmt|est|pst|cst|mst|ist)\b/i,
      
      // NEW: Confirmation patterns (when in booking flow context)
      /\b(confirm|yes|proceed|book it|that'?s correct|looks good)\b/i,
    ]
    
    // Count how many patterns match
    const matchCount = bookingPatterns.filter(pattern => pattern.test(message)).length
    
    // If 2+ patterns match, it's likely booking-related
    // This helps catch messages like "tomorrow at 4 pm" or data dumps like "name-x, email-y"
    return matchCount >= 2 || bookingPatterns.slice(0, 3).some(pattern => pattern.test(message))
  }

  /**
   * Extract date from message
   */
  extractDate(original, normalized) {
    // Relative dates
    const relativePatterns = {
      'today': 0,
      'tomorrow': 1,
      'next monday': this.getNextWeekday(1),
      'next tuesday': this.getNextWeekday(2),
      'next wednesday': this.getNextWeekday(3),
      'next thursday': this.getNextWeekday(4),
      'next friday': this.getNextWeekday(5),
      'next saturday': this.getNextWeekday(6),
      'next sunday': this.getNextWeekday(0),
      'monday': this.getNextWeekday(1),
      'tuesday': this.getNextWeekday(2),
      'wednesday': this.getNextWeekday(3),
      'thursday': this.getNextWeekday(4),
      'friday': this.getNextWeekday(5),
      'saturday': this.getNextWeekday(6),
      'sunday': this.getNextWeekday(0),
    }

    for (const [keyword, daysToAdd] of Object.entries(relativePatterns)) {
      if (normalized.includes(keyword)) {
        const date = addDays(new Date(), daysToAdd)
        this.extractedData.date = format(date, 'yyyy-MM-dd')
        return this.extractedData.date
      }
    }

    // Absolute dates - various formats
    const dateFormats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // MM/DD/YYYY
      /(\d{1,2})\/(\d{1,2})\/(\d{2})/,   // MM/DD/YY
      /(\d{1,2})-(\d{1,2})-(\d{4})/,     // MM-DD-YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/,     // YYYY-MM-DD
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})?/i, // DD Month YYYY
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(st|nd|rd|th)?,?\s+(\d{4})?/i // Month DD, YYYY
    ]

    for (const pattern of dateFormats) {
      const match = original.match(pattern)
      if (match) {
        try {
          let date
          if (pattern.source.includes('jan|feb')) {
            // Handle month name formats
            date = parse(match[0], 'MMMM d, yyyy', new Date())
            if (!isValid(date)) {
              date = parse(match[0], 'MMMM d', new Date())
            }
          } else {
            // Handle numeric formats
            date = parse(match[0], 'M/d/yyyy', new Date())
            if (!isValid(date)) {
              date = parse(match[0], 'yyyy-MM-dd', new Date())
            }
          }
          
          if (isValid(date)) {
            this.extractedData.date = format(date, 'yyyy-MM-dd')
            return this.extractedData.date
          }
        } catch (e) {
          continue
        }
      }
    }

    return null
  }

  /**
   * Extract time from message
   */
  extractTime(original, normalized) {
    // 24-hour format
    const time24Match = original.match(/(\d{1,2}):(\d{2})(?:\s*hours?)?/i)
    if (time24Match) {
      const hours = parseInt(time24Match[1])
      const minutes = parseInt(time24Match[2])
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        this.extractedData.time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        return this.extractedData.time
      }
    }

    // 12-hour format with AM/PM
    const time12Match = original.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i)
    if (time12Match) {
      let hours = parseInt(time12Match[1])
      const minutes = time12Match[2] ? parseInt(time12Match[2]) : 0
      const period = time12Match[3].toLowerCase()
      
      if (period === 'pm' && hours !== 12) hours += 12
      if (period === 'am' && hours === 12) hours = 0
      
      this.extractedData.time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      return this.extractedData.time
    }

    // Natural language times
    const naturalTimes = {
      'morning': '09:00',
      'afternoon': '14:00',
      'evening': '18:00',
      'noon': '12:00',
      'midnight': '00:00'
    }

    for (const [keyword, time] of Object.entries(naturalTimes)) {
      if (normalized.includes(keyword)) {
        this.extractedData.time = time
        return this.extractedData.time
      }
    }

    return null
  }

  /**
   * Extract timezone from message
   */
  extractTimezone(original, normalized) {
    const timezonePatterns = [
      /\b(EST|EDT|CST|CDT|MST|MDT|PST|PDT)\b/i,
      /\b(UTC|GMT)([+-]\d{1,2})?\b/i,
      /\btimezone:?\s*([A-Z]{3,4})\b/i,
      /\btimezone[-:\s]+(india|ist|asia)\b/i,  // Handle "timezone - india"
      /\b(eastern|central|mountain|pacific)\s+time\b/i,
      /\b(india|indian)\s*(standard)?\s*time\b/i,  // Indian Standard Time
    ]

    const timezoneMap = {
      'est': 'America/New_York',
      'edt': 'America/New_York',
      'cst': 'America/Chicago',
      'cdt': 'America/Chicago',
      'mst': 'America/Denver',
      'mdt': 'America/Denver',
      'pst': 'America/Los_Angeles',
      'pdt': 'America/Los_Angeles',
      'eastern': 'America/New_York',
      'central': 'America/Chicago',
      'mountain': 'America/Denver',
      'pacific': 'America/Los_Angeles',
      'utc': 'UTC',
      'gmt': 'UTC',
      'india': 'Asia/Kolkata',
      'indian': 'Asia/Kolkata',
      'ist': 'Asia/Kolkata',
      'asia': 'Asia/Kolkata',  // Default to India for generic "Asia"
    }

    for (const pattern of timezonePatterns) {
      const match = original.match(pattern)
      if (match) {
        const tz = match[1].toLowerCase()
        this.extractedData.timezone = timezoneMap[tz] || 'UTC'
        return this.extractedData.timezone
      }
    }

    return 'UTC' // Default
  }

  /**
   * Extract name from message
   */
  extractName(original, normalized) {
    const namePatterns = [
      // Traditional patterns
      /(?:my name is|i'?m|this is|name:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /(?:call me|it'?s)\s+([A-Z][a-z]+)/i,
      
      // Structured format: name-value or name:value
      /\bname[-:\s]+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/i,
    ]

    for (const pattern of namePatterns) {
      const match = original.match(pattern)
      if (match) {
        // Capitalize first letter of each word
        this.extractedData.name = match[1].trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
        return this.extractedData.name
      }
    }

    return null
  }

  /**
   * Extract email from message
   */
  extractEmail(original, normalized) {
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/
    const match = original.match(emailPattern)
    
    if (match) {
      this.extractedData.email = match[1].toLowerCase()
      return this.extractedData.email
    }

    return null
  }

  /**
   * Extract phone from message
   */
  extractPhone(original, normalized) {
    const phonePatterns = [
      // Traditional patterns with labels
      /(?:phone|mobile|cell|tel|contact|number)(?:\s*:?\s*|-)([+]?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/i,
      
      // Standalone phone numbers
      /\b([+]?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}\b/
    ]

    for (const pattern of phonePatterns) {
      const match = original.match(pattern)
      if (match) {
        // Clean up phone number - keep only digits and + sign
        let phone = match[0]
        // If there's a label, extract just the number part
        const numberMatch = phone.match(/([+]?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/)
        if (numberMatch) {
          phone = numberMatch[0]
        }
        this.extractedData.phone = phone.replace(/[^\d+]/g, '')
        return this.extractedData.phone
      }
    }

    return null
  }

  /**
   * Extract notes/additional information
   */
  extractNotes(original, normalized) {
    const notePatterns = [
      /(?:notes?|comments?|details?|reason|about|regarding):?\s*(.+)/i,
      /(?:i need|looking for|interested in)\s+(.+)/i
    ]

    for (const pattern of notePatterns) {
      const match = original.match(pattern)
      if (match) {
        this.extractedData.notes = match[1].trim()
        return this.extractedData.notes
      }
    }

    return null
  }

  /**
   * Check if all required information is collected
   */
  checkCompleteness() {
    const required = ['date', 'time', 'name', 'email']
    return required.every(field => this.extractedData[field] !== null)
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence() {
    let score = 0
    const weights = {
      date: 25,
      time: 25,
      name: 20,
      email: 20,
      phone: 5,
      timezone: 5
    }

    for (const [field, weight] of Object.entries(weights)) {
      if (this.extractedData[field]) {
        score += weight
      }
    }

    this.extractedData.confidence = score / 100
    return this.extractedData.confidence
  }

  /**
   * Get next occurrence of a weekday
   */
  getNextWeekday(targetDay) {
    const today = new Date()
    const currentDay = today.getDay()
    let daysToAdd = targetDay - currentDay
    
    if (daysToAdd <= 0) {
      daysToAdd += 7
    }
    
    return daysToAdd
  }
}

/**
 * Availability checker
 */
export class AvailabilityChecker {
  /**
   * Check if a time slot is available
   */
  static async isSlotAvailable(agentCalendar, requestedDate, requestedTime, duration) {
    const { availability_rules, timezone, buffer_time } = agentCalendar
    
    // Get day of week
    const date = parseISO(requestedDate)
    const dayOfWeek = format(date, 'EEEE').toLowerCase()
    
    // Check if day has availability rules
    if (!availability_rules[dayOfWeek] || availability_rules[dayOfWeek].length === 0) {
      return { available: false, reason: 'No availability on this day' }
    }

    // Parse requested time
    const [hours, minutes] = requestedTime.split(':').map(Number)
    const requestedDateTime = setMinutes(setHours(date, hours), minutes)
    
    // Check against availability rules
    for (const rule of availability_rules[dayOfWeek]) {
      const [startHours, startMinutes] = rule.start.split(':').map(Number)
      const [endHours, endMinutes] = rule.end.split(':').map(Number)
      
      const ruleStart = setMinutes(setHours(date, startHours), startMinutes)
      const ruleEnd = setMinutes(setHours(date, endHours), endMinutes)
      
      if (isAfter(requestedDateTime, ruleStart) && isBefore(requestedDateTime, ruleEnd)) {
        return { available: true }
      }
    }

    return { available: false, reason: 'Outside available hours' }
  }

  /**
   * Get available slots for a date range
   */
  static getAvailableSlots(agentCalendar, startDate, endDate) {
    // Implementation for getting available slots
    // This would check existing bookings and return free slots
    const slots = []
    
    // Logic to generate slots based on availability_rules
    // and filter out already booked slots
    
    return slots
  }
}

/**
 * Timezone converter utility
 */
export class TimezoneConverter {
  static convert(dateTime, fromTz, toTz) {
    try {
      // Convert from source timezone to UTC, then to target timezone
      const utcDate = fromZonedTime(dateTime, fromTz)
      return toZonedTime(utcDate, toTz)
    } catch (error) {
      console.error('Timezone conversion error:', error)
      return dateTime
    }
  }

  static formatInTimezone(dateTime, timezone) {
    try {
      return formatInTimeZone(dateTime, timezone, 'PPpp')
    } catch (error) {
      console.error('Format error:', error)
      return format(dateTime, 'PPpp')
    }
  }
}

export default BookingParser