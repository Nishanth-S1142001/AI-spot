import { NextResponse } from 'next/server'
 
import { getWorkflowWebhookByKey, createTask } from '../../../actions/agents'
export async function POST(request, { params }) {
  const { key } = params

  try {
    const webhook = await getWorkflowWebhookByKey(key)

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    if (!webhook.is_active) {
      return NextResponse.json({ error: 'Webhook is disabled' }, { status: 403 })
    }

    // Check authentication
    if (webhook.requires_auth) {
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')

      if (token !== webhook.auth_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Parse request body
    const body = await request.json()

    // Create task to execute workflow (async)
    await createTask({
      task_type: 'execute_workflow',
      payload: {
        workflowId: webhook.workflow_id,
        triggerData: {
          ...body,
          trigger_type: 'webhook',
          webhook_key: key
        }
      },
      priority: 5
    })

    return NextResponse.json({ 
      success: true,
      message: 'Workflow execution queued' 
    })
  } catch (error) {
    console.error('Webhook trigger error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
