import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Subscription Upgrade API Route
 * Handle subscription plan upgrades
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, planId } = body

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'User ID and plan ID are required' },
        { status: 400 }
      )
    }

    // Validate plan ID
    const validPlans = ['free', 'pro', 'enterprise']
    if (!validPlans.includes(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Get current profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('subscription_tier, metadata')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching profile:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // In production, this would:
    // 1. Create/update subscription with payment provider (Stripe, Razorpay, etc.)
    // 2. Process payment
    // 3. Update subscription status

    // For demo purposes, directly update the subscription tier
    const updatedMetadata = {
      ...(profile?.metadata || {}),
      subscription: {
        planId,
        previousPlan: profile.subscription_tier,
        upgradedAt: new Date().toISOString(),
        status: 'active'
      }
    }

    // Update credits based on plan
    const planCredits = {
      free: 1000,
      pro: 50000,
      enterprise: 1000000
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: planId,
        api_credits: planCredits[planId],
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error upgrading subscription:', error)
      return NextResponse.json(
        { error: 'Failed to upgrade subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: {
        tier: data.subscription_tier,
        credits: data.api_credits
      }
    })
  } catch (error) {
    console.error('Subscription upgrade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
