import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import {
  getWebhookInvocations,
  getAgent,
  getWebhooksByAgentId
} from '../../../../actions/agents'
import { cookies } from 'next/headers'

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies()

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    // Verify agent ownership
    const agent = await getAgent(id, user.id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Get all webhooks for this agent
    const webhooks = await getWebhooksByAgentId(id)

    // Get stats for each webhook
    const webhookStats = await Promise.all(
      webhooks.map(async (webhook) => {
        const invocations = await getWebhookInvocations(webhook.id, 1000)

        const totalInvocations = invocations.length
        const successful = invocations.filter((i) => i.success).length
        const successRate =
          totalInvocations > 0
            ? ((successful / totalInvocations) * 100).toFixed(1)
            : 0

        const responseTimes = invocations
          .filter((i) => i.response_time_ms)
          .map((i) => i.response_time_ms)
        const avgResponseTime =
          responseTimes.length > 0
            ? Math.round(
                responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
              )
            : 0

        const now = new Date()
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const last24hCount = invocations.filter(
          (i) => new Date(i.created_at) >= last24h
        ).length

        return {
          webhookId: webhook.id,
          webhookName: webhook.name,
          isActive: webhook.is_active,
          totalInvocations,
          successRate,
          avgResponseTime,
          last24h: last24hCount
        }
      })
    )

    // Calculate overall stats
    const overallStats = {
      totalWebhooks: webhooks.length,
      activeWebhooks: webhooks.filter((w) => w.is_active).length,
      totalInvocations: webhookStats.reduce(
        (sum, s) => sum + s.totalInvocations,
        0
      ),
      avgSuccessRate:
        webhookStats.length > 0
          ? (
              webhookStats.reduce(
                (sum, s) => sum + parseFloat(s.successRate),
                0
              ) / webhookStats.length
            ).toFixed(1)
          : 0,
      last24hTotal: webhookStats.reduce((sum, s) => sum + s.last24h, 0)
    }

    return NextResponse.json({
      overall: overallStats,
      webhooks: webhookStats
    })
  } catch (error) {
    console.error('Error fetching webhook stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
