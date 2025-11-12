'use client'

import {
  FileText,
  Shield,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Scale,
  Users,
  Lock
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
 * Skeleton Quick Tip Card
 */
function SkeletonQuickTipCard({ color = 'orange' }) {
  const colorClasses = {
    green: 'border-green-600/30',
    blue: 'border-blue-600/30',
    purple: 'border-purple-600/30',
    orange: 'border-orange-600/30'
  }

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <div className='space-y-3'>
        <SkeletonPulse className='h-6 w-6 rounded' />
        <SkeletonPulse className='h-5 w-32 rounded' />
        <SkeletonPulse className='h-3 w-full rounded' />
      </div>
    </Card>
  )
}

/**
 * Skeleton Policy Section
 */
function SkeletonPolicySection({ icon: Icon }) {
  return (
    <Card className='border-neutral-800/50 bg-neutral-900/20'>
      <div className='space-y-4'>
        <div className='flex items-start gap-4'>
          <div className='flex-shrink-0 rounded-lg bg-orange-900/40 p-3'>
            <Icon className='h-6 w-6 text-orange-400' />
          </div>
          <div className='flex-1 space-y-4'>
            <SkeletonPulse className='h-7 w-64 rounded' />
            <div className='space-y-3'>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className='flex items-start gap-3'>
                  <div className='h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-2' />
                  <SkeletonPulse className='h-4 w-full rounded' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

/**
 * Main Usage Policy Page Skeleton Component
 */
export default function UsagePolicyPageSkeleton({ userProfile }) {
  const policyIcons = [
    FileText,
    Lock,
    CheckCircle2,
    XCircle,
    FileText,
    Scale,
    Users,
    Shield,
    XCircle,
    AlertCircle,
    Shield,
    Lock,
    FileText,
    Scale,
    FileText
  ]

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title='Usage Policy'
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Header Section */}
              <div className='mb-12 text-center'>
                <div className='mb-6 flex justify-center'>
                  <div className='rounded-full bg-gradient-to-br from-orange-500 to-orange-600 p-6'>
                    <FileText className='h-12 w-12 text-white' />
                  </div>
                </div>
                <h1 className='mb-4 text-4xl font-bold text-neutral-100'>
                  Usage Policy & Terms of Service
                </h1>
                <div className='mx-auto max-w-2xl space-y-2'>
                  <SkeletonPulse className='mx-auto h-5 w-full rounded' />
                  <SkeletonPulse className='mx-auto h-5 w-3/4 rounded' />
                </div>
                <div className='mt-6 flex items-center justify-center gap-2'>
                  <SkeletonPulse className='h-4 w-48 rounded' />
                </div>
              </div>

              {/* Quick Guidelines */}
              <div className='mb-12'>
                <h2 className='mb-6 text-2xl font-bold text-neutral-100'>
                  Quick Guidelines
                </h2>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <SkeletonQuickTipCard color='green' />
                  <SkeletonQuickTipCard color='blue' />
                  <SkeletonQuickTipCard color='purple' />
                  <SkeletonQuickTipCard color='orange' />
                </div>
              </div>

              {/* Policy Sections */}
              <div className='space-y-8'>
                {policyIcons.map((Icon, idx) => (
                  <SkeletonPolicySection key={idx} icon={Icon} />
                ))}
              </div>

              {/* Contact Section */}
              <Card className='mt-12 border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <AlertCircle className='h-6 w-6 text-blue-400' />
                    <SkeletonPulse className='h-6 w-64 rounded' />
                  </div>
                  <div className='space-y-2'>
                    <SkeletonPulse className='h-4 w-full rounded' />
                    <SkeletonPulse className='h-4 w-3/4 rounded' />
                  </div>
                  <div className='space-y-2'>
                    <SkeletonPulse className='h-4 w-48 rounded' />
                    <SkeletonPulse className='h-4 w-48 rounded' />
                  </div>
                </div>
              </Card>

              {/* Agreement Section */}
              <Card className='mt-8 border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
                <div className='space-y-4 text-center'>
                  <CheckCircle2 className='h-12 w-12 text-orange-400 mx-auto' />
                  <SkeletonPulse className='mx-auto h-6 w-96 rounded' />
                  <div className='mx-auto max-w-md space-y-1'>
                    <SkeletonPulse className='mx-auto h-4 w-full rounded' />
                    <SkeletonPulse className='mx-auto h-4 w-3/4 rounded' />
                  </div>
                </div>
              </Card>
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