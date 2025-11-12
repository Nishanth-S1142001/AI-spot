/**
 * OPTIMIZED UNIFIED SIDEBAR SYSTEM
 * Claude-style sidebar with user profile, main menu, and collapsible bottom section
 * 
 * Optimizations:
 * - Next.js Image component for optimized image loading
 * - Memoized components and callbacks
 * - Stable references with useMemo
 * - Reduced re-renders
 */

'use client'

import {
  ChevronDown,
  ChevronUp,
  LockKeyhole,
  LockKeyholeOpen,
  LogOut
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useMemo, useState } from 'react'
import { useLogout } from '../lib/supabase/auth'

/**
 * Memoized Menu Item Component
 * Prevents unnecessary re-renders of individual menu items
 */
const MenuItem = memo(({
  item,
  idx,
  isBottomSection,
  isSidebarOpen,
  openSubmenu,
  pathname,
  activeMenu,
  toggleSubmenu,
  onSelect
}) => {
  const active = useMemo(() => {
    if (pathname === item.href) return true
    if (item.key === activeMenu) return true
    return false
  }, [pathname, item.href, item.key, activeMenu])

  const hasSubmenu = useMemo(() => 
    item.submenu && item.submenu.length > 0,
    [item.submenu]
  )

  const itemKey = useMemo(() => 
    isBottomSection ? `bottom-${item.key || idx}` : item.key || idx,
    [isBottomSection, item.key, idx]
  )

  const handleClick = useCallback(() => {
    if (hasSubmenu) {
      toggleSubmenu(itemKey)
    }
    if (item.key) {
      onSelect?.(item.key)
    }
  }, [hasSubmenu, toggleSubmenu, itemKey, item.key, onSelect])

  // Item with submenu
  if (hasSubmenu) {
    return (
      <div className='mb-1 px-2'>
        <button
          className={`group relative flex w-full items-center justify-between rounded-lg p-3 transition-all ${
            active
              ? 'bg-gradient-to-r from-orange-900/40 to-transparent text-orange-300 shadow-lg shadow-orange-500/10'
              : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
          }`}
          onClick={handleClick}
        >
          {active && (
            <div className='absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full bg-orange-500' />
          )}

          <div className='flex items-center gap-3'>
            <div
              className={`flex h-5 w-5 items-center justify-center transition-transform ${
                active
                  ? 'text-orange-400'
                  : 'text-neutral-500 group-hover:text-orange-400'
              }`}
            >
              {item.icon}
            </div>
            <span
              className={`text-sm font-medium transition-all ${!isSidebarOpen && 'w-0 opacity-0'}`}
            >
              {item.name}
            </span>
          </div>

          {isSidebarOpen && (
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openSubmenu === itemKey ? 'rotate-180' : ''
              } ${active ? 'text-orange-400' : 'text-neutral-500'}`}
            />
          )}
        </button>

        {openSubmenu === itemKey && isSidebarOpen && (
          <div className='mt-1 ml-8 space-y-1 border-l-2 border-neutral-800/50 pl-4'>
            {item.submenu.map((sub, subIdx) => {
              const isSubActive = pathname === sub.href
              return (
                <Link
                  key={subIdx}
                  href={sub.href || '#'}
                  className={`block rounded-lg px-3 py-2 text-sm transition-all ${
                    isSubActive
                      ? 'bg-orange-900/40 font-medium text-orange-300'
                      : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                  }`}
                >
                  {sub.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Regular item without submenu
  return (
    <div className='mb-1 px-2'>
      <Link
        href={item.href || '#'}
        onClick={handleClick}
        className={`group relative flex items-center gap-3 rounded-lg p-3 transition-all ${
          active
            ? 'bg-gradient-to-r from-orange-900/40 to-transparent text-orange-300 shadow-lg shadow-orange-500/10'
            : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
        }`}
      >
        {active && (
          <div className='absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full bg-orange-500' />
        )}

        <div
          className={`flex h-5 w-5 items-center justify-center transition-transform ${
            active
              ? 'text-orange-400'
              : 'text-neutral-500 group-hover:text-orange-400'
          }`}
        >
          {item.icon}
        </div>

        <span
          className={`text-sm font-medium transition-all ${!isSidebarOpen && 'w-0 opacity-0'}`}
        >
          {item.name}
        </span>
      </Link>
    </div>
  )
})
MenuItem.displayName = 'MenuItem'

/**
 * Memoized User Avatar Component
 */
const UserAvatar = memo(({ user, size = 8 }) => {
  const sizeClasses = useMemo(() => {
    const sizes = {
      6: 'h-6 w-6',
      8: 'h-8 w-8',
      10: 'h-10 w-10'
    }
    return sizes[size] || sizes[8]
  }, [size])

  if (user.avatar) {
    return (
      <div className={`relative ${sizeClasses} flex-shrink-0 rounded-full overflow-hidden`}>
        <Image
          src={user.avatar}
          alt={user.name || 'User avatar'}
          fill
          sizes='32px'
          className='object-cover'
          priority={false}
        />
      </div>
    )
  }

  return (
    <div className={`flex ${sizeClasses} flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-semibold text-white`}>
      {(user.name || 'U').charAt(0).toUpperCase()}
    </div>
  )
})
UserAvatar.displayName = 'UserAvatar'

/**
 * Memoized Header Section
 */
const SidebarHeader = memo(({ isSidebarOpen, isCollapsed, onToggle }) => {
  return (
    <div className='border-b border-neutral-800/50'>
      <div className='flex h-12 items-center justify-between px-4'>
        <div
          className={`flex items-center gap-2 ${!isSidebarOpen && 'hidden'}`}
        >
          <div className='h-2 w-2 animate-pulse rounded-full bg-orange-500' />
          <span className='text-sm font-semibold text-neutral-200'>Menu</span>
        </div>

        <button
          onClick={onToggle}
          className='group flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-neutral-800'
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <LockKeyholeOpen className='h-4 w-4 text-neutral-400 transition-colors group-hover:text-orange-400' />
          ) : (
            <LockKeyhole className='h-4 w-4 text-neutral-400 transition-colors group-hover:text-orange-400' />
          )}
        </button>
      </div>
    </div>
  )
})
SidebarHeader.displayName = 'SidebarHeader'

/**
 * Memoized User Profile Section
 */
const UserProfile = memo(({ user, isSidebarOpen, isBottomMenuOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`group flex w-full items-center ${
        isSidebarOpen ? 'justify-between' : 'justify-center'
      } transition-colors hover:bg-neutral-800/30`}
      aria-label='Toggle user menu'
    >
      <div
        className={`flex cursor-pointer items-center rounded-lg p-2 transition-colors hover:bg-neutral-800/50 ${
          isSidebarOpen ? 'gap-3' : 'justify-center p-1'
        }`}
      >
        <UserAvatar user={user} size={8} />

        {isSidebarOpen && (
          <div className='flex-1 overflow-hidden'>
            <p className='truncate text-sm font-medium text-neutral-200'>
              {user.name}
            </p>
            <p className='truncate text-xs text-neutral-500'>
              {user.email}
            </p>
          </div>
        )}
      </div>

      {isSidebarOpen && (
        <ChevronUp
          className={`h-4 w-4 text-neutral-500 transition-transform ${
            isBottomMenuOpen ? 'rotate-180' : ''
          }`}
        />
      )}
    </button>
  )
})
UserProfile.displayName = 'UserProfile'

/**
 * Memoized Bottom Menu Section
 */
const BottomMenu = memo(({ 
  bottomMenuItems, 
  isSidebarOpen,
  openSubmenu,
  pathname,
  activeMenu,
  toggleSubmenu,
  onSelect,
  onLogout
}) => {
  return (
    <div className='custom-scrollbar max-h-64 overflow-y-auto border-t border-neutral-600 bg-neutral-900/80 py-2'>
      {bottomMenuItems.map((item, idx) => (
        <MenuItem
          key={`bottom-${item.key || idx}`}
          item={item}
          idx={idx}
          isBottomSection={true}
          isSidebarOpen={isSidebarOpen}
          openSubmenu={openSubmenu}
          pathname={pathname}
          activeMenu={activeMenu}
          toggleSubmenu={toggleSubmenu}
          onSelect={onSelect}
        />
      ))}

      {/* Logout Button */}
      <div className='mt-2 border-t border-neutral-800/50 px-2 pt-2'>
        <button
          onClick={onLogout}
          className='group flex w-full items-center gap-3 rounded-lg p-2.5 text-neutral-400 transition-all hover:bg-red-900/20 hover:text-red-400'
          aria-label='Logout'
        >
          <LogOut className='h-4 w-4' />
          <span className='text-sm font-medium'>Logout</span>
        </button>
      </div>
    </div>
  )
})
BottomMenu.displayName = 'BottomMenu'

/**
 * Main Sidebar Component
 */
export default function Sidebar({
  menuItems,
  activeMenu,
  onSelect,
  userProfile
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isBottomMenuOpen, setIsBottomMenuOpen] = useState(false)
  const { logout } = useLogout()

  // Memoize menu splits
  const { mainMenuItems, bottomMenuItems } = useMemo(() => {
    if (!menuItems || !Array.isArray(menuItems)) {
      return {
        mainMenuItems: [],
        bottomMenuItems: []
      }
    }

    const dividerIndex = menuItems.findIndex((item) => item.divider)
    return {
      mainMenuItems:
        dividerIndex >= 0 ? menuItems.slice(0, dividerIndex) : menuItems,
      bottomMenuItems:
        dividerIndex >= 0 ? menuItems.slice(dividerIndex + 1) : []
    }
  }, [menuItems])

  // Memoize sidebar state
  const isSidebarOpen = useMemo(
    () => isHovering || !isCollapsed,
    [isHovering, isCollapsed]
  )

  // Memoize user profile with fallback
  const user = useMemo(
    () =>
      userProfile || {
        name: 'Guest User',
        email: 'guest@example.com',
        avatar: null
      },
    [userProfile]
  )

  // Memoized callbacks
  const toggleSubmenu = useCallback((key) => {
    setOpenSubmenu((prev) => (prev === key ? null : key))
  }, [])

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev)
    if (isHovering) setIsHovering(false)
    if (!isCollapsed) {
      setOpenSubmenu(null)
      setIsBottomMenuOpen(false)
    }
  }, [isCollapsed, isHovering])

  const handleBottomMenuToggle = useCallback(() => {
    setIsBottomMenuOpen((prev) => !prev)
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (isCollapsed) setIsHovering(true)
  }, [isCollapsed])

  const handleMouseLeave = useCallback(() => {
    if (isCollapsed) setIsHovering(false)
  }, [isCollapsed])

  return (
    <div
      className={`flex h-screen flex-col border-r border-neutral-800/50 bg-neutral-900/50 font-mono text-white backdrop-blur-sm transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header Section */}
      <SidebarHeader
        isSidebarOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
        onToggle={handleToggleCollapse}
      />

      {/* Main Navigation */}
      <nav className='custom-scrollbar flex-1 overflow-y-auto py-4'>
        {mainMenuItems.map((item, idx) => (
          <MenuItem
            key={item.key || idx}
            item={item}
            idx={idx}
            isBottomSection={false}
            isSidebarOpen={isSidebarOpen}
            openSubmenu={openSubmenu}
            pathname={pathname}
            activeMenu={activeMenu}
            toggleSubmenu={toggleSubmenu}
            onSelect={onSelect}
          />
        ))}
      </nav>

      {/* Bottom Menu Section */}
      {bottomMenuItems.length > 0 && (
        <div className='border-t border-neutral-800/50'>
          <UserProfile
            user={user}
            isSidebarOpen={isSidebarOpen}
            isBottomMenuOpen={isBottomMenuOpen}
            onToggle={handleBottomMenuToggle}
          />

          {/* Expandable Bottom Menu */}
          {isBottomMenuOpen && isSidebarOpen && (
            <BottomMenu
              bottomMenuItems={bottomMenuItems}
              isSidebarOpen={isSidebarOpen}
              openSubmenu={openSubmenu}
              pathname={pathname}
              activeMenu={activeMenu}
              toggleSubmenu={toggleSubmenu}
              onSelect={onSelect}
              onLogout={logout}
            />
          )}

          {/* Footer Version */}
          <div className='p-3'>
            <div
              className={`text-xs text-neutral-600 ${!isSidebarOpen && 'text-center'}`}
            >
              {isSidebarOpen ? 'v1.0.0' : 'v1'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}