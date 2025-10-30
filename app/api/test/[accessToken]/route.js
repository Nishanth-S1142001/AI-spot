// ============================================================================
// PUBLIC TEST API ROUTE (Customer-facing)
// Path: app/api/test/[accessToken]/route.js
// ============================================================================

import { NextResponse } from 'next/server'
import {
  getTestAccountByToken,
  createTestSession,
  updateTestSession,
  logTestAnalytics,
  checkTestAccountLimits
} from '../../../actions/agents'
import { parseDeviceInfo } from '../../../../lib/utils/sub-accounts'
import { createRateLimitMiddleware } from '../../../../lib/api/rate-limiter'

// Rate limiter for public testing
const testRateLimiter = createRateLimitMiddleware({
  maxRequests: 100,
  windowMs: 60000,
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'
    return `test-api:${ip}`
  }
})

// ============================================================================
// GET - Validate access token and get test account info
// ============================================================================
export async function GET(req, { params }) {
  try {
    // Rate limiting
    const rateLimitResult = await testRateLimiter(req)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    const { accessToken } = await params

    // Get test account
    const testAccount = await getTestAccountByToken(accessToken)

    if (!testAccount) {
      return NextResponse.json(
        {
          error: 'Invalid or expired test link',
          message: 'This test link is no longer valid. Please contact the sender for a new invitation.'
        },
        { status: 404 }
      )
    }

    // Check limits
    const limits = await checkTestAccountLimits(testAccount.id)

    if (!limits.isActive) {
      return NextResponse.json(
        {
          error: 'Test account is not active',
          message: 'This test account has been deactivated.'
        },
        { status: 403 }
      )
    }

    if (!limits.canCreateSession) {
      return NextResponse.json(
        {
          error: 'Session limit reached',
          message: `You have reached the maximum number of test sessions (${testAccount.max_sessions}).`
        },
        { status: 403 }
      )
    }

    // Return sanitized data (don't expose sensitive info)
    const sanitizedAccount = {
      id: testAccount.id,
      name: testAccount.name,
      agentName: testAccount.agents.name,
      agentDescription: testAccount.agents.description,
      agentPersona: testAccount.agents.persona,
      agentTone: testAccount.agents.tone,
      maxMessagesPerSession: testAccount.max_messages_per_session,
      permissions: testAccount.permissions,
      remainingSessions: limits.remainingSessions
    }

    return NextResponse.json(
      {
        testAccount: sanitizedAccount,
        message: 'Valid test link'
      },
      {
        status: 200,
        headers: {
          ...rateLimitResult.headers,
          'Cache-Control': 'private, max-age=30'
        }
      }
    )
  } catch (error) {
    console.error('Error validating test link:', error)
    return NextResponse.json(
      {
        error: 'Failed to validate test link',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Start new test session or send message
// ============================================================================
export async function POST(request, { params }) {
  try {
    // Rate limiting
    const rateLimitResult = await testRateLimiter(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    const { accessToken } = await params
    const body = await request.json()
    const { action, sessionId, message, rating, feedback } = body

    // Get test account
    const testAccount = await getTestAccountByToken(accessToken)

    if (!testAccount) {
      return NextResponse.json(
        { error: 'Invalid or expired test link' },
        { status: 404 }
      )
    }

    // Check limits
    const limits = await checkTestAccountLimits(testAccount.id)

    if (!limits.isActive) {
      return NextResponse.json(
        { error: 'Test account is not active' },
        { status: 403 }
      )
    }

    // Get device info
    const userAgent = request.headers.get('user-agent')
    const deviceInfo = parseDeviceInfo(userAgent)
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Handle different actions
    switch (action) {
      case 'start_session': {
        if (!limits.canCreateSession) {
          return NextResponse.json(
            { error: 'Session limit reached' },
            { status: 403 }
          )
        }

        // Create new session
        const newSessionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const session = await createTestSession({
          test_account_id: testAccount.id,
          agent_id: testAccount.agent_id,
          session_id: newSessionId,
          status: 'active',
          user_agent: userAgent,
          ip_address: ipAddress,
          device_type: deviceInfo.device_type,
          browser: deviceInfo.browser
        })

        // Log analytics
        await logTestAnalytics({
          test_account_id: testAccount.id,
          test_session_id: session.id,
          agent_id: testAccount.agent_id,
          event_type: 'session_started',
          event_data: {
            session_id: newSessionId,
            device_type: deviceInfo.device_type,
            browser: deviceInfo.browser
          }
        })

        return NextResponse.json(
          {
            sessionId: newSessionId,
            message: 'Session started successfully'
          },
          {
            status: 200,
            headers: rateLimitResult.headers
          }
        )
      }

      case 'send_message': {
        if (!sessionId || !message) {
          return NextResponse.json(
            { error: 'Session ID and message are required' },
            { status: 400 }
          )
        }

        const startTime = Date.now()

        // Call agent API (use your existing agent execution logic)
        let agentResponse, tokensUsed

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: testAccount.agents.model || 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: testAccount.agents.system_prompt || 'You are a helpful AI assistant.'
                },
                { role: 'user', content: message }
              ],
              temperature: testAccount.agents.temperature || 0.7,
              max_tokens: testAccount.agents.max_tokens || 1024
            })
          })

          const data = await response.json()
          agentResponse = data.choices[0].message.content
          tokensUsed = data.usage.total_tokens
        } catch (error) {
          console.error('Error calling AI:', error)
          agentResponse = '⚠️ Sorry, I encountered an error. Please try again.'
          tokensUsed = 0
        }

        const responseTime = Date.now() - startTime

        // Save conversation
        const { saveConversation } = await import('../../../actions/agents')
        await saveConversation(
          testAccount.agent_id,
          sessionId,
          message,
          agentResponse,
          {
            source: 'test',
            test_account_id: testAccount.id
          }
        )

        // Log analytics
        await logTestAnalytics({
          test_account_id: testAccount.id,
          agent_id: testAccount.agent_id,
          event_type: 'message_sent',
          event_data: {
            session_id: sessionId,
            message_length: message.length
          },
          tokens_used: tokensUsed,
          response_time_ms: responseTime
        })

        return NextResponse.json(
          {
            response: agentResponse,
            tokensUsed,
            responseTime
          },
          {
            status: 200,
            headers: rateLimitResult.headers
          }
        )
      }

      case 'end_session': {
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          )
        }

        // Find session
        const { getTestSessions } = await import('../../../actions/agents')
        const sessions = await getTestSessions(testAccount.id)
        const session = sessions.find(s => s.session_id === sessionId)

        if (session) {
          await updateTestSession(session.id, {
            status: 'completed',
            completed_at: new Date().toISOString(),
            rating,
            feedback_text: feedback
          })
        }

        // Log analytics
        await logTestAnalytics({
          test_account_id: testAccount.id,
          test_session_id: session?.id,
          agent_id: testAccount.agent_id,
          event_type: 'session_ended',
          event_data: {
            session_id: sessionId,
            rating,
            had_feedback: !!feedback
          }
        })

        return NextResponse.json(
          {
            message: 'Session ended successfully'
          },
          {
            status: 200,
            headers: rateLimitResult.headers
          }
        )
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in test API:', error)
    return NextResponse.json(
      {
        error: 'An error occurred',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}