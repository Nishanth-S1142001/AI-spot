'use client'

import Card from '../ui/card'
import Button from '../ui/button'

export default function ConversationsTabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-48 rounded bg-neutral-800" />
          <div className="mt-2 h-4 w-32 rounded bg-neutral-800/70" />
        </div>
        <div className="h-9 w-28 rounded bg-neutral-800" />
      </div>

      {/* Conversations Skeleton */}
      <Card className="border-neutral-700/50">
        <div className="max-h-[calc(100vh-300px)] space-y-6 overflow-y-auto p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              {/* Timestamp bubble */}
              <div className="flex justify-center">
                <div className="h-5 w-48 rounded-full bg-neutral-800/60" />
              </div>

              {/* Agent message */}
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-900/40" />
                <div className="w-3/4 rounded-2xl bg-neutral-800 p-4">
                  <div className="h-3 w-3/4 rounded bg-neutral-700" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-neutral-700" />
                </div>
              </div>

              {/* User message */}
              <div className="flex flex-row-reverse items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-900/40" />
                <div className="w-3/4 rounded-2xl bg-neutral-800 p-4">
                  <div className="h-3 w-2/3 rounded bg-neutral-700" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-neutral-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card
            key={i}
            className="border-neutral-700/30 bg-gradient-to-br from-neutral-900/40 to-neutral-950/60"
          >
            <div className="text-center space-y-2 py-3">
              <div className="h-4 w-24 mx-auto rounded bg-neutral-800/70" />
              <div className="h-6 w-16 mx-auto rounded bg-neutral-800" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
