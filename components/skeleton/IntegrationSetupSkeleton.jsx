'use client'

import {
  ExternalLink,
  Shield,
  Zap
} from 'lucide-react'
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
 * Skeleton Form Field
 */
function SkeletonFormField({ hasDescription = true }) {
  return (
    <div>
      <div className='mb-2 flex items-center gap-2'>
        <SkeletonPulse className='h-4 w-32 rounded' />
      </div>
      
      {hasDescription && (
        <SkeletonPulse className='mb-2 h-3 w-64 rounded' />
      )}
      
      <SkeletonPulse className='h-11 w-full rounded-lg' />
    </div>
  )
}

/**
 * Main Integration Setup Skeleton Component
 */
export default function IntegrationSetupSkeleton({ userProfile }) {
  return (
    <div className='relative min-h-screen font-mono'>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar profile={userProfile} onLogOutClick={() => {}} />
          </div>

          <div className='m-10 mx-auto max-w-3xl'>
            {/* Integration Info Header */}
            <div className='mb-8 flex items-start gap-4'>
              {/* Logo */}
              <SkeletonPulse className='h-16 w-16 flex-shrink-0 rounded-xl' />
              
              {/* Info */}
              <div className='flex-1 space-y-3'>
                <SkeletonPulse className='h-8 w-48 rounded' />
                <SkeletonPulse className='h-5 w-96 rounded' />
                <div className='mt-3 flex items-center gap-1'>
                  <ExternalLink size={14} className='text-neutral-600' />
                  <SkeletonPulse className='h-4 w-40 rounded' />
                </div>
              </div>
            </div>

            {/* Configuration Form */}
            <div className='rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 shadow-xl'>
              {/* Form Header */}
              <div className='mb-6 flex items-center gap-2'>
                <Zap className='h-5 w-5 text-orange-400' />
                <h2 className='text-lg font-semibold text-neutral-100'>
                  Configuration
                </h2>
              </div>

              {/* Form Fields */}
              <div className='space-y-6'>
                <SkeletonFormField hasDescription={true} />
                <SkeletonFormField hasDescription={true} />
                <SkeletonFormField hasDescription={true} />
                <SkeletonFormField hasDescription={false} />
              </div>

              {/* Action Buttons */}
              <div className='mt-8 flex flex-wrap gap-3'>
                <SkeletonPulse className='h-11 w-40 rounded-lg' />
                <SkeletonPulse className='h-11 w-44 rounded-lg' />
              </div>
            </div>

            {/* Security Info Box */}
            <div className='mt-6 flex gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4'>
              <Shield size={20} className='mt-0.5 flex-shrink-0 text-blue-400' />
              <div className='flex-1 space-y-2'>
                <p className='font-medium text-blue-400'>Security Note</p>
                <div className='space-y-1'>
                  <SkeletonPulse className='h-4 w-full rounded' />
                  <SkeletonPulse className='h-4 w-3/4 rounded' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SideBarLayout>
    </div>
  )
}