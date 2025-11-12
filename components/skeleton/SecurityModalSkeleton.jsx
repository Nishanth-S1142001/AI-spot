'use client'

import { Shield, Lock, Zap, Globe, XCircle } from 'lucide-react'
import { memo } from 'react'

const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-lg bg-neutral-800/60 ${className}`} />
)

const SecurityModalSkeleton = memo(() => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn'>
      <div className='mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-orange-600/20 bg-gradient-to-br from-neutral-950/95 via-neutral-900/90 to-neutral-950/95 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-neutral-800/50'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-orange-900/30 p-2 ring-1 ring-orange-500/50'>
              <Shield className='h-5 w-5 text-orange-500' />
            </div>
            <div>
              <Skeleton className='mb-2 h-5 w-40' />
              <Skeleton className='h-3 w-28' />
            </div>
          </div>
          <XCircle className='h-5 w-5 text-neutral-500' />
        </div>

        {/* Authentication */}
        <div className='space-y-6'>
          <div className='rounded-xl border border-neutral-800/50 bg-neutral-900/30 p-5'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-lg bg-blue-900/30 p-2 ring-1 ring-blue-500/50'>
                <Lock className='h-4 w-4 text-blue-400' />
              </div>
              <Skeleton className='h-4 w-32' />
            </div>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='mt-3 h-3 w-3/4' />
          </div>

          {/* Rate Limiting */}
          <div className='rounded-xl border border-neutral-800/50 bg-neutral-900/30 p-5'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-lg bg-yellow-900/30 p-2 ring-1 ring-yellow-500/50'>
                <Zap className='h-4 w-4 text-yellow-400' />
              </div>
              <Skeleton className='h-4 w-32' />
            </div>
            <Skeleton className='mb-2 h-4 w-48' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='mt-2 h-3 w-4/5' />
          </div>

          {/* Allowed Origins */}
          <div className='rounded-xl border border-neutral-800/50 bg-neutral-900/30 p-5'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-lg bg-purple-900/30 p-2 ring-1 ring-purple-500/50'>
                <Globe className='h-4 w-4 text-purple-400' />
              </div>
              <Skeleton className='h-4 w-40' />
            </div>
            <Skeleton className='mb-2 h-4 w-48' />
            <Skeleton className='h-32 w-full' />
            <Skeleton className='mt-2 h-3 w-3/4' />
          </div>

          {/* Info Banner */}
          <div className='rounded-xl border border-blue-600/30 bg-blue-900/10 p-4 ring-1 ring-blue-500/20'>
            <div className='flex gap-3'>
              <Shield className='h-5 w-5 flex-shrink-0 text-blue-400' />
              <div className='w-full space-y-2'>
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-3 w-3/4' />
                <Skeleton className='h-3 w-2/3' />
                <Skeleton className='h-3 w-4/5' />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 border-t border-neutral-800/50 pt-5'>
            <Skeleton className='h-10 w-24' />
            <Skeleton className='h-10 w-40' />
          </div>
        </div>
      </div>
    </div>
  )
})

SecurityModalSkeleton.displayName = 'SecurityModalSkeleton'

export default SecurityModalSkeleton
