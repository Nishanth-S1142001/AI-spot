'use client'

import { memo } from 'react'
import Link from 'next/link'

/**
 * Optimized HyperLink Component
 * Features:
 * - Memoized for performance
 * - Support for both Next.js Link and button
 * - Multiple variants
 * - Icon support
 * - Better hover effects
 * - Dark theme optimized
 */

const HyperLink = memo(({
  children,
  text,
  href,
  onClick,
  variant = 'default',
  external = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'text-neutral-400 hover:text-white',
    primary: 'text-orange-400 hover:text-orange-300',
    secondary: 'text-blue-400 hover:text-blue-300',
    subtle: 'text-neutral-500 hover:text-neutral-300',
    underline: 'text-neutral-400 hover:text-white underline underline-offset-2 hover:underline-offset-4'
  }

  const baseClasses = `
    inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200
    hover:cursor-pointer
    ${variants[variant]}
    ${className}
  `

  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <span className='transition-transform duration-200 hover:scale-110'>
          {icon}
        </span>
      )}
      <span>{text || children}</span>
      {icon && iconPosition === 'right' && (
        <span className='transition-transform duration-200 hover:scale-110'>
          {icon}
        </span>
      )}
    </>
  )

  // If href is provided, use Link
  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className={baseClasses}
          {...props}
        >
          {content}
        </a>
      )
    }

    return (
      <Link href={href} className={baseClasses} {...props}>
        {content}
      </Link>
    )
  }

  // Otherwise, use button
  return (
    <button
      type='button'
      onClick={onClick}
      className={baseClasses}
      {...props}
    >
      {content}
    </button>
  )
})

HyperLink.displayName = 'HyperLink'

export default HyperLink