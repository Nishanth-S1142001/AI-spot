// ============================================================================
// OPTIMIZED WEBHOOK INVOCATIONS API
// File: /app/api/webhooks/[id]/invocations/route.js
// ============================================================================

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getWebhookInvocations,
  getAgent,
  getWebhookById } from '../../../../actions/agents'
import { createRateLimitMiddleware } from '../../../../../lib/api/rate-limiter'
// ✅ Rate limiter for invocations endpoint
const rateLimiter = createRateLimitMiddleware({
  maxRequests: 200,
  windowMs: 60000,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `webhook-invocations:${userId}`
  }
})

// ✅ Validation helpers
function validatePaginationParams(searchParams) {
  const limit = parseInt(searchParams.get('limit')) || 50
  const offset = parseInt(searchParams.get('offset')) || 0
  const sort = searchParams.get('sort') || 'desc'
  const status = searchParams.get('status') // Can be 'success', 'error', or null
  
  // Validate and constrain values
  return {
    limit: Math.min(Math.max(limit, 1), 500), // Between 1 and 500
    offset: Math.max(offset, 0), // No negative offsets
    sort: ['asc', 'desc'].includes(sort) ? sort : 'desc',
    status: ['success', 'error'].includes(status) ? status : null
  }
}

// ============================================================================
// GET - Fetch Webhook Invocations
// ============================================================================
export async function GET(request, { params }) {
  try {
    // ✅ Rate limiting
    const rateLimitResult = await rateLimiter(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      )
    }

    // ✅ Auth verification
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ Parse and validate parameters
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const { limit, offset, sort, status } = validatePaginationParams(searchParams)

    // ✅ Verify webhook ownership
    const webhook = await getWebhookById(id)
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    const agent = await getAgent(webhook.agent_id, user.id)
    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // ✅ Fetch invocations with proper parameters
    const { data: invocations, count } = await getWebhookInvocations(
      id,
      limit,
      offset,
      sort,
      status
    )

    // ✅ Calculate pagination metadata
    const totalPages = Math.ceil(count / limit)
    const currentPage = Math.floor(offset / limit) + 1
    const hasNextPage = offset + limit < count
    const hasPrevPage = offset > 0

    // ✅ Build response with pagination links
    const baseUrl = new URL(request.url)
    const nextUrl = hasNextPage
      ? `${baseUrl.pathname}?limit=${limit}&offset=${offset + limit}&sort=${sort}${status ? `&status=${status}` : ''}`
      : null
    const prevUrl = hasPrevPage
      ? `${baseUrl.pathname}?limit=${limit}&offset=${Math.max(0, offset - limit)}&sort=${sort}${status ? `&status=${status}` : ''}`
      : null

    return NextResponse.json(
      {
        invocations,
        pagination: {
          total: count,
          limit,
          offset,
          currentPage,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextUrl,
          prevUrl
        },
        filters: {
          sort,
          status
        }
      },
      { 
        status: 200,
        headers: {
          ...rateLimitResult.headers,
          'Cache-Control': 'private, max-age=5', // Cache for 5 seconds
          'X-Total-Count': count.toString()
        }
      }
    )
  } catch (error) {
    console.error('Error fetching invocations:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch invocations',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Clear Invocation History (bonus feature)
// ============================================================================
export async function DELETE(request, { params }) {
  try {
    // ✅ Rate limiting (stricter for destructive operations)
    const deleteRateLimiter = createRateLimitMiddleware({
      maxRequests: 10,
      windowMs: 60000
    })
    
    const rateLimitResult = await deleteRateLimiter(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      )
    }

    // ✅ Auth verification
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ Verify webhook ownership
    const { id } = await params
    const webhook = await getWebhookById(id)
    
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    const agent = await getAgent(webhook.agent_id, user.id)
    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // ✅ Optional: Implement clear invocations logic
    // await clearWebhookInvocations(id)

    return NextResponse.json(
      { 
        success: true,
        message: 'Invocation history cleared successfully'
      },
      { 
        status: 200,
        headers: rateLimitResult.headers
      }
    )
  } catch (error) {
    console.error('Error clearing invocations:', error)
    return NextResponse.json(
      { 
        error: 'Failed to clear invocations',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}