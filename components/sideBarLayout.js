// SideBarLayout.js (Corrected)

import { usePathname } from 'next/navigation' // 👈 Import usePathname
import { useEffect, useState } from 'react' // 👈 Import useEffect
import {
  menuItems as mainMenu,
  subMenuItems as subMenus
} from '../config/menuconfig.js'
import Sidebar from './sideBar.js'
import SubSidebar from './subSideBar.js'

const getActiveMenuKey = (pathname) => {
  if (pathname.startsWith('/agents')) return 'agents'
  if (pathname.startsWith('/settings')) return 'settings'
  // Add other key mappings here (e.g., if (pathname.startsWith('/profile')) return 'profile')
  // Fallback for home, dashboard, and activity
  if (
    pathname === '/' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/activity')
  )
    return 'home'

  // You may need to refine this based on your full menu logic
  return 'home'
}


export default function SideBarLayout({ children }) {
  const pathname = usePathname()
  
  const initialKey = getActiveMenuKey(pathname) // Calculate initial value
  const [activeMenu, setActiveMenu] = useState(initialKey)
  useEffect(() => {
    // Only update if the determined key is different from the current state
    const newKey = getActiveMenuKey(pathname)
    if (newKey !== activeMenu) {
      setActiveMenu(newKey)
    }
  }, [pathname])
  return (
    <div className='custom-scrollbar z-10 flex h-screen w-full'>
      {/* Sidebar container full height, no background needed since parent has it */}
      <div className='flex h-full bg-neutral-900'>
        <Sidebar
          menuItems={mainMenu}
          activeMenu={activeMenu}
          onSelect={(key) => setActiveMenu(key)}
        />
        <SubSidebar menuItems={subMenus[activeMenu] || []} />
      </div>
      {/* Main content: full height flex column, header at top (no gap to sidebar), scrollable body */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        <main className='flex-1 overflow-y-auto'>{children}</main>
      </div>
    </div>
  )
}
