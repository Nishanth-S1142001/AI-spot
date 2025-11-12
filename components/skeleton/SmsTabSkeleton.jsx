'use client'

import Card from '../ui/card'

export default function SmsTabSkeleton() {
  const shimmer = 'animate-pulse bg-neutral-800/50'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className={`h-6 w-40 rounded-md ${shimmer}`} />
            <div className={`mt-2 h-4 w-64 rounded-md ${shimmer}`} />
          </div>
          <div className="flex items-center gap-3">
            <div className={`h-8 w-24 rounded-md ${shimmer}`} />
            <div className={`h-9 w-28 rounded-md ${shimmer}`} />
          </div>
        </div>
      </div>

      {/* Setup / Settings Placeholder */}
      <Card className="p-6 space-y-6 bg-neutral-900/30 border border-neutral-800">
        {/* Tabs (if config exists) */}
        <div className="flex gap-4 border-b border-neutral-800 pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-6 w-24 rounded-md ${shimmer}`}
            />
          ))}
        </div>

        {/* Tab content skeleton */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-24 rounded-lg border border-neutral-800 ${shimmer}`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <div className={`h-9 w-28 rounded-md ${shimmer}`} />
          <div className={`h-9 w-28 rounded-md ${shimmer}`} />
        </div>
      </Card>
    </div>
  )
}
