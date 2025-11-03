import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { VectorDB } from '../../../../../lib/vector/vectordb'
import { supabaseAdmin } from '../../../../lib/supabase/dbServer'
import { dbClient } from '../../../../../lib/supabase/dbClient'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * Enhanced chat endpoint with vector-based knowledge retrieval
 * POST /api/agents/[id]/chat-enhanced
 */
export async function POST(req, { params }) {
  const { id: agentId } = params

  try {
    const body = await req.json()
    const { 
      message, 
      conversationHistory = [], 
      sessionId,
      userId,
      useKnowledgeBase = true,
      knowledgeSearchThreshold = 0.7,
      knowledgeResultLimit = 3
    } = body

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get agent configuration
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    let knowledgeContext = ''
    let retrievedSources = []

    // Perform knowledge base search if enabled
    if (useKnowledgeBase) {
      try {
        const searchResults = await VectorDB.searchKnowledge(
          agentId,
          message,
          knowledgeResultLimit,
          knowledgeSearchThreshold
        )

        if (searchResults && searchResults.length > 0) {
          // Build context from search results
          knowledgeContext = '\n\n--- KNOWLEDGE BASE CONTEXT ---\n'
          knowledgeContext += 'Use the following information to answer the user\'s question accurately:\n\n'
          
          searchResults.forEach((result, index) => {
            knowledgeContext += `[Source ${index + 1}] (Relevance: ${(result.similarity * 100).toFixed(1)}%)\n`
            knowledgeContext += `${result.content}\n\n`
            
            retrievedSources.push({
              sourceId: result.knowledge_source_id,
              similarity: result.similarity,
              metadata: result.metadata
            })
          })
          
          knowledgeContext += '--- END KNOWLEDGE BASE CONTEXT ---\n\n'
        }
      } catch (searchError) {
        console.error('Knowledge base search error:', searchError)
        // Continue without knowledge base if search fails
      }
    }

    // Construct system prompt with knowledge context
    const systemPrompt = agent.system_prompt || 'You are a helpful AI assistant.'
    const enhancedSystemPrompt = knowledgeContext 
      ? `${systemPrompt}\n\n${knowledgeContext}\nIMPORTANT: When using information from the knowledge base, cite your sources by mentioning "According to the provided information" or "Based on the knowledge base".`
      : systemPrompt

    // Build messages array for OpenAI
    const messages = [
      {
        role: 'system',
        content: enhancedSystemPrompt
      },
      // Add conversation history
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      // Add current message
      {
        role: 'user',
        content: message
      }
    ]

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: agent.model || 'gpt-4o-mini',
      messages,
      temperature: agent.temperature || 0.7,
      max_tokens: agent.max_tokens || 1000
    })

    const assistantMessage = completion.choices[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      )
    }

    // Log conversation
    try {
      if (sessionId) {
        // Check if conversation exists
        const existingConversation = await dbClient.checkConversationExists(agentId, sessionId)
        
        if (!existingConversation || existingConversation.length === 0) {
          // Create new conversation
          await supabaseAdmin
            .from('conversations')
            .insert({
              agent_id: agentId,
              session_id: sessionId,
              user_id: userId,
              messages: [
                { role: 'user', content: message },
                { role: 'assistant', content: assistantMessage }
              ],
              metadata: {
                knowledgeUsed: retrievedSources.length > 0,
                sourceCount: retrievedSources.length
              }
            })
        } else {
          // Update existing conversation
          const conversation = existingConversation[0]
          const updatedMessages = [
            ...(conversation.messages || []),
            { role: 'user', content: message },
            { role: 'assistant', content: assistantMessage }
          ]
          
          await supabaseAdmin
            .from('conversations')
            .update({
              messages: updatedMessages,
              updated_at: new Date().toISOString()
            })
            .eq('session_id', sessionId)
            .eq('agent_id', agentId)
        }
      }

      // Log analytics
      await supabaseAdmin
        .from('analytics')
        .insert({
          agent_id: agentId,
          event_type: 'message',
          metadata: {
            messageLength: message.length,
            responseLength: assistantMessage.length,
            knowledgeUsed: retrievedSources.length > 0,
            sourceCount: retrievedSources.length,
            sessionId
          }
        })

    } catch (logError) {
      console.error('Error logging conversation:', logError)
      // Don't fail the request if logging fails
    }

    // Return response
    return NextResponse.json({
      success: true,
      response: assistantMessage,
      metadata: {
        knowledgeUsed: retrievedSources.length > 0,
        sourcesCount: retrievedSources.length,
        sources: retrievedSources,
        model: agent.model || 'gpt-4o-mini',
        tokensUsed: completion.usage?.total_tokens || 0
      }
    })

  } catch (error) {
    console.error('Error in enhanced chat:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}