'use client'

import { memo } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Optimized Button Component
 * Features:
 * - Multiple variants and sizes
 * - Loading state
 * - Icon support
 * - Better accessibility
 * - Smooth transitions
 * - Dark theme optimized
 */

const Button = memo(
  ({
    children,
    text,
    onClick,
    disabled = false,
    loading = false,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    type = 'button',
    className = '',
    ...props
  }) => {
    const variants = {
      primary:
        'bg-gradient-to-r from-orange-900/40 to-orange-950/20 border-orange-600/50 text-orange-300 hover:from-orange-900/60 hover:to-orange-950/40 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20',
      secondary:
        'bg-neutral-900/40 border-neutral-600/50 text-neutral-300 hover:bg-neutral-900/60 hover:border-neutral-500 hover:text-white',
      success:
        'bg-gradient-to-r from-green-900/40 to-green-950/20 border-green-600/50 text-green-300 hover:from-green-900/60 hover:to-green-950/40 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20',
      danger:
        'bg-gradient-to-r from-red-900/40 to-red-950/20 border-red-600/50 text-red-300 hover:from-red-900/60 hover:to-red-950/40 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20',
      outline:
        'bg-transparent border-orange-600/50 text-orange-300 hover:bg-orange-900/20 hover:border-orange-500',
      ghost:
        'bg-transparent border-transparent text-neutral-300 hover:bg-neutral-900/40 hover:text-white'
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    }

    const isDisabled = disabled || loading

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        className={`group relative inline-flex items-center justify-center gap-2 rounded-lg border font-mono font-semibold transition-all duration-200 ${variants[variant]} ${sizes[size]} ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0'} ${className} `}
        {...props}
      >
        {loading && <Loader2 className='h-4 w-4 animate-spin' />}

        {!loading && icon && iconPosition === 'left' && (
          <span className='transition-transform duration-200 group-hover:scale-110'>
            {icon}
          </span>
        )}

        {text || children}

        {!loading && icon && iconPosition === 'right' && (
          <span className='transition-transform duration-200 group-hover:scale-110'>
            {icon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
