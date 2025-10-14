'use client'

export default function NeonBackground() {
  return (
    <div className='fixed inset-0 -z-10 overflow-hidden'>
      {/* Static geometric background with a neutral gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-800'>
        {/* CSS geometric shapes for base layer */}
        <div className='absolute top-0 left-0 h-full w-full'>
          {/* Top angular shapes with neutral tones */}
          <div className='absolute top-0 left-0 h-32 w-96 -translate-x-20 -translate-y-10 rotate-12 transform bg-gradient-to-br from-neutral-800 to-neutral-900 shadow-lg'></div>
          <div className='absolute top-10 left-20 h-28 w-80 rotate-6 transform bg-gradient-to-br from-orange-700 to-neutral-800 shadow-md'></div>
          <div className='absolute top-5 left-40 h-24 w-72 rotate-8 transform bg-gradient-to-br from-neutral-800 to-neutral-900 shadow-lg'></div>

          {/* Bottom angular shapes with neutral tones */}
          <div className='absolute right-0 bottom-0 h-40 w-96 translate-x-20 translate-y-10 -rotate-12 transform bg-gradient-to-tl from-neutral-800 to-neutral-900 shadow-lg'></div>
          <div className='absolute right-20 bottom-10 h-36 w-80 -rotate-8 transform bg-gradient-to-tl from-neutral-700 to-neutral-800 shadow-md'></div>
          <div className='absolute right-40 bottom-5 h-32 w-72 -rotate-6 transform bg-gradient-to-tl from-orange-800/30 to-neutral-900 shadow-lg'></div>

          {/* Side accent shapes with neutral tones */}
          <div className='absolute top-1/4 right-0 h-48 w-64 translate-x-32 rotate-45 transform bg-gradient-to-l from-orange-800 to-transparent'></div>
          <div className='absolute bottom-1/4 left-0 h-48 w-64 -translate-x-32 -rotate-45 transform bg-gradient-to-r from-orange-800/30 to-transparent'></div>
        </div>
      </div>

      {/* Animated canvas overlay */}

      {/* Additional glow effects with a subtle neutral tone */}
      <div className='absolute inset-0 bg-gradient-to-br from-neutral-500 via-transparent to-transparent opacity-30'></div>
    </div>
  )
}
