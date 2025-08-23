// components/ClientNavbar.js
"use client"

import { usePathname } from "next/navigation"
import NavigationHomeBar from "../navigationBarHome/page"
import NavigationOtherBar from "../navigationBarOther/page"
import { useState } from "react"


export default function ClientNavbar() {
  const pathname = usePathname()
  var homeBar = useState(false);

  if (pathname === "/" || pathname.startsWith("/#")) {
    homeBar= true
    return <NavigationHomeBar />
  }

     else if (homeBar) {
    return <NavigationOtherBar />
  }
 
  return null // no navbar on other pages if needed
}
