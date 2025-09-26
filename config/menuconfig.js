// menuConfig.js
import { Home, User, Settings, LogOut, BadgeQuestionMark } from 'lucide-react'

export const menuItems = [
  { name: 'Dashboard', icon: <Home size={20} />, href: '/' },
  {
    name: 'Profile',
    icon: <User size={20} />,
    submenu: [
      { name: 'View Profile', href: '/profile/view' },
      { name: 'Edit Profile', href: '/profile/edit' },
    ],
  },
  { name: 'Settings', icon: <Settings size={20} />, href: '/settings' },
  { name: 'Help', icon: <BadgeQuestionMark size={20} />, href: '/help' },
  { name: 'Logout', icon: <LogOut size={20} />, href: '/logout' },
]
