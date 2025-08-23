'use client'
import Link from 'next/link'

export default function NavigationHomeBar() {
  return (
    <header className=' bg-opacity-30 fixed top-0 left-0 z-50 w-full scroll-smooth  backdrop-blur-sm transition-all'>
      <nav className='container mx-auto flex items-center justify-between scroll-smooth px-6 py-4'>
        <Link href='/'>
          <h1 className='scroll-smooth text-xl font-bold text-white'>
            AI Agents Inc.
          </h1>
        </Link>
        <ul className='flex items-center space-x-8 scroll-smooth text-white'>
          <li>
            <Link
              href='/#about'
              className='transition-colors font-bold hover:text-cyan-400'
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              href='/#services'
              className='transition-colors font-bold hover:text-cyan-400'
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              href='/#pricing'
              className='scroll-smooth transition-colors hover:text-cyan-400'
            >
              Pricing
            </Link>
          </li>
          <li>
            <Link
              href='/#contact'
              className='transition-colors hover:text-cyan-400'
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
