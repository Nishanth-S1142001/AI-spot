'use client'

import { format } from 'date-fns'
import {
  Bot,
  Plus,
  Settings,
  Zap,
  TrendingUp,
  Activity,
  Edit,
  PlaySquare,
  Webhook,
  TestTube,
  Workflow,
  ArrowRight,
  MessageSquare,
  Instagram,
  Calendar,
  Globe,
  Phone
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, memo, useMemo, useCallback, useEffect } from 'react'
import LoadingState from '../../../components/common/loading-state'
import NavigationBar from '../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../components/providers/AuthProvider'
import SideBarLayout from '../../../components/sideBarLayout'
import NeonBackground from '../../../components/ui/background'
import Button from '../../../components/ui/button'
import Card from '../../../components/ui/card'
import { useLogout } from '../../../lib/supabase/auth'
import BottomModal from '../../../components/ui/modal'
import Pagination from '../../../components/common/pagination'
import SearchBar from '../../../components/common/search-bar'
import {
  useAgents,
  useDashboardAnalytics
} from '../../../lib/hooks/useAgentData'
import '../../styles/agent-dashboard-styles.css'
import AgentsDashboardSkeleton from '../../../components/skeleton/AgentDashboardSkeleton'
/**
 * Utility function to highlight matching characters in text
 */
const highlightText = (text, searchQuery) => {
  if (!searchQuery || !text) return text

  const searchLower = searchQuery.toLowerCase()
  const textLower = text.toLowerCase()

  const matches = []
  let searchIndex = 0

  for (
    let i = 0;
    i < textLower.length && searchIndex < searchLower.length;
    i++
  ) {
    if (textLower[i] === searchLower[searchIndex]) {
      matches.push(i)
      searchIndex++
    }
  }

  if (searchIndex < searchLower.length) {
    return text
  }

  const parts = []
  let lastIndex = 0

  matches.forEach((matchIndex) => {
    if (matchIndex > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, matchIndex)}
        </span>
      )
    }

    parts.push(
      <span
        key={`highlight-${matchIndex}`}
        className='rounded bg-orange-500/30 px-0.5 font-bold text-orange-300'
      >
        {text[matchIndex]}
      </span>
    )

    lastIndex = matchIndex + 1
  })

  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return <>{parts}</>
}

/**
 * Memoized Agent Card Component with Search Highlighting
 * Uses interface field to differentiate cards
 */
const AgentCardWithInfo = memo(({ agent, searchQuery }) => {
  const getInterfaceIcon = () => {
    const iconProps = 'h-6 w-6'
    switch (agent?.interface) {
      case 'instagram':
        return <Instagram className={iconProps} />
      case 'sms':
        return <Phone className={iconProps} />
      case 'website':
        return <Globe className={iconProps} />
      default:
        return <Bot className={iconProps} />
    }
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
    return labels[agent?.interface] || labels.default
  }

  return (
    <Card
      className={`group cursor-pointer border bg-gradient-to-br transition-all hover:scale-[1.02] hover:shadow-2xl ${getInterfaceColors()}`}
    >
      <div className='space-y-6'>
        {/* Header Section */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-4'>
            {/* Icon with glow effect */}
            <div className='relative'>
              <div
                className={`absolute inset-0 ${getIconBgColor()} opacity-50 blur-xl`}
              />
              <div
                className={`relative flex h-14 w-14 items-center justify-center rounded-lg ${getIconBgColor()} border border-neutral-800/50`}
              >
                {getInterfaceIcon()}
              </div>
            </div>

            <div>
              <h3 className='text-xl font-bold text-neutral-100'>
                {highlightText(agent?.name || 'Untitled Agent', searchQuery)}
              </h3>
              <p className='mt-1 text-sm text-neutral-400'>
                {getInterfaceLabel()}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              agent?.is_active
                ? 'bg-green-900/40 text-green-300 ring-1 ring-green-500/50'
                : 'bg-red-900/40 text-red-300 ring-1 ring-red-500/50'
            }`}
          >
            {agent?.is_active ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Description */}
        <p className='line-clamp-2 text-sm text-neutral-400'>
          {agent?.description || 'No description provided'}
        </p>

        {/* Domain & Model Info */}
        {(agent?.domain || agent?.model) && (
          <div className='flex items-center gap-3 text-xs text-neutral-500'>
            {agent?.domain && (
              <span className='rounded-full bg-neutral-900/50 px-2 py-1 capitalize'>
                {agent.domain}
              </span>
            )}
            {agent?.model && (
              <span className='rounded-full bg-neutral-900/50 px-2 py-1'>
                {agent.model}
              </span>
            )}
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className='grid grid-cols-3 gap-2'>
          <Link href={`/agents/${agent?.id}/manage`}>
            <Button size='sm' className='w-full'>
              <Settings className='mr-1 h-3 w-3' />
              Manage
            </Button>
          </Link>
          <Link href={`/agents/${agent?.id}/edit`}>
            <Button size='sm' variant='outline' className='w-full'>
              <Edit className='mr-1 h-3 w-3' />
              Edit
            </Button>
          </Link>
          <Link href={`/agents/${agent?.id}/playground`}>
            <Button size='sm' variant='ghost' className='w-full'>
              <PlaySquare className='mr-1 h-3 w-3' />
              Play
            </Button>
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className='flex flex-wrap gap-2 border-t border-neutral-800/50 pt-4'>
          <Link href={`/agents/${agent?.id}/webhook`}>
            <Button size='sm' variant='ghost' className='h-8 text-xs'>
              <Webhook className='mr-1 h-3 w-3' />
              Webhook
            </Button>
          </Link>
          <Link href={`/sandbox/${agent?.id}`}>
            <Button size='sm' variant='ghost' className='h-8 text-xs'>
              <TestTube className='mr-1 h-3 w-3' />
              Test
            </Button>
          </Link>
          <Link href={`/workflows/page.js`}>
            <Button size='sm' variant='ghost' className='h-8 text-xs'>
              <Workflow className='mr-1 h-3 w-3' />
              Workflow
            </Button>
          </Link>
        </div>

        {/* Footer with metadata */}
        <div className='flex items-center justify-between border-t border-neutral-800/50 pt-4 text-xs text-neutral-500'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              <MessageSquare className='h-3 w-3' />
              <span>0 chats</span>
            </div>
            <div className='flex items-center gap-1'>
              <Activity className='h-3 w-3' />
              <span>0 users</span>
            </div>
          </div>
          <span>
            Created {format(new Date(agent?.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </Card>
  )
})
AgentCardWithInfo.displayName = 'AgentCardWithInfo'

/**
 * Memoized Analytics Card Component
 */
const AnalyticsCard = memo(({ icon: Icon, label, value, subtext, color }) => {
  const colorClasses = {
    orange: 'border-orange-600/20 from-orange-900/20',
    blue: 'border-blue-600/20 from-blue-900/20',
    green: 'border-green-600/20 from-green-900/20',
    purple: 'border-purple-600/20 from-purple-900/20'
  }

  const iconBgClasses = {
    orange: 'bg-orange-900/40',
    blue: 'bg-blue-900/40',
    green: 'bg-green-900/40',
    purple: 'bg-purple-900/40'
  }

  const textClasses = {
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400'
  }

  return (
    <Card
      className={`border ${colorClasses[color]} bg-gradient-to-br to-neutral-950/50`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-neutral-400'>{label}</p>
          <p className={`mt-2 text-3xl font-bold ${textClasses[color]}`}>
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgClasses[color]}`}
        >
          <Icon className={`h-6 w-6 ${textClasses[color]}`} />
        </div>
      </div>
      {subtext && (
        <div className='mt-4 flex items-center text-xs text-neutral-500'>
          <Activity className='mr-1 h-3 w-3' />
          {subtext}
        </div>
      )}
    </Card>
  )
})
AnalyticsCard.displayName = 'AnalyticsCard'
/**
 * Main Dashboard Component
 */
export default function AgentsDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()
  const router = useRouter()
  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }

  // UI State
  const [isAgentCardOpen, setIsAgentCardOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // React Query hooks
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
  const {
    data: analytics = {
      totalConversations: 0,
      totalAgents: 0,
      creditsUsed: 0,
      successRate: 0,
      activeAgents: 0
    },
    isLoading: analyticsLoading
  } = useDashboardAnalytics(agents)

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) {
      return agents
    }

    const searchLower = searchQuery.toLowerCase()

    return agents.filter((agent) => {
      const nameLower = (agent.name || '').toLowerCase()
      let searchIndex = 0

      for (
        let i = 0;
        i < nameLower.length && searchIndex < searchLower.length;
        i++
      ) {
        if (nameLower[i] === searchLower[searchIndex]) {
          searchIndex++
        }
      }

      return searchIndex === searchLower.length
    })
  }, [agents, searchQuery])

  // Paginate filtered agents
  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAgents.slice(startIndex, endIndex)
  }, [filteredAgents, currentPage, itemsPerPage])

  const totalPages = useMemo(
    () => Math.ceil(filteredAgents.length / itemsPerPage),
    [filteredAgents.length, itemsPerPage]
  )

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Handlers
  const handleNewAgent = useCallback(() => {
    setIsAgentCardOpen(false)
  }, [])

  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
  }, [])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    document
      .getElementById('agents-section')
      ?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])
  if (delayedLoading) {
    return (
      <LoadingState
        message={authLoading ? 'Authenticating...' : 'Loading your agents...'}
        className='min-h-screen'
      />
    )
  }

  if (authLoading || agentsLoading) {
    return <AgentsDashboardSkeleton userProfile={userProfile} />
  }
  // Loading states

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
              {/* Hero Section */}
              <div className='relative mb-12 flex min-h-[40vh] flex-col items-center justify-center'>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='h-[500px] w-[500px] rounded-full bg-orange-500/20 blur-[100px]' />
                </div>

                <div className='relative z-10 flex flex-col items-center justify-center'>
                  <button
                    onClick={() => setIsAgentCardOpen(true)}
                    className='group relative mx-auto flex h-36 w-36 transform cursor-pointer items-center justify-center transition-transform duration-300 hover:scale-110'
                  >
                    <div className='agent-pulse absolute h-36 w-36 rounded-full bg-orange-600/50' />
                    <div
                      className='agent-pulse absolute h-48 w-48 rounded-full bg-orange-600/20'
                      style={{ animationDelay: '0.5s' }}
                    />

                    <div className='relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-orange-500 bg-gradient-to-br from-orange-600 to-orange-700 shadow-2xl shadow-orange-500/50 transition-all group-hover:border-orange-400 group-hover:shadow-orange-400/60'>
                      <Plus className='h-16 w-16 text-white' />
                    </div>
                  </button>

                  <p className='mt-6 text-center text-xl font-semibold text-neutral-200'>
                    Create Your AI Agent
                  </p>
                  <p className='mt-2 text-center text-sm text-neutral-400'>
                    Click to start building your intelligent assistant
                  </p>
                </div>
              </div>

              {/* Analytics Cards */}
              <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                <AnalyticsCard
                  icon={Bot}
                  label='Total Agents'
                  value={analytics.totalAgents}
                  subtext={`Active: ${analytics.activeAgents}`}
                  color='orange'
                />
                <AnalyticsCard
                  icon={MessageSquare}
                  label='Conversations'
                  value={analytics.totalConversations}
                  subtext='All time interactions'
                  color='blue'
                />
                <AnalyticsCard
                  icon={TrendingUp}
                  label='Success Rate'
                  value={`${analytics.successRate}%`}
                  subtext='Performance metric'
                  color='green'
                />
                <AnalyticsCard
                  icon={Zap}
                  label='Credits Used'
                  value={analytics.creditsUsed.toLocaleString()}
                  subtext={`Available: ${profile?.api_credits || 0}`}
                  color='purple'
                />
              </div>

              {/* Agents Section */}
              <div id='agents-section' className='mb-8'>
                <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <h3 className='text-2xl font-bold text-neutral-100'>
                      Your Agents
                    </h3>
                    <p className='mt-1 text-sm text-neutral-400'>
                      {filteredAgents.length}{' '}
                      {filteredAgents.length === 1 ? 'agent' : 'agents'}
                      {searchQuery && ` matching "${searchQuery}"`}
                    </p>
                  </div>

                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                    {agents.length > 0 && (
                      <div className='w-full sm:w-80'>
                        <SearchBar
                          value={searchQuery}
                          onChange={handleSearch}
                          placeholder='Search agents by name...'
                          variant='orange'
                          debounceMs={300}
                        />
                      </div>
                    )}

                    <Button
                      onClick={() => setIsAgentCardOpen(true)}
                      className='flex items-center justify-center gap-2'
                    >
                      <Plus className='h-4 w-4' />
                      Create Agent
                    </Button>
                  </div>
                </div>

                {agents.length === 0 ? (
                  <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
                    <div className='flex flex-col items-center py-16 text-center'>
                      <div className='mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-900/40'>
                        <Bot className='h-10 w-10 text-orange-400' />
                      </div>
                      <h4 className='mb-2 text-xl font-semibold text-neutral-200'>
                        No agents yet
                      </h4>
                      <p className='mb-6 max-w-md text-sm text-neutral-400'>
                        Create your first AI agent to start automating
                        conversations and workflows
                      </p>
                      <Button onClick={() => setIsAgentCardOpen(true)}>
                        <Plus className='mr-2 h-4 w-4' />
                        Create Your First Agent
                      </Button>
                    </div>
                  </Card>
                ) : filteredAgents.length === 0 ? (
                  <Card className='border-neutral-700/50 bg-gradient-to-br from-neutral-900/20 to-neutral-950/50'>
                    <div className='flex flex-col items-center py-16 text-center'>
                      <div className='mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800/40'>
                        <Bot className='h-10 w-10 text-neutral-400' />
                      </div>
                      <h4 className='mb-2 text-xl font-semibold text-neutral-200'>
                        No agents found
                      </h4>
                      <p className='mb-6 max-w-md text-sm text-neutral-400'>
                        No agents match your search for &quot;{searchQuery}
                        &quot;
                      </p>
                      <Button
                        variant='outline'
                        onClick={() => setSearchQuery('')}
                      >
                        Clear Search
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <>
                    <div className='grid gap-6 sm:grid-cols-1 lg:grid-cols-2'>
                      {paginatedAgents.map((agent) => (
                        <AgentCardWithInfo
                          key={agent.id}
                          agent={agent}
                          searchQuery={searchQuery}
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className='mt-8'>
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                          maxVisible={5}
                          variant='orange'
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Recent Activity */}
              {agents.length > 0 && (
                <Card className='border-neutral-700/50'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-xl font-bold text-neutral-100'>
                        <span className='text-orange-400'>Recent</span> Activity
                      </h3>
                      <Link href='/agents/dashboard'>
                        <Button variant='ghost' size='sm' className='group'>
                          View All
                          <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                        </Button>
                      </Link>
                    </div>

                    <div className='space-y-3'>
                      {agents.slice(0, 5).map((agent) => (
                        <div
                          key={agent.id}
                          className='flex items-center justify-between rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4 transition-colors hover:bg-neutral-900/50'
                        >
                          <div className='flex items-center gap-3'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/40'>
                              <Bot className='h-5 w-5 text-orange-400' />
                            </div>
                            <div>
                              <p className='font-semibold text-neutral-200'>
                                {agent.name}
                              </p>
                              <p className='text-xs text-neutral-500'>
                                Last updated{' '}
                                {format(
                                  new Date(agent.updated_at),
                                  'MMM d, h:mm a'
                                )}
                              </p>
                            </div>
                          </div>

                          <div className='flex items-center gap-3'>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                agent.is_active
                                  ? 'bg-green-900/40 text-green-300 ring-1 ring-green-500/50'
                                  : 'bg-red-900/40 text-red-300 ring-1 ring-red-500/50'
                              }`}
                            >
                              {agent.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <Link href={`/agents/${agent.id}/manage`}>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='group'
                              >
                                View
                                <ArrowRight className='ml-1 h-3 w-3 transition-transform group-hover:translate-x-1' />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SideBarLayout>

      {/* Create Agent Modal */}
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
