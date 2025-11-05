import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  parseWithAI,
  validateAgentConfig
} from '../../../../lib/nlp/ai-agent-parser'
import { parseAgentDescription } from '../../../../lib/nlp/agent-parser'
import {
  createNlpRequest,
  updateNlpRequest,
  createParsingHistory,
  findTemplateByKeywords
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

    const { description, useAI = true } = await request.json()

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Create NLP request record
    const nlpRequest = await createNlpRequest(session.user.id, description)

    let parsedConfig
    let parsingMethod = 'rule-based'
    let tokensUsed = 0

    // Try AI parsing first if enabled and API key available
    // UPDATED: Use OpenAI API key instead of Anthropic
    if (useAI && process.env.OPENAI_API_KEY) {
      await updateNlpRequest(nlpRequest.id, { status: 'processing' })

      const aiResult = await parseWithAI(
        description,
        process.env.OPENAI_API_KEY
      )

      if (aiResult.success) {
        parsedConfig = aiResult.config
        parsingMethod = 'ai'
        tokensUsed = aiResult.tokensUsed

        // Log AI parsing
        await createParsingHistory({
          request_id: nlpRequest.id,
          stage: 'intent_extraction',
          input_text: description,
          output_data: parsedConfig,
          model_used: aiResult.model,
          tokens_used: tokensUsed,
          confidence_score: parsedConfig.metadata?.confidence || 0.85
        })
      } else {
        // Fallback to rule-based
        parsedConfig = parseAgentDescription(description)
        parsingMethod = 'rule-based-fallback'
      }
    } else {
      // Use rule-based parser
      parsedConfig = parseAgentDescription(description)
    }

    // Find matching template
    const keywords = description
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
    const templates = await findTemplateByKeywords(keywords)
    const matchedTemplate = templates[0] || null

    // Validate configuration
    const validation = validateAgentConfig(parsedConfig)

    if (!validation.valid) {
      await updateNlpRequest(nlpRequest.id, {
        status: 'failed',
        error_message: validation.errors.join('; ')
      })

      return NextResponse.json(
        {
          error: 'Configuration validation failed',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    // Update request with results
    // UPDATED: Use actual OpenAI model name from parsing
    await updateNlpRequest(nlpRequest.id, {
      status: 'completed',
      parsed_intent: {
        agentType: parsedConfig.agentType,
        category: parsedConfig.metadata?.category,
        confidence: parsedConfig.metadata?.confidence
      },
      extracted_config: validation.sanitizedConfig,
      processed_at: new Date().toISOString(),
      model_used: parsingMethod === 'ai' ? validation.sanitizedConfig.model : 'rule-based'
    })

    return NextResponse.json({
      success: true,
      requestId: nlpRequest.id,
      config: validation.sanitizedConfig,
      matchedTemplate,
      parsingMethod,
      tokensUsed,
      confidence: parsedConfig.metadata?.confidence || 0.75
    })
  } catch (error) {
    console.error('NLP parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse agent description', details: error.message },
      { status: 500 }
    )
  }
}