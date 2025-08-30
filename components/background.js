'use client'
import React from 'react'
export default function NeonBackground() {
  return (
    <div className='fixed inset-0 -z-10 overflow-hidden'>
      {/* Static geometric background */}
      <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800'>
        {/* CSS geometric shapes for base layer */}
        <div className='absolute top-0 left-0 h-full w-full'>
          {/* Top angular shapes */}
          <div className='absolute top-0 left-0 h-32 w-96 -translate-x-20 -translate-y-10 rotate-12 transform bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg'></div>
          <div className='absolute top-10 left-20 h-28 w-80 rotate-6 transform bg-gradient-to-br from-gray-700 to-gray-800 shadow-md'></div>
          <div className='absolute top-5 left-40 h-24 w-72 rotate-8 transform bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg'></div>

          {/* Bottom angular shapes */}
          <div className='absolute right-0 bottom-0 h-40 w-96 translate-x-20 translate-y-10 -rotate-12 transform bg-gradient-to-tl from-gray-800 to-gray-900 shadow-lg'></div>
          <div className='absolute right-20 bottom-10 h-36 w-80 -rotate-8 transform bg-gradient-to-tl from-gray-700 to-gray-800 shadow-md'></div>
          <div className='absolute right-40 bottom-5 h-32 w-72 -rotate-6 transform bg-gradient-to-tl from-gray-800 to-gray-900 shadow-lg'></div>

          {/* Side accent shapes */}
          <div className='absolute top-1/4 right-0 h-48 w-64 translate-x-32 rotate-45 transform bg-gradient-to-l from-gray-800 to-transparent'></div>
          <div className='absolute bottom-1/4 left-0 h-48 w-64 -translate-x-32 -rotate-45 transform bg-gradient-to-r from-gray-800 to-transparent'></div>
        </div>
      </div>

      {/* Animated canvas overlay */}

      {/* Additional glow effects */}
      <div className='bg-gradient-radial from-secondary absolute inset-0 via-transparent to-transparent'></div>
    </div>
  )
}
