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

      // Get the NLP request
      const nlpRequest = await getNlpRequest(requestId, session.user.id)

      if (!nlpRequest || !nlpRequest.extracted_config) {
        return NextResponse.json(
          { error: 'Invalid or incomplete NLP request' },
          { status: 400 }
        )
      }

      const config = { ...nlpRequest.extracted_config, ...customizations }

      // Create the agent
      const agentData = {
        name: config.name,
        description: config.purpose,
        model: config.model || 'claude-sonnet-4',
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1500,
        system_prompt: config.systemPrompt,
        response_format: config.responseFormat || 'text',
        tools: config.tools || [],
        metadata: {
          createdVia: 'nlp',
          nlpRequestId: requestId,
          agentType: config.agentType,
          tone: config.tone,
          features: config.features,
          integrations: config.integrations,
          constraints: config.constraints,
          examples: config.examples
        }
      }

      const agent = await createAgent(session.user.id, agentData)

      // Add knowledge sources if any
      if (config.knowledgeSources && config.knowledgeSources.length > 0) {
        for (const source of config.knowledgeSources) {
          await addKnowledgeSource(agent.id, {
            type: source.type,
            name: source.name,
            content: source.content,
            metadata: {}
          })
        }
      }

      // Create webhook if requested
      if (config.features?.includes('webhook') || customizations.createWebhook) {
        await createWebhook(agent.id, {
          webhook_key: `wh_${Math.random().toString(36).substr(2, 16)}`,
          is_active: true,
          rate_limit: 100,
          allowed_origins: ['*']
        })
      }

      // Update NLP request with agent reference
      await updateNlpRequest(requestId, {
        agent_id: agent.id,
        status: 'completed'
      })

      // Log analytics
      await logAnalytics(agent.id, 'agent_created', {
        createdVia: 'nlp',
        parsingMethod: nlpRequest.model_used
      })

      return NextResponse.json({
        success: true,
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          config: agentData
        }
      })
    } catch (error) {
      console.error('Agent creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create agent', details: error.message },
        { status: 500 }
      )
    }
  }
