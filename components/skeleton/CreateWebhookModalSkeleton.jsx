'use client'

import { XCircle, Plus } from 'lucide-react'
import { memo } from 'react'

const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-lg bg-neutral-800/60 ${className}`} />
)

const CreateWebhookModalSkeleton = memo(() => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-orange-600/20 bg-gradient-to-br from-neutral-950/95 via-neutral-900/90 to-neutral-950/95 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-neutral-800/50">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-900/30 p-2 ring-1 ring-orange-500/50">
              <Plus className="h-5 w-5 text-orange-500" />
            </div>
            <Skeleton className="h-6 w-40" />
          </div>
          <XCircle className="h-5 w-5 text-neutral-500" />
        </div>

        {/* Form Skeleton */}
        <div className="space-y-5">
          {/* Name Field */}
          <div>
            <Skeleton className="mb-2 h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Description */}
          <div>
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>

          {/* URL */}
          <div>
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="mt-2 h-3 w-48" />
          </div>

          {/* Events */}
          <div>
            <Skeleton className="mb-3 h-4 w-40" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div>
            <Skeleton className="h-14 w-full" />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-neutral-800/50 pt-5">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
})

CreateWebhookModalSkeleton.displayName = 'CreateWebhookModalSkeleton'

export default CreateWebhookModalSkeleton
    