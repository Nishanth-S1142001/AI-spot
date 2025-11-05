import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Subscription Usage API Route
 * Fetch current subscription usage statistics
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user profile to check subscription tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, api_credits')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    const subscriptionTier = profile.subscription_tier || 'free'

    // Get current billing period (start and end of month)
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Count agents
    const { count: agentCount, error: agentError } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (agentError) {
      console.error('Error counting agents:', agentError)
    }

    // Count conversations this month
    const { count: conversationCount, error: conversationError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString())
      .in('agent_id', supabase
        .from('agents')
        .select('id')
        .eq('user_id', userId)
      )

    if (conversationError) {
      console.error('Error counting conversations:', conversationError)
    }

    // Calculate API credits used this month
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .select('tokens_used')
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString())
      .in('agent_id', supabase
        .from('agents')
        .select('id')
        .eq('user_id', userId)
      )

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError)
    }

    const tokensUsed = analytics?.reduce((sum, item) => sum + (item.tokens_used || 0), 0) || 0

    // Define limits based on subscription tier
    const limits = {
      free: {
        agents: 1,
        conversations: 100,
        apiCredits: 1000
      },
      pro: {
        agents: -1, // unlimited
        conversations: 10000,
        apiCredits: 50000
      },
      enterprise: {
        agents: -1, // unlimited
        conversations: -1, // unlimited
        apiCredits: -1 // unlimited
      }
    }

    const tierLimits = limits[subscriptionTier] || limits.free

    return NextResponse.json({
      success: true,
      agents: {
        used: agentCount || 0,
        limit: tierLimits.agents
      },
      conversations: {
        used: conversationCount || 0,
        limit: tierLimits.conversations
      },
      apiCredits: {
        used: tokensUsed,
        limit: tierLimits.apiCredits
      },
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString()
      }
    })
  } catch (error) {
    console.error('Usage fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
