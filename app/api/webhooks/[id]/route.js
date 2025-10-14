import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const supabase = createServerComponentClient({ cookies })

    const updates = {}
    if (body.name) updates.name = body.name
    if (body.url) updates.url = body.url
    if (body.events) updates.events = body.events
    if (body.secret !== undefined) updates.secret = body.secret
    if (body.is_active !== undefined) updates.is_active = body.is_active
    if (body.retry_count !== undefined) updates.retry_count = body.retry_count
    if (body.timeout_seconds !== undefined) updates.timeout_seconds = body.timeout_seconds
    if (body.headers) updates.headers = body.headers

    updates.updated_at = new Date().toISOString()

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ webhook })
  } catch (error) {
    console.error('Error updating webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const supabase = createServerComponentClient({ cookies })

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
