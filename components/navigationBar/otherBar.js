'use client'
import Button from '../ui/button'


export default function NavigationOtherBar() {
  const onLoginClick = () => {
    console.log('Logout clicked')
  }
  return (
    <header className='m-[60%] border-[#024a70]  flex justify-end  bg-opacity-30 fixed top-0 left-0 z-50 w-full scroll-smooth border-b-2 bg-black backdrop-blur-sm transition-all'>
      <nav className='container   scroll-smooth  '>
       
        <ul className='w-full    flex justify-end  text-white'>
          <li>
              <Button onClick={onLoginClick} className="m-2" text={'LOG OUT'}></Button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
