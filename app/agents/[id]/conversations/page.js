'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { useAuth } from '../../../../components/providers/AuthProvider'
import { useLogout } from '../../../../lib/supabase/auth'
import SideBarLayout from '../../../../components/sideBarLayout'
import NeonBackground from '../../../../components/ui/background'
import ConversationsSkeleton from '../../../../components/skeleton/ConversationsSkeleton'
import LoadingState from '../../../../components/common/loading-state'
import Pagination from '../../../../components/common/pagination'
import SearchBar from '../../../../components/common/search-bar'
import Badge from '../../../../components/ui/badge'
import Button from '../../../../components/ui/button'
import Card from '../../../../components/ui/card'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import {
  useAgent,
  useConversations,
  useConversationStats,
  useDeleteConversation,
  useUniqueSessions
} from '../../../../lib/hooks/useAgentData'
import {
  Eye,
  MessageSquare,
  Trash2,
  TrendingUp,
  User,
  Clock,
  Download,
  Bot,
  Filter,
  XCircle,
  Calendar,
  Zap,
  Activity,
  BarChart3,
  RefreshCw,
  Loader2
} from 'lucide-react'

const ITEMS_PER_PAGE = 12

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
        className='rounded bg-orange-500/40 px-0.5 font-bold text-orange-200'
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
 * Memoized Statistics Card Component
 */
const StatCard = memo(
  ({
    icon: Icon,
    label,
    value,
    subValue,
    colorClass,
    bgClass,
    trend,
    isLoading
  }) => (
    <Card
      className={`border-opacity-20 ${bgClass} transition-all hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className='flex items-center justify-between p-4'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-neutral-400'>{label}</p>
          {isLoading ? (
            <div className='mt-2 h-8 w-20 animate-pulse rounded bg-neutral-800' />
          ) : (
            <>
              <p className={`mt-2 text-3xl font-bold ${colorClass}`}>{value}</p>
              {subValue && (
                <div className='mt-2 flex items-center gap-1 text-xs text-neutral-500'>
                  {trend && <TrendingUp className='h-3 w-3' />}
                  <span>{subValue}</span>
                </div>
              )}
            </>
          )}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${bgClass.replace('to-neutral-950/50', 'opacity-40')}`}
        >
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
      </div>
    </Card>
  )
)
StatCard.displayName = 'StatCard'

/**
 * Memoized Conversation Card Component
 */
const ConversationCard = memo(
  ({ conversation, searchTerm, onView, onDelete }) => {
    const formattedTime = useMemo(
      () =>
        formatDistanceToNow(new Date(conversation.created_at), {
          addSuffix: true
        }),
      [conversation.created_at]
    )

    const responseTime = conversation.metadata?.response_time_ms

    return (
      <Card className='group border-neutral-700/50 bg-gradient-to-br from-neutral-900/50 to-neutral-950/30 transition-all hover:scale-[1.01] hover:border-orange-600/30 hover:shadow-lg hover:shadow-orange-500/10'>
        <div className='flex items-start justify-between p-5'>
          <div className='min-w-0 flex-1 space-y-4'>
            {/* Header */}
            <div className='flex flex-wrap items-center gap-3'>
              <div className='flex items-center gap-2 text-sm text-neutral-400'>
                <Clock className='h-4 w-4' />
                <span>{formattedTime}</span>
              </div>
              <Badge variant='outline' className='font-mono text-xs'>
                {conversation.session_id.slice(0, 12)}...
              </Badge>
              {responseTime && (
                <div className='flex items-center gap-1 rounded-full bg-purple-900/20 px-2 py-1 text-xs text-purple-300'>
                  <Zap className='h-3 w-3' />
                  <span>{responseTime}ms</span>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className='space-y-4'>
              {/* User Message */}
              <div className='flex items-start gap-3'>
                <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-900/30 ring-1 ring-blue-500/30'>
                  <User className='h-4 w-4 text-blue-400' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='mb-1.5 text-xs font-semibold text-blue-300'>
                    User
                  </p>
                  <p className='line-clamp-2 text-sm break-words text-neutral-300'>
                    {highlightText(conversation.user_message || '', searchTerm)}
                  </p>
                </div>
              </div>

              {/* Agent Response */}
              <div className='flex items-start gap-3'>
                <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-900/30 ring-1 ring-orange-500/30'>
                  <Bot className='h-4 w-4 text-orange-400' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='mb-1.5 text-xs font-semibold text-orange-300'>
                    Agent
                  </p>
                  <p className='line-clamp-2 text-sm break-words text-neutral-300'>
                    {highlightText(
                      conversation.agent_response || '',
                      searchTerm
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata Footer */}
            {conversation.metadata?.tokens_used && (
              <div className='flex items-center gap-3 border-t border-neutral-800/50 pt-3 text-xs text-neutral-500'>
                <div className='flex items-center gap-1'>
                  <BarChart3 className='h-3 w-3' />
                  <span>{conversation.metadata.tokens_used} tokens</span>
                </div>
                {conversation.metadata?.model && (
                  <>
                    <span className='text-neutral-700'>•</span>
                    <span className='font-mono'>
                      {conversation.metadata.model}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className='ml-4 flex flex-col gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={onView}
              className='h-8 w-8 p-0 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300'
              title='View Details'
            >
              <Eye className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={onDelete}
              className='h-8 w-8 p-0 text-red-400 hover:bg-red-600/20 hover:text-red-300'
              title='Delete'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </Card>
    )
  }
)
ConversationCard.displayName = 'ConversationCard'

/**
 * Memoized Conversation Details Modal
 */
const ConversationDetailsModal = memo(({ conversation, onClose }) => {
  if (!conversation) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='custom-scrollbar animate-in fade-in zoom-in mx-4 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-orange-600/30 bg-gradient-to-br from-neutral-900 to-neutral-950 shadow-2xl shadow-orange-500/20 duration-200'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800/50 bg-neutral-900/90 p-6 backdrop-blur-sm'>
          <div>
            <h3 className='flex items-center gap-2 text-2xl font-bold text-orange-400'>
              <MessageSquare className='h-6 w-6' />
              Conversation Details
            </h3>
            <p className='mt-1 text-sm text-neutral-400'>
              {format(new Date(conversation.created_at), 'PPpp')}
            </p>
          </div>
          <Button
            variant='ghost'
            onClick={onClose}
            className='text-neutral-400 hover:text-neutral-200'
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className='space-y-6 p-6'>
          {/* Metadata Grid */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-4'>
              <label className='mb-2 block text-xs font-semibold text-neutral-400'>
                Session ID
              </label>
              <p className='font-mono text-sm break-all text-neutral-200'>
                {conversation.session_id}
              </p>
            </div>
            <div className='rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-4'>
              <label className='mb-2 block text-xs font-semibold text-neutral-400'>
                Conversation ID
              </label>
              <p className='font-mono text-sm break-all text-neutral-200'>
                {conversation.id}
              </p>
            </div>
          </div>

          {/* User Message */}
          <div>
            <label className='mb-3 flex items-center gap-2 text-sm font-semibold text-blue-300'>
              <User className='h-4 w-4' />
              User Message
            </label>
            <div className='rounded-lg border border-blue-600/30 bg-gradient-to-br from-blue-900/20 to-neutral-950/50 p-4'>
              <p className='text-sm leading-relaxed whitespace-pre-wrap text-neutral-200'>
                {conversation.user_message}
              </p>
            </div>
          </div>

          {/* Agent Response */}
          <div>
            <label className='mb-3 flex items-center gap-2 text-sm font-semibold text-orange-300'>
              <Bot className='h-4 w-4' />
              Agent Response
            </label>
            <div className='rounded-lg border border-orange-600/30 bg-gradient-to-br from-orange-900/20 to-neutral-950/50 p-4'>
              <p className='text-sm leading-relaxed whitespace-pre-wrap text-neutral-200'>
                {conversation.agent_response}
              </p>
            </div>
          </div>

          {/* Technical Details */}
          {conversation.metadata && (
            <div>
              <label className='mb-3 flex items-center gap-2 text-sm font-semibold text-purple-300'>
                <Activity className='h-4 w-4' />
                Performance Metrics
              </label>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                {conversation.metadata.tokens_used && (
                  <div className='rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-neutral-400'>
                        Tokens Used
                      </span>
                      <div className='flex items-center gap-1'>
                        <BarChart3 className='h-3 w-3 text-green-400' />
                        <span className='font-bold text-green-400'>
                          {conversation.metadata.tokens_used}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {conversation.metadata.response_time_ms && (
                  <div className='rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-neutral-400'>
                        Response Time
                      </span>
                      <div className='flex items-center gap-1'>
                        <Zap className='h-3 w-3 text-purple-400' />
                        <span className='font-bold text-purple-400'>
                          {conversation.metadata.response_time_ms}ms
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {conversation.metadata.model && (
                  <div className='rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-4 sm:col-span-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-neutral-400'>Model</span>
                      <span className='font-mono text-sm font-bold text-blue-400'>
                        {conversation.metadata.model}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw Metadata */}
          <details className='group overflow-hidden rounded-lg border border-neutral-700/50'>
            <summary className='flex cursor-pointer items-center justify-between bg-neutral-800/30 p-4 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-neutral-200'>
              <span>View Raw Metadata</span>
              <span className='text-neutral-600 transition-transform group-open:rotate-180'>
                ▼
              </span>
            </summary>
            <div className='border-t border-neutral-700/50 bg-neutral-950/50 p-4'>
              <pre className='overflow-x-auto font-mono text-xs leading-relaxed text-neutral-300'>
                {JSON.stringify(conversation.metadata, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
})
ConversationDetailsModal.displayName = 'ConversationDetailsModal'

/**
 * Main Component
 */
export default function AgentConversations() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()

  // Artificial delay so skeleton shows at least 3 seconds
  const [delayedLoading, setDelayedLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }

  // React Query hooks
  const {
    data: agent,
    isLoading: agentLoading,
    error: agentError
  } = useAgent(id)

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    refetch: refetchConversations
  } = useConversations(id)

  const {
    data: stats = {
      totalConversations: 0,
      totalSessions: 0,
      avgMessagesPerSession: 0,
      avgResponseTime: 0,
      totalTokens: 0
    },
    isLoading: statsLoading
  } = useConversationStats(id)

  const uniqueSessions = useUniqueSessions(id)
  const deleteConversationMutation = useDeleteConversation(id)

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [sessionFilter, setSessionFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal state
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Handle agent not found
  useEffect(() => {
    if (agentError && !agentLoading) {
      toast.error('Agent not found')
      router.push('/agents')
    }
  }, [agentError, agentLoading, router])

  // Memoized filtered conversations
  const filteredConversations = useMemo(() => {
    if (!conversations.length) return []

    const now = new Date()
    return conversations.filter((conv) => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()

        const userMsgLower = (conv.user_message || '').toLowerCase()
        const agentRespLower = (conv.agent_response || '').toLowerCase()
        const sessionLower = (conv.session_id || '').toLowerCase()

        // Fuzzy character matching
        let searchIndex = 0
        const combined =
          userMsgLower + ' ' + agentRespLower + ' ' + sessionLower

        for (let i = 0; i < combined.length && searchIndex < term.length; i++) {
          if (combined[i] === term[searchIndex]) {
            searchIndex++
          }
        }

        if (searchIndex < term.length) return false
      }

      // Date filter
      if (dateFilter !== 'all') {
        const convDate = new Date(conv.created_at)
        const daysMap = { today: 1, week: 7, month: 30 }
        const days = daysMap[dateFilter] || 0

        if (days > 0) {
          const ago = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
          if (convDate < ago) return false
        }
      }

      // Session filter
      if (sessionFilter !== 'all' && conv.session_id !== sessionFilter) {
        return false
      }

      return true
    })
  }, [conversations, searchTerm, dateFilter, sessionFilter])

  // Memoized paginated conversations
  const paginatedConversations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredConversations.slice(start, end)
  }, [filteredConversations, currentPage])

  const totalPages = Math.ceil(filteredConversations.length / ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, dateFilter, sessionFilter])

  // Export CSV
  const exportConversations = useCallback(() => {
    if (!filteredConversations.length) {
      return toast.error('No conversations to export')
    }

    const csvContent = [
      [
        'Date',
        'Session ID',
        'User Message',
        'Agent Response',
        'Tokens Used',
        'Response Time (ms)',
        'Model'
      ],
      ...filteredConversations.map((conv) => [
        format(new Date(conv.created_at), 'yyyy-MM-dd HH:mm:ss'),
        conv.session_id,
        (conv.user_message || '').replace(/"/g, '""'),
        (conv.agent_response || '').replace(/"/g, '""'),
        conv.metadata?.tokens_used || 0,
        conv.metadata?.response_time_ms || 0,
        conv.metadata?.model || ''
      ])
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${agent?.name || 'agent'}-conversations-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Exported ${filteredConversations.length} conversations!`)
  }, [filteredConversations, agent])

  // Delete conversation
  const handleDeleteConversation = useCallback(
    async (conversationId) => {
      if (!confirm('Delete this conversation? This action cannot be undone.'))
        return
      deleteConversationMutation.mutate(conversationId)
    },
    [deleteConversationMutation]
  )

  // View conversation details
  const handleViewConversation = useCallback((conversation) => {
    setSelectedConversation(conversation)
    setShowDetailsModal(true)
  }, [])

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    setDateFilter('all')
    setSessionFilter('all')
  }, [])

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchTerm(query)
  }, [])

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    document
      .getElementById('conversations-section')
      ?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    refetchConversations()
    toast.success('Refreshed conversations')
  }, [refetchConversations])

  // Show skeleton during delayed loading or initial loading
  if (delayedLoading || authLoading || agentLoading) {
    return (
      <ConversationsSkeleton
        userProfile={userProfile}
        agentName={agent?.name || 'Agent'}
      />
    )
  }

  if (!agent) {
    return (
      <LoadingState message='Agent not found...' className='min-h-screen' />
    )
  }

  const hasFilters =
    searchTerm || dateFilter !== 'all' || sessionFilter !== 'all'
  const isLoading = conversationsLoading || statsLoading

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              title={`${agent.name} - Conversations`}
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Stats Cards */}
              <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <StatCard
                  icon={MessageSquare}
                  label='Total Conversations'
                  value={stats.totalConversations}
                  subValue={`${stats.totalSessions} sessions`}
                  colorClass='text-orange-400'
                  bgClass='border-orange-600/20 bg-gradient-to-br from-orange-900/20 to-neutral-950/50'
                  trend
                  isLoading={statsLoading}
                />

                <StatCard
                  icon={User}
                  label='Avg Messages/Session'
                  value={stats.avgMessagesPerSession}
                  subValue='per conversation'
                  colorClass='text-blue-400'
                  bgClass='border-blue-600/20 bg-gradient-to-br from-blue-900/20 to-neutral-950/50'
                  isLoading={statsLoading}
                />

                <StatCard
                  icon={Clock}
                  label='Avg Response Time'
                  value={`${stats.avgResponseTime}ms`}
                  subValue='processing time'
                  colorClass='text-purple-400'
                  bgClass='border-purple-600/20 bg-gradient-to-br from-purple-900/20 to-neutral-950/50'
                  isLoading={statsLoading}
                />

                <StatCard
                  icon={BarChart3}
                  label='Total Tokens'
                  value={stats.totalTokens.toLocaleString()}
                  subValue='tokens used'
                  colorClass='text-green-400'
                  bgClass='border-green-600/20 bg-gradient-to-br from-green-900/20 to-neutral-950/50'
                  isLoading={statsLoading}
                />
              </div>

              {/* Filters */}
              <Card className='mb-6 border-neutral-700/50'>
                <div className='space-y-4 p-5'>
                  {/* Top Row: Search and Export */}
                  <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='max-w-2xl flex-1'>
                      <SearchBar
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder='Search messages, sessions...'
                        variant='orange'
                        debounceMs={300}
                      />
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        onClick={handleRefresh}
                        variant='outline'
                        size='sm'
                        className='flex items-center gap-2'
                        disabled={conversationsLoading}
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${conversationsLoading ? 'animate-spin' : ''}`}
                        />
                        Refresh
                      </Button>
                      <Button
                        onClick={exportConversations}
                        variant='secondary'
                        size='sm'
                        className='flex items-center gap-2'
                        disabled={!filteredConversations.length}
                      >
                        <Download className='h-4 w-4' />
                        Export CSV
                      </Button>
                    </div>
                  </div>

                  {/* Filter Buttons */}
                  <div className='flex flex-wrap items-center gap-3'>
                    <Filter className='h-4 w-4 text-neutral-400' />

                    {/* Date Filters */}
                    <div className='flex flex-wrap gap-2'>
                      <span className='text-xs text-neutral-500'>Date:</span>
                      {[
                        { value: 'all', label: 'All Time' },
                        { value: 'today', label: 'Today' },
                        { value: 'week', label: 'Last 7 Days' },
                        { value: 'month', label: 'Last 30 Days' }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setDateFilter(value)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            dateFilter === value
                              ? 'bg-orange-600/30 text-orange-300 ring-1 ring-orange-500/50'
                              : 'bg-neutral-800/30 text-neutral-400 hover:bg-neutral-800/50'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {uniqueSessions.length > 1 && (
                      <>
                        <span className='text-neutral-700'>|</span>

                        {/* Session Filter */}
                        <div className='flex items-center gap-2'>
                          <span className='text-xs text-neutral-500'>
                            Session:
                          </span>
                          <select
                            value={sessionFilter}
                            onChange={(e) => setSessionFilter(e.target.value)}
                            className='rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none'
                          >
                            <option value='all'>
                              All Sessions ({uniqueSessions.length})
                            </option>
                            {uniqueSessions.map((session) => (
                              <option key={session} value={session}>
                                {session.slice(0, 20)}...
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {hasFilters && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleClearFilters}
                        className='ml-auto flex items-center gap-1 text-xs'
                      >
                        <XCircle className='h-3 w-3' />
                        Clear Filters
                      </Button>
                    )}
                  </div>

                  {/* Results Count */}
                  <p className='text-sm text-neutral-400'>
                    {conversationsLoading ? (
                      <span className='flex items-center gap-2'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Loading conversations...
                      </span>
                    ) : (
                      <>
                        Showing {paginatedConversations.length} of{' '}
                        {filteredConversations.length} conversations
                        {hasFilters && ' matching your filters'}
                      </>
                    )}
                  </p>
                </div>
              </Card>

              {/* Conversations List */}
              <div id='conversations-section'>
                {conversationsLoading ? (
                  <Card className='border-neutral-700/50'>
                    <div className='flex flex-col items-center py-16 text-center'>
                      <Loader2 className='mb-4 h-12 w-12 animate-spin text-orange-500' />
                      <p className='text-neutral-400'>
                        Loading conversations...
                      </p>
                    </div>
                  </Card>
                ) : filteredConversations.length === 0 ? (
                  <Card className='border-neutral-700/50'>
                    <div className='flex flex-col items-center py-16 text-center'>
                      <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-900/40 to-orange-950/20 ring-1 ring-orange-500/50'>
                        <MessageSquare className='h-10 w-10 text-orange-400' />
                      </div>
                      <h3 className='mb-3 text-xl font-bold text-neutral-200'>
                        {conversations.length === 0
                          ? 'No conversations yet'
                          : 'No matching conversations'}
                      </h3>
                      <p className='mb-6 max-w-md text-sm text-neutral-400'>
                        {conversations.length === 0
                          ? 'Start conversations with your agent to see them here'
                          : 'Try adjusting your filters or search terms'}
                      </p>
                      {hasFilters && (
                        <Button onClick={handleClearFilters} variant='outline'>
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : (
                  <>
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                      {paginatedConversations.map((conversation) => (
                        <ConversationCard
                          key={conversation.id}
                          conversation={conversation}
                          searchTerm={searchTerm}
                          onView={() => handleViewConversation(conversation)}
                          onDelete={() =>
                            handleDeleteConversation(conversation.id)
                          }
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
            </div>
          </div>
        </div>
      </SideBarLayout>

      {/* Conversation Details Modal */}
      {showDetailsModal && selectedConversation && (
        <ConversationDetailsModal
          conversation={selectedConversation}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedConversation(null)
          }}
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
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