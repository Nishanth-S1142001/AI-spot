'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  // Removed MousePointer as it's no longer used
  ChevronDown,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react'

export default function Sidebar({ menuItems, activeMenu, onSelect }) {
  const pathname = usePathname()

  // We use 'isCollapsed' to manage the manual open/close state.
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)

  // We use local state to track if the mouse is hovering over the sidebar
  const [isHovering, setIsHovering] = useState(false)

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index)
  }

  // Define the visibility state:
  const isSidebarOpen = isHovering || !isCollapsed

  // Define the width class based only on isSidebarOpen
  const sidebarWidthClass = isSidebarOpen ? 'w-64' : 'w-15' // Keeping 'w-15' as per your original code

  return (
    <div
      className={`flex h-screen flex-col bg-neutral-900 font-mono text-white transition-all duration-300 ${sidebarWidthClass}`}
      onMouseEnter={() => isCollapsed && setIsHovering(true)}
      onMouseLeave={() => isCollapsed && setIsHovering(false)}
    >
      {/* 1. TOGGLE BUTTON AT THE TOP (NEW LOCATION) */}
      <div className='mt-4 flex justify-end border-r border-b border-neutral-700 p-2'>
        <button
          // Toggles the manual collapsed state
          onClick={() => {
            setIsCollapsed((prev) => !prev)
            // If the sidebar is currently expanded by hover when we click, immediately hide it
            if (isHovering) setIsHovering(false)
            // Close any open submenu when collapsing
            if (!isCollapsed) setOpenSubmenu(null)
          }}
          className={`rounded-md p-2 hover:bg-neutral-800`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* 2. Menu Items (Now starts immediately after the button) */}
      <nav className='custom-scrollbar mt-4 flex-1 overflow-y-auto'>
        {menuItems.map((item, idx) => {
          const isCurrentlyActive = item.key && activeMenu === item.key
          if (item.divider) {
            return (
              <hr
                key={`divider-${idx}`}
                className='my-2 border-t border-neutral-700'
              />
            )
          }
          const isActive = pathname === item.href
          return (
            <div key={idx}>
              {/* Main Menu */}
              <div
                className={`mx-2 my-1 flex cursor-pointer items-center justify-between rounded-md p-3 transition-colors hover:bg-neutral-700 ${
                  isCurrentlyActive ? 'bg-neutral-700 font-semibold' : ''
                }`}
                onClick={() => {
                  if (item.submenu) {
                    toggleSubmenu(idx)
                  }
                  if (item.key) {
                    onSelect(item.key)
                  }
                }}
              >
                <div className='flex items-center gap-4'>
                  {item.icon}
                  <span className={`${!isSidebarOpen && 'hidden'}`}>
                    {item.name}
                  </span>
                </div>
                {item.submenu && isSidebarOpen && (
                  <ChevronDown
                    size={18}
                    className={`text-orange-500 transition-transform ${
                      openSubmenu === idx ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </div>

              {/* Submenu */}
              {item.submenu && openSubmenu === idx && isSidebarOpen && (
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
        })}
      </nav>

      {/* 3. The old "Mode Switcher" area is now only for additional footer items, 
           or simply removed if nothing else goes here. */}
      {/* Since you wanted the button removed, I've commented out the original footer div here: */}
      {/* <div
        className={`flex border-t border-neutral-700 p-2 justify-center`}
      >
      </div> */}
    </div>
  )
}
