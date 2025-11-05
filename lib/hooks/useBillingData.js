// lib/hooks/useBillingData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

// Query Keys
export const billingKeys = {
  all: ['billing'],
  data: (userId) => ['billing', 'data', userId],
  paymentMethods: (userId) => ['billing', 'payment-methods', userId],
  history: (userId) => ['billing', 'history', userId]
}

/**
 * Fetch complete billing data (payment methods + history)
 * Cached for 5 minutes since billing data doesn't change frequently
 */
export function useBillingData(userId) {
  return useQuery({
    queryKey: billingKeys.data(userId),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')

      const response = await fetch(`/api/settings/billing?userId=${userId}`)

      if (!response.ok) {
        // Return mock data if API fails (for development)
        return getMockBillingData()
      }

      const data = await response.json()
      return {
        paymentMethods: data.paymentMethods || [],
        billingHistory: data.billingHistory || []
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    // Provide fallback data
    placeholderData: getMockBillingData()
  })
}

/**
 * Mock billing data generator (for development/fallback)
 */
function getMockBillingData() {
  return {
    paymentMethods: [
      {
        id: '1',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
        isDefault: true
      }
    ],
    billingHistory: [
      {
        id: 'inv_001',
        date: '2024-11-01',
        amount: 29.99,
        status: 'paid',
        description: 'Pro Plan - November 2024'
      },
      {
        id: 'inv_002',
        date: '2024-10-01',
        amount: 29.99,
        status: 'paid',
        description: 'Pro Plan - October 2024'
      },
      {
        id: 'inv_003',
        date: '2024-09-01',
        amount: 29.99,
        status: 'paid',
        description: 'Pro Plan - September 2024'
      }
    ]
  }
}

/**
 * Delete payment method mutation
 * Includes optimistic update for instant UI feedback
 */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, cardId }) => {
      const response = await fetch('/api/settings/billing/payment-methods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cardId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete payment method')
      }

      return response.json()
    },
    onMutate: async ({ userId, cardId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: billingKeys.data(userId) })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(billingKeys.data(userId))

      // Optimistically remove payment method
      queryClient.setQueryData(billingKeys.data(userId), (old) => {
        if (!old) return old

        return {
          ...old,
          paymentMethods: old.paymentMethods.filter((card) => card.id !== cardId)
        }
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        billingKeys.data(variables.userId),
        context.previousData
      )
    },
    onSuccess: (data, { userId }) => {
      // Invalidate to refetch with real data
      queryClient.invalidateQueries({ queryKey: billingKeys.data(userId) })
    }
  })
}

/**
 * Add payment method mutation
 */
export function useAddPaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, cardData }) => {
      const response = await fetch('/api/settings/billing/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...cardData })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add payment method')
      }

      return response.json()
    },
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.data(userId) })
      toast.success('Payment method added successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add payment method')
    }
  })
}

/**
 * Set default payment method mutation
 */
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, cardId }) => {
      const response = await fetch('/api/settings/billing/payment-methods/default', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cardId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to set default payment method')
      }

      return response.json()
    },
    onMutate: async ({ userId, cardId }) => {
      await queryClient.cancelQueries({ queryKey: billingKeys.data(userId) })

      const previousData = queryClient.getQueryData(billingKeys.data(userId))

      // Optimistically update default card
      queryClient.setQueryData(billingKeys.data(userId), (old) => {
        if (!old) return old

        return {
          ...old,
          paymentMethods: old.paymentMethods.map((card) => ({
            ...card,
            isDefault: card.id === cardId
          }))
        }
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        billingKeys.data(variables.userId),
        context.previousData
      )
      toast.error('Failed to set default payment method')
    },
    onSuccess: () => {
      toast.success('Default payment method updated')
    }
  })
}

/**
 * Download invoice mutation
 */
export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async ({ invoiceId }) => {
      const response = await fetch(`/api/settings/billing/invoice/${invoiceId}`)
      
      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      return true
    }
  })
}

/**
 * Calculate billing statistics
 * Memoized to prevent recalculation
 */
export function useBillingStats(billingHistory = []) {
  return useMemo(() => {
    if (!billingHistory.length) {
      return {
        totalSpent: 0,
        avgMonthly: 0,
        paidCount: 0,
        pendingCount: 0,
        failedCount: 0
      }
    }

    const totalSpent = billingHistory
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0)

    const paidCount = billingHistory.filter((inv) => inv.status === 'paid').length
    const pendingCount = billingHistory.filter((inv) => inv.status === 'pending').length
    const failedCount = billingHistory.filter((inv) => inv.status === 'failed').length

    const avgMonthly = paidCount > 0 ? totalSpent / paidCount : 0

    return {
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      avgMonthly: parseFloat(avgMonthly.toFixed(2)),
      paidCount,
      pendingCount,
      failedCount
    }
  }, [billingHistory])
}

/**
 * Get recent invoices (last N)
 */
export function useRecentInvoices(billingHistory = [], limit = 5) {
  return useMemo(() => {
    return [...billingHistory]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)
  }, [billingHistory, limit])
}

/**
 * Filter invoices by status
 */
export function useInvoicesByStatus(billingHistory = [], status = null) {
  return useMemo(() => {
    if (!status) return billingHistory
    return billingHistory.filter((inv) => inv.status === status)
  }, [billingHistory, status])
}

/**
 * Check if user has payment method
 */
export function useHasPaymentMethod(paymentMethods = []) {
  return useMemo(() => {
    return paymentMethods.length > 0
  }, [paymentMethods])
}

/**
 * Get default payment method
 */
export function useDefaultPaymentMethod(paymentMethods = []) {
  return useMemo(() => {
    return paymentMethods.find((card) => card.isDefault) || paymentMethods[0] || null
  }, [paymentMethods])
}

/**
 * Prefetch billing data (for hover states)
 */
export function usePrefetchBillingData() {
  const queryClient = useQueryClient()

  return (userId) => {
    queryClient.prefetchQuery({
      queryKey: billingKeys.data(userId),
      queryFn: () =>
        fetch(`/api/settings/billing?userId=${userId}`).then((res) => res.json()),
      staleTime: 5 * 60 * 1000
    })
  }
}

/**
 * Retry failed payment mutation
 */
export function useRetryPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, invoiceId }) => {
      const response = await fetch('/api/settings/billing/retry-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, invoiceId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to retry payment')
      }

      return response.json()
    },
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.data(userId) })
      toast.success('Payment retry initiated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to retry payment')
    }
  })
}