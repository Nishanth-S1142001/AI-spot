'use client'

import {
  Activity,
  CheckCircle,
  XCircle,
  Zap,
  RefreshCw,
  Filter,
  Clock
} from 'lucide-react'
import NavigationBar from '../../../components/navigationBar/navigationBar'
import SideBarLayout from '../../../components/sideBarLayout'
import NeonBackground from '../../../components/ui/background'
import Card from '../../../components/ui/card'
import Button from '../../../components/ui/button'

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
function SkeletonStatCard({ icon: Icon, colorClass, bgClass }) {
  return (
    <Card className={`border-opacity-20 ${bgClass}`}>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <SkeletonPulse className='h-4 w-32 rounded mb-3' />
          <SkeletonPulse className='h-8 w-20 rounded' />
          <SkeletonPulse className='h-3 w-24 rounded mt-3' />
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bgClass.replace('to-neutral-950/50', 'opacity-40')}`}>
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton Execution Card
 */
function SkeletonExecutionCard() {
  return (
    <div className='rounded-lg border border-neutral-700/50 bg-gradient-to-br from-neutral-800/30 to-neutral-900/20 p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <SkeletonPulse className='h-5 w-5 rounded-full' />
          <SkeletonPulse className='h-5 w-20 rounded-full' />
        </div>
        <div className='flex items-center gap-2'>
          <Zap className='h-3 w-3 text-orange-400' />
          <SkeletonPulse className='h-4 w-12 rounded' />
        </div>
      </div>
      <div className='space-y-2'>
        <SkeletonPulse className='h-4 w-full rounded' />
        <SkeletonPulse className='h-3 w-32 rounded' />
      </div>
      <div className='mt-3 flex items-center gap-3 border-t border-neutral-700/50 pt-3'>
        <SkeletonPulse className='h-3 w-16 rounded' />
      </div>
    </div>
  )
}

/**
 * Skeleton Log Entry
 */
function SkeletonLogEntry({ isLast = false }) {
  return (
    <div className='relative pl-8'>
      {!isLast && (
        <div className='absolute left-2 top-6 bottom-0 w-0.5 bg-gradient-to-b from-blue-600/40 to-transparent' />
      )}
      <div className='absolute left-0 top-1 rounded-full bg-blue-900/20 p-0.5'>
        <div className='h-4 w-4 rounded-full bg-blue-400/50' />
      </div>
      <div className='rounded-lg border border-neutral-700/50 bg-gradient-to-br from-neutral-800/50 to-neutral-900/30 p-4'>
        <div className='mb-2 flex items-center justify-between'>
          <div className='flex items-center gap-2 flex-1'>
            <SkeletonPulse className='h-4 w-32 rounded' />
            <SkeletonPulse className='h-5 w-20 rounded-full' />
          </div>
          <SkeletonPulse className='h-6 w-16 rounded-full' />
        </div>
        <SkeletonPulse className='h-3 w-full rounded mt-2' />
      </div>
    </div>
  )
}

/**
 * Main Workflow Executions Page Skeleton Component
 */
export default function WorkflowExecutionsPageSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
            <NavigationBar profile={userProfile} title='Execution History' />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Statistics Cards */}
              <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                <SkeletonStatCard
                  icon={Activity}
                  colorClass='text-blue-400'
                  bgClass='border-blue-600/20 bg-gradient-to-br from-blue-900/20 to-neutral-950/50'
                />
                <SkeletonStatCard
                  icon={CheckCircle}
                  colorClass='text-green-400'
                  bgClass='border-green-600/20 bg-gradient-to-br from-green-900/20 to-neutral-950/50'
                />
                <SkeletonStatCard
                  icon={XCircle}
                  colorClass='text-red-400'
                  bgClass='border-red-600/20 bg-gradient-to-br from-red-900/20 to-neutral-950/50'
                />
                <SkeletonStatCard
                  icon={Zap}
                  colorClass='text-orange-400'
                  bgClass='border-orange-600/20 bg-gradient-to-br from-orange-900/20 to-neutral-950/50'
                />
              </div>

              {/* Main Grid */}
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Executions List */}
                <div>
                  <Card className='border-blue-600/20 bg-gradient-to-br from-blue-900/20 to-blue-950/10 shadow-xl'>
                    <div className='mb-6 space-y-4'>
                      <div className='flex items-center justify-between'>
                        <h2 className='text-xl font-bold text-blue-400'>
                          Execution History
                        </h2>
                        <Button size='sm' variant='outline' disabled>
                          <RefreshCw className='h-3 w-3' />
                          Refresh
                        </Button>
                      </div>

                      {/* Search Bar Skeleton */}
                      <SkeletonPulse className='h-10 w-full rounded-lg' />

                      {/* Filter Buttons */}
                      <div className='flex items-center gap-2'>
                        <Filter className='h-4 w-4 text-neutral-400' />
                        <div className='flex flex-wrap gap-2'>
                          {Array.from({ length: 4 }).map((_, idx) => (
                            <SkeletonPulse
                              key={idx}
                              className='h-8 w-24 rounded-lg'
                            />
                          ))}
                        </div>
                      </div>

                      <SkeletonPulse className='h-4 w-48 rounded' />
                    </div>

                    {/* Execution Cards List */}
                    <div className='custom-scrollbar max-h-[50vh] space-y-3 overflow-y-auto pr-2'>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <SkeletonExecutionCard key={idx} />
                      ))}
                    </div>

                    {/* Pagination Skeleton */}
                    <div className='mt-6 pt-6 border-t border-neutral-800/50'>
                      <div className='flex items-center justify-center gap-2'>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <SkeletonPulse
                            key={idx}
                            className='h-8 w-8 rounded'
                          />
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Execution Details Panel */}
                <Card className='border-orange-600/20 bg-gradient-to-br from-orange-900/20 to-orange-950/10 shadow-xl lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)]'>
                  <div className='flex flex-col items-center justify-center h-full py-16'>
                    <Activity className='h-20 w-20 text-orange-400 mb-4 opacity-50' />
                    <p className='text-neutral-400 font-semibold'>
                      Select an execution
                    </p>
                    <p className='mt-2 text-sm text-neutral-500 text-center max-w-xs'>
                      Click on any execution to view detailed logs
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