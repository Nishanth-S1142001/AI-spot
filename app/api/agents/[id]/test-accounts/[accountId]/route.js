// ============================================================================
// SINGLE TEST ACCOUNT API ROUTE
// Path: app/api/agents/[id]/test-accounts/[accountId]/route.js
// ============================================================================

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getTestAccount,
  updateTestAccount,
  deleteTestAccount,
  getTestAccountStats,
  getTestSessions
} from '../../../../../actions/agents'
import { generateTestLink } from '../../../../../../lib/utils/sub-accounts'
import { createRateLimitMiddleware } from '../../../../../../lib/api/rate-limiter'

// Rate limiter
const rateLimiter = createRateLimitMiddleware({
  maxRequests: 100,
  windowMs: 60000,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `test-account-ops:${userId}`
  }
})

// ============================================================================
// GET - Fetch single test account with details
// ============================================================================
export async function GET(req, { params }) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiter(req)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    // Auth verification
    const { accountId } = await params
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch test account
    const testAccount = await getTestAccount(accountId)
    
    if (!testAccount) {
      return NextResponse.json(
        { error: 'Test account not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (testAccount.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Fetch additional data
    const [stats, recentSessions] = await Promise.all([
      getTestAccountStats(accountId),
      getTestSessions(accountId, 10)
    ])

    // Enrich data
    const enrichedAccount = {
      ...testAccount,
      testLink: generateTestLink(testAccount.access_token),
      isExpired: testAccount.expires_at && new Date(testAccount.expires_at) < new Date(),
      daysUntilExpiry: testAccount.expires_at
        ? Math.ceil((new Date(testAccount.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
        : null,
      stats,
      recentSessions
    }

    return NextResponse.json(
      { testAccount: enrichedAccount },
      {
        status: 200,
        headers: {
          ...rateLimitResult.headers,
          'Cache-Control': 'private, max-age=5'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching test account:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch test account',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH - Update test account
// ============================================================================
export async function PATCH(request, { params }) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiter(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    // Auth verification
    const { accountId } = await params
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch test account
    const testAccount = await getTestAccount(accountId)
    
    if (!testAccount) {
      return NextResponse.json(
        { error: 'Test account not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (testAccount.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate updates
    const allowedUpdates = [
      'name',
      'status',
      'is_active',
      'expires_at',
      'max_sessions',
      'max_messages_per_session',
      'permissions',
      'notes',
      'metadata'
    ]

    const updates = {}
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      )
    }

    // Validation
    if (updates.max_sessions && (updates.max_sessions < 1 || updates.max_sessions > 1000)) {
      return NextResponse.json(
        { error: 'Max sessions must be between 1 and 1000' },
        { status: 400 }
      )
    }

    if (updates.status && !['invited', 'active', 'suspended', 'expired'].includes(updates.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Update test account
    const updatedAccount = await updateTestAccount(accountId, updates)

    return NextResponse.json(
      {
        testAccount: {
          ...updatedAccount,
          testLink: generateTestLink(updatedAccount.access_token)
        },
        message: 'Test account updated successfully'
      },
      {
        status: 200,
        headers: rateLimitResult.headers
      }
    )
  } catch (error) {
    console.error('Error updating test account:', error)
    return NextResponse.json(
      {
        error: 'Failed to update test account',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete test account
// ============================================================================
export async function DELETE(req, { params }) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiter(req)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    // Auth verification
    const { accountId } = await params
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch test account
    const testAccount = await getTestAccount(accountId)
    
    if (!testAccount) {
      return NextResponse.json(
        { error: 'Test account not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (testAccount.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete test account (will cascade to sessions, invitations, analytics)
    await deleteTestAccount(accountId)

    return NextResponse.json(
      {
        message: 'Test account deleted successfully',
        deletedAccountId: accountId
      },
      {
        status: 200,
        headers: rateLimitResult.headers
      }
    )
  } catch (error) {
    console.error('Error deleting test account:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete test account',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}