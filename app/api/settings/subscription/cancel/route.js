import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Subscription Cancel API Route
 * Handle subscription cancellation
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Cannot cancel free tier
    if (profile.subscription_tier === 'free') {
      return NextResponse.json(
        { error: 'Cannot cancel free subscription' },
        { status: 400 }
      )
    }

    // In production, this would:
    // 1. Cancel subscription with payment provider
    // 2. Set subscription to cancel at period end
    // 3. Send confirmation email

    // Calculate end of billing period (30 days from now)
    const cancellationDate = new Date()
    const effectiveDate = new Date(cancellationDate)
    effectiveDate.setDate(effectiveDate.getDate() + 30)

    const updatedMetadata = {
      ...(profile?.metadata || {}),
      subscription: {
        ...(profile?.metadata?.subscription || {}),
        status: 'cancelled',
        cancelledAt: cancellationDate.toISOString(),
        effectiveDate: effectiveDate.toISOString(),
        previousPlan: profile.subscription_tier
      }
    }

    // Update profile with cancellation info
    // Note: We keep the tier active until end of billing period
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error cancelling subscription:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      effectiveDate: effectiveDate.toISOString()
    })
  } catch (error) {
    console.error('Subscription cancel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
