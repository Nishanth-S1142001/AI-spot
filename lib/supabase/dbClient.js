import { createSupabaseClient } from './supabaseClient'
import { calendarDbExtensions } from './calendar-db-extensions'
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
    console.log('🔍 Client - getAgent:', agentId)

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

    if (error) {
      console.error('❌ Client - getAgent failed:', error)
      throw error
    }

    console.log('✅ Client - agent fetched:', data)
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
  },
  async getWebhooksByAgentId(agentId) {
    const { data, error } = await supabase
      .from('agent_webhooks')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getWebhookInvocations(webhookId, limit = 50) {
    const { data, error } = await supabase
      .from('webhook_invocations')
      .select('*')
      .eq('agent_webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },
  async getUserWorkflows(userId) {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getWorkflow(workflowId) {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single()
    if (error) throw error
    return data
  },

  async getWorkflowNodes(workflowId) {
    const { data, error } = await supabase
      .from('workflow_nodes')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  async getWorkflowEdges(workflowId) {
    const { data, error } = await supabase
      .from('workflow_edges')
      .select('*')
      .eq('workflow_id', workflowId)
    if (error) throw error
    return data
  },

  async getWorkflowExecutions(workflowId, limit = 50) {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async getWorkflowExecutionLogs(executionId) {
    const { data, error } = await supabase
      .from('workflow_execution_logs')
      .select('*')
      .eq('execution_id', executionId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  async getUserIntegrations(userId) {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getWorkflowSchedule(workflowId) {
    const { data, error } = await supabase
      .from('workflow_schedules')
      .select('*')
      .eq('workflow_id', workflowId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getWorkflowWebhook(workflowId) {
    const { data, error } = await supabase
      .from('workflow_webhooks')
      .select('*')
      .eq('workflow_id', workflowId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },
  ...calendarDbExtensions
}
