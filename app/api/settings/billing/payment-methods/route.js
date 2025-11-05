import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Payment Methods API Route
 * Handle adding and removing payment methods
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, cardData } = body

    if (!userId || !cardData) {
      return NextResponse.json(
        { error: 'User ID and card data are required' },
        { status: 400 }
      )
    }

    // Get current profile metadata
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching profile:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // In production, integrate with payment provider (Stripe, Razorpay, etc.)
    // This is a simplified version that stores card info in metadata
    const currentBilling = profile?.metadata?.billing || {}
    const paymentMethods = currentBilling.paymentMethods || []

    // Add new payment method
    const newCard = {
      id: `card_${Date.now()}`,
      ...cardData,
      createdAt: new Date().toISOString()
    }

    paymentMethods.push(newCard)

    // Update metadata
    const updatedMetadata = {
      ...(profile?.metadata || {}),
      billing: {
        ...currentBilling,
        paymentMethods
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error adding payment method:', updateError)
      return NextResponse.json(
        { error: 'Failed to add payment method' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      card: newCard
    })
  } catch (error) {
    console.error('Add payment method error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json()
    const { userId, cardId } = body

    if (!userId || !cardId) {
      return NextResponse.json(
        { error: 'User ID and card ID are required' },
        { status: 400 }
      )
    }

    // Get current profile metadata
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching profile:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // Remove payment method
    const currentBilling = profile?.metadata?.billing || {}
    const paymentMethods = currentBilling.paymentMethods || []
    const updatedPaymentMethods = paymentMethods.filter(card => card.id !== cardId)

    // Update metadata
    const updatedMetadata = {
      ...(profile?.metadata || {}),
      billing: {
        ...currentBilling,
        paymentMethods: updatedPaymentMethods
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error removing payment method:', updateError)
      return NextResponse.json(
        { error: 'Failed to remove payment method' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method removed successfully'
    })
  } catch (error) {
    console.error('Remove payment method error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
