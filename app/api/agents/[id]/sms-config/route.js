/**
 * SMS CONFIGURATION API
 * Manages SMS bot configuration for agents
 * 
 * Routes:
 * GET /api/agents/[id]/sms-config - Get SMS configuration
 * POST /api/agents/[id]/sms-config - Create SMS configuration
 * PUT /api/agents/[id]/sms-config - Update SMS configuration
 * DELETE /api/agents/[id]/sms-config - Delete SMS configuration
 */

import { NextResponse } from 'next/server'
import { 
  getSmsConfigByAgentId,
  createSmsConfig,
  updateSmsConfig,
  deleteSmsConfig,
  testSmsConnection
} from '../../../../../lib/sms/sms-db'
import { getAgent } from '../../../../actions/agents'
import crypto from 'crypto'

// GET - Fetch SMS configuration
export async function GET(request, context) {
  try {
    const params = await context.params
    const { id: agentId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Verify agent ownership
    const agent = await getAgent(agentId, userId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    const smsConfig = await getSmsConfigByAgentId(agentId)
    
    if (!smsConfig) {
      return NextResponse.json(
        { 
          exists: false,
          message: 'No SMS configuration found' 
        },
        { status: 404 }
      )
    }
    
    // Don't send sensitive data to frontend
    const safeConfig = {
      id: smsConfig.id,
      agent_id: smsConfig.agent_id,
      provider: smsConfig.provider,
      is_active: smsConfig.is_active,
      webhook_url: smsConfig.webhook_url,
      
      // Mask sensitive data
      twilio_phone_number: smsConfig.twilio_phone_number,
      msg91_sender_id: smsConfig.msg91_sender_id,
      textlocal_sender: smsConfig.textlocal_sender,
      
      // Settings
      auto_reply_enabled: smsConfig.auto_reply_enabled,
      greeting_message: smsConfig.greeting_message,
      fallback_message: smsConfig.fallback_message,
      max_response_length: smsConfig.max_response_length,
      rate_limit_per_number: smsConfig.rate_limit_per_number,
      
      // Analytics
      total_messages_received: smsConfig.total_messages_received,
      total_messages_sent: smsConfig.total_messages_sent,
      
      created_at: smsConfig.created_at,
      updated_at: smsConfig.updated_at
    }
    
    return NextResponse.json(safeConfig)
    
  } catch (error) {
    console.error('Error fetching SMS config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SMS configuration' },
      { status: 500 }
    )
  }
}

// POST - Create SMS configuration
export async function POST(request, context) {
  try {
    const params = await context.params
    const { id: agentId } = params
    const body = await request.json()
    const { userId, provider, config, settings } = body
    
    // Verify agent ownership
    const agent = await getAgent(agentId, userId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Check if config already exists
    const existingConfig = await getSmsConfigByAgentId(agentId)
    if (existingConfig) {
      return NextResponse.json(
        { error: 'SMS configuration already exists. Use PUT to update.' },
        { status: 409 }
      )
    }
    
    // Validate provider
    const validProviders = ['twilio', 'msg91', 'textlocal', 'gupshup']
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      )
    }
    
    // Generate webhook secret
    const webhookSecret = crypto.randomBytes(32).toString('hex')
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/sms/webhook/${webhookSecret}`
    
    // Prepare config data
    const smsConfigData = {
      agent_id: agentId,
      user_id: userId,
      provider: provider,
      webhook_secret: webhookSecret,
      webhook_url: webhookUrl,
      is_active: false, // Start as inactive until tested
      
      // Provider-specific config
      ...(provider === 'twilio' && {
        twilio_account_sid: config.accountSid,
        twilio_auth_token: config.authToken,
        twilio_phone_number: config.phoneNumber
      }),
      
      ...(provider === 'msg91' && {
        msg91_auth_key: config.authKey,
        msg91_sender_id: config.senderId,
        msg91_route: config.route || 'transactional'
      }),
      
      ...(provider === 'textlocal' && {
        textlocal_api_key: config.apiKey,
        textlocal_sender: config.sender
      }),
      
      ...(provider === 'gupshup' && {
        gupshup_api_key: config.apiKey,
        gupshup_app_id: config.appId
      }),
      
      // Settings
      auto_reply_enabled: settings?.autoReply ?? true,
      greeting_message: settings?.greetingMessage || 'Hello! I\'m your AI assistant. How can I help you today?',
      fallback_message: settings?.fallbackMessage || 'I\'m sorry, I didn\'t understand that. Can you please rephrase?',
      max_response_length: settings?.maxResponseLength || 1600,
      rate_limit_per_number: settings?.rateLimit || 10
    }
    
    const newConfig = await createSmsConfig(smsConfigData)
    
    return NextResponse.json({
      success: true,
      config: {
        id: newConfig.id,
        webhook_url: webhookUrl,
        provider: provider
      },
      message: 'SMS configuration created successfully. Please test the connection before activating.'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating SMS config:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create SMS configuration',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// PUT - Update SMS configuration
export async function PUT(request, context) {
  try {
    const params = await context.params
    const { id: agentId } = params
    const body = await request.json()
    const { userId, config, settings, isActive } = body
    
    // Verify agent ownership
    const agent = await getAgent(agentId, userId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Get existing config
    const existingConfig = await getSmsConfigByAgentId(agentId)
    if (!existingConfig) {
      return NextResponse.json(
        { error: 'SMS configuration not found' },
        { status: 404 }
      )
    }
    
    // Prepare update data
    const updateData = {}
    
    // Update provider config if provided
    if (config) {
      if (existingConfig.provider === 'twilio') {
        if (config.accountSid) updateData.twilio_account_sid = config.accountSid
        if (config.authToken) updateData.twilio_auth_token = config.authToken
        if (config.phoneNumber) updateData.twilio_phone_number = config.phoneNumber
      } else if (existingConfig.provider === 'msg91') {
        if (config.authKey) updateData.msg91_auth_key = config.authKey
        if (config.senderId) updateData.msg91_sender_id = config.senderId
        if (config.route) updateData.msg91_route = config.route
      } else if (existingConfig.provider === 'textlocal') {
        if (config.apiKey) updateData.textlocal_api_key = config.apiKey
        if (config.sender) updateData.textlocal_sender = config.sender
      } else if (existingConfig.provider === 'gupshup') {
        if (config.apiKey) updateData.gupshup_api_key = config.apiKey
        if (config.appId) updateData.gupshup_app_id = config.appId
      }
    }
    
    // Update settings if provided
    if (settings) {
      if (settings.autoReply !== undefined) updateData.auto_reply_enabled = settings.autoReply
      if (settings.greetingMessage) updateData.greeting_message = settings.greetingMessage
      if (settings.fallbackMessage) updateData.fallback_message = settings.fallbackMessage
      if (settings.maxResponseLength) updateData.max_response_length = settings.maxResponseLength
      if (settings.rateLimit) updateData.rate_limit_per_number = settings.rateLimit
    }
    
    // Update active status if provided
    if (isActive !== undefined) {
      updateData.is_active = isActive
    }
    
    await updateSmsConfig(existingConfig.id, updateData)
    
    return NextResponse.json({
      success: true,
      message: 'SMS configuration updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating SMS config:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update SMS configuration',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete SMS configuration
export async function DELETE(request, context) {
  try {
    const params = await context.params
    const { id: agentId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Verify agent ownership
    const agent = await getAgent(agentId, userId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Get existing config
    const existingConfig = await getSmsConfigByAgentId(agentId)
    if (!existingConfig) {
      return NextResponse.json(
        { error: 'SMS configuration not found' },
        { status: 404 }
      )
    }
    
    await deleteSmsConfig(existingConfig.id)
    
    return NextResponse.json({
      success: true,
      message: 'SMS configuration deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting SMS config:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete SMS configuration',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
