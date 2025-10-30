/**
 * Booking Email Notifications
 * Handles sending confirmation and reminder emails
 * 
 * Path: lib/email/booking-emails.js
 */

import { format, parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

/**
 * Send booking confirmation email
 * You can integrate this with SendGrid, Resend, or your email service
 */
export async function sendBookingConfirmation(booking, agentCalendar) {
  try {
    const emailData = {
      to: booking.customer_email,
      from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
      subject: `Booking Confirmation - ${formatBookingDate(booking)}`,
      html: generateConfirmationHTML(booking, agentCalendar),
      text: generateConfirmationText(booking, agentCalendar)
    }

    // Example using SendGrid
    if (process.env.SENDGRID_API_KEY) {
      return await sendViaSendGrid(emailData)
    }

    // Example using Resend
    if (process.env.RESEND_API_KEY) {
      return await sendViaResend(emailData)
    }

    // Fallback to console log in development
    console.log('Email would be sent:', emailData)
    return { success: true, provider: 'console' }

  } catch (error) {
    console.error('Error sending confirmation email:', error)
    throw error
  }
}

/**
 * Send booking reminder email
 */
export async function sendBookingReminder(booking, agentCalendar) {
  try {
    const emailData = {
      to: booking.customer_email,
      from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
      subject: `Reminder: Upcoming Appointment - ${formatBookingDate(booking)}`,
      html: generateReminderHTML(booking, agentCalendar),
      text: generateReminderText(booking, agentCalendar)
    }

    if (process.env.SENDGRID_API_KEY) {
      return await sendViaSendGrid(emailData)
    }

    if (process.env.RESEND_API_KEY) {
      return await sendViaResend(emailData)
    }

    console.log('Reminder email would be sent:', emailData)
    return { success: true, provider: 'console' }

  } catch (error) {
    console.error('Error sending reminder email:', error)
    throw error
  }
}

/**
 * Send cancellation email
 */
export async function sendCancellationEmail(booking, agentCalendar, reason) {
  try {
    const emailData = {
      to: booking.customer_email,
      from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
      subject: `Booking Cancelled - ${formatBookingDate(booking)}`,
      html: generateCancellationHTML(booking, agentCalendar, reason),
      text: generateCancellationText(booking, agentCalendar, reason)
    }

    if (process.env.SENDGRID_API_KEY) {
      return await sendViaSendGrid(emailData)
    }

    if (process.env.RESEND_API_KEY) {
      return await sendViaResend(emailData)
    }

    console.log('Cancellation email would be sent:', emailData)
    return { success: true, provider: 'console' }

  } catch (error) {
    console.error('Error sending cancellation email:', error)
    throw error
  }
}

// ============================================================
// EMAIL CONTENT GENERATORS
// ============================================================

function generateConfirmationHTML(booking, agentCalendar) {
  const dateTime = formatBookingDateTime(booking)
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e5e5;
      border-top: none;
    }
    .booking-details {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #e5e5e5;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      width: 150px;
      color: #6b7280;
    }
    .detail-value {
      color: #111827;
    }
    .button {
      display: inline-block;
      background: #f97316;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      border-radius: 0 0 10px 10px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">✓ Booking Confirmed</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Your appointment has been scheduled</p>
  </div>
  
  <div class="content">
    <p>Hi ${booking.customer_name},</p>
    
    <p>Thank you for booking with us! Your appointment has been confirmed.</p>
    
    <div class="booking-details">
      <h3 style="margin-top: 0; color: #111827;">Booking Details</h3>
      <div class="detail-row">
        <span class="detail-label">📅 Date:</span>
        <span class="detail-value">${dateTime.date}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">🕐 Time:</span>
        <span class="detail-value">${dateTime.time}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">⏱️ Duration:</span>
        <span class="detail-value">${booking.duration_minutes} minutes</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">🌍 Timezone:</span>
        <span class="detail-value">${booking.timezone}</span>
      </div>
      ${booking.customer_notes ? `
      <div class="detail-row">
        <span class="detail-label">📝 Notes:</span>
        <span class="detail-value">${booking.customer_notes}</span>
      </div>
      ` : ''}
    </div>

    ${booking.external_booking_url ? `
    <p>
      <a href="${booking.external_booking_url}" class="button">
        View Booking Details
      </a>
    </p>
    ` : ''}

    <p>
      <strong>Need to make changes?</strong><br>
      Please contact us as soon as possible if you need to reschedule or cancel.
    </p>

    ${agentCalendar.send_reminders ? `
    <p style="font-size: 14px; color: #6b7280;">
      You will receive a reminder ${agentCalendar.reminder_hours_before} hours before your appointment.
    </p>
    ` : ''}
  </div>
  
  <div class="footer">
    <p>This is an automated confirmation email.</p>
    <p style="margin: 5px 0 0 0;">Booking ID: ${booking.id}</p>
  </div>
</body>
</html>
  `
}

function generateConfirmationText(booking, agentCalendar) {
  const dateTime = formatBookingDateTime(booking)
  
  return `
BOOKING CONFIRMED

Hi ${booking.customer_name},

Thank you for booking with us! Your appointment has been confirmed.

BOOKING DETAILS:
- Date: ${dateTime.date}
- Time: ${dateTime.time}
- Duration: ${booking.duration_minutes} minutes
- Timezone: ${booking.timezone}
${booking.customer_notes ? `- Notes: ${booking.customer_notes}\n` : ''}

${booking.external_booking_url ? `View booking details: ${booking.external_booking_url}\n\n` : ''}

Need to make changes? Please contact us as soon as possible if you need to reschedule or cancel.

${agentCalendar.send_reminders ? `You will receive a reminder ${agentCalendar.reminder_hours_before} hours before your appointment.\n` : ''}

Booking ID: ${booking.id}
  `
}

function generateReminderHTML(booking, agentCalendar) {
  const dateTime = formatBookingDateTime(booking)
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e5e5;
      border-top: none;
    }
    .reminder-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 20px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      border-radius: 0 0 10px 10px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">⏰ Appointment Reminder</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Your appointment is coming up!</p>
  </div>
  
  <div class="content">
    <p>Hi ${booking.customer_name},</p>
    
    <p>This is a friendly reminder about your upcoming appointment.</p>
    
    <div class="reminder-box">
      <h3 style="margin-top: 0; color: #1e40af;">📅 ${dateTime.date} at ${dateTime.time}</h3>
      <p style="margin: 5px 0;"><strong>Duration:</strong> ${booking.duration_minutes} minutes</p>
      <p style="margin: 5px 0;"><strong>Timezone:</strong> ${booking.timezone}</p>
    </div>

    <p>
      Please make sure you're available at the scheduled time. If you need to make any changes, 
      please contact us as soon as possible.
    </p>
  </div>
  
  <div class="footer">
    <p>Booking ID: ${booking.id}</p>
  </div>
</body>
</html>
  `
}

function generateReminderText(booking, agentCalendar) {
  const dateTime = formatBookingDateTime(booking)
  
  return `
APPOINTMENT REMINDER

Hi ${booking.customer_name},

This is a friendly reminder about your upcoming appointment.

APPOINTMENT DETAILS:
- Date: ${dateTime.date}
- Time: ${dateTime.time}
- Duration: ${booking.duration_minutes} minutes
- Timezone: ${booking.timezone}

Please make sure you're available at the scheduled time. If you need to make any changes, please contact us as soon as possible.

Booking ID: ${booking.id}
  `
}

function generateCancellationHTML(booking, agentCalendar, reason) {
  const dateTime = formatBookingDateTime(booking)
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e5e5;
      border-top: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">✕ Booking Cancelled</h1>
  </div>
  
  <div class="content">
    <p>Hi ${booking.customer_name},</p>
    
    <p>Your appointment scheduled for <strong>${dateTime.date} at ${dateTime.time}</strong> has been cancelled.</p>
    
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    
    <p>If you'd like to reschedule, please feel free to book a new appointment at your convenience.</p>
    
    <p>We apologize for any inconvenience.</p>
  </div>
</body>
</html>
  `
}

function generateCancellationText(booking, agentCalendar, reason) {
  const dateTime = formatBookingDateTime(booking)
  
  return `
BOOKING CANCELLED

Hi ${booking.customer_name},

Your appointment scheduled for ${dateTime.date} at ${dateTime.time} has been cancelled.

${reason ? `Reason: ${reason}\n\n` : ''}

If you'd like to reschedule, please feel free to book a new appointment at your convenience.

We apologize for any inconvenience.

Booking ID: ${booking.id}
  `
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatBookingDate(booking) {
  try {
    return format(parseISO(booking.booking_date), 'MMMM dd, yyyy')
  } catch {
    return booking.booking_date
  }
}

function formatBookingDateTime(booking) {
  try {
    const date = format(parseISO(booking.booking_date), 'EEEE, MMMM dd, yyyy')
    const time = booking.booking_time
    return { date, time }
  } catch {
    return { date: booking.booking_date, time: booking.booking_time }
  }
}

// ============================================================
// EMAIL SERVICE INTEGRATIONS
// ============================================================

async function sendViaSendGrid(emailData) {
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  try {
    await sgMail.send(emailData)
    return { success: true, provider: 'sendgrid' }
  } catch (error) {
    console.error('SendGrid error:', error)
    throw error
  }
}

async function sendViaResend(emailData) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })
    
    if (!response.ok) {
      throw new Error('Resend API error')
    }
    
    return { success: true, provider: 'resend' }
  } catch (error) {
    console.error('Resend error:', error)
    throw error
  }
}
