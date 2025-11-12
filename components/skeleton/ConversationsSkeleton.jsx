'use client'

import NavigationBar from '../../../components/navigationBar/navigationBar'
import SideBarLayout from '../../../components/sideBarLayout'
import NeonBackground from '../../../components/ui/background'
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
function SkeletonStatCard({ color = 'orange' }) {
  const colorClasses = {
    orange: {
      bg: 'from-orange-900/20 to-neutral-950/50',
      border: 'border-orange-600/20'
    },
    blue: {
      bg: 'from-blue-900/20 to-neutral-950/50',
      border: 'border-blue-600/20'
    },
    purple: {
      bg: 'from-purple-900/20 to-neutral-950/50',
      border: 'border-purple-600/20'
    },
    green: {
      bg: 'from-green-900/20 to-neutral-950/50',
      border: 'border-green-600/20'
    }
  }

  const colors = colorClasses[color] || colorClasses.orange

  return (
    <Card
      className={`border bg-gradient-to-br ${colors.border} ${colors.bg}`}
    >
      <div className='flex items-center justify-between p-4'>
        <div className='flex-1 space-y-3'>
          <SkeletonPulse className='h-4 w-32 rounded' />
          <SkeletonPulse className='h-8 w-20 rounded' />
          <SkeletonPulse className='h-3 w-24 rounded' />
        </div>
        <SkeletonPulse className='h-12 w-12 rounded-full' />
      </div>
    </Card>
  )
}

/**
 * Skeleton Filter Section
 */
function SkeletonFilterSection() {
  return (
    <Card className='mb-6 border-neutral-700/50'>
      <div className='space-y-4 p-5'>
        {/* Search and Export Row */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <SkeletonPulse className='h-10 flex-1 max-w-2xl rounded-lg' />
          <div className='flex gap-2'>
            <SkeletonPulse className='h-9 w-24 rounded-lg' />
            <SkeletonPulse className='h-9 w-32 rounded-lg' />
          </div>
        </div>

        {/* Filter Buttons Row */}
        <div className='flex flex-wrap items-center gap-3'>
          <SkeletonPulse className='h-4 w-4 rounded' />
          <SkeletonPulse className='h-3 w-8 rounded' />
          <SkeletonPulse className='h-7 w-20 rounded-lg' />
          <SkeletonPulse className='h-7 w-24 rounded-lg' />
          <SkeletonPulse className='h-7 w-28 rounded-lg' />
          <SkeletonPulse className='h-7 w-32 rounded-lg' />
        </div>

        {/* Results Count */}
        <SkeletonPulse className='h-4 w-64 rounded' />
      </div>
    </Card>
  )
}

/**
 * Skeleton Conversation Card
 */
function SkeletonConversationCard() {
  return (
    <Card className='border-neutral-700/50 bg-gradient-to-br from-neutral-900/50 to-neutral-950/30'>
      <div className='flex items-start justify-between p-5'>
        <div className='min-w-0 flex-1 space-y-4'>
          {/* Header */}
          <div className='flex flex-wrap items-center gap-3'>
            <SkeletonPulse className='h-4 w-24 rounded' />
            <SkeletonPulse className='h-5 w-32 rounded-full' />
            <SkeletonPulse className='h-5 w-20 rounded-full' />
          </div>

          {/* Messages */}
          <div className='space-y-4'>
            {/* User Message */}
            <div className='flex items-start gap-3'>
              <SkeletonPulse className='h-8 w-8 flex-shrink-0 rounded-full' />
              <div className='min-w-0 flex-1 space-y-2'>
                <SkeletonPulse className='h-3 w-12 rounded' />
                <SkeletonPulse className='h-4 w-full rounded' />
                <SkeletonPulse className='h-4 w-3/4 rounded' />
              </div>
            </div>

            {/* Agent Response */}
            <div className='flex items-start gap-3'>
              <SkeletonPulse className='h-8 w-8 flex-shrink-0 rounded-full' />
              <div className='min-w-0 flex-1 space-y-2'>
                <SkeletonPulse className='h-3 w-12 rounded' />
                <SkeletonPulse className='h-4 w-full rounded' />
                <SkeletonPulse className='h-4 w-5/6 rounded' />
              </div>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className='flex items-center gap-3 border-t border-neutral-800/50 pt-3'>
            <SkeletonPulse className='h-3 w-20 rounded' />
            <SkeletonPulse className='h-3 w-3 rounded-full' />
            <SkeletonPulse className='h-3 w-24 rounded' />
          </div>
        </div>

        {/* Actions */}
        <div className='ml-4 flex flex-col gap-2'>
          <SkeletonPulse className='h-8 w-8 rounded' />
          <SkeletonPulse className='h-8 w-8 rounded' />
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton Pagination
 */
function SkeletonPagination() {
  return (
    <div className='mt-8 flex justify-center'>
      <div className='flex items-center gap-2'>
        <SkeletonPulse className='h-10 w-10 rounded-lg' />
        <SkeletonPulse className='h-10 w-10 rounded-lg' />
        <SkeletonPulse className='h-10 w-10 rounded-lg' />
        <SkeletonPulse className='h-10 w-10 rounded-lg' />
        <SkeletonPulse className='h-10 w-10 rounded-lg' />
      </div>
    </div>
  )
}

/**
 * Main Conversations Skeleton Component
 */
export default function ConversationsSkeleton({ userProfile, agentName = 'Agent' }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title={`${agentName} - Conversations`}
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Stats Cards */}
              <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <SkeletonStatCard color='orange' />
                <SkeletonStatCard color='blue' />
                <SkeletonStatCard color='purple' />
                <SkeletonStatCard color='green' />
              </div>

              {/* Filters */}
              <SkeletonFilterSection />

              {/* Conversations Grid */}
              <div id='conversations-section'>
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonConversationCard key={index} />
                  ))}
                </div>

                {/* Pagination */}
                <SkeletonPagination />
              </div>
            </div>
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
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