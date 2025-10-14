import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const supabase = createServerComponentClient({ cookies })

    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('agent_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ webhooks })
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const supabase = createServerComponentClient({ cookies })

    // Validate required fields
    if (!body.name || !body.url || !body.events || body.events.length === 0) {
      return NextResponse.json(
        { error: 'Name, URL, and events are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(body.url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        agent_id: id,
        name: body.name,
        url: body.url,
        events: body.events,
        secret: body.secret || null,
        headers: body.headers || {},
        retry_count: body.retry_count || 3,
        timeout_seconds: body.timeout_seconds || 30,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ webhook }, { status: 201 })
  } catch (error) {
    console.error('Error creating webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
