'use client'

import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState } from 'react'

import { homeMenuItems } from '../config/menuconfig'

// Updated to accept isOpen and setIsOpen as props
export default function HomeSidebar({
  children,
  className,
  isOpen,
  setIsOpen
}) {
  // Removed: const [isOpen, setIsOpen] = useState(true)

  const [openSubmenu, setOpenSubmenu] = useState(null)

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index)
  }

  return (
    // The fixed sidebar should use 'fixed' positioning or rely on the parent container (which is now a flex container)
    // The 'fixed' class is removed here as the parent flex layout handles the positioning and height.
    <div
      className={`custom-scrollbar z-20 flex h-screen bg-neutral-900 font-mono text-white ${className}`}
    >
      {/* Sidebar */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} ${className}`}
      >
        {/* Sidebar content - this div fills the container and defines the look */}
        <div
          // Use h-full and fixed width relative to its parent container (w-full)
          className={`flex h-full flex-col border-r border-neutral-800 bg-neutral-900`}
        >
          {/* Toggle Button */}
          <div className='mt-4 flex justify-end border-b border-neutral-700 p-2'>
            <button
              // Use the passed setIsOpen prop
              onClick={() => setIsOpen((prev) => !prev)}
              className='rounded-md p-2 hover:bg-neutral-800'
              title='Toggle Sidebar'
            >
              {isOpen ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeftOpen size={18} />
              )}
            </button>
          </div>

          {/* Menu Items */}
          <nav className='custom-scrollbar mt-4 flex-1 overflow-y-auto'>
            {homeMenuItems.map((item, idx) => (
              <div key={idx}>
                {/* Scroll to section by ID with smooth behavior */}
                <a
                  href={`#${item.href.substring(1)}`}
                  className='mx-2 my-1 flex cursor-pointer items-center justify-between rounded-md p-3 hover:bg-neutral-700'
                  onClick={(e) => {
                    if (item.submenu) {
                      e.preventDefault()
                      toggleSubmenu(idx)
                    }
                  }}
                >
                  <div className='flex items-center'>
                    <div className='flex w-8 justify-center'>{item.icon}</div>
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
                      className={`text-red-500 transition-transform ${
                        openSubmenu === idx ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </a>
                {item.submenu && openSubmenu === idx && isOpen && (
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
            ))}
          </nav>
        </div>
      </div>
    </div>
    // Removed the duplicated main content tag from here:
    // <main className='flex-1 overflow-y-auto p-6'>{children}</main>
  )
}
