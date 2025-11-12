'use client'

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
 * Skeleton Chat Message
 */
function SkeletonChatMessage({ isUser = false }) {
  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {!isUser && <SkeletonPulse className='h-8 w-8 flex-shrink-0 rounded-full' />}
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
        isUser ? 'bg-orange-500/20' : 'bg-neutral-900/50'
      }`}>
        <SkeletonPulse className='h-4 w-48 rounded' />
        <SkeletonPulse className='mt-2 h-4 w-32 rounded' />
      </div>
    </div>
  )
}

/**
 * Skeleton Knowledge Source Card
 */
function SkeletonKnowledgeCard() {
  return (
    <div className='rounded-lg border border-purple-600/20 bg-neutral-900/50 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-start gap-3 flex-1'>
          <SkeletonPulse className='h-5 w-5 flex-shrink-0 rounded' />
          <div className='flex-1 space-y-2'>
            <SkeletonPulse className='h-4 w-40 rounded' />
            <SkeletonPulse className='h-3 w-32 rounded' />
            <SkeletonPulse className='h-3 w-full rounded' />
            <SkeletonPulse className='h-3 w-5/6 rounded' />
          </div>
        </div>
        <SkeletonPulse className='h-4 w-4 rounded' />
      </div>
    </div>
  )
}

/**
 * Main Playground Skeleton Component
 */
export default function PlaygroundSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              message='Playground'
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className='flex flex-1 gap-6 overflow-hidden p-6'>
            {/* Left: Chat Section */}
            <div className='flex w-1/2 flex-col'>
              <Card className='flex h-full flex-col border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
                {/* Chat Header */}
                <div className='flex items-center justify-between border-b border-neutral-800/50 p-4'>
                  <div className='flex items-center gap-3'>
                    <SkeletonPulse className='h-10 w-10 rounded-full' />
                    <div className='space-y-2'>
                      <SkeletonPulse className='h-4 w-24 rounded' />
                      <SkeletonPulse className='h-3 w-32 rounded' />
                    </div>
                  </div>
                  <SkeletonPulse className='h-8 w-8 rounded' />
                </div>

                {/* Messages */}
                <div className='custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4'>
                  <SkeletonChatMessage isUser={false} />
                  <SkeletonChatMessage isUser={true} />
                  <SkeletonChatMessage isUser={false} />
                  <SkeletonChatMessage isUser={true} />
                </div>

                {/* Input */}
                <div className='border-t border-neutral-800/50 p-4'>
                  <div className='flex gap-2'>
                    <SkeletonPulse className='h-12 flex-1 rounded-lg' />
                    <SkeletonPulse className='h-12 w-12 rounded-lg' />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Knowledge Base Section */}
            <div className='flex w-1/2 flex-col'>
              <Card className='flex h-full flex-col border-purple-600/20 bg-gradient-to-br from-purple-950/10 to-neutral-950/50'>
                {/* Knowledge Header */}
                <div className='border-b border-neutral-800/50 p-4'>
                  <div className='flex items-center gap-3'>
                    <SkeletonPulse className='h-5 w-5 rounded' />
                    <div className='flex-1 space-y-2'>
                      <SkeletonPulse className='h-4 w-40 rounded' />
                      <SkeletonPulse className='h-3 w-24 rounded' />
                    </div>
                    <SkeletonPulse className='h-3 w-3 rounded-full' />
                  </div>
                </div>

                {/* Knowledge Body */}
                <div className='custom-scrollbar flex-1 overflow-y-auto p-6'>
                  <div className='space-y-4'>
                    <SkeletonKnowledgeCard />
                    <SkeletonKnowledgeCard />
                    <SkeletonKnowledgeCard />
                    <div className='rounded-lg border border-blue-600/20 bg-blue-900/10 p-3'>
                      <SkeletonPulse className='h-3 w-full rounded' />
                    </div>
                  </div>
                </div>

                {/* Instructions Input */}
                <div className='border-t border-neutral-800/50 p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <SkeletonPulse className='h-4 w-4 rounded' />
                    <SkeletonPulse className='h-4 w-32 rounded' />
                  </div>
                  <div className='flex gap-2'>
                    <SkeletonPulse className='h-24 flex-1 rounded-lg' />
                    <SkeletonPulse className='h-10 w-10 self-end rounded-lg' />
                  </div>
                  <SkeletonPulse className='mt-2 h-3 w-64 rounded' />
                </div>
              </Card>
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