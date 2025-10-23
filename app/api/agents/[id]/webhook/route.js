import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getAgent,
  getWebhooksByAgentId,
  createWebhook
} from '../../../../actions/agents'
import { generateWebhookKey, generateAuthToken } from '../../../../../lib/nanoid'

export async function GET(req, { params }) {
  try {
    const { id } = await params // ✅ Await params
    const cookieStore = await cookies() // ✅ Await cookies

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ Verify agent ownership
    const agent = await getAgent(id, user.id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // ✅ Fetch webhook by agent id
    const webhooks = await getWebhooksByAgentId(id)

    return NextResponse.json({ webhooks: webhooks || null }, { status: 200 })
  } catch (error) {
    console.error('Error fetching webhook:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhook' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params // ✅ Await params
    const cookieStore = await cookies() // ✅ Await cookies

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // ✅ Verify agent ownership
    const agent = await getAgent(id, user.id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // ✅ Generate secure webhook
    const webhookKey = generateWebhookKey()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const webhookUrl = `${baseUrl}/api/webhooks/${webhookKey}`
    const authToken = body.requires_auth ? generateAuthToken() : null

    const webhook = await createWebhook(id, {
      name: body.name || 'New Webhook',
      description: body.description || '',
      webhook_key: webhookKey,
      webhook_url: webhookUrl,
      requires_auth: body.requires_auth || false,
      auth_token: authToken,
      rate_limit: body.rate_limit || 100,
      allowed_origins: body.allowed_origins || [],
      is_active: true
    })

    return NextResponse.json({ webhook })
  } catch (error) {
    console.error('Error creating webhook:', error)
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    )
  }
}
