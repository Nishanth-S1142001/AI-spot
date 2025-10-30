'use client'

import { memo } from 'react'

/**
 * Optimized Card Component
 * Features:
 * - Memoized for performance
 * - Multiple variants
 * - Better hover effects
 * - Glass-morphism design
 * - Smooth transitions
 * - GPU-accelerated animations
 */

const Card = memo(({
  children,
  onClick,
  variant = 'default',
  hover = true,
  className = '',
  ...props
}) => {
  const variants = {
    default: 'border-orange-500/30 bg-gradient-to-br from-neutral-900/80 via-neutral-950/90 to-neutral-900/80',
    solid: 'border-neutral-800/50 bg-neutral-900/90',
    glass: 'border-neutral-800/30 bg-neutral-900/30 backdrop-blur-md',
    gradient: 'border-orange-600/30 bg-gradient-to-br from-orange-950/20 via-neutral-950/90 to-orange-950/20'
  }

  const hoverEffects = hover
    ? 'will-change-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-500/50 transition-all duration-300 ease-out cursor-pointer'
    : ''

  return (
    <div
      onClick={onClick}
      className={`
        overflow-hidden rounded-lg border p-6
        ${variants[variant]}
        ${hoverEffects}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export default Card