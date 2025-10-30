/**
 * COMPLETE CHAT ROUTE WITH FIXED BOOKING INTEGRATION
 * All original features (actions, caching, rate limiting, credits) + booking fixes
 *
 * KEY FIXES:
 * 1. Added isConfirmationIntent() detection
 * 2. Proper data accumulation across messages
 * 3. Explicit confirmation handling
 * 4. State persistence in conversation metadata
 */

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkRateLimit } from '../../../../../lib/api/rate-limiter'
import { BookingParser } from '../../../../../lib/booking/booking-utils'
import {
  deductCredits,
  getAgent,
  hasCredits,
  logAnalytics,
  saveConversation,
  checkConversationExists,
  getConversations,
  getKnowledgeSources,
  getAgentCalendar
} from '../../../../actions/agents'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
  maxRetries: 2
})

// Cache and rate limiting
const agentCache = new Map()
const AGENT_CACHE_TTL = 5 * 60 * 1000

function getCachedAgent(agentId) {
  const cached = agentCache.get(agentId)
  if (cached && Date.now() - cached.timestamp < AGENT_CACHE_TTL) {
    return cached.data
  }
  return null
}

function setCachedAgent(agentId, data) {
  agentCache.set(agentId, { data, timestamp: Date.now() })
}

// MAIN POST HANDLER
export async function POST(request, context) {
  const startTime = Date.now()
  let body
  const params = await context.params
  const { id: agentId } = params

  try {
    body = await request.json()
    const { message, sessionId, userId, metadata = {} } = body

    // 1. Fast-fail validation
    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message too long. Maximum 5000 characters.' },
        { status: 400 }
      )
    }

    // 2. Rate limiting
    const rateKey = `chat:${userId || sessionId}`
    const rateCheck = checkRateLimit(rateKey, {
      limit: process.env.CHAT_RATE_LIMIT || 20,
      windowMs: 60 * 1000
    })

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
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

    // 3. Parallel data fetching
    const [
      agent,
      existingConversations,
      recentConversations,
      knowledgeSources,
      creditCheck,
      agentCalendar
    ] = await Promise.all([
      (async () => {
        const cached = getCachedAgent(agentId)
        if (cached) return cached
        const freshAgent = await getAgent(agentId, userId)
        if (freshAgent) setCachedAgent(agentId, freshAgent)
        return freshAgent
      })(),
      checkConversationExists(agentId, sessionId),
      getConversations(agentId, sessionId, 10),
      getKnowledgeSources(agentId),
      userId ? hasCredits(userId, 1) : Promise.resolve(true),
      getAgentCalendar(agentId)
    ])

    // 4. Fast-fail checks
    if (!agent) {
      return NextResponse.json(
        { error: `Agent ${agentId} not found` },
        { status: 404 }
      )
    }

    if (!agent.is_active) {
      return NextResponse.json(
        { error: 'Agent is currently inactive' },
        { status: 400 }
      )
    }

    if (userId && !creditCheck) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      )
    }

    // ============================================================
    // 5. FIXED BOOKING SYSTEM INTEGRATION
    // ============================================================

    let bookingContext = null
    let isBookingFlow = false

    // **FIX #1: Check for confirmation intent**
    const isConfirmation = BookingParser.isConfirmationIntent(message)

    // Get accumulated booking data from previous messages
    const recentBookingMessages = recentConversations
      .filter((conv) => conv.metadata?.booking_context)
      .slice(0, 3)

    const wasInBookingFlow = recentBookingMessages.length > 0
    const lastBookingContext =
      recentBookingMessages[0]?.metadata?.booking_context

    // **FIX #2: Get accumulated booking data**
    let accumulatedData = lastBookingContext?.extractedData || {
      date: null,
      time: null,
      timezone: null,
      name: null,
      email: null,
      phone: null,
      notes: null
    }

    // Check if current message is booking-related (now includes confirmations)
    const currentMessageIsBooking = BookingParser.isBookingIntent(message)

    // Enhanced debug logging
    console.log('=== BOOKING DEBUG ===')
    console.log('Message:', message)
    console.log('Agent Calendar:', agentCalendar ? 'EXISTS' : 'NULL')
    console.log('Calendar Active:', agentCalendar?.is_active)
    console.log('Is Booking Intent:', currentMessageIsBooking)
    console.log('Is Confirmation:', isConfirmation)
    console.log('Was In Booking Flow:', wasInBookingFlow)
    console.log('Last Booking Complete:', lastBookingContext?.isComplete)
    console.log('Last Booking Created:', lastBookingContext?.bookingCreated)
    console.log('💾 Accumulated Data:', accumulatedData)

    // Enter booking flow if:
    // 1. Calendar is active AND current message has booking intent
    // 2. OR we were in a booking flow and it's not complete yet
    if (
      agentCalendar?.is_active &&
      (currentMessageIsBooking ||
        (wasInBookingFlow &&
          !lastBookingContext?.isComplete &&
          !lastBookingContext?.bookingCreated))
    ) {
      isBookingFlow = true

      // **FIX #3: Parse current message and merge with accumulated data**
      const parser = new BookingParser()
      const bookingData = parser.parseBookingRequest(message)

      let newDataCollected = false

      // Merge new data with accumulated data
      if (bookingData.date) {
        accumulatedData.date = bookingData.date
        newDataCollected = true
      }
      if (bookingData.time) {
        accumulatedData.time = bookingData.time
        newDataCollected = true
      }
      if (bookingData.timezone) {
        accumulatedData.timezone = bookingData.timezone
        newDataCollected = true
      }
      if (bookingData.name) {
        accumulatedData.name = bookingData.name
        newDataCollected = true
      }
      if (bookingData.email) {
        accumulatedData.email = bookingData.email
        newDataCollected = true
      }
      if (bookingData.phone) {
        accumulatedData.phone = bookingData.phone
        newDataCollected = true
      }
      if (bookingData.notes) {
        accumulatedData.notes = bookingData.notes
        newDataCollected = true
      }

      console.log('📊 New data collected:', newDataCollected)
      console.log('📝 Updated accumulated data:', accumulatedData)

      // **FIX #4: Check completeness with accumulated data**
      const required = ['date', 'time', 'name', 'email']
      const isComplete = required.every(
        (field) => accumulatedData[field] !== null
      )

      console.log('✅ Has All Required Data:', isComplete)

      // Store parsed data in session
      bookingContext = {
        isBookingFlow: true,
        extractedData: accumulatedData,
        isComplete: isComplete,
        confidence: bookingData.confidence,
        calendarConfig: {
          integration_type: agentCalendar.integration_type,
          calendly_url: agentCalendar.calendly_url,
          booking_duration: agentCalendar.booking_duration
        }
      }

      // **FIX #5: Create booking on confirmation OR when data is complete**
      const shouldCreateBooking =
        isComplete &&
        (isConfirmation ||
          (newDataCollected && !lastBookingContext?.bookingCreated))

      console.log('🚀 Should Create Booking:', shouldCreateBooking)

      if (shouldCreateBooking) {
        console.log('📝 Creating booking with data:', accumulatedData)

        try {
          // Create booking via internal API
          const bookingResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/agents/${agentId}/bookings`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                date: accumulatedData.date,
                time: accumulatedData.time,
                timezone: accumulatedData.timezone || 'UTC',
                customer_name: accumulatedData.name,
                customer_email: accumulatedData.email,
                customer_phone: accumulatedData.phone,
                customer_notes: accumulatedData.notes,
                session_id: sessionId,
                duration_minutes: agentCalendar.booking_duration
              })
            }
          )

          const bookingResult = await bookingResponse.json()

          if (bookingResponse.ok) {
            bookingContext.bookingCreated = true
            bookingContext.bookingId = bookingResult.booking.id
            bookingContext.externalUrl = bookingResult.booking.external_url
            console.log(
              '✅ Booking created successfully:',
              bookingResult.booking
            )
          } else {
            bookingContext.bookingError = bookingResult.error
            console.error('❌ Booking creation failed:', bookingResult.error)
          }
        } catch (error) {
          console.error('❌ Booking API error:', error)
          bookingContext.bookingError = 'Failed to create booking'
        }
      }
    }

    // ============================================================
    // 6. BUILD SYSTEM PROMPT WITH BOOKING CONTEXT
    // ============================================================

    let systemPrompt = generateSystemPrompt(
      agent,
      knowledgeSources,
      agentCalendar
    )

    // Add booking-specific instructions if in booking flow
    if (isBookingFlow) {
      systemPrompt += `\n\n=== BOOKING FLOW ACTIVE ===
Current booking data extracted:
${JSON.stringify(bookingContext.extractedData, null, 2)}

Completion status: ${bookingContext.isComplete ? 'COMPLETE' : 'INCOMPLETE'}
Confidence: ${(bookingContext.confidence * 100).toFixed(0)}%

${
  !bookingContext.isComplete
    ? `
MISSING INFORMATION:
${!bookingContext.extractedData.date ? '- Date (ask for specific date or day of week)\n' : ''}
${!bookingContext.extractedData.time ? '- Time (ask for preferred time)\n' : ''}
${!bookingContext.extractedData.name ? '- Full name\n' : ''}
${!bookingContext.extractedData.email ? '- Email address\n' : ''}

INSTRUCTIONS: Ask for the missing information naturally, one or two items at a time. Be conversational and helpful.
`
    : ''
}

${
  bookingContext.isComplete && !bookingContext.bookingCreated
    ? `
ALL INFORMATION COLLECTED! 
Please confirm all the details with the user and ask them to confirm before proceeding with the booking.

Details to confirm:
- Date: ${bookingContext.extractedData.date}
- Time: ${bookingContext.extractedData.time}
- Name: ${bookingContext.extractedData.name}
- Email: ${bookingContext.extractedData.email}
${bookingContext.extractedData.phone ? `- Phone: ${bookingContext.extractedData.phone}\n` : ''}
${bookingContext.extractedData.notes ? `- Notes: ${bookingContext.extractedData.notes}\n` : ''}
`
    : ''
}

${
  bookingContext.bookingCreated
    ? `
✅ BOOKING CONFIRMED!
Booking ID: ${bookingContext.bookingId}
${bookingContext.externalUrl ? `External booking URL: ${bookingContext.externalUrl}\n` : ''}

INSTRUCTIONS: Confirm the booking details and provide next steps. If there's an external URL (Calendly), guide them to complete the booking there. Thank them for booking!
`
    : ''
}

${
  bookingContext.bookingError
    ? `
⚠️ BOOKING ERROR: ${bookingContext.bookingError}

INSTRUCTIONS: Apologize for the issue and suggest alternative times or ask them to try again.
`
    : ''
}
`
    }

    // ============================================================
    // 7. BUILD CONVERSATION HISTORY
    // ============================================================

    const conversationHistory = recentConversations
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .flatMap((conv) => [
        { role: 'user', content: conv.user_message },
        { role: 'assistant', content: conv.agent_response }
      ])

    // ============================================================
    // 8. CALL OPENAI
    // ============================================================

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10),
        { role: 'user', content: message }
      ],
      temperature: agent.temperature || 0.7,
      max_tokens: agent.max_tokens || 1000,
      frequency_penalty: 0.3,
      user: sessionId,
      stream: false
    })

    const agentResponse =
      completion.choices[0]?.message?.content ||
      'I apologize, but I could not generate a response at this time.'

    const tokensUsage = completion.usage
    const tokensUsed = completion.usage?.total_tokens || 0
    const responseTime = Date.now() - startTime

    // ============================================================
    // 9. SAVE CONVERSATION WITH BOOKING METADATA
    // ============================================================

    const conversationMetadata = {
      ...metadata,
      model: 'gpt-4o-mini',
      tokens_used: tokensUsed,
      tokens_usage_metadata: tokensUsage,
      response_time_ms: responseTime,
      user_id: userId
    }

    if (bookingContext) {
      conversationMetadata.booking_context = bookingContext
    }

    const conversation = await saveConversation(
      agentId,
      sessionId,
      message,
      agentResponse,
      conversationMetadata
    )

    // Link booking to conversation if created
    if (bookingContext?.bookingCreated && conversation?.id) {
      try {
        await linkBookingToConversation(
          bookingContext.bookingId,
          conversation.id,
          bookingContext.extractedData,
          bookingContext.confidence
        )
      } catch (linkError) {
        console.error('Error linking booking to conversation:', linkError)
        // Don't fail the request if linking fails
      }
    }

    // ============================================================
    // 10. ANALYTICS AND CREDITS
    // ============================================================

    Promise.all([
      logAnalytics(
        agentId,
        isBookingFlow ? 'booking_interaction' : 'conversation',
        {
          session_id: sessionId,
          user_id: userId,
          message_length: message.length,
          response_length: agentResponse.length,
          response_time_ms: responseTime,
          booking_flow: isBookingFlow,
          booking_complete: bookingContext?.isComplete || false,
          booking_created: bookingContext?.bookingCreated || false
        },
        tokensUsed,
        true
      ),
      userId ? deductCredits(userId, 1) : Promise.resolve()
    ]).catch((err) => console.error('Background task error:', err))

    // ============================================================
    // 11. RETURN RESPONSE WITH BOOKING INFO
    // ============================================================

    return NextResponse.json(
      {
        response: agentResponse,
        conversationId: conversation?.id,
        tokensUsed,
        responseTimeMs: responseTime,
        agentId,
        timestamp: new Date().toISOString(),
        bookingContext: bookingContext
          ? {
              isBookingFlow: bookingContext.isBookingFlow,
              isComplete: bookingContext.isComplete,
              confidence: bookingContext.confidence,
              bookingCreated: bookingContext.bookingCreated,
              bookingId: bookingContext.bookingId,
              externalUrl: bookingContext.externalUrl,
              extractedData: bookingContext.extractedData
            }
          : null
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-Response-Time': `${responseTime}ms`,
          'X-Tokens-Used': tokensUsed.toString()
        }
      }
    )
  } catch (error) {
    console.error('Chat API error:', error)

    const session_id = body?.sessionId
    const user_id = body?.userId
    const responseTime = Date.now() - startTime

    logAnalytics(
      agentId,
      'conversation',
      {
        error: error.message,
        error_type: error.constructor.name,
        session_id,
        user_id,
        response_time_ms: responseTime
      },
      0,
      false
    ).catch(() => {})

    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Service temporarily busy. Please try again in a moment.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    if (error.status === 401 || error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Service configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// GET handler
export async function GET(request, context) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const conversations = await getConversations(id, sessionId, limit)

    return NextResponse.json(
      {
        conversations,
        count: conversations.length,
        sessionId
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=10',
          'X-Total-Count': conversations.length.toString()
        }
      }
    )
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation history' },
      { status: 500 }
    )
  }
}

// Helper function to generate system prompt
function generateSystemPrompt(agent, knowledgeSources, agentCalendar) {
  const purposeInstructions = {
    instagram:
      'You are an Instagram DM assistant. Respond professionally and help users with their inquiries.',
    messenger:
      'You are a Messenger chatbot. Provide helpful responses and guide users.',
    calendar:
      'You are a calendar booking assistant. Help users schedule appointments efficiently and professionally.',
    website:
      'You are a website customer support agent. Answer questions and provide assistance.',
    general:
      'You are a helpful AI assistant. Provide accurate and useful information.'
  }

  const toneAdjustments = {
    friendly: 'Use a warm, approachable, and friendly tone.',
    professional: 'Maintain a formal and business-like tone.',
    casual: 'Use a relaxed and conversational tone.',
    enthusiastic: 'Be energetic, excited, and positive.',
    helpful: 'Focus on being solution-oriented and supportive.'
  }

  let prompt = `You are ${agent?.name}, an AI assistant. ${purposeInstructions[agent?.purpose] || purposeInstructions.general}

${toneAdjustments[agent?.tone] || toneAdjustments.friendly}

${agent?.persona ? `Your personality: ${agent?.persona}\n` : ''}`

  if (agentCalendar?.is_active) {
    prompt += `\n\n=== CALENDAR BOOKING CAPABILITIES ===
You have access to a calendar booking system with the following configuration:
- Integration: ${agentCalendar.integration_type}
- Default duration: ${agentCalendar.booking_duration} minutes
- Timezone: ${agentCalendar.timezone}
${agentCalendar.calendly_url ? `- Calendly URL: ${agentCalendar.calendly_url}\n` : ''}

When users want to schedule appointments:
1. Ask for their preferred date and time naturally
2. Collect their name and email address
3. Ask for phone number if needed
4. Confirm all details before finalizing

Be conversational and helpful throughout the booking process.
`
  }

  if (knowledgeSources && knowledgeSources.length > 0) {
    const knowledgeContext = knowledgeSources
      .map((source) => `${source.file_name || 'Knowledge'}:\n${source.content}`)
      .join('\n\n')
    prompt += `\n\nKnowledge Base:\n${knowledgeContext}\n\nUse this information to answer questions accurately.`
  }

  if (agent?.system_prompt) {
    prompt += `\n\nAdditional Instructions:\n${agent.system_prompt}`
  }

  return prompt
}

// Helper function to link booking to conversation
async function linkBookingToConversation(
  bookingId,
  conversationId,
  extractedData,
  confidence
) {
  try {
    // You can implement this to update the booking record with conversation details
    // Or create a separate linking table if needed
    console.log(
      `Linking booking ${bookingId} to conversation ${conversationId}`
    )

    // Example implementation (adjust based on your database schema):
    // await supabase
    //   .from('bookings')
    //   .update({
    //     conversation_id: conversationId,
    //     booking_metadata: { extractedData, confidence }
    //   })
    //   .eq('id', bookingId)

    return true
  } catch (error) {
    console.error('Error in linkBookingToConversation:', error)
    throw error
  }
}
