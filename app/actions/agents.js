'use server'

import { dbServer } from '../lib/supabase/dbServer.js'

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
  const fullAgentData = { ...agentData, user_id: userId }
  return await dbServer.createAgent(userId, fullAgentData)
}

export async function getAgent(agentId, userId) {
  return await dbServer.getAgent(agentId, userId)
}

export async function updateAgent(agentId, updates) {
  return await dbServer.updateAgent(agentId, updates)
}

export async function deleteAgent(agentId) {
  return await dbServer.deleteAgent(agentId)
}

// ─────────────────────────────
// KNOWLEDGE SOURCES
// ─────────────────────────────
export async function addKnowledgeSource(agentId, sourceData) {
  return await dbServer.addKnowledgeSource(agentId, sourceData)
}

export async function getKnowledgeSources(agentId) {
  return await dbServer.getKnowledgeSources(agentId)
}

export async function updateKnowledgeSource(sourceId, updates) {
  return await dbServer.updateKnowledgeSource(sourceId, updates)
}

export async function deleteKnowledgeSource(sourceId) {
  return await dbServer.deleteKnowledgeSource(sourceId)
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
