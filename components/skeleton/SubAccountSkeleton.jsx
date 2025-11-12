'use client'

import {
  ArrowLeft,
  MessageSquare,
  TrendingUp,
  UserPlus,
  Users,
  Zap
} from 'lucide-react'
import NeonBackground from '../../../components/ui/background'
import Button from '../../../components/ui/button'
import Card from '../../../components/ui/card'

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
function SkeletonStatCard({ icon: Icon, color = 'orange' }) {
  const colorClasses = {
    orange: {
      bg: 'from-orange-900/20 to-neutral-950/50',
      border: 'border-orange-600/20',
      icon: 'bg-orange-900/40'
    },
    blue: {
      bg: 'from-blue-900/20 to-neutral-950/50',
      border: 'border-blue-600/20',
      icon: 'bg-blue-900/40'
    },
    green: {
      bg: 'from-green-900/20 to-neutral-950/50',
      border: 'border-green-600/20',
      icon: 'bg-green-900/40'
    },
    purple: {
      bg: 'from-purple-900/20 to-neutral-950/50',
      border: 'border-purple-600/20',
      icon: 'bg-purple-900/40'
    }
  }

  const colors = colorClasses[color] || colorClasses.orange

  return (
    <Card className={`border bg-gradient-to-br ${colors.border} ${colors.bg}`}>
      <div className='p-4 flex items-center justify-between'>
        <div className='flex-1'>
          <SkeletonPulse className='h-4 w-28 rounded' />
          <SkeletonPulse className='mt-2 h-8 w-16 rounded' />
          <SkeletonPulse className='mt-4 h-3 w-20 rounded' />
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors.icon}`}>
          <Icon className='h-6 w-6 text-neutral-500' />
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton Sub Account Card
 */
function SkeletonSubAccountCard() {
  return (
    <div className='rounded-lg border border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20 p-5'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='flex flex-1 items-center gap-3'>
          <SkeletonPulse className='h-12 w-12 rounded-full' />
          <div className='flex-1 space-y-2'>
            <SkeletonPulse className='h-5 w-32 rounded' />
            <SkeletonPulse className='h-4 w-48 rounded' />
          </div>
        </div>
        <SkeletonPulse className='h-6 w-20 rounded-full' />
      </div>

      {/* Stats Grid */}
      <div className='mt-4 grid grid-cols-3 gap-3 border-t border-neutral-800/50 pt-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='text-center space-y-1'>
            <SkeletonPulse className='mx-auto h-5 w-12 rounded' />
            <SkeletonPulse className='mx-auto h-3 w-16 rounded' />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className='mt-4 flex items-center gap-2 border-t border-neutral-800/50 pt-4'>
        <SkeletonPulse className='h-8 flex-1 rounded-lg' />
        <SkeletonPulse className='h-8 w-8 rounded-lg' />
      </div>
    </div>
  )
}

/**
 * Main Sub-Accounts Skeleton Component
 */
export default function SubAccountsSkeleton({ agentName = 'Agent' }) {
  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
          <div className='mx-auto max-w-7xl px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <button
                  disabled
                  className='rounded-lg p-2 transition-colors hover:bg-neutral-800 opacity-50 cursor-not-allowed'
                >
                  <ArrowLeft className='h-5 w-5 text-neutral-400' />
                </button>
                <div>
                  <h1 className='text-xl font-bold text-neutral-100'>
                    <span className='text-orange-400'>Test</span> Accounts
                  </h1>
                  <p className='text-sm text-neutral-400'>
                    {agentName} • Manage customer testing access
                  </p>
                </div>
              </div>

              <Button disabled className='opacity-50 cursor-not-allowed'>
                <UserPlus className='mr-2 h-4 w-4' />
                Invite Test User
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='custom-scrollbar flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-7xl px-6 py-8'>
            {/* Stats Cards */}
            <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
              <SkeletonStatCard icon={Users} color='orange' />
              <SkeletonStatCard icon={MessageSquare} color='blue' />
              <SkeletonStatCard icon={TrendingUp} color='green' />
              <SkeletonStatCard icon={Zap} color='purple' />
            </div>

            {/* Filters and Search */}
            <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-3'>
                <SkeletonPulse className='h-10 w-40 rounded-lg' />
                <SkeletonPulse className='h-4 w-24 rounded' />
              </div>

              <div className='w-full sm:w-80'>
                <SkeletonPulse className='h-10 w-full rounded-lg' />
              </div>
            </div>

            {/* Accounts Grid */}
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonSubAccountCard key={index} />
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className='mt-8 flex justify-center'>
              <div className='flex items-center gap-2'>
                <SkeletonPulse className='h-10 w-10 rounded-lg' />
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonPulse key={i} className='h-10 w-10 rounded-lg' />
                ))}
                <SkeletonPulse className='h-10 w-10 rounded-lg' />
              </div>
            </div>
          </div>
        </div>
      </div>

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