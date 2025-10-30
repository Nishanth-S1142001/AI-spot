'use client'

import { memo } from 'react'

/**
 * Optimized Badge Component
 * Features:
 * - Memoized for performance
 * - Modern glass-morphism design
 * - Smooth transitions
 * - Dark theme optimized
 * - More variant options
 */

const Badge = memo(({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-900/40 text-blue-300 border-blue-600/30 shadow-blue-500/10',
    success: 'bg-green-900/40 text-green-300 border-green-600/30 shadow-green-500/10',
    warning: 'bg-yellow-900/40 text-yellow-300 border-yellow-600/30 shadow-yellow-500/10',
    danger: 'bg-red-900/40 text-red-300 border-red-600/30 shadow-red-500/10',
    inactive: 'bg-neutral-900/40 text-neutral-400 border-neutral-600/30 shadow-neutral-500/10',
    info: 'bg-cyan-900/40 text-cyan-300 border-cyan-600/30 shadow-cyan-500/10',
    purple: 'bg-purple-900/40 text-purple-300 border-purple-600/30 shadow-purple-500/10',
    orange: 'bg-orange-900/40 text-orange-300 border-orange-600/30 shadow-orange-500/10'
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-lg backdrop-blur-sm transition-all duration-200 ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'

export default Badge  