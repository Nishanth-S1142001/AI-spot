'use client'

import {
  Bot,
  MessageSquare,
  Plus,
  TrendingUp,
  Zap
} from 'lucide-react'
import NavigationBar from '../../components/navigationBar/navigationBar'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
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
 * Skeleton Analytics Card
 */
function SkeletonAnalyticsCard({ icon: Icon, color }) {
  const colorClasses = {
    orange: 'border-orange-600/20 from-orange-900/20',
    blue: 'border-blue-600/20 from-blue-900/20',
    green: 'border-green-600/20 from-green-900/20',
    purple: 'border-purple-600/20 from-purple-900/20'
  }

  const iconBgClasses = {
    orange: 'bg-orange-900/40',
    blue: 'bg-blue-900/40',
    green: 'bg-green-900/40',
    purple: 'bg-purple-900/40'
  }

  return (
    <Card
      className={`border ${colorClasses[color]} bg-gradient-to-br to-neutral-950/50`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1 space-y-2'>
          <SkeletonPulse className='h-4 w-24 rounded' />
          <SkeletonPulse className='h-8 w-16 rounded' />
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgClasses[color]}`}
        >
          <Icon className='h-6 w-6 text-neutral-500' />
        </div>
      </div>
      <div className='mt-4'>
        <SkeletonPulse className='h-3 w-32 rounded' />
      </div>
    </Card>
  )
}

/**
 * Skeleton Agent Card
 */
function SkeletonAgentCard() {
  return (
    <Card className='border border-orange-600/30 bg-gradient-to-br from-orange-900/40 to-orange-950/20'>
      <div className='space-y-6'>
        {/* Header Section */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-4 flex-1'>
            {/* Icon skeleton */}
            <SkeletonPulse className='h-14 w-14 rounded-lg' />
            
            <div className='space-y-2 flex-1'>
              <SkeletonPulse className='h-6 w-40 rounded' />
              <SkeletonPulse className='h-4 w-24 rounded' />
            </div>
          </div>

          {/* Status Badge */}
          <SkeletonPulse className='h-6 w-16 rounded-full' />
        </div>

        {/* Description */}
        <div className='space-y-2'>
          <SkeletonPulse className='h-4 w-full rounded' />
          <SkeletonPulse className='h-4 w-3/4 rounded' />
        </div>

        {/* Domain & Model */}
        <div className='flex items-center gap-3'>
          <SkeletonPulse className='h-6 w-20 rounded-full' />
          <SkeletonPulse className='h-6 w-24 rounded-full' />
        </div>

        {/* Quick Actions Grid */}
        <div className='grid grid-cols-3 gap-2'>
          <SkeletonPulse className='h-9 w-full rounded-lg' />
          <SkeletonPulse className='h-9 w-full rounded-lg' />
          <SkeletonPulse className='h-9 w-full rounded-lg' />
        </div>

        {/* Secondary Actions */}
        <div className='flex flex-wrap gap-2 border-t border-neutral-800/50 pt-4'>
          <SkeletonPulse className='h-8 w-24 rounded-lg' />
          <SkeletonPulse className='h-8 w-20 rounded-lg' />
          <SkeletonPulse className='h-8 w-24 rounded-lg' />
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-neutral-800/50 pt-4'>
          <div className='flex items-center gap-4'>
            <SkeletonPulse className='h-4 w-16 rounded' />
            <SkeletonPulse className='h-4 w-16 rounded' />
          </div>
          <SkeletonPulse className='h-4 w-24 rounded' />
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton Recent Activity Row
 */
function SkeletonActivityRow() {
  return (
    <div className='flex items-center justify-between rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4'>
      <div className='flex items-center gap-3 flex-1'>
        <SkeletonPulse className='h-10 w-10 rounded-lg' />
        <div className='space-y-2 flex-1'>
          <SkeletonPulse className='h-4 w-32 rounded' />
          <SkeletonPulse className='h-3 w-40 rounded' />
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <SkeletonPulse className='h-6 w-16 rounded-full' />
        <SkeletonPulse className='h-8 w-20 rounded-lg' />
      </div>
    </div>
  )
}

/**
 * Main Agents Dashboard Skeleton Component
 */
export default function AgentsDashboardSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title='AI Agency'
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Hero Section */}
              <div className='relative mb-12 flex min-h-[40vh] flex-col items-center justify-center'>
                {/* Background glow */}
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='h-[500px] w-[500px] rounded-full bg-orange-500/20 blur-[100px]' />
                </div>

                {/* Central Button */}
                <div className='relative z-10 flex flex-col items-center justify-center'>
                  <div className='group relative mx-auto flex h-36 w-36 items-center justify-center opacity-60'>
                    {/* Pulse rings */}
                    <div className='agent-pulse absolute h-36 w-36 rounded-full bg-orange-600/50' />
                    <div
                      className='agent-pulse absolute h-48 w-48 rounded-full bg-orange-600/20'
                      style={{ animationDelay: '0.5s' }}
                    />

                    {/* Central node */}
                    <div className='relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-orange-500 bg-gradient-to-br from-orange-600 to-orange-700 shadow-2xl shadow-orange-500/50'>
                      <Plus className='h-16 w-16 text-white opacity-50' />
                    </div>
                  </div>

                  <div className='mt-6 flex flex-col items-center gap-2'>
                    <SkeletonPulse className='h-6 w-48 rounded' />
                    <SkeletonPulse className='h-4 w-64 rounded' />
                  </div>
                </div>
              </div>

              {/* Analytics Cards */}
              <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                <SkeletonAnalyticsCard icon={Bot} color='orange' />
                <SkeletonAnalyticsCard icon={MessageSquare} color='blue' />
                <SkeletonAnalyticsCard icon={TrendingUp} color='green' />
                <SkeletonAnalyticsCard icon={Zap} color='purple' />
              </div>

              {/* Agents Section Header */}
              <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='space-y-2'>
                  <h3 className='text-2xl font-bold text-neutral-100'>
                    Your Agents
                  </h3>
                  <SkeletonPulse className='h-4 w-32 rounded' />
                </div>

                <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                  <div className='w-full sm:w-80'>
                    <SkeletonPulse className='h-10 w-full rounded-lg' />
                  </div>
                  <SkeletonPulse className='h-10 w-36 rounded-lg' />
                </div>
              </div>

              {/* Agent Cards Grid */}
              <div className='mb-8 grid gap-6 sm:grid-cols-1 lg:grid-cols-2'>
                <SkeletonAgentCard />
                <SkeletonAgentCard />
                <SkeletonAgentCard />
                <SkeletonAgentCard />
              </div>

              {/* Pagination Skeleton */}
              <div className='mb-8 flex justify-center'>
                <div className='flex items-center gap-2'>
                  <SkeletonPulse className='h-10 w-10 rounded-lg' />
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonPulse key={i} className='h-10 w-10 rounded-lg' />
                  ))}
                  <SkeletonPulse className='h-10 w-10 rounded-lg' />
                </div>
              </div>

              {/* Recent Activity */}
              <Card className='border-neutral-700/50'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xl font-bold text-neutral-100'>
                      <span className='text-orange-400'>Recent</span> Activity
                    </h3>
                    <SkeletonPulse className='h-8 w-24 rounded-lg' />
                  </div>

                  <div className='space-y-3'>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <SkeletonActivityRow key={index} />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
        @keyframes agent-pulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.1;
            transform: scale(1.1);
          }
        }

        .agent-pulse {
          animation: agent-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

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