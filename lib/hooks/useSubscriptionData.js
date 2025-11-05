// lib/hooks/useSubscriptionData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

// Query Keys
export const subscriptionKeys = {
  all: ['subscriptions'],
  usage: (userId) => ['subscriptions', 'usage', userId],
  plans: ['subscriptions', 'plans'],
  billing: (userId) => ['subscriptions', 'billing', userId]
}

/**
 * Fetch subscription usage data
 * Cached for 2 minutes since usage updates periodically
 */
export function useSubscriptionUsage(userId, currentTier = 'free') {
  return useQuery({
    queryKey: subscriptionKeys.usage(userId),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')

      const response = await fetch(`/api/settings/subscription/usage?userId=${userId}`)

      if (!response.ok) {
        // Return mock data if API fails (for development)
        return getMockUsageData(currentTier)
      }

      const data = await response.json()
      return data
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    // Provide fallback data
    placeholderData: getMockUsageData(currentTier)
  })
}

/**
 * Mock usage data generator (for development/fallback)
 */
function getMockUsageData(tier) {
  const tierLimits = {
    free: {
      agents: 1,
      conversations: 100,
      apiCredits: 1000
    },
    pro: {
      agents: -1, // unlimited
      conversations: 10000,
      apiCredits: 50000
    },
    enterprise: {
      agents: -1,
      conversations: -1,
      apiCredits: -1
    }
  }

  const limits = tierLimits[tier] || tierLimits.free

  return {
    agents: {
      used: tier === 'free' ? 1 : 3,
      limit: limits.agents
    },
    conversations: {
      used: tier === 'free' ? 47 : 847,
      limit: limits.conversations
    },
    apiCredits: {
      used: tier === 'free' ? 450 : 2450,
      limit: limits.apiCredits
    },
    period: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
    }
  }
}

/**
 * Calculate usage statistics
 * Memoized to prevent recalculation
 */
export function useUsageStats(usage) {
  return useMemo(() => {
    if (!usage) return null

    const calculatePercentage = (used, limit) => {
      if (limit === -1) return 0
      return Math.min((used / limit) * 100, 100)
    }

    const agentsPct = calculatePercentage(usage.agents.used, usage.agents.limit)
    const conversationsPct = calculatePercentage(usage.conversations.used, usage.conversations.limit)
    const creditsPct = calculatePercentage(usage.apiCredits.used, usage.apiCredits.limit)

    return {
      agents: {
        ...usage.agents,
        percentage: agentsPct,
        isWarning: agentsPct >= 80,
        isCritical: agentsPct >= 90
      },
      conversations: {
        ...usage.conversations,
        percentage: conversationsPct,
        isWarning: conversationsPct >= 80,
        isCritical: conversationsPct >= 90
      },
      apiCredits: {
        ...usage.apiCredits,
        percentage: creditsPct,
        isWarning: creditsPct >= 80,
        isCritical: creditsPct >= 90
      }
    }
  }, [usage])
}

/**
 * Upgrade subscription mutation
 * Includes optimistic updates
 */
export function useUpgradeSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, planId }) => {
      const response = await fetch('/api/settings/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upgrade subscription')
      }

      return response.json()
    },
    onMutate: async ({ userId, planId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: subscriptionKeys.usage(userId) })

      // Snapshot previous value
      const previousUsage = queryClient.getQueryData(subscriptionKeys.usage(userId))

      // Optimistically update usage limits based on new plan
      queryClient.setQueryData(subscriptionKeys.usage(userId), (old) => {
        if (!old) return old

        const newLimits = getPlanlimits(planId)
        return {
          ...old,
          agents: { ...old.agents, limit: newLimits.agents },
          conversations: { ...old.conversations, limit: newLimits.conversations },
          apiCredits: { ...old.apiCredits, limit: newLimits.apiCredits }
        }
      })

      return { previousUsage }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        subscriptionKeys.usage(variables.userId),
        context.previousUsage
      )
    },
    onSuccess: (data, { userId }) => {
      // Invalidate to refetch with real data
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.usage(userId) })
    }
  })
}

/**
 * Cancel subscription mutation
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId }) => {
      const response = await fetch('/api/settings/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel subscription')
      }

      return response.json()
    },
    onSuccess: (data, { userId }) => {
      // Invalidate usage to refetch with updated data
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.usage(userId) })
    }
  })
}

/**
 * Get plan limits (helper function)
 */
function getPlanlimits(planId) {
  const limits = {
    free: {
      agents: 1,
      conversations: 100,
      apiCredits: 1000
    },
    pro: {
      agents: -1,
      conversations: 10000,
      apiCredits: 50000
    },
    enterprise: {
      agents: -1,
      conversations: -1,
      apiCredits: -1
    }
  }

  return limits[planId] || limits.free
}

/**
 * Fetch billing history
 */
export function useBillingHistory(userId) {
  return useQuery({
    queryKey: subscriptionKeys.billing(userId),
    queryFn: async () => {
      if (!userId) return []

      const response = await fetch(`/api/settings/subscription/billing?userId=${userId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch billing history')
      }

      const data = await response.json()
      return data.invoices || []
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}

/**
 * Update payment method mutation
 */
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, paymentMethodId }) => {
      const response = await fetch('/api/settings/subscription/payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, paymentMethodId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update payment method')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Payment method updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update payment method')
    }
  })
}

/**
 * Check if user can upgrade to a specific plan
 */
export function useCanUpgrade(currentTier, targetTier) {
  return useMemo(() => {
    const planOrder = ['free', 'pro', 'enterprise']
    const currentIndex = planOrder.indexOf(currentTier)
    const targetIndex = planOrder.indexOf(targetTier)

    return {
      canUpgrade: targetIndex > currentIndex,
      isDowngrade: targetIndex < currentIndex,
      isSamePlan: targetIndex === currentIndex
    }
  }, [currentTier, targetTier])
}

/**
 * Calculate subscription cost
 */
export function useSubscriptionCost(planId, billingCycle = 'monthly') {
  return useMemo(() => {
    const monthlyPrices = {
      free: 0,
      pro: 29,
      enterprise: 99
    }

    const yearlyPrices = {
      free: 0,
      pro: 290, // ~$24/month (17% discount)
      enterprise: 990 // ~$82.50/month (17% discount)
    }

    const prices = billingCycle === 'yearly' ? yearlyPrices : monthlyPrices
    const price = prices[planId] || 0

    const discount = billingCycle === 'yearly' && price > 0
      ? Math.round((1 - (price / 12) / monthlyPrices[planId]) * 100)
      : 0

    return {
      price,
      currency: 'USD',
      billingCycle,
      discount,
      monthlyEquivalent: billingCycle === 'yearly' ? Math.round(price / 12) : price
    }
  }, [planId, billingCycle])
}

/**
 * Get upcoming invoice preview
 */
export function useUpcomingInvoice(userId, planId) {
  return useQuery({
    queryKey: ['upcoming-invoice', userId, planId],
    queryFn: async () => {
      if (!userId || !planId) return null

      const response = await fetch(
        `/api/settings/subscription/upcoming-invoice?userId=${userId}&planId=${planId}`
      )

      if (!response.ok) {
        return null
      }

      return response.json()
    },
    enabled: !!userId && !!planId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1
  })
}

/**
 * Prefetch usage data (for hover states)
 */
export function usePrefetchUsage() {
  const queryClient = useQueryClient()

  return (userId) => {
    queryClient.prefetchQuery({
      queryKey: subscriptionKeys.usage(userId),
      queryFn: () =>
        fetch(`/api/settings/subscription/usage?userId=${userId}`).then((res) => res.json()),
      staleTime: 2 * 60 * 1000
    })
  }
}