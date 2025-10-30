// ============================================================================
// TEST ACCOUNTS API ROUTE
// Path: app/api/agents/[id]/test-accounts/route.js
// ============================================================================

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getAgent,
  getTestAccountsByAgent,
  createTestAccount,
  getAgentTestStats
} from '../../../../actions/agents'
import {
  generateAccessToken,
  generateInvitationToken,
  generateTestLink,
  calculateExpirationDate,
  validateEmail,
  sendInvitationEmail
} from '../../../../../lib/utils/sub-accounts'
import { createRateLimitMiddleware } from '../../../../../lib/api/rate-limiter'

// Rate limiters
const readRateLimiter = createRateLimitMiddleware({
  maxRequests: 100,
  windowMs: 60000,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `test-accounts-read:${userId}`
  }
})

const writeRateLimiter = createRateLimitMiddleware({
  maxRequests: 20,
  windowMs: 60000,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `test-accounts-write:${userId}`
  }
})

// ============================================================================
// GET - Fetch all test accounts for agent
// ============================================================================
export async function GET(req, { params }) {
  try {
    // Rate limiting
    const rateLimitResult = await readRateLimiter(req)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    // Auth verification
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify agent ownership
    const agent = await getAgent(id, user.id)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      )
    }

    // Fetch test accounts and stats
    const [testAccounts, stats] = await Promise.all([
      getTestAccountsByAgent(id, user.id),
      getAgentTestStats(id, user.id)
    ])

    // Enrich test accounts with computed fields
    const enrichedAccounts = testAccounts.map(account => ({
      ...account,
      testLink: generateTestLink(account.access_token),
      isExpired: account.expires_at && new Date(account.expires_at) < new Date(),
      daysUntilExpiry: account.expires_at 
        ? Math.ceil((new Date(account.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
        : null
    }))

    return NextResponse.json(
      {
        testAccounts: enrichedAccounts,
        stats,
        count: enrichedAccounts.length
      },
      {
        status: 200,
        headers: {
          ...rateLimitResult.headers,
          'Cache-Control': 'private, max-age=10'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching test accounts:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch test accounts',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create new test account and send invitation
// ============================================================================
export async function POST(request, { params }) {
  try {
    // Rate limiting
    const rateLimitResult = await writeRateLimiter(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    // Auth verification
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    
    // Validation
    const validationErrors = []
    
    if (!body.name || body.name.trim().length === 0) {
      validationErrors.push('Name is required')
    }
    
    if (!body.email || !validateEmail(body.email)) {
      validationErrors.push('Valid email is required')
    }
    
    if (body.maxSessions && (body.maxSessions < 1 || body.maxSessions > 1000)) {
      validationErrors.push('Max sessions must be between 1 and 1000')
    }
    
    if (body.expiresInDays && (body.expiresInDays < 1 || body.expiresInDays > 365)) {
      validationErrors.push('Expiration must be between 1 and 365 days')
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationErrors
        },
        { status: 400 }
      )
    }

    // Verify agent ownership
    const agent = await getAgent(id, user.id)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check for duplicate email for this agent
    const existingAccounts = await getTestAccountsByAgent(id, user.id)
    const duplicate = existingAccounts.find(
      acc => acc.email.toLowerCase() === body.email.toLowerCase()
    )
    
    if (duplicate) {
      return NextResponse.json(
        {
          error: 'Test account already exists',
          message: 'A test account with this email already exists for this agent',
          existingAccount: {
            id: duplicate.id,
            status: duplicate.status
          }
        },
        { status: 409 }
      )
    }

    // Generate tokens
    const accessToken = generateAccessToken()
    const invitationToken = generateInvitationToken()
    const testLink = generateTestLink(accessToken)
    const expiresInDays = body.expiresInDays || 30
    const expiresAt = calculateExpirationDate(expiresInDays)

    // Create test account
    const testAccountData = {
      agent_id: id,
      user_id: user.id,
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      access_token: accessToken,
      status: 'invited',
      is_active: true,
      expires_at: expiresAt,
      max_sessions: body.maxSessions || 100,
      max_messages_per_session: body.maxMessagesPerSession || 50,
      permissions: body.permissions || {
        can_view_history: false,
        can_export_data: false,
        can_reset_session: true
      },
      notes: body.notes || '',
      metadata: body.metadata || {}
    }

    const testAccount = await createTestAccount(testAccountData)

    // Create invitation record
    const { createTestInvitation } = await import('../../../../actions/agents')
    
    const invitationData = {
      test_account_id: testAccount.id,
      agent_id: id,
      email: testAccount.email,
      invitation_token: invitationToken,
      status: 'pending',
      email_subject: `You're invited to test ${agent.name}`,
      expires_at: expiresAt
    }

    const invitation = await createTestInvitation(invitationData)

    // Send invitation email
    let emailSent = false
    let emailError = null

    if (body.sendEmail !== false) {
      try {
        await sendInvitationEmail({
          to: testAccount.email,
          name: testAccount.name,
          agentName: agent.name,
          testLink,
          expiresInDays,
          inviterName: user.user_metadata?.full_name || 'Someone'
        })

        // Mark invitation as sent
        const { markInvitationSent } = await import('../../../../actions/agents')
        await markInvitationSent(invitation.id)

        emailSent = true
      } catch (error) {
        console.error('Error sending invitation email:', error)
        emailError = error.message

        // Update invitation with error
        const { updateTestInvitation } = await import('../../../../actions/agents')
        await updateTestInvitation(invitation.id, {
          status: 'failed',
          error_message: error.message
        })
      }
    }

    return NextResponse.json(
      {
        testAccount: {
          ...testAccount,
          testLink
        },
        invitation,
        emailSent,
        emailError,
        message: emailSent 
          ? 'Test account created and invitation sent successfully'
          : 'Test account created but invitation email failed to send'
      },
      {
        status: 201,
        headers: rateLimitResult.headers
      }
    )
  } catch (error) {
    console.error('Error creating test account:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to create test account',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}