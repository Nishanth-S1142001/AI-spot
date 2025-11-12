'use client'

import {
  CreditCard,
  Crown,
  Settings as SettingsIcon,
  Shield,
  User
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, useEffect, useMemo } from 'react'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import SettingsPageSkeleton from '../../components/skeleton/SettingsPageSkeleton'
import NeonBackground from '../../components/ui/background'
import Card from '../../components/ui/card'
import { useLogout } from '../../lib/supabase/auth'

/**
 * FULLY OPTIMIZED Settings Overview Page
 *
 * Optimizations:
 * - Memoized components for better performance
 * - Stable data structures with useMemo
 * - Pure utility functions outside component
 * - Proper hook ordering
 */

// Pure utility functions - outside component for better performance
const getColorClasses = (color) => {
  const colors = {
    orange: {
      bg: 'from-orange-900/40 to-orange-950/20',
      border: 'border-orange-600/30',
      icon: 'bg-orange-900/40 text-orange-400',
      hover: 'hover:border-orange-600/50'
    },
    blue: {
      bg: 'from-blue-900/40 to-blue-950/20',
      border: 'border-blue-600/30',
      icon: 'bg-blue-900/40 text-blue-400',
      hover: 'hover:border-blue-600/50'
    },
    purple: {
      bg: 'from-purple-900/40 to-purple-950/20',
      border: 'border-purple-600/30',
      icon: 'bg-purple-900/40 text-purple-400',
      hover: 'hover:border-purple-600/50'
    }
  }
  return colors[color] || colors.orange
}

/**
 * Memoized Settings Card Component
 * Only re-renders when section data changes
 */
const SettingsCard = memo(({ section }) => {
  const colors = useMemo(() => getColorClasses(section.color), [section.color])
  const Icon = section.icon

  return (
    <Link href={section.href}>
      <Card
        className={`group cursor-pointer border bg-gradient-to-br transition-all hover:scale-[1.02] hover:shadow-lg ${colors.bg} ${colors.border} ${colors.hover}`}
      >
        <div className='space-y-4'>
          {/* Header */}
          <div className='flex items-start gap-4'>
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${colors.icon}`}
            >
              <Icon className='h-6 w-6' />
            </div>
            <div className='flex-1'>
              <h3 className='mb-1 text-xl font-bold text-neutral-100'>
                {section.title}
              </h3>
              <p className='text-sm text-neutral-400'>{section.description}</p>
            </div>
          </div>

          {/* Items List */}
          <div className='space-y-2 pl-16'>
            {section.items.map((item, idx) => (
              <div
                key={idx}
                className='flex items-center gap-2 text-sm text-neutral-500'
              >
                <div className='h-1.5 w-1.5 rounded-full bg-neutral-600' />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
})
SettingsCard.displayName = 'SettingsCard'

/**
 * Memoized Header Section
 */
const HeaderSection = memo(() => {
  return (
    <div className='mb-8'>
      <div className='mb-2 flex items-center gap-3'>
        <SettingsIcon className='h-8 w-8 text-orange-500' />
        <h1 className='text-4xl font-bold text-neutral-100'>Settings</h1>
      </div>
      <p className='text-neutral-400'>
        Manage your account settings and preferences
      </p>
    </div>
  )
})
HeaderSection.displayName = 'HeaderSection'

/**
 * Memoized Security Info Section
 */
const SecurityInfoSection = memo(() => {
  return (
    <div className='mt-8 rounded-lg border border-neutral-800/50 bg-neutral-900/20 p-6'>
      <div className='flex items-start gap-4'>
        <Shield className='mt-1 h-6 w-6 flex-shrink-0 text-green-400' />
        <div>
          <h4 className='mb-2 font-semibold text-neutral-200'>
            Your data is secure
          </h4>
          <p className='text-sm text-neutral-400'>
            We use industry-standard encryption to protect your data. Your
            personal information is never shared with third parties without your
            consent.
          </p>
        </div>
      </div>
    </div>
  )
})
SecurityInfoSection.displayName = 'SecurityInfoSection'

/**
 * Main Settings Overview Page Component
 */
export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()
  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }
  // Memoize settings sections to prevent recreation on every render
  const settingsSections = useMemo(
    () => [
      {
        title: 'General',
        description:
          'Manage your profile, account preferences, and security settings',
        icon: User,
        href: '/settings/general',
        color: 'orange',
        items: [
          'Profile Information',
          'Password & Security',
          'Notification Preferences'
        ]
      },
      {
        title: 'Billing',
        description:
          'View and manage your payment methods, invoices, and billing history',
        icon: CreditCard,
        href: '/settings/billing',
        color: 'blue',
        items: ['Payment Methods', 'Billing History', 'Invoices']
      },
      {
        title: 'Subscription',
        description:
          'Manage your subscription plan, view usage, and upgrade options',
        icon: Crown,
        href: '/settings/subscription',
        color: 'purple',
        items: ['Current Plan', 'Usage Statistics', 'Upgrade Options']
      }
    ],
    []
  )

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  const [delayedLoading, setDelayedLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  // Loading state - after all hooks
  if (delayedLoading || authLoading) {
    return <SettingsPageSkeleton userProfile={userProfile} />
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              title='Settings'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
              <HeaderSection />

              {/* Settings Cards Grid */}
              <div className='grid gap-6 lg:grid-cols-2'>
                {settingsSections.map((section) => (
                  <SettingsCard key={section.title} section={section} />
                ))}
              </div>

              <SecurityInfoSection />
            </div>
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(23, 23, 23, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 4px;
          transition: background 0.2s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.5);
        }
      `}</style>
    </>
  )
}
