'use client'

import React, { useState } from 'react'
import { ChevronDown, PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function SubSidebar({ menuItems }) {
  // Modes: "hover" or "toggle"
  const [mode, setMode] = useState('toggle')
  const [isOpen, setIsOpen] = useState(true)
  const [openSubmenu, setOpenSubmenu] = useState(null)

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index)
  }
  const pathname = usePathname()

  // Sidebar open logic
  // const sidebarOpen = mode === 'hover' ? isOpen : isOpen

  return (
    <div
      className={`flex h-screen flex-col bg-neutral-900 font-mono text-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
      // onMouseEnter={() => mode === 'hover' && setIsOpen(true)}
      // onMouseLeave={() => mode === 'hover' && setIsOpen(false)}
    >
      {/* Menu Items */}

      {/* Toggle Button */}
      <div className='mt-4 flex justify-end border-r border-b border-neutral-700 p-2'>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className='rounded-md p-2 hover:bg-neutral-800'
          title='Toggle Sidebar'
        >
          {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      <nav className='mt-4 mb-2 flex-1 border-r border-l border-r-neutral-700 border-l-neutral-700'>
        {menuItems.map((item, idx) => {
          const isActive = item.href && pathname === item.href
          return (
            <div key={idx}>
              {/* Main Menu */}
              <a
                href={item.href}
                className={`mx-2 my-1 flex cursor-pointer items-center justify-between rounded-md p-3 transition-colors hover:bg-neutral-700 ${isActive ? 'bg-neutral-700 font-semibold' : ''}`}
                onClick={(e) => {
                  if (item.submenu) {
                    e.preventDefault()
                    toggleSubmenu(idx)
                  }
                }}
              >
                <div className='flex items-center'>
                  {/* Fixed icon column */}
                  <div className='flex w-8 justify-center'>{item.icon}</div>

                  {/* Label */}
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                      isOpen ? 'ml-2 w-auto opacity-100' : 'w-0 opacity-0'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
                {item.submenu && isOpen && (
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      openSubmenu === idx ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </a>

              {/* Submenu */}
              {item.submenu && openSubmenu === idx && isOpen && (
                <div className='ml-12 flex flex-col'>
                  {item.submenu.map((sub, subIdx) => {
                    // Check for active sub-link
                    const isSubActive = sub.href && pathname === sub.href
                    return (
                      <a
                        key={subIdx}
                        href={sub.href}
                        className={`my-1 flex items-center rounded-md p-2 hover:bg-neutral-700 ${
                          // Added flex items-center
                          isSubActive ? 'bg-neutral-700 font-semibold' : '' // 👈 HIGHLIGHT ADDED HERE
                        }`}
                      >
                        {sub.icon && (
                          <div className='mr-2 flex w-4 justify-center'>
                            {sub.icon}
                          </div>
                        )}
                        {sub.name}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      {/* Mode Switcher */}
    </div>
  )
}
