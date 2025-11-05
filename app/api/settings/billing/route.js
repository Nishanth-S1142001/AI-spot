import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Billing Settings API Route
 * Handle payment methods and billing history
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

    // Get user profile with metadata
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch billing data' },
        { status: 500 }
      )
    }

    // Extract billing data from metadata
    const billingData = profile?.metadata?.billing || {}
    
    // Return payment methods and billing history
    // In production, this would fetch from your payment provider (Stripe, Razorpay, etc.)
    return NextResponse.json({
      success: true,
      paymentMethods: billingData.paymentMethods || [],
      billingHistory: billingData.billingHistory || []
    })
  } catch (error) {
    console.error('Billing data fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
