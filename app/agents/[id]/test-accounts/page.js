'use client'

import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Mail,
  MessageSquare,
  MoreVertical,
  RefreshCw,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
  Zap
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState, useEffect } from 'react'
import LoadingState from '../../../../components/common/loading-state'
import Pagination from '../../../../components/common/pagination'
import SearchBar from '../../../../components/common/search-bar'
import { useAuth } from '../../../../components/providers/AuthProvider'
import {
  useAgent,
  useTestAccounts,
  useCreateTestAccount,
  useDeleteTestAccount,
  useUpdateTestAccount,
  useCopyTestLink
} from '../../../../lib/hooks/useAgentData'
import NeonBackground from '../../../../components/ui/background'
import Button from '../../../../components/ui/button'
import Card from '../../../../components/ui/card'
import BottomModal from '../../../../components/ui/modal'
import SubAccountsSkeleton from '../../../../components/skeleton/SubAccountSkeleton'
/**
 * Sub Account Card Component
 */
const SubAccountCard = ({
  account,
  onDelete,
  onCopyLink,
  onToggleStatus,
  isDeleting,
  isUpdating
}) => {
  const [copied, setCopied] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleCopy = async () => {
    await onCopyLink(account.testLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = () => {
    switch (account.status) {
      case 'active':
        return 'bg-green-900/40 text-green-300 ring-1 ring-green-500/50'
      case 'invited':
        return 'bg-blue-900/40 text-blue-300 ring-1 ring-blue-500/50'
      case 'suspended':
        return 'bg-orange-900/40 text-orange-300 ring-1 ring-orange-500/50'
      case 'expired':
        return 'bg-red-900/40 text-red-300 ring-1 ring-red-500/50'
      default:
        return 'bg-neutral-800 text-neutral-400'
    }
  }

  const getStatusIcon = () => {
    switch (account.status) {
      case 'active':
        return <CheckCircle className='h-3 w-3' />
      case 'invited':
        return <Mail className='h-3 w-3' />
      case 'suspended':
        return <Ban className='h-3 w-3' />
      case 'expired':
        return <XCircle className='h-3 w-3' />
      default:
        return null
    }
  }

  const isLoading = isDeleting || isUpdating

  return (
    <div className='group relative rounded-lg border border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20 p-5 transition-all hover:border-orange-600/30 hover:from-orange-900/10'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='flex flex-1 items-center gap-3'>
          <div className='relative'>
            <div className='absolute inset-0 bg-orange-500/50 opacity-50 blur-lg' />
            <div className='relative flex h-12 w-12 items-center justify-center rounded-full bg-orange-900/40 ring-1 ring-orange-500/50'>
              <Users className='h-6 w-6 text-orange-400' />
            </div>
          </div>
          <div className='flex-1'>
            <h4 className='font-semibold text-neutral-100'>{account.name}</h4>
            <p className='text-sm text-neutral-400'>{account.email}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor()}`}
        >
          {getStatusIcon()}
          <span className='capitalize'>{account.status}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='mt-4 grid grid-cols-3 gap-3 border-t border-neutral-800/50 pt-4'>
        <div className='text-center'>
          <div className='flex items-center justify-center gap-1 text-sm font-semibold text-neutral-100'>
            <MessageSquare className='h-3 w-3 text-blue-400' />
            {account.sessions_count || 0}
          </div>
          <div className='text-xs text-neutral-500'>Sessions</div>
        </div>
        <div className='text-center'>
          <div className='flex items-center justify-center gap-1 text-sm font-semibold text-neutral-100'>
            <Zap className='h-3 w-3 text-purple-400' />
            {account.messages_count || 0}
          </div>
          <div className='text-xs text-neutral-500'>Messages</div>
        </div>
        <div className='text-center'>
          <div className='flex items-center justify-center gap-1 text-sm font-semibold text-neutral-100'>
            <Clock className='h-3 w-3 text-green-400' />
            {account.lastActive || 'Never'}
          </div>
          <div className='text-xs text-neutral-500'>Last Active</div>
        </div>
      </div>

      {/* Actions */}
      <div className='mt-4 flex items-center gap-2 border-t border-neutral-800/50 pt-4'>
        <Button
          size='sm'
          onClick={handleCopy}
          disabled={isLoading}
          className='flex-1'
        >
          {copied ? (
            <>
              <Check className='mr-1 h-3 w-3 text-green-400' />
              Copied!
            </>
          ) : (
            <>
              <Copy className='mr-1 h-3 w-3' />
              Copy Link
            </>
          )}
        </Button>

        <div className='relative'>
          <button
            onClick={() => setShowActions(!showActions)}
            disabled={isLoading}
            className='flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800/50 text-neutral-400 transition-colors hover:border-neutral-600 hover:bg-neutral-800 disabled:opacity-50'
          >
            <MoreVertical className='h-4 w-4' />
          </button>

          {/* Dropdown Menu */}
          {showActions && (
            <>
              <div
                className='fixed inset-0 z-10'
                onClick={() => setShowActions(false)}
              />
              <div className='absolute top-10 right-0 z-20 w-48 rounded-lg border border-neutral-700 bg-neutral-900 py-1 shadow-xl'>
                <button
                  onClick={() => {
                    setShowActions(false)
                    onToggleStatus(account)
                  }}
                  disabled={isLoading}
                  className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 disabled:opacity-50'
                >
                  {account.is_active ? (
                    <>
                      <Ban className='h-4 w-4' />
                      Suspend
                    </>
                  ) : (
                    <>
                      <CheckCircle className='h-4 w-4' />
                      Activate
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowActions(false)
                    onDelete(account.id)
                  }}
                  disabled={isLoading}
                  className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 disabled:opacity-50'
                >
                  <Trash2 className='h-4 w-4' />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Expiration Warning */}
      {account.daysUntilExpiry && account.daysUntilExpiry <= 7 && (
        <div className='mt-3 flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-900/20 px-3 py-2 text-xs text-orange-300'>
          <AlertCircle className='h-3 w-3' />
          <span>Expires in {account.daysUntilExpiry} days</span>
        </div>
      )}
    </div>
  )
}

/**
 * Invite Modal Component
 */
const InviteModal = ({ isOpen, onClose, onInvite, isLoading }) => {
  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    expiresInDays: 30,
    maxSessions: 100,
    sendEmail: true,
    notes: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!inviteData.name.trim() || !inviteData.email.trim()) {
      setError('Name and email are required')
      return
    }

    try {
      await onInvite(inviteData)
      // Reset form on success
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
      setError(err.message || 'Failed to send invite')
    }
  }

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} size='lg'>
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
          <div className='rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-sm text-red-300'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
                    expiresInDays: parseInt(e.target.value)
                  })
                }
                min='1'
                max='365'
                className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
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
                    maxSessions: parseInt(e.target.value)
                  })
                }
                min='1'
                max='1000'
                className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
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
              placeholder='Add any internal notes about this test user...'
              rows={3}
              className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
            />
          </div>

          <div className='flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-800/50 p-4'>
            <input
              type='checkbox'
              id='sendEmail'
              checked={inviteData.sendEmail}
              onChange={(e) =>
                setInviteData({ ...inviteData, sendEmail: e.target.checked })
              }
              className='h-4 w-4 rounded border-neutral-600 bg-neutral-700 text-orange-500 focus:ring-2 focus:ring-orange-500/50'
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='flex-1'
              disabled={isLoading || !inviteData.name || !inviteData.email}
            >
              {isLoading ? (
                <>
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className='mr-2 h-4 w-4' />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </BottomModal>
  )
}

/**
 * Main Sub-Accounts Management Page
 */
export default function SubAccountsManagementPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // UI State - must be declared before any conditional returns
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // React Query hooks - must be called before any conditional returns
  const {
    data: agent,
    isLoading: agentLoading,
    error: agentError
  } = useAgent(id)

  const {
    data: { testAccounts = [], stats = {} } = {},
    isLoading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts
  } = useTestAccounts(id)

  const createAccountMutation = useCreateTestAccount(id)
  const deleteAccountMutation = useDeleteTestAccount(id)
  const updateAccountMutation = useUpdateTestAccount(id)
  const copyLinkMutation = useCopyTestLink()

  // Filter and paginate - must be before conditional returns
  const filteredAccounts = useMemo(() => {
    let filtered = testAccounts

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (acc) =>
          acc.name.toLowerCase().includes(query) ||
          acc.email.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((acc) => acc.status === statusFilter)
    }

    return filtered
  }, [testAccounts, searchQuery, statusFilter])

  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAccounts.slice(start, start + itemsPerPage)
  }, [filteredAccounts, currentPage, itemsPerPage])

  const totalPages = useMemo(
    () => Math.ceil(filteredAccounts.length / itemsPerPage),
    [filteredAccounts.length, itemsPerPage]
  )

  // Handlers - must be before conditional returns
  const handleInvite = useCallback(
    async (inviteData) => {
      await createAccountMutation.mutateAsync(inviteData)
      setShowInviteModal(false)
    },
    [createAccountMutation]
  )

  const handleCopyLink = useCallback(
    (link) => {
      copyLinkMutation.mutate(link)
    },
    [copyLinkMutation]
  )

  const handleDelete = useCallback(
    (accountId) => {
      if (
        !confirm(
          'Are you sure you want to delete this test account? This will also delete all associated sessions and data.'
        )
      ) {
        return
      }
      deleteAccountMutation.mutate(accountId)
    },
    [deleteAccountMutation]
  )

  const handleToggleStatus = useCallback(
    (account) => {
      updateAccountMutation.mutate({
        accountId: account.id,
        updates: {
          is_active: !account.is_active,
          status: account.is_active ? 'suspended' : 'active'
        }
      })
    },
    [updateAccountMutation]
  )

  // NOW we can do conditional returns - after all hooks are called
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])
  // Artificial delay so skeleton shows at least 3 seconds
  const [delayedLoading, setDelayedLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Loading state
  if (authLoading || agentLoading || accountsLoading) {
    return <SubAccountsSkeleton agentName={agent?.name || 'Agent'} />
  }
  if (delayedLoading) {
    return (
      <LoadingState
        message='Loading test accounts...'
        className='min-h-screen'
      />
    )
  }

  // Handle errors
  if (agentError || accountsError) {
    const error = agentError || accountsError
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <Card className='max-w-md border-red-600/30 bg-gradient-to-br from-red-900/20 to-neutral-950/50'>
          <div className='p-8 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/40'>
              <AlertCircle className='h-8 w-8 text-red-400' />
            </div>
            <h3 className='mb-2 text-xl font-bold text-neutral-100'>Error</h3>
            <p className='text-sm text-neutral-400'>{error.message}</p>
            <div className='mt-6 flex justify-center gap-3'>
              <Button variant='outline' onClick={() => router.push('/agents')}>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Agents
              </Button>
              <Button onClick={() => refetchAccounts()}>
                <RefreshCw className='mr-2 h-4 w-4' />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!agent) {
    return (
      <LoadingState message='Agent not found...' className='min-h-screen' />
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
          <div className='mx-auto max-w-7xl px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={() => router.push(`/agents/${id}/manage`)}
                  className='rounded-lg p-2 transition-colors hover:bg-neutral-800'
                >
                  <ArrowLeft className='h-5 w-5 text-neutral-400' />
                </button>
                <div>
                  <h1 className='text-xl font-bold text-neutral-100'>
                    <span className='text-orange-400'>Test</span> Accounts
                  </h1>
                  <p className='text-sm text-neutral-400'>
                    {agent.name} • Manage customer testing access
                  </p>
                </div>
              </div>

              <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus className='mr-2 h-4 w-4' />
                Invite Test User
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='custom-scrollbar flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-7xl px-6 py-8'>
            {/* Stats Cards */}
            <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
              <Card className='border-orange-600/20 bg-gradient-to-br from-orange-900/20 to-neutral-950/50'>
                <div className='flex items-center justify-between p-4'>
                  <div>
                    <p className='text-sm font-medium text-neutral-400'>
                      Total Accounts
                    </p>
                    <p className='mt-2 text-3xl font-bold text-orange-400'>
                      {stats.totalTestAccounts || 0}
                    </p>
                    <div className='mt-4 text-xs text-neutral-500'>
                      Active: {stats.activeAccounts || 0}
                    </div>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-900/40'>
                    <Users className='h-6 w-6 text-orange-400' />
                  </div>
                </div>
              </Card>

              <Card className='border-blue-600/20 bg-gradient-to-br from-blue-900/20 to-neutral-950/50'>
                <div className='flex items-center justify-between p-4'>
                  <div>
                    <p className='text-sm font-medium text-neutral-400'>
                      Test Sessions
                    </p>
                    <p className='mt-2 text-3xl font-bold text-blue-400'>
                      {stats.totalSessions || 0}
                    </p>
                    <div className='mt-4 text-xs text-neutral-500'>
                      All time
                    </div>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/40'>
                    <MessageSquare className='h-6 w-6 text-blue-400' />
                  </div>
                </div>
              </Card>

              <Card className='border-green-600/20 bg-gradient-to-br from-green-900/20 to-neutral-950/50'>
                <div className='flex items-center justify-between p-4'>
                  <div>
                    <p className='text-sm font-medium text-neutral-400'>
                      Avg Rating
                    </p>
                    <p className='mt-2 text-3xl font-bold text-green-400'>
                      {stats.avgRating || 0}
                    </p>
                    <div className='mt-4 text-xs text-neutral-500'>
                      Out of 5 stars
                    </div>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-900/40'>
                    <TrendingUp className='h-6 w-6 text-green-400' />
                  </div>
                </div>
              </Card>

              <Card className='border-purple-600/20 bg-gradient-to-br from-purple-900/20 to-neutral-950/50'>
                <div className='flex items-center justify-between p-4'>
                  <div>
                    <p className='text-sm font-medium text-neutral-400'>
                      Total Messages
                    </p>
                    <p className='mt-2 text-3xl font-bold text-purple-400'>
                      {stats.totalMessages || 0}
                    </p>
                    <div className='mt-4 text-xs text-neutral-500'>
                      Across all sessions
                    </div>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/40'>
                    <Zap className='h-6 w-6 text-purple-400' />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-3'>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className='rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-neutral-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
                >
                  <option value='all'>All Status</option>
                  <option value='active'>Active</option>
                  <option value='invited'>Invited</option>
                  <option value='suspended'>Suspended</option>
                  <option value='expired'>Expired</option>
                </select>

                <span className='text-sm text-neutral-400'>
                  {filteredAccounts.length}{' '}
                  {filteredAccounts.length === 1 ? 'account' : 'accounts'}
                </span>
              </div>

              <div className='w-full sm:w-80'>
                <SearchBar
                  value={searchQuery}
                  onChange={(query) => {
                    setSearchQuery(query)
                    setCurrentPage(1)
                  }}
                  placeholder='Search by name or email...'
                  variant='orange'
                />
              </div>
            </div>

            {/* Accounts Grid */}
            {testAccounts.length === 0 ? (
              <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
                <div className='flex flex-col items-center py-16 text-center'>
                  <div className='mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-900/40'>
                    <Users className='h-10 w-10 text-orange-400' />
                  </div>
                  <h4 className='mb-2 text-xl font-semibold text-neutral-200'>
                    No test accounts yet
                  </h4>
                  <p className='mb-6 max-w-md text-sm text-neutral-400'>
                    Invite customers to test your AI agent and gather valuable
                    feedback
                  </p>
                  <Button onClick={() => setShowInviteModal(true)}>
                    <UserPlus className='mr-2 h-4 w-4' />
                    Invite Your First Test User
                  </Button>
                </div>
              </Card>
            ) : filteredAccounts.length === 0 ? (
              <Card className='border-neutral-700/50'>
                <div className='flex flex-col items-center py-16 text-center'>
                  <div className='mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800/40'>
                    <Users className='h-10 w-10 text-neutral-400' />
                  </div>
                  <h4 className='mb-2 text-xl font-semibold text-neutral-200'>
                    No matching accounts
                  </h4>
                  <p className='mb-6 text-sm text-neutral-400'>
                    Try adjusting your search or filters
                  </p>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  {paginatedAccounts.map((account) => (
                    <SubAccountCard
                      key={account.id}
                      account={account}
                      onDelete={handleDelete}
                      onCopyLink={handleCopyLink}
                      onToggleStatus={handleToggleStatus}
                      isDeleting={deleteAccountMutation.isPending}
                      isUpdating={updateAccountMutation.isPending}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className='mt-8'>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
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

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        isLoading={createAccountMutation.isPending}
      />
    </>
  )
}
