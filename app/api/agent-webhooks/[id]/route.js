// ============================================================================
// OPTIMIZED WEBHOOK API ROUTES
// File: /app/api/webhooks/[id]/route.js
// ============================================================================

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  updateWebhook,
  deleteWebhook,
  getAgent,
  getWebhookById
} from '../../../actions/agents'
import { createRateLimitMiddleware } from '../../../../lib/api/rate-limiter'

// ✅ Create rate limiter for this endpoint
const rateLimiter = createRateLimitMiddleware({
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  keyGenerator: (req) => {
    // Rate limit per user + IP
    const userId = req.headers.get('x-user-id') || 'anonymous'
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    return `webhook-update:${userId}:${ip}`
  }
})

// ✅ Optimized helper for auth verification
async function verifyAuth() {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, error: 'Unauthorized' }
  }
  
  return { user, error: null }
}

// ✅ Optimized helper for webhook ownership verification
async function verifyWebhookOwnership(webhookId, userId) {
  const webhook = await getWebhookById(webhookId)
  
  if (!webhook) {
    return { webhook: null, error: 'Webhook not found', status: 404 }
  }
  
  const agent = await getAgent(webhook.agent_id, userId)
  
  if (!agent) {
    return { webhook: null, error: 'Unauthorized', status: 403 }
  }
  
  return { webhook, error: null }
}

// ============================================================================
// PATCH - Update Webhook
// ============================================================================
export async function PATCH(request, { params }) {
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
    const { user, error: authError } = await verifyAuth()
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 })
    }

    // ✅ Get and validate webhook
    const { id } = await params
    const body = await request.json()
    
    const { webhook, error: ownershipError, status } = await verifyWebhookOwnership(id, user.id)
    if (ownershipError) {
      return NextResponse.json({ error: ownershipError }, { status })
    }

    // ✅ Validate request body
    const allowedFields = [
      'name',
      'description',
      'is_active',
      'rate_limit',
      'allowed_origins',
      'requires_auth'
    ]
    
    const updates = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // ✅ Update webhook
    const updatedWebhook = await updateWebhook(id, updates)

    return NextResponse.json(
      { webhook: updatedWebhook },
      { 
        status: 200,
        headers: rateLimitResult.headers
      }
    )
  } catch (error) {
    console.error('Error updating webhook:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update webhook',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Webhook
// ============================================================================
export async function DELETE(request, { params }) {
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
    const { user, error: authError } = await verifyAuth()
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 })
    }

    // ✅ Get and validate webhook
    const { id } = await params
    
    const { webhook, error: ownershipError, status } = await verifyWebhookOwnership(id, user.id)
    if (ownershipError) {
      return NextResponse.json({ error: ownershipError }, { status })
    }

    // ✅ Delete webhook
    await deleteWebhook(id)

    return NextResponse.json(
      { success: true, message: 'Webhook deleted successfully' },
      { 
        status: 200,
        headers: rateLimitResult.headers
      }
    )
  } catch (error) {
    console.error('Error deleting webhook:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete webhook',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET - Get Webhook Details (bonus endpoint)
// ============================================================================
export async function GET(request, { params }) {
  try {
    // ✅ Rate limiting (more lenient for reads)
    const readRateLimiter = createRateLimitMiddleware({
      maxRequests: 200,
      windowMs: 60000
    })
    
    const rateLimitResult = await readRateLimiter(request)
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
    const { user, error: authError } = await verifyAuth()
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 })
    }

    // ✅ Get and validate webhook
    const { id } = await params
    
    const { webhook, error: ownershipError, status } = await verifyWebhookOwnership(id, user.id)
    if (ownershipError) {
      return NextResponse.json({ error: ownershipError }, { status })
    }

    return NextResponse.json(
      { webhook },
      { 
        status: 200,
        headers: {
          ...rateLimitResult.headers,
          'Cache-Control': 'private, max-age=10' // Cache for 10 seconds
        }
      }
    )
  } catch (error) {
    console.error('Error fetching webhook:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch webhook',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}