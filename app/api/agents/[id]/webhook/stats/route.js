import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getWebhookInvocations,
  getAgent,
  getWebhooksByAgentId
} from '../../../../../actions/agents'
import { createRateLimitMiddleware } from '../../../../../../lib/api/rate-limiter'

// ✅ Rate limiter for stats endpoint
const statsRateLimiter = createRateLimitMiddleware({
  maxRequests: 100,
  windowMs: 60000,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `webhook-stats:${userId}`
  }
})

// ✅ Helper to calculate stats for a single webhook
async function calculateWebhookStats(webhook) {
  // Fetch recent invocations (last 1000 or configurable)
  const { data: invocations } = await getWebhookInvocations(webhook.id, 1000, 0, 'desc')
  
  if (!invocations || invocations.length === 0) {
    return {
      webhookId: webhook.id,
      webhookName: webhook.name,
      isActive: webhook.is_active,
      totalInvocations: 0,
      successRate: 0,
      errorRate: 0,
      avgResponseTime: 0,
      last24h: 0,
      last7d: 0,
      last30d: 0
    }
  }

  // Calculate metrics
  const totalInvocations = invocations.length
  const successful = invocations.filter(i => i.success).length
  const failed = totalInvocations - successful
  const successRate = ((successful / totalInvocations) * 100).toFixed(1)
  const errorRate = ((failed / totalInvocations) * 100).toFixed(1)

  // Calculate average response time
  const responseTimes = invocations
    .filter(i => i.response_time_ms)
    .map(i => i.response_time_ms)
  
  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0

  // Time-based metrics
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const last24hCount = invocations.filter(i => new Date(i.created_at) >= last24h).length
  const last7dCount = invocations.filter(i => new Date(i.created_at) >= last7d).length
  const last30dCount = invocations.filter(i => new Date(i.created_at) >= last30d).length

  return {
    webhookId: webhook.id,
    webhookName: webhook.name,
    isActive: webhook.is_active,
    totalInvocations,
    successful,
    failed,
    successRate: parseFloat(successRate),
    errorRate: parseFloat(errorRate),
    avgResponseTime,
    last24h: last24hCount,
    last7d: last7dCount,
    last30d: last30dCount
  }
}

// ============================================================================
// GET - Fetch Webhook Statistics
// ============================================================================
export async function GET(request, { params }) {
  try {
    // ✅ Rate limiting
    const rateLimitResult = await statsRateLimiter(request)
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

    // ✅ Verify agent ownership
    const { id } = await params
    const agent = await getAgent(id, user.id)
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // ✅ Get all webhooks for this agent
    const webhooks = await getWebhooksByAgentId(id)

    if (!webhooks || webhooks.length === 0) {
      return NextResponse.json(
        {
          overall: {
            totalWebhooks: 0,
            activeWebhooks: 0,
            totalInvocations: 0,
            avgSuccessRate: 0,
            avgResponseTime: 0,
            last24hTotal: 0,
            last7dTotal: 0,
            last30dTotal: 0
          },
          webhooks: []
        },
        { 
          status: 200,
          headers: {
            ...rateLimitResult.headers,
            'Cache-Control': 'private, max-age=30'
          }
        }
      )
    }

    // ✅ Calculate stats for all webhooks in parallel
    const webhookStats = await Promise.all(
      webhooks.map(webhook => calculateWebhookStats(webhook))
    )

    // ✅ Calculate overall aggregated stats
    const overallStats = {
      totalWebhooks: webhooks.length,
      activeWebhooks: webhooks.filter(w => w.is_active).length,
      inactiveWebhooks: webhooks.filter(w => !w.is_active).length,
      totalInvocations: webhookStats.reduce((sum, s) => sum + s.totalInvocations, 0),
      totalSuccessful: webhookStats.reduce((sum, s) => sum + s.successful, 0),
      totalFailed: webhookStats.reduce((sum, s) => sum + s.failed, 0),
      avgSuccessRate: webhookStats.length > 0
        ? (webhookStats.reduce((sum, s) => sum + s.successRate, 0) / webhookStats.length).toFixed(1)
        : 0,
      avgResponseTime: webhookStats.length > 0
        ? Math.round(webhookStats.reduce((sum, s) => sum + s.avgResponseTime, 0) / webhookStats.length)
        : 0,
      last24hTotal: webhookStats.reduce((sum, s) => sum + s.last24h, 0),
      last7dTotal: webhookStats.reduce((sum, s) => sum + s.last7d, 0),
      last30dTotal: webhookStats.reduce((sum, s) => sum + s.last30d, 0)
    }

    return NextResponse.json(
      {
        overall: overallStats,
        webhooks: webhookStats,
        generatedAt: new Date().toISOString()
      },
      { 
        status: 200,
        headers: {
          ...rateLimitResult.headers,
          'Cache-Control': 'private, max-age=30' // Cache for 30 seconds
        }
      }
    )
  } catch (error) {
    console.error('Error fetching webhook stats:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch stats',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
