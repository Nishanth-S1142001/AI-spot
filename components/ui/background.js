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
        <div className='absolute -right-20 -bottom-20 h-40 w-96 -rotate-12 bg-gradient-to-tl from-neutral-800/80 to-neutral-900/60 blur-sm' />
        <div className='absolute right-20 bottom-10 h-36 w-80 -rotate-8 bg-gradient-to-tl from-neutral-800/70 to-neutral-900/50' />
        <div className='absolute right-40 bottom-5 h-32 w-72 -rotate-6 bg-gradient-to-tl from-orange-900/30 to-neutral-900/50 blur-[2px]' />

        {/* Side accents */}
        <div className='absolute top-1/4 -right-32 h-48 w-64 rotate-45 bg-gradient-to-l from-orange-900/40 to-transparent blur-md' />
        <div className='absolute bottom-1/4 -left-32 h-48 w-64 -rotate-45 bg-gradient-to-r from-orange-900/30 to-transparent blur-md' />
      </div>

      {/* Floating particles */}  
      <div className='pointer-events-none absolute inset-0'>
        <div className='animate-float-particle-1 absolute top-[20%] left-[25%] h-2 w-2 rounded-full bg-orange-500/30' />
        <div className='animate-float-particle-2 absolute top-[33%] right-[25%] h-1.5 w-1.5 rounded-full bg-orange-400/20' />
        <div className='animate-float-particle-3 absolute bottom-[25%] left-[33%] h-2.5 w-2.5 rounded-full bg-orange-500/20' />
        <div className='animate-float-particle-1 absolute top-[60%] left-[15%] h-2 w-2 rounded-full bg-orange-400/25' />
        <div className='animate-float-particle-2 absolute top-[45%] right-[35%] h-1.5 w-1.5 rounded-full bg-orange-500/15' />
        <div className='animate-float-particle-3 absolute right-[20%] bottom-[40%] h-2 w-2 rounded-full bg-orange-400/30' />
      </div>

      {/* Subtle glow overlay */}
      <div className='bg-gradient-radial absolute inset-0 from-orange-950/20 via-transparent to-transparent' />

      {/* Top vignette */}
      <div className='absolute inset-0 bg-gradient-to-b from-neutral-950/40 via-transparent to-neutral-950/40' />
    </div>
  )
}

// Memoize component since it's static
export default memo(NeonBackground)
