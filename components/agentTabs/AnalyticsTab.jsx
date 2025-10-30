'use client'

import Card from '../ui/card'
import { MessageSquare, BarChart3, Zap, TrendingUp, Users, Activity } from 'lucide-react'
import { memo } from 'react'

/**
 * OPTIMIZED Analytics Tab Component
 * 
 * Improvements:
 * - Memoized for performance
 * - Enhanced UI with gradients
 * - Better stat cards design
 * - Matches reference style
 */

const StatCard = memo(({ icon: Icon, value, label, colorClass, bgClass }) => (
  <Card className={`border-${colorClass}-600/20 bg-gradient-to-br from-${colorClass}-950/20 to-neutral-950/50 transition-all hover:scale-105`}>
    <div className='flex items-center justify-between'>
      <div>
        <p className='text-sm font-medium text-neutral-400'>{label}</p>
        <p className={`mt-2 text-3xl font-bold text-${colorClass}-400`}>
          {value.toLocaleString()}
        </p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bgClass}`}>
        <Icon className={`h-6 w-6 text-${colorClass}-400`} />
      </div>
    </div>
    <div className='mt-4 flex items-center text-xs text-neutral-500'>
      <Activity className='mr-1 h-3 w-3' />
      All time metric
    </div>
  </Card>
))

StatCard.displayName = 'StatCard'

export default function AnalyticsTab({ conversations = [], analytics = [] }) {
  const totalConversations = conversations.length
  const successfulInteractions = analytics.filter((a) => a.success).length
  const totalTokens = analytics.reduce((sum, a) => sum + (a.tokens_used || 0), 0)
  const successRate = analytics.length > 0 
    ? Math.round((successfulInteractions / analytics.length) * 100)
    : 0
  const uniqueUsers = new Set(conversations.map(c => c.user_id)).size

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='mb-6'>
        <h3 className='text-2xl font-bold text-neutral-100'>Analytics Overview</h3>
        <p className='mt-1 text-sm text-neutral-400'>
          Track your agent's performance and usage metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        <StatCard
          icon={MessageSquare}
          value={totalConversations}
          label='Total Conversations'
          colorClass='blue'
          bgClass='bg-blue-900/40'
        />
        
        <StatCard
          icon={BarChart3}
          value={successfulInteractions}
          label='Successful Interactions'
          colorClass='green'
          bgClass='bg-green-900/40'
        />
        
        <StatCard
          icon={Zap}
          value={totalTokens}
          label='Tokens Used'
          colorClass='purple'
          bgClass='bg-purple-900/40'
        />

        <StatCard
          icon={TrendingUp}
          value={successRate}
          label='Success Rate (%)'
          colorClass='orange'
          bgClass='bg-orange-900/40'
        />

        <StatCard
          icon={Users}
          value={uniqueUsers}
          label='Unique Users'
          colorClass='pink'
          bgClass='bg-pink-900/40'
        />

        <StatCard
          icon={Activity}
          value={analytics.length}
          label='Total Events'
          colorClass='cyan'
          bgClass='bg-cyan-900/40'
        />
      </div>

      {/* Additional Insights */}
      {analytics.length > 0 && (
        <Card className='border-neutral-700/50'>
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold text-neutral-100'>
              Performance Insights
            </h4>
            
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4'>
                <div className='flex items-center gap-2 text-sm text-neutral-400'>
                  <TrendingUp className='h-4 w-4 text-green-400' />
                  <span>Average Tokens per Conversation</span>
                </div>
                <p className='mt-2 text-2xl font-bold text-neutral-200'>
                  {totalConversations > 0 
                    ? Math.round(totalTokens / totalConversations)
                    : 0}
                </p>
              </div>

              <div className='rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4'>
                <div className='flex items-center gap-2 text-sm text-neutral-400'>
                  <BarChart3 className='h-4 w-4 text-blue-400' />
                  <span>Conversations per User</span>
                </div>
                <p className='mt-2 text-2xl font-bold text-neutral-200'>
                  {uniqueUsers > 0 
                    ? (totalConversations / uniqueUsers).toFixed(1)
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {analytics.length === 0 && (
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
      )}
    </div>
  )
}