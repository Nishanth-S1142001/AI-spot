import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Admin / service role client (safe for server-side)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export const dbServer = {
  // Profiles

  async getAgent(agentId, userId) {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select(
        `
          *,
          knowledge_sources(*),
          workflows(*)
        `
      )
      .eq('id', agentId)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
      .from('agents')
      .insert({ ...agentData, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateAgent(agentId, updates) {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .update(updates)
      .eq('id', agentId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteAgent(agentId) {
    const { error } = await supabaseAdmin
      .from('agents')
      .delete()
      .eq('id', agentId)
    if (error) throw error
  },

  // Knowledge Sources
  async addKnowledgeSource(agentId, sourceData) {
    const { data, error } = await supabaseAdmin
      .from('knowledge_sources')
      .insert({ ...sourceData, agent_id: agentId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateKnowledgeSource(sourceId, updates) {
    const { data, error } = await supabaseAdmin
      .from('knowledge_sources')
      .update(updates)
      .eq('id', sourceId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getKnowledgeSources(agentId) {
    const { data, error } = await supabaseAdmin
      .from('knowledge_sources')
      .select('*')
      .eq('agent_id', agentId)
    if (error) throw error
    return data
  },

  async deleteKnowledgeSource(sourceId) {
    const { error } = await supabaseAdmin
      .from('knowledge_sources')
      .delete()
      .eq('id', sourceId)
    if (error) throw error
  },

  // Conversations
  async saveConversation(
    agentId,
    sessionId,
    userMessage,
    agentResponse,
    metadata = {}
  ) {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        agent_id: agentId,
        session_id: sessionId,
        user_message: userMessage,
        agent_response: agentResponse,
        metadata
      })
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  },

  async getConversations(agentId, sessionId, limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('agent_id', agentId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async deleteConversation(conversationId) {
    const { error } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', conversationId)
    if (error) throw error
    return true
  },

  // Analytics
  async logAnalytics(
    agentId,
    eventType,
    eventData,
    tokensUsed = 0,
    success = true
  ) {
    const { data, error } = await supabaseAdmin
      .from('analytics')
      .insert({
        agent_id: agentId,
        event_type: eventType,
        event_data: eventData,
        tokens_used: tokensUsed,
        success
      })
      .select()
      .maybeSingle()
    if (error) throw error
    return data
  },

  // Workflows
  async createWorkflow(agentId, workflowData) {
    const { data, error } = await supabaseAdmin
      .from('workflows')
      .insert({ ...workflowData, agent_id: agentId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getWorkflows(agentId) {
    const { data, error } = await supabaseAdmin
      .from('workflows')
      .select('*')
      .eq('agent_id', agentId)
    if (error) throw error
    return data
  },

  // Credits
  async deductCredits(userId, amount) {
    const profile = await supabaseAdmin
      .from('profiles')
      .select('api_credits')
      .eq('id', userId)
      .single()
      .then((res) => res.data)

    if (!profile) throw new Error('Profile not found')

    const newCredits = profile.api_credits - amount
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ api_credits: newCredits })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async hasCredits(userId, required = 1) {
    const profile = await supabaseAdmin
      .from('profiles')
      .select('api_credits')
      .eq('id', userId)
      .single()
      .then((res) => res.data)

    return profile?.api_credits >= required
  }
}
