'use client'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className='mt-4 flex items-center justify-center space-x-2'>
      <button
        className='rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-400 hover:bg-neutral-800 disabled:opacity-50'
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          className={`rounded-md border border-neutral-700 px-3 py-1 text-sm ${
            page === currentPage
              ? 'bg-orange-500 text-neutral-100'
              : 'text-neutral-400 hover:bg-neutral-800'
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className='rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-400 hover:bg-neutral-800 disabled:opacity-50'
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  )
}
