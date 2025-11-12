// menuConfig.js - FIXED VERSION
import {
  Activity,
  BadgeInfo,
  BadgeQuestionMark,
  BarChart3,
  Bell,
  Blocks,
  Bot,
  Clipboard,
  Home,
  Info,
  LayoutDashboard,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  ReceiptIndianRupee,
  Settings,
  Slack,
  Telescope,
  User,
  Webhook,
  Workflow
} from 'lucide-react'

export const menuItems = [
  {
    name: 'Home',
    href: '/dashboard', // ✅ FIXED - Added href
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
    href: '/agents/dashboard', // ✅ FIXED - Added href (you can change to /agents/dashboard if preferred)
    key: 'agents',
    icon: <Bot className='text-orange-500' size={20} />
  },
  {
    name: 'Integrations',
    href: '/integrations', // ✅ FIXED - Added href
    key: 'integrations',
    icon: <Blocks className='text-orange-500' size={20} />
  },
  {
    name: 'Workflow',
    icon: <Workflow className='text-orange-500' size={20} />,
    href: '/workflows'
  },
  {
    name: 'Messages',
    href: '/messages', // ✅ FIXED - Changed from '/' to '/messages'
    icon: <MessageCircle className='text-orange-500' size={20} />
  },
  {
    name: 'Notifications',
    href: '/notifications', // ✅ FIXED - Changed from '/' to '/notifications'
    icon: <Bell className='text-orange-500' size={20} />
  },
  { divider: true },
  {
    name: 'Upgrade Plan',
    icon: <User className='text-orange-500' size={20} />,
    key: 'plan', // ✅ ADDED - For active state management,
    href: '/plan'
  },
  {
    name: 'Settings',
    icon: <Settings className='text-orange-500' size={20} />,
    href: '/settings',
    key: 'settings'
  },
  {
    name: 'Get Help',
    icon: <BadgeQuestionMark className='text-orange-500' size={20} />,
    href: '/help'
  },
  {
    name: 'Learn more',
    icon: <BadgeQuestionMark className='text-orange-500' size={20} />,
    href: '/learn_more',
    submenu: [
      { name: 'About Agency', href: '/about' },
      { name: 'Usage policy', href: '/usage-policy' },
      { name: 'Privacy policy', href: '/privacy-policy' }
    ]
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
      name: 'Analytics',
      href: '/analytics',
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
      name: 'Analytics',
      href: '/analytics', // ✅ FIXED - Added href
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
      name: 'Subscription', // ✅ FIXED - Typo: "Subsciption" → "Subscription"
      href: '/settings/subscription',
      icon: <BadgeInfo className='text-orange-500' size={16} />
    }
  ],

  profile: [
    // ✅ ADDED - Profile submenu for consistency
    {
      name: 'View Profile',
      href: '/profile/view',
      icon: <User className='text-orange-500' size={20} />
    },
    {
      name: 'Edit Profile',
      href: '/profile/edit',
      icon: <Settings className='text-orange-500' size={20} />
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
    href: '/blog', // ✅ FIXED - Changed from '/' to '/blog'
    icon: <Newspaper className='text-orange-500' size={20} />
  },
  {
    name: 'Help',
    href: '/help',
    icon: <Info className='text-orange-500' size={20} />
  },
  {
    name: 'Spot Feedback',
    href: '/feedback', // ✅ FIXED - Changed from '/' to '/feedback'
    icon: <Clipboard className='text-orange-500' size={20} />
  }
]
