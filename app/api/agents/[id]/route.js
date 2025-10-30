// ============================================================================
// OPTIMIZED AGENT DETAILS API
// File: /app/api/agents/[id]/route.js
// ============================================================================

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAgent, updateAgent, deleteAgent } from '../../../actions/agents'
import { createRateLimitMiddleware } from '../../../../lib/api/rate-limiter'

// ✅ Rate limiters
const readRateLimiter = createRateLimitMiddleware({ 
  maxRequests: 300,
  windowMs: 60000,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `agent-read:${userId}`
  }
})

const writeRateLimiter = createRateLimitMiddleware({
  maxRequests: 100,
  windowMs: 60000,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `agent-write:${userId}`
  }
})

// ✅ Shared helper for auth
async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error: 'Unauthorized' }
  }

  return { user, error: null }
}

// ============================================================================
// GET - Fetch Agent Details
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
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 })
    }

    // ✅ Get agent
    const { id } = await params
    const agentData = await getAgent(id, user.id)

    if (!agentData) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      )
    }

    // ✅ Enrich response with computed fields
    const enrichedAgent = {
      ...agentData,
      createdDate: new Date(agentData.created_at).toISOString(),
      updatedDate: new Date(agentData.updated_at).toISOString(),
      isActive: Boolean(agentData.is_active),
      hasWebhooks: agentData.webhook_count > 0 // Assuming you track this
    }

    return NextResponse.json(enrichedAgent, {
      status: 200,
      headers: {
        ...rateLimitResult.headers,
        'Cache-Control': 'private, max-age=30', // Cache for 30 seconds
        ETag: `"${agentData.updated_at}"` // Use updated_at for ETag
      }
    })
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch agent',
        message:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH - Update Agent
// ============================================================================
export async function PATCH(req, { params }) {
  try {
    // ✅ Rate limiting
    const rateLimitResult = await writeRateLimiter(req)
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
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 })
    }

    // ✅ Verify agent ownership
    const { id } = await params
    const existingAgent = await getAgent(id, user.id)

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      )
    }

    // ✅ Parse and validate updates
    const body = await request.json()

    const allowedFields = [
      'name',
      'description',
      'purpose',
      'is_active',
      'settings'
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

    // ✅ Validation
    if (updates.name && updates.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Agent name cannot be empty' },
        { status: 400 }
      )
    }

    if (updates.name && updates.name.length > 100) {
      return NextResponse.json(
        { error: 'Agent name must be less than 100 characters' },
        { status: 400 }
      )
    }

    // ✅ Update agent
    const updatedAgent = await updateAgent(id, updates)

    return NextResponse.json(
      {
        agent: updatedAgent,
        message: 'Agent updated successfully'
      },
      {
        status: 200,
        headers: rateLimitResult.headers
      }
    )
  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json(
      {
        error: 'Failed to update agent',
        message:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Agent
// ============================================================================
export async function DELETE(req, { params }) {
  try {
    // ✅ Stricter rate limiting for destructive operations
    const deleteRateLimiter = createRateLimitMiddleware({
      maxRequests: 10,
      windowMs: 60000
    })

    const rateLimitResult = await deleteRateLimiter(req)
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
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 })
    }

    // ✅ Verify agent ownership
    const { id } = await params
    const existingAgent = await getAgent(id, user.id)

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      )
    }

    // ✅ Optional: Check for confirmation
    const { searchParams } = new URL(req.url)
    const confirmed = searchParams.get('confirm') === 'true'

    if (!confirmed) {
      return NextResponse.json(
        {
          error: 'Confirmation required',
          message: 'Add ?confirm=true to delete this agent'
        },
        { status: 400 }
      )
    }

    // ✅ Delete agent (should cascade to webhooks)
    await deleteAgent(id)

    return NextResponse.json(
      {
        success: true,
        message: 'Agent deleted successfully'
      },
      {
        status: 200,
        headers: rateLimitResult.headers
      }
    )
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete agent',
        message:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
