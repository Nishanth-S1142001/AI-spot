'use client'
import Link from 'next/link'
import Button from '../button'

export default function NavigationHomeBar({ onLoginClick }) {
  return (
    <header className='bg-opacity-30 fixed top-0 left-0 z-50 w-full scroll-smooth backdrop-blur-sm transition-all '>
      <nav className='container mx-auto flex items-center justify-between scroll-smooth px-6 pt-2'>
        <Link href='/'>
          <h1 className='scroll-smooth text-xl font-bold text-white'>
            AI Agents Inc.
          </h1>
        </Link>
        <ul className='flex items-center space-x-8 scroll-smooth text-white'>
          <li>
            <Link
              href='/#about'
              className='font-bold transition-colors hover:text-blue-400'
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              href='/#services'
              className='font-bold transition-colors hover:text-blue-400'
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              href='/#pricing'
              className='scroll-smooth font-bold transition-colors hover:text-blue-400'
            >
              Pricing
            </Link>
          </li>
          <li>
            <Link
              href='/#contact'
              className='font-bold transition-colors hover:text-blue-400'
            >
              Contact
            </Link>
          </li>
          <li>
            <Button onClick={onLoginClick} text={'LOGIN'}></Button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
