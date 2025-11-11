// lib/hooks/useIntegrationData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useMemo } from 'react'
import Button from '../../components/ui/button'
// ============================================
// INTEGRATIONS HOOKS
// ============================================

/**
 * Fetch all integrations for user
 */
export function useIntegrations(userId) {
  return useQuery({
    queryKey: ['integrations', userId],
    queryFn: async () => {
      if (!userId) return []

      const response = await fetch('/api/integrations')
      
      if (!response.ok) {
        throw new Error('Failed to fetch integrations')
      }

      const data = await response.json()
      return data.integrations || []
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  })
}

/**
 * Fetch specific integration details
 */
export function useIntegration(integrationId, userId) {
  return useQuery({
    queryKey: ['integration', integrationId, userId],
    queryFn: async () => {
      if (!integrationId || !userId) return null

      const response = await fetch('/api/integrations')
      
      if (!response.ok) {
        throw new Error('Failed to fetch integration')
      }

      const data = await response.json()
      const integration = data.integrations?.find(
        (i) => i.integration_type === integrationId
      )
      
      return integration || null
    },
    enabled: !!integrationId && !!userId,
    staleTime: 2 * 60 * 1000,
    retry: 1
  })
}

/**
 * Create or update integration
 */
export function useSaveIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ integrationId, data, method = 'POST' }) => {
      const url = method === 'PATCH' && integrationId 
        ? `/api/integrations/${integrationId}`
        : '/api/integrations'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save integration')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate integrations list
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      
      // Update specific integration cache
      if (data.integration) {
        queryClient.setQueryData(
          ['integration', data.integration.integration_type],
          data.integration
        )
      }

      toast.success(
        variables.method === 'PATCH' 
          ? 'Integration updated successfully' 
          : 'Integration created successfully'
      )
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Delete integration
 */
export function useDeleteIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (integrationId) => {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete integration')
      }

      return response.json()
    },
    onMutate: async (integrationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['integrations'] })

      // Snapshot previous value
      const previousIntegrations = queryClient.getQueryData(['integrations'])

      // Optimistically remove
      queryClient.setQueryData(
        ['integrations'],
        (old) => old?.filter((i) => i.id !== integrationId) || []
      )

      return { previousIntegrations }
    },
    onError: (err, integrationId, context) => {
      // Rollback on error
      queryClient.setQueryData(['integrations'], context.previousIntegrations)
      toast.error('Failed to delete integration')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Integration deleted successfully')
    }
  })
}

/**
 * Test integration connection
 */
export function useTestIntegration() {
  return useMutation({
    mutationFn: async ({ integrationType, credentials }) => {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationType, credentials })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Connection test failed')
      }

      return data
    },
    onSuccess: () => {
      toast.success('Connection test successful!')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Calculate integration stats
 */
export function useIntegrationStats(integrations = []) {
  return useMemo(() => {
    const total = integrations.length
    const connected = integrations.filter((i) => i.is_active).length
    const byCategory = integrations.reduce((acc, integration) => {
      const category = integration.config?.category || 'other'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    return {
      total,
      connected,
      disconnected: total - connected,
      byCategory
    }
  }, [integrations])
}