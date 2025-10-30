'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  menuItems as mainMenu,
  subMenuItems as subMenus
} from '../config/menuconfig.js'
import Sidebar from './sideBar.js'
import SubSidebar from './subSideBar.js'

/**
 * Improved SideBarLayout Component
 * Features:
 * - Clean layout structure
 * - Automatic menu detection based on route
 * - Smooth transitions
 * - Better state management
 */

/**
 * Determine which menu should be active based on current pathname
 */
const getActiveMenuKey = (pathname) => {
  // Agent routes
  if (pathname.startsWith('/agents')) return 'agents'
  
  // Workflow routes
  if (pathname.startsWith('/workflows')) return 'workflows'
  
  // Settings routes
  if (pathname.startsWith('/settings')) return 'settings'
  
  // Webhook routes
  if (pathname.startsWith('/webhooks')) return 'webhooks'
  
  // Profile routes
  if (pathname.startsWith('/profile')) return 'profile'
  
  // Analytics routes
  if (pathname.startsWith('/analytics')) return 'analytics'
  
  // Activity routes
  if (pathname.startsWith('/activity')) return 'activity'
  
  // Home/Dashboard routes
  if (pathname === '/' || pathname.startsWith('/dashboard')) return 'home'
  
  // Default fallback
  return 'home'
}

export default function SideBarLayout({ children }) {
  const pathname = usePathname()
  const [activeMenu, setActiveMenu] = useState(() => getActiveMenuKey(pathname))

  // Update active menu when pathname changes
  useEffect(() => {
    const newKey = getActiveMenuKey(pathname)
    if (newKey !== activeMenu) {
      setActiveMenu(newKey)
    }
  }, [pathname, activeMenu])

  // Get current submenu items
  const currentSubMenu = subMenus[activeMenu] || []

  return (
    <div className='flex h-screen w-full overflow-hidden'>
      {/* Sidebar Container */}
      <aside className='flex h-full bg-neutral-950'>
        {/* Main Sidebar */}
        <Sidebar
          menuItems={mainMenu}
          activeMenu={activeMenu}
          onSelect={setActiveMenu}
        />
        
        {/* Sub Sidebar (only show if there are submenu items) */}
        {currentSubMenu.length > 0 && (
          <SubSidebar menuItems={currentSubMenu} />
        )}
      </aside>

      {/* Main Content Area */}
      <main className='custom-scrollbar flex-1 overflow-y-auto bg-neutral-950'>
        {children}
      </main>
    </div>
  )
}