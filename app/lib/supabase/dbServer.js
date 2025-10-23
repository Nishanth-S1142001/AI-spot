import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

import { getUserAgents } from '../../actions/agents.js'
dotenv.config({ path: '.env.local' })
const supabaseUrl = process.env.SUPABASE_URL
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
  // async createWorkflow(agentId, workflowData) {
  //   const { data, error } = await supabaseAdmin
  //     .from('workflows')
  //     .insert({ ...workflowData, agent_id: agentId })
  //     .select()
  //     .single()
  //   if (error) throw error
  //   return data
  // },

  // async getWorkflows(agentId) {
  //   const { data, error } = await supabaseAdmin
  //     .from('workflows')
  //     .select('*')
  //     .eq('agent_id', agentId)
  //   if (error) throw error
  //   return data
  // },

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
  },
  // Feedback
  async createFeedback(userId, feedbackData, attachments = []) {
    try {
      const uploadedUrls = []

      for (const file of attachments) {
        const url = await this.uploadFeedbackAttachment(userId, file)
        uploadedUrls.push(url)
      }

      const { data, error } = await supabaseAdmin
        .from('feedback')
        .insert({
          ...feedbackData,
          user_id: userId,
          attachments: uploadedUrls // JSON[] column in Supabase
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('createFeedback failed:', err.message)
      throw err
    }
  },
  // File Upload (Supabase Storage)
  async uploadFeedbackAttachment(userId, file) {
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `feedback/${userId}/${Date.now()}.${fileExt}`

      const { data, error } = await supabaseAdmin.storage
        .from('feedback_files') // Make sure your bucket is named this
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (error) throw error

      // Get the public URL
      const {
        data: { publicUrl }
      } = supabaseAdmin.storage.from('feedback_files').getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('File upload failed:', err.message)
      throw err
    }
  },
  async getFeedbackByUser(userId) {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getFeedback(feedbackId) {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .eq('id', feedbackId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async updateFeedback(feedbackId, updates) {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .update(updates)
      .eq('id', feedbackId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteFeedback(feedbackId) {
    const { error } = await supabaseAdmin
      .from('feedback')
      .delete()
      .eq('id', feedbackId)

    if (error) throw error
    return true
  },

  // (Optional) Admin-only: Get all feedback (requires service_role)
  async getAllFeedback(limit = 100) {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },
  async getWebhooksByAgentId(agentId) {
    const { data, error } = await supabaseAdmin
      .from('agent_webhooks')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getWebhookById(webhookId) {
    const { data, error } = await supabaseAdmin
      .from('agent_webhooks')
      .select('*')
      .eq('id', webhookId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async getWebhookByKey(webhookKey) {
    const { data, error } = await supabaseAdmin
      .from('agent_webhooks')
      .select(
        `
      *,
      agents (
        id,
        name,
        system_prompt,
       
       
       
        user_id
      )
    `
      )
      .eq('webhook_key', webhookKey)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async createWebhook(agentId, webhookData) {
    const { data, error } = await supabaseAdmin
      .from('agent_webhooks')
      .insert({ ...webhookData, agent_id: agentId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateWebhook(webhookId, updates) {
    const { data, error } = await supabaseAdmin
      .from('agent_webhooks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', webhookId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteWebhook(webhookId) {
    const { error } = await supabaseAdmin
      .from('agent_webhooks')
      .delete()
      .eq('id', webhookId)
    if (error) throw error
    return true
  },

  async createWebhookInvocation(invocationData) {
    const { data, error } = await supabaseAdmin
      .from('webhook_invocations')
      .insert(invocationData)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getWebhookInvocations(webhookId, limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('webhook_invocations')
      .select('*')
      .eq('agent_webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async getAgentWebhookStats(agentId) {
    const { data, error } = await supabaseAdmin
      .from('webhook_invocations')
      .select('response_time_ms, success, created_at')
      .eq('agent_id', agentId)
    if (error) throw error
    return data || []
  },
  async getWebhookInvocations(
    webhookId,
    limit = 50,
    offset = 0,
    sort = 'desc'
  ) {
    const query = supabaseAdmin
      .from('webhook_invocations')
      .select('*', { count: 'exact' })
      .eq('agent_webhook_id', webhookId)
      .order('created_at', { ascending: sort === 'asc' })
      .range(offset, offset + limit - 1) // pagination

    const { data, count, error } = await query

    if (error) throw error
    return { data, count }
  },
  async getUserWorkflows(userId) {
    const { data, error } = await supabaseAdmin
      .from('workflows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getWorkflow(workflowId, userId) {
    const { data, error } = await supabaseAdmin
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', userId)
      .single()
    if (error) throw error
    return data
  },

  async createWorkflow(userId, workflowData) {
    const { data, error } = await supabaseAdmin
      .from('workflows')
      .insert({ ...workflowData, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateWorkflow(workflowId, updates) {
    const { data, error } = await supabaseAdmin
      .from('workflows')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', workflowId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteWorkflow(workflowId) {
    const { error } = await supabaseAdmin
      .from('workflows')
      .delete()
      .eq('id', workflowId)
    if (error) throw error
    return true
  },

  async incrementWorkflowExecutionCount(workflowId) {
    const { data, error } = await supabaseAdmin.rpc(
      'increment_workflow_execution',
      { workflow_id: workflowId }
    )
    if (error) throw error
    return data
  },

  // ===== WORKFLOW NODES =====

  async getWorkflowNodes(workflowId) {
    const { data, error } = await supabaseAdmin
      .from('workflow_nodes')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  async createWorkflowNode(nodeData) {
    const { data, error } = await supabaseAdmin
      .from('workflow_nodes')
      .insert(nodeData)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateWorkflowNode(nodeId, updates) {
    const { data, error } = await supabaseAdmin
      .from('workflow_nodes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', nodeId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteWorkflowNode(nodeId) {
    const { error } = await supabaseAdmin
      .from('workflow_nodes')
      .delete()
      .eq('id', nodeId)
    if (error) throw error
    return true
  },

  async bulkUpsertWorkflowNodes(workflowId, nodes) {
    // Delete existing nodes
    await supabaseAdmin
      .from('workflow_nodes')
      .delete()
      .eq('workflow_id', workflowId)

    // Insert new nodes
    if (nodes.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('workflow_nodes')
        .insert(nodes)
        .select()
      if (error) throw error
      return data
    }
    return []
  },

  // ===== WORKFLOW EDGES =====

  async getWorkflowEdges(workflowId) {
    const { data, error } = await supabaseAdmin
      .from('workflow_edges')
      .select('*')
      .eq('workflow_id', workflowId)
    if (error) throw error
    return data
  },

  async bulkUpsertWorkflowEdges(workflowId, edges) {
    // Delete existing edges
    await supabaseAdmin
      .from('workflow_edges')
      .delete()
      .eq('workflow_id', workflowId)

    // Insert new edges
    if (edges.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('workflow_edges')
        .insert(edges)
        .select()
      if (error) throw error
      return data
    }
    return []
  },

  // ===== WORKFLOW EXECUTIONS =====

  async createWorkflowExecution(executionData) {
    const { data, error } = await supabaseAdmin
      .from('workflow_executions')
      .insert(executionData)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateWorkflowExecution(executionId, updates) {
    const { data, error } = await supabaseAdmin
      .from('workflow_executions')
      .update(updates)
      .eq('id', executionId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getWorkflowExecutions(workflowId, limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async getWorkflowExecution(executionId) {
    const { data, error } = await supabaseAdmin
      .from('workflow_executions')
      .select('*')
      .eq('id', executionId)
      .single()
    if (error) throw error
    return data
  },

  // ===== WORKFLOW EXECUTION LOGS =====

  async createWorkflowExecutionLog(logData) {
    const { data, error } = await supabaseAdmin
      .from('workflow_execution_logs')
      .insert(logData)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateWorkflowExecutionLog(logId, updates) {
    const { data, error } = await supabaseAdmin
      .from('workflow_execution_logs')
      .update(updates)
      .eq('id', logId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getWorkflowExecutionLogs(executionId) {
    const { data, error } = await supabaseAdmin
      .from('workflow_execution_logs')
      .select('*')
      .eq('execution_id', executionId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  // ===== INTEGRATIONS =====

  async getUserIntegrations(userId) {
    const { data, error } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getIntegration(integrationId) {
    const { data, error } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single()
    if (error) throw error
    return data
  },

  async createIntegration(integrationData) {
    const { data, error } = await supabaseAdmin
      .from('integrations')
      .insert(integrationData)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateIntegration(integrationId, updates) {
    const { data, error } = await supabaseAdmin
      .from('integrations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', integrationId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteIntegration(integrationId) {
    const { error } = await supabaseAdmin
      .from('integrations')
      .delete()
      .eq('id', integrationId)
    if (error) throw error
    return true
  },

  // ===== WORKFLOW SCHEDULES =====

  async createWorkflowSchedule(scheduleData) {
    const { data, error } = await supabaseAdmin
      .from('workflow_schedules')
      .insert(scheduleData)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateWorkflowSchedule(scheduleId, updates) {
    const { data, error } = await supabaseAdmin
      .from('workflow_schedules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', scheduleId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getWorkflowSchedule(workflowId) {
    const { data, error } = await supabaseAdmin
      .from('workflow_schedules')
      .select('*')
      .eq('workflow_id', workflowId)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getDueSchedules() {
    const { data, error } = await supabaseAdmin
      .from('workflow_schedules')
      .select('*')
      .eq('is_active', true)
      .lte('next_run_at', new Date().toISOString())
    if (error) throw error
    return data
  },

  // ===== WORKFLOW WEBHOOKS =====

  async createWorkflowWebhook(webhookData) {
    const { data, error } = await supabaseAdmin
      .from('workflow_webhooks')
      .insert(webhookData)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getWorkflowWebhook(workflowId) {
    const { data, error } = await supabaseAdmin
      .from('workflow_webhooks')
      .select('*')
      .eq('workflow_id', workflowId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getWorkflowWebhookByKey(webhookKey) {
    const { data, error } = await supabaseAdmin
      .from('workflow_webhooks')
      .select(
        `
      *,
      workflows (*)
    `
      )
      .eq('webhook_key', webhookKey)
      .single()
    if (error) throw error
    return data
  },

  async updateWorkflowWebhook(webhookId, updates) {
    const { data, error } = await supabaseAdmin
      .from('workflow_webhooks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', webhookId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // ===== TASK QUEUE =====

  async createTask(taskData) {
    const { data, error } = await supabaseAdmin
      .from('task_queue')
      .insert(taskData)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getNextPendingTask() {
    const { data, error } = await supabaseAdmin
      .from('task_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') return null
    if (error) throw error
    return data
  },

  async updateTask(taskId, updates) {
    const { data, error } = await supabaseAdmin
      .from('task_queue')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async markTaskProcessing(taskId) {
    return this.updateTask(taskId, {
      status: 'processing',
      started_at: new Date().toISOString()
    })
  },

  async markTaskCompleted(taskId) {
    return this.updateTask(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  },

  async markTaskFailed(taskId, errorMessage) {
    const task = await this.updateTask(taskId, {
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString()
    })

    // Schedule retry if retries remaining
    if (task.retry_count < task.max_retries) {
      const retryDelay = Math.pow(2, task.retry_count) * 1000 // Exponential backoff
      await this.createTask({
        task_type: task.task_type,
        payload: task.payload,
        priority: task.priority,
        max_retries: task.max_retries,
        retry_count: task.retry_count + 1,
        scheduled_for: new Date(Date.now() + retryDelay).toISOString()
      })
    }

    return task
  },
  async getUserAgents(userId) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
}
