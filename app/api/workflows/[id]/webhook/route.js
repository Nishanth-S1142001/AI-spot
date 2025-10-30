import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getWorkflow,
  getWorkflowWebhook,
  createWorkflowWebhook,
  updateWorkflow
} from  '../../../../actions/agents'
import { generateWebhookKey, generateAuthToken } from '../../../../../lib/nanoid'

export async function GET(request, { params }) {
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

    const workflow = await getWorkflow(id, user.id)

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const webhook = await getWorkflowWebhook(id)

    return NextResponse.json({ webhook: webhook || null })
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

    const workflow = await getWorkflow(id, user.id)

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const webhookKey = generateWebhookKey()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const webhookUrl = `${baseUrl}/api/workflow-webhooks/${webhookKey}`
    const authToken = body.requires_auth ? generateAuthToken() : null

    const webhook = await createWorkflowWebhook(id, {
      webhook_key: webhookKey,
      webhook_url: webhookUrl,
      requires_auth: body.requires_auth || false,
      auth_token: authToken,
      is_active: true
    })

    // Update workflow trigger type
    await updateWorkflow(id, {
      trigger_type: 'webhook',
      trigger_config: { webhook_id: webhook.id }
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
