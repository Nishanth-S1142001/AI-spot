// app/api/agents/[id]/analytics/route.js
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase/dbServer'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const limit = parseInt(searchParams.get('limit') || '1000', 10)

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    // Build query with optional date filtering
    let query = supabaseAdmin
      .from('analytics')
      .select('*')
      .eq('agent_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (start) {
      query = query.gte('created_at', start)
    }

    if (end) {
      query = query.lte('created_at', end)
    }

    const { data: analytics, error } = await query

    if (error) {
      console.error('Error fetching analytics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      )
    }

    // Calculate aggregated metrics for performance
    const metrics = {
      total_events: analytics.length,
      successful_events: analytics.filter(a => a.success).length,
      total_tokens: analytics.reduce((sum, a) => sum + (a.tokens_used || 0), 0),
      event_types: analytics.reduce((acc, a) => {
        const type = a.event_type || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {}),
      avg_tokens: analytics.length > 0
        ? Math.round(analytics.reduce((sum, a) => sum + (a.tokens_used || 0), 0) / analytics.length)
        : 0
    }

    return NextResponse.json({
      success: true,
      analytics,
      metrics,
      count: analytics.length
    })
  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Log new analytics event
export async function POST(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      event_type,
      event_data = {},
      tokens_used = 0,
      success = true
    } = body

    if (!id || !event_type) {
      return NextResponse.json(
        { error: 'Agent ID and event type are required' },
        { status: 400 }
      )
    }

    // Insert analytics record
    const { data, error } = await supabaseAdmin
      .from('analytics')
      .insert({
        agent_id: id,
        event_type,
        event_data,
        tokens_used,
        success,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error logging analytics:', error)
      return NextResponse.json(
        { error: 'Failed to log analytics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analytics: data
    })
  } catch (error) {
    console.error('Error in analytics logging:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Clean up old analytics (optional maintenance endpoint)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const daysToKeep = parseInt(searchParams.get('days') || '90', 10)

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    // Calculate cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    // Soft delete old analytics
    const { error } = await supabaseAdmin
      .from('analytics')
      .update({ deleted_at: new Date().toISOString() })
      .eq('agent_id', id)
      .lt('created_at', cutoffDate.toISOString())
      .is('deleted_at', null)

    if (error) {
      console.error('Error cleaning analytics:', error)
      return NextResponse.json(
        { error: 'Failed to clean analytics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Analytics older than ${daysToKeep} days marked for deletion`
    })
  } catch (error) {
    console.error('Error in analytics cleanup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}