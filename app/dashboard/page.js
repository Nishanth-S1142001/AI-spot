'use client'

import {
  Bot,
  Calendar,
  Globe,
  Instagram,
  MessageSquare,
  Users,
  Zap,
  Plus,
  ArrowRight,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useEffect } from 'react'
import LoadingState from '../../components/common/loading-state'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'
import { useAgents, useDashboardAnalytics } from '../../lib/hooks/useAgentData'
import { useLogout } from '../../lib/supabase/auth'

/**
 * FULLY OPTIMIZED Dashboard Component
 * 
 * React Query Integration:
 * - Automatic data fetching with caching
 * - No manual state management
 * - Consistent with all other pages
 * - Auto-refresh on data changes
 * 
 * Performance:
 * - Memoized components
 * - Smart caching prevents re-fetching
 * - Parallel data loading
 * - Optimized rendering
 */

/**
 * Memoized Agent Card Component
 */
const AgentCard = memo(({ agent, onClick }) => {
  const getPurposeIcon = () => {
    const icons = {
      instagram: <Instagram className='h-5 w-5' />,
      messenger: <MessageSquare className='h-5 w-5' />,
      calendar: <Calendar className='h-5 w-5' />,
      website: <Globe className='h-5 w-5' />,
      default: <Bot className='h-5 w-5' />
    }
    return icons[agent.purpose] || icons.default
  }

  const getPurposeColors = () => {
    const colors = {
      instagram:
        'from-pink-900/40 to-pink-950/20 border-pink-600/30 text-pink-300',
      messenger:
        'from-blue-900/40 to-blue-950/20 border-blue-600/30 text-blue-300',
      calendar:
        'from-green-900/40 to-green-950/20 border-green-600/30 text-green-300',
      website:
        'from-purple-900/40 to-purple-950/20 border-purple-600/30 text-purple-300',
      default:
        'from-neutral-900/40 to-neutral-950/20 border-neutral-600/30 text-neutral-300'
    }
    return colors[agent.purpose] || colors.default
  }

  return (
    <Card
      className={`group cursor-pointer border bg-gradient-to-br transition-all hover:scale-105 hover:shadow-lg ${getPurposeColors()}`}
      onClick={onClick}
    >
      <div className='space-y-4'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900/50'>
              {getPurposeIcon()}
            </div>
            <div>
              <h4 className='font-semibold text-neutral-100'>
                {agent.name}
              </h4>
              <p className='text-xs text-neutral-400 capitalize'>
                {agent.purpose || 'General'}
              </p>
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
 * Memoized Quick Action Card Component
 */
const QuickActionCard = memo(({ href, icon: Icon, iconColor, borderColor, hoverColor, title, subtitle }) => (
  <Link href={href}>
    <Card className={`group cursor-pointer border-${borderColor}/20 transition-all hover:border-${borderColor}/50 hover:bg-${hoverColor}/10`}>
      <div className='flex items-center gap-3'>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${iconColor}/40`}>
          <Icon className={`h-5 w-5 text-${iconColor}`} />
        </div>
        <div>
          <p className='font-semibold text-neutral-200'>{title}</p>
          <p className='text-xs text-neutral-400'>{subtitle}</p>
        </div>
      </div>
    </Card>
  </Link>
))
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
  // React Query hooks - MUST be called before any conditional returns
  // React Query hooks - MUST be called before any conditional returns
  const {
    data: agents = [],
    isLoading: agentsLoading,
    error: agentsError
  } = useAgents(user?.id)

  const {
    data: analytics,
    isLoading: analyticsLoading
  } = useDashboardAnalytics(agents)

  // Handle agent click - MUST be declared before conditional returns
  const handleAgentClick = useCallback((agentId) => {
    router.push(`/agents/${agentId}/manage`)
  }, [router])

  // NOW we can do conditional logic - after all hooks are called
  // Redirect if not authenticated using useEffect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Loading state
  if (authLoading || agentsLoading) {
    return (
      <LoadingState
        message={authLoading ? 'Authenticating...' : 'Loading dashboard...'}
        className='min-h-screen'
      />
    )
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

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
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
                  <Link href='/agents/create-nlp'>
                    <Button className='flex items-center gap-2'>
                      <Plus className='h-4 w-4' />
                      Create Agent
                    </Button>
                  </Link>
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
                      <Link href='/agents/create-nlp'>
                        <Button>
                          <Plus className='mr-2 h-4 w-4' />
                          Create Your First Agent
                        </Button>
                      </Link>
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

              {/* Quick Actions */}
              {agents.length > 0 && (
                <div className='mb-8'>
                  <h3 className='mb-4 text-xl font-bold text-neutral-100'>
                    Quick Actions
                  </h3>
                  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    <QuickActionCard
                      href='/agents/dashboard'
                      icon={Bot}
                      iconColor='orange-400'
                      borderColor='orange-600'
                      hoverColor='orange-950'
                      title='View All Agents'
                      subtitle='Manage agents'
                    />
                    <QuickActionCard
                      href='/workflows'
                      icon={Zap}
                      iconColor='blue-400'
                      borderColor='blue-600'
                      hoverColor='blue-950'
                      title='Workflows'
                      subtitle='Automation'
                    />
                    <QuickActionCard
                      href='/analytics'
                      icon={BarChart3}
                      iconColor='green-400'
                      borderColor='green-600'
                      hoverColor='green-950'
                      title='Analytics'
                      subtitle='View insights'
                    />
                    <QuickActionCard
                      href='/settings'
                      icon={Users}
                      iconColor='purple-400'
                      borderColor='purple-600'
                      hoverColor='purple-950'
                      title='Settings'
                      subtitle='Configure'
                    />
                  </div>
                </div>
              )}
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