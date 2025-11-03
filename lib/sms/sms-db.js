/**
 * SMS DATABASE OPERATIONS
 * Helper functions for SMS configuration and conversation management
 */

import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// =====================================================
// SMS CONFIGURATION OPERATIONS
// =====================================================

/**
 * Get SMS config by webhook secret
 */
export async function getSmsConfig(webhookSecret) {
  const { data, error } = await supabase
    .from('agent_sms_config')
    .select('*')
    .eq('webhook_secret', webhookSecret)
    .single()
  
  if (error) {
    console.error('Error fetching SMS config:', error)
    return null
  }
  
  return data
}

/**
 * Get SMS config by agent ID
 */
export async function getSmsConfigByAgentId(agentId) {
  const { data, error } = await supabase
    .from('agent_sms_config')
    .select('*')
    .eq('agent_id', agentId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null
    }
    console.error('Error fetching SMS config:', error)
    return null
  }
  
  return data
}

/**
 * Create SMS configuration
 */
export async function createSmsConfig(configData) {
  const { data, error } = await supabase
    .from('agent_sms_config')
    .insert(configData)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating SMS config:', error)
    throw error
  }
  
  return data
}

/**
 * Update SMS configuration
 */
export async function updateSmsConfig(configId, updates) {
  const { data, error } = await supabase
    .from('agent_sms_config')
    .update(updates)
    .eq('id', configId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating SMS config:', error)
    throw error
  }
  
  return data
}

/**
 * Delete SMS configuration
 */
export async function deleteSmsConfig(configId) {
  const { error } = await supabase
    .from('agent_sms_config')
    .delete()
    .eq('id', configId)
  
  if (error) {
    console.error('Error deleting SMS config:', error)
    throw error
  }
  
  return true
}

/**
 * Get agent details
 */
export async function getAgent(agentId) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single()
  
  if (error) {
    console.error('Error fetching agent:', error)
    return null
  }
  
  return data
}

// =====================================================
// SMS CONVERSATION OPERATIONS
// =====================================================

/**
 * Save SMS conversation
 */
export async function saveSmsConversation(conversationData) {
  const { data, error } = await supabase
    .from('sms_conversations')
    .insert(conversationData)
    .select()
    .single()
  
  if (error) {
    console.error('Error saving SMS conversation:', error)
    throw error
  }
  
  return data
}

/**
 * Get SMS conversations for an agent
 */
export async function getSmsConversations(agentId, limit = 100, offset = 0) {
  const { data, error } = await supabase
    .from('sms_conversations')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Error fetching SMS conversations:', error)
    return []
  }
  
  return data
}

/**
 * Get SMS conversations by phone number
 */
export async function getSmsConversationsByPhone(agentId, phoneNumber, limit = 50) {
  const { data, error } = await supabase
    .from('sms_conversations')
    .select('*')
    .eq('agent_id', agentId)
    .eq('phone_number', phoneNumber)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching SMS conversations by phone:', error)
    return []
  }
  
  return data
}

/**
 * Get SMS analytics for an agent
 */
export async function getSmsAnalytics(agentId, startDate, endDate) {
  let query = supabase
    .from('sms_conversations')
    .select('*')
    .eq('agent_id', agentId)
  
  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  
  if (endDate) {
    query = query.lte('created_at', endDate)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching SMS analytics:', error)
    return {
      totalMessages: 0,
      incomingMessages: 0,
      outgoingMessages: 0,
      uniqueNumbers: 0,
      avgResponseTime: 0
    }
  }
  
  // Calculate analytics
  const totalMessages = data.length
  const incomingMessages = data.filter(m => m.message_type === 'incoming').length
  const outgoingMessages = data.filter(m => m.message_type === 'outgoing').length
  const uniqueNumbers = new Set(data.map(m => m.phone_number)).size
  
  const responseTimes = data
    .filter(m => m.response_time_ms)
    .map(m => m.response_time_ms)
  
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0
  
  return {
    totalMessages,
    incomingMessages,
    outgoingMessages,
    uniqueNumbers,
    avgResponseTime: Math.round(avgResponseTime)
  }
}

/**
 * Get recent SMS conversations with unique phone numbers
 */
export async function getRecentUniqueConversations(agentId, limit = 20) {
  // Get latest message from each unique phone number
  const { data, error } = await supabase
    .from('sms_conversations')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching recent conversations:', error)
    return []
  }
  
  // Group by phone number and get the latest
  const uniqueConversations = []
  const seenNumbers = new Set()
  
  for (const conversation of data) {
    if (!seenNumbers.has(conversation.phone_number)) {
      seenNumbers.add(conversation.phone_number)
      uniqueConversations.push(conversation)
      
      if (uniqueConversations.length >= limit) {
        break
      }
    }
  }
  
  return uniqueConversations
}

/**
 * Delete SMS conversation
 */
export async function deleteSmsConversation(conversationId) {
  const { error } = await supabase
    .from('sms_conversations')
    .delete()
    .eq('id', conversationId)
  
  if (error) {
    console.error('Error deleting SMS conversation:', error)
    throw error
  }
  
  return true
}

/**
 * Bulk delete SMS conversations by agent
 */
export async function bulkDeleteSmsConversations(agentId) {
  const { error } = await supabase
    .from('sms_conversations')
    .delete()
    .eq('agent_id', agentId)
  
  if (error) {
    console.error('Error bulk deleting SMS conversations:', error)
    throw error
  }
  
  return true
}
