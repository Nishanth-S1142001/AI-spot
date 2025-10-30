import { NextResponse } from 'next/server'

import { checkRateLimit } from '../../../../lib/api/rate-limiter'
import {
  getWebhookByKey,
  saveConversation,
  logAnalytics,
  deductCredits,
  createWebhookInvocation
} from '../../../actions/agents'

export async function POST(request, { params }) {
  const startTime = Date.now()
  const { key } = await params

  try {
    // Get webhook with agent details
    const webhook = await getWebhookByKey(key)

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    if (!webhook.is_active) {
      return NextResponse.json(
        { error: 'Webhook is disabled' },
        { status: 403 }
      )
    }

    // Rate limiting
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const rateLimitKey = `webhook:${webhook.id}:${clientIp}`
    const rateCheck = checkRateLimit(rateLimitKey, webhook.rate_limit)

    if (!rateCheck.allowed) {
      await logInvocation(
        webhook,
        request,
        {
          success: false,
          error: 'Rate limit exceeded',
          status: 429
        },
        startTime
      )

      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: 60 },
        { status: 429 }
      )
    }

    // Authentication check
    if (webhook.requires_auth) {
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')

      if (token !== webhook.auth_token) {
        await logInvocation(
          webhook,
          request,
          {
            success: false,
            error: 'Invalid authentication token',
            status: 401
          },
          startTime
        )

        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Parse request body
    let body = {}
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { message, sessionId, ...metadata } = body

    if (!message) {
      await logInvocation(
        webhook,
        request,
        {
          success: false,
          error: 'Message is required',
          status: 400,
          body
        },
        startTime
      )

      return NextResponse.json(
        { error: 'Message is required in request body' },
        { status: 400 }
      )
    }

    // Execute agent
    const agent = webhook.agents
    const agentResponse = await executeAgent(
      agent,
      message,
      sessionId,
      metadata
    )

    const responseTime = Date.now() - startTime

    // Save conversation
    await saveConversation(
      agent.id,
      sessionId || 'webhook-default',
      message,
      agentResponse.content,
      { source: 'webhook', ...metadata }
    )

    // Log analytics
    await logAnalytics(
      agent.id,
      'webhook_invocation',
      { sessionId, metadata },
      agentResponse.tokensUsed,
      true
    )

    // Deduct credits
    const creditsToDeduct = Math.ceil(agentResponse.tokensUsed / 1000)
    await deductCredits(agent.user_id, creditsToDeduct)

    // Log successful invocation
    await logInvocation(
      webhook,
      request,
      {
        success: true,
        responseBody: {
          content: agentResponse.content,
          tokensUsed: agentResponse.tokensUsed
        },
        status: 200,
        body
      },
      startTime
    )

    return NextResponse.json({
      response: agentResponse.content,
      sessionId: sessionId || 'webhook-default',
      tokensUsed: agentResponse.tokensUsed,
      responseTimeMs: responseTime,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Webhook execution error:', error)

    try {
      const webhook = await getWebhookByKey(key)
      if (webhook) {
        await logInvocation(
          webhook,
          request,
          {
            success: false,
            error: error.message,
            status: 500
          },
          startTime
        )
      }
    } catch (logError) {
      console.error('Error logging failed invocation:', logError)
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

// Helper: Execute AI Agent using OpenAI
async function executeAgent(agent, message, sessionId, metadata) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: agent?.system_prompt || 'You are a helpful AI assistant.'
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1024
    })
  })

  const contentType = response.headers.get('content-type') || ''
  let data

  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    const text = await response.text()
    throw new Error(
      `OpenAI API returned non-JSON response: ${text.substring(0, 200)}`
    )
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || ''
    let errorMessage = response.statusText

    if (contentType.includes('application/json')) {
      const errorData = await response.json()
      errorMessage = errorData.error?.message || errorMessage
    } else {
      const text = await response.text()
      errorMessage = text.substring(0, 200) // first 200 chars of HTML
    }

    throw new Error(`OpenAI API error: ${errorMessage}`)
  }

  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage.total_tokens
  }
}

// Helper: Log invocation
async function logInvocation(webhook, request, result, startTime) {
  const responseTime = Date.now() - startTime
  let requestBody = {}

  try {
    requestBody = result.body || (await request.clone().json())
  } catch (e) {
    requestBody = {}
  }

  const headers = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  await createWebhookInvocation({
    agent_webhook_id: webhook.id,
    agent_id: webhook.agent_id,
    request_method: request.method,
    request_headers: headers,
    request_body: requestBody,
    response_status: result.status,
    response_body: result.responseBody || null,
    response_time_ms: responseTime,
    ip_address:
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown',
    user_agent: request.headers.get('user-agent') || 'unknown',
    success: result.success,
    error_message: result.error || null
  })
}
