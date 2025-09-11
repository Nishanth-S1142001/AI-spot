'use client'

import React, { useState } from 'react'
// The "next/link" and "next/navigation" imports could not be resolved in this environment.
// Using standard <a> tags and removing the router logic for now.
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
import {
  Home,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  UnfoldHorizontalIcon,
  FoldHorizontal
} from 'lucide-react'

export default function SubSidebar({ menuItems }) {
  // The usePathname hook from next/navigation is not supported here.
  // const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const [openSubmenu, setOpenSubmenu] = useState(null)

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index)
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div
      className={`font-mono flex h-screen flex-col bg-neutral-900 text-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className='flex items-center justify-end p-4'>
        
        <button
          onClick={toggleSidebar}
          className='rounded-md p-2 hover:bg-neutral-800'
        >
          <FoldHorizontal
            size={20}
            className={`transition-transform    ${!isOpen && 'rotate-180' }`}
            
          />
        </button>
      </div>
      {/* Menu Items */}
      <nav className='mt-4 flex-1'>
        {menuItems.map((item, idx) => {
          // The isActive logic is removed because usePathname is not available.
          // const isActive = pathname === item.href
          return (
            <div key={idx}>
              {/* Main Menu */}
              <a
                href={item.href} // Using standard <a> tag
                className={`mx-2 my-1 flex cursor-pointer items-center justify-between rounded-md p-3 transition-colors hover:bg-neutral-700`}
                onClick={() => item.submenu && toggleSubmenu(idx)}
              >
                <div className='flex items-center gap-4'>
                  {item.icon}
                  <span className={`${!isOpen && 'hidden'}`}>{item.name}</span>
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
                  {item.submenu.map((sub, subIdx) => (
                    <a // Using standard <a> tag
                      key={subIdx}
                      href={sub.href}
                      className={`my-1 rounded-md p-2 hover:bg-neutral-700`}
                    >
                      {sub.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      
      
    </div>
  )
}
