'use client'

import {
  Bot,
  Calendar,
  Settings,
  Globe,
  Instagram,
  MessageSquare,
  Users,
  Zap,
  Plus,
  ArrowRight,
  BarChart3,
  Phone
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useEffect, useState } from 'react'
import LoadingState from '../../components/common/loading-state'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'
import { useAgents, useDashboardAnalytics } from '../../lib/hooks/useAgentData'
import { useLogout } from '../../lib/supabase/auth'
import BottomModal from '../../components/ui/modal'
import DashboardSkeleton from '../../components/skeleton/DashboardSkeleton'
/**
 * Memoized Agent Card Component - Uses Interface field
 */
const AgentCard = memo(({ agent, onClick }) => {
  const getInterfaceIcon = () => {
    const iconProps = 'h-5 w-5'
    const icons = {
      instagram: <Instagram className={iconProps} />,
      sms: <Phone className={iconProps} />,
      website: <Globe className={iconProps} />,
      default: <Bot className={iconProps} />
    }
    return icons[agent.interface] || icons.default
  }

  const getInterfaceColors = () => {
    const colors = {
      instagram:
        'from-pink-900/40 to-pink-950/20 border-pink-600/30 text-pink-300',
      sms: 'from-sky-900/40 to-sky-950/20 border-sky-600/30 text-sky-300',
      website:
        'from-purple-900/40 to-purple-950/20 border-purple-600/30 text-purple-300',
      default:
        'from-orange-900/40 to-orange-950/20 border-orange-600/30 text-orange-300'
    }
    return colors[agent.interface] || colors.default
  }

  const getIconBgColor = () => {
    const colors = {
      instagram: 'bg-pink-900/50',
      sms: 'bg-sky-900/30',
      website: 'bg-purple-900/50',
      default: 'bg-orange-900/50'
    }
    return colors[agent.interface] || colors.default
  }
  const getInterfaceLabel = () => {
    const labels = {
      instagram: 'Instagram DM',
      sms: 'SMS Bot',
      website: 'Website Widget',
      default: 'AI Agent'
    }
    return labels[agent.interface] || labels.default
  }

  return (
    <Card
      className={`group cursor-pointer border bg-gradient-to-br transition-all hover:scale-105 hover:shadow-lg ${getInterfaceColors()}`}
      onClick={onClick}
    >
      <div className='space-y-4'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${getIconBgColor()}`}
            >
              {getInterfaceIcon()}
            </div>
            <div>
              <h4 className='font-semibold text-neutral-100'>{agent.name}</h4>
              <p className='text-xs text-neutral-400'>{getInterfaceLabel()}</p>
            </div>
          </div>
          <div
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              agent.is_active
                ? 'bg-green-900/40 text-green-300 ring-1 ring-green-500/50'
                : 'bg-red-900/40 text-red-300 ring-1 ring-red-500/50'
            }`}
          >
            {agent.is_active ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Description */}
        <p className='line-clamp-2 text-sm text-neutral-400'>
          {agent.description || 'No description provided'}
        </p>

        {/* Domain & Model Pills */}
        {(agent.domain || agent.model) && (
          <div className='flex flex-wrap gap-2'>
            {agent.domain && (
              <span className='rounded-full bg-neutral-900/50 px-2 py-1 text-xs text-neutral-400 capitalize'>
                {agent.domain}
              </span>
            )}
            {agent.model && (
              <span className='rounded-full bg-neutral-900/50 px-2 py-1 text-xs text-neutral-400'>
                {agent.model}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-neutral-800/50 pt-4'>
          <div className='flex items-center gap-4 text-xs text-neutral-500'>
            <div className='flex items-center gap-1'>
              <MessageSquare className='h-3 w-3' />
              <span>{agent.conversation_count || 0}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Users className='h-3 w-3' />
              <span>{agent.user_count || 0}</span>
            </div>
          </div>
          <ArrowRight className='h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1' />
        </div>
      </div>
    </Card>
  )
})
AgentCard.displayName = 'AgentCard'

/**
 * Memoized Quick Action Card Component - FIXED with proper Tailwind classes
 */
const QuickActionCard = memo(({ href, icon: Icon, variant = 'orange' }) => {
  // Predefined complete class strings for each variant
  const variantStyles = {
    orange: {
      card: 'group cursor-pointer border-orange-600/20 transition-all hover:border-orange-600/50 hover:bg-orange-950/10',
      iconBg:
        'flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/40',
      icon: 'h-5 w-5 text-orange-400'
    },
    blue: {
      card: 'group cursor-pointer border-blue-600/20 transition-all hover:border-blue-600/50 hover:bg-blue-950/10',
      iconBg:
        'flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900/40',
      icon: 'h-5 w-5 text-blue-400'
    },
    green: {
      card: 'group cursor-pointer border-green-600/20 transition-all hover:border-green-600/50 hover:bg-green-950/10',
      iconBg:
        'flex h-10 w-10 items-center justify-center rounded-lg bg-green-900/40',
      icon: 'h-5 w-5 text-green-400'
    },
    purple: {
      card: 'group cursor-pointer border-purple-600/20 transition-all hover:border-purple-600/50 hover:bg-purple-950/10',
      iconBg:
        'flex h-10 w-10 items-center justify-center rounded-lg bg-purple-900/40',
      icon: 'h-5 w-5 text-purple-400'
    }
  }

  const styles = variantStyles[variant] || variantStyles.orange

  // Labels for each quick action
  const labels = {
    orange: { title: 'View All Agents', subtitle: 'Manage agents' },
    blue: { title: 'Workflows', subtitle: 'Automation' },
    green: { title: 'Analytics', subtitle: 'View insights' },
    purple: { title: 'Settings', subtitle: 'Configure' }
  }

  const label = labels[variant] || labels.orange

  return (
    <Link href={href}>
      <Card className={styles.card}>
        <div className='flex items-center gap-3'>
          <div className={styles.iconBg}>
            <Icon className={styles.icon} />
          </div>
          <div>
            <p className='font-semibold text-neutral-200'>{label.title}</p>
            <p className='text-xs text-neutral-400'>{label.subtitle}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
})
QuickActionCard.displayName = 'QuickActionCard'

/**
 * Main Dashboard Component
 */
export default function Dashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()
  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }
  const [isAgentCardOpen, setIsAgentCardOpen] = useState(false)

  // React Query hooks - MUST be called before any conditional returns
  const {
    data: agents = [],
    isLoading: agentsLoading,
    error: agentsError
  } = useAgents(user?.id)
  const [delayedLoading, setDelayedLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  const { data: analytics, isLoading: analyticsLoading } =
    useDashboardAnalytics(agents)

  // Handle agent click
  const handleAgentClick = useCallback(
    (agentId) => {
      router.push(`/agents/${agentId}/manage`)
    },
    [router]
  )

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  const handleNewAgent = useCallback(() => {
    setIsAgentCardOpen(false)
  }, [])

  // Loading state
  if (delayedLoading) {
    return (
      <LoadingState
        message={authLoading ? 'Authenticating...' : 'Loading dashboard...'}
        className='min-h-screen'
      />
    )
  }
  if (authLoading) {
    return <DashboardSkeleton userProfile={userProfile} />
  }
  // Error state
  if (agentsError) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <Card className='max-w-md border-red-600/30 bg-gradient-to-br from-red-900/20 to-neutral-950/50'>
          <div className='p-8 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/40'>
              <Bot className='h-8 w-8 text-red-400' />
            </div>
            <h3 className='mb-2 text-xl font-bold text-neutral-100'>Error</h3>
            <p className='text-sm text-neutral-400'>{agentsError.message}</p>
            <Button onClick={() => window.location.reload()} className='mt-6'>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              title='AI Agency'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Welcome Section */}
              <div className='mb-8 text-center'>
                <h1 className='mb-2 text-4xl font-bold text-neutral-100 sm:text-5xl'>
                  Welcome back,
                </h1>
                <h2 className='mb-3 text-3xl font-bold text-orange-500 sm:text-4xl'>
                  {profile?.full_name || user?.email?.split('@')[0] || 'User'}!
                </h2>
                <p className='text-neutral-400'>
                  Manage your AI agents and monitor their performance
                </p>
              </div>

              {/* Agents Section */}
              <div className='mb-8'>
                <div className='mb-6 flex items-center justify-between'>
                  <div>
                    <h3 className='text-2xl font-bold text-neutral-100'>
                      Your Agents
                    </h3>
                    <p className='mt-1 text-sm text-neutral-400'>
                      Manage and deploy your AI agents
                    </p>
                  </div>

                  <Button
                    onClick={() => setIsAgentCardOpen(true)}
                    className='flex items-center gap-2'
                  >
                    <Plus className='h-4 w-4' />
                    Create Agent
                  </Button>
                </div>

                {agents.length === 0 ? (
                  // Empty State
                  <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
                    <div className='flex flex-col items-center py-12 text-center'>
                      <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-900/40'>
                        <Bot className='h-8 w-8 text-orange-400' />
                      </div>
                      <h4 className='mb-2 text-lg font-semibold text-neutral-200'>
                        No agents yet
                      </h4>
                      <p className='mb-6 text-sm text-neutral-400'>
                        Create your first AI agent to get started
                      </p>

                      <Button onClick={() => setIsAgentCardOpen(true)}>
                        <Plus className='mr-2 h-4 w-4' />
                        Create Your First Agent
                      </Button>
                    </div>
                  </Card>
                ) : (
                  // Agents Grid
                  <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {agents.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        onClick={() => handleAgentClick(agent.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions - FIXED with proper variant prop */}
              {agents.length > 0 && (
                <div className='mb-8'>
                  <h3 className='mb-4 text-xl font-bold text-neutral-100'>
                    Quick Actions
                  </h3>
                  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    <QuickActionCard
                      href='/agents/dashboard'
                      icon={Bot}
                      variant='orange'
                    />
                    <QuickActionCard
                      href='/workflows'
                      icon={Zap}
                      variant='blue'
                    />
                    <QuickActionCard
                      href='/analytics'
                      icon={BarChart3}
                      variant='green'
                    />
                    <QuickActionCard
                      href='/settings'
                      icon={Users}
                      variant='purple'
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SideBarLayout>

      <BottomModal isOpen={isAgentCardOpen} onClose={handleNewAgent}>
        <div className='space-y-6'>
          <div className='text-center'>
            <h3 className='mb-2 text-2xl font-bold text-neutral-100'>
              Create New Agent
            </h3>
            <p className='text-sm text-neutral-400'>
              Choose how you want to build your agent
            </p>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <Link href='/agents/create-nlp'>
              <button className='group w-full rounded-lg border-2 border-blue-600/30 bg-gradient-to-br from-blue-900/20 to-blue-950/10 p-6 text-left transition-all hover:scale-105 hover:border-blue-500/50 hover:from-blue-900/30 hover:to-blue-950/20'>
                <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-900/40'>
                  <Zap className='h-6 w-6 text-blue-400' />
                </div>
                <h4 className='mb-2 text-lg font-bold text-neutral-100'>
                  AI Build
                </h4>
                <p className='text-sm text-neutral-400'>
                  Let AI help you build your agent with natural language
                </p>
              </button>
            </Link>

            <Link href='/agents/create'>
              <button className='group w-full rounded-lg border-2 border-purple-600/30 bg-gradient-to-br from-purple-900/20 to-purple-950/10 p-6 text-left transition-all hover:scale-105 hover:border-purple-500/50 hover:from-purple-900/30 hover:to-purple-950/20'>
                <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-900/40'>
                  <Settings className='h-6 w-6 text-purple-400' />
                </div>
                <h4 className='mb-2 text-lg font-bold text-neutral-100'>
                  Custom Build
                </h4>
                <p className='text-sm text-neutral-400'>
                  Build your agent from scratch with full customization
                </p>
              </button>
            </Link>
          </div>
        </div>
      </BottomModal>
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
