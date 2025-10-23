import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  updateWebhook,
  deleteWebhook,
  getAgent,
  getWebhookById
} from '../../../actions/agents'

export async function PATCH(request, { params }) {
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
    const body = await request.json()
    const webhook = await getWebhookById(id)
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    // Verify agent ownership
    const agent = await getAgent(webhook.agent_id, user.id)
    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    const updatedWebhook = await updateWebhook(id, body)

    return NextResponse.json({ updateWebhook })
  } catch (error) {
    console.error('Error updating webhook:', error)
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const {
      data: { user },
      error: authError
    } = await supabaseAdmin.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const webhook = await getWebhookById(id)
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }
    const agent = await getAgent(webhook.agent_id, user.id)
    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    await deleteWebhook(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting webhook:', error)
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    )
  }
}
