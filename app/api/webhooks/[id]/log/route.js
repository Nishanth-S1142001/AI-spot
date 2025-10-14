import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = createServerComponentClient({ cookies })

    const { data: logs, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('webhook_id', id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching webhook logs:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
