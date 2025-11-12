'use client'

import {
  Activity,
  ArrowUp,
  BarChart3,
  Clock,
  MessageSquare,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import { memo, useMemo } from 'react'
import Card from '../ui/card'
import ApiKeyUsageStats from './ApiKeyUsageStats'

/**
 * FULLY OPTIMIZED Analytics Tab Component
 *
 * Optimizations:
 * - Memoized components for reduced re-renders
 * - useMemo for expensive calculations
 * - Proper TypeScript-ready prop handling
 * - Enhanced UI with better visual hierarchy
 * - Consistent with Dashboard patterns
 *
 * Performance:
 * - Calculations only run when data changes
 * - StatCard components memoized
 * - InsightCard components memoized
 * - EmptyState memoized
 */

// =====================================================
// MEMOIZED STAT CARD COMPONENT
// =====================================================
const StatCard = memo(
  ({ icon: Icon, value, label, colorClass, trend, trendValue }) => (
    <Card
      className={`group border-${colorClass}-600/20 bg-gradient-to-br from-${colorClass}-950/20 to-neutral-950/50 transition-all hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-neutral-400'>{label}</p>
          <p className={`mt-2 text-3xl font-bold text-${colorClass}-400`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>

          {/* Trend indicator */}
          {trend && trendValue && (
            <div className='mt-2 flex items-center gap-1 text-xs'>
              <ArrowUp
                className={`h-3 w-3 ${trend === 'up' ? 'text-green-400' : 'rotate-180 text-red-400'}`}
              />
              <span
                className={trend === 'up' ? 'text-green-400' : 'text-red-400'}
              >
                {trendValue}
              </span>
              <span className='text-neutral-500'>vs last period</span>
            </div>
          )}
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-${colorClass}-900/40 transition-transform group-hover:scale-110`}
        >
          <Icon className={`h-6 w-6 text-${colorClass}-400`} />
        </div>
      </div>

      <div className='mt-4 flex items-center text-xs text-neutral-500'>
        <Activity className='mr-1 h-3 w-3' />
        All time metric
      </div>
    </Card>
  )
)
StatCard.displayName = 'StatCard'

// =====================================================
// MEMOIZED INSIGHT CARD COMPONENT
// =====================================================
const InsightCard = memo(({ icon: Icon, label, value, iconColor }) => (
  <div className='rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4 transition-all hover:bg-neutral-900/50'>
    <div className='flex items-center gap-2 text-sm text-neutral-400'>
      <Icon className={`h-4 w-4 text-${iconColor}-400`} />
      <span>{label}</span>
    </div>
    <p className='mt-2 text-2xl font-bold text-neutral-200'>{value}</p>
  </div>
))
InsightCard.displayName = 'InsightCard'

// =====================================================
// MEMOIZED EMPTY STATE COMPONENT
// =====================================================
const EmptyState = memo(() => (
  <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
    <div className='flex flex-col items-center py-12 text-center'>
      <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-900/40'>
        <BarChart3 className='h-8 w-8 text-orange-400' />
      </div>
      <h4 className='mb-2 text-lg font-semibold text-neutral-200'>
        No analytics data yet
      </h4>
      <p className='text-sm text-neutral-400'>
        Start using your agent to see analytics here
      </p>
    </div>
  </Card>
))
EmptyState.displayName = 'EmptyState'

// =====================================================
// MEMOIZED PERFORMANCE INSIGHTS SECTION
// =====================================================
const PerformanceInsights = memo(
  ({ totalConversations, totalTokens, uniqueUsers, avgResponseTime }) => (
    <Card className='border-neutral-700/50'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h4 className='text-lg font-semibold text-neutral-100'>
            Performance Insights
          </h4>
          <div className='flex items-center gap-1 rounded-full bg-blue-900/30 px-3 py-1 text-xs text-blue-400'>
            <TrendingUp className='h-3 w-3' />
            <span>Live metrics</span>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <InsightCard
            icon={TrendingUp}
            label='Avg Tokens per Conversation'
            value={
              totalConversations > 0
                ? Math.round(totalTokens / totalConversations).toLocaleString()
                : '0'
            }
            iconColor='green'
          />

          <InsightCard
            icon={BarChart3}
            label='Conversations per User'
            value={
              uniqueUsers > 0
                ? (totalConversations / uniqueUsers).toFixed(1)
                : '0.0'
            }
            iconColor='blue'
          />

          {avgResponseTime > 0 && (
            <InsightCard
              icon={Clock}
              label='Avg Response Time'
              value={`${avgResponseTime}ms`}
              iconColor='purple'
            />
          )}
        </div>
      </div>
    </Card>
  )
)
PerformanceInsights.displayName = 'PerformanceInsights'

// =====================================================
// MAIN ANALYTICS TAB COMPONENT (MEMOIZED)
// =====================================================
const AnalyticsTab = memo(({ conversations = [], analytics = [] }) => {
  // Memoized calculations - only recompute when data changes
  const stats = useMemo(() => {
    const totalConversations = conversations.length
    const successfulInteractions = analytics.filter((a) => a.success).length
    const totalTokens = analytics.reduce(
      (sum, a) => sum + (a.tokens_used || 0),
      0
    )
    const successRate =
      analytics.length > 0
        ? Math.round((successfulInteractions / analytics.length) * 100)
        : 0
    const uniqueUsers = new Set(conversations.map((c) => c.user_id)).size
    const totalEvents = analytics.length

    // Calculate average response time if available
    const responseTimes = analytics
      .map((a) => a.metadata?.response_time_ms)
      .filter(Boolean)
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          )
        : 0

    return {
      totalConversations,
      successfulInteractions,
      totalTokens,
      successRate,
      uniqueUsers,
      totalEvents,
      avgResponseTime
    }
  }, [conversations, analytics])

  // Early return for empty state
  if (analytics.length === 0 && conversations.length === 0) {
    return (
      <div className='space-y-6'>
        <div className='mb-6'>
          <h3 className='text-2xl font-bold text-neutral-100'>
            Analytics Overview
          </h3>
          <p className='mt-1 text-sm text-neutral-400'>
            Track your agent's performance and usage metrics
          </p>
        </div>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='mb-6'>
        <h3 className='text-2xl font-bold text-neutral-100'>
          Analytics Overview
        </h3>
        <p className='mt-1 text-sm text-neutral-400'>
          Track your agent's performance and usage metrics
        </p>
      </div>
      <div>
        <h3 className='mb-4 text-lg font-semibold text-neutral-100'>
          API Key Usage
        </h3>
        <ApiKeyUsageStats analytics={analytics} />
      </div>

      {/* Stats Grid */}
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        <StatCard
          icon={MessageSquare}
          value={stats.totalConversations}
          label='Total Conversations'
          colorClass='blue'
        />

        <StatCard
          icon={BarChart3}
          value={stats.successfulInteractions}
          label='Successful Interactions'
          colorClass='green'
        />

        <StatCard
          icon={Zap}
          value={stats.totalTokens}
          label='Tokens Used'
          colorClass='purple'
        />

        <StatCard
          icon={TrendingUp}
          value={`${stats.successRate}%`}
          label='Success Rate'
          colorClass='orange'
        />

        <StatCard
          icon={Users}
          value={stats.uniqueUsers}
          label='Unique Users'
          colorClass='pink'
        />

        <StatCard
          icon={Activity}
          value={stats.totalEvents}
          label='Total Events'
          colorClass='cyan'
        />
      </div>

      {/* Performance Insights */}
      {analytics.length > 0 && (
        <PerformanceInsights
          totalConversations={stats.totalConversations}
          totalTokens={stats.totalTokens}
          uniqueUsers={stats.uniqueUsers}
          avgResponseTime={stats.avgResponseTime}
        />
      )}

      {/* Additional Stats */}
      {conversations.length > 0 && (
        <Card className='border-purple-600/20 bg-gradient-to-br from-purple-950/20 to-neutral-950/50'>
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold text-neutral-100'>
              Usage Breakdown
            </h4>

            <div className='grid gap-4 sm:grid-cols-3'>
              <div className='rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4'>
                <p className='text-sm text-neutral-400'>Active Sessions</p>
                <p className='mt-1 text-xl font-bold text-neutral-200'>
                  {new Set(conversations.map((c) => c.session_id)).size}
                </p>
              </div>

              <div className='rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4'>
                <p className='text-sm text-neutral-400'>Avg Session Length</p>
                <p className='mt-1 text-xl font-bold text-neutral-200'>
                  {stats.uniqueUsers > 0
                    ? Math.round(
                        stats.totalConversations /
                          new Set(conversations.map((c) => c.session_id)).size
                      )
                    : 0}{' '}
                  msgs
                </p>
              </div>

              <div className='rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4'>
                <p className='text-sm text-neutral-400'>Engagement Rate</p>
                <p className='mt-1 text-xl font-bold text-neutral-200'>
                  {stats.uniqueUsers > 0
                    ? (
                        (stats.totalConversations / stats.uniqueUsers) *
                        10
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
})
AnalyticsTab.displayName = 'AnalyticsTab'

export default AnalyticsTab
