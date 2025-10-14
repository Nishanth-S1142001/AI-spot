'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null

  return (
    <nav className="flex items-center text-sm text-gray-600" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <div key={index} className="flex items-center">
            {!isLast ? (
              <Link
                href={item.href || '#'}
                className="hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-900">{item.label}</span>
            )}
            {!isLast && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
          </div>
        )
      })}
    </nav>
  )
}
