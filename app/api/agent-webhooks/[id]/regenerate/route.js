import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import {
  getWebhookByAgentId,
  updateWebhook,
  getAgent,
  getWebhookById
} from '../../../../actions/agents'
import { generateWebhookKey, generateAuthToken } from '../../../../../lib/nanoid'
import { cookies } from 'next/headers'
export async function POST(request, { params }) {
  try {
    const cookieStore = await cookies()

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const currentWebhook = await getWebhookById(id)
    if (!currentWebhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    // Verify agent ownership
    const agent = await getAgent(currentWebhook.agent_id, user.id)
    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    const webhookKey = generateWebhookKey()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const webhookUrl = `${baseUrl}/api/webhooks/${webhookKey}`

    const authToken = currentWebhook?.requires_auth ? generateAuthToken() : null

    const webhook = await updateWebhook(currentWebhook.id, {
      webhook_key: webhookKey,
      webhook_url: webhookUrl,
      auth_token: authToken
    })

    return NextResponse.json({ webhook })
  } catch (error) {
    console.error('Error regenerating webhook:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate webhook' },
      { status: 500 }
    )
  }
}
