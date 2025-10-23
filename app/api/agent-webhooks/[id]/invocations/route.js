import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getWebhookInvocations,
  getAgent,
  getWebhookById
} from '../../../../actions/agents'


export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const { searchParams } = new URL(request.url)
    const requestedLimit = parseInt(searchParams.get('limit')) || 50
    const limit = Math.min(requestedLimit, 500)
    const offset = parseInt(searchParams.get('offset')) || 0
    const sort = searchParams.get('sort') || 'desc'
     

    const [webhook, { data: invocations, count }] = await Promise.all([
      getWebhookById(id),
      getWebhookInvocations(id, limit, offset, sort, status)
    ])

    if (!webhook)
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })

    const agent = await getAgent(webhook.agent_id, user.id)
    if (!agent)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    return NextResponse.json({ invocations, total: count })
  } catch (error) {
    console.error('Error fetching invocations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invocations' },
      { status: 500 }
    )
  }
}
