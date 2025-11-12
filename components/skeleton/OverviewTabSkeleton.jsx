'use client'

import  Card  from '../ui/card'

export default function OverviewTabSkeleton() {
  const shimmer = 'animate-pulse bg-neutral-800/50'

  return (
    <div className="space-y-6">
      {/* Status Banner Skeleton */}
      <div className="rounded-xl border border-neutral-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${shimmer}`} />
            <div className="space-y-2">
              <div className={`h-4 w-32 rounded-md ${shimmer}`} />
              <div className={`h-3 w-48 rounded-md ${shimmer}`} />
            </div>
          </div>
          <div className={`h-6 w-20 rounded-full ${shimmer}`} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN - Quick Actions */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-neutral-800 bg-neutral-900/30">
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
                <div className={`h-8 w-8 rounded-lg ${shimmer}`} />
                <div className={`h-4 w-32 rounded-md ${shimmer}`} />
              </div>

              {/* Icon grid */}
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-16 rounded-lg border border-neutral-800 ${shimmer}`}
                  />
                ))}
              </div>

              {/* Danger Zone */}
              <div className="space-y-3 border-t border-neutral-800 pt-4">
                <div className={`h-3 w-24 rounded-md ${shimmer}`} />
                <div className={`h-9 w-full rounded-md ${shimmer}`} />
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 lg:col-span-2">
          {/* Share Link Card */}
          <Card className="border-neutral-800 bg-neutral-900/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg ${shimmer}`} />
                  <div className={`h-4 w-32 rounded-md ${shimmer}`} />
                </div>
                <div className={`h-5 w-20 rounded-full ${shimmer}`} />
              </div>

              <div className={`h-3 w-56 rounded-md ${shimmer}`} />

              {/* Link Display */}
              <div className={`h-10 w-full rounded-lg ${shimmer}`} />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`h-9 w-full rounded-md ${shimmer}`} />
                <div className={`h-9 w-full rounded-md ${shimmer}`} />
              </div>
            </div>
          </Card>

          {/* Agent Configuration Card */}
          <Card className="border-neutral-800 bg-neutral-900/30">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
                <div className={`h-8 w-8 rounded-lg ${shimmer}`} />
                <div className={`h-4 w-40 rounded-md ${shimmer}`} />
              </div>

              {/* Detail grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className={`h-3 w-32 rounded-md ${shimmer}`} />
                    <div className={`h-10 w-full rounded-lg ${shimmer}`} />
                  </div>
                ))}
                {/* Description and Created (full width) */}
                <div className="space-y-2 sm:col-span-2">
                  <div className={`h-3 w-32 rounded-md ${shimmer}`} />
                  <div className={`h-20 w-full rounded-lg ${shimmer}`} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <div className={`h-3 w-32 rounded-md ${shimmer}`} />
                  <div className={`h-10 w-full rounded-lg ${shimmer}`} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
