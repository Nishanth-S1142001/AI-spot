// lib/hooks/useAgentData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dbClient } from '../supabase/dbClient'
import {
  createAgent,
  updateAgent,
  deleteAgent,
  deleteConversation
} from '../../app/actions/agents'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

// Query Keys
export const agentKeys = {
  all: ['agents'],
  detail: (id) => ['agents', id],
  conversations: (id) => ['agents', id, 'conversations'],
  analytics: (id) => ['agents', id, 'analytics']
}

// Fetch agent data
// Fetch agent data
export function useAgent(id) {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: async () => {
      if (!id) throw new Error('Agent ID is required')

      console.log('🔍 Fetching agent:', id)
      const data = await dbClient.getAgent(id)

      if (!data) throw new Error('Agent not found')

      console.log('✅ Agent fetched:', data)
      return data
    },
    enabled: !!id,
    staleTime: 30000, // ✅ 30 seconds
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false, // ✅ Don't refetch
    refetchOnWindowFocus: false, // ✅ Don't refetch
    retry: 1
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
    staleTime: 2 * 60 * 1000 // 2 minutes
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
    staleTime: 5 * 60 * 1000 // 5 minutes
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
        ...updates
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
    }
  })
}

// Toggle agent status
// Toggle agent status
// ============================================================================
// CRITICAL FIX: useToggleAgentStatus
// Replace ONLY this function in lib/hooks/useAgentData.js
// ============================================================================

// Toggle agent status
export function useToggleAgentStatus(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const currentAgent = queryClient.getQueryData(agentKeys.detail(id))

      console.log('===== BEFORE UPDATE =====')
      console.log('Current agent from cache:', currentAgent)
      console.log('is_active value:', currentAgent?.is_active)
      console.log('Type:', typeof currentAgent?.is_active)
      console.log('Sending to server:', { is_active: currentAgent?.is_active })
      console.log('========================')

      const result = await updateAgent(id, {
        is_active: currentAgent?.is_active
      })

      console.log('===== AFTER UPDATE =====')
      console.log('Result from server:', result)
      console.log('Result is_active:', result?.is_active)
      console.log('========================')

      return result
    },
    onMutate: async () => {
      console.log('⏳ onMutate - starting optimistic update')

      await queryClient.cancelQueries({ queryKey: agentKeys.detail(id) })
      const previousAgent = queryClient.getQueryData(agentKeys.detail(id))

      // Optimistically update
      queryClient.setQueryData(agentKeys.detail(id), (old) => {
        if (!old) return old
        return {
          ...old,
          is_active: !old.is_active
        }
      })

      return { previousAgent }
    },
    onError: (err, variables, context) => {
      console.error('❌ onError - toggle failed:', err)
      queryClient.setQueryData(agentKeys.detail(id), context.previousAgent)
      toast.error(err?.message || 'Failed to update agent status')
    },
    onSuccess: (data) => {
      console.log('✅ Success:', data)

      if (!data) return

      // ✅ ONLY set data - don't refetch!
      queryClient.setQueryData(agentKeys.detail(id), data)

      // ✅ Only invalidate the list (not the detail)
      queryClient.invalidateQueries({
        queryKey: agentKeys.all,
        exact: false
      })

      toast.success(
        `Agent ${data.is_active ? 'activated' : 'deactivated'} successfully`
      )
    }
  })
}

// Delete agent mutation
// lib/hooks/useAgentData.js

// ============================================================================
// ENHANCED DELETE AGENT WITH DEPENDENCY CHECKING
// Replace the existing useDeleteAgent function
// ============================================================================

/**
 * Fetch agent dependencies before deletion
 * Used to show warning to user
 */
export function useAgentDependencies(agentId) {
  return useQuery({
    queryKey: ['agent-dependencies', agentId],
    queryFn: async () => {
      if (!agentId) return null

      const response = await fetch(`/api/agents/${agentId}/dependencies`)

      if (!response.ok) {
        throw new Error('Failed to fetch dependencies')
      }

      return response.json()
    },
    enabled: false, // Only fetch when explicitly called
    staleTime: 0, // Always fetch fresh data
    retry: 1
  })
}

/**
 * Delete agent mutation with dependency handling
 */
export function useDeleteAgent(agentId, userId, onDeleteSuccess) {  // ✅ Add callback parameter
  const queryClient = useQueryClient()  // ✅ Remove router

  return useMutation({
    mutationFn: async () => {
      console.log('🗑️ Starting agent deletion...', { agentId, userId })
      
      // Call the server action
      const result = await deleteAgent(agentId, userId)
      
      console.log('✅ Agent deleted successfully:', result)
      return result
    },
    onMutate: async () => {
      console.log('⏳ onMutate - preparing for deletion')
      
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: agentKeys.all })
      await queryClient.cancelQueries({ queryKey: agentKeys.detail(agentId) })

      // Snapshot previous data
      const previousAgents = queryClient.getQueryData(agentKeys.all)
      const previousAgent = queryClient.getQueryData(agentKeys.detail(agentId))

      // Optimistically remove from list
      queryClient.setQueryData(
        agentKeys.all,
        (old) => old?.filter((a) => a.id !== agentId) || []
      )

      return { previousAgents, previousAgent }
    },
    onError: (error, variables, context) => {
      console.error('❌ Delete agent failed:', error)
      
      // Rollback on error
      if (context?.previousAgents) {
        queryClient.setQueryData(agentKeys.all, context.previousAgents)
      }
      if (context?.previousAgent) {
        queryClient.setQueryData(
          agentKeys.detail(agentId),
          context.previousAgent
        )
      }

      toast.error(error.message || 'Failed to delete agent')
    },
    onSuccess: (result) => {
      console.log('✅ onSuccess - cleaning up')
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: agentKeys.all })
      queryClient.removeQueries({ queryKey: agentKeys.detail(agentId) })
      queryClient.removeQueries({ queryKey: agentKeys.conversations(agentId) })
      queryClient.removeQueries({ queryKey: agentKeys.analytics(agentId) })

      // Show success message
      toast.success('Agent deleted successfully')

      // ✅ Call the callback for navigation
      console.log('🔄 Calling navigation callback...')
      if (onDeleteSuccess) {
        onDeleteSuccess(result)
      }
    },
    onSettled: () => {
      console.log('🏁 onSettled - mutation complete')
      
      // Always refetch agents list
      queryClient.invalidateQueries({ queryKey: agentKeys.all })
    }
  })
}

// Prefetch conversations (call when hovering over conversations tab)
export function usePrefetchConversations(id) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: agentKeys.conversations(id),
      queryFn: () => dbClient.getConversations(id),
      staleTime: 2 * 60 * 1000
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
      staleTime: 5 * 60 * 1000
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
    select: (data) => data // Can add sorting/filtering here
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
      const avgMessagesPerSession =
        totalSessions > 0 ? totalConversations / totalSessions : 0

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
    staleTime: 5 * 60 * 1000 // 5 minutes
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
      const previousConversations = queryClient.getQueryData(
        agentKeys.conversations(id)
      )

      // Optimistically update
      queryClient.setQueryData(
        agentKeys.conversations(id),
        (old) => old?.filter((c) => c.id !== conversationId) || []
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
    }
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
    retry: 1
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
            return old.map((s) =>
              s.id === source.id ? { ...s, ...source } : s
            )
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
    }
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
        })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      return data
    }
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
    }
  })
}

// Delete knowledge source from playground
export function useDeleteKnowledgeSource(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sourceId) => {
      const response = await fetch(
        `/api/agents/${agentId}/knowledge/${sourceId}`,
        {
          method: 'DELETE'
        }
      )

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
        (old) => old?.filter((s) => s.id !== sourceId) || []
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
    }
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
    staleTime: 2 * 60 * 1000 // 2 minutes
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
    }
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
      queryClient.setQueryData(['test-accounts', agentId], context.previousData)
      toast.error('Failed to delete test account')
    },
    onSuccess: () => {
      toast.success('Test account deleted successfully')
    }
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
      queryClient.setQueryData(['test-accounts', agentId], context.previousData)
      toast.error('Failed to update test account')
    },
    onSuccess: () => {
      toast.success('Test account updated successfully')
    }
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
    }
  })
}
// Add to lib/hooks/useAgentData.js (at the end)

// Fetch webhooks for an agent
// WEBHOOK HOOKS FIX
// Add this new hook to lib/hooks/useAgentData.js after the useWebhooks function

// Fetch webhooks for an agent (keep existing)
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
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

// ✅ NEW: Fetch webhooks for ALL agents at once (fixes Rules of Hooks violation)
export function useAllWebhooks(agents = []) {
  return useQuery({
    queryKey: [
      'all-webhooks',
      agents
        .map((a) => a.id)
        .sort()
        .join(',')
    ],
    queryFn: async () => {
      if (!agents.length) return {}

      // Fetch webhooks for all agents in parallel
      const webhookPromises = agents.map(async (agent) => {
        try {
          const response = await fetch(`/api/agents/${agent.id}/webhook`)
          if (!response.ok) return { agentId: agent.id, webhooks: [] }

          const data = await response.json()
          return { agentId: agent.id, webhooks: data.webhooks || [] }
        } catch (error) {
          console.error(
            `Failed to fetch webhooks for agent ${agent.id}:`,
            error
          )
          return { agentId: agent.id, webhooks: [] }
        }
      })

      const results = await Promise.all(webhookPromises)

      // Convert to object keyed by agent ID
      return results.reduce((acc, { agentId, webhooks }) => {
        acc[agentId] = webhooks
        return acc
      }, {})
    },
    enabled: agents.length > 0,
    staleTime: 2 * 60 * 1000 // 2 minutes
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
    refetchInterval: 30 * 1000 // Auto-refresh every 30 seconds
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
    }
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
      queryClient.setQueryData(
        ['webhooks', agentId],
        (old) =>
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
    }
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
      queryClient.setQueryData(
        ['webhooks', agentId],
        (old) => old?.filter((w) => w.id !== webhookId) || []
      )

      return { previousWebhooks }
    },
    onError: (err, webhookId, context) => {
      queryClient.setQueryData(['webhooks', agentId], context.previousWebhooks)
      toast.error('Failed to delete webhook')
    },
    onSuccess: () => {
      toast.success('Webhook deleted successfully!')
    }
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
      queryClient.setQueryData(
        ['webhooks', agentId],
        (old) =>
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

// Fetch dashboard analytics
export function useDashboardAnalytics(agents = []) {
  return useQuery({
    queryKey: ['dashboard-analytics', agents.map((a) => a.id)],
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
    staleTime: 1 * 60 * 1000 // 1 minute
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
      toast.error(
        error.message || 'Failed to submit feedback. Please try again.'
      )
    }
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
    }
  })
}

// Fetch SMS configuration
export function useSmsConfig(agentId, userId) {
  return useQuery({
    queryKey: ['sms-config', agentId, userId],
    queryFn: async () => {
      if (!agentId || !userId) return null

      const response = await fetch(
        `/api/agents/${agentId}/sms-config?userId=${userId}`
      )

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch SMS config')
      }

      return response.json()
    },
    enabled: !!agentId && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  })
}

// Create SMS configuration
export function useCreateSmsConfig(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, provider, config, settings }) => {
      const response = await fetch(`/api/agents/${agentId}/sms-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, provider, config, settings })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create SMS configuration')
      }

      return response.json()
    },
    onSuccess: (data, { userId }) => {
      queryClient.setQueryData(['sms-config', agentId, userId], data)
      toast.success('SMS configuration created successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}

// Update SMS settings
export function useUpdateSmsConfig(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, settings, isActive }) => {
      const response = await fetch(`/api/agents/${agentId}/sms-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, settings, isActive })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update settings')
      }

      return response.json()
    },
    onMutate: async ({ userId, settings, isActive }) => {
      await queryClient.cancelQueries({
        queryKey: ['sms-config', agentId, userId]
      })

      const previousConfig = queryClient.getQueryData([
        'sms-config',
        agentId,
        userId
      ])

      // Optimistically update
      if (previousConfig) {
        queryClient.setQueryData(['sms-config', agentId, userId], (old) => ({
          ...old,
          ...(settings && {
            auto_reply_enabled: settings.autoReply,
            greeting_message: settings.greetingMessage,
            fallback_message: settings.fallbackMessage,
            max_response_length: settings.maxResponseLength,
            rate_limit_per_number: settings.rateLimit
          }),
          ...(isActive !== undefined && { is_active: isActive })
        }))
      }

      return { previousConfig }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['sms-config', agentId, variables.userId],
        context.previousConfig
      )
      toast.error(err.message)
    },
    onSuccess: (data, { userId, isActive }) => {
      queryClient.setQueryData(['sms-config', agentId, userId], data)

      if (isActive !== undefined) {
        toast.success(`SMS bot ${isActive ? 'activated' : 'deactivated'}!`)
      } else {
        toast.success('Settings updated successfully!')
      }
    }
  })
}

// Test SMS connection
export function useTestSmsConnection(agentId) {
  return useMutation({
    mutationFn: async ({ userId, testType, testPhoneNumber }) => {
      const response = await fetch(`/api/agents/${agentId}/sms-config/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, testType, testPhoneNumber })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Test failed')
      }

      return data
    },
    onSuccess: (data, { testType }) => {
      if (testType === 'connection') {
        toast.success('Connection test successful!')
      } else {
        toast.success('Test SMS sent successfully!')
      }
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}

// Copy webhook URL (local only)
export function useCopySmsWebhookUrl() {
  return useMutation({
    mutationFn: async (url) => {
      await navigator.clipboard.writeText(url)
      return url
    },
    onSuccess: () => {
      toast.success('Webhook URL copied!')
    },
    onError: () => {
      toast.error('Failed to copy URL')
    }
  })
}

// Fetch bookings
export function useBookings(agentId, limit = 100) {
  return useQuery({
    queryKey: ['bookings', agentId],
    queryFn: async () => {
      if (!agentId) return []

      const response = await fetch(
        `/api/agents/${agentId}/bookings?limit=${limit}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      return data.bookings || []
    },
    enabled: !!agentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000 // Auto-refresh every 5 minutes
  })
}

// Fetch calendar configuration
export function useCalendarConfig(agentId) {
  return useQuery({
    queryKey: ['calendar-config', agentId],
    queryFn: async () => {
      if (!agentId) return null

      const response = await fetch(`/api/agents/${agentId}/calendar`)

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch calendar config')
      }

      const data = await response.json()
      return data.calendar || null
    },
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}

// Update booking status (cancel, confirm, etc.)
export function useUpdateBooking(agentId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookingId, action, reason }) => {
      const response = await fetch(`/api/agents/${agentId}/bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          action,
          cancellation_reason: reason
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update booking')
      }

      return response.json()
    },
    onMutate: async ({ bookingId, action }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bookings', agentId] })

      // Snapshot previous value
      const previousBookings = queryClient.getQueryData(['bookings', agentId])

      // Optimistically update
      queryClient.setQueryData(['bookings', agentId], (old) => {
        if (!old) return old

        return old.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status:
                  action === 'cancel'
                    ? 'cancelled'
                    : action === 'confirm'
                      ? 'confirmed'
                      : booking.status
              }
            : booking
        )
      })

      return { previousBookings }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['bookings', agentId], context.previousBookings)
      toast.error(err.message)
    },
    onSuccess: (data, { action }) => {
      const actionText =
        action === 'cancel'
          ? 'cancelled'
          : action === 'confirm'
            ? 'confirmed'
            : 'updated'
      toast.success(`Booking ${actionText} successfully`)
    }
  })
}

// Calculate booking stats (memoized via React Query)
export function useBookingStats(bookings = []) {
  return useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length
    const pending = bookings.filter((b) => b.status === 'pending').length
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length
    const completed = bookings.filter((b) => b.status === 'completed').length

    return {
      confirmed,
      pending,
      cancelled,
      completed,
      total: bookings.length
    }
  }, [bookings])
}

// ============================================
// SETTINGS HOOKS
// Add these to the end of lib/hooks/useAgentData.js
// ============================================

/**
 * Fetch user settings data (profile, notifications)
 */
export function useUserSettings(userId) {
  return useQuery({
    queryKey: ['user-settings', userId],
    queryFn: async () => {
      if (!userId) return null

      const response = await fetch(`/api/settings/user/${userId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch user settings')
      }

      const data = await response.json()
      return data.settings || null
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, profileData }) => {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...profileData })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      return response.json()
    },
    onMutate: async ({ userId, profileData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-settings', userId] })

      // Snapshot previous value
      const previousSettings = queryClient.getQueryData([
        'user-settings',
        userId
      ])

      // Optimistically update
      queryClient.setQueryData(['user-settings', userId], (old) => ({
        ...old,
        ...profileData
      }))

      return { previousSettings }
    },
    onError: (err, { userId }, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['user-settings', userId],
        context.previousSettings
      )
      toast.error(err.message || 'Failed to update profile')
    },
    onSuccess: (data, { userId }) => {
      queryClient.setQueryData(['user-settings', userId], data)
      toast.success('Profile updated successfully')
    }
  })
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ userId, currentPassword, newPassword }) => {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currentPassword, newPassword })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to change password')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password')
    }
  })
}

/**
 * Update notification preferences
 */
export function useUpdateNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, notifications }) => {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...notifications })
      })

      if (!response.ok) {
        throw new Error('Failed to update notifications')
      }

      return response.json()
    },
    onMutate: async ({ userId, notifications }) => {
      await queryClient.cancelQueries({ queryKey: ['user-settings', userId] })

      const previousSettings = queryClient.getQueryData([
        'user-settings',
        userId
      ])

      // Optimistically update
      queryClient.setQueryData(['user-settings', userId], (old) => ({
        ...old,
        notifications
      }))

      return { previousSettings }
    },
    onError: (err, { userId }, context) => {
      queryClient.setQueryData(
        ['user-settings', userId],
        context.previousSettings
      )
      toast.error(err.message || 'Failed to update notifications')
    },
    onSuccess: () => {
      toast.success('Notification preferences updated')
    }
  })
}

/**
 * Upload avatar/profile picture
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, file }) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)

      const response = await fetch('/api/settings/avatar', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }

      return response.json()
    },
    onSuccess: (data, { userId }) => {
      // Update cached settings with new avatar URL
      queryClient.setQueryData(['user-settings', userId], (old) => ({
        ...old,
        avatar_url: data.avatar_url
      }))
      toast.success('Profile picture updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload avatar')
    }
  })
}
