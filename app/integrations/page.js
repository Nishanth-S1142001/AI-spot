'use client'

import {
  Activity,
  AlertCircle,
  Blocks,
  Bot,
  Briefcase,
  Check,
  CreditCard,
  Mail,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Truck,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useMemo, useState } from 'react'
import LoadingState from '../../components/common/loading-state'
import SearchBar from '../../components/common/search-bar'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Button from '../../components/ui/button'
import {
  useIntegrations,
  useIntegrationStats
} from '../../lib/hooks/useIntegrationData'
import { useLogout } from '../../lib/supabase/auth'
import IntegrationsPageSkeleton from '../../components/skeleton/IntegrationsPageSkeleton'

// ============================================
// CONSTANTS
// ============================================

const CATEGORIES = [
  { id: 'all', name: 'All', icon: <Blocks size={18} /> },
  { id: 'payment', name: 'Payment', icon: <CreditCard size={18} /> },
  {
    id: 'communication',
    name: 'Communication',
    icon: <MessageSquare size={18} />
  },
  { id: 'email', name: 'Email', icon: <Mail size={18} /> },
  { id: 'business', name: 'Business', icon: <Briefcase size={18} /> },
  { id: 'ecommerce', name: 'Ecommerce', icon: <ShoppingCart size={18} /> },
  { id: 'logistics', name: 'Logistics', icon: <Truck size={18} /> },
  { id: 'ai', name: 'AI', icon: <Bot size={18} /> },
  { id: 'custom', name: 'Custom', icon: <Zap size={18} /> }
]

const AVAILABLE_INTEGRATIONS = [
  // Payment - India
  {
    id: 'razorpay',
    name: 'Razorpay',
    category: 'payment',
    region: 'india',
    description: 'Accept payments via UPI, Cards, Netbanking',
    logo: '💳',
    color: 'blue',
    tier: 'free'
  },
  {
    id: 'cashfree',
    name: 'Cashfree',
    category: 'payment',
    region: 'india',
    description: 'Payment gateway for Indian businesses',
    logo: '💰',
    color: 'green',
    tier: 'free'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    category: 'payment',
    region: 'india',
    description: 'Digital payments and UPI',
    logo: '📱',
    color: 'blue',
    tier: 'free'
  },
  // Payment - Global
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payment',
    region: 'global',
    description: 'Global payment processing',
    logo: '💸',
    color: 'purple',
    tier: 'free'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'payment',
    region: 'global',
    description: 'Send and receive payments worldwide',
    logo: '💵',
    color: 'blue',
    tier: 'free'
  },
  // Communication - India
  {
    id: 'whatsapp_official',
    name: 'WhatsApp (Official)',
    category: 'communication',
    region: 'global',
    description: 'Meta Cloud API for WhatsApp Business',
    logo: '✅',
    color: 'green',
    tier: 'paid'
  },
  {
    id: 'msg91',
    name: 'MSG91',
    category: 'communication',
    region: 'india',
    description: 'SMS, OTP, and WhatsApp messaging',
    logo: '📧',
    color: 'orange',
    tier: 'paid'
  },
  {
    id: 'gupshup',
    name: 'Gupshup',
    category: 'communication',
    region: 'india',
    description: 'Conversational messaging platform',
    logo: '💬',
    color: 'blue',
    tier: 'paid'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'communication',
    region: 'global',
    description: 'SMS, Voice, and WhatsApp',
    logo: '📞',
    color: 'red',
    tier: 'paid'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'communication',
    region: 'global',
    description: 'Telegram Bot API',
    logo: '✈️',
    color: 'blue',
    tier: 'free'
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'communication',
    region: 'global',
    description: 'Discord Bot integration',
    logo: '🎮',
    color: 'indigo',
    tier: 'free'
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    region: 'global',
    description: 'Team communication',
    logo: '💼',
    color: 'purple',
    tier: 'free'
  },
  // Email
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'email',
    region: 'global',
    description: 'Send and receive emails',
    logo: '📮',
    color: 'red',
    tier: 'free'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'email',
    region: 'global',
    description: 'Email delivery platform',
    logo: '✉️',
    color: 'blue',
    tier: 'free'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'email',
    region: 'global',
    description: 'Email marketing',
    logo: '🐒',
    color: 'yellow',
    tier: 'free'
  },
  // Business Tools
  {
    id: 'zoho_crm',
    name: 'Zoho CRM',
    category: 'business',
    region: 'india',
    description: 'Customer relationship management',
    logo: '🏢',
    color: 'orange',
    tier: 'free'
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    category: 'business',
    region: 'india',
    description: 'Customer support software',
    logo: '🎫',
    color: 'green',
    tier: 'free'
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'business',
    region: 'global',
    description: 'Workspace and notes',
    logo: '📝',
    color: 'gray',
    tier: 'free'
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    category: 'business',
    region: 'global',
    description: 'Spreadsheets and data',
    logo: '📊',
    color: 'green',
    tier: 'free'
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'business',
    region: 'global',
    description: 'Database and spreadsheets',
    logo: '🗂️',
    color: 'orange',
    tier: 'free'
  },
  // Ecommerce
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'ecommerce',
    region: 'global',
    description: 'Ecommerce platform',
    logo: '🛒',
    color: 'green',
    tier: 'free'
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    category: 'ecommerce',
    region: 'global',
    description: 'WordPress ecommerce',
    logo: '🛍️',
    color: 'purple',
    tier: 'free'
  },
  // Logistics
  {
    id: 'shiprocket',
    name: 'Shiprocket',
    category: 'logistics',
    region: 'india',
    description: 'Shipping and logistics',
    logo: '📦',
    color: 'blue',
    tier: 'free'
  },
  {
    id: 'delhivery',
    name: 'Delhivery',
    category: 'logistics',
    region: 'india',
    description: 'Logistics and delivery',
    logo: '🚚',
    color: 'red',
    tier: 'free'
  },
  // AI Services
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    region: 'global',
    description: 'GPT models and AI',
    logo: '🤖',
    color: 'green',
    tier: 'paid'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'ai',
    region: 'global',
    description: 'Claude AI models',
    logo: '🧠',
    color: 'orange',
    tier: 'paid'
  },
  {
    id: 'google_gemini',
    name: 'Google Gemini',
    category: 'ai',
    region: 'global',
    description: 'Google AI models',
    logo: '✨',
    color: 'blue',
    tier: 'paid'
  },
  // Custom
  {
    id: 'custom_api',
    name: 'Custom API',
    category: 'custom',
    region: 'global',
    description: 'Connect any custom API',
    logo: '⚡',
    color: 'gray',
    tier: 'free'
  }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

const getColorClasses = (color) => {
  const colors = {
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    green: 'border-green-500/20 bg-green-500/10 text-green-400',
    orange: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
    purple: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
    red: 'border-red-500/20 bg-red-500/10 text-red-400',
    yellow: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
    indigo: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400',
    gray: 'border-neutral-500/20 bg-neutral-500/10 text-neutral-400'
  }
  return colors[color] || colors.gray
}

// ============================================
// MEMOIZED COMPONENTS
// ============================================

/**
 * Stats Card Component
 */
const StatsCard = memo(({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    orange: 'border-orange-600/20 from-orange-900/20 text-orange-400',
    blue: 'border-blue-600/20 from-blue-900/20 text-blue-400',
    green: 'border-green-600/20 from-green-900/20 text-green-400',
    purple: 'border-purple-600/20 from-purple-900/20 text-purple-400'
  }

  const iconBgClasses = {
    orange: 'bg-orange-900/40',
    blue: 'bg-blue-900/40',
    green: 'bg-green-900/40',
    purple: 'bg-purple-900/40'
  }

  return (
    <div
      className={`rounded-xl border ${colorClasses[color]} bg-gradient-to-br to-neutral-950/50 p-6 transition-all hover:scale-105`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-neutral-400'>{label}</p>
          <p className='mt-2 text-3xl font-bold'>{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgClasses[color]}`}
        >
          <Icon className='h-6 w-6' />
        </div>
      </div>
    </div>
  )
})
StatsCard.displayName = 'StatsCard'

/**
 * Integration Card Component
 */
const IntegrationCard = memo(({ integration, isConnected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className='group relative cursor-pointer overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition-all hover:scale-[1.02] hover:border-neutral-700 hover:bg-neutral-900 hover:shadow-xl'
    >
      {/* Connected Badge */}
      {isConnected && (
        <div className='absolute top-3 right-3'>
          <div className='flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-green-500/50'>
            <Check size={12} />
            Connected
          </div>
        </div>
      )}

      {/* Icon */}
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border text-2xl transition-transform group-hover:scale-110 ${getColorClasses(integration.color)}`}
      >
        {integration.logo}
      </div>

      {/* Content */}
      <h3 className='mb-2 text-lg font-semibold text-neutral-100 transition-colors group-hover:text-orange-400'>
        {integration.name}
      </h3>
      <p className='mb-4 line-clamp-2 text-sm text-neutral-400'>
        {integration.description}
      </p>

      {/* Metadata */}
      <div className='mb-4 flex items-center gap-3 text-xs text-neutral-500'>
        <span className='flex items-center gap-1'>
          {integration.region === 'india' ? '🇮🇳' : '🌍'}
          {integration.region === 'india' ? 'India' : 'Global'}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 ${
            integration.tier === 'free'
              ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/30'
              : 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/30'
          }`}
        >
          {integration.tier === 'free' ? 'Free' : 'Paid'}
        </span>
      </div>

      {/* Action Button */}
      <Button
        className={`w-full rounded-lg border py-2 text-sm font-medium transition-all ${
          isConnected
            ? 'hover:bg-neutral-750 border-neutral-700 bg-neutral-800 text-neutral-300'
            : 'border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
        }`}
      >
        {isConnected ? 'Manage' : 'Connect'}
      </Button>
    </div>
  )
})
IntegrationCard.displayName = 'IntegrationCard'

/**
 * Category Filter Button
 */
const CategoryButton = memo(({ category, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
        isSelected
          ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-lg shadow-orange-500/20'
          : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800'
      }`}
    >
      {category.icon}
      <span>{category.name}</span>
    </button>
  )
})
CategoryButton.displayName = 'CategoryButton'

// ============================================
// MAIN COMPONENT
// ============================================

export default function IntegrationsPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }
  const { logout } = useLogout()

  // React Query hooks
  const { data: connectedIntegrations = [], isLoading } = useIntegrations(
    user?.id
  )
  const stats = useIntegrationStats(connectedIntegrations)
  const [delayedLoading, setDelayedLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Check if integration is connected
  const isConnected = useCallback(
    (integrationId) => {
      return connectedIntegrations.some(
        (i) => i.integration_type === integrationId
      )
    },
    [connectedIntegrations]
  )

  // Filter integrations based on search and category
  const filteredIntegrations = useMemo(() => {
    return AVAILABLE_INTEGRATIONS.filter((integration) => {
      const matchesSearch =
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === 'all' || integration.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  // Handlers
  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
  }, [])

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId)
  }, [])

  const handleIntegrationClick = useCallback(
    (integrationId) => {
      router.push(`/integrations/${integrationId}`)
    },
    [router]
  )
  if (delayedLoading) {
    return <LoadingState message='Loading Integrations..' />
  }
  if (isLoading) {
    return <YourSkeleton userProfile={userProfile} />
  }
  return (
    <>
      {/* Fixed Background - Place outside SideBarLayout */}
      <NeonBackground />

      <SideBarLayout userProfile={userProfile}>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
          <NavigationBar
            profile={profile}
            title='Integration Manager'
            onLogOutClick={logout}
          />
        </div>

        {/* Main Content */}
        <div className='custom-scrollbar min-h-screen overflow-y-auto font-mono'>
          <div className='mx-auto max-w-7xl px-6 py-8'>
            {/* Stats Grid */}
            {connectedIntegrations.length > 0 && (
              <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <StatsCard
                  icon={Blocks}
                  label='Total Available'
                  value={AVAILABLE_INTEGRATIONS.length}
                  color='orange'
                />
                <StatsCard
                  icon={Check}
                  label='Connected'
                  value={stats.connected}
                  color='green'
                />
                <StatsCard
                  icon={Activity}
                  label='Active'
                  value={stats.connected}
                  color='blue'
                />
                <StatsCard
                  icon={TrendingUp}
                  label='Categories'
                  value={Object.keys(stats.byCategory).length}
                  color='purple'
                />
              </div>
            )}

            {/* Search and Filter */}
            <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              {/* Search */}
              <div className='w-full lg:w-96'>
                <SearchBar
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder='Search integrations...'
                  variant='orange'
                  debounceMs={300}
                />
              </div>

              {/* Category Filter */}
              <div className='flex gap-2 overflow-x-auto pb-2 lg:pb-0'>
                {CATEGORIES.map((category) => (
                  <CategoryButton
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory === category.id}
                    onClick={() => handleCategoryChange(category.id)}
                  />
                ))}
              </div>
            </div>

            {/* Integrations Grid */}
            {isLoading ? (
              <LoadingState message='Loading integrations...' />
            ) : filteredIntegrations.length === 0 ? (
              <div className='flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/50 p-12 text-center'>
                <div className='mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-900/40'>
                  <AlertCircle className='h-10 w-10 text-orange-400' />
                </div>
                <h3 className='mb-2 text-xl font-semibold text-neutral-200'>
                  No integrations found
                </h3>
                <p className='mb-6 max-w-md text-sm text-neutral-400'>
                  {searchQuery
                    ? `No integrations match your search for "${searchQuery}"`
                    : 'Try adjusting your filter criteria'}
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery('')}
                    className='rounded-lg border border-orange-500/50 bg-orange-500/10 px-6 py-2 text-sm font-medium text-orange-400 transition-all hover:bg-orange-500/20'
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {filteredIntegrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    isConnected={isConnected(integration.id)}
                    onClick={() => handleIntegrationClick(integration.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Custom Scrollbar */}
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

          .overflow-x-auto::-webkit-scrollbar {
            height: 2px;
          }

          .overflow-x-auto::-webkit-scrollbar-track {
            background: rgba(23, 23, 23, 0.3);
            border-radius: 3px;
          }

          .overflow-x-auto::-webkit-scrollbar-thumb {
            background: rgba(245, 158, 11, 0.3);
            border-radius: 3px;
            transition: background 0.2s;
          }

          .overflow-x-auto::-webkit-scrollbar-thumb:hover {
            background: rgba(245, 158, 11, 0.5);
          }
        `}</style>
      </SideBarLayout>
    </>
  )
}
