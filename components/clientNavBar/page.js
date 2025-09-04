// components/ClientNavbar.js
'use client'

import { usePathname } from 'next/navigation'
import OtherBar from '../navigationBar/otherBar'
import { useState } from 'react'
import Sidebar from '../sideBar'
import SubSidebar from '../subSideBar'

export default function ClientNavbar() {
  const pathname = usePathname()
   

  if (pathname !== '/' || !pathname.startsWith('/#')) {
  
    return 
  }
  return <Sidebar/> && <SubSidebar/>
    
 

    // no navbar on other pages if needed
}
