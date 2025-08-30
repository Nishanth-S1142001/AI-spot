'use client'
import Link from 'next/link'
import Button from '../button'


export default function NavigationOtherBar() {
  const onLoginClick = () => {
    console.log('Logout clicked')
  }
  return (
    <header className='border-[#024a70] bg-opacity-30 fixed top-0 left-0 z-50 w-full scroll-smooth border-b-2 bg-black backdrop-blur-sm transition-all'>
      <nav className='container mx-auto flex items-center justify-between scroll-smooth px-6 py-4'>
       
        <ul className='flex items-center space-x-8 scroll-smooth text-white'>
          <li>
              <Button onClick={onLoginClick} text={'LOG OUT'}></Button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
