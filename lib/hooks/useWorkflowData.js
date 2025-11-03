// lib/hooks/useWorkflowData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

/**
 * React Query hooks for Workflow Builder
 * Consistent with useAgentData.js patterns
 */

// Query Keys
export const workflowKeys = {
  all: ['workflows'],
  detail: (id) => ['workflows', id],
  executions: (id) => ['workflows', id, 'executions']
}

// Fetch workflow data (nodes, edges, config)
export function useWorkflow(id) {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: async () => {
      if (!id) throw new Error('Workflow ID is required')
      
      const response = await fetch(`/api/workflows/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch workflow')
      }
      
      const data = await response.json()
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

// Save workflow mutation
export function useSaveWorkflow(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workflowPayload) => {
      const response = await fetch(`/api/workflows/${id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowPayload)
      })

      if (!response.ok) {
        throw new Error('Failed to save workflow')
      }

      return response.json()
    },
    onMutate: async (workflowPayload) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: workflowKeys.detail(id) })

      // Snapshot previous value
      const previousWorkflow = queryClient.getQueryData(workflowKeys.detail(id))

      // Optimistically update
      queryClient.setQueryData(workflowKeys.detail(id), (old) => ({
        ...old,
        nodes: workflowPayload.nodes,
        edges: workflowPayload.edges,
        workflow: {
          ...old?.workflow,
          workflow_data: workflowPayload.workflow_data,
          is_active: workflowPayload.is_active
        }
      }))

      return { previousWorkflow }
    },
    onError: (err, workflowPayload, context) => {
      // Rollback on error
      queryClient.setQueryData(
        workflowKeys.detail(id),
        context.previousWorkflow
      )
      toast.error('Failed to save workflow')
    },
    onSuccess: () => {
      toast.success('Workflow saved!')
    },
  })
}

// Execute workflow mutation
export function useExecuteWorkflow(id) {
  return useMutation({
    mutationFn: async (executionData) => {
      const response = await fetch(`/api/workflows/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(executionData)
      })

      if (!response.ok) {
        throw new Error('Execution failed')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Workflow executed successfully!')
    },
    onError: (error) => {
      toast.error('Workflow execution failed')
    },
  })
}

// Toggle workflow active status
export function useToggleWorkflowStatus(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workflowPayload) => {
      const currentWorkflow = queryClient.getQueryData(workflowKeys.detail(id))
      const newActiveState = !currentWorkflow?.workflow?.is_active

      const response = await fetch(`/api/workflows/${id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...workflowPayload,
          is_active: newActiveState
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update workflow status')
      }

      return { ...await response.json(), newActiveState }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: workflowKeys.detail(id) })
      const previousWorkflow = queryClient.getQueryData(workflowKeys.detail(id))

      // Optimistically toggle
      queryClient.setQueryData(workflowKeys.detail(id), (old) => ({
        ...old,
        workflow: {
          ...old?.workflow,
          is_active: !old?.workflow?.is_active
        }
      }))

      return { previousWorkflow }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        workflowKeys.detail(id),
        context.previousWorkflow
      )
      toast.error('Failed to update workflow status')
    },
    onSuccess: (data) => {
      toast.success(`Workflow ${data.newActiveState ? 'activated' : 'deactivated'}!`)
    },
  })
}

// Fetch workflow executions
export function useWorkflowExecutions(id) {
  return useQuery({
    queryKey: workflowKeys.executions(id),
    queryFn: async () => {
      if (!id) return []
      
      const response = await fetch(`/api/workflows/${id}/executions`)
      if (!response.ok) {
        throw new Error('Failed to fetch executions')
      }
      
      const data = await response.json()
      return data.executions || []
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Fetch all workflows for user
export function useWorkflows() {
  return useQuery({
    queryKey: workflowKeys.all,
    queryFn: async () => {
      const response = await fetch('/api/workflows')
      if (!response.ok) {
        throw new Error('Failed to fetch workflows')
      }
      
      const data = await response.json()
      return data.workflows || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Fetch workflow executions with details
export function useWorkflowExecutionDetails(workflowId, executionId) {
  return useQuery({
    queryKey: ['workflow-execution', workflowId, executionId],
    queryFn: async () => {
      if (!workflowId || !executionId) return null
      
      const response = await fetch(`/api/workflows/${workflowId}/executions/${executionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch execution details')
      }
      
      const data = await response.json()
      return data
    },
    enabled: !!workflowId && !!executionId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Delete workflow mutation
export function useDeleteWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workflowId) => {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete workflow')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
      toast.success('Workflow deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete workflow')
    },
  })
}

// Create workflow mutation
export function useCreateWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workflowData) => {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      })

      if (!response.ok) {
        throw new Error('Failed to create workflow')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all })
      toast.success('Workflow created successfully')
    },
    onError: () => {
      toast.error('Failed to create workflow')
    },
  })
}