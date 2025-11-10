/**
 * SMS WEBHOOK HANDLER
 * Receives incoming SMS from providers (Twilio, MSG91, TextLocal, Gupshup)
 * and processes them through the agent's AI
 * 
 * Route: /api/sms/webhook/[webhookSecret]
 */

import { NextResponse } from 'next/server'
import { getOpenAIClient } from '../../../agents/[id]/chat-helpers' // ✅ NEW IMPORT
import { getSmsConfig, saveSmsConversation, getAgent } from '../../../../../lib/sms/sms-db'
import { sendSms } from '../../../../../lib/sms/sms-providers'
import { VectorDB } from '../../../../../lib/vector/vectordb'
import { getKnowledgeSources } from '../../../../actions/agents'

// ❌ REMOVE MODULE-LEVEL OPENAI
// const openai = new OpenAI({ ... })

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map()

function checkSmsRateLimit(phoneNumber, limit = 10) {
  const now = Date.now()
  const hourAgo = now - 60 * 60 * 1000
  
  const key = phoneNumber
  const timestamps = rateLimitMap.get(key) || []
  
  // Remove old timestamps
  const recentTimestamps = timestamps.filter(t => t > hourAgo)
  
  if (recentTimestamps.length >= limit) {
    return { allowed: false, remaining: 0 }
  }
  
  // Add current timestamp
  recentTimestamps.push(now)
  rateLimitMap.set(key, recentTimestamps)
  
  return { allowed: true, remaining: limit - recentTimestamps.length }
}

// Cleanup old rate limit data every hour
setInterval(() => {
  const hourAgo = Date.now() - 60 * 60 * 1000
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const recent = timestamps.filter(t => t > hourAgo)
    if (recent.length === 0) {
      rateLimitMap.delete(key)
    } else {
      rateLimitMap.set(key, recent)
    }
  }
}, 60 * 60 * 1000)

export async function POST(request, context) {
  const startTime = Date.now()
  const params = await context.params
  const { webhookSecret } = params
  
  try {
    console.log('📱 SMS Webhook received')
    
    // Get SMS configuration by webhook secret
    const smsConfig = await getSmsConfig(webhookSecret)
    
    if (!smsConfig || !smsConfig.is_active) {
      console.error('❌ Invalid or inactive webhook')
      return NextResponse.json(
        { error: 'Invalid webhook' },
        { status: 404 }
      )
    }
    
    // Parse incoming SMS based on provider
    const incomingData = await parseSmsWebhook(request, smsConfig.provider)
    
    if (!incomingData) {
      return NextResponse.json(
        { error: 'Invalid SMS data' },
        { status: 400 }
      )
    }
    
    const { phoneNumber, messageBody, messageSid, countryCode } = incomingData
    
    console.log(`📩 SMS from ${phoneNumber}: ${messageBody}`)
    
    // Rate limiting
    const rateLimit = checkSmsRateLimit(
      phoneNumber,
      smsConfig.rate_limit_per_number
    )
    
    if (!rateLimit.allowed) {
      console.log(`⚠️ Rate limit exceeded for ${phoneNumber}`)
      
      // Save as rate limited
      await saveSmsConversation({
        agent_id: smsConfig.agent_id,
        sms_config_id: smsConfig.id,
        phone_number: phoneNumber,
        country_code: countryCode,
        message_type: 'incoming',
        message_body: messageBody,
        message_sid: messageSid,
        status: 'rate_limited',
        error_message: 'Rate limit exceeded'
      })
      
      // Send rate limit message
      await sendSms(smsConfig, phoneNumber, 
        'You have reached the message limit. Please try again later.'
      )
      
      return NextResponse.json({ 
        success: true,
        message: 'Rate limited' 
      })
    }
    
    // Save incoming message
    const incomingConversation = await saveSmsConversation({
      agent_id: smsConfig.agent_id,
      sms_config_id: smsConfig.id,
      phone_number: phoneNumber,
      country_code: countryCode,
      message_type: 'incoming',
      message_body: messageBody,
      message_sid: messageSid,
      status: 'received'
    })
    
    // Get session ID (use phone number as session identifier)
    const sessionId = `sms_${phoneNumber.replace(/[^0-9]/g, '')}`
    
    // Get agent details
    const agent = await getAgent(smsConfig.agent_id)
    
    if (!agent || !agent.is_active) {
      throw new Error('Agent not found or inactive')
    }
    
    // ============================================================
    // ✅ GET OPENAI CLIENT WITH USER/PLATFORM KEY
    // ============================================================
    
    let openaiClient, apiKeySource
    
    try {
      const result = await getOpenAIClient(smsConfig.agent_id, smsConfig.user_id)
      openaiClient = result.client
      apiKeySource = result.source
      
      console.log(`🔑 SMS bot using ${apiKeySource} API key`)
    } catch (keyError) {
      console.error('❌ Failed to get API key:', keyError)
      
      // Send error message to user
      await sendSms(
        smsConfig, 
        phoneNumber, 
        'Sorry, the service is temporarily unavailable. Please try again later.'
      )
      
      // Save error
      await saveSmsConversation({
        agent_id: smsConfig.agent_id,
        sms_config_id: smsConfig.id,
        phone_number: phoneNumber,
        country_code: countryCode,
        message_type: 'outgoing',
        message_body: 'Service error',
        status: 'failed',
        error_message: keyError.message
      })
      
      return NextResponse.json({ 
        success: false,
        error: 'API key error' 
      }, { status: 500 })
    }
    
    // Get knowledge sources
    const knowledgeSources = await getKnowledgeSources(smsConfig.agent_id)
    
    // Perform vector search if knowledge base exists
    let knowledgeContext = ''
    let vectorSearchPerformed = false
    
    if (knowledgeSources && knowledgeSources.length > 0) {
      try {
        const searchResults = await VectorDB.searchKnowledge(
          smsConfig.agent_id,
          messageBody,
          3,
          0.7
        )
        
        if (searchResults && searchResults.length > 0) {
          vectorSearchPerformed = true
          knowledgeContext = '\n\n=== KNOWLEDGE BASE CONTEXT ===\n'
          
          searchResults.forEach((result, index) => {
            knowledgeContext += `[Document ${index + 1}] ${result.metadata?.fileName || 'Document'}\n`
            knowledgeContext += `${result.content}\n\n`
          })
          
          knowledgeContext += '=== END KNOWLEDGE BASE CONTEXT ===\n\n'
        }
      } catch (error) {
        console.error('Vector search error:', error)
      }
    }
    
    // Generate AI response
    const systemPrompt = generateSmsSystemPrompt(agent, smsConfig)
    
    const messages = [
      { role: 'system', content: systemPrompt + knowledgeContext },
      { role: 'user', content: messageBody }
    ]
    
    // ✅ USE DYNAMIC CLIENT
    const completion = await openaiClient.chat.completions.create({
      model: agent.model || 'gpt-4o-mini',
      messages: messages,
      max_tokens: 300, // Keep responses concise for SMS
      temperature: agent.temperature || 0.7
    })
    
    let agentResponse = completion.choices[0]?.message?.content || smsConfig.fallback_message
    const tokensUsed = completion.usage?.total_tokens || 0
    
    // Trim response if too long
    const maxLength = smsConfig.max_response_length || 1600
    if (agentResponse.length > maxLength) {
      agentResponse = agentResponse.substring(0, maxLength - 20) + '... (truncated)'
    }
    
    // Send SMS response
    const sendResult = await sendSms(smsConfig, phoneNumber, agentResponse)
    
    // Save outgoing message
    await saveSmsConversation({
      agent_id: smsConfig.agent_id,
      sms_config_id: smsConfig.id,
      phone_number: phoneNumber,
      country_code: countryCode,
      message_type: 'outgoing',
      message_body: agentResponse,
      message_sid: sendResult.messageSid,
      tokens_used: tokensUsed,
      response_time_ms: Date.now() - startTime,
      status: sendResult.success ? 'sent' : 'failed',
      error_message: sendResult.error,
      session_id: sessionId,
      conversation_context: {
        knowledge_used: vectorSearchPerformed,
        incoming_message_id: incomingConversation.id,
        api_key_source: apiKeySource // ✅ Track key source
      }
    })
    
    console.log(`✅ SMS sent to ${phoneNumber} using ${apiKeySource} key`)
    
    return NextResponse.json({
      success: true,
      message: 'SMS processed successfully',
      responseTime: Date.now() - startTime,
      apiKeySource // ✅ Return key source
    })
    
  } catch (error) {
    console.error('❌ SMS webhook error:', error)
    
    // Handle API key errors specifically
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return NextResponse.json(
        {
          error: 'Invalid API key configuration',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      {
        error: 'Failed to process SMS',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Parse incoming SMS webhook based on provider
 */
async function parseSmsWebhook(request, provider) {
  const contentType = request.headers.get('content-type') || ''
  
  try {
    if (provider === 'twilio') {
      // Twilio sends form data
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData()
        return {
          phoneNumber: formData.get('From'),
          messageBody: formData.get('Body'),
          messageSid: formData.get('MessageSid'),
          countryCode: formData.get('FromCountry')
        }
      }
    } else if (provider === 'msg91') {
      // MSG91 sends JSON
      const data = await request.json()
      return {
        phoneNumber: data.from || data.mobile,
        messageBody: data.text || data.message,
        messageSid: data.requestId,
        countryCode: 'IN'
      }
    } else if (provider === 'textlocal') {
      // TextLocal sends JSON
      const data = await request.json()
      return {
        phoneNumber: data.sender,
        messageBody: data.message,
        messageSid: data.inNumber,
        countryCode: 'IN'
      }
    } else if (provider === 'gupshup') {
      // Gupshup sends JSON
      const data = await request.json()
      return {
        phoneNumber: data.mobile,
        messageBody: data.text,
        messageSid: data.messageId,
        countryCode: 'IN'
      }
    }
    
    return null
  } catch (error) {
    console.error('Error parsing SMS webhook:', error)
    return null
  }
}

/**
 * Generate system prompt for SMS
 */
function generateSmsSystemPrompt(agent, smsConfig) {
  return `You are ${agent.name}, an AI assistant responding via SMS.

${agent.persona || 'Be helpful, concise, and friendly.'}

IMPORTANT SMS GUIDELINES:
- Keep responses VERY SHORT and concise (under ${smsConfig.max_response_length || 1600} characters)
- Use simple language without formatting (no markdown, no special characters)
- Get straight to the point
- If a response would be too long, provide a summary and offer to provide more details
- Use line breaks sparingly
- No emojis unless specifically asked

${agent.system_prompt || ''}

Current greeting message: ${smsConfig.greeting_message || 'Hello! How can I help you?'}
`
}