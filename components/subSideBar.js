'use client'

import React, { useState } from 'react'
import {
  Home,
  User,
  Settings,
  LogOut,
  ChevronDown,
  MousePointer,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react'

export default function SubSidebar({ menuItems }) {
  // Modes: "hover" or "toggle"
  const [mode, setMode] = useState('hover')
  const [isOpen, setIsOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index)
  }

  // Sidebar open logic
  const sidebarOpen = mode === 'hover' ? isOpen : isOpen

  return (
    <div
      className={`flex h-screen flex-col bg-neutral-900 font-mono text-white transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => mode === 'hover' && setIsOpen(true)}
      onMouseLeave={() => mode === 'hover' && setIsOpen(false)}
    >
      {/* Menu Items */}
      <nav className='mt-4 mb-2 flex-1 border-l border-l-neutral-700'>
        {menuItems.map((item, idx) => {
          return (
            <div key={idx}>
              {/* Main Menu */}
              <a
                href={item.href}
                className={`mx-2 my-1 flex cursor-pointer items-center justify-between rounded-md p-3 transition-colors hover:bg-neutral-700`}
                onClick={(e) => {
                  if (item.submenu) {
                    e.preventDefault()
                    toggleSubmenu(idx)
                  }
                }}
              >
                <div className='flex items-center gap-4'>
                  {item.icon}
                  <span className={`${!sidebarOpen && 'hidden'}`}>
                    {item.name}
                  </span>
                </div>
                {item.submenu && sidebarOpen && (
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      openSubmenu === idx ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </a>

              {/* Submenu */}
              {item.submenu && openSubmenu === idx && sidebarOpen && (
                <div className='ml-12 flex flex-col'>
                  {item.submenu.map((sub, subIdx) => (
                    <a
                      key={subIdx}
                      href={sub.href}
                      className='my-1 rounded-md p-2 hover:bg-neutral-700'
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
      {/* Mode Switcher */}
      <div
        className={`flex border-t border-neutral-700 p-2 ${
          sidebarOpen
            ? 'flex-row justify-between '
            : 'flex-col items-center  gap-2 '
        }`}
      >
        {/* Hover Mode Button */}
        <button
          onClick={() => {
            setMode('hover')
            setIsOpen(false)
          }}
          className={`rounded-md p-2 hover:bg-neutral-800 ${
            mode === 'hover' ? 'bg-neutral-700' : ''
          }`}
          title='Hover Mode'
        >
          <MousePointer size={18} />
        </button>

        {/* Toggle Mode Button */}
        <button
          onClick={() => {
            if (mode !== 'toggle') {
              setMode('toggle')
              setIsOpen(true)
            } else {
              setIsOpen((prev) => !prev)
            }
          }}
          className={`rounded-md p-2 hover:bg-neutral-800 ${
            mode === 'toggle' ? 'bg-neutral-700' : ''
          }`}
          title='Toggle Mode'
        >
          {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>
    </div>
  )
}
