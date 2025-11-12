'use client'

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import { memo, useMemo } from 'react'

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5, // Maximum number of page buttons to show
  variant = 'orange' // 'orange' | 'blue' | 'green' | 'purple'
}) {
  // Early return if not needed
  const pageRange = useMemo(() => {
    const range = []
    const halfVisible = Math.floor(maxVisible / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    // Adjust if we're near the start
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisible)
    }

    // Adjust if we're near the end
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i)
    }

    return range
  }, [currentPage, totalPages, maxVisible])
  if (totalPages <= 1) return null

  // ✅ OPTIMIZATION: Memoize page range calculation

  // Variant styles
  const variantStyles = {
    orange: {
      active:
        'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-500/50 shadow-lg shadow-orange-500/20',
      inactive:
        'border-neutral-700 text-neutral-300 hover:border-orange-500/50 hover:bg-orange-950/20'
    },
    blue: {
      active:
        'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500/50 shadow-lg shadow-blue-500/20',
      inactive:
        'border-neutral-700 text-neutral-300 hover:border-blue-500/50 hover:bg-blue-950/20'
    },
    green: {
      active:
        'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-500/50 shadow-lg shadow-green-500/20',
      inactive:
        'border-neutral-700 text-neutral-300 hover:border-green-500/50 hover:bg-green-950/20'
    },
    purple: {
      active:
        'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-500/50 shadow-lg shadow-purple-500/20',
      inactive:
        'border-neutral-700 text-neutral-300 hover:border-purple-500/50 hover:bg-purple-950/20'
    }
  }

  const styles = variantStyles[variant] || variantStyles.orange

  const buttonBaseClass =
    'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed'

  const iconButtonClass =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-300 transition-all hover:border-neutral-600 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <div className='flex items-center justify-center gap-2 font-mono'>
      {/* First Page */}
      {totalPages > maxVisible &&
        currentPage > Math.floor(maxVisible / 2) + 1 && (
          <button
            className={iconButtonClass}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label='First page'
          >
            <ChevronsLeft className='h-4 w-4' />
          </button>
        )}

      {/* Previous */}
      <button
        className={iconButtonClass}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label='Previous page'
      >
        <ChevronLeft className='h-4 w-4' />
      </button>

      {/* Page Numbers */}
      <div className='flex items-center gap-1'>
        {pageRange.map((page) => (
          <button
            key={page}
            className={`${buttonBaseClass} min-w-[2.5rem] ${
              page === currentPage ? styles.active : styles.inactive
            }`}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next */}
      <button
        className={iconButtonClass}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label='Next page'
      >
        <ChevronRight className='h-4 w-4' />
      </button>

      {/* Last Page */}
      {totalPages > maxVisible &&
        currentPage < totalPages - Math.floor(maxVisible / 2) && (
          <button
            className={iconButtonClass}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label='Last page'
          >
            <ChevronsRight className='h-4 w-4' />
          </button>
        )}

      {/* Page Info */}
      <div className='ml-2 hidden text-sm text-neutral-400 sm:block'>
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
}

// ✅ OPTIMIZATION: Memoize to prevent unnecessary re-renders
export default memo(Pagination)
