'use client'

import NavigationBar from '../../components/navigationBar/navigationBar'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'

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
 * Skeleton Agent Header Card
 */
function SkeletonAgentHeader() {
  return (
    <div className='mb-8 rounded-2xl border border-orange-600/20 bg-gradient-to-br from-orange-950/10 via-neutral-950/50 to-neutral-950/30 p-6 backdrop-blur-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex-1 space-y-3'>
          <SkeletonPulse className='h-9 w-64 rounded' />
          <div className='flex items-center gap-2'>
            <SkeletonPulse className='h-4 w-32 rounded' />
            <SkeletonPulse className='h-3 w-1 rounded-full' />
            <SkeletonPulse className='h-4 w-24 rounded' />
            <SkeletonPulse className='h-3 w-1 rounded-full' />
            <SkeletonPulse className='h-4 w-20 rounded' />
          </div>
        </div>

        {/* Status Badge Skeleton */}
        <SkeletonPulse className='h-10 w-24 rounded-full' />
      </div>
    </div>
  )
}

/**
 * Skeleton Tab Navigation
 */
function SkeletonTabNavigation() {
  return (
    <div className='mb-6'>
      <div className='rounded-xl border border-neutral-800/50 bg-neutral-950/50 p-1 backdrop-blur-sm'>
        <nav className='flex flex-wrap gap-1'>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className='flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3'
            >
              <SkeletonPulse className='h-4 w-4 rounded' />
              <SkeletonPulse className='hidden h-4 w-16 rounded sm:block' />
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}

/**
 * Skeleton Overview Tab Content
 */
function SkeletonOverviewContent() {
  return (
    <div className='space-y-6'>
      {/* Quick Actions Card */}
      <div className='rounded-xl border border-neutral-800/50 bg-neutral-950/50 p-6'>
        <SkeletonPulse className='mb-4 h-6 w-32 rounded' />
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='rounded-lg border border-neutral-700/50 bg-neutral-900/30 p-4'
            >
              <SkeletonPulse className='mb-2 h-10 w-10 rounded-full' />
              <SkeletonPulse className='mb-1 h-4 w-20 rounded' />
              <SkeletonPulse className='h-3 w-full rounded' />
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='rounded-xl border border-neutral-700/50 bg-neutral-900/30 p-4'
          >
            <div className='flex items-center gap-3'>
              <SkeletonPulse className='h-12 w-12 rounded-full' />
              <div className='flex-1 space-y-2'>
                <SkeletonPulse className='h-4 w-24 rounded' />
                <SkeletonPulse className='h-6 w-16 rounded' />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Sections */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <div className='rounded-xl border border-neutral-700/50 bg-neutral-900/30 p-6'>
          <SkeletonPulse className='mb-4 h-5 w-32 rounded' />
          <div className='space-y-3'>
            <SkeletonPulse className='h-4 w-full rounded' />
            <SkeletonPulse className='h-4 w-5/6 rounded' />
            <SkeletonPulse className='h-4 w-4/5 rounded' />
          </div>
        </div>

        <div className='rounded-xl border border-neutral-700/50 bg-neutral-900/30 p-6'>
          <SkeletonPulse className='mb-4 h-5 w-32 rounded' />
          <div className='space-y-3'>
            <SkeletonPulse className='h-4 w-full rounded' />
            <SkeletonPulse className='h-4 w-5/6 rounded' />
            <SkeletonPulse className='h-4 w-4/5 rounded' />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className='rounded-xl border border-red-600/20 bg-gradient-to-br from-red-950/10 to-neutral-950/50 p-6'>
        <SkeletonPulse className='mb-4 h-6 w-32 rounded' />
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <SkeletonPulse className='h-5 w-48 rounded' />
            <SkeletonPulse className='h-4 w-64 rounded' />
          </div>
          <SkeletonPulse className='h-10 w-28 rounded-lg' />
        </div>
      </div>
    </div>
  )
}

/**
 * Main Agent Management Skeleton Component
 */
export default function AgentManagementSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              message='Agent Management'
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content Area */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
              {/* Agent Header Card */}
              <SkeletonAgentHeader />

              {/* Tab Navigation */}
              <SkeletonTabNavigation />

              {/* Tab Content - Overview by default */}
              <div className='animate-fadeIn'>
                <SkeletonOverviewContent />
              </div>
            </div>
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

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