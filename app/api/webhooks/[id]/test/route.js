import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  try {
    const { id } = params
    const supabase = createServerComponentClient({ cookies })

    // Get webhook
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    // Create test payload
    const testPayload = {
      event: 'test_webhook',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from AgentBuilder',
        webhook_id: webhook.id,
        webhook_name: webhook.name
      }
    }

    // Send webhook
    const result = await sendWebhook(webhook, testPayload, 'test_webhook')

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error testing webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
