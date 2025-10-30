import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getWorkflowWebhookByKey, createTask } from '../../../actions/agents'
import { checkRateLimit } from '../../../../lib/api/rate-limiter'

// POST /api/webhook/[key] - Webhook trigger endpoint
export async function POST(request, { params }) {
  const { key } = params
  const startTime = Date.now()

  try {
    // ✅ RATE LIMITING (100 requests per minute per key)
    const rateKey = `webhook:${key}`
    const rateCheck = checkRateLimit(rateKey, {
      limit: 100,
      windowMs: 60 * 1000
    })

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'Retry-After': rateCheck.retryAfter.toString(),
            'X-RateLimit-Limit': rateCheck.limit.toString(),
            'X-RateLimit-Remaining': rateCheck.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateCheck.resetAt).toISOString()
          }
        }
      )
    }

    // ✅ REQUEST SIZE LIMIT (1MB)
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json(
        { error: 'Request payload too large (max 1MB)' },
        { status: 413 }
      )
    }

    // Fetch webhook configuration
    const webhook = await getWorkflowWebhookByKey(key)

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    if (!webhook.is_active) {
      return NextResponse.json(
        { error: 'Webhook is disabled' },
        { status: 403 }
      )
    }

    let parsedBody

    // ✅ ENHANCED AUTHENTICATION
    if (webhook.requires_auth) {
      const authHeader = request.headers.get('authorization')
      const signature = request.headers.get('x-webhook-signature')

      if (signature) {
        // HMAC signature verification
        const body = await request.text()
        const expectedSignature = crypto
          .createHmac('sha256', webhook.auth_token)
          .update(body)
          .digest('hex')

        if (signature !== expectedSignature) {
          return NextResponse.json(
            {
              error: 'Invalid signature',
              message: 'Webhook signature verification failed'
            },
            { status: 401 }
          )
        }

        try {
          parsedBody = JSON.parse(body)
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400 }
          )
        }
      } else if (authHeader) {
        // Bearer token authentication
        const token = authHeader.replace('Bearer ', '')
        if (token !== webhook.auth_token) {
          return NextResponse.json(
            { error: 'Unauthorized - Invalid token' },
            { status: 401 }
          )
        }

        try {
          parsedBody = await request.json()
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message:
              'Authentication required. Provide either Authorization header or X-Webhook-Signature'
          },
          { status: 401 }
        )
      }
    } else {
      // No authentication required
      try {
        parsedBody = await request.json()
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid JSON payload' },
          { status: 400 }
        )
      }
    }

    // ✅ ASYNC EXECUTION - Queue the workflow
    const task = await createTask({
      task_type: 'execute_workflow',
      payload: {
        workflowId: webhook.workflow_id,
        triggerData: {
          ...parsedBody,
          trigger_type: 'webhook',
          webhook_key: key,
          timestamp: new Date().toISOString(),
          headers: {
            'user-agent': request.headers.get('user-agent'),
            'content-type': request.headers.get('content-type')
          }
        }
      },
      priority: 5
    })

    const responseTime = Date.now() - startTime

    return NextResponse.json(
      {
        success: true,
        message: 'Workflow execution queued',
        taskId: task.id,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      },
      {
        headers: {
          'X-RateLimit-Limit': rateCheck.limit.toString(),
          'X-RateLimit-Remaining': rateCheck.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateCheck.resetAt).toISOString(),
          'X-Response-Time': `${responseTime}ms`
        }
      }
    )
  } catch (error) {
    console.error('Webhook trigger error:', error)

    const responseTime = Date.now() - startTime

    return NextResponse.json(
      {
        error: 'Internal server error',
        message:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      },
      {
        status: 500,
        headers: {
          'X-Response-Time': `${responseTime}ms`
        }
      }
    )
  }
}

/*
 * WEBHOOK AUTHENTICATION EXAMPLES:
 *
 * 1. Bearer Token:
 *    curl -X POST https://your-domain.com/api/webhook/your-key \
 *      -H "Authorization: Bearer your-secret-token" \
 *      -H "Content-Type: application/json" \
 *      -d '{"data": "your data"}'
 *
 * 2. HMAC Signature:
 *    curl -X POST https://your-domain.com/api/webhook/your-key \
 *      -H "X-Webhook-Signature: computed-hmac-signature" \
 *      -H "Content-Type: application/json" \
 *      -d '{"data": "your data"}'
 *
 *    To compute signature:
 *    const signature = crypto
 *      .createHmac('sha256', 'your-secret-token')
 *      .update(JSON.stringify(payload))
 *      .digest('hex')
 */