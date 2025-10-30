'use client'

import { ChevronDown, LockKeyhole, LockKeyholeOpen } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

/**
 * Improved Sidebar Component
 * Features:
 * - Clean, modern design
 * - Smooth expand/collapse with hover
 * - Better visual feedback
 * - Improved animations
 * - Orange accent theme
 * - Professional styling
 */

export default function Sidebar({ menuItems, activeMenu, onSelect }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const [isHovering, setIsHovering] = useState(false)

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index)
  }

  const isSidebarOpen = isHovering || !isCollapsed

  return (
    <div
      className={`flex h-screen flex-col border-r border-neutral-800/50 bg-neutral-900/50 font-mono text-white backdrop-blur-sm transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => isCollapsed && setIsHovering(true)}
      onMouseLeave={() => isCollapsed && setIsHovering(false)}
    >
      {/* Header with Toggle Button */}
      <div className='flex h-16 items-center justify-between border-b border-neutral-800/50 px-4'>
        <div className={`flex items-center gap-2 ${!isSidebarOpen && 'hidden'}`}>
          <div className='h-2 w-2 rounded-full bg-orange-500 animate-pulse' />
          <span className='text-sm font-semibold text-neutral-200'>Menu</span>
        </div>
        
        <button
          onClick={() => {
            setIsCollapsed((prev) => !prev)
            if (isHovering) setIsHovering(false)
            if (!isCollapsed) setOpenSubmenu(null)
          }}
          className='group flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-neutral-800'
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <LockKeyholeOpen className='h-4 w-4 text-neutral-400 transition-colors group-hover:text-orange-400' />
          ) : (
            <LockKeyhole className='h-4 w-4 text-neutral-400 transition-colors group-hover:text-orange-400' />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className='custom-scrollbar flex-1 overflow-y-auto py-4'>
        {menuItems.map((item, idx) => {
          // Divider
          if (item.divider) {
            return (
              <div key={`divider-${idx}`} className='my-2 px-4'>
                <div className='border-t border-neutral-800/50' />
              </div>
            )
          }

          const isActive =
            pathname === item.href || (item.key && activeMenu === item.key)

          // Items with submenu
          if (item.submenu) {
            return (
              <div key={idx} className='px-2'>
                <button
                  className={`group relative flex w-full items-center justify-between rounded-lg p-3 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-900/40 to-transparent text-orange-300 shadow-lg shadow-orange-500/10'
                      : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                  }`}
                  onClick={() => {
                    toggleSubmenu(idx)
                    if (item.key) onSelect(item.key)
                  }}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className='absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-orange-500' />
                  )}
                  
                  <div className='flex items-center gap-3'>
                    <div className={`flex h-5 w-5 items-center justify-center transition-transform ${
                      isActive ? 'text-orange-400' : 'text-neutral-500 group-hover:text-orange-400'
                    }`}>
                      {item.icon}
                    </div>
                    <span
                      className={`text-sm font-medium transition-all ${
                        !isSidebarOpen && 'w-0 opacity-0'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                  
                  {isSidebarOpen && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        openSubmenu === idx ? 'rotate-180' : ''
                      } ${isActive ? 'text-orange-400' : 'text-neutral-500'}`}
                    />
                  )}
                </button>

                {/* Submenu */}
                {openSubmenu === idx && isSidebarOpen && (
                  <div className='ml-8 mt-1 space-y-1 border-l-2 border-neutral-800/50 pl-4'>
                    {item.submenu.map((sub, subIdx) => {
                      const isSubActive = pathname === sub.href
                      return (
                        <Link
                          key={subIdx}
                          href={sub.href}
                          className={`block rounded-lg px-3 py-2 text-sm transition-all ${
                            isSubActive
                              ? 'bg-orange-900/40 text-orange-300 font-medium'
                              : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          // Items without submenu
          return (
            <div key={idx} className='px-2'>
              <Link
                href={item.href || '#'}
                onClick={() => item.key && onSelect(item.key)}
                className={`group relative flex items-center gap-3 rounded-lg p-3 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-900/40 to-transparent text-orange-300 shadow-lg shadow-orange-500/10'
                    : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                }`}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className='absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-orange-500' />
                )}
                
                <div className={`flex h-5 w-5 items-center justify-center transition-transform ${
                  isActive ? 'text-orange-400' : 'text-neutral-500 group-hover:text-orange-400'
                }`}>
                  {item.icon}
                </div>
                
                <span
                  className={`text-sm font-medium transition-all ${
                    !isSidebarOpen && 'w-0 opacity-0'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Footer (Optional) */}
      {isSidebarOpen && (
        <div className='border-t border-neutral-800/50 p-4'>
          <div className='text-xs text-neutral-500'>
            v1.0.0
          </div>
        </div>
      )}
    </div>
  )
}