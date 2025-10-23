'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

import { dbClient } from '../../../../lib/supabase/dbClient'
import { deleteConversation } from '../../../actions/agents'
import { useAuth } from '../../../../components/providers/AuthProvider'
import { useLogout } from '../../../../lib/supabase/auth'

import SideBarLayout from '../../../../components/sideBarLayout'
import NeonBackground from '../../../../components/ui/background'
import LoadingState from '../../../../components/common/loading-state'
import Pagination from '../../../../components/common/pagination'
import SearchBar from '../../../../components/common/search-bar'
import Badge from '../../../../components/ui/badge'
import Button from '../../../../components/ui/button'
import Card from '../../../../components/ui/card'
import Modal from '../../../../components/ui/modal'
import NavigationBar from '../../../../components/navigationBar/navigationBar'

import {
  Eye,
  LoaderPinwheel,
  MessageSquare,
  Trash2,
  TrendingUp,
  User,
  Clock
} from 'lucide-react'
import { Suspense } from 'react'

export default function AgentConversations() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const { logout } = useLogout()

  // --- State ---
  const [agent, setAgent] = useState(null)
  const [agentCache, setAgentCache] = useState({})
  const [conversations, setConversations] = useState([])
  const [filteredConversations, setFilteredConversations] = useState([])
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalSessions: 0,
    avgMessagesPerSession: 0,
    avgResponseTime: 0
  })
  const [fetching, setFetching] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [sessionFilter, setSessionFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [title, setTitle] = useState('')
  const itemsPerPage = 10
  const message = 'Conversations'

  // --- Stats calculation ---
  const calculateStats = useCallback((convos) => {
    const uniqueSessions = new Set(convos.map((c) => c.session_id))
    const totalSessions = uniqueSessions.size
    const totalConversations = convos.length
    const avgMessagesPerSession =
      totalSessions > 0 ? totalConversations / totalSessions : 0

    const responseTimes = convos
      .map((c) => c.metadata?.response_time_ms)
      .filter(Boolean)
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0

    setStats({
      totalConversations,
      totalSessions,
      avgMessagesPerSession: avgMessagesPerSession.toFixed(1),
      avgResponseTime: Math.round(avgResponseTime)
    })
  }, [])

  // --- Fetch agent & conversations (with caching) ---
  const fetchAgentAndConversations = useCallback(async () => {
    if (!id) return

    // use cached agent if available
    if (agentCache[id]) {
      setAgent(agentCache[id])
    } else {
      try {
        setFetching(true)
        const [agentData, conversationData] = await Promise.all([
          dbClient.getAgent(id),
          dbClient.getConversations(id, 20)
        ])
        if (!agentData) {
          toast.error('Agent not found')
          router.push('/agents')
          return
        }
        setAgent(agentData)
        setAgentCache((prev) => ({ ...prev, [id]: agentData }))
        setTitle(agentData.name || 'Agent')
        setConversations(conversationData || [])
        calculateStats(conversationData || [])

        // defer analytics fetch
        dbClient.getAnalytics(id).then(() => {})
      } catch (err) {
        console.error('Error fetching agent data:', err)
        toast.error('Failed to load agent data')
      } finally {
        setFetching(false)
      }
    }
  }, [id, agentCache, calculateStats, router])

  useEffect(() => {
    if (!user) return
    fetchAgentAndConversations()
  }, [fetchAgentAndConversations, user])

  // --- Filtering & Search ---
  useEffect(() => {
    if (!conversations || conversations.length === 0) {
      setFilteredConversations([])
      setCurrentPage(1)
      return
    }

    const now = new Date()
    const filtered = conversations.filter((conv) => {
      // search
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matches =
          conv.user_message?.toLowerCase().includes(term) ||
          conv.agent_response?.toLowerCase().includes(term) ||
          conv.session_id?.toLowerCase().includes(term)
        if (!matches) return false
      }

      // date filter
      if (dateFilter !== 'all') {
        const convDate = new Date(conv.created_at)
        const days =
          dateFilter === 'today'
            ? 1
            : dateFilter === 'week'
              ? 7
              : dateFilter === 'month'
                ? 30
                : 0
        if (days > 0) {
          const ago = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
          if (convDate < ago) return false
        }
      }

      // session filter
      if (sessionFilter !== 'all' && !conv.session_id.includes(sessionFilter))
        return false

      return true
    })

    setFilteredConversations(filtered)
    setCurrentPage(1)
  }, [conversations, searchTerm, dateFilter, sessionFilter])

  const uniqueSessions = useMemo(
    () => [...new Set(conversations.map((c) => c.session_id))],
    [conversations]
  )
  const currentConversations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredConversations.slice(start, end)
  }, [filteredConversations, currentPage])
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage)

  // --- Export CSV ---
  const exportConversations = useCallback(() => {
    const csvContent = [
      [
        'Date',
        'Session ID',
        'User Message',
        'Agent Response',
        'Tokens Used',
        'Response Time (ms)'
      ],
      ...filteredConversations.map((conv) => [
        format(new Date(conv.created_at), 'yyyy-MM-dd HH:mm:ss'),
        conv.session_id,
        conv.user_message,
        conv.agent_response,
        conv.metadata?.tokens_used || 0,
        conv.metadata?.response_time_ms || 0
      ])
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversations-${agent?.name || 'agent'}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Conversations exported successfully!')
  }, [filteredConversations, agent?.name])

  // --- Delete conversation (optimistic) ---
  const handleDeleteConversation = useCallback(
    async (conversationId) => {
      if (!confirm('Are you sure you want to delete this conversation?')) return
      const prev = conversations
      try {
        setConversations((prevList) =>
          prevList.filter((c) => c.id !== conversationId)
        )
        await deleteConversation(conversationId)
        toast.success('Conversation deleted')
      } catch (err) {
        console.error(err)
        toast.error('Failed to delete conversation')
        setConversations(prev)
      }
    },
    [conversations]
  )

  const viewDetails = useCallback((conv) => {
    setSelectedConversation(conv)
    setShowDetailsModal(true)
  }, [])

  if (loading) return <LoadingState message='Loading...' />

  return (
    <>
      
        <NeonBackground />
        <SideBarLayout>
          <Suspense fallback={<LoadingState message='Loading UI...' />}> 
          <div className='relative w-full flex-1 font-mono text-neutral-100'>
            <div className='sticky top-0 z-10 mb-10 flex h-16 items-center'>
              <NavigationBar
                profile={profile}
                message={message}
                title={title}
                agent={agent}
                fetchData={fetchAgentAndConversations}
                exportConversations={exportConversations}
                onLogOutClick={logout}
              />
            </div>

            <div className='mx-auto max-w-7xl px-4 py-8 pt-5 sm:px-6 lg:px-8'>
              <StatsGrid stats={stats} />

              <Filters
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                sessionFilter={sessionFilter}
                setSessionFilter={setSessionFilter}
                uniqueSessions={uniqueSessions}
                onSearch={setSearchTerm}
              />

              <Card>
                <div className='card-header'>
                  <h3 className='text-lg font-semibold text-neutral-200'>
                    Conversations
                  </h3>
                </div>
                <div className='card-content'>
                  {filteredConversations.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className='divide-y divide-neutral-700'>
                        {currentConversations.map((conv) => (
                          <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            onView={() => viewDetails(conv)}
                            onDelete={() => handleDeleteConversation(conv.id)}
                            searchTerm={searchTerm}
                          />
                        ))}
                      </div>
                      {totalPages > 1 && (
                        <div className='border-t border-neutral-700 p-6'>
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredConversations.length}
                            itemsPerPage={itemsPerPage}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>

              {showDetailsModal && selectedConversation && (
                <ConversationDetailsModal
                  conversation={selectedConversation}
                  onClose={() => {
                    setShowDetailsModal(false)
                    setSelectedConversation(null)
                  }}
                />
              )}
            </div>
          </div></Suspense>
        </SideBarLayout>
      
    </>
  )
}

/* ------------------- Helper / Subcomponents ------------------- */

const StatsGrid = ({ stats }) => (
  <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-4'>
    <Card>
      <div className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-neutral-400'>
              Total Conversations
            </p>
            <p className='text-2xl font-bold text-neutral-200'>
              {stats.totalConversations}
            </p>
          </div>
          <MessageSquare className='h-8 w-8 text-orange-400' />
        </div>
      </div>
    </Card>

    <Card>
      <div className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-neutral-400'>
              Unique Sessions
            </p>
            <p className='text-2xl font-bold text-neutral-200'>
              {stats.totalSessions}
            </p>
          </div>
          <User className='h-8 w-8 text-green-400' />
        </div>
      </div>
    </Card>

    <Card>
      <div className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-neutral-400'>
              Avg Messages/Session
            </p>
            <p className='text-2xl font-bold text-neutral-200'>
              {stats.avgMessagesPerSession}
            </p>
          </div>
          <TrendingUp className='h-8 w-8 text-purple-400' />
        </div>
      </div>
    </Card>

    <Card>
      <div className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-neutral-400'>
              Avg Response Time
            </p>
            <p className='text-2xl font-bold text-neutral-200'>
              {stats.avgResponseTime}ms
            </p>
          </div>
          <Clock className='h-8 w-8 text-orange-400' />
        </div>
      </div>
    </Card>
  </div>
)

const Filters = ({
  dateFilter,
  setDateFilter,
  sessionFilter,
  setSessionFilter,
  uniqueSessions,
  onSearch
}) => (
  <Card className='mb-6'>
    <div className='p-6'>
      <div className='grid gap-4 md:grid-cols-3'>
        <div>
          <label className='mb-2 block text-sm font-medium text-neutral-400'>
            Search
          </label>
          <SearchBar
            onSearch={onSearch}
            placeholder='Search conversations...'
            className='w-full'
          />
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-neutral-400'>
            Date Range
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className='input h-10 w-full rounded-full bg-neutral-900 px-4'
          >
            <option value='all'>All Time</option>
            <option value='today'>Today</option>
            <option value='week'>Last 7 Days</option>
            <option value='month'>Last 30 Days</option>
          </select>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-neutral-400'>
            Session
          </label>
          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className='input h-10 w-full rounded-full bg-neutral-900 px-4'
          >
            <option value='all'>All Sessions</option>
            {uniqueSessions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  </Card>
)

const EmptyState = () => (
  <div className='py-12 text-center'>
    <MessageSquare className='mx-auto mb-3 h-12 w-12 text-neutral-600' />
    <p className='text-neutral-400'>No conversations found</p>
    <p className='text-sm text-neutral-500'>
      Try adjusting filters or check back later.
    </p>
  </div>
)

// Conversation list item (kept identical UI)
function ConversationItem({ conversation, onView, onDelete, searchTerm }) {
  return (
    <div className='rounded-lg border border-neutral-700 p-6 transition-colors hover:bg-neutral-800'>
      <div className='flex items-start justify-between'>
        <div className='min-w-0 flex-1'>
          <div className='mb-3 flex items-center space-x-3'>
            <Badge
              variant='outline'
              className='border-neutral-600 text-xs text-neutral-400'
            >
              Session:{' '}
              <HighlightText
                text={conversation.session_id.slice(-8)}
                highlight={searchTerm}
              />
            </Badge>
            <span className='text-xs text-neutral-400'>
              {formatDistanceToNow(new Date(conversation.created_at), {
                addSuffix: true
              })}
            </span>
            {conversation.metadata?.tokens_used && (
              <Badge
                variant='secondary'
                className='bg-neutral-700 text-xs text-neutral-400'
              >
                {conversation.metadata.tokens_used} tokens
              </Badge>
            )}
          </div>

          <div className='space-y-3'>
            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700'>
                  <User className='h-4 w-4 text-neutral-400' />
                </div>
              </div>
              <div className='flex-1'>
                <p className='mb-1 text-sm font-medium text-neutral-200'>
                  User
                </p>
                <p className='line-clamp-2 text-sm text-neutral-300'>
                  <HighlightText
                    text={conversation.user_message || ''}
                    highlight={searchTerm}
                  />
                </p>
              </div>
            </div>

            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-orange-900/20'>
                  <LoaderPinwheel className='h-4 w-4 text-orange-600' />
                </div>
              </div>
              <div className='flex-1'>
                <p className='mb-1 text-sm font-medium text-neutral-200'>
                  Agent
                </p>
                <p className='line-clamp-2 text-sm text-neutral-300'>
                  <HighlightText
                    text={conversation.agent_response || ''}
                    highlight={searchTerm}
                  />
                </p>
              </div>
            </div>
          </div>

          {conversation.metadata?.response_time_ms && (
            <div className='mt-3 text-xs text-neutral-400'>
              Response time: {conversation.metadata.response_time_ms}ms
            </div>
          )}
        </div>

        <div className='ml-4 flex items-center space-x-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onView}
            className='text-neutral-400 hover:bg-neutral-700'
          >
            <Eye className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={onDelete}
            className='text-red-400 hover:bg-neutral-700 hover:text-red-300'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Conversation details modal (kept identical UI)
function ConversationDetailsModal({ conversation, onClose }) {
  return (
    <Modal isOpen onClose={onClose} title='Conversation Details' size='lg'>
      <div className='space-y-6'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-neutral-400'>
              Session ID
            </label>
            <p className='mt-1 font-mono text-sm text-neutral-200'>
              {conversation.session_id}
            </p>
          </div>
          <div>
            <label className='block text-sm font-medium text-neutral-400'>
              Timestamp
            </label>
            <p className='mt-1 text-sm text-neutral-200'>
              {format(new Date(conversation.created_at), 'PPpp')}
            </p>
          </div>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-neutral-400'>
            User Message
          </label>
          <div className='rounded-lg bg-neutral-800 p-4'>
            <p className='text-sm whitespace-pre-wrap text-neutral-200'>
              {conversation.user_message}
            </p>
          </div>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-neutral-400'>
            Agent Response
          </label>
          <div className='rounded-lg border border-orange-900/20 bg-orange-400/20 p-4'>
            <p className='text-sm whitespace-pre-wrap text-neutral-200'>
              {conversation.agent_response}
            </p>
          </div>
        </div>

        {conversation.metadata && (
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-400'>
              Technical Details
            </label>
            <div className='space-y-2 rounded-lg border border-neutral-700 bg-neutral-800 p-4'>
              {conversation.metadata.tokens_usage_metadata && (
                <div className='mt-2 rounded-lg border border-neutral-700 bg-neutral-900 p-2'>
                  <p className='mb-1 text-xs text-neutral-300'>
                    Token Breakdown:
                  </p>
                  <div className='flex justify-between text-xs'>
                    <span className='text-neutral-400'>Prompt Tokens:</span>
                    <span className='text-neutral-300'>
                      {
                        conversation.metadata.tokens_usage_metadata
                          .prompt_tokens
                      }
                    </span>
                  </div>
                  <div className='flex justify-between text-xs'>
                    <span className='text-neutral-400'>Completion Tokens:</span>
                    <span className='text-neutral-300'>
                      {
                        conversation.metadata.tokens_usage_metadata
                          .completion_tokens
                      }
                    </span>
                  </div>
                  <div className='flex justify-between text-xs'>
                    <span className='text-neutral-400'>Total Tokens:</span>
                    <span className='text-neutral-300'>
                      {conversation.metadata.tokens_usage_metadata.total_tokens}
                    </span>
                  </div>
                </div>
              )}

              {conversation.metadata.tokens_used && (
                <div className='flex justify-between text-sm'>
                  <span className='text-neutral-400'>Tokens Used:</span>
                  <span className='font-medium text-neutral-200'>
                    {conversation.metadata.tokens_used}
                  </span>
                </div>
              )}
              {conversation.metadata.response_time_ms && (
                <div className='flex justify-between text-sm'>
                  <span className='text-neutral-400'>Response Time:</span>
                  <span className='font-medium text-neutral-200'>
                    {conversation.metadata.response_time_ms}ms
                  </span>
                </div>
              )}
              {conversation.metadata.model && (
                <div className='flex justify-between text-sm'>
                  <span className='text-neutral-400'>Model:</span>
                  <span className='font-medium text-neutral-200'>
                    {conversation.metadata.model}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <details className='rounded-lg border border-neutral-700'>
          <summary className='cursor-pointer p-4 text-sm font-medium text-neutral-400'>
            View Raw Metadata
          </summary>
          <div className='border-t border-neutral-700 bg-neutral-800 p-4'>
            <pre className='overflow-x-auto text-xs text-neutral-100'>
              {JSON.stringify(conversation.metadata, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </Modal>
  )
}

// Simple highlight helper for search matches
function HighlightText({ text = '', highlight = '' }) {
  if (!highlight) return <>{text}</>

  const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi')
  const parts = String(text).split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className='bg-orange-400 text-black'>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
