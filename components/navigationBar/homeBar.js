'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navMenus } from '../../config/navmenuconfig'
import Button from '../ui/button'

export default function NavigationHomeBar({ onLoginClick }) {
  const pathname = usePathname()

  // Choose which menu to show based on path
  let currentMenu = navMenus.home // default
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/agents')) {
    currentMenu = navMenus.dashboard
  } 

  return (
    <header className='bg-opacity-30 backdrop-blur-sm transition-all'>
      <nav className='flex items-center justify-between px-6 pt-2'>
        <Link href='/'>
          <h1 className='text-xl font-bold text-white'>AI Agents Inc.</h1>
        </Link>

        <ul className='hidden md:flex items-center space-x-8 text-white'>
          {currentMenu.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className='font-bold transition-colors hover:text-red-400'
              >
                {item.name}
              </Link>
            </li>
          ))}

          {/* Only show login button if not already on an auth route */}
          {!pathname.startsWith('/login') && (
            <li>
              <Button onClick={onLoginClick} text='LOGIN' />
            </li>
          )}
        </ul>

        <div className='md:hidden'>
          <button className='text-white hover:text-red-400'>☰</button>
        </div>
      </nav>
    </header>
  )
}
