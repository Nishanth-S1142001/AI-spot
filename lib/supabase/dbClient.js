import { createSupabaseClient } from './supabaseClient'

export const supabase = createSupabaseClient()

export const dbClient = {
  // Profiles
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  // Agents
  async getUserAgents(userId) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getAgent(agentId) {
    const { data, error } = await supabase
      .from('agents')
      .select(
        `
        *,
        knowledge_sources(*),
        workflows(*)
      `
      )
      .eq('id', agentId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async getKnowledgeSources(agentId) {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getWorkflows(agentId) {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getConversations(agentId, limit = 50) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getAnalytics(agentId, dateFrom, dateTo) {
    let query = supabase
      .from('analytics')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })

    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)

    const { data, error } = await query
    if (error) throw error
    return data
  },
  async checkConversationExists(agentId, sessionId) {
    const { data, error, count } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true }) // Efficient count-only
      .eq('agent_id', agentId)
      .eq('session_id', sessionId)

    if (error) throw error
    return data || [] // Return array (empty if none)
  },
  async getFeedbackByUser(userId) {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}
