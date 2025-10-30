'use client'

import { memo } from 'react'

const NeonBackground = () => {
  return (
    <div className='fixed inset-0 -z-10 overflow-hidden'>
      {/* Base gradient layer */}
      <div className='absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900' />

      {/* Geometric shapes layer - optimized with will-change */}
      <div className='absolute inset-0' style={{ willChange: 'transform' }}>
        {/* Top cluster */}
        <div className='absolute -top-16 -left-20 h-32 w-96 rotate-12 bg-gradient-to-br from-neutral-800/80 to-neutral-900/60 blur-sm' />
        <div className='absolute top-10 left-20 h-28 w-80 rotate-6 bg-gradient-to-br from-orange-900/40 to-neutral-800/50' />
        <div className='absolute top-5 left-40 h-24 w-72 rotate-8 bg-gradient-to-br from-neutral-800/70 to-neutral-900/50 blur-[2px]' />

        {/* Bottom cluster */}
        <div className='absolute -bottom-20 -right-20 h-40 w-96 -rotate-12 bg-gradient-to-tl from-neutral-800/80 to-neutral-900/60 blur-sm' />
        <div className='absolute bottom-10 right-20 h-36 w-80 -rotate-8 bg-gradient-to-tl from-neutral-800/70 to-neutral-900/50' />
        <div className='absolute bottom-5 right-40 h-32 w-72 -rotate-6 bg-gradient-to-tl from-orange-900/30 to-neutral-900/50 blur-[2px]' />

        {/* Side accents */}
        <div className='absolute top-1/4 -right-32 h-48 w-64 rotate-45 bg-gradient-to-l from-orange-900/40 to-transparent blur-md' />
        <div className='absolute bottom-1/4 -left-32 h-48 w-64 -rotate-45 bg-gradient-to-r from-orange-900/30 to-transparent blur-md' />
      </div>

      {/* Subtle glow overlay */}
      <div className='absolute inset-0 bg-gradient-radial from-orange-950/20 via-transparent to-transparent' />
      
      {/* Top vignette */}
      <div className='absolute inset-0 bg-gradient-to-b from-neutral-950/40 via-transparent to-neutral-950/40' />
    </div>
  )
}

// Memoize component since it's static
export default memo(NeonBackground)