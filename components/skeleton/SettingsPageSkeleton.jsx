'use client'

import { 
  User, 
  CreditCard, 
  Crown, 
  Settings as SettingsIcon,
  Shield
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
 * Skeleton Settings Card Component
 */
function SkeletonSettingsCard({ color = 'orange' }) {
  const colorClasses = {
    orange: {
      bg: 'from-orange-900/40 to-orange-950/20',
      border: 'border-orange-600/30',
      icon: 'bg-orange-900/40'
    },
    blue: {
      bg: 'from-blue-900/40 to-blue-950/20',
      border: 'border-blue-600/30',
      icon: 'bg-blue-900/40'
    },
    purple: {
      bg: 'from-purple-900/40 to-purple-950/20',
      border: 'border-purple-600/30',
      icon: 'bg-purple-900/40'
    }
  }

  const colors = colorClasses[color] || colorClasses.orange

  return (
    <Card 
      className={`border bg-gradient-to-br ${colors.bg} ${colors.border}`}
    >
      <div className='space-y-4'>
        {/* Header */}
        <div className='flex items-start gap-4'>
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${colors.icon}`}>
            <SkeletonPulse className='h-6 w-6 rounded' />
          </div>
          <div className='flex-1 space-y-2'>
            <SkeletonPulse className='h-6 w-32 rounded' />
            <SkeletonPulse className='h-4 w-full rounded' />
          </div>
        </div>

        {/* Items List */}
        <div className='space-y-2 pl-16'>
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-neutral-600' />
              <SkeletonPulse className='h-3 w-40 rounded' />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

/**
 * Main Settings Overview Page Skeleton Component
 */
export default function SettingsPageSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title='Settings'
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Page Header */}
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-2'>
                  <SettingsIcon className='h-8 w-8 text-orange-500' />
                  <h1 className='text-4xl font-bold text-neutral-100'>
                    Settings
                  </h1>
                </div>
                <p className='text-neutral-400'>
                  Manage your account settings and preferences
                </p>
              </div>

              {/* Settings Cards Grid */}
              <div className='grid gap-6 lg:grid-cols-2'>
                <SkeletonSettingsCard color='orange' />
                <SkeletonSettingsCard color='blue' />
                <SkeletonSettingsCard color='purple' />
              </div>

              {/* Security Info Section */}
              <div className='mt-8 rounded-lg border border-neutral-800/50 bg-neutral-900/20 p-6'>
                <div className='flex items-start gap-4'>
                  <Shield className='h-6 w-6 text-green-400 mt-1 flex-shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <SkeletonPulse className='h-5 w-40 rounded' />
                    <div className='space-y-1'>
                      <SkeletonPulse className='h-3 w-full rounded' />
                      <SkeletonPulse className='h-3 w-3/4 rounded' />
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