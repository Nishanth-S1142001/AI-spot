'use client'

import React from 'react'
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
 * Skeleton Progress Indicator
 */
function SkeletonProgressIndicator() {
  return (
    <div className='mb-8'>
      <div className='flex items-center justify-between'>
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div className='flex items-center'>
              <SkeletonPulse className='h-10 w-10 rounded-full' />
              <SkeletonPulse className='ml-2 h-4 w-20 rounded' />
            </div>
            {i < 3 && <SkeletonPulse className='mx-4 h-1 flex-1 rounded' />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton Step 1: Basic Information
 */
function SkeletonStep1() {
  return (
    <Card className='border-orange-600/20 shadow-xl'>
      <div className='space-y-6 p-6'>
        {/* Header */}
        <div>
          <SkeletonPulse className='mb-3 h-5 w-40 rounded' />
          <SkeletonPulse className='h-4 w-64 rounded' />
        </div>

        {/* Agent Name */}
        <div>
          <SkeletonPulse className='mb-2 h-4 w-24 rounded' />
          <SkeletonPulse className='h-10 w-full rounded-lg' />
        </div>

        {/* Domain Selection */}
        <div>
          <SkeletonPulse className='mb-3 h-4 w-32 rounded' />
          <div className='grid gap-4 sm:grid-cols-2'>
            {[1, 2, 3, 4, 5].map((i) => (
              <Card
                key={i}
                className='border border-neutral-700/50 bg-neutral-900/30'
              >
                <div className='flex items-center gap-3 p-4'>
                  <SkeletonPulse className='h-12 w-12 rounded-lg' />
                  <div className='flex-1 space-y-2'>
                    <SkeletonPulse className='h-5 w-24 rounded' />
                    <SkeletonPulse className='h-3 w-full rounded' />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Tone Selection */}
        <div>
          <SkeletonPulse className='mb-3 h-4 w-28 rounded' />
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className='rounded-lg border border-neutral-700/50 bg-neutral-900/30 p-3'
              >
                <SkeletonPulse className='mb-2 h-5 w-20 rounded' />
                <SkeletonPulse className='h-3 w-full rounded' />
              </div>
            ))}
          </div>
        </div>

        {/* Button */}
        <div className='flex justify-end pt-4'>
          <SkeletonPulse className='h-10 w-24 rounded-lg' />
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton Step 2: Knowledge Sources
 */
function SkeletonStep2() {
  return (
    <Card className='border-blue-600/20 shadow-xl'>
      <div className='space-y-6 p-6'>
        {/* Header */}
        <div>
          <SkeletonPulse className='mb-2 h-7 w-48 rounded' />
          <SkeletonPulse className='h-4 w-64 rounded' />
        </div>

        {/* Knowledge Summary Card */}
        <div className='rounded-lg border border-purple-600/20 bg-gradient-to-br from-purple-950/10 to-neutral-950/50 p-6'>
          <div className='flex items-start gap-4'>
            <SkeletonPulse className='h-12 w-12 rounded-full' />
            <div className='flex-1 space-y-3'>
              <SkeletonPulse className='h-6 w-48 rounded' />
              <SkeletonPulse className='h-4 w-full rounded' />
              
              {/* Quick Stats */}
              <div className='flex gap-4 pt-1'>
                <SkeletonPulse className='h-3 w-16 rounded' />
                <SkeletonPulse className='h-3 w-16 rounded' />
                <SkeletonPulse className='h-3 w-20 rounded' />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className='mt-4 flex justify-center'>
            <SkeletonPulse className='h-10 w-64 rounded-lg' />
          </div>
        </div>

        {/* Navigation */}
        <div className='flex justify-between pt-4'>
          <SkeletonPulse className='h-10 w-28 rounded-lg' />
          <SkeletonPulse className='h-10 w-24 rounded-lg' />
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton Step 3: Review
 */
function SkeletonStep3() {
  return (
    <Card className='border-green-600/20 shadow-xl'>
      <div className='space-y-6 p-6'>
        {/* Header */}
        <div>
          <SkeletonPulse className='mb-2 h-7 w-48 rounded' />
          <SkeletonPulse className='h-4 w-64 rounded' />
        </div>

        {/* Summary Grid */}
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Basic Information */}
          <div>
            <SkeletonPulse className='mb-3 h-4 w-40 rounded' />
            <div className='space-y-2'>
              <SkeletonPulse className='h-4 w-full rounded' />
              <SkeletonPulse className='h-4 w-3/4 rounded' />
              <SkeletonPulse className='h-4 w-2/3 rounded' />
            </div>
          </div>

          {/* Knowledge Sources */}
          <div>
            <SkeletonPulse className='mb-3 h-4 w-40 rounded' />
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <SkeletonPulse className='h-4 w-4 rounded' />
                <SkeletonPulse className='h-4 flex-1 rounded' />
              </div>
              <div className='flex items-center gap-2'>
                <SkeletonPulse className='h-4 w-4 rounded' />
                <SkeletonPulse className='h-4 flex-1 rounded' />
              </div>
              <div className='flex items-center gap-2'>
                <SkeletonPulse className='h-4 w-4 rounded' />
                <SkeletonPulse className='h-4 flex-1 rounded' />
              </div>
            </div>
          </div>
        </div>

        {/* System Prompt */}
        <div>
          <SkeletonPulse className='mb-2 h-4 w-32 rounded' />
          <div className='rounded-lg border border-neutral-700 bg-neutral-900 p-4'>
            <div className='space-y-2'>
              <SkeletonPulse className='h-4 w-full rounded' />
              <SkeletonPulse className='h-4 w-full rounded' />
              <SkeletonPulse className='h-4 w-5/6 rounded' />
              <SkeletonPulse className='h-4 w-full rounded' />
              <SkeletonPulse className='h-4 w-4/5 rounded' />
              <SkeletonPulse className='h-4 w-full rounded' />
              <SkeletonPulse className='h-4 w-3/4 rounded' />
            </div>

            <div className='mt-4 flex justify-end'>
              <SkeletonPulse className='h-8 w-24 rounded-lg' />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className='flex justify-between pt-4'>
          <SkeletonPulse className='h-10 w-28 rounded-lg' />
          <SkeletonPulse className='h-10 w-32 rounded-lg' />
        </div>
      </div>
    </Card>
  )
}

/**
 * Main Edit Agent Skeleton Component
 */
export default function EditAgentSkeleton({ userProfile, agentName = 'Agent' }) {
  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
          <NavigationBar
            profile={userProfile}
            title={`Edit: ${agentName}`}
            onLogOutClick={() => {}}
          />
        </div>

        {/* Content */}
        <div className='custom-scrollbar flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
            {/* Progress Indicator */}
            <SkeletonProgressIndicator />

            {/* Show Step 1 skeleton by default */}
            <SkeletonStep1 />
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