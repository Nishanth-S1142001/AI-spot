'use client'

import { memo } from 'react'
import NeonBackground from '../ui/background'

// ✅ OPTIMIZATION: Memoized to prevent unnecessary re-renders
function LoadingState({
  message = 'Loading...',
  className = '',
  icon = null,
  fullScreen = true
}) {
  // ✅ OPTIMIZATION: Use CSS animation instead of JS for better performance
  const Spinner = () => (
    <div className="relative h-16 w-16">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-neutral-800"></div>
      
      {/* Spinning gradient ring */}
      <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-orange-500 border-r-orange-400"></div>
      
      {/* Inner glow effect */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-500/20 to-transparent blur-sm"></div>
    </div>
  )

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Icon or Spinner */}
      {icon || <Spinner />}

      {/* Loading Message */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-medium text-neutral-200">{message}</p>
        
        {/* Animated dots */}
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:0ms]"></span>
          <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:150ms]"></span>
          <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:300ms]"></span>
        </div>
      </div>
    </div>
  )

  if (!fullScreen) {
    // Inline loading state
    return (
      <div className={`flex items-center justify-center py-12 font-mono ${className}`}>
        {content}
      </div>
    )
  }

  // Full screen loading state
  return (
    <>
      <NeonBackground />
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center font-mono backdrop-blur-xl ${className}`}
      >
        <div className="rounded-2xl border border-neutral-800/50 bg-neutral-950/80 p-8 shadow-2xl">
          {content}
        </div>
      </div>
    </>
  )
}

// ✅ OPTIMIZATION: Memoize to prevent re-renders when parent updates
export default memo(LoadingState)