'use client'
import {
  ArrowLeft,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { navMenus } from '../../config/navmenuconfig'
import Button from '../ui/button'

/**
 * NavigationBar Component with Smooth Scroll Support
 * Features:
 * - Smooth scrolling for anchor links
 * - Mobile responsive hamburger menu
 * - Orange theme matching dashboard
 */

export default function NavigationBar({
  onLoginClick,
  profile,
  agent,
  onLogOutClick,
  title,
  message
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Determine current menu
  const getCurrentMenu = () => {
    if (pathname.startsWith('/dashboard')) {
      return navMenus.dashboard || []
    }

    const hiddenMenuPaths = [
      '/conversations',
      '/agents',
      '/feedback',
      '/sandbox',
      '/workflows',
      '/executions',
      '/webhook',
      '/integrations',
      '/analytics'
    ]

    if (hiddenMenuPaths.some((path) => pathname.includes(path))) {
      return []
    }

    let menu = navMenus.home || []

    // Add agent-specific menu item
    if (agent) {
      menu = [{ name: agent.name, href: `/agents/${agent.id}/manage` }, ...menu]
    }

    return menu
  }

  const currentMenu = getCurrentMenu()

  // Check if we're on specific routes
  const isHomePage = pathname === '/'
  const isDashboard = pathname === '/dashboard'
  const isAgentsPage = pathname.startsWith('/agents')
  const isWorkflowsPage = pathname.startsWith('/workflows')
  const isIntegrationsPage = pathname.startsWith('/integrations')

  // Handle smooth scroll for anchor links
  const handleAnchorClick = (e, href) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
      setMobileMenuOpen(false)
    }
  }

  return (
    <header className='sticky top-0 z-50 w-full border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
      <nav className='mx-auto flex h-16 max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-6'>
        {/* ========== LEFT SECTION ========== */}
        <div className='flex items-center gap-3'>
          {/* Back Button */}
          {isAgentsPage && pathname !== '/agents/dashboard' && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => router.back()}
              className='group'
            >
              <ArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
            </Button>
          )}

          {isWorkflowsPage && pathname !== '/workflows' && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => router.back()}
              className='group'
            >
              <ArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
            </Button>
          )}   
          {isIntegrationsPage && pathname !== '/integrations' && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => router.back()}
              className='group'
            >
              <ArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
            </Button>
          )}

          {/* Title/Logo */}
          {(isHomePage || isDashboard) && title && (
            <Link
              href={isHomePage ? '/' : '/dashboard'}
              className='group flex items-center'
            >
              <h1 className='text-lg font-bold text-white transition-colors group-hover:text-orange-400 sm:text-xl'>
                {title}
              </h1>
            </Link>
          )}

          {/* Message (Status/Section Name) */}
          {message && (isAgentsPage || isWorkflowsPage) && (
            <div className='flex items-center gap-2 rounded-lg bg-neutral-900/50 px-3 py-1.5 ring-1 ring-neutral-800'>
              <span className='text-sm font-medium text-neutral-200'>
                {message}
              </span>
            </div>
          )}
        </div>

        {/* ========== CENTER SECTION (Menu) ========== */}
        <div className='hidden flex-1 items-center justify-center lg:flex'>
          {currentMenu.length > 0 && (
            <ul className='flex items-center gap-1'>
              {currentMenu.map((item, index) => (
                <li key={index}>
                  {item.href ? (
                    item.href.startsWith('#') ? (
                      // Anchor link with smooth scroll
                      <a
                        href={item.href}
                        onClick={(e) => handleAnchorClick(e, item.href)}
                        className='cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-neutral-300 transition-all hover:bg-neutral-900/50 hover:text-orange-400'
                      >
                        {item.name}
                      </a>
                    ) : (
                      // Regular link
                      <Link
                        href={item.href}
                        className='rounded-lg px-4 py-2 text-sm font-medium text-neutral-300 transition-all hover:bg-neutral-900/50 hover:text-orange-400'
                      >
                        {item.name}
                      </Link>
                    )
                  ) : (
                    <span className='px-4 py-2 text-sm font-medium text-neutral-500'>
                      {item.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ========== RIGHT SECTION (Actions) ========== */}
        <div className='flex items-center gap-2'>
          {/* Credits Display */}
          {profile && !isHomePage && (
            <div className='hidden items-center gap-2 rounded-lg bg-gradient-to-r from-orange-950/20 to-neutral-900/20 px-3 py-1.5 ring-1 ring-orange-600/20 sm:flex'>
              <span className='text-xs font-medium text-neutral-400'>
                Credits
              </span>
              <span className='text-sm font-bold text-orange-400'>
                {profile.api_credits || 0}
              </span>
            </div>
          )}

          {/* Auth Buttons */}
          {isHomePage ? (
            <Button onClick={onLoginClick} size='sm' className='hidden sm:flex'>
              Sign In
            </Button>
          ) : (
            <Button
              onClick={onLogOutClick}
              variant='ghost'
              size='sm'
              className='hidden sm:flex'
            >
              Log Out
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          {currentMenu.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='lg:hidden'
            >
              {mobileMenuOpen ? (
                <X className='h-5 w-5' />
              ) : (
                <Menu className='h-5 w-5' />
              )}
            </Button>
          )}
        </div>
      </nav>

      {/* ========== MOBILE MENU ========== */}
      {mobileMenuOpen && currentMenu.length > 0 && (
        <div className='animate-slideDown border-t border-neutral-800/50 bg-neutral-950/95 backdrop-blur-xl lg:hidden'>
          <div className='mx-auto max-w-7xl px-4 py-4'>
            <ul className='space-y-1'>
              {currentMenu.map((item, index) => (
                <li key={index}>
                  {item.href ? (
                    item.href.startsWith('#') ? (
                      // Anchor link with smooth scroll
                      <a
                        href={item.href}
                        onClick={(e) => handleAnchorClick(e, item.href)}
                        className='block cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-neutral-300 transition-all hover:bg-neutral-900/50 hover:text-orange-400'
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className='block rounded-lg px-4 py-2 text-sm font-medium text-neutral-300 transition-all hover:bg-neutral-900/50 hover:text-orange-400'
                      >
                        {item.name}
                      </Link>
                    )
                  ) : (
                    <span className='block px-4 py-2 text-sm font-medium text-neutral-500'>
                      {item.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Mobile-only actions */}
            <div className='mt-4 space-y-2 border-t border-neutral-800/50 pt-4'>
              {profile && !isHomePage && (
                <div className='flex items-center justify-between rounded-lg bg-gradient-to-r from-orange-950/20 to-neutral-900/20 px-4 py-2 ring-1 ring-orange-600/20'>
                  <span className='text-sm font-medium text-neutral-400'>
                    Credits
                  </span>
                  <span className='text-sm font-bold text-orange-400'>
                    {profile.api_credits || 0}
                  </span>
                </div>
              )}

              {isHomePage ? (
                <Button
                  onClick={onLoginClick}
                  size='sm'
                  className='w-full sm:hidden'
                >
                  Sign In
                </Button>
              ) : (
                <Button
                  onClick={onLogOutClick}
                  variant='ghost'
                  size='sm'
                  className='w-full sm:hidden'
                >
                  Log Out
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  )
}
