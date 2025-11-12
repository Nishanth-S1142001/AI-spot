// Add these hooks to lib/hooks/useAgentData.js
// Place them at the end of the file

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'

// ============================================
// ANALYTICS HOOKS
// ============================================

/**
 * Fetch comprehensive analytics for all agents
 * Optimized with parallel fetching and caching
 */
export function useComprehensiveAnalytics(userId, agents = []) {
  return useQuery({
    queryKey: ['comprehensive-analytics', userId, agents.map((a) => a.id).sort().join(',')],
    queryFn: async () => {
      if (!userId || !agents.length) {
        return {
          overview: {
            totalConversations: 0,
            totalAgents: 0,
            activeAgents: 0,
            totalTokens: 0,
            successRate: 0,
            avgResponseTime: 0,
            totalBookings: 0,
            totalWebhookCalls: 0
          },
          agentAnalytics: [],
          eventTypeBreakdown: [],
          timeSeriesData: [],
          topAgents: []
        }
      }

      try {
        // Fetch analytics for all agents in parallel
        const analyticsPromises = agents.map(async (agent) => {
          try {
            const [analytics, conversations, bookings, webhooks] = await Promise.all([
              fetch(`/api/agents/${agent.id}/analytics`).then(r => r.ok ? r.json() : { analytics: [] }),
              fetch(`/api/agents/${agent.id}/conversations?limit=1000`).then(r => r.ok ? r.json() : { conversations: [] }),
              fetch(`/api/agents/${agent.id}/bookings?limit=1000`).then(r => r.ok ? r.json() : { bookings: [] }),
              fetch(`/api/agents/${agent.id}/webhook`).then(r => r.ok ? r.json() : { webhooks: [] })
            ])

            return {
              agent,
              analytics: analytics.analytics || [],
              conversations: conversations.conversations || [],
              bookings: bookings.bookings || [],
              webhooks: webhooks.webhooks || []
            }
          } catch (error) {
            console.error(`Error fetching analytics for agent ${agent.id}:`, error)
            return {
              agent,
              analytics: [],
              conversations: [],
              bookings: [],
              webhooks: []
            }
          }
        })

        const agentAnalytics = await Promise.all(analyticsPromises)

        // Calculate overview metrics
        let totalConversations = 0
        let totalTokens = 0
        let successfulEvents = 0
        let totalEvents = 0
        let totalResponseTimes = []
        let totalBookings = 0
        let totalWebhookCalls = 0
        const eventTypeCounts = {}

        agentAnalytics.forEach(({ analytics, conversations, bookings, webhooks }) => {
          // Analytics events
          analytics.forEach(event => {
            totalEvents++
            if (event.success) successfulEvents++
            totalTokens += event.tokens_used || 0
            
            // Event type breakdown
            const eventType = event.event_type || 'unknown'
            eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1
          })

          // Conversations
          totalConversations += conversations.length
          conversations.forEach(conv => {
            if (conv.metadata?.response_time_ms) {
              totalResponseTimes.push(conv.metadata.response_time_ms)
            }
          })

          // Bookings
          totalBookings += bookings.length

          // Webhooks
          totalWebhookCalls += webhooks.reduce((sum, w) => {
            return sum + (w.invocation_count || 0)
          }, 0)
        })

        // Calculate averages
        const avgResponseTime = totalResponseTimes.length > 0
          ? Math.round(totalResponseTimes.reduce((a, b) => a + b, 0) / totalResponseTimes.length)
          : 0

        const successRate = totalEvents > 0
          ? Math.round((successfulEvents / totalEvents) * 100)
          : 0

        // Event type breakdown for charts
        const eventTypeBreakdown = Object.entries(eventTypeCounts).map(([type, count]) => ({
          name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: count,
          percentage: totalEvents > 0 ? ((count / totalEvents) * 100).toFixed(1) : 0
        }))

        // Top performing agents
        const topAgents = agentAnalytics
          .map(({ agent, conversations }) => ({
            id: agent.id,
            name: agent.name,
            conversations: conversations.length,
            interface: agent.interface
          }))
          .sort((a, b) => b.conversations - a.conversations)
          .slice(0, 5)

        // Time series data (last 30 days)
        const timeSeriesData = generateTimeSeriesData(agentAnalytics)

        return {
          overview: {
            totalConversations,
            totalAgents: agents.length,
            activeAgents: agents.filter(a => a.is_active).length,
            totalTokens,
            successRate,
            avgResponseTime,
            totalBookings,
            totalWebhookCalls
          },
          agentAnalytics: agentAnalytics.map(({ agent, analytics, conversations, bookings }) => ({
            agent,
            totalEvents: analytics.length,
            conversations: conversations.length,
            bookings: bookings.length,
            tokens: analytics.reduce((sum, a) => sum + (a.tokens_used || 0), 0)
          })),
          eventTypeBreakdown,
          timeSeriesData,
          topAgents
        }
      } catch (error) {
        console.error('Error fetching comprehensive analytics:', error)
        throw error
      }
    },
    enabled: !!userId && agents.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
}

/**
 * Generate time series data for charts
 */
function generateTimeSeriesData(agentAnalytics) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split('T')[0]
  })

  const dataByDate = {}
  last30Days.forEach(date => {
    dataByDate[date] = {
      date,
      conversations: 0,
      bookings: 0,
      tokens: 0,
      webhooks: 0
    }
  })

  agentAnalytics.forEach(({ analytics, conversations, bookings }) => {
    // Analytics events
    analytics.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0]
      if (dataByDate[date]) {
        dataByDate[date].tokens += event.tokens_used || 0
        if (event.event_type === 'webhook_invocation') {
          dataByDate[date].webhooks += 1
        }
      }
    })

    // Conversations
    conversations.forEach(conv => {
      const date = new Date(conv.created_at).toISOString().split('T')[0]
      if (dataByDate[date]) {
        dataByDate[date].conversations += 1
      }
    })

    // Bookings
    bookings.forEach(booking => {
      const date = new Date(booking.created_at).toISOString().split('T')[0]
      if (dataByDate[date]) {
        dataByDate[date].bookings += 1
      }
    })
  })

  return Object.values(dataByDate)
}

/**
 * Fetch analytics with date range filter
 */
export function useAnalyticsDateRange(userId, agents = [], startDate, endDate) {
  return useQuery({
    queryKey: ['analytics-date-range', userId, agents.map(a => a.id).sort().join(','), startDate, endDate],
    queryFn: async () => {
      if (!userId || !agents.length) return []

      const promises = agents.map(agent =>
        fetch(`/api/agents/${agent.id}/analytics?start=${startDate}&end=${endDate}`)
          .then(r => r.ok ? r.json() : { analytics: [] })
          .catch(() => ({ analytics: [] }))
      )

      const results = await Promise.all(promises)
      return results.flatMap(r => r.analytics || [])
    },
    enabled: !!userId && agents.length > 0 && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000
  })
}

/**
 * Calculate real-time statistics from analytics data
 */
export function useAnalyticsStats(analyticsData) {
  return useMemo(() => {
    if (!analyticsData) {
      return {
        totalEvents: 0,
        successRate: 0,
        failureRate: 0,
        avgTokensPerEvent: 0,
        eventsByType: [],
        hourlyDistribution: [],
        dailyTrends: []
      }
    }

    const { overview, eventTypeBreakdown, timeSeriesData } = analyticsData

    // Calculate hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count: 0
    }))

    // Calculate daily trends (last 7 days)
    const last7Days = timeSeriesData.slice(-7)

    return {
      totalEvents: overview.totalConversations + overview.totalBookings + overview.totalWebhookCalls,
      successRate: overview.successRate,
      failureRate: 100 - overview.successRate,
      avgTokensPerEvent: overview.totalConversations > 0
        ? Math.round(overview.totalTokens / overview.totalConversations)
        : 0,
      eventsByType: eventTypeBreakdown,
      hourlyDistribution,
      dailyTrends: last7Days.map(day => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: day.conversations + day.bookings + day.webhooks
      }))
    }
  }, [analyticsData])
}

/**
 * Export analytics data
 */
export function useExportAnalytics() {
  return useMutation({
    mutationFn: async ({ data, format = 'csv' }) => {
      if (format === 'csv') {
        return exportToCSV(data)
      } else if (format === 'json') {
        return exportToJSON(data)
      }
      throw new Error('Unsupported format')
    },
    onSuccess: (downloadUrl) => {
      toast.success('Analytics exported successfully!')
    },
    onError: () => {
      toast.error('Failed to export analytics')
    }
  })
}

function exportToCSV(data) {
  const { overview, agentAnalytics, timeSeriesData } = data
  
  let csv = 'Analytics Export\n\n'
  
  // Overview section
  csv += 'Overview\n'
  csv += `Total Conversations,${overview.totalConversations}\n`
  csv += `Total Agents,${overview.totalAgents}\n`
  csv += `Active Agents,${overview.activeAgents}\n`
  csv += `Total Tokens,${overview.totalTokens}\n`
  csv += `Success Rate,${overview.successRate}%\n`
  csv += `Avg Response Time,${overview.avgResponseTime}ms\n`
  csv += `Total Bookings,${overview.totalBookings}\n`
  csv += `Total Webhook Calls,${overview.totalWebhookCalls}\n\n`

  // Agent analytics section
  csv += 'Agent Analytics\n'
  csv += 'Agent Name,Total Events,Conversations,Bookings,Tokens\n'
  agentAnalytics.forEach(({ agent, totalEvents, conversations, bookings, tokens }) => {
    csv += `${agent.name},${totalEvents},${conversations},${bookings},${tokens}\n`
  })

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)

  return url
}

function exportToJSON(data) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)

  return url
}