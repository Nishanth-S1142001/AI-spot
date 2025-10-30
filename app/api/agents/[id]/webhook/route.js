// ============================================================================
// OPTIMIZED AGENT WEBHOOKS API
// File: /app/api/agents/[id]/webhooks/route.js
// ============================================================================

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getAgent,
  getWebhooksByAgentId,
  createWebhook
} from '../../../../actions/agents'
import { generateWebhookKey, generateAuthToken } from '../../../../../lib/nanoid'
import { createRateLimitMiddleware } from '../../../../../lib/api/rate-limiter'

// ✅ Rate limiters for different operations
const readRateLimiter = createRateLimitMiddleware({
  maxRequests: 200,
  windowMs: 60000,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `webhooks-read:${userId}`
  }
})

const writeRateLimiter = createRateLimitMiddleware({
  maxRequests: 50,
  windowMs: 60000,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `webhooks-write:${userId}`
  }
})

// ✅ Shared auth helper
async function verifyAgentOwnership(agentId, userId) {
  const agent = await getAgent(agentId, userId)
  
  if (!agent) {
    return { 
      agent: null, 
      error: 'Agent not found or unauthorized', 
      status: 404 
    }
  }
  
  return { agent, error: null }
}

// ============================================================================
// GET - Fetch All Webhooks for Agent
// ============================================================================
export async function GET(req, { params }) {
  try {
    // ✅ Rate limiting
    const rateLimitResult = await readRateLimiter(req)
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
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ Verify agent ownership
    const { agent, error: ownershipError, status } = await verifyAgentOwnership(id, user.id)
    if (ownershipError) {
      return NextResponse.json({ error: ownershipError }, { status })
    }

    // ✅ Fetch webhooks
    const webhooks = await getWebhooksByAgentId(id)

    // ✅ Add computed fields
    const enrichedWebhooks = webhooks.map(webhook => ({
      ...webhook,
      url: webhook.webhook_url,
      hasAuth: Boolean(webhook.requires_auth),
      createdDate: new Date(webhook.created_at).toISOString(),
      updatedDate: new Date(webhook.updated_at).toISOString()
    }))

    return NextResponse.json(
      { 
        webhooks: enrichedWebhooks,
        count: enrichedWebhooks.length,
        agentId: id,
        agentName: agent.name
      },
      { 
        status: 200,
        headers: {
          ...rateLimitResult.headers,
          'Cache-Control': 'private, max-age=10' // Cache for 10 seconds
        }
      }
    )
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch webhooks',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create New Webhook
// ============================================================================
export async function POST(request, { params }) {
  try {
    // ✅ Rate limiting
    const rateLimitResult = await writeRateLimiter(request)
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
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ Parse and validate request body
    const body = await request.json()
    
    // Validation
    const validationErrors = []
    
    if (!body.name || body.name.trim().length === 0) {
      validationErrors.push('Webhook name is required')
    }
    
    if (body.name && body.name.length > 100) {
      validationErrors.push('Webhook name must be less than 100 characters')
    }
    
    if (body.rate_limit && (body.rate_limit < 1 || body.rate_limit > 10000)) {
      validationErrors.push('Rate limit must be between 1 and 10000')
    }
    
    if (body.allowed_origins && !Array.isArray(body.allowed_origins)) {
      validationErrors.push('Allowed origins must be an array')
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

    // ✅ Verify agent ownership
    const { agent, error: ownershipError, status } = await verifyAgentOwnership(id, user.id)
    if (ownershipError) {
      return NextResponse.json({ error: ownershipError }, { status })
    }

    // ✅ Generate secure webhook credentials
    const webhookKey = generateWebhookKey()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const webhookUrl = `${baseUrl}/api/webhooks/${webhookKey}`
    const authToken = body.requires_auth ? generateAuthToken() : null

    // ✅ Create webhook with defaults
    const webhookData = {
      name: body.name.trim(),
      description: body.description?.trim() || '',
      webhook_key: webhookKey,
      webhook_url: webhookUrl,
      requires_auth: Boolean(body.requires_auth),
      auth_token: authToken,
      rate_limit: body.rate_limit || 100,
      allowed_origins: body.allowed_origins || [],
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true
    }

    const webhook = await createWebhook(id, webhookData)

    return NextResponse.json(
      { 
        webhook,
        message: 'Webhook created successfully'
      },
      { 
        status: 201,
        headers: rateLimitResult.headers
      }
    )
  } catch (error) {
    console.error('Error creating webhook:', error)
    
    // Handle duplicate key errors
    if (error.code === '23505') { // PostgreSQL unique violation
      return NextResponse.json(
        { error: 'A webhook with this name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create webhook',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH - Bulk Update Webhooks (bonus feature)
// ============================================================================
export async function PATCH(request, { params }) {
  try {
    // ✅ Rate limiting
    const rateLimitResult = await writeRateLimiter(request)
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
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ Verify agent ownership
    const { agent, error: ownershipError, status } = await verifyAgentOwnership(id, user.id)
    if (ownershipError) {
      return NextResponse.json({ error: ownershipError }, { status })
    }

    // ✅ Parse request body (expecting array of updates)
    const body = await request.json()
    
    if (!body.action) {
      return NextResponse.json(
        { error: 'Action is required (e.g., "activate", "deactivate")' },
        { status: 400 }
      )
    }

    // Handle bulk actions
    const webhooks = await getWebhooksByAgentId(id)
    
    switch (body.action) {
      case 'activate':
        // Activate all webhooks
        await Promise.all(
          webhooks.map(w => updateWebhook(w.id, { is_active: true }))
        )
        return NextResponse.json(
          { message: `Activated ${webhooks.length} webhooks` },
          { status: 200, headers: rateLimitResult.headers }
        )
        
      case 'deactivate':
        // Deactivate all webhooks
        await Promise.all(
          webhooks.map(w => updateWebhook(w.id, { is_active: false }))
        )
        return NextResponse.json(
          { message: `Deactivated ${webhooks.length} webhooks` },
          { status: 200, headers: rateLimitResult.headers }
        )
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error bulk updating webhooks:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update webhooks',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}