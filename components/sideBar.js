'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Settings, LogOut, ChevronDown, BadgeQuestionMark } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)

  const menuItems = [
    { name: 'Dashboard', icon: <Home size={20} />,
    //  href: '/'
     },
    {
      name: 'Profile',
      icon: <User size={20} />,
      submenu: [
        { name: 'View Profile', href: '/profile/view' },
        { name: 'Edit Profile', href: '/profile/edit' },
      ],
    },
    { name: 'Settings', icon: <Settings size={20} />, 
    // href: '/settings' 
  },
    { name: 'Help', icon: <BadgeQuestionMark size={20} />, 
    // href: '/help' 
  },{ name: 'Logout', icon: <LogOut size={20} />, 
    // href: '/logout' 
  },
  ]

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index)
  }

  return (
    <div
      className={` font-mono flex flex-col h-screen bg-neutral-900 text-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-15'
      }`}
        onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
        

      {/* Menu Items */}
      <nav className="flex-1 mt-4">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href
          return (
            <div key={idx}>
              {/* Main Menu */}
              <div
                className={`flex items-center justify-between p-3 rounded-md mx-2 my-1 cursor-pointer transition-colors hover:bg-neutral-700 ${
                  isActive ? 'bg-neutral-700 font-semibold' : ''
                }`}
                onClick={() => item.submenu && toggleSubmenu(idx)}
              >
                <div className="flex items-center gap-4">
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
              </div>

              {/* Submenu */}
              {item.submenu && openSubmenu === idx && isOpen && (
                <div className="ml-12 flex flex-col">
                  {item.submenu.map((sub, subIdx) => (
                    <Link
                      key={subIdx}
                      href={sub.href}
                      className={`p-2 my-1 rounded-md hover:bg-neutral-700 ${
                        pathname === sub.href ? 'bg-neutral-700 font-semibold' : ''
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

     
    </div>
  )
}
