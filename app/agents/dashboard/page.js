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
  Globe
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, memo, useMemo, useCallback } from 'react'
import LoadingState from '../../../components/common/loading-state'
import NavigationBar from '../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../components/providers/AuthProvider'
import SideBarLayout from '../../../components/sideBarLayout'
import NeonBackground from '../../../components/ui/background'
import Button from '../../../components/ui/button'
import Card from '../../../components/ui/card'
import { useLogout } from '../../../lib/supabase/auth'
import { dbClient } from '../../../lib/supabase/dbClient'
import BottomModal from '../../../components/ui/modal'
import Pagination from '../../../components/common/pagination'
import SearchBar from '../../../components/common/search-bar'
import '../../styles/agent-dashboard-styles.css'

/**
 * Utility function to highlight matching characters in text
 */
const highlightText = (text, searchQuery) => {
  if (!searchQuery || !text) return text

  const searchLower = searchQuery.toLowerCase()
  const textLower = text.toLowerCase()

  // Find all matching character positions
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

  // If not all characters matched, return original text
  if (searchIndex < searchLower.length) {
    return text
  }

  // Build highlighted text
  const parts = []
  let lastIndex = 0

  matches.forEach((matchIndex) => {
    // Add non-highlighted text before this match
    if (matchIndex > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, matchIndex)}
        </span>
      )
    }

    // Add highlighted character
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

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return <>{parts}</>
}

/**
 * OPTIMIZED Agent Card Component with Search Highlighting
 */
const AgentCardWithInfo = memo(({ agent, searchQuery }) => {
  const cardRef = useRef(null)

  // Get purpose icon
  const getPurposeIcon = () => {
    const iconProps = 'h-6 w-6'
    switch (agent?.purpose) {
      case 'instagram':
        return <Instagram className={iconProps} />
      case 'messenger':
        return <MessageSquare className={iconProps} />
      case 'calendar':
        return <Calendar className={iconProps} />
      case 'website':
        return <Globe className={iconProps} />
      default:
        return <Bot className={iconProps} />
    }
  }

  // Get purpose colors
  const getPurposeColors = () => {
    const baseColors = {
      instagram: 'from-pink-900/40 to-pink-950/20 border-pink-600/30',
      messenger: 'from-blue-900/40 to-blue-950/20 border-blue-600/30',
      calendar: 'from-green-900/40 to-green-950/20 border-green-600/30',
      website: 'from-purple-900/40 to-purple-950/20 border-purple-600/30',
      default: 'from-orange-900/40 to-orange-950/20 border-orange-600/30'
    }
    return baseColors[agent?.purpose] || baseColors.default
  }

  const getIconBgColor = () => {
    const colors = {
      instagram: 'bg-pink-900/40',
      messenger: 'bg-blue-900/40',
      calendar: 'bg-green-900/40',
      website: 'bg-purple-900/40',
      default: 'bg-orange-900/40'
    }
    return colors[agent?.purpose] || colors.default
  }

  return (
    <Card
      ref={cardRef}
      className={`group cursor-pointer border bg-gradient-to-br transition-all hover:scale-[1.02] hover:shadow-2xl ${getPurposeColors()}`}
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
                {getPurposeIcon()}
              </div>
            </div>

            <div>
              <h3 className='text-xl font-bold text-neutral-100'>
                {highlightText(agent?.name || 'Untitled Agent', searchQuery)}
              </h3>
              <p className='mt-1 text-sm text-neutral-400 capitalize'>
                {agent?.purpose || 'General Purpose'}
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
 * ENHANCED Dashboard Component with Search and Pagination
 */
export default function AgentsDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()
  const router = useRouter()

  // Refs
  const hasFetchedData = useRef(false)

  // State management
  const [agents, setAgents] = useState([])
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    totalAgents: 0,
    creditsUsed: 0,
    successRate: 0
  })
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)
  const [isAgentCardOpen, setIsAgentCardOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // Agents per page

  // ✅ Reset state on mount/unmount (this component doesn't have an id param)
  // But we still need to ensure clean state on component mount
  useEffect(() => {
    // This component doesn't navigate based on ID, but we reset on mount
    return () => {
      hasFetchedData.current = false
    }
  }, [])

  // ✅ OPTIMIZATION: Filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) {
      return agents
    }

    const searchLower = searchQuery.toLowerCase()

    return agents.filter((agent) => {
      const nameLower = (agent.name || '').toLowerCase()

      // Check if all characters in search query exist in order in agent name
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

  // ✅ OPTIMIZATION: Paginate filtered agents
  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAgents.slice(startIndex, endIndex)
  }, [filteredAgents, currentPage, itemsPerPage])

  // Calculate total pages
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Optimized fetch function
  const fetchDashboardData = useCallback(async () => {
    if (!user || hasFetchedData.current) return
    hasFetchedData.current = true

    try {
      setFetching(true)
      setError(null)

      const userAgents = await dbClient.getUserAgents(user.id)
      setAgents(userAgents || [])

      const analyticsPromises = (userAgents || []).map((agent) =>
        dbClient.getAnalytics(agent.id).catch(() => [])
      )
      const allAgentAnalytics = await Promise.all(analyticsPromises)

      let totalConversations = 0
      let totalCreditsUsed = 0
      let successfulInteractions = 0
      let totalInteractions = 0

      allAgentAnalytics.flat().forEach((record) => {
        if (record.event_type === 'conversation') {
          totalConversations++
          totalInteractions++
          if (record.success) successfulInteractions++
        }
        totalCreditsUsed += record.tokens_used || 0
      })

      setAnalytics({
        totalConversations,
        totalAgents: userAgents?.length || 0,
        creditsUsed: totalCreditsUsed,
        successRate:
          totalInteractions > 0
            ? Math.round((successfulInteractions / totalInteractions) * 100)
            : 0
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load agents data')
    } finally {
      setFetching(false)
      setIsInitialized(true)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (user && !hasFetchedData.current) {
      fetchDashboardData()
    }
  }, [authLoading, user, fetchDashboardData, router])

  const handleNewAgent = () => {
    setIsAgentCardOpen(false)
  }

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
  }, [])

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    // Scroll to top of agents section
    document
      .getElementById('agents-section')
      ?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Loading states
  if (authLoading) {
    return <LoadingState message='Authenticating...' className='min-h-screen' />
  }

  if (fetching && !isInitialized) {
    return (
      <LoadingState message='Loading your agents...' className='min-h-screen' />
    )
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout>
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
              {/* Hero Section with Create Agent Button */}
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
                <Card className='border-orange-600/20 bg-gradient-to-br from-orange-900/20 to-neutral-950/50'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-neutral-400'>
                        Total Agents
                      </p>
                      <p className='mt-2 text-3xl font-bold text-orange-400'>
                        {analytics.totalAgents}
                      </p>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-900/40'>
                      <Bot className='h-6 w-6 text-orange-400' />
                    </div>
                  </div>
                  <div className='mt-4 flex items-center text-xs text-neutral-500'>
                    <TrendingUp className='mr-1 h-3 w-3' />
                    Active: {agents.filter((a) => a.is_active).length}
                  </div>
                </Card>

                <Card className='border-blue-600/20 bg-gradient-to-br from-blue-900/20 to-neutral-950/50'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-neutral-400'>
                        Conversations
                      </p>
                      <p className='mt-2 text-3xl font-bold text-blue-400'>
                        {analytics.totalConversations}
                      </p>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/40'>
                      <MessageSquare className='h-6 w-6 text-blue-400' />
                    </div>
                  </div>
                  <div className='mt-4 flex items-center text-xs text-neutral-500'>
                    <Activity className='mr-1 h-3 w-3' />
                    All time interactions
                  </div>
                </Card>

                <Card className='border-green-600/20 bg-gradient-to-br from-green-900/20 to-neutral-950/50'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-neutral-400'>
                        Success Rate
                      </p>
                      <p className='mt-2 text-3xl font-bold text-green-400'>
                        {analytics.successRate}%
                      </p>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-900/40'>
                      <TrendingUp className='h-6 w-6 text-green-400' />
                    </div>
                  </div>
                  <div className='mt-4 flex items-center text-xs text-neutral-500'>
                    <Activity className='mr-1 h-3 w-3' />
                    Performance metric
                  </div>
                </Card>

                <Card className='border-purple-600/20 bg-gradient-to-br from-purple-900/20 to-neutral-950/50'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-neutral-400'>
                        Credits Used
                      </p>
                      <p className='mt-2 text-3xl font-bold text-purple-400'>
                        {analytics.creditsUsed.toLocaleString()}
                      </p>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/40'>
                      <Zap className='h-6 w-6 text-purple-400' />
                    </div>
                  </div>
                  <div className='mt-4 flex items-center text-xs text-neutral-500'>
                    <Activity className='mr-1 h-3 w-3' />
                    Available: {profile?.api_credits || 0}
                  </div>
                </Card>
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
                    {/* Search Bar */}
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
                  // Empty State
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
                  // No Search Results
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
                    {/* Agents Grid */}
                    <div className='grid gap-6 sm:grid-cols-1 lg:grid-cols-2'>
                      {paginatedAgents.map((agent) => (
                        <AgentCardWithInfo
                          key={agent.id}
                          agent={agent}
                          searchQuery={searchQuery}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
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
                      <Link href='/analytics'>
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
    </>
  )
}