/**
 * SMS TEST API
 * Test SMS connection and send test messages
 * 
 * Route: POST /api/agents/[id]/sms-config/test
 */

import { NextResponse } from 'next/server'
import { getSmsConfigByAgentId } from '../../../../../../lib/sms/sms-db'
import { sendSms, testProviderConnection } from '../../../../../../lib/sms/sms-providers'
import { getAgent } from '../../../../../actions/agents'

export async function POST(request, context) {
  try {
    const params = await context.params
    const { id: agentId } = params
    const body = await request.json()
    const { userId, testPhoneNumber, testType = 'connection' } = body
    
    // Verify agent ownership
    const agent = await getAgent(agentId, userId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Get SMS config
    const smsConfig = await getSmsConfigByAgentId(agentId)
    if (!smsConfig) {
      return NextResponse.json(
        { error: 'SMS configuration not found' },
        { status: 404 }
      )
    }
    
    if (testType === 'connection') {
      // Test provider connection
      const result = await testProviderConnection(smsConfig)
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Connection test successful',
          provider: smsConfig.provider,
          details: result.details
        })
      } else {
        return NextResponse.json({
          success: false,
          error: result.error,
          details: result.details
        }, { status: 400 })
      }
      
    } else if (testType === 'message') {
      // Send test SMS
      if (!testPhoneNumber) {
        return NextResponse.json(
          { error: 'Test phone number is required' },
          { status: 400 }
        )
      }
      
      const testMessage = `Test message from ${agent.name}! Your SMS bot is working correctly. 🎉`
      
      const result = await sendSms(smsConfig, testPhoneNumber, testMessage)
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Test SMS sent successfully',
          messageSid: result.messageSid,
          phoneNumber: testPhoneNumber
        })
      } else {
        return NextResponse.json({
          success: false,
          error: result.error,
          details: result.details
        }, { status: 400 })
      }
      
    } else {
      return NextResponse.json(
        { error: 'Invalid test type' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('SMS test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Test failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}