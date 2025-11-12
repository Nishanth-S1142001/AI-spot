'use client'

import Card from '../ui/card'

export default function WorkflowsTabSkeleton() {
  return (
    <div className='space-y-6 animate-pulse'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <div className='h-6 w-48 rounded-md bg-neutral-800' />
          <div className='h-4 w-72 rounded-md bg-neutral-900' />
        </div>
        <div className='h-9 w-36 rounded-md bg-neutral-800' />
      </div>

      {/* Workflows Grid */}
      <div className='grid gap-6 sm:grid-cols-1 lg:grid-cols-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className='border-neutral-800 bg-neutral-950/50 p-5 space-y-4'
          >
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div className='h-10 w-10 rounded-lg bg-neutral-800' />
                <div className='space-y-2'>
                  <div className='h-4 w-40 rounded-md bg-neutral-800' />
                  <div className='h-3 w-28 rounded-md bg-neutral-900' />
                </div>
              </div>
              <div className='h-5 w-20 rounded-full bg-neutral-800' />
            </div>

            <div className='space-y-2'>
              <div className='h-3 w-full rounded-md bg-neutral-800' />
              <div className='h-3 w-2/3 rounded-md bg-neutral-800' />
            </div>

            <div className='border-t border-neutral-800 pt-4 flex items-center justify-between'>
              <div className='h-3 w-32 rounded-md bg-neutral-800' />
              <div className='h-4 w-4 rounded-full bg-neutral-800' />
            </div>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className='border-neutral-800 bg-neutral-950/50 p-5 text-center space-y-3'
          >
            <div className='mx-auto h-3 w-24 rounded-md bg-neutral-800' />
            <div className='mx-auto h-6 w-16 rounded-md bg-neutral-900' />
          </Card>
        ))}
      </div>

      {/* Features */}
      <div className='grid gap-4 sm:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className='border-neutral-800 bg-neutral-950/50 p-5 flex items-start gap-3'
          >
            <div className='h-10 w-10 rounded-lg bg-neutral-800' />
            <div className='space-y-2'>
              <div className='h-3 w-28 rounded-md bg-neutral-800' />
              <div className='h-2 w-20 rounded-md bg-neutral-900' />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
