'use server' // top-level, entire file is server-only

import { dbServer, supabase } from '../lib/supabase/dbServer'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseServer = createServerComponentClient({ cookies })

 
 
export async function updateProfile(userId, updates) {
  return await dbServer.updateProfile(userId, updates)
}

// Agents
export async function createAgent(userId, agentData) {
 
 
  console.log('Server ', userId)
  const fullAgentData = { ...agentData, user_id: userId }  
  try {
    const agent = await dbServer.createAgent(userId, fullAgentData)
    return agent
  } catch (error) {
    console.error('Error creating agent:', error)
    throw error
  }
}

export async function updateAgent(agentId, updates) {
  return await dbServer.updateAgent(agentId, updates)
}

export async function deleteAgent(agentId) {
  return await dbServer.deleteAgent(agentId)
}

// Knowledge Sources
export async function addKnowledgeSource(agentId, sourceData) {
  return await dbServer.addKnowledgeSource(agentId, sourceData)
}

// Conversations
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

// Analytics
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

// Workflows
export async function createWorkflow(agentId, workflowData) {
  return await dbServer.createWorkflow(agentId, workflowData)
}

// Credits
export async function deductCredits(userId, amount) {
  return await dbServer.deductCredits(userId, amount)
}

export async function hasCredits(userId, required = 1) {
  return await dbServer.hasCredits(userId, required)
}
