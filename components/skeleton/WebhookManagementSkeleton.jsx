'use client'

import {
  Activity,
  CheckCircle,
  Plus,
  Webhook,
  Zap
} from 'lucide-react'
import NavigationBar from '../../components/navigationBar/navigationBar'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Button from '../../components/ui/button'

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
function SkeletonStatCard({ icon: Icon }) {
  return (
    <div className='group relative overflow-hidden rounded-xl border border-neutral-800/50 bg-gradient-to-br from-neutral-950/50 to-neutral-900/30 p-6 backdrop-blur-sm'>
      <div className='flex items-start justify-between'>
        <div className='flex-1 space-y-2'>
          <SkeletonPulse className='h-4 w-24 rounded' />
          <SkeletonPulse className='h-8 w-20 rounded' />
          <SkeletonPulse className='h-3 w-16 rounded' />
        </div>
        <div className='rounded-lg bg-orange-900/20 p-3 ring-1 ring-orange-500/30'>
          <Icon className='h-6 w-6 text-neutral-600' />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton Webhook Card
 */
function SkeletonWebhookCard({ isSelected = false }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isSelected
          ? 'border-orange-600/50 bg-gradient-to-br from-orange-950/20 via-neutral-950/50 to-neutral-950/30'
          : 'border-neutral-800/50 bg-neutral-950/30'
      }`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1 space-y-3'>
          <div className='flex items-center gap-3'>
            <Webhook className='h-5 w-5 text-neutral-600' />
            <SkeletonPulse className='h-5 w-32 rounded' />
            <SkeletonPulse className='h-6 w-16 rounded-full' />
          </div>

          <SkeletonPulse className='h-4 w-full rounded' />
          <SkeletonPulse className='h-4 w-3/4 rounded' />

          <div className='flex flex-wrap gap-2'>
            <SkeletonPulse className='h-6 w-24 rounded-full' />
            <SkeletonPulse className='h-6 w-20 rounded-full' />
          </div>
        </div>

        <div className='ml-4 flex flex-col gap-2'>
          <SkeletonPulse className='h-8 w-8 rounded-lg' />
          <SkeletonPulse className='h-8 w-8 rounded-lg' />
          <SkeletonPulse className='h-8 w-8 rounded-lg' />
        </div>
      </div>

      {isSelected && (
        <div className='mt-4 space-y-2 border-t border-neutral-800/50 pt-4'>
          <div className='flex flex-wrap gap-2'>
            <SkeletonPulse className='h-8 flex-1 rounded-lg' />
            <SkeletonPulse className='h-8 flex-1 rounded-lg' />
            <SkeletonPulse className='h-8 flex-1 rounded-lg' />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Skeleton Invocation Row
 */
function SkeletonInvocationRow() {
  return (
    <div className='rounded-lg border border-neutral-800/50 bg-neutral-950/30 p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <SkeletonPulse className='h-5 w-5 rounded-full' />
          <div className='space-y-2'>
            <SkeletonPulse className='h-4 w-24 rounded' />
            <SkeletonPulse className='h-3 w-40 rounded' />
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <SkeletonPulse className='h-6 w-16 rounded-full' />
          <SkeletonPulse className='h-4 w-4 rounded' />
        </div>
      </div>
    </div>
  )
}

/**
 * Main Webhook Management Skeleton Component
 */
export default function WebhookManagementSkeleton({ userProfile, agentName = 'Agent' }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              message='Webhook Management'
              agent={{ name: agentName }}
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
              {/* Page Header */}
              <div className='mb-8 rounded-2xl border border-orange-600/20 bg-gradient-to-br from-orange-950/10 via-neutral-950/50 to-neutral-950/30 p-6 backdrop-blur-sm'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-2'>
                    <h1 className='text-3xl font-bold text-neutral-100'>
                      Webhooks
                    </h1>
                    <p className='text-sm text-neutral-400'>
                      Manage real-time event notifications for {agentName}
                    </p>
                  </div>
                  <Button disabled className='flex items-center gap-2 opacity-50 cursor-not-allowed'>
                    <Plus className='h-4 w-4' />
                    Create Webhook
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <SkeletonStatCard icon={Activity} />
                <SkeletonStatCard icon={CheckCircle} />
                <SkeletonStatCard icon={Zap} />
                <SkeletonStatCard icon={Activity} />
              </div>

              {/* Main Content Grid */}
              <div className='grid gap-6 lg:grid-cols-3'>
                {/* Webhooks List */}
                <div className='space-y-4 lg:col-span-1'>
                  <div className='rounded-xl border border-neutral-800/50 bg-neutral-950/30 p-4 backdrop-blur-sm'>
                    <h2 className='mb-4 text-lg font-semibold text-neutral-100'>
                      Your Webhooks
                    </h2>
                    <div className='space-y-3'>
                      <SkeletonWebhookCard isSelected={true} />
                      <SkeletonWebhookCard />
                      <SkeletonWebhookCard />
                    </div>
                  </div>
                </div>

                {/* Invocations Panel */}
                <div className='lg:col-span-2'>
                  <div className='rounded-xl border border-neutral-800/50 bg-neutral-950/30 p-6 backdrop-blur-sm'>
                    <div className='mb-6 flex items-center justify-between'>
                      <h2 className='text-lg font-semibold text-neutral-100'>
                        Recent Invocations
                      </h2>
                      <div className='flex gap-2'>
                        <SkeletonPulse className='h-8 w-24 rounded-lg' />
                        <SkeletonPulse className='h-8 w-20 rounded-lg' />
                      </div>
                    </div>

                    <div className='space-y-3'>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <SkeletonInvocationRow key={index} />
                      ))}
                    </div>
                  </div>
                </div>
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