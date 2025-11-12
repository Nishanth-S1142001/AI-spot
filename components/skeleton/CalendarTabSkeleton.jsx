'use client'

import Card from '../ui/card'

export default function CalendarTabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Debug Toggle Placeholder */}
      <div className="flex justify-end">
        <div className="h-4 w-28 rounded-md bg-neutral-800" />
      </div>

      {/* Stats Card */}
      <Card className="bg-gradient-to-r from-orange-900/20 to-neutral-900/20 border-orange-600/30 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-8 w-16 mx-auto rounded-md bg-neutral-800" />
              <div className="h-3 w-20 mx-auto rounded-md bg-neutral-900" />
            </div>
          ))}
        </div>
      </Card>

      {/* Calendar Config Card */}
      <Card className="border-orange-600/30 p-6 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 w-40 rounded-md bg-neutral-800" />
          <div className="h-5 w-20 rounded-full bg-neutral-800" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 rounded-md bg-neutral-900" />
              <div className="h-4 w-32 rounded-md bg-neutral-800" />
            </div>
          ))}
        </div>
        <div className="h-4 w-56 rounded-md bg-neutral-900 mt-4" />
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-neutral-700 pb-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-md bg-neutral-800" />
        ))}
      </div>

      {/* Bookings List Placeholder */}
      {[...Array(3)].map((_, i) => (
        <Card
          key={i}
          className="border-neutral-800 bg-neutral-950/50 p-5 flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 rounded-full bg-neutral-800" />
            <div className="h-3 w-24 rounded-md bg-neutral-900" />
            <div className="h-3 w-16 rounded-md bg-neutral-900" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-4 w-full rounded-md bg-neutral-800" />
            ))}
          </div>
          <div className="h-3 w-64 rounded-md bg-neutral-900" />
        </Card>
      ))}

      {/* Refresh Button Placeholder */}
      <div className="flex justify-center pt-4">
        <div className="h-10 w-40 rounded-md bg-neutral-800" />
      </div>
    </div>
  )
}
