import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getNlpRequest,
  updateNlpRequest,
  createAgent,
  addKnowledgeSource,
  createWebhook,
  logAnalytics
} from '../../../actions/agents'

// Map agentType to domain for compatibility with your schema
const AGENT_TYPE_TO_DOMAIN = {
  customer_support: 'supportservice',
  sales: 'sales',
  content_writer: 'creator',
  data_analyst: 'business',
  code_assistant: 'developer',
  general_assistant: 'business'
}

export async function POST(request) {
  try {
    const cookieStore = await cookies()

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId, customizations = {} } = await request.json()

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }

    // Get the NLP request
    const nlpRequest = await getNlpRequest(requestId, session.user.id)

    if (!nlpRequest || !nlpRequest.extracted_config) {
      return NextResponse.json(
        { error: 'Invalid or incomplete NLP request' },
        { status: 400 }
      )
    }

    const config = { ...nlpRequest.extracted_config, ...customizations }

    // Generate sandbox URL
    const tempId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const sandboxUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sandbox/${tempId}`

    // Map agentType to domain
    const domain = customizations.domain || 
                   AGENT_TYPE_TO_DOMAIN[config.agentType] || 
                   'business'

    // Prepare agent data with all required fields - default to GPT-4o
    const agentData = {
      name: config.name,
      description: config.purpose,
      domain: domain,
      tone: customizations.tone || config.tone || 'professional',
      model: config.model || 'gpt-4o',
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 4096,
      system_prompt: config.systemPrompt,
      response_format: config.responseFormat || 'text',
      
      // NEW FIELDS
      interface: customizations.interface || null,
      services: customizations.services || [],
      service_config: {},
      sandbox_url: sandboxUrl,
      
      // Other fields
      tools: config.tools || [],
      is_active: true, // Activate immediately since we've confirmed everything
      
      metadata: {
        createdVia: 'nlp',
        nlpRequestId: requestId,
        agentType: config.agentType,
        features: config.features,
        integrations: config.integrations,
        constraints: config.constraints,
        examples: config.examples
      }
    }

    console.log('Creating agent with data:', {
      ...agentData,
      system_prompt: agentData.system_prompt?.substring(0, 100) + '...'
    })

    // Create the agent
    const agent = await createAgent(session.user.id, agentData)

    // Update sandbox URL with actual agent ID
    const actualSandboxUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sandbox/${agent.id}`
    await updateAgent(agent.id, {
      sandbox_url: actualSandboxUrl
    })

    // Add knowledge sources if any
    if (config.knowledgeSources && config.knowledgeSources.length > 0) {
      for (const source of config.knowledgeSources) {
        try {
          await addKnowledgeSource(agent.id, {
            source_type: source.type,
            source_url: source.type === 'url' ? source.content : null,
            file_name: source.name,
            content: source.type === 'text' ? source.content : null,
            status: 'pending',
            metadata: {}
          })
        } catch (err) {
          console.error('Failed to add knowledge source:', err)
          // Continue even if one source fails
        }
      }
    }

    // Create webhook if requested
    if (config.features?.includes('webhook') || customizations.createWebhook) {
      try {
        await createWebhook(agent.id, {
          webhook_key: `wh_${Math.random().toString(36).substr(2, 16)}`,
          webhook_url: actualSandboxUrl,
          is_active: true,
          rate_limit: 100,
          allowed_origins: ['*']
        })
      } catch (err) {
        console.error('Failed to create webhook:', err)
        // Continue even if webhook creation fails
      }
    }

    // Update NLP request with agent reference
    await updateNlpRequest(requestId, {
      agent_id: agent.id,
      status: 'completed',
      processed_at: new Date().toISOString()
    })

    // Log analytics
    await logAnalytics(agent.id, 'agent_created', {
      createdVia: 'nlp',
      parsingMethod: nlpRequest.model_used,
      interface: customizations.interface,
      services: customizations.services,
      hasKnowledgeSources: config.knowledgeSources?.length > 0
    })

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        domain: agent.domain,
        interface: agent.interface,
        services: agent.services,
        sandbox_url: actualSandboxUrl,
        config: {
          model: agent.model,
          temperature: agent.temperature,
          max_tokens: agent.max_tokens,
          tone: agent.tone
        }
      }
    })
  } catch (error) {
    console.error('Agent creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create agent', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// Import updateAgent from actions
async function updateAgent(agentId, updates) {
  const { updateAgent: updateAgentAction } = await import('../../../actions/agents')
  return await updateAgentAction(agentId, updates)
}