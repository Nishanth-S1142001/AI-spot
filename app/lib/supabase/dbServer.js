import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
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
    console.log('💾 Database - updateAgent:', { agentId, updates })

    // Add updated_at timestamp
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('agents')
      .update(updateData)
      .eq('id', agentId)
      .select()
      .single()

    if (error) {
      console.error('❌ Database update failed:', error)
      throw error
    }

    console.log('✅ Database updated successfully:', data)
    return data
  },

  async deleteAgent(agentId) {
    const { error } = await supabaseAdmin
      .from('agents')
      .delete()
      .eq('id', agentId)
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
          attachments: uploadedUrls // JSON[] column in supabaseAdmin
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
  // File Upload (supabaseAdmin Storage)
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
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  // ─────────────────────────────
  // NLP AGENT REQUESTS
  // ─────────────────────────────
  async createNlpRequest(userId, requestData) {
    const { data, error } = await supabaseAdmin
      .from('nlp_agent_requests')
      .insert({
        user_id: userId,
        ...requestData
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getNlpRequest(requestId, userId) {
    const { data, error } = await supabaseAdmin
      .from('nlp_agent_requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', userId)
      .single()
    if (error) throw error
    return data
  },

  async getUserNlpRequests(userId, limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('nlp_agent_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async updateNlpRequest(requestId, updates) {
    const { data, error } = await supabaseAdmin
      .from('nlp_agent_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // ─────────────────────────────
  // NLP PARSING HISTORY
  // ─────────────────────────────
  async createParsingHistory(historyData) {
    const { data, error } = await supabaseAdmin
      .from('nlp_parsing_history')
      .insert(historyData)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getParsingHistory(requestId) {
    const { data, error } = await supabaseAdmin
      .from('nlp_parsing_history')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  // ─────────────────────────────
  // AGENT TEMPLATES
  // ─────────────────────────────
  async getAgentTemplates(category = null) {
    let query = supabaseAdmin
      .from('agent_templates')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getAgentTemplate(templateId) {
    const { data, error } = await supabaseAdmin
      .from('agent_templates')
      .select('*')
      .eq('id', templateId)
      .single()
    if (error) throw error
    return data
  },

  async findTemplateByKeywords(keywords) {
    const { data, error } = await supabaseAdmin
      .from('agent_templates')
      .select('*')
      .eq('is_active', true)

    if (error) throw error

    // Score templates based on keyword matches
    const scored = data.map((template) => {
      const matches = keywords.filter((kw) =>
        template.keywords?.some(
          (tk) =>
            tk.toLowerCase().includes(kw.toLowerCase()) ||
            kw.toLowerCase().includes(tk.toLowerCase())
        )
      )
      return {
        ...template,
        matchScore: matches.length
      }
    })

    // Return top matches
    return scored
      .filter((t) => t.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
  },

  // ─────────────────────────────
  // NLP FEEDBACK
  // ─────────────────────────────
  async createNlpFeedback(userId, feedbackData) {
    const { data, error } = await supabaseAdmin
      .from('nlp_feedback')
      .insert({
        user_id: userId,
        ...feedbackData
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getNlpFeedback(requestId) {
    const { data, error } = await supabaseAdmin
      .from('nlp_feedback')
      .select('*')
      .eq('request_id', requestId)
    if (error) throw error
    return data
  },
  // ─────────────────────────────
  // AGENT CALENDARS
  // ─────────────────────────────
  async getAgentCalendar(agentId) {
    const { data, error } = await supabaseAdmin
      .from('agent_calendars')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createOrUpdateCalendar(agentId, calendarData) {
    const { data: existing } = await supabaseAdmin
      .from('agent_calendars')
      .select('id')
      .eq('agent_id', agentId)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('agent_calendars')
        .update({ ...calendarData, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      const { data, error } = await supabaseAdmin
        .from('agent_calendars')
        .insert({ ...calendarData, agent_id: agentId })
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  // Bookings
  async getBookings(agentId, filters = {}) {
    let query = supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('agent_id', agentId)
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.email) {
      query = query.eq('customer_email', filters.email)
    }

    if (filters.dateFrom) {
      query = query.gte('booking_date', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('booking_date', filters.dateTo)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getBookingById(bookingId) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (error) throw error
    return data
  },

  async createBooking(bookingData) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateBooking(bookingId, updates) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async cancelBooking(bookingId, reason, cancelledBy) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledBy,
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getBookingsByTimeSlot(agentId, date, time) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('agent_id', agentId)
      .eq('booking_date', date)
      .eq('booking_time', time)
      .in('status', ['confirmed', 'pending'])

    if (error) throw error
    return data || []
  },

  // Booking Slots (for manual/internal scheduling)
  async getAvailableSlots(agentCalendarId, dateFrom, dateTo) {
    const { data, error } = await supabaseAdmin
      .from('booking_slots')
      .select('*')
      .eq('agent_calendar_id', agentCalendarId)
      .eq('is_available', true)
      .gte('slot_date', dateFrom)
      .lte('slot_date', dateTo)
      .order('slot_date')
      .order('slot_time')

    if (error) throw error
    return data || []
  },

  async createBookingSlot(slotData) {
    const { data, error } = await supabaseAdmin
      .from('booking_slots')
      .insert(slotData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateSlotAvailability(slotId, isAvailable) {
    const { data, error } = await supabaseAdmin
      .from('booking_slots')
      .update({
        is_available: isAvailable,
        updated_at: new Date().toISOString()
      })
      .eq('id', slotId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Booking Conversations
  async linkBookingToConversation(
    bookingId,
    conversationId,
    extractedData,
    confidenceScore
  ) {
    const { data, error } = await supabaseAdmin
      .from('booking_conversations')
      .insert({
        booking_id: bookingId,
        conversation_id: conversationId,
        extracted_data: extractedData,
        confidence_score: confidenceScore
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getBookingConversations(bookingId) {
    const { data, error } = await supabaseAdmin
      .from('booking_conversations')
      .select(
        `
        *,
        conversation:conversations(*),
        booking:bookings(*)
      `
      )
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Analytics for bookings
  async getBookingAnalytics(agentId, dateFrom, dateTo) {
    let query = supabaseAdmin
      .from('analytics')
      .select('*')
      .eq('agent_id', agentId)
      .eq('event_type', 'booking_interaction')
      .order('created_at', { ascending: false })

    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // Get upcoming bookings for notifications
  async getUpcomingBookings(hours = 24) {
    const now = new Date()
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000)

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select(
        `
        *,
        agent:agents(name, user_id),
        calendar:agent_calendars(send_reminders, reminder_hours_before)
      `
      )
      .eq('status', 'confirmed')
      .gte('booking_date', now.toISOString().split('T')[0])
      .lte('booking_date', futureTime.toISOString().split('T')[0])
      .is('reminder_sent_at', null)

    if (error) throw error
    return data || []
  },

  // Booking statistics
  async getBookingStats(agentId, dateFrom, dateTo) {
    const bookings = await this.getBookings(agentId, { dateFrom, dateTo })

    return {
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      no_show: bookings.filter((b) => b.status === 'no_show').length,
      rescheduled: bookings.filter((b) => b.status === 'rescheduled').length
    }
  },

  async checkConversationExists(agentId, sessionId) {
    const { data, error, count } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true }) // Efficient count-only
      .eq('agent_id', agentId)
      .eq('session_id', sessionId)

    if (error) throw error
    return data || [] // Return array (empty if none)
  },
  async verifyAgentOwnership(agentId, userId) {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('id, user_id')
      .eq('id', agentId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Database Error (verifyAgentOwnership):', error)
      throw error
    }
    return data
  },
  async addKnowledgeSource(agentId, sourceData) {
    const { data, error } = await supabaseAdmin
      .from('knowledge_sources')
      .insert({ ...sourceData, agent_id: agentId })
      .select()
      .single()

    if (error) {
      console.error('Database Error (addKnowledgeSource):', error)
      throw error
    }
    return data
  },
  async updateKnowledgeSource(sourceId, updates) {
    const { data, error } = await supabaseAdmin
      .from('knowledge_sources')
      .update(updates)
      .eq('id', sourceId)
      .select()
      .single()

    if (error) {
      console.error('Database Error (updateKnowledgeSource):', error)
      throw error
    }
    return data
  },
  async getKnowledgeSources(agentId) {
    const { data, error } = await supabaseAdmin
      .from('knowledge_sources')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false }) // Added ordering for list consistency

    if (error) {
      console.error('Database Error (getKnowledgeSources):', error)
      throw error
    }
    return data || []
  },
  async deleteKnowledgeSource(sourceId, agentId) {
    const { error } = await supabaseAdmin
      .from('knowledge_sources')
      .delete()
      .eq('id', sourceId)
      .eq('agent_id', agentId) // Enforce agent ownership during deletion

    if (error) {
      console.error('Database Error (deleteKnowledgeSource):', error)
      throw error
    }
    return true
  },
    async getAgentDependencies(agentId) {
    try {
      const [
        webhooks,
        workflows,
        knowledgeSources,
        testAccounts,
        bookings,
        conversations,
        analytics,
        calendar,
        smsConfig
      ] = await Promise.all([
        // Webhooks (CASCADE DELETE)
        supabaseAdmin
          .from('agent_webhooks')
          .select('id, name')
          .eq('agent_id', agentId),

        // Workflows (SET NULL - will be orphaned but kept)
        supabaseAdmin
          .from('workflows')
          .select('id, name, is_active')
          .eq('agent_id', agentId),

        // Knowledge Sources (CASCADE DELETE)
        supabaseAdmin
          .from('knowledge_sources')
          .select('id, source_type, file_name')
          .eq('agent_id', agentId),

        // Test Accounts (CASCADE DELETE)
        supabaseAdmin
          .from('test_accounts')
          .select('id, name, email, status')
          .eq('agent_id', agentId),

        // Bookings (CASCADE DELETE)
        supabaseAdmin
          .from('bookings')
          .select('id, status, booking_date')
          .eq('agent_id', agentId)
          .in('status', ['pending', 'confirmed']),

        // Conversations
        supabaseAdmin
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('agent_id', agentId)
          .is('deleted_at', null),

        // Analytics
        supabaseAdmin
          .from('analytics')
          .select('id', { count: 'exact', head: true })
          .eq('agent_id', agentId),

        // Calendar
        supabaseAdmin
          .from('agent_calendars')
          .select('id, booking_duration')
          .eq('agent_id', agentId)
          .maybeSingle(),

        // SMS Config
        supabaseAdmin
          .from('agent_sms_config')
          .select('id, provider, is_active')
          .eq('agent_id', agentId)
          .maybeSingle()
      ])

      return {
        webhooks: webhooks.data || [],
        workflows: workflows.data || [],
        knowledgeSources: knowledgeSources.data || [],
        testAccounts: testAccounts.data || [],
        bookings: bookings.data || [],
        conversationsCount: conversations.count || 0,
        analyticsCount: analytics.count || 0,
        calendar: calendar.data,
        smsConfig: smsConfig.data,
        
        hasActiveDependencies:
          (webhooks.data?.length || 0) > 0 ||
          (workflows.data?.filter(w => w.is_active).length || 0) > 0 ||
          (bookings.data?.length || 0) > 0 ||
          (testAccounts.data?.length || 0) > 0
      }
    } catch (error) {
      console.error('Error fetching agent dependencies:', error)
      throw error
    }
  }
}
// ============================================================================
// SUB-ACCOUNTS DATABASE CLIENT METHODS
// Add these methods to your existing dbServer object in lib/supabase/dbServer.js
// ============================================================================

// Add this to your dbServer export:

export const subAccountsDb = {
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST ACCOUNTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all test accounts for a specific agent
   */
  async getTestAccountsByAgent(agentId, userId) {
    const { data, error } = await supabaseAdmin
      .from('test_accounts')
      .select(
        `
        *,
        agents!inner(id, name, user_id)
      `
      )
      .eq('agent_id', agentId)
      .eq('agents.user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get all test accounts for a user (across all agents)
   */
  async getTestAccountsByUser(userId) {
    const { data, error } = await supabaseAdmin
      .from('test_accounts')
      .select(
        `
        *,
        agents!inner(id, name, user_id)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get single test account by ID
   */
  async getTestAccount(accountId) {
    const { data, error } = await supabaseAdmin
      .from('test_accounts')
      .select(
        `
        *,
        agents(id, name, user_id, system_prompt, model, temperature)
      `
      )
      .eq('id', accountId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get test account by access token (for public access)
   */
  async getTestAccountByToken(accessToken) {
    const { data, error } = await supabaseAdmin
      .from('test_accounts')
      .select(
        `
        *,
        agents(
          id, 
          name, 
          description,
          system_prompt, 
          persona,
          tone,
          model, 
          temperature,
          max_tokens,
          knowledge_base
        )
      `
      )
      .eq('access_token', accessToken)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No account found
      }
      throw error
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      await this.updateTestAccount(data.id, {
        status: 'expired',
        is_active: false
      })
      return null
    }

    return data
  },

  /**
   * Create new test account
   */
  async createTestAccount(accountData) {
    const { data, error } = await supabaseAdmin
      .from('test_accounts')
      .insert(accountData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update test account
   */
  async updateTestAccount(accountId, updates) {
    const { data, error } = await supabaseAdmin
      .from('test_accounts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Delete test account (and cascade to sessions, invitations, analytics)
   */
  async deleteTestAccount(accountId) {
    const { error } = await supabaseAdmin
      .from('test_accounts')
      .delete()
      .eq('id', accountId)

    if (error) throw error
    return true
  },

  /**
   * Increment session count for test account
   */
  async incrementTestAccountSessionCount(accountId) {
    const { data, error } = await supabaseAdmin.rpc(
      'increment_test_account_sessions',
      { account_id: accountId }
    )

    if (error) {
      // Fallback if function doesn't exist
      const account = await this.getTestAccount(accountId)
      return await this.updateTestAccount(accountId, {
        sessions_count: (account.sessions_count || 0) + 1,
        last_active_at: new Date().toISOString()
      })
    }

    return data
  },

  /**
   * Increment message count for test account
   */
  async incrementTestAccountMessageCount(accountId, count = 1) {
    const account = await this.getTestAccount(accountId)
    return await this.updateTestAccount(accountId, {
      messages_count: (account.messages_count || 0) + count,
      last_active_at: new Date().toISOString()
    })
  },

  /**
   * Check if test account has reached limits
   */
  async checkTestAccountLimits(accountId) {
    const account = await this.getTestAccount(accountId)

    return {
      canCreateSession: account.sessions_count < account.max_sessions,
      remainingSessions: Math.max(
        0,
        account.max_sessions - account.sessions_count
      ),
      isExpired:
        account.expires_at && new Date(account.expires_at) < new Date(),
      isActive: account.is_active && account.status === 'active'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST SESSIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all sessions for a test account
   */
  async getTestSessions(testAccountId, limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('test_sessions')
      .select('*')
      .eq('test_account_id', testAccountId)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  /**
   * Get sessions for an agent (across all test accounts)
   */
  async getTestSessionsByAgent(agentId, limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('test_sessions')
      .select(
        `
        *,
        test_accounts(id, name, email)
      `
      )
      .eq('agent_id', agentId)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  /**
   * Get single test session
   */
  async getTestSession(sessionId) {
    const { data, error } = await supabaseAdmin
      .from('test_sessions')
      .select(
        `
        *,
        test_accounts(id, name, email)
      `
      )
      .eq('id', sessionId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Create test session
   */
  async createTestSession(sessionData) {
    const { data, error } = await supabaseAdmin
      .from('test_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) throw error

    // Increment session count
    await this.incrementTestAccountSessionCount(sessionData.test_account_id)

    return data
  },

  /**
   * Update test session
   */
  async updateTestSession(sessionId, updates) {
    const { data, error } = await supabaseAdmin
      .from('test_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Complete test session
   */
  async completeTestSession(sessionId, sessionData = {}) {
    const session = await this.getTestSession(sessionId)
    const duration = Math.floor(
      (new Date() - new Date(session.started_at)) / 1000
    )

    return await this.updateTestSession(sessionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      duration_seconds: duration,
      ...sessionData
    })
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST INVITATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all invitations for a test account
   */
  async getTestInvitations(testAccountId) {
    const { data, error } = await supabaseAdmin
      .from('test_invitations')
      .select('*')
      .eq('test_account_id', testAccountId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get invitations for an agent
   */
  async getTestInvitationsByAgent(agentId) {
    const { data, error } = await supabaseAdmin
      .from('test_invitations')
      .select(
        `
        *,
        test_accounts(id, name, email, status)
      `
      )
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get invitation by token
   */
  async getTestInvitationByToken(invitationToken) {
    const { data, error } = await supabaseAdmin
      .from('test_invitations')
      .select(
        `
        *,
        test_accounts(id, name, email, access_token),
        agents(id, name)
      `
      )
      .eq('invitation_token', invitationToken)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      await this.updateTestInvitation(data.id, { status: 'expired' })
      return null
    }

    return data
  },

  /**
   * Create invitation
   */
  async createTestInvitation(invitationData) {
    const { data, error } = await supabaseAdmin
      .from('test_invitations')
      .insert(invitationData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update invitation
   */
  async updateTestInvitation(invitationId, updates) {
    const { data, error } = await supabaseAdmin
      .from('test_invitations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Mark invitation as sent
   */
  async markInvitationSent(invitationId) {
    return await this.updateTestInvitation(invitationId, {
      status: 'sent',
      sent_at: new Date().toISOString()
    })
  },

  /**
   * Mark invitation as accepted
   */
  async acceptInvitation(invitationToken) {
    const invitation = await this.getTestInvitationByToken(invitationToken)

    if (!invitation) {
      throw new Error('Invitation not found or expired')
    }

    // Update invitation
    await this.updateTestInvitation(invitation.id, {
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })

    // Activate test account
    await this.updateTestAccount(invitation.test_account_id, {
      status: 'active',
      first_accessed_at: new Date().toISOString()
    })

    return invitation.test_accounts
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Log analytics event
   */
  async logTestAnalytics(analyticsData) {
    const { data, error } = await supabaseAdmin
      .from('test_analytics')
      .insert(analyticsData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get analytics for test account
   */
  async getTestAccountAnalytics(testAccountId, dateFrom, dateTo) {
    let query = supabaseAdmin
      .from('test_analytics')
      .select('*')
      .eq('test_account_id', testAccountId)
      .order('created_at', { ascending: false })

    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /**
   * Get analytics for agent (across all test accounts)
   */
  async getTestAgentAnalytics(agentId, dateFrom, dateTo) {
    let query = supabaseAdmin
      .from('test_analytics')
      .select(
        `
        *,
        test_accounts(id, name, email)
      `
      )
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })

    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /**
   * Get test account statistics
   */
  async getTestAccountStats(testAccountId) {
    const [sessions, analytics] = await Promise.all([
      this.getTestSessions(testAccountId),
      this.getTestAccountAnalytics(testAccountId)
    ])

    const totalMessages = analytics.filter(
      (a) => a.event_type === 'message_sent'
    ).length

    const totalTokens = analytics.reduce(
      (sum, a) => sum + (a.tokens_used || 0),
      0
    )

    const avgResponseTime = analytics
      .filter((a) => a.response_time_ms)
      .reduce((sum, a, _, arr) => sum + a.response_time_ms / arr.length, 0)

    const ratings = sessions.filter((s) => s.rating).map((s) => s.rating)

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter((s) => s.status === 'active').length,
      completedSessions: sessions.filter((s) => s.status === 'completed')
        .length,
      totalMessages,
      totalTokens,
      avgResponseTime: Math.round(avgResponseTime),
      avgRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length
    }
  },

  /**
   * Get agent test statistics (across all test accounts)
   */
  async getAgentTestStats(agentId, userId) {
    const testAccounts = await this.getTestAccountsByAgent(agentId, userId)

    if (testAccounts.length === 0) {
      return {
        totalTestAccounts: 0,
        activeAccounts: 0,
        totalSessions: 0,
        totalMessages: 0,
        totalTokens: 0,
        avgRating: 0
      }
    }

    const accountIds = testAccounts.map((a) => a.id)

    const { data: sessions } = await supabaseAdmin
      .from('test_sessions')
      .select('*')
      .in('test_account_id', accountIds)

    const { data: analytics } = await supabaseAdmin
      .from('test_analytics')
      .select('*')
      .in('test_account_id', accountIds)

    const totalMessages = (analytics || []).filter(
      (a) => a.event_type === 'message_sent'
    ).length

    const totalTokens = (analytics || []).reduce(
      (sum, a) => sum + (a.tokens_used || 0),
      0
    )

    const ratings = (sessions || [])
      .filter((s) => s.rating)
      .map((s) => s.rating)

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0

    return {
      totalTestAccounts: testAccounts.length,
      activeAccounts: testAccounts.filter(
        (a) => a.is_active && a.status === 'active'
      ).length,
      totalSessions: (sessions || []).length,
      totalMessages,
      totalTokens,
      avgRating: Math.round(avgRating * 10) / 10
    }
  },
 
}

// ============================================================================
// POSTGRESQL FUNCTIONS (Create these in your database)
// ============================================================================

/*
-- Function to increment session count atomically
CREATE OR REPLACE FUNCTION increment_test_account_sessions(account_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.test_accounts
  SET 
    sessions_count = sessions_count + 1,
    last_active_at = now(),
    updated_at = now()
  WHERE id = account_id;
END;
$$ LANGUAGE plpgsql;
*/
