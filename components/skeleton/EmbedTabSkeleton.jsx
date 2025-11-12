'use client'

import Card from '../ui/card'

export default function EmbedTabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-6 w-48 rounded-md bg-neutral-800" />
        <div className="h-4 w-72 rounded-md bg-neutral-900" />
      </div>

      {/* Main Embed Card */}
      <Card className="border-purple-600/20 bg-neutral-950/50 p-6 space-y-6">
        {/* Size Selector */}
        <div className="space-y-3">
          <div className="h-4 w-24 rounded-md bg-neutral-800" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-9 w-32 rounded-lg bg-neutral-800" />
            ))}
          </div>
        </div>

        {/* Code Display */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 w-20 rounded-md bg-neutral-800" />
            <div className="h-8 w-24 rounded-md bg-neutral-800" />
          </div>
          <div className="h-32 w-full rounded-lg bg-neutral-900" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <div className="h-10 w-full rounded-md bg-neutral-800" />
          <div className="h-10 w-40 rounded-md bg-neutral-900" />
        </div>
      </Card>

      {/* Features Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card
            key={i}
            className="border-neutral-800 bg-neutral-950/50 p-5 flex items-start gap-3"
          >
            <div className="h-10 w-10 rounded-lg bg-neutral-800" />
            <div className="space-y-2">
              <div className="h-3 w-36 rounded-md bg-neutral-800" />
              <div className="h-3 w-24 rounded-md bg-neutral-900" />
            </div>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card className="border-orange-600/20 bg-neutral-950/50 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-neutral-800" />
          <div className="h-4 w-32 rounded-md bg-neutral-800" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-neutral-800" />
              <div className="h-3 w-64 rounded-md bg-neutral-900" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
