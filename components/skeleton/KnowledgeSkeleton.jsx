'use client'

import NavigationBar from '../../../components/navigationBar/navigationBar'
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
function SkeletonStatCard({ color = 'purple' }) {
  const colorClasses = {
    purple: {
      bg: 'from-purple-950/10 to-neutral-950/50',
      border: 'border-purple-600/20'
    },
    orange: {
      bg: 'from-orange-950/10 to-neutral-950/50',
      border: 'border-orange-600/20'
    },
    blue: {
      bg: 'from-blue-950/10 to-neutral-950/50',
      border: 'border-blue-600/20'
    },
    red: {
      bg: 'from-red-950/10 to-neutral-950/50',
      border: 'border-red-600/20'
    },
    green: {
      bg: 'from-green-950/10 to-neutral-950/50',
      border: 'border-green-600/20'
    }
  }

  const colors = colorClasses[color] || colorClasses.purple

  return (
    <Card
      className={`border bg-gradient-to-br ${colors.border} ${colors.bg}`}
    >
      <div className='p-4'>
        <div className='flex items-center gap-3'>
          <SkeletonPulse className='h-12 w-12 rounded-full' />
          <div className='space-y-2'>
            <SkeletonPulse className='h-8 w-12 rounded' />
            <SkeletonPulse className='h-3 w-20 rounded' />
          </div>
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton Knowledge Upload Section
 */
function SkeletonKnowledgeUploadSection() {
  return (
    <div className='space-y-6'>
      {/* Header with tabs */}
      <div className='space-y-4'>
        <div className='flex gap-2'>
          <SkeletonPulse className='h-10 w-24 rounded-lg' />
          <SkeletonPulse className='h-10 w-24 rounded-lg' />
          <SkeletonPulse className='h-10 w-32 rounded-lg' />
          <SkeletonPulse className='h-10 w-28 rounded-lg' />
        </div>
        <SkeletonPulse className='h-px w-full' />
      </div>

      {/* Upload Area */}
      <div className='rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-900/30 p-12'>
        <div className='flex flex-col items-center space-y-4'>
          <SkeletonPulse className='h-16 w-16 rounded-full' />
          <div className='space-y-2 text-center'>
            <SkeletonPulse className='mx-auto h-5 w-48 rounded' />
            <SkeletonPulse className='mx-auto h-4 w-64 rounded' />
          </div>
          <SkeletonPulse className='h-10 w-32 rounded-lg' />
        </div>
      </div>

      {/* Knowledge Sources List */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <SkeletonPulse className='h-6 w-40 rounded' />
          <SkeletonPulse className='h-4 w-32 rounded' />
        </div>

        {/* Source Items */}
        <div className='space-y-3'>
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className='border-neutral-700/50 bg-neutral-900/30'
            >
              <div className='flex items-center gap-4 p-4'>
                <SkeletonPulse className='h-10 w-10 rounded-lg' />
                <div className='flex-1 space-y-2'>
                  <SkeletonPulse className='h-5 w-48 rounded' />
                  <div className='flex gap-3'>
                    <SkeletonPulse className='h-3 w-20 rounded' />
                    <SkeletonPulse className='h-3 w-24 rounded' />
                    <SkeletonPulse className='h-3 w-28 rounded' />
                  </div>
                </div>
                <div className='flex gap-2'>
                  <SkeletonPulse className='h-8 w-8 rounded' />
                  <SkeletonPulse className='h-8 w-8 rounded' />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Main Knowledge Skeleton Component
 */
export default function KnowledgeSkeleton({ userProfile, agentName = 'Agent' }) {
  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
          <NavigationBar
            profile={userProfile}
            title={`${agentName} - Knowledge Base`}
            onLogOutClick={() => {}}
          />
        </div>

        {/* Content */}
        <div className='custom-scrollbar flex-1 overflow-y-auto p-6'>
          <div className='mx-auto max-w-6xl'>
            {/* Header */}
            <div className='mb-6'>
              <SkeletonPulse className='mb-2 h-9 w-64 rounded' />
              <SkeletonPulse className='h-5 w-96 rounded' />
            </div>

            {/* Stats Cards */}
            <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
              <SkeletonStatCard color='purple' />
              <SkeletonStatCard color='orange' />
              <SkeletonStatCard color='blue' />
              <SkeletonStatCard color='red' />
              <SkeletonStatCard color='green' />
            </div>

            {/* Knowledge Upload Section */}
            <Card className='border-purple-600/20'>
              <div className='p-6'>
                <SkeletonKnowledgeUploadSection />
              </div>
            </Card>
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