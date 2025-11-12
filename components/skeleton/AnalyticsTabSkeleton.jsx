'use client'

import Card from '../ui/card'
import { motion } from 'framer-motion'

export default function AnalyticsTabSkeleton() {
  const shimmer = 'animate-pulse bg-neutral-800/50'

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='mb-6'>
        <div className={`h-6 w-48 rounded-md ${shimmer}`} />
        <div className={`mt-2 h-4 w-64 rounded-md ${shimmer}`} />
      </div>

      {/* API Key Usage */}
      <div>
        <div className={`mb-4 h-5 w-40 rounded-md ${shimmer}`} />
        <Card className='border-neutral-800/50 bg-neutral-900/30 p-6'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`h-24 rounded-lg ${shimmer}`} />
            ))}
          </div>
        </Card>
      </div>

      {/* Stat Cards */}
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className='border-neutral-800/50 bg-neutral-900/30 p-5'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className={`h-4 w-24 rounded-md ${shimmer}`} />
                  <div className={`mt-2 h-6 w-20 rounded-md ${shimmer}`} />
                </div>
                <div className={`h-10 w-10 rounded-full ${shimmer}`} />
              </div>
              <div className={`mt-4 h-3 w-32 rounded-md ${shimmer}`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Performance Insights */}
      <Card className='border-neutral-700/50 p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div className={`h-5 w-40 rounded-md ${shimmer}`} />
          <div className={`h-5 w-20 rounded-full ${shimmer}`} />
        </div>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`h-20 rounded-lg ${shimmer}`} />
          ))}
        </div>
      </Card>

      {/* Usage Breakdown */}
      <Card className='border-purple-600/20 bg-gradient-to-br from-purple-950/20 to-neutral-950/50 p-6'>
        <div className={`mb-4 h-5 w-40 rounded-md ${shimmer}`} />
        <div className='grid gap-4 sm:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`h-20 rounded-lg border border-neutral-800/50 ${shimmer}`}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
