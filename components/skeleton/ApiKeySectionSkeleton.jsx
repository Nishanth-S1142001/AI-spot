'use client'

import Card from '../ui/card'

export default function ApiKeySectionSkeleton() {
  const shimmer = 'animate-pulse bg-neutral-800/50'

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${shimmer}`} />
          <div>
            <div className={`h-5 w-40 rounded-md ${shimmer}`} />
            <div className={`mt-2 h-4 w-56 rounded-md ${shimmer}`} />
          </div>
        </div>
        <div className={`h-8 w-20 rounded-md ${shimmer}`} />
      </div>

      {/* Current Key Status Box */}
      <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
        <div className="flex items-start gap-3">
          <div className={`h-6 w-6 rounded-full ${shimmer}`} />
          <div className="flex-1 space-y-2">
            <div className={`h-4 w-32 rounded-md ${shimmer}`} />
            <div className={`h-3 w-64 rounded-md ${shimmer}`} />
            <div className={`h-3 w-48 rounded-md ${shimmer}`} />
          </div>
        </div>
      </div>

      {/* Change Key Options Placeholder */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
        <div className={`h-5 w-40 rounded-md ${shimmer}`} />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className={`h-14 w-full rounded-lg border border-neutral-700 ${shimmer}`}
            />
          ))}
        </div>
        <div className={`h-8 w-full rounded-md ${shimmer}`} />
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4">
        <div className="flex items-start gap-3">
          <div className={`h-6 w-6 rounded-md ${shimmer}`} />
          <div className="flex-1 space-y-2">
            <div className={`h-4 w-40 rounded-md ${shimmer}`} />
            <div className={`h-3 w-72 rounded-md ${shimmer}`} />
            <div className={`h-3 w-64 rounded-md ${shimmer}`} />
            <div className={`h-3 w-56 rounded-md ${shimmer}`} />
          </div>
        </div>
      </div>
    </Card>
  )
}
