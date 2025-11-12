'use client'

import {
  Bot,
  Crown,
  MessageSquare,
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
 * Skeleton Usage Metric
 */
function SkeletonUsageMetric({ icon: Icon, color }) {
  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon className={`h-5 w-5 text-${color}-400`} />
          <SkeletonPulse className='h-5 w-32 rounded' />
        </div>
        <SkeletonPulse className='h-4 w-24 rounded' />
      </div>
      
      <div className='h-2 bg-neutral-800 rounded-full overflow-hidden'>
        <SkeletonPulse className='h-full w-2/3 rounded-full' />
      </div>
    </div>
  )
}

/**
 * Skeleton Plan Card
 */
function SkeletonPlanCard({ color }) {
  const colorClasses = {
    neutral: 'from-neutral-900/40 to-neutral-950/20 border-neutral-600/30',
    orange: 'from-orange-900/40 to-orange-950/20 border-orange-600/30',
    purple: 'from-purple-900/40 to-purple-950/20 border-purple-600/30'
  }

  return (
    <Card className={`border bg-gradient-to-br ${colorClasses[color]}`}>
      <div className='space-y-6'>
        {/* Plan Header */}
        <div>
          <div className='flex items-center gap-3 mb-2'>
            <SkeletonPulse className='h-10 w-10 rounded-lg' />
            <div className='flex-1 space-y-2'>
              <SkeletonPulse className='h-5 w-24 rounded' />
              <SkeletonPulse className='h-3 w-40 rounded' />
            </div>
          </div>
        </div>

        {/* Price */}
        <div>
          <div className='flex items-baseline gap-2'>
            <SkeletonPulse className='h-10 w-20 rounded' />
            <SkeletonPulse className='h-4 w-16 rounded' />
          </div>
        </div>

        {/* Features */}
        <ul className='space-y-3'>
          {Array.from({ length: 5 }).map((_, idx) => (
            <li key={idx} className='flex items-start gap-3'>
              <SkeletonPulse className='h-5 w-5 rounded flex-shrink-0 mt-0.5' />
              <SkeletonPulse className='h-4 w-full rounded' />
            </li>
          ))}
        </ul>

        {/* Action Button */}
        <div className='pt-6 border-t border-neutral-800'>
          <SkeletonPulse className='h-11 w-full rounded-lg' />
        </div>
      </div>
    </Card>
  )
}

/**
 * Main Subscriptions Page Skeleton Component
 */
export default function SubscriptionsPageSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title='Subscription Settings'
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Page Header */}
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-2'>
                  <Crown className='h-8 w-8 text-purple-500' />
                  <h1 className='text-3xl font-bold text-neutral-100'>
                    Subscription Settings
                  </h1>
                </div>
                <p className='text-neutral-400'>
                  Manage your subscription plan and view usage statistics
                </p>
              </div>

              <div className='space-y-8'>
                {/* Usage Card */}
                <Card className='border-purple-600/20 bg-gradient-to-br from-purple-950/10 to-neutral-950/50'>
                  <div className='mb-6'>
                    <div className='flex items-center gap-3 mb-2'>
                      <TrendingUp className='h-5 w-5 text-purple-400' />
                      <h2 className='text-xl font-semibold text-neutral-100'>
                        Current Usage
                      </h2>
                    </div>
                    <SkeletonPulse className='h-4 w-64 rounded' />
                  </div>

                  <div className='grid gap-6 md:grid-cols-3'>
                    <SkeletonUsageMetric icon={Bot} color='orange' />
                    <SkeletonUsageMetric icon={MessageSquare} color='blue' />
                    <SkeletonUsageMetric icon={Zap} color='yellow' />
                  </div>
                </Card>

                {/* Plans Section */}
                <div>
                  <h2 className='text-2xl font-bold text-neutral-100 mb-6'>
                    Available Plans
                  </h2>
                  <div className='grid gap-6 lg:grid-cols-3'>
                    <SkeletonPlanCard color='neutral' />
                    <SkeletonPlanCard color='orange' />
                    <SkeletonPlanCard color='purple' />
                  </div>
                </div>

                {/* Cancel Subscription Card */}
                <Card className='border-red-600/20 bg-gradient-to-br from-red-950/10 to-neutral-950/50'>
                  <div className='flex items-start gap-4'>
                    <SkeletonPulse className='h-6 w-6 rounded flex-shrink-0 mt-1' />
                    <div className='flex-1 space-y-3'>
                      <SkeletonPulse className='h-5 w-48 rounded' />
                      <div className='space-y-2'>
                        <SkeletonPulse className='h-4 w-full rounded' />
                        <SkeletonPulse className='h-4 w-3/4 rounded' />
                      </div>
                      <SkeletonPulse className='h-9 w-40 rounded-lg' />
                    </div>
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