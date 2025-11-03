// lib/hooks/useAgentData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dbClient } from '../supabase/dbClient'
import { updateAgent, deleteAgent , deleteConversation} from '../../app/actions/agents'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

// Query Keys
export const agentKeys = {
  all: ['agents'],
  detail: (id) => ['agents', id],
  conversations: (id) => ['agents', id, 'conversations'],
  analytics: (id) => ['agents', id, 'analytics'],
}

// Fetch agent data
export function useAgent(id) {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: async () => {
      if (!id) throw new Error('Agent ID is required')
      const data = await dbClient.getAgent(id)
      if (!data) throw new Error('Agent not found')
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

// Fetch conversations
export function useConversation(id) {
  return useQuery({
    queryKey: agentKeys.conversations(id),
    queryFn: async () => {
      if (!id) return []
      const data = await dbClient.getConversations(id)
      return data || []
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Fetch analytics
export function useAnalytics(id) {
  return useQuery({
    queryKey: agentKeys.analytics(id),
    queryFn: async () => {
      if (!id) return []
      const data = await dbClient.getAnalytics(id)
      return data || []
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Update agent mutation
export function useUpdateAgent(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates) => updateAgent(id, updates),
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: agentKeys.detail(id) })

      // Snapshot previous value
      const previousAgent = queryClient.getQueryData(agentKeys.detail(id))

      // Optimistically update
      queryClient.setQueryData(agentKeys.detail(id), (old) => ({
        ...old,
        ...updates,
      }))

      return { previousAgent }
    },
    onError: (err, updates, context) => {
      // Rollback on error
      queryClient.setQueryData(agentKeys.detail(id), context.previousAgent)
      toast.error('Failed to update agent')
    },
    onSuccess: (data) => {
      queryClient.setQueryData(agentKeys.detail(id), data)
      toast.success('Agent updated successfully')
    },
  })
}

// Toggle agent status
export function useToggleAgentStatus(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const currentAgent = queryClient.getQueryData(agentKeys.detail(id))
      return updateAgent(id, { is_active: !currentAgent.is_active })
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: agentKeys.detail(id) })
      const previousAgent = queryClient.getQueryData(agentKeys.detail(id))

      queryClient.setQueryData(agentKeys.detail(id), (old) => ({
        ...old,
        is_active: !old.is_active,
      }))

      return { previousAgent }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(agentKeys.detail(id), context.previousAgent)
      toast.error('Failed to update agent status')
    },
    onSuccess: (data) => {
      toast.success(`Agent ${data.is_active ? 'activated' : 'deactivated'} successfully`)
    },
  })
}

// Delete agent mutation
export function useDeleteAgent() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      toast.success('Agent deleted successfully')
      queryClient.invalidateQueries({ queryKey: agentKeys.all })
      router.push('/agents/dashboard')
    },
    onError: () => {
      toast.error('Failed to delete agent')
    },
  })
}

// Prefetch conversations (call when hovering over conversations tab)
export function usePrefetchConversations(id) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: agentKeys.conversations(id),
      queryFn: () => dbClient.getConversations(id),
      staleTime: 2 * 60 * 1000,
    })
  }
}

// Prefetch analytics
export function usePrefetchAnalytics(id) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: agentKeys.analytics(id),
      queryFn: () => dbClient.getAnalytics(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}

// lib/hooks/useAgentData.js
// ... (keep all previous hooks)

// Fetch conversations with pagination support
export function useConversations(id, limit = 200) {
  return useQuery({
    queryKey: agentKeys.conversations(id),
    queryFn: async () => {
      if (!id) return []
      const data = await dbClient.getConversations(id, limit)
      return data || []
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => data, // Can add sorting/filtering here
  })
}

// Calculate stats from conversations - memoized with React Query
export function useConversationStats(id) {
  const { data: conversations = [] } = useConversations(id)

  return useQuery({
    queryKey: ['conversations-stats', id],
    queryFn: () => {
      if (!conversations.length) {
        return {
          totalConversations: 0,
          totalSessions: 0,
          avgMessagesPerSession: 0,
          avgResponseTime: 0,
          totalTokens: 0
        }
      }

      const uniqueSessions = new Set(conversations.map((c) => c.session_id))
      const totalSessions = uniqueSessions.size
      const totalConversations = conversations.length
      const avgMessagesPerSession = totalSessions > 0 ? totalConversations / totalSessions : 0

      const responseTimes = conversations
        .map((c) => c.metadata?.response_time_ms)
        .filter(Boolean)
      const avgResponseTime =
        responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0

      const totalTokens = conversations
        .map((c) => c.metadata?.tokens_used || 0)
        .reduce((a, b) => a + b, 0)

      return {
        totalConversations,
        totalSessions,
        avgMessagesPerSession: parseFloat(avgMessagesPerSession.toFixed(1)),
        avgResponseTime: Math.round(avgResponseTime),
        totalTokens
      }
    },
    enabled: conversations.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Delete conversation mutation
export function useDeleteConversation(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteConversation,
    onMutate: async (conversationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: agentKeys.conversations(id) })

      // Snapshot previous value
      const previousConversations = queryClient.getQueryData(agentKeys.conversations(id))

      // Optimistically update
      queryClient.setQueryData(agentKeys.conversations(id), (old) =>
        old?.filter((c) => c.id !== conversationId) || []
      )

      return { previousConversations }
    },
    onError: (err, conversationId, context) => {
      // Rollback on error
      queryClient.setQueryData(
        agentKeys.conversations(id),
        context.previousConversations
      )
      toast.error('Failed to delete conversation')
    },
    onSuccess: () => {
      toast.success('Conversation deleted')
      // Invalidate stats to recalculate
      queryClient.invalidateQueries({ queryKey: ['conversations-stats', id] })
    },
  })
}

// Get unique sessions from conversations
export function useUniqueSessions(id) {
  const { data: conversations = [] } = useConversations(id)

  return useMemo(
    () => [...new Set(conversations.map((c) => c.session_id))].slice(0, 20),
    [conversations]
  )
}   
// Add to lib/hooks/useAgentData.js (at the end of the file)

// Fetch knowledge sources for an agent
export function useKnowledgeSources(agentId, userId) {
  return useQuery({
    queryKey: ['knowledge-sources', agentId, userId],
    queryFn: async () => {
      if (!agentId || !userId) return []
      
      try {
        const response = await fetch(
          `/api/agents/${agentId}/knowledge/upload?userId=${userId}`
        )
        
        if (!response.ok) {
          console.warn('Failed to fetch knowledge sources')
          return []
        }
        
        const data = await response.json()
        return data.success && data.sources ? data.sources : []
      } catch (error) {
        console.error('Error fetching knowledge sources:', error)
        return []
      }
    },
    enabled: !!agentId && !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
  })
}

// Update knowledge sources mutation
export function useUpdateKnowledgeSource(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ source, userId }) => {
      // Your API call here
      return source
    },
    onMutate: async ({ source, userId }) => {
      await queryClient.cancelQueries({ 
        queryKey: ['knowledge-sources', agentId, userId] 
      })

      const previousSources = queryClient.getQueryData([
        'knowledge-sources',
        agentId,
        userId
      ])

      // Optimistically update
      queryClient.setQueryData(
        ['knowledge-sources', agentId, userId],
        (old) => {
          if (!old) return [source]
          
          if (source._deleted) {
            return old.filter((s) => s.id !== source.id)
          }
          
          const exists = old.find((s) => s.id === source.id)
          if (exists) {
            return old.map((s) => (s.id === source.id ? { ...s, ...source } : s))
          }
          
          return [...old, source]
        }
      )

      return { previousSources }
    },
    onError: (err, { source, userId }, context) => {
      queryClient.setQueryData(
        ['knowledge-sources', agentId, userId],
        context.previousSources
      )
      toast.error('Failed to update knowledge source')
    },
    onSuccess: (data, { source }) => {
      if (source._deleted) {
        toast.success('Knowledge source removed')
      } else {
        toast.success('Knowledge source updated')
      }
    },
  })
}
// Add to lib/hooks/useAgentData.js (at the end)

// Send chat message mutation
export function useSendChatMessage(agentId) {
  return useMutation({
    mutationFn: async ({ message, sessionId, userId, metadata = {} }) => {
      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId,
          userId,
          metadata: { ...metadata, playground: true },
          useKnowledgeBase: true,
          knowledgeSearchThreshold: 0.3,
          knowledgeResultLimit: 10
        }),
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      return data
    },
  })
}

// Add knowledge mutation
export function useAddKnowledge(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ instructions, userId }) => {
      const response = await fetch(`/api/agents/${agentId}/knowledge-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructions, userId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate knowledge sources to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['knowledge-sources', agentId] 
      })
      
      if (data.knowledgeSource) {
        const vectorStats = `Created ${data.knowledgeSource.vectorCount} vectors from ${data.knowledgeSource.chunkCount} chunks`
        toast.success(vectorStats)
      } else {
        toast.success('Knowledge updated successfully!')
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update knowledge')
    },
  })
}

// Delete knowledge source from playground
export function useDeleteKnowledgeSource(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sourceId) => {
      const response = await fetch(`/api/agents/${agentId}/knowledge/${sourceId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete knowledge source')
      }

      return response.json()
    },
    onMutate: async (sourceId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['knowledge-sources', agentId] 
      })

      // Snapshot previous value
      const previousSources = queryClient.getQueryData([
        'knowledge-sources', 
        agentId
      ])

      // Optimistically remove
      queryClient.setQueryData(
        ['knowledge-sources', agentId],
        (old) => old?.filter(s => s.id !== sourceId) || []
      )

      return { previousSources }
    },
    onError: (err, sourceId, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['knowledge-sources', agentId],
        context.previousSources
      )
      toast.error('Failed to delete knowledge source')
    },
    onSuccess: () => {
      toast.success('Knowledge source deleted successfully')
    },
  })
}
// Add to lib/hooks/useAgentData.js (at the end)

// Fetch test accounts for an agent
export function useTestAccounts(agentId) {
  return useQuery({
    queryKey: ['test-accounts', agentId],
    queryFn: async () => {
      if (!agentId) return { testAccounts: [], stats: {} }
      
      const response = await fetch(`/api/agents/${agentId}/test-accounts`, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch test accounts')
      }

      const data = await response.json()
      return {
        testAccounts: data.testAccounts || [],
        stats: data.stats || {}
      }
    },
    enabled: !!agentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Create test account mutation
export function useCreateTestAccount(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inviteData) => {
      const response = await fetch(`/api/agents/${agentId}/test-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create test account')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['test-accounts', agentId] })
      
      toast.success(
        data.emailSent
          ? 'Test account created and invitation sent!'
          : 'Test account created but email failed to send.'
      )
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create test account')
    },
  })
}

// Delete test account mutation
export function useDeleteTestAccount(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (accountId) => {
      const response = await fetch(
        `/api/agents/${agentId}/test-accounts/${accountId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete test account')
      }

      return response.json()
    },
    onMutate: async (accountId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['test-accounts', agentId] })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['test-accounts', agentId])

      // Optimistically remove
      queryClient.setQueryData(['test-accounts', agentId], (old) => {
        if (!old) return old
        return {
          ...old,
          testAccounts: old.testAccounts.filter((acc) => acc.id !== accountId)
        }
      })

      return { previousData }
    },
    onError: (err, accountId, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['test-accounts', agentId],
        context.previousData
      )
      toast.error('Failed to delete test account')
    },
    onSuccess: () => {
      toast.success('Test account deleted successfully')
    },
  })
}

// Update test account mutation
export function useUpdateTestAccount(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ accountId, updates }) => {
      const response = await fetch(
        `/api/agents/${agentId}/test-accounts/${accountId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update test account')
      }

      return response.json()
    },
    onMutate: async ({ accountId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['test-accounts', agentId] })

      const previousData = queryClient.getQueryData(['test-accounts', agentId])

      // Optimistically update
      queryClient.setQueryData(['test-accounts', agentId], (old) => {
        if (!old) return old
        return {
          ...old,
          testAccounts: old.testAccounts.map((acc) =>
            acc.id === accountId ? { ...acc, ...updates } : acc
          )
        }
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['test-accounts', agentId],
        context.previousData
      )
      toast.error('Failed to update test account')
    },
    onSuccess: () => {
      toast.success('Test account updated successfully')
    },
  })
}

// Copy test link mutation (local only)
export function useCopyTestLink() {
  return useMutation({
    mutationFn: async (link) => {
      await navigator.clipboard.writeText(link)
      return true
    },
    onSuccess: () => {
      toast.success('Link copied to clipboard!')
    },
    onError: () => {
      toast.error('Failed to copy link')
    },
  })
}
// Add to lib/hooks/useAgentData.js (at the end)

// Fetch webhooks for an agent
export function useWebhooks(agentId) {
  return useQuery({
    queryKey: ['webhooks', agentId],
    queryFn: async () => {
      if (!agentId) return []
      
      const response = await fetch(`/api/agents/${agentId}/webhook`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch webhooks')
      }
      
      const data = await response.json()
      return data.webhooks || []
    },
    enabled: !!agentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Fetch webhook invocations
export function useWebhookInvocations(webhookId, enabled = true) {
  return useQuery({
    queryKey: ['webhook-invocations', webhookId],
    queryFn: async () => {
      if (!webhookId) return []
      
      const response = await fetch(
        `/api/agent-webhooks/${webhookId}/invocations?limit=50`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch invocations')
      }
      
      const data = await response.json()
      
      // Normalize data
      const invocations = Array.isArray(data.invocations)
        ? data.invocations
        : data.invocations && typeof data.invocations === 'object'
          ? Object.values(data.invocations)
          : []
      
      return invocations
    },
    enabled: !!webhookId && enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  })
}

// Calculate webhook stats from invocations
export function useWebhookStats(webhookId) {
  const { data: invocations = [] } = useWebhookInvocations(webhookId)

  return useMemo(() => {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const totalInvocations = invocations.length
    const successful = invocations.filter((i) => i.success).length
    const successRate =
      totalInvocations > 0
        ? ((successful / totalInvocations) * 100).toFixed(1)
        : 0
    const last24hCount = invocations.filter(
      (i) => new Date(i.created_at) >= last24h
    ).length

    const responseTimes = invocations
      .filter((i) => i.response_time_ms)
      .map((i) => i.response_time_ms)

    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          )
        : 0

    return {
      totalInvocations,
      successRate,
      avgResponseTime,
      last24h: last24hCount
    }
  }, [invocations])
}

// Create webhook mutation
export function useCreateWebhook(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (webhookData) => {
      const response = await fetch(`/api/agents/${agentId}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      })

      if (!response.ok) {
        throw new Error('Failed to create webhook')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', agentId] })
      toast.success('Webhook created successfully!')
    },
    onError: () => {
      toast.error('Failed to create webhook')
    },
  })
}

// Update webhook mutation
export function useUpdateWebhook(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ webhookId, updates }) => {
      const response = await fetch(`/api/agent-webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update webhook')
      }

      return response.json()
    },
    onMutate: async ({ webhookId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['webhooks', agentId] })

      const previousWebhooks = queryClient.getQueryData(['webhooks', agentId])

      // Optimistically update
      queryClient.setQueryData(['webhooks', agentId], (old) =>
        old?.map((w) => (w.id === webhookId ? { ...w, ...updates } : w)) || []
      )

      return { previousWebhooks }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['webhooks', agentId], context.previousWebhooks)
      toast.error('Failed to update webhook')
    },
    onSuccess: () => {
      toast.success('Webhook updated successfully!')
    },
  })
}

// Delete webhook mutation
export function useDeleteWebhook(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (webhookId) => {
      const response = await fetch(`/api/agent-webhooks/${webhookId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete webhook')
      }

      return response.json()
    },
    onMutate: async (webhookId) => {
      await queryClient.cancelQueries({ queryKey: ['webhooks', agentId] })

      const previousWebhooks = queryClient.getQueryData(['webhooks', agentId])

      // Optimistically remove
      queryClient.setQueryData(['webhooks', agentId], (old) =>
        old?.filter((w) => w.id !== webhookId) || []
      )

      return { previousWebhooks }
    },
    onError: (err, webhookId, context) => {
      queryClient.setQueryData(['webhooks', agentId], context.previousWebhooks)
      toast.error('Failed to delete webhook')
    },
    onSuccess: () => {
      toast.success('Webhook deleted successfully!')
    },
  })
}

// Toggle webhook status
export function useToggleWebhook(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ webhookId, isActive }) => {
      const response = await fetch(`/api/agent-webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      })

      if (!response.ok) {
        throw new Error('Failed to update webhook')
      }

      return response.json()
    },
    onMutate: async ({ webhookId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['webhooks', agentId] })

      const previousWebhooks = queryClient.getQueryData(['webhooks', agentId])

      // Optimistically toggle
      queryClient.setQueryData(['webhooks', agentId], (old) =>
        old?.map((w) =>
          w.id === webhookId ? { ...w, is_active: !isActive } : w
        ) || []
      )

      return { previousWebhooks }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['webhooks', agentId], context.previousWebhooks)
      toast.error('Failed to update webhook')
    },
    onSuccess: (data, { isActive }) => {
      toast.success(`Webhook ${!isActive ? 'activated' : 'deactivated'}`)
    },
  })
}

// Regenerate webhook key
export function useRegenerateWebhookKey(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (webhookId) => {
      const response = await fetch(
        `/api/agent-webhooks/${webhookId}/regenerate-key`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw new Error('Failed to regenerate key')
      }

      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', agentId] })
      
      // Copy new key to clipboard
      navigator.clipboard.writeText(data.auth_token)
      toast.success('API key regenerated and copied to clipboard!')
    },
    onError: () => {
      toast.error('Failed to regenerate key')
    },
  })
}

// Copy webhook URL (local only)
export function useCopyWebhookUrl() {
  return useMutation({
    mutationFn: async (webhookId) => {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/agent-webhooks/${webhookId}/invoke`
      await navigator.clipboard.writeText(url)
      return url
    },
    onSuccess: () => {
      toast.success('Webhook URL copied to clipboard!')
    },
    onError: () => {
      toast.error('Failed to copy URL')
    },
  })
}
// Add to lib/hooks/useAgentData.js if not present

// Create agent mutation (for draft creation)
export function useCreateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, agentData }) => {
      return await createAgent(userId, agentData)
    },
    onSuccess: (data) => {
      // Invalidate agents list
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent draft created')
    },
    onError: () => {
      toast.error('Failed to create agent draft')
    },
  })
}

// Finalize agent mutation (activate)
export function useFinalizeAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ agentId, updates }) => {
      return await updateAgent(agentId, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent created successfully!')
    },
    onError: () => {
      toast.error('Failed to finalize agent')
    },
  })
}
// Add to lib/hooks/useAgentData.js if not already present

// Create agent via NLP (for AI-assisted creation)
export function useCreateAgentNLP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, agentData }) => {
      // This should match your NLP agent creation endpoint
      const response = await fetch('/api/agents/create-nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...agentData })
      })

      if (!response.ok) {
        throw new Error('Failed to create agent')
      }

      return response.json()
    },
    onSuccess: (agent) => {
      // Invalidate agents list to show new agent
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent created successfully!')
    },
    onError: () => {
      toast.error('Failed to create agent')
    },
  })
}

// Add to lib/hooks/useAgentData.js (at the end)

// Fetch all agents for current user
export function useAgents(userId) {
  return useQuery({
    queryKey: ['agents', userId],
    queryFn: async () => {
      if (!userId) return []
      
      const agents = await dbClient.getUserAgents(userId)
      return agents || []
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Fetch dashboard analytics
export function useDashboardAnalytics(agents = []) {
  return useQuery({
    queryKey: ['dashboard-analytics', agents.map(a => a.id)],
    queryFn: async () => {
      if (!agents.length) {
        return {
          totalConversations: 0,
          totalAgents: 0,
          creditsUsed: 0,
          successRate: 0,
          activeAgents: 0
        }
      }

      // Fetch analytics for all agents in parallel
      const analyticsPromises = agents.map((agent) =>
        dbClient.getAnalytics(agent.id).catch(() => [])
      )
      const allAgentAnalytics = await Promise.all(analyticsPromises)

      // Calculate aggregated metrics
      let totalConversations = 0
      let totalCreditsUsed = 0
      let successfulInteractions = 0
      let totalInteractions = 0

      allAgentAnalytics.flat().forEach((record) => {
        if (record.event_type === 'conversation') {
          totalConversations++
          totalInteractions++
          if (record.success) successfulInteractions++
        }
        totalCreditsUsed += record.tokens_used || 0
      })

      return {
        totalConversations,
        totalAgents: agents.length,
        creditsUsed: totalCreditsUsed,
        successRate:
          totalInteractions > 0
            ? Math.round((successfulInteractions / totalInteractions) * 100)
            : 0,
        activeAgents: agents.filter((a) => a.is_active).length
      }
    },
    enabled: agents.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Add to lib/hooks/useAgentData.js (at the end)

// Submit feedback mutation
export function useSubmitFeedback() {
  return useMutation({
    mutationFn: async (formData) => {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Submission failed')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Feedback submitted successfully! 🎉')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit feedback. Please try again.')
    },
  })
}

// Send chat message mutation (for sandbox)
export function useSandboxSendChatMessage(agentId) {
  return useMutation({
    mutationFn: async ({ message, userId, metadata }) => {
      const response = await fetch(`/api/agents/${agentId}/sandbox_testing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId, metadata })
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      return data
    },
    onError: (error) => {
      console.error('Chat error:', error)
    },
  })
}
// Add these hooks to lib/hooks/useAgentData.js// lib/hooks/useWorkflowData.js
