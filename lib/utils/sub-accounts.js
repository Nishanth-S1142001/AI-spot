// ============================================================================
// SUB-ACCOUNTS UTILITIES
// Path: lib/utils/sub-accounts.js
// ============================================================================

import { customAlphabet } from 'nanoid'

/**
 * Generate secure access token for test accounts
 * Format: test_xxxxxxxxxxxxxxxxxxxx (24 chars total)
 */
export function generateAccessToken() {
  const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    20
  )
  return `test_${nanoid()}`
}

/**
 * Generate invitation token
 * Format: inv_xxxxxxxxxxxxxxxxxxxx (23 chars total)
 */
export function generateInvitationToken() {
  const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    20
  )
  return `inv_${nanoid()}`
}

/**
 * Generate test link for customer
 */
export function generateTestLink(accessToken) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/test/${accessToken}`
}

/**
 * Calculate expiration date
 * @param {number} days - Number of days until expiration
 */
export function calculateExpirationDate(days = 30) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

/**
 * Parse device info from user agent
 */
export function parseDeviceInfo(userAgent) {
  if (!userAgent) {
    return {
      device_type: 'unknown',
      browser: 'unknown'
    }
  }

  const ua = userAgent.toLowerCase()
  
  // Detect device type
  let device_type = 'desktop'
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    device_type = /ipad/i.test(ua) ? 'tablet' : 'mobile'
  } else if (/tablet/i.test(ua)) {
    device_type = 'tablet'
  }

  // Detect browser
  let browser = 'unknown'
  if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'

  return { device_type, browser }
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate invitation email HTML
 */
export function generateInvitationEmailHTML(data) {
  const { name, agentName, testLink, expiresInDays, inviterName } = data

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Invitation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 30px;
      line-height: 1.8;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(249, 115, 22, 0.4);
    }
    .info-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #92400e;
    }
    .alternative-link {
      margin-top: 30px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
    .alternative-link a {
      color: #f97316;
      word-break: break-all;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 You're Invited to Test ${agentName}</h1>
      <p>Experience our AI agent in action</p>
    </div>
    
    <div class="content">
      <p class="greeting">Hi ${name},</p>
      
      <p class="message">
        ${inviterName || 'Someone'} has invited you to test <strong>${agentName}</strong>, 
        an AI-powered assistant. Your feedback will help us improve the experience 
        and ensure it meets your needs.
      </p>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${testLink}" class="cta-button">
          Start Testing Now
        </a>
      </div>

      <div class="info-box">
        <p>
          <strong>⏰ This invitation expires in ${expiresInDays} days</strong><br>
          Make sure to start your testing session before the invitation expires.
        </p>
      </div>

      <div class="message">
        <strong>What to expect:</strong>
        <ul style="padding-left: 20px; margin-top: 10px;">
          <li>Interactive chat interface to test the AI agent</li>
          <li>Real-time responses based on your queries</li>
          <li>Opportunity to provide valuable feedback</li>
          <li>No account creation required</li>
        </ul>
      </div>

      <div class="alternative-link">
        <p><strong>Can't click the button?</strong></p>
        <p>Copy and paste this link into your browser:</p>
        <p><a href="${testLink}">${testLink}</a></p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Need help?</strong></p>
      <p>If you have any questions or issues, please contact us.</p>
      <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
        This is an automated invitation email.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Generate invitation email plain text
 */
export function generateInvitationEmailText(data) {
  const { name, agentName, testLink, expiresInDays, inviterName } = data

  return `
You're Invited to Test ${agentName}

Hi ${name},

${inviterName || 'Someone'} has invited you to test ${agentName}, an AI-powered assistant. Your feedback will help us improve the experience and ensure it meets your needs.

Start Testing Now:
${testLink}

⏰ This invitation expires in ${expiresInDays} days

What to expect:
- Interactive chat interface to test the AI agent
- Real-time responses based on your queries
- Opportunity to provide valuable feedback
- No account creation required

Need help? If you have any questions or issues, please contact us.

---
This is an automated invitation email.
  `
}

/**
 * Send invitation email via your email service
 * Supports SendGrid, Resend, or custom SMTP
 */
export async function sendInvitationEmail(emailData) {
  const { to, name, agentName, testLink, expiresInDays, inviterName } = emailData

  const subject = `You're invited to test ${agentName}`
  const html = generateInvitationEmailHTML({
    name,
    agentName,
    testLink,
    expiresInDays,
    inviterName
  })
  const text = generateInvitationEmailText({
    name,
    agentName,
    testLink,
    expiresInDays,
    inviterName
  })

  try {
    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      return await sendViaSendGrid({ to, subject, html, text })
    }

    // Try Resend
    if (process.env.RESEND_API_KEY) {
      return await sendViaResend({ to, subject, html, text })
    }

    // Fallback to console in development
    console.log('📧 Email would be sent to:', to)
    console.log('Subject:', subject)
    console.log('Test Link:', testLink)
    
    return { 
      success: true, 
      provider: 'console',
      messageId: 'dev-' + Date.now()
    }
  } catch (error) {
    console.error('Error sending invitation email:', error)
    throw error
  }
}

/**
 * Send via SendGrid
 */
async function sendViaSendGrid(emailData) {
  const { to, subject, html, text } = emailData
  
  try {
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
      subject,
      text,
      html
    }
    
    const response = await sgMail.send(msg)
    
    return {
      success: true,
      provider: 'sendgrid',
      messageId: response[0].headers['x-message-id']
    }
  } catch (error) {
    console.error('SendGrid error:', error)
    throw error
  }
}

/**
 * Send via Resend
 */
async function sendViaResend(emailData) {
  const { to, subject, html } = emailData
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
        to: [to],
        subject,
        html
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Resend API error')
    }

    const data = await response.json()
    
    return {
      success: true,
      provider: 'resend',
      messageId: data.id
    }
  } catch (error) {
    console.error('Resend error:', error)
    throw error
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
  if (!date) return 'Never'

  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  
  return past.toLocaleDateString()
}

/**
 * Validate test account permissions
 */
export function validateTestAccountPermissions(account, action) {
  if (!account || !account.is_active) {
    return { allowed: false, reason: 'Account is not active' }
  }

  if (account.status === 'expired') {
    return { allowed: false, reason: 'Account has expired' }
  }

  if (account.status === 'suspended') {
    return { allowed: false, reason: 'Account is suspended' }
  }

  if (account.expires_at && new Date(account.expires_at) < new Date()) {
    return { allowed: false, reason: 'Account has expired' }
  }

  const permissions = account.permissions || {}

  switch (action) {
    case 'view_history':
      if (!permissions.can_view_history) {
        return { allowed: false, reason: 'No permission to view history' }
      }
      break
    case 'export_data':
      if (!permissions.can_export_data) {
        return { allowed: false, reason: 'No permission to export data' }
      }
      break
    default:
      break
  }

  return { allowed: true }
}