'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navMenus } from '../../config/navmenuconfig'
import Button from '../ui/button'

export default function NavigationBar({
  onLoginClick,
  profile,
  agent,
  onLogOutClick,
  title
}) {
  const pathname = usePathname()

  let currentMenu = navMenus.home || []

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/agents')) {
    currentMenu = navMenus.dashboard || []
  }

  // Example of adding dynamic menu items
  if (agent) {
    currentMenu = [
      ...currentMenu,
      { name: `Agent: ${agent.name}`, href: `/agents/${agent.id}` }
    ]
  }

  if (profile) {
    currentMenu = [...currentMenu, { name: `Credits: ${profile?.api_credits}` }]
  }

  return (
    <header className='bg-opacity-30 py-1 backdrop-blur-sm transition-all'>
      <nav className='flex items-center justify-between px-6 pt-2'>
        <Link href='/'>
          <h1 className='text-xl font-bold text-white'>{title}</h1>
        </Link>
        <div className='flex flex-row'>
          <ul className='mr-4 hidden items-center space-x-8 text-white md:flex'>
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
          {pathname === '/' && (
            <div>
              <Button onClick={onLoginClick} text='LOGIN' />
            </div>
          )}

          {pathname.startsWith('/dashboard') && (
            <div>
              <Button onClick={onLogOutClick} text='LOGOUT' />
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
