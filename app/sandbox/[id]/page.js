'use client'

import {
  Aperture,
  ArrowLeft,
  MessageCircle,
  RefreshCw,
  Send,
  X,
  Zap,
  Users,
  UserPlus,
  Mail,
  Copy,
  Check,
  Trash2,
  Eye,
  Clock,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import LoadingState from '../../../components/common/loading-state'
import { useAuth } from '../../../components/providers/AuthProvider'
import NeonBackground from '../../../components/ui/background'
import Button from '../../../components/ui/button'
import Card from '../../../components/ui/card'
import BottomModal from '../../../components/ui/modal'
import {
  useAgent,
  useTestAccounts,
  useCreateTestAccount,
  useDeleteTestAccount,
  useUpdateTestAccount,
  useCopyTestLink,
  useSandboxSendChatMessage
} from '../../../lib/hooks/useAgentData'
import ChatSandboxSkeleton from '../../../components/skeleton/ChatSandboxSkeleton'

/**
 * FULLY OPTIMIZED Chat Sandbox Component
 *
 * React Query Integration:
 * - Automatic data fetching with caching
 * - Optimistic updates for better UX
 * - No manual state management for server data
 * - Consistent with Dashboard patterns
 *
 * Performance:
 * - Memoized components
 * - Smart caching prevents re-fetching
 * - Parallel data loading
 * - Optimized rendering
 */

// Color options for bot customization
const COLOR_OPTIONS = [
  { name: 'Orange', value: '#EA580C', class: 'bg-orange-600' },
  { name: 'Blue', value: '#2563EB', class: 'bg-blue-600' },
  { name: 'Green', value: '#16A34A', class: 'bg-green-600' },
  { name: 'Purple', value: '#9333EA', class: 'bg-purple-600' },
  { name: 'Red', value: '#DC2626', class: 'bg-red-600' },
  { name: 'Pink', value: '#DB2777', class: 'bg-pink-600' },
  { name: 'Teal', value: '#0D9488', class: 'bg-teal-600' },
  { name: 'Amber', value: '#D97706', class: 'bg-amber-600' },
  { name: 'Indigo', value: '#4F46E5', class: 'bg-indigo-600' },
  { name: 'Gray', value: '#6B7280', class: 'bg-gray-600' }
]

const BOT_COLOR_MODES = [
  { id: 'light', label: '☀️ Light', emoji: '☀️' },
  { id: 'dark', label: '🌙 Dark', emoji: '🌙' },
  { id: 'night', label: '🌓 Night', emoji: '🌓' }
]

/**
 * Memoized Toast Notification Component
 */
const Toast = memo(({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${
        type === 'success'
          ? 'border-green-600/50 bg-green-900/90 text-green-100'
          : type === 'error'
            ? 'border-red-600/50 bg-red-900/90 text-red-100'
            : 'border-orange-600/50 bg-orange-900/90 text-orange-100'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className='h-5 w-5' />
      ) : type === 'error' ? (
        <AlertCircle className='h-5 w-5' />
      ) : (
        <AlertCircle className='h-5 w-5' />
      )}
      <p className='text-sm font-medium'>{message}</p>
      <button onClick={onClose} className='ml-2'>
        <X className='h-4 w-4' />
      </button>
    </div>
  )
})
Toast.displayName = 'Toast'

/**
 * Memoized Sub Account Card Component
 */
const SubAccountCard = memo(
  ({ account, onDelete, onCopyLink, onResendInvite }) => {
    const [copied, setCopied] = useState(false)
    const [resending, setResending] = useState(false)

    const handleCopy = useCallback(() => {
      onCopyLink(account)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }, [account, onCopyLink])

    const handleResend = useCallback(async () => {
      setResending(true)
      await onResendInvite(account.id)
      setResending(false)
    }, [account.id, onResendInvite])

    const formatLastActive = useCallback((lastActive) => {
      if (!lastActive) return 'Never'
      return formatDistanceToNow(new Date(lastActive), { addSuffix: true })
    }, [])

    const getStatusColor = useCallback((status) => {
      switch (status) {
        case 'active':
          return 'bg-green-900/40 text-green-300 ring-1 ring-green-500/50'
        case 'invited':
          return 'bg-blue-900/40 text-blue-300 ring-1 ring-blue-500/50'
        case 'suspended':
          return 'bg-yellow-900/40 text-yellow-300 ring-1 ring-yellow-500/50'
        case 'expired':
          return 'bg-red-900/40 text-red-300 ring-1 ring-red-500/50'
        default:
          return 'bg-neutral-800 text-neutral-400'
      }
    }, [])

    return (
      <div className='group rounded-lg border border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20 p-4 transition-all hover:border-orange-600/30 hover:from-orange-900/10'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-900/40 ring-1 ring-orange-500/50'>
              <Users className='h-5 w-5 text-orange-400' />
            </div>
            <div>
              <h4 className='font-semibold text-neutral-100'>{account.name}</h4>
              <p className='text-sm text-neutral-400'>{account.email}</p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {account.status === 'invited' && (
              <button
                onClick={handleResend}
                disabled={resending}
                className='rounded-lg border border-neutral-700 bg-neutral-800/50 p-2 text-neutral-400 transition-colors hover:border-blue-500/50 hover:bg-blue-900/20 hover:text-blue-400 disabled:opacity-50'
                title='Resend invitation'
              >
                <Mail
                  className={`h-4 w-4 ${resending ? 'animate-pulse' : ''}`}
                />
              </button>
            )}
            <button
              onClick={handleCopy}
              className='rounded-lg border border-neutral-700 bg-neutral-800/50 p-2 text-neutral-400 transition-colors hover:border-orange-500/50 hover:bg-orange-900/20 hover:text-orange-400'
              title='Copy test link'
            >
              {copied ? (
                <Check className='h-4 w-4 text-green-400' />
              ) : (
                <Copy className='h-4 w-4' />
              )}
            </button>
            <button
              onClick={() => onDelete(account.id)}
              className='rounded-lg border border-neutral-700 bg-neutral-800/50 p-2 text-neutral-400 transition-colors hover:border-red-500/50 hover:bg-red-900/20 hover:text-red-400'
              title='Delete account'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </div>
        </div>

        <div className='mt-4 flex items-center justify-between border-t border-neutral-800/50 pt-3 text-xs text-neutral-500'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              <MessageCircle className='h-3 w-3' />
              <span>{account.sessions_count || 0} sessions</span>
            </div>
            <div className='flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              <span>{formatLastActive(account.last_active_at)}</span>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getStatusColor(account.status)}`}
          >
            {account.status || 'Invited'}
          </span>
        </div>
      </div>
    )
  }
)
SubAccountCard.displayName = 'SubAccountCard'

/**
 * Memoized Invite Modal Component
 */
const InviteModal = memo(({ isOpen, onClose, onInvite, agentId }) => {
  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    expiresInDays: 30,
    maxSessions: 100,
    sendEmail: true,
    notes: ''
  })
  const [error, setError] = useState('')

  const createTestAccount = useCreateTestAccount(agentId)

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')

      try {
        await createTestAccount.mutateAsync(inviteData)
        setInviteData({
          name: '',
          email: '',
          expiresInDays: 30,
          maxSessions: 100,
          sendEmail: true,
          notes: ''
        })
        onClose()
      } catch (err) {
        setError(err.message)
      }
    },
    [inviteData, createTestAccount, onClose]
  )

  return (
    <BottomModal isOpen={isOpen} onClose={onClose}>
      <div className='space-y-6'>
        <div className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-900/40 ring-1 ring-orange-500/50'>
            <UserPlus className='h-8 w-8 text-orange-400' />
          </div>
          <h3 className='text-2xl font-bold text-neutral-100'>
            Invite Test User
          </h3>
          <p className='mt-2 text-sm text-neutral-400'>
            Create a sub-account for customer testing
          </p>
        </div>

        {error && (
          <div className='rounded-lg border border-red-600/50 bg-red-900/20 p-3 text-sm text-red-300'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-4 w-4' />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Customer Name *
            </label>
            <input
              type='text'
              value={inviteData.name}
              onChange={(e) =>
                setInviteData({ ...inviteData, name: e.target.value })
              }
              placeholder='John Doe'
              className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
              required
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Email Address *
            </label>
            <input
              type='email'
              value={inviteData.email}
              onChange={(e) =>
                setInviteData({ ...inviteData, email: e.target.value })
              }
              placeholder='john@example.com'
              className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
              required
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Expires In (Days)
              </label>
              <input
                type='number'
                value={inviteData.expiresInDays}
                onChange={(e) =>
                  setInviteData({
                    ...inviteData,
                    expiresInDays: parseInt(e.target.value) || 30
                  })
                }
                min='1'
                max='365'
                className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Max Sessions
              </label>
              <input
                type='number'
                value={inviteData.maxSessions}
                onChange={(e) =>
                  setInviteData({
                    ...inviteData,
                    maxSessions: parseInt(e.target.value) || 100
                  })
                }
                min='1'
                max='1000'
                className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
              />
            </div>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Internal Notes (Optional)
            </label>
            <textarea
              value={inviteData.notes}
              onChange={(e) =>
                setInviteData({ ...inviteData, notes: e.target.value })
              }
              placeholder='Add any internal notes about this test account...'
              rows={3}
              className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
            />
          </div>

          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='sendEmail'
              checked={inviteData.sendEmail}
              onChange={(e) =>
                setInviteData({ ...inviteData, sendEmail: e.target.checked })
              }
              className='h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-orange-600 focus:ring-2 focus:ring-orange-500/50'
            />
            <label htmlFor='sendEmail' className='text-sm text-neutral-300'>
              Send invitation email automatically
            </label>
          </div>

          <div className='flex gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              className='flex-1'
              onClick={onClose}
              disabled={createTestAccount.isPending}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='flex-1'
              disabled={
                createTestAccount.isPending ||
                !inviteData.name ||
                !inviteData.email
              }
            >
              {createTestAccount.isPending ? (
                <>
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <Mail className='mr-2 h-4 w-4' />
                  {inviteData.sendEmail ? 'Send Invite' : 'Create Account'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </BottomModal>
  )
})
InviteModal.displayName = 'InviteModal'

/**
 * Memoized Chat Message Component
 */
const ChatMessage = memo(({ message, isUser, botColor, botColorMode }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/20'
            : 'border border-neutral-800/50 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 text-neutral-100'
        }`}
      >
        <p className='text-sm leading-relaxed'>{message.content}</p>
      </div>
    </div>
  )
})
ChatMessage.displayName = 'ChatMessage'

/**
 * Memoized Typing Indicator Component
 */
const TypingIndicator = memo(() => (
  <div className='flex justify-start'>
    <div className='rounded-2xl border border-neutral-800/50 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 px-4 py-2.5'>
      <div className='flex space-x-1'>
        <div className='h-2 w-2 animate-bounce rounded-full bg-neutral-400' />
        <div
          className='h-2 w-2 animate-bounce rounded-full bg-neutral-400'
          style={{ animationDelay: '0.1s' }}
        />
        <div
          className='h-2 w-2 animate-bounce rounded-full bg-neutral-400'
          style={{ animationDelay: '0.2s' }}
        />
      </div>
    </div>
  </div>
))
TypingIndicator.displayName = 'TypingIndicator'

/**
 * Memoized Quick Test Messages Component
 */
const QuickTestMessages = memo(({ messages, onSelect }) => (
  <div className='border-t border-neutral-800/50 bg-neutral-900/50 p-4'>
    <h4 className='mb-3 text-sm font-medium text-neutral-300'>Quick Tests</h4>
    <div className='grid grid-cols-2 gap-2 lg:grid-cols-3'>
      {messages.map((msg, index) => (
        <Button
          key={index}
          variant='ghost'
          size='sm'
          className='justify-start text-left text-xs'
          onClick={() => onSelect(msg)}
        >
          {msg}
        </Button>
      ))}
    </div>
  </div>
))
QuickTestMessages.displayName = 'QuickTestMessages'

/**
 * Main Chat Sandbox Component
 */
export default function ChatSandbox() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const chatEndRef = useRef(null)

  // React Query hooks - fully optimized data fetching
  const {
    data: agent,
    isLoading: agentLoading,
    error: agentError
  } = useAgent(id)

  const { data: testAccountsData, isLoading: testAccountsLoading } =
    useTestAccounts(id)

  const subAccounts = testAccountsData?.testAccounts || []
  const subAccountsStats = testAccountsData?.stats || null

  // Mutations
  const deleteTestAccount = useDeleteTestAccount(id)
  const updateTestAccount = useUpdateTestAccount(id)
  const copyTestLink = useCopyTestLink()
  const sendChatMessage = useSandboxSendChatMessage(id)

  // Local UI state (not server data)
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! How can I help you today?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [botColor, setBotColor] = useState('#EA580C')
  const [botColorMode, setBotColorMode] = useState('light')
  const [showPreview, setShowPreview] = useState(false)
  const [tokenCount, setTokenCount] = useState(0)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSubAccountsPanel, setShowSubAccountsPanel] = useState(false)
  const [toast, setToast] = useState(null)

  // Quick test messages
  const quickTestMessages = useMemo(
    () => [
      'Hello, I need help with my account',
      'What are your pricing plans?',
      "I'm having trouble with my order",
      'Can you help me schedule a demo?',
      'What services do you offer?'
    ],
    []
  )

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Handle chat message send - using React Query mutation
  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || !agent || sendChatMessage.isPending) return

    const userMessage = chatInput
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setChatInput('')

    try {
      const data = await sendChatMessage.mutateAsync({
        message: userMessage,
        userId: user?.id,
        metadata: { sandbox: true }
      })

      const botResponseContent = data.response || '⚠️ No response from bot'

      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: botResponseContent }
      ])

      if (data.tokensUsed) {
        setTokenCount((prev) => prev + data.tokensUsed)
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Unexpected error occurred.' }
      ])
    }
  }, [chatInput, agent, sendChatMessage, user])

  // Clear chat
  const clearChat = useCallback(() => {
    setChatMessages([
      { role: 'assistant', content: 'Hi! How can I help you today?' }
    ])
    setTokenCount(0)
  }, [])

  // Handle delete sub-account - using React Query mutation
  const handleDeleteSubAccount = useCallback(
    async (accountId) => {
      if (
        !confirm(
          'Are you sure you want to delete this test account? This will also delete all associated sessions and data.'
        )
      ) {
        return
      }

      await deleteTestAccount.mutateAsync(accountId)
    },
    [deleteTestAccount]
  )

  // Handle copy test link - using React Query mutation
  const handleCopyTestLink = useCallback(
    async (account) => {
      const testLink =
        account.testLink ||
        `${window.location.origin}/test/${account.access_token}`
      await copyTestLink.mutateAsync(testLink)
    },
    [copyTestLink]
  )

  // Handle resend invitation - using React Query mutation
  const handleResendInvite = useCallback(
    async (accountId) => {
      await updateTestAccount.mutateAsync({
        accountId,
        updates: { action: 'resend_invitation' }
      })
    },
    [updateTestAccount]
  )

  // Navigate to full sub-accounts management page
  const goToSubAccountsPage = useCallback(() => {
    router.push(`/agents/${id}/test-accounts`)
  }, [id, router])
  const [delayedLoading, setDelayedLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  // Loading state
  if (delayedLoading) {
    return (
      <LoadingState message='Loading sandbox...' className='min-h-screen' />
    )
  }
  if (authLoading || agentLoading) {
    return <ChatSandboxSkeleton userProfile={userProfile} />
  }
  // Error state
  if (agentError) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <Card className='max-w-md border-red-600/30 bg-gradient-to-br from-red-900/20 to-neutral-950/50'>
          <div className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/40'>
              <X className='h-8 w-8 text-red-400' />
            </div>
            <h3 className='mb-2 text-xl font-bold text-neutral-100'>Error</h3>
            <p className='text-sm text-neutral-400'>{agentError.message}</p>
            <Button
              className='mt-6'
              onClick={() => router.push(`/agents/${id}/manage`)}
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Agents
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
        {/* Sticky Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
          <div className='flex h-16 items-center justify-between px-6'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => router.push(`/agents/${agent?.id}/manage`)}
                className='rounded-lg p-2 transition-colors hover:bg-neutral-800'
              >
                <ArrowLeft className='h-5 w-5 text-neutral-400' />
              </button>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-900/40 ring-1 ring-orange-500/50'>
                  <Aperture className='h-6 w-6 text-orange-400' />
                </div>
                <div>
                  <h1 className='text-lg font-bold text-neutral-100'>
                    Agent Testing Sandbox
                  </h1>
                  <p className='text-xs text-neutral-400'>
                    {agent?.name || 'Loading...'}
                  </p>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-6 text-sm'>
              <div className='flex items-center gap-2'>
                <Zap className='h-4 w-4 text-purple-400' />
                <span className='text-neutral-400'>
                  Credits:{' '}
                  <span className='font-semibold text-purple-400'>
                    {profile?.api_credits || 8450}
                  </span>
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <MessageCircle className='h-4 w-4 text-green-400' />
                <span className='text-neutral-400'>
                  Tokens:{' '}
                  <span className='font-semibold text-green-400'>
                    {tokenCount}
                  </span>
                </span>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowSubAccountsPanel(!showSubAccountsPanel)}
                className='flex items-center gap-2'
              >
                <Users className='h-4 w-4' />
                Sub Accounts ({subAccounts.length})
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='custom-scrollbar flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-7xl px-6 py-8'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
              {/* Left Sidebar - Settings */}
              <div className='space-y-6 lg:col-span-3'>
                <Card className='border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20'>
                  <div className='space-y-6'>
                    {/* Header */}
                    <div>
                      <h3 className='text-lg font-bold text-neutral-100'>
                        <span className='text-orange-400'>Quick</span> Actions
                      </h3>
                      <p className='mt-1 text-xs text-neutral-500'>
                        Manage your test session
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className='space-y-3'>
                      <Button
                        variant='ghost'
                        className='w-full justify-start'
                        onClick={clearChat}
                      >
                        <RefreshCw className='mr-2 h-4 w-4' />
                        Clear Chat
                      </Button>

                      <Button
                        variant='ghost'
                        className='w-full justify-start'
                        onClick={() => setShowPreview(true)}
                      >
                        <Eye className='mr-2 h-4 w-4' />
                        Preview Widget
                      </Button>

                      <Button
                        variant='ghost'
                        className='w-full justify-start'
                        onClick={() => setShowInviteModal(true)}
                      >
                        <UserPlus className='mr-2 h-4 w-4' />
                        Invite Test User
                      </Button>

                      <Button
                        variant='ghost'
                        className='w-full justify-start'
                        onClick={goToSubAccountsPage}
                      >
                        <ExternalLink className='mr-2 h-4 w-4' />
                        Manage All Accounts
                      </Button>
                    </div>

                    {/* Bot Accent Color */}
                    <div className='space-y-3 border-t border-neutral-800/50 pt-4'>
                      <label className='block text-sm font-medium text-neutral-300'>
                        Bot Accent Color
                      </label>

                      {/* Color Palette */}
                      <div className='flex flex-wrap gap-2'>
                        {COLOR_OPTIONS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setBotColor(color.value)}
                            className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                              botColor === color.value
                                ? 'border-white ring-2 ring-white/50'
                                : 'border-neutral-700'
                            } ${color.class}`}
                            title={color.name}
                          />
                        ))}
                      </div>

                      {/* Mode Buttons */}
                      <div className='grid grid-cols-3 gap-2'>
                        {BOT_COLOR_MODES.map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => setBotColorMode(mode.id)}
                            className={`rounded-lg border px-2 py-1.5 text-center text-xs font-medium transition-colors ${
                              botColorMode === mode.id
                                ? 'border-orange-500 bg-orange-900/40 text-orange-300'
                                : 'border-neutral-700 bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800'
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>

                      {/* Manual Color Input */}
                      <input
                        type='text'
                        value={botColor}
                        onChange={(e) => setBotColor(e.target.value)}
                        placeholder='#EA580C'
                        className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
                      />
                      <p className='text-xs text-neutral-500'>
                        Choose or enter your bot&apos;s accent color
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Sub Accounts Panel */}
                {showSubAccountsPanel && (
                  <Card className='border-orange-600/30 bg-gradient-to-br from-orange-900/20 to-neutral-950/20'>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='text-lg font-bold text-neutral-100'>
                            <span className='text-orange-400'>Test</span> Users
                          </h3>
                          <p className='text-xs text-neutral-500'>
                            {subAccounts.length} invited
                          </p>
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            onClick={() => setShowInviteModal(true)}
                          >
                            <UserPlus className='mr-1 h-3 w-3' />
                            Invite
                          </Button>
                        </div>
                      </div>

                      {/* Stats Summary */}
                      {subAccountsStats && (
                        <div className='grid grid-cols-2 gap-3 rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-3'>
                          <div className='text-center'>
                            <p className='text-xs text-neutral-500'>
                              Total Sessions
                            </p>
                            <p className='text-lg font-bold text-orange-400'>
                              {subAccountsStats.totalSessions || 0}
                            </p>
                          </div>
                          <div className='text-center'>
                            <p className='text-xs text-neutral-500'>
                              Active Users
                            </p>
                            <p className='text-lg font-bold text-green-400'>
                              {subAccountsStats.activeAccounts || 0}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Accounts List */}
                      <div className='custom-scrollbar max-h-[500px] space-y-3 overflow-y-auto'>
                        {testAccountsLoading ? (
                          <div className='rounded-lg border border-neutral-800/50 bg-neutral-900/20 p-6 text-center'>
                            <RefreshCw className='mx-auto mb-2 h-8 w-8 animate-spin text-orange-400' />
                            <p className='text-sm text-neutral-400'>
                              Loading test accounts...
                            </p>
                          </div>
                        ) : subAccounts.length === 0 ? (
                          <div className='rounded-lg border border-neutral-800/50 bg-neutral-900/20 p-6 text-center'>
                            <Users className='mx-auto mb-2 h-8 w-8 text-neutral-600' />
                            <p className='text-sm text-neutral-400'>
                              No test users yet
                            </p>
                            <Button
                              size='sm'
                              className='mt-3'
                              onClick={() => setShowInviteModal(true)}
                            >
                              Invite First User
                            </Button>
                          </div>
                        ) : (
                          subAccounts.map((account) => (
                            <SubAccountCard
                              key={account.id}
                              account={account}
                              onDelete={handleDeleteSubAccount}
                              onCopyLink={handleCopyTestLink}
                              onResendInvite={handleResendInvite}
                            />
                          ))
                        )}
                      </div>

                      {/* View All Link */}
                      {subAccounts.length > 0 && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='w-full'
                          onClick={goToSubAccountsPage}
                        >
                          View All Test Accounts
                          <ExternalLink className='ml-2 h-3 w-3' />
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </div>

              {/* Main Chat Interface */}
              <div className='lg:col-span-9'>
                <Card className='flex h-[calc(100vh-180px)] flex-col border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20'>
                  {/* Chat Header */}
                  <div className='flex items-center justify-between border-b border-neutral-800/50 bg-neutral-900/50 p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='relative'>
                        <div className='absolute inset-0 bg-orange-500/50 opacity-50 blur-lg' />
                        <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-900/40 ring-1 ring-orange-500/50'>
                          <Aperture className='h-5 w-5 text-orange-400' />
                        </div>
                      </div>
                      <div>
                        <h3 className='font-semibold text-neutral-100'>
                          {agent?.name || 'AI Assistant'}
                        </h3>
                        <p className='text-xs text-neutral-400 capitalize'>
                          {agent?.domain || 'General'} •{' '}
                          {agent?.persona || 'Helpful'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-neutral-400'>
                      <div className='h-2 w-2 animate-pulse rounded-full bg-green-400' />
                      <span>Online</span>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className='custom-scrollbar flex-1 space-y-4 overflow-y-auto bg-neutral-900/30 p-4'>
                    {chatMessages.map((message, idx) => (
                      <ChatMessage
                        key={idx}
                        message={message}
                        isUser={message.role === 'user'}
                        botColor={botColor}
                        botColorMode={botColorMode}
                      />
                    ))}

                    {/* Typing Indicator */}
                    {sendChatMessage.isPending && <TypingIndicator />}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className='border-t border-neutral-800/50 bg-neutral-900/50 p-4'>
                    <div className='flex gap-3'>
                      <textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder='Type your message...'
                        rows={1}
                        className='custom-scrollbar flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={
                          !chatInput.trim() || sendChatMessage.isPending
                        }
                        className='px-6'
                      >
                        <Send className='h-4 w-4' />
                      </Button>
                    </div>
                    <p className='mt-2 text-xs text-neutral-500'>
                      Press{' '}
                      <kbd className='rounded bg-neutral-800 px-1.5 py-0.5'>
                        Enter
                      </kbd>{' '}
                      to send
                    </p>
                  </div>

                  {/* Quick Test Messages */}
                  <QuickTestMessages
                    messages={quickTestMessages}
                    onSelect={setChatInput}
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Preview Modal */}
      {showPreview && (
        <>
          <div
            className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm'
            onClick={() => setShowPreview(false)}
          />
          <div
            className='fixed right-6 bottom-6 z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-300'
            style={{
              width: '22rem',
              height: '600px',
              border: `2px solid ${botColor}`,
              backgroundColor:
                botColorMode === 'light'
                  ? '#fff'
                  : botColorMode === 'dark'
                    ? '#1a1a1a'
                    : '#0a0a0a',
              transform: showPreview ? 'translateY(0)' : 'translateY(50px)',
              opacity: showPreview ? 1 : 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className='flex items-center gap-3 p-4'
              style={{ backgroundColor: botColor }}
            >
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lg'>
                <Aperture className='h-5 w-5' style={{ color: botColor }} />
              </div>
              <div className='flex-1'>
                <h3
                  className={`font-semibold ${botColorMode === 'light' ? 'text-neutral-900' : 'text-white'}`}
                >
                  AI Assistant
                </h3>
                <p
                  className={`flex items-center gap-1 text-xs ${botColorMode === 'light' ? 'text-neutral-700' : 'text-white/80'}`}
                >
                  <span className='h-1.5 w-1.5 rounded-full bg-green-400' />
                  Online now
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className={`rounded-lg p-1 transition-colors ${botColorMode === 'light' ? 'hover:bg-black/10' : 'hover:bg-white/10'}`}
              >
                <X
                  className='h-5 w-5'
                  style={{ color: botColorMode === 'light' ? '#000' : '#fff' }}
                />
              </button>
            </div>
            <div
              className='custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4'
              style={{
                backgroundColor:
                  botColorMode === 'light'
                    ? '#f9fafb'
                    : botColorMode === 'dark'
                      ? '#1a1a1a'
                      : '#0a0a0a'
              }}
            >
              {chatMessages.map((message, idx) => {
                const isUser = message.role === 'user'
                return (
                  <div
                    key={idx}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                      style={{
                        backgroundColor: isUser
                          ? botColor
                          : botColorMode === 'light'
                            ? '#e5e7eb'
                            : '#2a2a2a',
                        color: isUser
                          ? '#fff'
                          : botColorMode === 'light'
                            ? '#111827'
                            : '#f9fafb'
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                )
              })}
              {sendChatMessage.isPending && (
                <div className='flex justify-start'>
                  <div
                    className='rounded-2xl rounded-tl-sm px-4 py-2'
                    style={{
                      backgroundColor:
                        botColorMode === 'light' ? '#e5e7eb' : '#2a2a2a'
                    }}
                  >
                    <div className='flex space-x-1'>
                      <div className='h-2 w-2 animate-bounce rounded-full bg-gray-400' />
                      <div
                        className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div
              className='flex items-center gap-2 p-3'
              style={{
                backgroundColor:
                  botColorMode === 'light'
                    ? '#f3f4f6'
                    : botColorMode === 'dark'
                      ? '#1f1f1f'
                      : '#0a0a0a'
              }}
            >
              <input
                type='text'
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder='Type your message...'
                className='flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none'
                style={{
                  borderColor: botColor,
                  backgroundColor:
                    botColorMode === 'light' ? '#fff' : '#2a2a2a',
                  color: botColorMode === 'light' ? '#111827' : '#f9fafb'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || sendChatMessage.isPending}
                className='flex items-center justify-center rounded-lg p-2.5 shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50'
                style={{ backgroundColor: botColor }}
              >
                <Send className='h-4 w-4 text-white' />
              </button>
            </div>
          </div>
        </>
      )}

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        agentId={id}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
