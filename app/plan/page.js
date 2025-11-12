'use client'

import {
  ArrowLeft,
  Check,
  Crown,
  TrendingUp,
  Users,
  Zap,
  MessageSquare,
  Bot,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { memo, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import LoadingState from '../../components/common/loading-state'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'
import { useLogout } from '../../lib/supabase/auth'
import {
  useSubscriptionUsage,
  useUpgradeSubscription,
  useCancelSubscription
} from '../../lib/hooks/useSubscriptionData'
import SubscriptionsPageSkeleton from '../../components/skeleton/SubscriptionsPageSkeleton'

/**
 * FULLY OPTIMIZED Subscription Settings Page
 *
 * React Query Integration:
 * - Automatic usage data fetching with caching
 * - Optimistic updates for subscription changes
 * - No manual state management
 *
 * Performance:
 * - Memoized components
 * - Static data outside component
 * - Memoized calculations
 * - Optimized rendering
 */

// Static data - defined outside component
const PLANS_DATA = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billing: 'Forever free',
    description: 'Perfect for getting started',
    features: [
      '1 AI Agent',
      '100 conversations/month',
      '1,000 API credits/month',
      'Basic analytics',
      'Community support'
    ],
    color: 'neutral',
    icon: Bot,
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    billing: 'per month',
    description: 'For growing businesses',
    features: [
      'Unlimited AI Agents',
      '10,000 conversations/month',
      '50,000 API credits/month',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Webhook integrations'
    ],
    color: 'orange',
    icon: Zap,
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    billing: 'per month',
    description: 'For large organizations',
    features: [
      'Unlimited everything',
      'Unlimited conversations',
      'Unlimited API credits',
      'Custom analytics',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment'
    ],
    color: 'purple',
    icon: Crown,
    popular: false
  }
]

// Utility functions - pure, can be outside component
const getColorClasses = (color, isSelected) => {
  const colors = {
    neutral: {
      bg: isSelected
        ? 'from-neutral-900/60 to-neutral-950/40'
        : 'from-neutral-900/40 to-neutral-950/20',
      border: isSelected ? 'border-neutral-500/50' : 'border-neutral-600/30',
      badge: 'bg-neutral-900/40 text-neutral-300',
      button: 'bg-neutral-600 hover:bg-neutral-700'
    },
    orange: {
      bg: isSelected
        ? 'from-orange-900/60 to-orange-950/40'
        : 'from-orange-900/40 to-orange-950/20',
      border: isSelected ? 'border-orange-500/50' : 'border-orange-600/30',
      badge: 'bg-orange-900/40 text-orange-300',
      button: 'bg-orange-600 hover:bg-orange-700'
    },
    purple: {
      bg: isSelected
        ? 'from-purple-900/60 to-purple-950/40'
        : 'from-purple-900/40 to-purple-950/20',
      border: isSelected ? 'border-purple-500/50' : 'border-purple-600/30',
      badge: 'bg-purple-900/40 text-purple-300',
      button: 'bg-purple-600 hover:bg-purple-700'
    }
  }
  return colors[color] || colors.neutral
}

const getUsagePercentage = (used, limit) => {
  if (limit === -1) return 0 // Unlimited
  return Math.min((used / limit) * 100, 100)
}

const getUsageColor = (percentage) => {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 75) return 'bg-yellow-500'
  return 'bg-green-500'
}

/**
 * Memoized Usage Metric Component
 */
const UsageMetric = memo(({ icon: Icon, label, used, limit, color }) => {
  const percentage = useMemo(
    () => getUsagePercentage(used, limit),
    [used, limit]
  )

  const barColor = useMemo(() => getUsageColor(percentage), [percentage])

  const isUnlimited = limit === -1
  const showWarning = !isUnlimited && percentage >= 80

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon className={`h-5 w-5 text-${color}-400`} />
          <span className='font-medium text-neutral-200'>{label}</span>
        </div>
        <span className='text-sm text-neutral-400'>
          {used.toLocaleString()}{' '}
          {isUnlimited ? '' : `/ ${limit.toLocaleString()}`}
        </span>
      </div>

      {!isUnlimited && (
        <>
          <div className='h-2 overflow-hidden rounded-full bg-neutral-800'>
            <div
              className={`h-full ${barColor} transition-all`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {showWarning && (
            <div className='flex items-center gap-2 text-xs text-yellow-400'>
              <AlertCircle className='h-3 w-3' />
              <span>Approaching limit</span>
            </div>
          )}
        </>
      )}

      {isUnlimited && <p className='text-xs text-neutral-500'>Unlimited</p>}
    </div>
  )
})
UsageMetric.displayName = 'UsageMetric'

/**
 * Memoized Usage Card Component
 */
const UsageCard = memo(({ usage }) => {
  const period = useMemo(
    () => ({
      start: new Date(usage.period.start).toLocaleDateString(),
      end: new Date(usage.period.end).toLocaleDateString()
    }),
    [usage.period]
  )

  return (
    <Card className='border-purple-600/20 bg-gradient-to-br from-purple-950/10 to-neutral-950/50'>
      <div className='mb-6'>
        <div className='mb-2 flex items-center gap-3'>
          <TrendingUp className='h-5 w-5 text-purple-400' />
          <h2 className='text-xl font-semibold text-neutral-100'>
            Current Usage
          </h2>
        </div>
        <p className='text-sm text-neutral-400'>
          Billing period: {period.start} - {period.end}
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <UsageMetric
          icon={Bot}
          label='AI Agents'
          used={usage.agents.used}
          limit={usage.agents.limit}
          color='orange'
        />
        <UsageMetric
          icon={MessageSquare}
          label='Conversations'
          used={usage.conversations.used}
          limit={usage.conversations.limit}
          color='blue'
        />
        <UsageMetric
          icon={Zap}
          label='API Credits'
          used={usage.apiCredits.used}
          limit={usage.apiCredits.limit}
          color='yellow'
        />
      </div>
    </Card>
  )
})
UsageCard.displayName = 'UsageCard'

/**
 * Memoized Plan Card Component
 */
const PlanCard = memo(({ plan, isCurrentPlan, currentTier, onUpgrade }) => {
  const Icon = plan.icon
  const colors = useMemo(
    () => getColorClasses(plan.color, isCurrentPlan),
    [plan.color, isCurrentPlan]
  )

  const canUpgrade = useMemo(() => {
    if (isCurrentPlan) return false
    const currentIndex = PLANS_DATA.findIndex((p) => p.id === currentTier)
    const planIndex = PLANS_DATA.findIndex((p) => p.id === plan.id)
    return currentTier === 'free' || planIndex > currentIndex
  }, [isCurrentPlan, currentTier, plan.id])

  const handleUpgrade = useCallback(() => {
    onUpgrade(plan.id)
  }, [plan.id, onUpgrade])

  return (
    <Card
      className={`relative border bg-gradient-to-br transition-all ${colors.bg} ${colors.border} ${
        isCurrentPlan ? 'ring-2 ring-offset-2 ring-offset-neutral-950' : ''
      } ${isCurrentPlan && plan.color === 'orange' ? 'ring-orange-500' : ''} ${
        isCurrentPlan && plan.color === 'purple' ? 'ring-purple-500' : ''
      }`}
    >
      {plan.popular && (
        <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
          <span className='rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold text-white'>
            Most Popular
          </span>
        </div>
      )}
      {isCurrentPlan && (
        <div className='absolute -top-3 right-4'>
          <span className='flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white'>
            <Check className='h-3 w-3' />
            Current Plan
          </span>
        </div>
      )}

      <div className='space-y-6'>
        {/* Plan Header */}
        <div>
          <div className='mb-2 flex items-center gap-3'>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.badge}`}
            >
              <Icon className='h-5 w-5' />
            </div>
            <div>
              <h3 className='text-xl font-bold text-neutral-100'>
                {plan.name}
              </h3>
              <p className='text-xs text-neutral-400'>{plan.description}</p>
            </div>
          </div>
        </div>

        {/* Price */}
        <div>
          <div className='flex items-baseline gap-2'>
            <span className='text-4xl font-bold text-neutral-100'>
              ${plan.price}
            </span>
            <span className='text-sm text-neutral-400'>{plan.billing}</span>
          </div>
        </div>

        {/* Features */}
        <ul className='space-y-3'>
          {plan.features.map((feature, idx) => (
            <li key={idx} className='flex items-start gap-3'>
              <Check className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-400' />
              <span className='text-sm text-neutral-300'>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Action Button */}
        <div className='border-t border-neutral-800 pt-6'>
          {isCurrentPlan ? (
            <Button
              disabled
              className='w-full cursor-not-allowed bg-green-600/50'
            >
              Current Plan
            </Button>
          ) : canUpgrade ? (
            <Button
              onClick={handleUpgrade}
              className={`w-full ${colors.button} flex items-center justify-center gap-2`}
            >
              Upgrade to {plan.name}
              <ArrowRight className='h-4 w-4' />
            </Button>
          ) : (
            <Button variant='outline' className='w-full' disabled>
              Downgrade not available
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
})
PlanCard.displayName = 'PlanCard'

/**
 * Memoized Cancel Subscription Card
 */
const CancelSubscriptionCard = memo(({ onCancel }) => {
  return (
    <Card className='border-red-600/20 bg-gradient-to-br from-red-950/10 to-neutral-950/50'>
      <div className='flex items-start gap-4'>
        <AlertCircle className='mt-1 h-6 w-6 flex-shrink-0 text-red-400' />
        <div className='flex-1'>
          <h4 className='mb-2 font-semibold text-neutral-200'>
            Cancel Subscription
          </h4>
          <p className='mb-4 text-sm text-neutral-400'>
            You will lose access to premium features at the end of your billing
            period. Your data will be preserved for 30 days.
          </p>
          <Button
            onClick={onCancel}
            variant='outline'
            className='border-red-600/30 text-red-400 hover:bg-red-900/20'
          >
            Cancel Subscription
          </Button>
        </div>
      </div>
    </Card>
  )
})
CancelSubscriptionCard.displayName = 'CancelSubscriptionCard'

/**
 * Memoized Header Section
 */
const HeaderSection = memo(() => {
  return (
    <div className='mb-8'>
      <div className='mb-2 flex items-center gap-3'>
        <Crown className='h-8 w-8 text-purple-500' />
        <h1 className='text-3xl font-bold text-neutral-100'>
          Subscription Settings
        </h1>
      </div>
      <p className='text-neutral-400'>
        Manage your subscription plan and view usage statistics
      </p>
    </div>
  )
})
HeaderSection.displayName = 'HeaderSection'

/**
 * Memoized Plans Section
 */
const PlansSection = memo(({ currentTier, onUpgrade }) => {
  return (
    <div>
      <h2 className='mb-6 text-2xl font-bold text-neutral-100'>
        Available Plans
      </h2>
      <div className='grid gap-6 lg:grid-cols-3'>
        {PLANS_DATA.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentTier === plan.id}
            currentTier={currentTier}
            onUpgrade={onUpgrade}
          />
        ))}
      </div>
    </div>
  )
})
PlansSection.displayName = 'PlansSection'

/**
 * Main Subscriptions Page Component
 */
export default function SubscriptionsPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const { logout } = useLogout()
  const [delayedLoading, setDelayedLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  // React Query hooks - MUST be called before any conditional returns
  const {
    data: usage,
    isLoading: usageLoading,
    error: usageError
  } = useSubscriptionUsage(user?.id, profile?.subscription_tier)

  const { mutate: upgradeSubscription } = useUpgradeSubscription()
  const { mutate: cancelSubscription } = useCancelSubscription()

  // Memoize current tier
  const currentTier = useMemo(
    () => profile?.subscription_tier || 'free',
    [profile?.subscription_tier]
  )

  // Memoize user profile for SideBarLayout
  const userProfile = useMemo(
    () => ({
      name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
      email: user?.email || 'guest@example.com',
      avatar: profile?.avatar_url || null
    }),
    [profile, user]
  )

  // Stable handlers - MUST be declared before conditional returns
  const handleUpgrade = useCallback(
    async (planId) => {
      upgradeSubscription(
        { userId: user.id, planId },
        {
          onSuccess: async () => {
            await refreshProfile()
            toast.success('Subscription upgraded successfully')
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to upgrade subscription')
          }
        }
      )
    },
    [user?.id, upgradeSubscription, refreshProfile]
  )

  const handleCancelSubscription = useCallback(async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.'
      )
    ) {
      return
    }

    cancelSubscription(
      { userId: user.id },
      {
        onSuccess: async () => {
          await refreshProfile()
          toast.success('Subscription cancelled successfully')
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to cancel subscription')
        }
      }
    )
  }, [user?.id, cancelSubscription, refreshProfile])

  // NOW we can do conditional logic - after all hooks are called
  // Loading state
  if (authLoading || usageLoading) {
    return <YourSkeleton userProfile={userProfile} />
  }
  if (delayedLoading) {
    return (
      <LoadingState
        message={
          authLoading ? 'Authenticating...' : 'Loading subscription settings...'
        }
        className='min-h-screen'
      />
    )
  }

  // Error state
  if (usageError) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <Card className='max-w-md border-red-600/30 bg-gradient-to-br from-red-900/20 to-neutral-950/50'>
          <div className='p-8 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/40'>
              <AlertCircle className='h-8 w-8 text-red-400' />
            </div>
            <h3 className='mb-2 text-xl font-bold text-neutral-100'>Error</h3>
            <p className='text-sm text-neutral-400'>{usageError.message}</p>
            <Button onClick={() => window.location.reload()} className='mt-6'>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
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
              title='Subscription Settings'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
              <HeaderSection />

              <div className='space-y-8'>
                {/* Usage Section */}
                {usage && <UsageCard usage={usage} />}

                {/* Plans Section */}
                <PlansSection
                  currentTier={currentTier}
                  onUpgrade={handleUpgrade}
                />

                {/* Cancel Subscription */}
                {currentTier !== 'free' && (
                  <CancelSubscriptionCard onCancel={handleCancelSubscription} />
                )}
              </div>
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
