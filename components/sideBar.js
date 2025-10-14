'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export default function Sidebar({ menuItems, activeMenu, onSelect }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const [isHovering, setIsHovering] = useState(false)

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index)
  }

  const isSidebarOpen = isHovering || !isCollapsed
  const sidebarWidthClass = isSidebarOpen ? 'w-64' : 'w-15'

  return (
    <div
      className={`flex h-screen flex-col bg-neutral-900 font-mono text-white transition-all duration-300 ${sidebarWidthClass}`}
      onMouseEnter={() => isCollapsed && setIsHovering(true)}
      onMouseLeave={() => isCollapsed && setIsHovering(false)}
    >
      {/* Toggle Button */}
      <div className='mt-4 flex justify-end border-r border-b border-neutral-700 p-2'>
        <button
          onClick={() => {
            setIsCollapsed((prev) => !prev)
            if (isHovering) setIsHovering(false)
            if (!isCollapsed) setOpenSubmenu(null)
          }}
          className='rounded-md p-2 hover:bg-neutral-800'
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className='custom-scrollbar mt-4 flex-1 overflow-y-auto'>
        {menuItems.map((item, idx) => {
          if (item.divider)
            return (
              <hr
                key={`divider-${idx}`}
                className='my-2 border-t border-neutral-700'
              />
            )

          const isActive =
            pathname === item.href || (item.key && activeMenu === item.key)

          // Items with submenu
          if (item.submenu) {
            return (
              <div key={idx}>
                <div
                  className={`mx-2 my-1 flex cursor-pointer items-center justify-between rounded-md p-3 transition-colors hover:bg-neutral-700 ${
                    isActive ? 'bg-neutral-700 font-semibold' : ''
                  }`}
                  onClick={() => {
                    toggleSubmenu(idx)
                    if (item.key) onSelect(item.key)
                  }}
                >
                  <div className='flex items-center gap-4'>
                    {item.icon}
                    <span className={`${!isSidebarOpen && 'hidden'}`}>
                      {item.name}
                    </span>
                  </div>
                  {isSidebarOpen && (
                    <ChevronDown
                      size={18}
                      className={`text-orange-500 transition-transform ${
                        openSubmenu === idx ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </div>

                {/* Submenu */}
                {openSubmenu === idx && isSidebarOpen && (
                  <div className='ml-12 flex flex-col'>
                    {item.submenu.map((sub, subIdx) => (
                      <Link
                        key={subIdx}
                        href={sub.href}
                        className={`my-1 rounded-md p-2 hover:bg-neutral-700 ${
                          pathname === sub.href
                            ? 'bg-neutral-700 font-semibold'
                            : ''
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          // Items without submenu
          return (
            <Link
              key={idx}
              href={item.href || '#'}
              onClick={() => item.key && onSelect(item.key)}
              className={`mx-2 my-1 flex items-center gap-4 rounded-md p-3 transition-colors hover:bg-neutral-700 ${
                isActive ? 'bg-neutral-700 font-semibold' : ''
              }`}
            >
              {item.icon}
              <span className={`${!isSidebarOpen && 'hidden'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
