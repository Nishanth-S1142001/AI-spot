'use client'

import {
  BarChart3,
  Bot,
  Plus,
  Users,
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
 * Skeleton Agent Card
 */
function SkeletonAgentCard() {
  return (
    <Card className='border border-orange-600/30 bg-gradient-to-br from-orange-900/40 to-orange-950/20'>
      <div className='space-y-4'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3 flex-1'>
            <SkeletonPulse className='h-10 w-10 rounded-lg' />
            <div className='space-y-2 flex-1'>
              <SkeletonPulse className='h-4 w-32 rounded' />
              <SkeletonPulse className='h-3 w-24 rounded' />
            </div>
          </div>
          <SkeletonPulse className='h-6 w-16 rounded-full' />
        </div>

        {/* Description */}
        <div className='space-y-2'>
          <SkeletonPulse className='h-4 w-full rounded' />
          <SkeletonPulse className='h-4 w-3/4 rounded' />
        </div>

        {/* Pills */}
        <div className='flex flex-wrap gap-2'>
          <SkeletonPulse className='h-6 w-20 rounded-full' />
          <SkeletonPulse className='h-6 w-24 rounded-full' />
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-neutral-800/50 pt-4'>
          <div className='flex items-center gap-4'>
            <SkeletonPulse className='h-4 w-12 rounded' />
            <SkeletonPulse className='h-4 w-12 rounded' />
          </div>
          <SkeletonPulse className='h-4 w-4 rounded' />
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton Quick Action Card
 */
function SkeletonQuickActionCard({ variant = 'orange' }) {
  const variantStyles = {
    orange: 'border-orange-600/20',
    blue: 'border-blue-600/20',
    green: 'border-green-600/20',
    purple: 'border-purple-600/20'
  }

  const iconBgStyles = {
    orange: 'bg-orange-900/40',
    blue: 'bg-blue-900/40',
    green: 'bg-green-900/40',
    purple: 'bg-purple-900/40'
  }

  const icons = {
    orange: Bot,
    blue: Zap,
    green: BarChart3,
    purple: Users
  }

  const Icon = icons[variant] || Bot

  return (
    <Card className={`border ${variantStyles[variant]}`}>
      <div className='flex items-center gap-3'>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgStyles[variant]}`}>
          <Icon className='h-5 w-5 text-neutral-500' />
        </div>
        <div className='flex-1 space-y-2'>
          <SkeletonPulse className='h-4 w-32 rounded' />
          <SkeletonPulse className='h-3 w-24 rounded' />
        </div>
      </div>
    </Card>
  )
}

/**
 * Main Dashboard Skeleton Component
 */
export default function DashboardSkeleton({ userProfile }) {
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
              {/* Welcome Section */}
              <div className='mb-8 text-center'>
                <div className='mb-4 flex flex-col items-center gap-2'>
                  <SkeletonPulse className='h-12 w-64 rounded' />
                  <SkeletonPulse className='h-10 w-48 rounded' />
                </div>
                <SkeletonPulse className='mx-auto h-5 w-96 rounded' />
              </div>

              {/* Agents Section */}
              <div className='mb-8'>
                <div className='mb-6 flex items-center justify-between'>
                  <div className='space-y-2'>
                    <h3 className='text-2xl font-bold text-neutral-100'>
                      Your Agents
                    </h3>
                    <SkeletonPulse className='h-4 w-48 rounded' />
                  </div>

                  <SkeletonPulse className='h-10 w-36 rounded-lg' />
                </div>

                {/* Agents Grid */}
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  <SkeletonAgentCard />
                  <SkeletonAgentCard />
                  <SkeletonAgentCard />
                </div>
              </div>

              {/* Quick Actions */}
              <div className='mb-8'>
                <h3 className='mb-4 text-xl font-bold text-neutral-100'>
                  Quick Actions
                </h3>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <SkeletonQuickActionCard variant='orange' />
                  <SkeletonQuickActionCard variant='blue' />
                  <SkeletonQuickActionCard variant='green' />
                  <SkeletonQuickActionCard variant='purple' />
                </div>
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