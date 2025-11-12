'use client'

import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

/**
 * Improved SubSidebar Component
 * Features:
 * - Clean, modern design matching main sidebar
 * - Smooth expand/collapse
 * - Better visual feedback
 * - Submenu support with icons
 * - Orange accent theme
 * - Professional styling
 */

export default function SubSidebar({ menuItems }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const [openSubmenu, setOpenSubmenu] = useState(null)

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index)
  }

  // Don't render if no menu items
  if (!menuItems || menuItems.length === 0) {
    return null
  }

  return (
    <div
      className={`flex h-screen flex-col border-r border-neutral-800/50 bg-neutral-900/30 font-mono text-white backdrop-blur-sm transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header with Toggle Button */}
      <div className='flex h-16 items-center justify-between border-b border-neutral-800/50 px-4'>
        <div className={`flex items-center gap-2 ${!isOpen && 'hidden'}`}>
          <div className='h-2 w-2 rounded-full bg-orange-500/50' />
          <span className='text-sm font-semibold text-neutral-300'>Submenu</span>
        </div>
        
        <button
          onClick={() => {
            setIsOpen((prev) => !prev)
            if (!isOpen) setOpenSubmenu(null)
          }}
          className='group flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-neutral-800'
          title={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? (
            <PanelLeftClose className='h-4 w-4 text-neutral-400 transition-colors group-hover:text-orange-400' />
          ) : (
            <PanelLeftOpen className='h-4 w-4 text-neutral-400 transition-colors group-hover:text-orange-400' />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className='custom-scrollbar flex-1 overflow-y-auto py-4'>
        {menuItems.map((item, idx) => {
          const isActive = item.href && pathname === item.href
          const hasSubmenu = item.submenu && item.submenu.length > 0

          return (
            <div key={idx} className='px-2'>
              {/* Main Menu Item */}
              <div
                className={`group relative mb-1 flex cursor-pointer items-center justify-between rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-900/40 to-transparent text-orange-300 shadow-lg shadow-orange-500/10'
                    : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                }`}
                onClick={(e) => {
                  if (hasSubmenu) {
                    e.preventDefault()
                    toggleSubmenu(idx)
                  }
                }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className='absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-orange-500' />
                )}

                {hasSubmenu ? (
                  // Button for submenu items
                  <button className='flex w-full items-center justify-between p-3'>
                    <div className='flex items-center gap-3'>
                      <div className={`flex h-5 w-5 items-center justify-center ${
                        isActive ? 'text-orange-400' : 'text-neutral-500 group-hover:text-orange-400'
                      }`}>
                        {item.icon}
                      </div>
                      <span
                        className={`text-sm font-medium transition-all ${
                          !isOpen && 'w-0 opacity-0'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {isOpen && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openSubmenu === idx ? 'rotate-180' : ''
                        } ${isActive ? 'text-orange-400' : 'text-neutral-500'}`}
                      />
                    )}
                  </button>
                ) : (
                  // Link for regular items
                  <Link href={item.href || '#'} className='flex w-full items-center gap-3 p-3'>
                    <div className={`flex h-5 w-5 items-center justify-center ${
                      isActive ? 'text-orange-400' : 'text-neutral-500 group-hover:text-orange-400'
                    }`}>
                      {item.icon}
                    </div>
                    <span
                      className={`text-sm font-medium transition-all ${
                        !isOpen && 'w-0 opacity-0'
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                )}
              </div>

              {/* Submenu */}
              {hasSubmenu && openSubmenu === idx && isOpen && (
                <div className='ml-8 mt-1 space-y-1 border-l-2 border-neutral-800/50 pl-4'>
                  {item.submenu.map((sub, subIdx) => {
                    const isSubActive = sub.href && pathname === sub.href
                    return (
                      <Link
                        key={subIdx}
                        href={sub.href || '#'}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                          isSubActive
                            ? 'bg-orange-900/40 text-orange-300 font-medium'
                            : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                        }`}
                      >
                        {sub.icon && (
                          <div className={`flex h-4 w-4 items-center justify-center ${
                            isSubActive ? 'text-orange-400' : 'text-neutral-500'
                          }`}>
                            {sub.icon}
                          </div>
                        )}
                        <span>{sub.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer (Optional) */}
      {isOpen && menuItems.length > 0 && (
        <div className='border-t border-neutral-800/50 p-4'>
          <div className='text-xs text-neutral-500'>
            {menuItems.length} {menuItems.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      )}
    </div>
  )
}