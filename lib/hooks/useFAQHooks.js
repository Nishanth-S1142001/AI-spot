/**
 * FAQ Hooks - Updated to use mock data
 * Replace getFAQs import with real API call when backend is ready
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { getFAQs, submitFAQFeedback } from '../data/mockFAQData'

// Query Keys
export const faqKeys = {
  all: ['faqs'],
  detail: (id) => ['faqs', id],
  search: (term) => ['faqs', 'search', term]
}

/**
 * Fetch all FAQs
 * Optimized with long stale time since FAQs rarely change
 */
export function useFAQs() {
  return useQuery({
    queryKey: faqKeys.all,
    queryFn: async () => {
      // Use mock data instead of API call
      const faqs = await getFAQs()
      return faqs || []
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (FAQs don't change often)
    cacheTime: 30 * 60 * 1000, // 30 minutes in cache
    retry: 2
  })
}

/**
 * Search FAQs (client-side filtering)
 * Memoized for performance
 */
export function useSearchFAQs(faqs = [], searchTerm = '') {
  return useMemo(() => {
    if (!searchTerm.trim()) return faqs

    const term = searchTerm.toLowerCase()
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        (faq.category && faq.category.toLowerCase().includes(term)) ||
        (faq.tags && faq.tags.some((tag) => tag.toLowerCase().includes(term)))
    )
  }, [faqs, searchTerm])
}

/**
 * Group FAQs by category
 * Memoized to prevent unnecessary recalculations
 */
export function useGroupedFAQs(faqs = []) {
  return useMemo(() => {
    const grouped = faqs.reduce((acc, faq) => {
      const category = faq.category || 'General'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(faq)
      return acc
    }, {})

    // Convert to array and sort by category name
    return Object.entries(grouped)
      .map(([category, items]) => ({
        category,
        faqs: items,
        count: items.length
      }))
      .sort((a, b) => a.category.localeCompare(b.category))
  }, [faqs])
}

/**
 * Get FAQ statistics
 * Memoized calculation
 */
export function useFAQStats(faqs = []) {
  return useMemo(() => {
    const categories = new Set(faqs.map((faq) => faq.category))
    const totalQuestions = faqs.length
    const avgQuestionsPerCategory = totalQuestions / (categories.size || 1)

    return {
      totalQuestions,
      totalCategories: categories.size,
      avgQuestionsPerCategory: Math.round(avgQuestionsPerCategory)
    }
  }, [faqs])
}

/**
 * Submit FAQ feedback/rating
 * Optimistic update for immediate UI feedback
 */
export function useFAQFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ faqId, helpful }) => {
      // Use mock function instead of API call
      return await submitFAQFeedback(faqId, helpful)
    },
    onMutate: async ({ faqId, helpful }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: faqKeys.all })

      // Snapshot previous value
      const previousFAQs = queryClient.getQueryData(faqKeys.all)

      // Optimistically update the FAQ
      queryClient.setQueryData(faqKeys.all, (old) => {
        if (!old) return old

        return old.map((faq) =>
          faq.id === faqId
            ? {
                ...faq,
                helpful_count: helpful
                  ? (faq.helpful_count || 0) + 1
                  : faq.helpful_count,
                not_helpful_count: !helpful
                  ? (faq.not_helpful_count || 0) + 1
                  : faq.not_helpful_count
              }
            : faq
        )
      })

      return { previousFAQs }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(faqKeys.all, context.previousFAQs)
      toast.error('Failed to submit feedback')
    },
    onSuccess: () => {
      toast.success('Thank you for your feedback!', {
        duration: 2000,
        icon: '👍'
      })
    }
  })
}

/**
 * Prefetch FAQ detail (for hover states or preloading)
 */
export function usePrefetchFAQ() {
  const queryClient = useQueryClient()

  return (faqId) => {
    queryClient.prefetchQuery({
      queryKey: faqKeys.detail(faqId),
      queryFn: async () => {
        const faqs = await getFAQs()
        return faqs.find((f) => f.id === faqId)
      },
      staleTime: 5 * 60 * 1000 // 5 minutes
    })
  }
}

/**
 * Get popular FAQs (sorted by helpful count)
 */
export function usePopularFAQs(faqs = [], limit = 5) {
  return useMemo(() => {
    return [...faqs]
      .sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0))
      .slice(0, limit)
  }, [faqs, limit])
}

/**
 * Get recent FAQs (sorted by creation date)
 */
export function useRecentFAQs(faqs = [], limit = 5) {
  return useMemo(() => {
    return [...faqs]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
  }, [faqs, limit])
}

/**
 * Submit new FAQ request
 */
export function useSubmitFAQRequest() {
  return useMutation({
    mutationFn: async (requestData) => {
      // Mock implementation - would be real API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log('FAQ Request:', requestData)
      return { success: true }
    },
    onSuccess: () => {
      toast.success('FAQ request submitted! We\'ll review it soon.', {
        duration: 3000
      })
    },
    onError: () => {
      toast.error('Failed to submit FAQ request')
    }
  })
}

/**
 * Filter FAQs by category
 */
export function useFilteredFAQsByCategory(faqs = [], category = null) {
  return useMemo(() => {
    if (!category) return faqs
    return faqs.filter((faq) => faq.category === category)
  }, [faqs, category])
}

/**
 * Get all unique categories
 */
export function useFAQCategories(faqs = []) {
  return useMemo(() => {
    const categories = new Set(faqs.map((faq) => faq.category || 'General'))
    return Array.from(categories).sort()
  }, [faqs])
}

/**
 * Get all unique tags
 */
export function useFAQTags(faqs = []) {
  return useMemo(() => {
    const tags = new Set()
    faqs.forEach((faq) => {
      if (faq.tags && Array.isArray(faq.tags)) {
        faq.tags.forEach((tag) => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [faqs])
}