'use server'

import { dbServer } from '../lib/supabase/dbServer.js'
import { subAccountsDb } from '../lib/supabase/dbServer.js'
import { supabaseAdmin } from '../lib/supabase/dbServer.js'
// ─────────────────────────────
// PROFILES
// ─────────────────────────────
export async function updateProfile(userId, updates) {
  return await dbServer.updateProfile(userId, updates)
}

export async function getUserAgents(userId) {
  return await dbServer.getUserAgents(userId)
}

// ─────────────────────────────
// AGENTS
// ─────────────────────────────
export async function createAgent(userId, agentData) {
  // agentData now supports new fields:
  // - services: text[] - array of service IDs like ['calendar', 'mail']
  // - interface: text - single interface like 'website', 'sms', or 'instagram'
  // - service_config: jsonb - configuration for each service
  const fullAgentData = { ...agentData, user_id: userId }
  return await dbServer.createAgent(userId, fullAgentData)
}

export async function getAgent(agentId, userId) {
  return await dbServer.getAgent(agentId, userId)
}

import { revalidatePath } from 'next/cache'

export async function updateAgent(agentId, updates) {
  try {
    console.log('🔄 Server Action - updateAgent:', { agentId, updates })

    // ⚠️ IMPORTANT: Await the database call
    const updatedAgent = await dbServer.updateAgent(agentId, updates)

    console.log('✅ Agent updated in DB:', updatedAgent)

    // ⚠️ CRITICAL: Revalidate the cache paths
    revalidatePath(`/agents/${agentId}`)
    revalidatePath('/agents')

    // ⚠️ CRITICAL: Return the ACTUAL updated agent data
    return updatedAgent
  } catch (error) {
    console.error('❌ updateAgent server action failed:', error)
    // Re-throw the error so React Query catches it
    throw new Error(error.message || 'Failed to update agent')
  }
}

// app/actions/agents.js

// UPDATED: deleteAgent with ALL agent dependencies
// Replace in app/actions/agents.js

export async function deleteAgent(agentId, userId) {
  try {
    console.log('Starting agent deletion:', agentId)

    // 1. Verify ownership
    const agent = await dbServer.verifyAgentOwnership(agentId, userId)
    if (!agent) {
      throw new Error('Agent not found or access denied')
    }

    // 2. Get all dependencies
    const dependencies = await dbServer.getAgentDependencies(agentId)
    console.log('📊 Agent dependencies:', {
      webhooks: dependencies.webhooks.length,
      workflows: dependencies.workflows.length,
      knowledgeSources: dependencies.knowledgeSources.length,
      testAccounts: dependencies.testAccounts.length,
      bookings: dependencies.bookings.length,
      conversations: dependencies.conversationsCount,
      analytics: dependencies.analyticsCount
    })

    // 3. Delete dependencies in the correct order

    // ========== NEW: Delete SMS conversations ==========
    console.log('🗑️ Deleting SMS conversations...')
    const { error: smsConvError } = await supabaseAdmin
      .from('sms_conversations')
      .delete()
      .eq('agent_id', agentId)

    if (smsConvError && smsConvError.code !== 'PGRST116') {
      console.error('Failed to delete SMS conversations:', smsConvError)
    }

    // ========== NEW: Delete NLP feedback (optional) ==========
    console.log('🗑️ Deleting NLP feedback...')
    const { error: nlpFeedbackError } = await supabaseAdmin
      .from('nlp_feedback')
      .delete()
      .eq('agent_id', agentId)

    if (nlpFeedbackError && nlpFeedbackError.code !== 'PGRST116') {
      console.error('Failed to delete NLP feedback:', nlpFeedbackError)
    }

    // ========== NEW: Delete/Update NLP agent requests (optional) ==========
    // Option A: Delete them
    console.log('🗑️ Deleting NLP agent requests...')
    const { error: nlpRequestError } = await supabaseAdmin
      .from('nlp_agent_requests')
      .delete()
      .eq('agent_id', agentId)

    // Option B: Set agent_id to null to keep history
    // const { error: nlpRequestError } = await supabaseAdmin
    //   .from('nlp_agent_requests')
    //   .update({ agent_id: null })
    //   .eq('agent_id', agentId)

    if (nlpRequestError && nlpRequestError.code !== 'PGRST116') {
      console.error('Failed to handle NLP requests:', nlpRequestError)
    }

    // Delete analytics FIRST (this was causing the foreign key error)
    if (dependencies.analyticsCount > 0) {
      console.log('🗑️ Deleting analytics records...')
      const { error: analyticsError } = await supabaseAdmin
        .from('analytics')
        .delete()
        .eq('agent_id', agentId)

      if (analyticsError) throw analyticsError
    }

    // Delete conversations
    if (dependencies.conversationsCount > 0) {
      console.log('🗑️ Deleting conversations...')
      const { error: conversationsError } = await supabaseAdmin
        .from('conversations')
        .delete()
        .eq('agent_id', agentId)

      if (conversationsError) throw conversationsError
    }

    // Delete webhook invocations
    const { error: invocationsError } = await supabaseAdmin
      .from('webhook_invocations')
      .delete()
      .eq('agent_id', agentId)

    // Delete webhooks
    if (dependencies.webhooks.length > 0) {
      console.log('🗑️ Deleting webhooks...')
      for (const webhook of dependencies.webhooks) {
        await dbServer.deleteWebhook(webhook.id)
      }
    }

    // ========== NEW: Delete knowledge vectors BEFORE knowledge sources ==========
    console.log('🗑️ Deleting knowledge vectors...')
    const { error: vectorsError } = await supabaseAdmin
      .from('knowledge_vectors')
      .delete()
      .eq('agent_id', agentId)

    if (vectorsError && vectorsError.code !== 'PGRST116') {
      console.error('Failed to delete knowledge vectors:', vectorsError)
    }

    // Delete knowledge sources
    if (dependencies.knowledgeSources.length > 0) {
      console.log('🗑️ Deleting knowledge sources...')
      for (const source of dependencies.knowledgeSources) {
        await dbServer.deleteKnowledgeSource(source.id, agentId)
      }
    }

    // Handle test accounts
    if (dependencies.testAccounts.length > 0) {
      console.log('🗑️ Deleting test accounts...')
      for (const testAccount of dependencies.testAccounts) {
        // Delete test sessions
        await supabaseAdmin
          .from('test_sessions')
          .delete()
          .eq('test_account_id', testAccount.id)

        // Delete test analytics
        await supabaseAdmin
          .from('test_analytics')
          .delete()
          .eq('test_account_id', testAccount.id)

        // Delete test invitations
        await supabaseAdmin
          .from('test_invitations')
          .delete()
          .eq('test_account_id', testAccount.id)

        // Delete the test account
        await subAccountsDb.deleteTestAccount(testAccount.id)
      }
    }

    // Delete bookings
    if (dependencies.bookings.length > 0) {
      console.log('🗑️ Deleting bookings...')
      for (const booking of dependencies.bookings) {
        // Delete booking conversations first
        await supabaseAdmin
          .from('booking_conversations')
          .delete()
          .eq('booking_id', booking.id)

        // Then delete the booking
        await supabaseAdmin.from('bookings').delete().eq('id', booking.id)
      }
    }

    // Delete booking slots
    if (dependencies.calendar) {
      console.log('🗑️ Deleting booking slots...')
      await supabaseAdmin
        .from('booking_slots')
        .delete()
        .eq('agent_calendar_id', dependencies.calendar.id)
    }

    // Delete calendar
    if (dependencies.calendar) {
      console.log('🗑️ Deleting calendar...')
      await supabaseAdmin
        .from('agent_calendars')
        .delete()
        .eq('id', dependencies.calendar.id)
    }

    // Delete SMS config
    if (dependencies.smsConfig) {
      console.log('🗑️ Deleting SMS config...')
      await supabaseAdmin
        .from('agent_sms_config')
        .delete()
        .eq('id', dependencies.smsConfig.id)
    }

    // Update workflows to remove agent reference
    if (dependencies.workflows.length > 0) {
      console.log('🔗 Updating workflows (removing agent reference)...')
      await supabaseAdmin
        .from('workflows')
        .update({ agent_id: null, updated_at: new Date().toISOString() })
        .eq('agent_id', agentId)
    }

    // 4. Finally, delete the agent
    console.log('🗑️ Deleting agent...')
    await dbServer.deleteAgent(agentId)

    console.log('✅ Agent deleted successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ deleteAgent server action failed:', error)
    throw new Error(error.message || 'Failed to delete agent')
  }
}

// ─────────────────────────────
// CONVERSATIONS
// ─────────────────────────────
export async function saveConversation(
  agentId,
  sessionId,
  userMessage,
  agentResponse,
  metadata = {}
) {
  return await dbServer.saveConversation(
    agentId,
    sessionId,
    userMessage,
    agentResponse,
    metadata
  )
}

export async function getConversations(agentId, sessionId, limit = 50) {
  return await dbServer.getConversations(agentId, sessionId, limit)
}

export async function deleteConversation(conversationId) {
  return await dbServer.deleteConversation(conversationId)
}

// ─────────────────────────────
// ANALYTICS
// ─────────────────────────────
export async function logAnalytics(
  agentId,
  eventType,
  eventData,
  tokensUsed = 0,
  success = true
) {
  return await dbServer.logAnalytics(
    agentId,
    eventType,
    eventData,
    tokensUsed,
    success
  )
}

// ─────────────────────────────
// CREDITS
// ─────────────────────────────
export async function deductCredits(userId, amount) {
  return await dbServer.deductCredits(userId, amount)
}

export async function hasCredits(userId, required = 1) {
  return await dbServer.hasCredits(userId, required)
}

// ─────────────────────────────
// FEEDBACK
// ─────────────────────────────
export async function createFeedback(userId, feedbackData, attachments = []) {
  return await dbServer.createFeedback(userId, feedbackData, attachments)
}

export async function getFeedbackByUser(userId) {
  return await dbServer.getFeedbackByUser(userId)
}

export async function getFeedback(feedbackId) {
  return await dbServer.getFeedback(feedbackId)
}

export async function updateFeedback(feedbackId, updates) {
  return await dbServer.updateFeedback(feedbackId, updates)
}

export async function deleteFeedback(feedbackId) {
  return await dbServer.deleteFeedback(feedbackId)
}

export async function getAllFeedback(limit = 100) {
  return await dbServer.getAllFeedback(limit)
}

// ─────────────────────────────
// WEBHOOKS
// ─────────────────────────────
export async function getWebhooksByAgentId(agentId) {
  return await dbServer.getWebhooksByAgentId(agentId)
}

export async function getWebhookById(webhookId) {
  return await dbServer.getWebhookById(webhookId)
}

export async function getWebhookByKey(webhookKey) {
  return await dbServer.getWebhookByKey(webhookKey)
}

export async function createWebhook(agentId, webhookData) {
  return await dbServer.createWebhook(agentId, webhookData)
}

export async function updateWebhook(webhookId, updates) {
  return await dbServer.updateWebhook(webhookId, updates)
}

export async function deleteWebhook(webhookId) {
  return await dbServer.deleteWebhook(webhookId)
}

export async function createWebhookInvocation(invocationData) {
  return await dbServer.createWebhookInvocation(invocationData)
}

export async function getWebhookInvocations(
  webhookId,
  limit = 50,
  offset,
  sort
) {
  return await dbServer.getWebhookInvocations(webhookId, limit, offset, sort)
}

export async function getAgentWebhookStats(agentId) {
  return await dbServer.getAgentWebhookStats(agentId)
}

// ─────────────────────────────
// WORKFLOWS
// ─────────────────────────────
export async function getUserWorkflows(userId) {
  return await dbServer.getUserWorkflows(userId)
}

export async function getWorkflow(workflowId, userId) {
  return await dbServer.getWorkflow(workflowId, userId)
}

export async function createWorkflow(userId, workflowData) {
  return await dbServer.createWorkflow(userId, workflowData)
}

export async function updateWorkflow(workflowId, updates) {
  return await dbServer.updateWorkflow(workflowId, updates)
}

export async function deleteWorkflow(workflowId) {
  return await dbServer.deleteWorkflow(workflowId)
}

export async function incrementWorkflowExecutionCount(workflowId) {
  return await dbServer.incrementWorkflowExecutionCount(workflowId)
}

// Workflow Nodes & Edges
export async function getWorkflowNodes(workflowId) {
  return await dbServer.getWorkflowNodes(workflowId)
}

export async function getWorkflowEdges(workflowId) {
  return await dbServer.getWorkflowEdges(workflowId)
}

export async function bulkUpsertWorkflowNodes(workflowId, nodes) {
  return await dbServer.bulkUpsertWorkflowNodes(workflowId, nodes)
}

export async function bulkUpsertWorkflowEdges(workflowId, edges) {
  return await dbServer.bulkUpsertWorkflowEdges(workflowId, edges)
}

// ─────────────────────────────
// WORKFLOW EXECUTIONS
// ─────────────────────────────
export async function createWorkflowExecution(executionData) {
  return await dbServer.createWorkflowExecution(executionData)
}

export async function updateWorkflowExecution(executionId, updates) {
  return await dbServer.updateWorkflowExecution(executionId, updates)
}

export async function getWorkflowExecutions(workflowId, limit = 50) {
  return await dbServer.getWorkflowExecutions(workflowId, limit)
}

export async function getWorkflowExecution(executionId) {
  return await dbServer.getWorkflowExecution(executionId)
}

export async function getWorkflowExecutionLogs(executionId) {
  return await dbServer.getWorkflowExecutionLogs(executionId)
}
export async function createWorkflowExecutionLog(logData) {
  return await dbServer.createWorkflowExecutionLog(logData)
}
export async function updateWorkflowExecutionLog(logId, updates) {
  return await dbServer.updateWorkflowExecutionLog(logId, updates)
}

// ─────────────────────────────
// INTEGRATIONS
// ─────────────────────────────
export async function getUserIntegrations(userId) {
  return await dbServer.getUserIntegrations(userId)
}

export async function getIntegration(integrationId) {
  return await dbServer.getIntegration(integrationId)
}

export async function createIntegration(userId, integrationData) {
  return await dbServer.createIntegration({
    ...integrationData,
    user_id: userId
  })
}

export async function updateIntegration(integrationId, updates) {
  return await dbServer.updateIntegration(integrationId, updates)
}

export async function deleteIntegration(integrationId) {
  return await dbServer.deleteIntegration(integrationId)
}

// ─────────────────────────────
// WORKFLOW WEBHOOKS
// ─────────────────────────────
export async function getWorkflowWebhook(workflowId) {
  return await dbServer.getWorkflowWebhook(workflowId)
}

export async function createWorkflowWebhook(workflowId, webhookData) {
  return await dbServer.createWorkflowWebhook({
    ...webhookData,
    workflow_id: workflowId
  })
}

export async function updateWorkflowWebhook(webhookId, updates) {
  return await dbServer.updateWorkflowWebhook(webhookId, updates)
}

export async function getWorkflowWebhookByKey(webhookKey) {
  return await dbServer.getWorkflowWebhookByKey(webhookKey)
}

// ─────────────────────────────
// WORKFLOW SCHEDULES
// ─────────────────────────────
export async function getWorkflowSchedule(workflowId) {
  return await dbServer.getWorkflowSchedule(workflowId)
}

export async function createWorkflowSchedule(workflowId, scheduleData) {
  return await dbServer.createWorkflowSchedule({
    ...scheduleData,
    workflow_id: workflowId
  })
}

export async function updateWorkflowSchedule(scheduleId, updates) {
  return await dbServer.updateWorkflowSchedule(scheduleId, updates)
}

export async function getDueSchedules() {
  return await dbServer.getDueSchedules()
}

// ─────────────────────────────
// TASK QUEUE
// ─────────────────────────────
export async function createTask(taskData) {
  return await dbServer.createTask(taskData)
}

export async function getNextPendingTask() {
  return await dbServer.getNextPendingTask()
}

export async function updateTask(taskId, updates) {
  return await dbServer.updateTask(taskId, updates)
}

export async function markTaskProcessing(taskId) {
  return await dbServer.markTaskProcessing(taskId)
}

export async function markTaskCompleted(taskId) {
  return await dbServer.markTaskCompleted(taskId)
}

export async function markTaskFailed(taskId, errorMessage) {
  return await dbServer.markTaskFailed(taskId, errorMessage)
}

// ─────────────────────────────
// NLP AGENT CREATION
// ─────────────────────────────
export async function createNlpRequest(userId, rawInput) {
  return await dbServer.createNlpRequest(userId, {
    raw_input: rawInput,
    status: 'pending'
  })
}

export async function getNlpRequest(requestId, userId) {
  return await dbServer.getNlpRequest(requestId, userId)
}

export async function getUserNlpRequests(userId, limit = 50) {
  return await dbServer.getUserNlpRequests(userId, limit)
}

export async function updateNlpRequest(requestId, updates) {
  return await dbServer.updateNlpRequest(requestId, updates)
}

export async function createParsingHistory(historyData) {
  return await dbServer.createParsingHistory(historyData)
}

export async function getParsingHistory(requestId) {
  return await dbServer.getParsingHistory(requestId)
}

export async function getAgentTemplates(category = null) {
  return await dbServer.getAgentTemplates(category)
}

export async function getAgentTemplate(templateId) {
  return await dbServer.getAgentTemplate(templateId)
}

export async function findTemplateByKeywords(keywords) {
  return await dbServer.findTemplateByKeywords(keywords)
}

export async function createNlpFeedback(userId, feedbackData) {
  return await dbServer.createNlpFeedback(userId, feedbackData)
}

export async function getNlpFeedback(requestId) {
  return await dbServer.getNlpFeedback(requestId)
}

// ─────────────────────────────
// CALENDAR
// ─────────────────────────────
export async function getAgentCalendar(agentId) {
  return await dbServer.getAgentCalendar(agentId)
}

export async function createOrUpdateCalendar(agentId, calendarData) {
  return await dbServer.createOrUpdateCalendar(agentId, calendarData)
}

// ─────────────────────────────
// BOOKINGS
// ─────────────────────────────
export async function getBookings(agentId, filters = {}) {
  return await dbServer.getBookings(agentId, filters)
}

export async function getBookingById(bookingId) {
  return await dbServer.getBookingById(bookingId)
}

export async function createBooking(bookingData) {
  return await dbServer.createBooking(bookingData)
}

export async function updateBooking(bookingId, updates) {
  return await dbServer.updateBooking(bookingId, updates)
}

export async function cancelBooking(bookingId, reason, cancelledBy) {
  return await dbServer.cancelBooking(bookingId, reason, cancelledBy)
}

export async function getBookingsByTimeSlot(agentId, date, time) {
  return await dbServer.getBookingsByTimeSlot(agentId, date, time)
}

// ─────────────────────────────
// BOOKING SLOTS
// ─────────────────────────────
export async function getAvailableSlots(agentCalendarId, dateFrom, dateTo) {
  return await dbServer.getAvailableSlots(agentCalendarId, dateFrom, dateTo)
}

export async function createBookingSlot(slotData) {
  return await dbServer.createBookingSlot(slotData)
}

export async function updateSlotAvailability(slotId, isAvailable) {
  return await dbServer.updateSlotAvailability(slotId, isAvailable)
}

// ─────────────────────────────
// BOOKING CONVERSATIONS
// ─────────────────────────────
export async function linkBookingToConversation(
  bookingId,
  conversationId,
  extractedData,
  confidenceScore
) {
  return await dbServer.linkBookingToConversation(
    bookingId,
    conversationId,
    extractedData,
    confidenceScore
  )
}

export async function getBookingConversations(bookingId) {
  return await dbServer.getBookingConversations(bookingId)
}

// ─────────────────────────────
// BOOKING ANALYTICS & NOTIFICATIONS
// ─────────────────────────────
export async function getBookingAnalytics(agentId, dateFrom, dateTo) {
  return await dbServer.getBookingAnalytics(agentId, dateFrom, dateTo)
}

export async function getUpcomingBookings(hours = 24) {
  return await dbServer.getUpcomingBookings(hours)
}

// ─────────────────────────────
// BOOKING STATS
// ─────────────────────────────
export async function getBookingStats(agentId, dateFrom, dateTo) {
  return await dbServer.getBookingStats(agentId, dateFrom, dateTo)
}

export async function checkConversationExists(agentId, sessionId) {
  return await dbServer.checkConversationExists(agentId, sessionId)
}

// ============================================================================
// SUB-ACCOUNTS SERVER ACTIONS
// ============================================================================

// ─────────────────────────────
// TEST ACCOUNTS
// ─────────────────────────────

export async function getTestAccountsByAgent(agentId, userId) {
  return await subAccountsDb.getTestAccountsByAgent(agentId, userId)
}

export async function getTestAccountsByUser(userId) {
  return await subAccountsDb.getTestAccountsByUser(userId)
}

export async function getTestAccount(accountId) {
  return await subAccountsDb.getTestAccount(accountId)
}

export async function getTestAccountByToken(accessToken) {
  return await subAccountsDb.getTestAccountByToken(accessToken)
}

export async function createTestAccount(accountData) {
  return await subAccountsDb.createTestAccount(accountData)
}

export async function updateTestAccount(accountId, updates) {
  return await subAccountsDb.updateTestAccount(accountId, updates)
}

export async function deleteTestAccount(accountId) {
  return await subAccountsDb.deleteTestAccount(accountId)
}

export async function checkTestAccountLimits(accountId) {
  return await subAccountsDb.checkTestAccountLimits(accountId)
}

// ─────────────────────────────
// TEST SESSIONS
// ─────────────────────────────

export async function getTestSessions(testAccountId, limit = 50) {
  return await subAccountsDb.getTestSessions(testAccountId, limit)
}

export async function getTestSessionsByAgent(agentId, limit = 50) {
  return await subAccountsDb.getTestSessionsByAgent(agentId, limit)
}

export async function getTestSession(sessionId) {
  return await subAccountsDb.getTestSession(sessionId)
}

export async function createTestSession(sessionData) {
  return await subAccountsDb.createTestSession(sessionData)
}

export async function updateTestSession(sessionId, updates) {
  return await subAccountsDb.updateTestSession(sessionId, updates)
}

export async function completeTestSession(sessionId, sessionData = {}) {
  return await subAccountsDb.completeTestSession(sessionId, sessionData)
}

// ─────────────────────────────
// TEST INVITATIONS
// ─────────────────────────────

export async function getTestInvitations(testAccountId) {
  return await subAccountsDb.getTestInvitations(testAccountId)
}

export async function getTestInvitationsByAgent(agentId) {
  return await subAccountsDb.getTestInvitationsByAgent(agentId)
}

export async function getTestInvitationByToken(invitationToken) {
  return await subAccountsDb.getTestInvitationByToken(invitationToken)
}

export async function createTestInvitation(invitationData) {
  return await subAccountsDb.createTestInvitation(invitationData)
}

export async function updateTestInvitation(invitationId, updates) {
  return await subAccountsDb.updateTestInvitation(invitationId, updates)
}

export async function markInvitationSent(invitationId) {
  return await subAccountsDb.markInvitationSent(invitationId)
}

export async function acceptInvitation(invitationToken) {
  return await subAccountsDb.acceptInvitation(invitationToken)
}

// ─────────────────────────────
// TEST ANALYTICS
// ─────────────────────────────

export async function logTestAnalytics(analyticsData) {
  return await subAccountsDb.logTestAnalytics(analyticsData)
}

export async function getTestAccountAnalytics(testAccountId, dateFrom, dateTo) {
  return await subAccountsDb.getTestAccountAnalytics(
    testAccountId,
    dateFrom,
    dateTo
  )
}

export async function getTestAgentAnalytics(agentId, dateFrom, dateTo) {
  return await subAccountsDb.getTestAgentAnalytics(agentId, dateFrom, dateTo)
}

export async function getTestAccountStats(testAccountId) {
  return await subAccountsDb.getTestAccountStats(testAccountId)
}

export async function getAgentTestStats(agentId, userId) {
  return await subAccountsDb.getAgentTestStats(agentId, userId)
}

// ─────────────────────────────
// KNOWLEDGE SOURCES
// ─────────────────────────────

export async function verifyAgentOwnership(agentId, userId) {
  return await dbServer.verifyAgentOwnership(agentId, userId)
}

export async function addKnowledgeSource(agentId, sourceData) {
  return await dbServer.addKnowledgeSource(agentId, sourceData)
}

export async function updateKnowledgeSource(sourceId, updates) {
  return await dbServer.updateKnowledgeSource(sourceId, updates)
}
export async function getKnowledgeSources(agentId) {
  return await dbServer.getKnowledgeSources(agentId)
}
export async function deleteKnowledgeSource(sourceId, agentId) {
  return await dbServer.deleteKnowledgeSource(sourceId, agentId)
}
