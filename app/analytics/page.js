'use client'

import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bot,
  Calendar,
  Clock,
  Download,
  MessageSquare,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import AnalyticsSkeleton from '../../components/skeleton/AnalyticsSkeleton'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'
import {
  useComprehensiveAnalytics,
  useAnalyticsStats,
  useExportAnalytics
} from '../../lib/hooks/useAnalyticsData'
import { useAgents } from '../../lib/hooks/useAgentData'
import { useLogout } from '../../lib/supabase/auth'
import loadingState from '../../components/common/loading-state'
import LoadingState from '../../components/common/loading-state'

/**
 * Stat Card Component
 */
function StatCard({
  icon: Icon,
  label,
  value,
  change,
  trend,
  color = 'orange'
}) {
  const colorClasses = {
    orange: {
      bg: 'from-orange-900/40 to-orange-950/20',
      border: 'border-orange-600/30',
      icon: 'bg-orange-900/50 text-orange-400',
      text: 'text-orange-300'
    },
    blue: {
      bg: 'from-blue-900/40 to-blue-950/20',
      border: 'border-blue-600/30',
      icon: 'bg-blue-900/50 text-blue-400',
      text: 'text-blue-300'
    },
    green: {
      bg: 'from-green-900/40 to-green-950/20',
      border: 'border-green-600/30',
      icon: 'bg-green-900/50 text-green-400',
      text: 'text-green-300'
    },
    purple: {
      bg: 'from-purple-900/40 to-purple-950/20',
      border: 'border-purple-600/30',
      icon: 'bg-purple-900/50 text-purple-400',
      text: 'text-purple-300'
    },
    pink: {
      bg: 'from-pink-900/40 to-pink-950/20',
      border: 'border-pink-600/30',
      icon: 'bg-pink-900/50 text-pink-400',
      text: 'text-pink-300'
    }
  }

  const colors = colorClasses[color] || colorClasses.orange

  return (
    <Card className={`border bg-gradient-to-br ${colors.border} ${colors.bg}`}>
      <div className='space-y-4'>
        <div className='flex items-start justify-between'>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.icon}`}
          >
            <Icon className='h-6 w-6' />
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                trend === 'up'
                  ? 'bg-green-900/40 text-green-300'
                  : trend === 'down'
                    ? 'bg-red-900/40 text-red-300'
                    : 'bg-neutral-900/40 text-neutral-300'
              }`}
            >
              {trend === 'up' ? (
                <ArrowUp className='h-3 w-3' />
              ) : trend === 'down' ? (
                <ArrowDown className='h-3 w-3' />
              ) : null}
              <span>{change}%</span>
            </div>
          )}
        </div>
        <div>
          <p className='text-sm text-neutral-400'>{label}</p>
          <p className={`mt-1 text-3xl font-bold ${colors.text}`}>{value}</p>
        </div>
      </div>
    </Card>
  )
}

/**
 * Chart Card Component
 */
function ChartCard({ title, children, action }) {
  return (
    <Card className='border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-neutral-100'>{title}</h3>
          {action}
        </div>
        <div className='min-h-[300px]'>{children}</div>
      </div>
    </Card>
  )
}

/**
 * Simple Bar Chart Component
 */
function SimpleBarChart({ data, dataKey, nameKey, color = 'orange' }) {
  if (!data || data.length === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center text-neutral-500'>
        No data available
      </div>
    )
  }

  const maxValue = Math.max(...data.map((item) => item[dataKey]))

  return (
    <div className='space-y-4'>
      {data.map((item, index) => (
        <div key={index} className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-neutral-300'>{item[nameKey]}</span>
            <span className='font-semibold text-neutral-100'>
              {item[dataKey]}
            </span>
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-neutral-900'>
            <div
              className={`h-full rounded-full ${
                color === 'orange'
                  ? 'bg-orange-500'
                  : color === 'blue'
                    ? 'bg-blue-500'
                    : color === 'green'
                      ? 'bg-green-500'
                      : 'bg-purple-500'
              }`}
              style={{ width: `${(item[dataKey] / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Line Chart Component
 */
function SimpleLineChart({ data, dataKey, nameKey }) {
  if (!data || data.length === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center text-neutral-500'>
        No data available
      </div>
    )
  }

  const maxValue = Math.max(...data.map((item) => item[dataKey]))
  const minValue = Math.min(...data.map((item) => item[dataKey]))
  const range = maxValue - minValue || 1

  return (
    <div className='space-y-4'>
      <div className='relative h-[250px] border-b border-l border-neutral-800'>
        {/* Y-axis labels */}
        <div className='absolute top-0 -left-12 flex h-full flex-col justify-between text-xs text-neutral-500'>
          <span>{maxValue}</span>
          <span>{Math.round(maxValue / 2)}</span>
          <span>0</span>
        </div>

        {/* Line */}
        <svg
          className='h-full w-full'
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
        >
          <polyline
            fill='none'
            stroke='rgb(249, 115, 22)'
            strokeWidth='2'
            points={data
              .map((item, index) => {
                const x = (index / (data.length - 1)) * 100
                const y = 100 - ((item[dataKey] - minValue) / range) * 100
                return `${x},${y}`
              })
              .join(' ')}
          />
          {/* Dots */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - ((item[dataKey] - minValue) / range) * 100
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r='2'
                fill='rgb(249, 115, 22)'
              />
            )
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className='flex justify-between text-xs text-neutral-500'>
        {data.map((item, index) => {
          if (
            index % Math.ceil(data.length / 7) === 0 ||
            index === data.length - 1
          ) {
            return <span key={index}>{item[nameKey]}</span>
          }
          return null
        })}
      </div>
    </div>
  )
}

/**
 * Agent Performance Table
 */
function AgentPerformanceTable({ agents }) {
  if (!agents || agents.length === 0) {
    return (
      <div className='flex h-[200px] items-center justify-center text-neutral-500'>
        No agents found
      </div>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full'>
        <thead>
          <tr className='border-b border-neutral-800 text-left text-sm text-neutral-400'>
            <th className='pb-3 font-semibold'>Agent</th>
            <th className='pb-3 font-semibold'>Conversations</th>
            <th className='pb-3 font-semibold'>Bookings</th>
            <th className='pb-3 font-semibold'>Tokens</th>
            <th className='pb-3 font-semibold'>Interface</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent, index) => (
            <tr
              key={agent.agent.id}
              className='border-b border-neutral-800/50 text-sm transition-colors hover:bg-neutral-900/20'
            >
              <td className='py-3'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-900/40'>
                    <Bot className='h-4 w-4 text-orange-400' />
                  </div>
                  <span className='font-medium text-neutral-200'>
                    {agent.agent.name}
                  </span>
                </div>
              </td>
              <td className='py-3 text-neutral-300'>{agent.conversations}</td>
              <td className='py-3 text-neutral-300'>{agent.bookings}</td>
              <td className='py-3 text-neutral-300'>
                {agent.tokens.toLocaleString()}
              </td>
              <td className='py-3'>
                <span className='rounded-full bg-neutral-900/50 px-2 py-1 text-xs text-neutral-400 capitalize'>
                  {agent.agent.interface || 'website'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Main Analytics Page Component
 */
export default function AnalyticsPage() {

  // Artificial delay so skeleton shows at least 3 seconds
const [delayedLoading, setDelayedLoading] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => setDelayedLoading(false), 3000);
  return () => clearTimeout(timer);
}, []);

  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()
  const [timeRange, setTimeRange] = useState('30d')

  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }

  // Fetch agents
  const { data: agents = [], isLoading: agentsLoading } = useAgents(user?.id)

  // Fetch comprehensive analytics
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError
  } = useComprehensiveAnalytics(user?.id, agents)

  // Calculate stats
  const stats = useAnalyticsStats(analyticsData)

  // Export mutation
  const exportMutation = useExportAnalytics()

  // Handle export
  const handleExport = (format) => {
    if (analyticsData) {
      exportMutation.mutate({ data: analyticsData, format })
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])


  if(delayedLoading)
  {
    return (
      <LoadingState
        message='Loading...'
        className='min-h-screen'
      />
    ) }
  
  // Loading state - show skeleton instead of generic loading
  if (authLoading || agentsLoading || analyticsLoading) {
    return <AnalyticsSkeleton userProfile={userProfile} />
  }

  // Error state
  if (analyticsError) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <Card className='max-w-md border-red-600/30 bg-gradient-to-br from-red-900/20 to-neutral-950/50'>
          <div className='p-8 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/40'>
              <Activity className='h-8 w-8 text-red-400' />
            </div>
            <h3 className='mb-2 text-xl font-bold text-neutral-100'>Error</h3>
            <p className='text-sm text-neutral-400'>{analyticsError.message}</p>
            <Button onClick={() => window.location.reload()} className='mt-6'>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!user || !analyticsData) {
    return null
  }

  const {
    overview,
    agentAnalytics,
    eventTypeBreakdown,
    timeSeriesData,
    topAgents
  } = analyticsData

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              title='Analytics'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Page Header */}
              <div className='mb-8'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <h1 className='text-3xl font-bold text-neutral-100'>
                      Analytics Dashboard
                    </h1>
                    <p className='mt-1 text-sm text-neutral-400'>
                      Comprehensive insights into your AI agents' performance
                    </p>
                  </div>

                  <div className='flex items-center gap-3'>
                    {/* Time Range Selector */}
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className='rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none'
                    >
                      <option value='7d'>Last 7 days</option>
                      <option value='30d'>Last 30 days</option>
                      <option value='90d'>Last 90 days</option>
                      <option value='1y'>Last year</option>
                    </select>

                    {/* Export Button */}
                    <Button
                      onClick={() => handleExport('csv')}
                      variant='secondary'
                      className='flex items-center gap-2'
                      disabled={exportMutation.isPending}
                    >
                      <Download className='h-4 w-4' />
                      {exportMutation.isPending ? 'Exporting...' : 'Export'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                <StatCard
                  icon={MessageSquare}
                  label='Total Conversations'
                  value={overview.totalConversations.toLocaleString()}
                  change={12}
                  trend='up'
                  color='orange'
                />
                <StatCard
                  icon={Bot}
                  label='Active Agents'
                  value={`${overview.activeAgents}/${overview.totalAgents}`}
                  change={5}
                  trend='up'
                  color='blue'
                />
                <StatCard
                  icon={TrendingUp}
                  label='Success Rate'
                  value={`${overview.successRate}%`}
                  change={3}
                  trend='up'
                  color='green'
                />
                <StatCard
                  icon={Zap}
                  label='Avg Response Time'
                  value={`${overview.avgResponseTime}ms`}
                  change={8}
                  trend='down'
                  color='purple'
                />
              </div>

              {/* Secondary Stats */}
              <div className='mb-8 grid gap-6 sm:grid-cols-3'>
                <StatCard
                  icon={Activity}
                  label='Total Tokens Used'
                  value={overview.totalTokens.toLocaleString()}
                  color='pink'
                />
                <StatCard
                  icon={Calendar}
                  label='Total Bookings'
                  value={overview.totalBookings.toLocaleString()}
                  color='blue'
                />
                <StatCard
                  icon={Zap}
                  label='Webhook Calls'
                  value={overview.totalWebhookCalls.toLocaleString()}
                  color='purple'
                />
              </div>

              {/* Charts Section */}
              <div className='mb-8 grid gap-6 lg:grid-cols-2'>
                {/* Activity Over Time */}
                <ChartCard title='Activity Over Time'>
                  <SimpleLineChart
                    data={timeSeriesData}
                    dataKey='conversations'
                    nameKey='date'
                  />
                </ChartCard>

                {/* Event Type Distribution */}
                <ChartCard title='Event Distribution'>
                  <SimpleBarChart
                    data={eventTypeBreakdown}
                    dataKey='value'
                    nameKey='name'
                    color='orange'
                  />
                </ChartCard>
              </div>

              {/* Top Agents */}
              <div className='mb-8'>
                <ChartCard title='Top Performing Agents'>
                  <SimpleBarChart
                    data={topAgents}
                    dataKey='conversations'
                    nameKey='name'
                    color='blue'
                  />
                </ChartCard>
              </div>

              {/* Agent Performance Table */}
              <div className='mb-8'>
                <Card className='border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-neutral-100'>
                      Agent Performance Details
                    </h3>
                    <AgentPerformanceTable agents={agentAnalytics} />
                  </div>
                </Card>
              </div>

              {/* Insights Section */}
              <div className='grid gap-6 lg:grid-cols-3'>
                <Card className='border-orange-600/30 bg-gradient-to-br from-orange-900/20 to-neutral-950/20'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/40'>
                        <TrendingUp className='h-5 w-5 text-orange-400' />
                      </div>
                      <h4 className='font-semibold text-neutral-100'>
                        Peak Hours
                      </h4>
                    </div>
                    <p className='text-sm text-neutral-400'>
                      Most activity occurs between 9 AM - 5 PM
                    </p>
                  </div>
                </Card>

                <Card className='border-blue-600/30 bg-gradient-to-br from-blue-900/20 to-neutral-950/20'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900/40'>
                        <Users className='h-5 w-5 text-blue-400' />
                      </div>
                      <h4 className='font-semibold text-neutral-100'>
                        User Engagement
                      </h4>
                    </div>
                    <p className='text-sm text-neutral-400'>
                      Average of{' '}
                      {Math.round(
                        overview.totalConversations / overview.activeAgents
                      )}{' '}
                      conversations per agent
                    </p>
                  </div>
                </Card>

                <Card className='border-green-600/30 bg-gradient-to-br from-green-900/20 to-neutral-950/20'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-900/40'>
                        <Clock className='h-5 w-5 text-green-400' />
                      </div>
                      <h4 className='font-semibold text-neutral-100'>
                        Response Quality
                      </h4>
                    </div>
                    <p className='text-sm text-neutral-400'>
                      {overview.successRate}% success rate with{' '}
                      {overview.avgResponseTime}ms avg response
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(23, 23, 23, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 4px;
          transition: background 0.2s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.5);
        }
      `}</style>
    </>
  )
}
