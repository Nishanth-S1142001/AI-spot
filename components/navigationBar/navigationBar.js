'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { navMenus } from '../../config/navmenuconfig'
import Button from '../ui/button'
import {
  ArrowLeft,
  RefreshCw,
  Download,
  MessageSquare,
  Workflow,
  Settings,
  Play,
  Save
} from 'lucide-react'

export default function NavigationBar({
  onLoginClick,
  profile,
  agent,
  onLogOutClick,
  title,
  message,
  fetchData,
  exportConversations,
  historyPath,
  testRun,
  saveWorkflow,
  saving,
  createWorkflow,
  refresh,
  fetchExecutionsData
}) {
  const pathname = usePathname()
  const router = useRouter()
  let currentMenu = navMenus.home || []

  // Set current menu based on route
  if (pathname.startsWith('/dashboard')) {
    currentMenu = navMenus.dashboard || []
  }

  // Hide menu for certain paths
  const hiddenMenuPaths = [
    '/conversations',
    '/agents',
    '/feedback',
    '/sandbox',
    '/workflows',
    '/executions',
    '/webhook'
  ]
  if (hiddenMenuPaths.some((path) => pathname.includes(path))) {
    currentMenu = []
  }

  // Add dynamic agent-based menu
  if (agent) {
    currentMenu = [
      { name: `Agent: ${agent?.name}`, href: `/agents/${agent?.id}/manage` },
      ...currentMenu
    ]
  }

  const actionButtonClasses =
    'flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium'

  return (
    <header className='bg-opacity-30 z-50 w-screen py-1 backdrop-blur-sm transition-all'>
      <nav className='flex w-full items-center px-6 pt-2'>
        {/* LEFT SECTION */}
        <div className='flex items-center gap-4'>
          {/* Homepage title */}
          {pathname === '/' && title && (
            <Link href='/'>
              <h1 className='text-xl font-bold text-white'>{title}</h1>
            </Link>
          )}
          {pathname === '/dashboard' && title && (
            <Link href='/dashboard'>
              <h1 className='text-xl font-bold text-white'>{title}</h1>
            </Link>
          )}

          {/* Agent-related routes */}
          {(pathname.startsWith('/agents') ||
            (agent && pathname.startsWith(`/agents/${agent?.id}`))) && (
            <div className='flex items-center gap-2'>
              {/* Show back button only when not on dashboard */}
              {pathname !== '/agents/dashboard' && (
                <Button variant='ghost' onClick={() => router.back()}>
                  <ArrowLeft className='h-4 w-4' />
                </Button>
              )}
            </div>
          )}
          {pathname.startsWith('/workflows') && title && (
            <div className='flex items-center gap-2'>
              <Button variant='ghost' onClick={() => router.back()}>
                <ArrowLeft className='h-4 w-4' />
              </Button>
              {/* Show back button only when not on dashboard */}
              {pathname.includes('/builder') && (
                <>
                  <Link href='/workflows'>
                    <h1 className='text-xl font-bold text-white'>{title}</h1>
                  </Link>
                </>
              )}
              {pathname === '/workflows' && <>{title}</>}
              {pathname.includes('/executions') && (
                <>
                  <Link href='/workflows'>
                    <h1 className='text-xl font-bold text-white'>{title}</h1>
                  </Link>
                </>
              )}
            </div>
          )}
          {pathname === ('/webhooks') && title && (
            <Link href='/webhooks'>
              <h1 className='text-xl font-bold text-white'>{title}</h1>
            </Link>
          )}

          {/* Agent-specific subroutes */}
          {message &&
            (pathname.startsWith('/agents') ||
              (agent && pathname.startsWith(`/agents/${agent?.id}`))) && (
              <div className='flex items-center gap-1 text-white'>
                {pathname.includes('conversations') && (
                  <MessageSquare className='h-4 w-4 text-orange-400' />
                )}
                <span className='font-bold text-white'>{message}</span>
              </div>
            )}
        </div>

        {/* MIDDLE SECTION */}
        <div className='flex flex-1 items-center justify-center gap-4'>
          <ul className='hidden items-center space-x-8 text-white md:flex'>
            {currentMenu.map((item, index) => (
              <li key={index}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className='font-bold transition-colors hover:text-red-400'
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className='font-bold text-neutral-400'>
                    {item.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT SECTION */}
        <div className='flex items-center gap-4'>
          {pathname.startsWith('/workflows') && title && (
            <div className='flex items-center gap-2'>
              {/* Show back button only when not on dashboard */}
              {pathname.includes('/builder') && (
                <>
                  <Button
                    variant='outline'
                    onClick={() => router.push(`${historyPath}`)}
                  >
                    <div className='flex flex-row items-center justify-center'>
                      <Settings className='mr-2 h-4 w-4' />
                      History
                    </div>
                  </Button>
                  <Button variant='outline' onClick={testRun}>
                    <div className='flex flex-row items-center justify-center'>
                      <Play className='mr-2 h-4 w-4' />
                      Test Run
                    </div>
                  </Button>
                  <Button onClick={saveWorkflow} disabled={saving}>
                    <div className='flex flex-row items-center justify-center'>
                      <Save className='mr-2 h-4 w-4' />
                      {saving ? 'Saving...' : 'Save'}
                    </div>
                  </Button>
                </>
              )}
              {pathname === '/workflows' && (
                <>
                  {' '}
                  <Button variant='outline' onClick={createWorkflow}>
                    <div className='flex flex-row items-center justify-center'>
                      <Workflow className='mr-2 h-4 w-4' />
                      Create Workflow
                    </div>
                  </Button>
                </>
              )}

              {pathname.includes('/executions') && (
                <>
                  <Button variant='outline' onClick={fetchExecutionsData}>
                    <div className='flex flex-row items-center justify-center'>
                      <RefreshCw className='mr-2 h-4 w-4' />
                      {refresh}
                    </div>
                  </Button>
                </>
              )}
            </div>
          )}
          {/* Conversation actions */}
          {pathname.startsWith(`/agents/${agent?.id}/conversations`) && (
            <>
              <Button
                variant='outline'
                size='sm'
                className={actionButtonClasses}
                onClick={fetchData}
              >
                <RefreshCw className='h-4 w-4' />
                <span>Refresh</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                className={actionButtonClasses}
                onClick={exportConversations}
              >
                <Download className='h-4 w-4' />
                <span>Export</span>
              </Button>
            </>
          )}

          {/* Auth buttons */}
          {pathname === '/' && <Button onClick={onLoginClick} text='LOGIN' />}

          {/* Credits */}
          {profile && pathname !== '/' && (
            <span className='font-bold text-neutral-400'>
              Credits: {profile?.api_credits}
            </span>
          )}

          {pathname !== '/' && <Button onClick={onLogOutClick} text='LOGOUT' />}
        </div>
      </nav>
    </header>
  )
}
