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
  Info,
  LayoutDashboard,
  MessageCircle,
  MessageSquareMore,
  MessagesSquare,
  Newspaper,
  Podcast,
  Clipboard,
  ReceiptIndianRupee,
  Settings,
  Sigma,
  Slack,
  Telescope,
  User,
  Workflow,
  Webhook
} from 'lucide-react'

export const menuItems = [
  {
    name: 'Home',
    icon: <Home className='text-orange-500' size={20} />,

    key: 'home'
  },
  {
    name: 'Discover',
    href: '/',
    icon: <Telescope className='text-orange-500' size={20} />
  },
  {
    name: 'Agents',

    key: 'agents',
    icon: <Bot className='text-orange-500' size={20} />
  },
  {
    name: 'Messages',
    href: '/',
    icon: <MessageCircle className='text-orange-500' size={20} />
  },

  {
    name: 'Notifications',
    href: '/',
    icon: <Bell className='text-orange-500' size={20} />
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
    href: '/feedback'
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
      name: 'Webhooks',
      icon: <Webhook className='text-orange-500' size={20} />,
      href: '/webhooks'
    },
    {
      name: 'Integrations',

      key: 'integrations',
      icon: <Blocks className='text-orange-500' size={20} />
    },
    {
      name: 'Analytics',
      icon: <BarChart3 className='text-orange-500' size={20} />
      // submenu: [
      //   {
      //     name: 'Total Agents',
      //     href: '/mini-analysis/total',
      //     icon: <Sigma className='text-orange-500' size={16} />
      //   },
      //   {
      //     name: 'Conversations',
      //     href: '/mini-analysis/conversations',
      //     icon: <MessageSquareMore className='text-orange-500' size={16} />
      //   },
      //   {
      //     name: 'Success Rate',
      //     href: '/mini-analysis/successRate',
      //     icon: <CloudCheck className='text-orange-500' size={16} />
      //   },
      //   {
      //     name: 'Credits Used',
      //     href: '/mini-analysis/CreditsUsed',
      //     icon: <CreditCard className='text-orange-500' size={16} />
      //   }
      // ]
    },

    {
      name: 'Workflow',
      icon: <Workflow className='text-orange-500' size={20} />,
      href:'/workflows'
    }
  ],
  integrations: [
    {
      name: 'Slack',
      href: '/integrations/slack',
      icon: <Slack className='text-orange-500' size={20} />
    },
    {
      name: 'Discord',
      href: '/integrations/discord',
      icon: <MessageCircle className='text-orange-500' size={20} />
    },
    {
      name: 'Zapier',
      href: '/integrations/zapier',
      icon: <Blocks className='text-orange-500' size={20} />
    }
  ],

  settings: [
    {
      name: 'General',
      href: '/settings/general',
      icon: <Info className='text-orange-500' size={20} />
    },
    {
      name: 'Billing',
      href: '/settings/billing',
      icon: <ReceiptIndianRupee className='text-orange-500' size={16} />
    },
    {
      name: 'Subsciption',
      href: '/settings/subscription',
      icon: <BadgeInfo className='text-orange-500' size={16} />
    }
  ]
}

export const homeMenuItems = [
  {
    name: 'Spot Edu Community',
    icon: <Home className='text-orange-500' size={20} />,
    href: '/',
    key: 'home'
  },
  {
    name: 'Blog',
    href: '/',
    icon: <Newspaper className='text-orange-500' size={20} />
  },
  {
    name: 'Help',
    href: '/',
    icon: <Info className='text-orange-500' size={20} />
  },
  {
    name: 'Spot Feedback',
    href: '/',
    icon: <Clipboard className='text-orange-500' size={20} />
  }
]
