'use client'

import {
  Activity,
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
import NavigationBar from '../../components/navigationBar/navigationBar'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'

/**
 * Skeleton Pulse Animation Component
 */
function SkeletonPulse({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-neutral-800/50 via-neutral-700/50 to-neutral-800/50 bg-[length:200%_100%] ${className}`}
      style={{
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
    />
  )
}

/**
 * Skeleton Stat Card
 */
function SkeletonStatCard({ color = 'orange' }) {
  const colorClasses = {
    orange: {
      bg: 'from-orange-900/40 to-orange-950/20',
      border: 'border-orange-600/30',
      icon: 'bg-orange-900/50'
    },
    blue: {
      bg: 'from-blue-900/40 to-blue-950/20',
      border: 'border-blue-600/30',
      icon: 'bg-blue-900/50'
    },
    green: {
      bg: 'from-green-900/40 to-green-950/20',
      border: 'border-green-600/30',
      icon: 'bg-green-900/50'
    },
    purple: {
      bg: 'from-purple-900/40 to-purple-950/20',
      border: 'border-purple-600/30',
      icon: 'bg-purple-900/50'
    },
    pink: {
      bg: 'from-pink-900/40 to-pink-950/20',
      border: 'border-pink-600/30',
      icon: 'bg-pink-900/50'
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
            <SkeletonPulse className='h-6 w-6 rounded' />
          </div>
          <SkeletonPulse className='h-6 w-16 rounded-full' />
        </div>
        <div>
          <SkeletonPulse className='h-4 w-24 rounded' />
          <SkeletonPulse className='mt-2 h-8 w-20 rounded' />
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton Chart Card
 */
function SkeletonChartCard({ title }) {
  return (
    <Card className='border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-neutral-100'>{title}</h3>
        </div>
        <div className='min-h-[300px] space-y-3'>
          {/* Simulate chart bars/lines */}
          <div className='flex h-[250px] items-end justify-around gap-2'>
            {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
              <SkeletonPulse
                key={i}
                className='w-full rounded-t'
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          {/* X-axis labels */}
          <div className='flex justify-between'>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <SkeletonPulse key={i} className='h-3 w-12 rounded' />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton Bar Chart Card
 */
function SkeletonBarChartCard({ title, rows = 5 }) {
  return (
    <Card className='border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-neutral-100'>{title}</h3>
        </div>
        <div className='min-h-[300px] space-y-4'>
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <SkeletonPulse className='h-4 w-24 rounded' />
                <SkeletonPulse className='h-4 w-12 rounded' />
              </div>
              <SkeletonPulse
                className='h-2 rounded-full'
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton Agent Performance Table
 */
function SkeletonAgentPerformanceTable({ rows = 5 }) {
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
          {Array.from({ length: rows }).map((_, index) => (
            <tr
              key={index}
              className='border-b border-neutral-800/50 text-sm'
            >
              <td className='py-3'>
                <div className='flex items-center gap-2'>
                  <SkeletonPulse className='h-8 w-8 rounded-lg' />
                  <SkeletonPulse className='h-4 w-32 rounded' />
                </div>
              </td>
              <td className='py-3'>
                <SkeletonPulse className='h-4 w-16 rounded' />
              </td>
              <td className='py-3'>
                <SkeletonPulse className='h-4 w-12 rounded' />
              </td>
              <td className='py-3'>
                <SkeletonPulse className='h-4 w-20 rounded' />
              </td>
              <td className='py-3'>
                <SkeletonPulse className='h-6 w-20 rounded-full' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Skeleton Insight Card
 */
function SkeletonInsightCard({ color = 'orange' }) {
  const colorClasses = {
    orange: {
      bg: 'from-orange-900/20 to-neutral-950/20',
      border: 'border-orange-600/30',
      icon: 'bg-orange-900/40'
    },
    blue: {
      bg: 'from-blue-900/20 to-neutral-950/20',
      border: 'border-blue-600/30',
      icon: 'bg-blue-900/40'
    },
    green: {
      bg: 'from-green-900/20 to-neutral-950/20',
      border: 'border-green-600/30',
      icon: 'bg-green-900/40'
    }
  }

  const colors = colorClasses[color] || colorClasses.orange

  return (
    <Card className={`border bg-gradient-to-br ${colors.border} ${colors.bg}`}>
      <div className='space-y-3'>
        <div className='flex items-center gap-3'>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.icon}`}
          >
            <SkeletonPulse className='h-5 w-5 rounded' />
          </div>
          <SkeletonPulse className='h-5 w-24 rounded' />
        </div>
        <SkeletonPulse className='h-4 w-full rounded' />
        <SkeletonPulse className='h-4 w-3/4 rounded' />
      </div>
    </Card>
  )
}

/**
 * Main Analytics Skeleton Component
 */
export default function AnalyticsSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title='Analytics'
              onLogOutClick={() => {}}
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
                    {/* Time Range Selector Skeleton */}
                    <SkeletonPulse className='h-10 w-32 rounded-lg' />

                    {/* Export Button Skeleton */}
                    <SkeletonPulse className='h-10 w-24 rounded-lg' />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                <SkeletonStatCard color='orange' />
                <SkeletonStatCard color='blue' />
                <SkeletonStatCard color='green' />
                <SkeletonStatCard color='purple' />
              </div>

              {/* Secondary Stats */}
              <div className='mb-8 grid gap-6 sm:grid-cols-3'>
                <SkeletonStatCard color='pink' />
                <SkeletonStatCard color='blue' />
                <SkeletonStatCard color='purple' />
              </div>

              {/* Charts Section */}
              <div className='mb-8 grid gap-6 lg:grid-cols-2'>
                {/* Activity Over Time */}
                <SkeletonChartCard title='Activity Over Time' />

                {/* Event Type Distribution */}
                <SkeletonBarChartCard title='Event Distribution' />
              </div>

              {/* Top Agents */}
              <div className='mb-8'>
                <SkeletonBarChartCard title='Top Performing Agents' rows={5} />
              </div>

              {/* Agent Performance Table */}
              <div className='mb-8'>
                <Card className='border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-neutral-100'>
                      Agent Performance Details
                    </h3>
                    <SkeletonAgentPerformanceTable rows={5} />
                  </div>
                </Card>
              </div>

              {/* Insights Section */}
              <div className='grid gap-6 lg:grid-cols-3'>
                <SkeletonInsightCard color='orange' />
                <SkeletonInsightCard color='blue' />
                <SkeletonInsightCard color='green' />
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

        @keyframes pulse {
          0%,
          100% {
            background-position: 0% 0%;
            opacity: 1;
          }
          50% {
            background-position: 100% 0%;
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  )
}