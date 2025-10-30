'use client'

import { memo } from 'react'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

/**
 * Optimized Breadcrumbs Component
 * Features:
 * - Memoized for performance
 * - Home icon option
 * - Better hover effects
 * - Dark theme optimized
 * - Smooth transitions
 */

const BreadcrumbItem = memo(({ item, isLast }) => {
  if (isLast) {
    return (
      <span className='font-semibold text-orange-400'>
        {item.label}
      </span>
    )
  }

  return (
    <Link
      href={item.href || '#'}
      className='text-neutral-400 transition-colors duration-200 hover:text-orange-300'
    >
      {item.label}
    </Link>
  )
})

BreadcrumbItem.displayName = 'BreadcrumbItem'

const Breadcrumbs = memo(({ items = [], showHome = true, className = '' }) => {
  if (!items.length) return null

  return (
    <nav
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label='Breadcrumb'
    >
      {showHome && (
        <>
          <Link
            href='/'
            className='text-neutral-400 transition-colors duration-200 hover:text-orange-300'
            aria-label='Home'
          >
            <Home className='h-4 w-4' />
          </Link>
          <ChevronRight className='h-3.5 w-3.5 text-neutral-600' />
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <div key={index} className='flex items-center gap-2'>
            <BreadcrumbItem item={item} isLast={isLast} />
            {!isLast && (
              <ChevronRight className='h-3.5 w-3.5 text-neutral-600' />
            )}
          </div>
        )
      })}
    </nav>
  )
})

Breadcrumbs.displayName = 'Breadcrumbs'

export default Breadcrumbs