import crypto from 'crypto'
import { supabaseAdmin } from './supabase/dbServer'

export async function sendWebhook(webhook, payload, eventType, attemptNumber = 1) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'AgentBuilder-Webhook/1.0',
      'X-Webhook-Event': eventType,
      'X-Webhook-ID': webhook.id,
      'X-Webhook-Attempt': attemptNumber.toString(),
      ...webhook.headers
    }

    // Add signature if secret is provided
    if (webhook.secret) {
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('hex')
      headers['X-Webhook-Signature'] = signature
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), webhook.timeout_seconds * 1000)

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const responseBody = await response.text()
    const success = response.ok

    // Log the webhook delivery
    await supabaseAdmin.from('webhook_logs').insert({
      webhook_id: webhook.id,
      agent_id: webhook.agent_id,
      event_type: eventType,
      payload,
      response_status: response.status,
      response_body: responseBody.slice(0, 1000), // Limit size
      success,
      attempt_number: attemptNumber
    })

    // Retry on failure
    if (!success && attemptNumber < webhook.retry_count) {
      setTimeout(() => {
        sendWebhook(webhook, payload, eventType, attemptNumber + 1)
      }, Math.pow(2, attemptNumber) * 1000) // Exponential backoff
    }

    return { success, status: response.status, body: responseBody }
  } catch (error) {
    // Log the error
    await supabaseAdmin.from('webhook_logs').insert({
      webhook_id: webhook.id,
      agent_id: webhook.agent_id,
      event_type: eventType,
      payload,
      success: false,
      attempt_number: attemptNumber,
      error_message: error.message
    })

    // Retry on error
    if (attemptNumber < webhook.retry_count) {
      setTimeout(() => {
        sendWebhook(webhook, payload, eventType, attemptNumber + 1)
      }, Math.pow(2, attemptNumber) * 1000)
    }

    return { success: false, error: error.message }
  }
}

export async function triggerWebhooks(agentId, eventType, data) {
  try {
    // Get all active webhooks for this agent and event
    const { data: webhooks, error } = await supabaseAdmin
      .from('webhooks')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .contains('events', [eventType])

    if (error) throw error

    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      agent_id: agentId,
      data
    }

    // Send to all matching webhooks
    const promises = webhooks.map(webhook => 
      sendWebhook(webhook, payload, eventType)
    )

    await Promise.allSettled(promises)
  } catch (error) {
    console.error('Error triggering webhooks:', error)
  }
}
