import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Notification Preferences API Route
 * Handle notification settings updates
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function PUT(request) {
  try {
    const body = await request.json()
    const {
      userId,
      emailNotifications,
      agentAlerts,
      workflowAlerts,
      weeklyReport,
      marketingEmails
    } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get current profile metadata
    const { data: currentProfile, error: fetchError } = await supabase
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

    // Merge notification preferences with existing metadata
    const updatedMetadata = {
      ...(currentProfile?.metadata || {}),
      notification_preferences: {
        emailNotifications,
        agentAlerts,
        workflowAlerts,
        weeklyReport,
        marketingEmails,
        updated_at: new Date().toISOString()
      }
    }

    // Update profile metadata with notification preferences
    const { data, error } = await supabase
      .from('profiles')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating notifications:', error)
      return NextResponse.json(
        { error: 'Failed to update notification preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      preferences: updatedMetadata.notification_preferences
    })
  } catch (error) {
    console.error('Notification preferences update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { data, error } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching notification preferences:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notification preferences' },
        { status: 500 }
      )
    }

    // Return notification preferences from metadata or defaults
    const preferences = data?.metadata?.notification_preferences || {
      emailNotifications: true,
      agentAlerts: true,
      workflowAlerts: true,
      weeklyReport: false,
      marketingEmails: false
    }

    return NextResponse.json({
      success: true,
      preferences
    })
  } catch (error) {
    console.error('Notification preferences fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
