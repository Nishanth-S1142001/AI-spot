/**
 * SIDEBAR LAYOUT - FIXED VERSION
 * Transparent background to allow NeonBackground to show through
 */

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
 * Determine which menu should be active based on current pathname
 */
const getActiveMenuKey = (pathname) => {
  // Agent routes
  if (pathname.startsWith('/agents')) return 'agents'
  
  // Integrations routes
  if (pathname.startsWith('/integrations')) return 'integrations'
  
  // Settings routes
  if (pathname.startsWith('/settings')) return 'settings'
  
  // Workflow routes
  if (pathname.startsWith('/workflows')) return 'workflows'
  
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
  return null
}

export default function SideBarLayout({ children, userProfile }) {
  const pathname = usePathname()
  const [activeMenu, setActiveMenu] = useState(() => getActiveMenuKey(pathname))

  // Update active menu when pathname changes
  useEffect(() => {
    const newKey = getActiveMenuKey(pathname)
    if (newKey !== activeMenu) {
      setActiveMenu(newKey)
    }
  }, [pathname, activeMenu])

  // Get current submenu items based on active menu
  const currentSubMenu = activeMenu && subMenus[activeMenu] ? subMenus[activeMenu] : []

  return (
    <div className='flex h-screen w-full overflow-hidden '>
      {/* Sidebar Container */}
      <aside className='flex h-full'>
        {/* Main Unified Sidebar */}
        <Sidebar
          menuItems={mainMenu}
          activeMenu={activeMenu}
          onSelect={setActiveMenu}
          userProfile={userProfile}
        />
        
        {/* Sub Sidebar (only show if there are submenu items) */}
        {currentSubMenu.length > 0 && (
          <SubSidebar menuItems={currentSubMenu} />
        )}
      </aside>

      {/* Main Content Area - TRANSPARENT BACKGROUND */}
      <main className='custom-scrollbar flex-1 overflow-y-auto'>
        {children}
      </main>
    </div>
  )
}