// menuConfig.js
import {
  Activity,
  BadgeInfo,
  BadgeQuestionMark,
  BarChart3,
  Bell,
  Blocks,
  Bot,
  CloudCheck,
  CreditCard,
  Home,
  LayoutDashboard,
  MessageCircle,
  MessageSquareMore,
  MessagesSquare,
  Podcast,
  ReceiptIndianRupee,
  Settings,
  Sigma,
  Slack,
  Telescope,
  User,
  Workflow
} from 'lucide-react'

export const menuItems = [
  {
    name: 'Home',
    icon: <Home className='text-orange-500' size={20} />,
    href: '/',
    key: 'home'
  },
  {
    name: 'Messages',
    href: '/',
    icon: <MessageCircle className='text-orange-500' size={20} />
  },
  {
    name: 'Discover',
    href: '/',
    icon: <Telescope className='text-orange-500' size={20} />
  },
  {
    name: 'Notifications',
    href: '/',
    icon: <Bell className='text-orange-500' size={20} />
  },
  {
    name: 'Agents',
    href: '/',
    key: 'agents',
    icon: <Bot className='text-orange-500' size={20} />
  },
  {
    name: 'Integrations',
    href: '/',
    key: 'integrations',
    icon: <Blocks className='text-orange-500' size={20} />
  },

  { divider: true },
  {
    name: 'Profile',
    icon: <User className='text-orange-500' size={20} />,
    submenu: [
      { name: 'View Profile', href: '/profile/view' },
      { name: 'Edit Profile', href: '/profile/edit' }
    ]
  },
  {
    name: 'Settings',
    icon: <Settings className='text-orange-500' size={20} />,
    href: '/settings',
    key: 'settings'
  },
  {
    name: 'Help',
    icon: <BadgeQuestionMark className='text-orange-500' size={20} />,
    href: '/help'
  },
  {
    name: 'Info',
    icon: <BadgeInfo className='text-orange-500' size={20} />,
    href: '/help'
  },
  {
    name: 'Submit feedback',
    icon: <MessagesSquare className='text-orange-500' size={20} />,
    href: '/help'
  }
]

export const subMenuItems = {
  home: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className='text-orange-500' size={20} />
    },
    {
      name: 'Activity',
      href: '/activity',
      icon: <Activity className='text-orange-500' size={20} />
    }
  ],

  agents: [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard className='text-orange-500' size={20} />,
      href: '/agents/dashboard'
    },
    {
      name: 'Agents',
      icon: <Bot className='text-orange-500' size={20} />
    },
    {
      name: 'Analytics',
      icon: <BarChart3 className='text-orange-500' size={20} />,
      submenu: [
        {
          name: 'Total Agents',
          href: '/mini-analysis/total',
          icon: <Sigma className='text-orange-500' size={16} />
        },
        {
          name: 'Conversations',
          href: '/mini-analysis/conversations',
          icon: <MessageSquareMore className='text-orange-500' size={16} />
        },
        {
          name: 'Success Rate',
          href: '/mini-analysis/successRate',
          icon: <CloudCheck className='text-orange-500' size={16} />
        },
        {
          name: 'Credits Used',
          href: '/mini-analysis/CreditsUsed',
          icon: <CreditCard className='text-orange-500' size={16} />
        }
      ]
    },

    { name: 'Workflow', icon: <Workflow className='text-orange-500' size={20} /> }
  ],
  integrations: [
    {
      name: 'Slack',
      href: '/integrations/slack',
      icon: <Slack className='text-orange-500' size={20} />
    },
    { name: 'Discord', href: '/integrations/discord' },
    { name: 'Zapier', href: '/integrations/zapier' }
  ],

  settings: [
    { name: 'General', href: '/settings/general' },
    {
      name: 'Billing',
      href: '/settings/billing',
      icon: <ReceiptIndianRupee className='text-orange-500' size={16} />
    },
    {
      name: 'Subsciption',
      href: '/settings/subscription',
      icon: <Podcast className='text-orange-500' size={16} />
    }
  ]
}

export const homeMenuItems = [
  {
    name: 'Home',
    icon: <Home className='text-orange-500' size={20} />,
    href: '/',
    key: 'home'
  },
  {
    name: 'Messages',
    href: '/',
    icon: <MessageCircle className='text-orange-500' size={20} />
  },
  {
    name: 'Discover',
    href: '/',
    icon: <Telescope className='text-orange-500' size={20} />
  },
  {
    name: 'Notifications',
    href: '/',
    icon: <Bell className='text-orange-500' size={20} />
  }
]
