import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  updateWebhook,
  getAgent,
  getWebhookById
} from '../../../../actions/agents'
import { generateWebhookKey, generateAuthToken } from '../../../../../lib/nanoid'
import { createRateLimitMiddleware } from '../../../../../lib/api/rate-limiter'

// ✅ Strict rate limiting for security-sensitive operations
const rateLimiter = createRateLimitMiddleware({
  maxRequests: 10,
  windowMs: 60000,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `webhook-regenerate:${userId}`
  }
})

// ============================================================================
// POST - Regenerate Webhook Keys
// ============================================================================
export async function POST(request, { params }) {
  try {
    // ✅ Rate limiting
    const rateLimitResult = await rateLimiter(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many regeneration attempts',
          ...rateLimitResult.error
        },
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

    // ✅ Get and verify webhook ownership
    const { id } = await params
    const currentWebhook = await getWebhookById(id)
    
    if (!currentWebhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    const agent = await getAgent(currentWebhook.agent_id, user.id)
    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // ✅ Generate new keys
    const webhookKey = generateWebhookKey()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const webhookUrl = `${baseUrl}/api/webhooks/${webhookKey}`
    const authToken = currentWebhook.requires_auth ? generateAuthToken() : null

    // ✅ Update webhook with new keys
    const updatedWebhook = await updateWebhook(currentWebhook.id, {
      webhook_key: webhookKey,
      webhook_url: webhookUrl,
      auth_token: authToken,
      updated_at: new Date().toISOString()
    })

    // ✅ Return response with security notice
    return NextResponse.json(
      {
        webhook: updatedWebhook,
        message: 'Webhook keys regenerated successfully',
        warning: 'Previous webhook URL and auth token are now invalid'
      },
      { 
        status: 200,
        headers: rateLimitResult.headers
      }
    )
  } catch (error) {
    console.error('Error regenerating webhook:', error)
    return NextResponse.json(
      { 
        error: 'Failed to regenerate webhook',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}