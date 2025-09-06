import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Server component client
export const supabase = createServerComponentClient({ cookies })

// Admin / service role client (safe for server-side)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export const dbServer = {
  // Profiles
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Agents
  async createAgent(userId, agentData) {
    console.log('Inserting agent data:', agentData)
    const { data, error } = await supabase
      .from('agents')
      .insert({ ...agentData, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateAgent(agentId, updates) {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', agentId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteAgent(agentId) {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', agentId)
    if (error) throw error
  },

  // Knowledge Sources
  async addKnowledgeSource(agentId, sourceData) {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .insert({ ...sourceData, agent_id: agentId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Conversations
  async saveConversation(agentId, sessionId, userMessage, agentResponse, metadata = {}) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        agent_id: agentId,
        session_id: sessionId,
        user_message: userMessage,
        agent_response: agentResponse,
        metadata
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Analytics
  async logAnalytics(agentId, eventType, eventData, tokensUsed = 0, success = true) {
    const { data, error } = await supabase
      .from('analytics')
      .insert({
        agent_id: agentId,
        event_type: eventType,
        event_data: eventData,
        tokens_used: tokensUsed,
        success
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Workflows
  async createWorkflow(agentId, workflowData) {
    const { data, error } = await supabase
      .from('workflows')
      .insert({ ...workflowData, agent_id: agentId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Credits
  async deductCredits(userId, amount) {
    const profile = await supabase
      .from('profiles')
      .select('api_credits')
      .eq('id', userId)
      .single()
      .then(res => res.data)

    if (!profile) throw new Error('Profile not found')

    const newCredits = profile.api_credits - amount
    const { data, error } = await supabase
      .from('profiles')
      .update({ api_credits: newCredits })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async hasCredits(userId, required = 1) {
    const profile = await supabase
      .from('profiles')
      .select('api_credits')
      .eq('id', userId)
      .single()
      .then(res => res.data)

    return profile?.api_credits >= required
  },
}
