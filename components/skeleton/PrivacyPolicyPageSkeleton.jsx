'use client'

import {
  Mail,
  Shield,
  UserCheck
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
 * Skeleton Highlight Card
 */
function SkeletonHighlightCard() {
  return (
    <Card className='border border-blue-600/30 text-blue-400'>
      <div className='space-y-3'>
        <SkeletonPulse className='h-6 w-6 rounded' />
        <SkeletonPulse className='h-5 w-32 rounded' />
        <SkeletonPulse className='h-4 w-full rounded' />
      </div>
    </Card>
  )
}

/**
 * Skeleton Policy Section
 */
function SkeletonPolicySection() {
  return (
    <Card className='border-neutral-800/50 bg-neutral-900/20'>
      <div className='space-y-4'>
        <div className='flex items-start gap-4'>
          <SkeletonPulse className='h-12 w-12 flex-shrink-0 rounded-lg' />
          <div className='flex-1 space-y-4'>
            <SkeletonPulse className='h-8 w-64 rounded' />
            
            <div className='space-y-3'>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className='flex items-start gap-3'>
                  <SkeletonPulse className='h-1.5 w-1.5 rounded-full flex-shrink-0 mt-2' />
                  <SkeletonPulse className='h-4 flex-1 rounded' />
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
 * Main Privacy Policy Page Skeleton Component
 */
export default function PrivacyPolicyPageSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title='Privacy Policy'
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Header Section */}
              <div className='mb-12 text-center'>
                <div className='mb-6 flex justify-center'>
                  <div className='rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-6 opacity-50'>
                    <Shield className='h-12 w-12 text-white' />
                  </div>
                </div>
                <h1 className='mb-4 text-4xl font-bold text-neutral-100'>
                  Privacy Policy
                </h1>
                <div className='mx-auto max-w-2xl space-y-2'>
                  <SkeletonPulse className='mx-auto h-6 w-96 rounded' />
                  <SkeletonPulse className='mx-auto h-6 w-80 rounded' />
                </div>
                <div className='mt-6 flex items-center justify-center gap-2'>
                  <SkeletonPulse className='h-4 w-48 rounded' />
                </div>
              </div>

              {/* Highlights Section */}
              <div className='mb-12'>
                <h2 className='mb-6 text-2xl font-bold text-neutral-100'>
                  Our Commitment to You
                </h2>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonHighlightCard key={index} />
                  ))}
                </div>
              </div>

              {/* Policy Sections */}
              <div className='space-y-8'>
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonPolicySection key={index} />
                ))}
              </div>

              {/* Contact Section */}
              <Card className='mt-12 border-green-600/20 bg-gradient-to-br from-green-950/10 to-neutral-950/50'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <Mail className='h-6 w-6 text-green-400' />
                    <h2 className='text-2xl font-bold text-neutral-100'>
                      Privacy Questions?
                    </h2>
                  </div>
                  <div className='space-y-2'>
                    <SkeletonPulse className='h-4 w-full rounded' />
                    <SkeletonPulse className='h-4 w-3/4 rounded' />
                  </div>
                  <div className='space-y-2'>
                    <SkeletonPulse className='h-4 w-64 rounded' />
                    <SkeletonPulse className='h-4 w-56 rounded' />
                    <SkeletonPulse className='h-4 w-48 rounded' />
                  </div>
                </div>
              </Card>

              {/* CTA Section */}
              <Card className='mt-8 border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
                <div className='space-y-4 text-center'>
                  <UserCheck className='h-12 w-12 text-blue-400 mx-auto' />
                  <h3 className='text-xl font-bold text-neutral-100'>
                    Exercise Your Privacy Rights
                  </h3>
                  <SkeletonPulse className='mx-auto h-4 w-96 rounded' />
                  <div className='flex flex-wrap justify-center gap-4'>
                    <SkeletonPulse className='h-10 w-40 rounded-lg' />
                    <SkeletonPulse className='h-10 w-48 rounded-lg' />
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