import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createSupabaseClient } from '../supabase/supabaseClient'
import toast from 'react-hot-toast'

const supabase = createSupabaseClient()

export const apiKeyKeys = {
  all: ['api-keys'],
  byProvider: (provider) => ['api-keys', provider]
}

// Fetch user's API keys (encrypted, for display only)
export function useApiKeys() {
  return useQuery({
    queryKey: apiKeyKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('id, provider, key_name, is_active, last_used_at, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Save new API key (encrypted)
export function useSaveApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ provider, apiKey, keyName }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) throw new Error('Not authenticated')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api-keys?action=save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ provider, apiKey, keyName }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save API key')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all })
      toast.success('API key saved securely! 🔒')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save API key')
    },
  })
}

// Delete API key
export function useDeleteApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (keyId) => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) throw new Error('Not authenticated')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api-keys?keyId=${keyId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete API key')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all })
      toast.success('API key deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete API key')
    },
  })
}