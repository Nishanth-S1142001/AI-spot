'use client'

import { XCircle, Zap } from 'lucide-react'
import { memo } from 'react'

const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-lg bg-neutral-800/60 ${className}`} />
)

const TestWebhookModalSkeleton = memo(() => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-orange-600/20 bg-gradient-to-br from-neutral-950/95 via-neutral-900/90 to-neutral-950/95 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-neutral-800/50">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-900/30 p-2 ring-1 ring-orange-500/50">
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <Skeleton className="mb-2 h-5 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <XCircle className="h-5 w-5 text-neutral-500" />
        </div>

        {/* Payload Editor */}
        <div className="space-y-5">
          <div>
            <Skeleton className="mb-2 h-4 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="mt-2 h-3 w-64" />
          </div>

          {/* Test Result Placeholder */}
          <div>
            <Skeleton className="h-32 w-full rounded-xl border border-neutral-800/50" />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-neutral-800/50 pt-5">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  )
})

TestWebhookModalSkeleton.displayName = 'TestWebhookModalSkeleton'

export default TestWebhookModalSkeleton
