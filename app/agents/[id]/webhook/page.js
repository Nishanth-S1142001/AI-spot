'use client'

import { format } from 'date-fns'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Copy,
  Edit2,
  Eye,
  EyeOff,
  Lock,
  Plus,
  Power,
  RefreshCw,
  Shield,
  Trash2,
  Unlock,
  Webhook,
  XCircle,
  Zap,
  Loader2
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  memo,
  Suspense
} from 'react'
import toast from 'react-hot-toast'
import LoadingState from '../../../../components/common/loading-state'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../../components/providers/AuthProvider'
import SideBarLayout from '../../../../components/sideBarLayout'
import NeonBackground from '../../../../components/ui/background'
import Badge from '../../../../components/ui/badge'
import Button from '../../../../components/ui/button'
import Card from '../../../../components/ui/card'
import { useLogout } from '../../../../lib/supabase/auth'

// Dynamic imports for code splitting - modals loaded only when needed
const CreateWebhookModal = dynamic(
  () => import('./modals/CreateWebhookModal'),
  {
    loading: () => <ModalLoadingSkeleton />,
    ssr: false
  }
)
const EditWebhookModal = dynamic(() => import('./modals/EditWebhookModal'), {
  loading: () => <ModalLoadingSkeleton />,
  ssr: false
})
const TestWebhookModal = dynamic(() => import('./modals/TestWebhookModal'), {
  loading: () => <ModalLoadingSkeleton />,
  ssr: false
})
const SecurityModal = dynamic(() => import('./modals/SecurityModal'), {
  loading: () => <ModalLoadingSkeleton />,
  ssr: false
})

// Loading skeleton for modals
function ModalLoadingSkeleton() {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='mx-4 w-full max-w-2xl rounded-2xl border border-neutral-800/50 bg-neutral-950/90 p-8 backdrop-blur-xl'>
        <div className='flex items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-orange-500' />
          <p className='ml-3 text-sm text-neutral-400'>Loading...</p>
        </div>
      </div>
    </div>
  )
}

// Stats card component - memoized to prevent unnecessary re-renders
const StatCard = memo(({ icon: Icon, label, value, trend }) => (
  <div className='group relative overflow-hidden rounded-xl border border-neutral-800/50 bg-gradient-to-br from-neutral-950/50 to-neutral-900/30 p-6 backdrop-blur-sm transition-all duration-200 hover:border-orange-600/30 hover:shadow-lg hover:shadow-orange-500/10'>
    <div className='flex items-start justify-between'>
      <div className='space-y-2'>
        <p className='text-sm font-medium text-neutral-400'>{label}</p>
        <p className='text-3xl font-bold text-neutral-100'>{value}</p>
        {trend && <p className='text-xs text-neutral-500'>{trend}</p>}
      </div>
      <div className='rounded-lg bg-orange-900/20 p-3 ring-1 ring-orange-500/30 transition-transform group-hover:scale-110'>
        <Icon className='h-6 w-6 text-orange-500' />
      </div>
    </div>
  </div>
))
StatCard.displayName = 'StatCard'

// Webhook card component - memoized
const WebhookCard = memo(
  ({
    webhook,
    isSelected,
    onSelect,
    onToggle,
    onEdit,
    onDelete,
    onRegenerateKey,
    onCopyUrl,
    onViewSecurity
  }) => (
    <div
      onClick={() => onSelect(webhook)}
      className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
        isSelected
          ? 'border-orange-600/50 bg-gradient-to-br from-orange-950/20 via-neutral-950/50 to-neutral-950/30 shadow-lg shadow-orange-500/10'
          : 'border-neutral-800/50 bg-neutral-950/30 hover:border-neutral-700 hover:bg-neutral-950/50'
      }`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1 space-y-3'>
          <div className='flex items-center gap-3'>
            <Webhook
              className={`h-5 w-5 ${isSelected ? 'text-orange-500' : 'text-neutral-400'}`}
            />
            <h3 className='font-semibold text-neutral-100'>{webhook.name}</h3>
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                webhook.is_active
                  ? 'bg-green-900/30 text-green-300 ring-1 ring-green-500/50'
                  : 'bg-red-900/30 text-red-300 ring-1 ring-red-500/50'
              }`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  webhook.is_active ? 'bg-green-500' : 'bg-red-500'
                } animate-pulse`}
              />
              {webhook.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>

          <p className='line-clamp-2 text-sm text-neutral-400'>
            {webhook.description || 'No description'}
          </p>

          <div className='flex flex-wrap gap-2'>
            {webhook.requires_auth && (
              <Badge variant='security' icon={Lock}>
                Auth Required
              </Badge>
            )}
            {webhook.rate_limit && (
              <Badge variant='info' icon={Zap}>
                {webhook.rate_limit}/min
              </Badge>
            )}
          </div>
        </div>

        <div className='ml-4 flex flex-col gap-2'>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(webhook)
            }}
            className={`rounded-lg p-2 transition-colors ${
              webhook.is_active
                ? 'text-green-400 hover:bg-green-900/20'
                : 'text-red-400 hover:bg-red-900/20'
            }`}
            title={webhook.is_active ? 'Deactivate' : 'Activate'}
          >
            <Power className='h-4 w-4' />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(webhook)
            }}
            className='rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200'
            title='Edit'
          >
            <Edit2 className='h-4 w-4' />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(webhook.id)
            }}
            className='rounded-lg p-2 text-red-400 transition-colors hover:bg-red-900/20 hover:text-red-300'
            title='Delete'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      </div>

      {isSelected && (
        <div className='mt-4 space-y-2 border-t border-neutral-800/50 pt-4'>
          <div className='flex flex-wrap gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={(e) => {
                e.stopPropagation()
                onCopyUrl(webhook)
              }}
              className='flex-1'
            >
              <Copy className='mr-2 h-3 w-3' />
              Copy URL
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={(e) => {
                e.stopPropagation()
                onRegenerateKey(webhook)
              }}
              className='flex-1'
            >
              <RefreshCw className='mr-2 h-3 w-3' />
              Regenerate Key
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={(e) => {
                e.stopPropagation()
                onViewSecurity(webhook)
              }}
              className='flex-1'
            >
              <Shield className='mr-2 h-3 w-3' />
              Security
            </Button>
          </div>
        </div>
      )}
    </div>
  )
)
WebhookCard.displayName = 'WebhookCard'

// Invocation row component - memoized
const InvocationRow = memo(({ invocation }) => {
  const [showDetails, setShowDetails] = useState(false)
  
  return (
    <div className='rounded-lg border border-neutral-800/50 bg-neutral-950/30 p-4 transition-colors hover:bg-neutral-950/50'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          {invocation.success ? (
            <CheckCircle className='h-5 w-5 text-green-500' />
          ) : (
            <XCircle className='h-5 w-5 text-red-500' />
          )}
          <div>
            <p className='text-sm font-medium text-neutral-100'>
              {invocation.success ? 'Success' : 'Failed'}
            </p>
            <p className='text-xs text-neutral-500'>
              {format(new Date(invocation.created_at), 'MMM d, yyyy HH:mm:ss')}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          {invocation.response_time_ms && (
            <Badge variant='neutral'>{invocation.response_time_ms}ms</Badge>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className='text-neutral-400 transition-colors hover:text-neutral-200'
          >
            {showDetails ? (
              <EyeOff className='h-4 w-4' />
            ) : (
              <Eye className='h-4 w-4' />
            )}
          </button>
        </div>
      </div>

      {showDetails && invocation.request_body && (
        <div className='mt-4 rounded-lg border border-neutral-800/50 bg-neutral-900/50 p-3'>
          <pre className='custom-scrollbar max-h-48 overflow-auto text-xs text-neutral-400'>
            {JSON.stringify('Request Body')}
            <br />
            {JSON.stringify(invocation.request_body, null, 2)}

            <br />
            {invocation.response_body && (
              <>
                {JSON.stringify('Response Body:')}
                <br />
                {JSON.stringify(invocation.response_body, null, 2)}
                <br />
              </>
            )}
            {invocation.error_message && (
              <>
                {JSON.stringify('Error Message:')}
                <br />
                {JSON.stringify(invocation.error_message, null, 2)}
                <br />
              </>
            )}
            {JSON.stringify('Request Method:')}
            <br />
            {JSON.stringify(invocation.request_method, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
})
InvocationRow.displayName = 'InvocationRow'

export default function AgentWebhookPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()

  // Refs
  const fetchedRef = useRef(false)
  const abortControllerRef = useRef(null)

  // State management
  const [agent, setAgent] = useState(null)
  const [webhooks, setWebhooks] = useState([])
  const [selectedWebhook, setSelectedWebhook] = useState(null)
  const [invocations, setInvocations] = useState([])
  const [fetching, setFetching] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [stats, setStats] = useState({
    totalInvocations: 0,
    successRate: 0,
    avgResponseTime: 0,
    last24h: 0
  })

  // ✅ Reset state when agent ID changes
  useEffect(() => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Reset all state
    fetchedRef.current = false
    setIsInitialized(false)
    setFetching(true)
    setAgent(null)
    setWebhooks([])
    setSelectedWebhook(null)
    setInvocations([])
    setShowCreateModal(false)
    setShowTestModal(false)
    setShowSecurityModal(false)
    setShowEditModal(false)
    setStats({
      totalInvocations: 0,
      successRate: 0,
      avgResponseTime: 0,
      last24h: 0
    })
  }, [id])

  // Normalize array data
  const normalizeArray = useCallback((value) => {
    if (Array.isArray(value)) return value
    if (value && typeof value === 'object') return Object.values(value)
    return []
  }, [])

  // Calculate stats - memoized to prevent unnecessary recalculations
  const calculateStats = useCallback(
    (invokesRaw) => {
      const invokes = normalizeArray(invokesRaw)
      const now = new Date()
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const totalInvocations = invokes.length
      const successful = invokes.filter((i) => i.success).length
      const successRate =
        totalInvocations > 0
          ? ((successful / totalInvocations) * 100).toFixed(1)
          : 0
      const last24hCount = invokes.filter(
        (i) => new Date(i.created_at) >= last24h
      ).length

      const responseTimes = invokes
        .filter((i) => i.response_time_ms)
        .map((i) => i.response_time_ms)

      const avgResponseTime =
        responseTimes.length > 0
          ? Math.round(
              responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            )
          : 0

      setStats({
        totalInvocations,
        successRate,
        avgResponseTime,
        last24h: last24hCount
      })
    },
    [normalizeArray]
  )

  // Fetch invocations
  const fetchInvocations = useCallback(
    async (webhookId) => {
      try {
        const res = await fetch(
          `/api/agent-webhooks/${webhookId}/invocations?limit=50`
        )
        const data = await res.json()
        const normalized = normalizeArray(data.invocations)
        setInvocations(normalized)
        calculateStats(normalized)
      } catch (err) {
        toast.error('Failed to load invocations')
      }
    },
    [normalizeArray, calculateStats]
  )

  // Fetch agent & webhooks with abort controller
  const fetchData = useCallback(async () => {
    if (!id || !user || fetchedRef.current) return
    fetchedRef.current = true

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller
    setFetching(true)

    try {
      const [agentRes, webhooksRes] = await Promise.all([
        fetch(`/api/agents/${id}`, { signal: controller.signal }),
        fetch(`/api/agents/${id}/webhook`, { signal: controller.signal })
      ])

      if (!agentRes.ok || !webhooksRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const agentData = await agentRes.json()
      const webhooksData = await webhooksRes.json()

      setAgent(agentData)
      setWebhooks(webhooksData.webhooks || [])

      if (webhooksData.webhooks?.length > 0) {
        const firstWebhook = webhooksData.webhooks[0]
        setSelectedWebhook(firstWebhook)
        fetchInvocations(firstWebhook.id)
      } else {
        setSelectedWebhook(null)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to load webhook data')
      }
    } finally {
      setFetching(false)
      setIsInitialized(true)
      abortControllerRef.current = null
    }
  }, [id, user, fetchInvocations])

  useEffect(() => {
    if (user && !authLoading) {
      fetchData()
    }
  }, [user, authLoading, fetchData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Webhook actions
  const handleSelectWebhook = useCallback(
    (webhook) => {
      setSelectedWebhook(webhook)
      fetchInvocations(webhook.id)
    },
    [fetchInvocations]
  )

  const toggleWebhook = useCallback(
    async (webhook) => {
      try {
        const response = await fetch(`/api/agent-webhooks/${webhook.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: !webhook.is_active })
        })

        if (!response.ok) throw new Error('Failed to update webhook')

        toast.success(
          `Webhook ${!webhook.is_active ? 'activated' : 'deactivated'}`
        )
        fetchedRef.current = false
        await fetchData()
      } catch (error) {
        toast.error('Failed to update webhook')
      }
    },
    [fetchData]
  )

  const deleteWebhook = useCallback(
    async (webhookId) => {
      if (
        !confirm(
          'Are you sure you want to delete this webhook? This action cannot be undone.'
        )
      ) {
        return
      }

      try {
        const response = await fetch(`/api/agent-webhooks/${webhookId}`, {
          method: 'DELETE'
        })

        if (!response.ok) throw new Error('Failed to delete webhook')

        toast.success('Webhook deleted successfully!')
        if (selectedWebhook?.id === webhookId) {
          setSelectedWebhook(null)
          setInvocations([])
        }
        fetchedRef.current = false
        await fetchData()
      } catch (error) {
        toast.error('Failed to delete webhook')
      }
    },
    [selectedWebhook, fetchData]
  )

  const regenerateKey = useCallback(
    async (webhook) => {
      if (
        !confirm(
          'Are you sure you want to regenerate the API key? The old key will stop working.'
        )
      ) {
        return
      }

      try {
        const response = await fetch(
          `/api/agent-webhooks/${webhook.id}/regenerate-key`,
          {
            method: 'POST'
          }
        )

        if (!response.ok) throw new Error('Failed to regenerate key')

        const data = await response.json()
        toast.success('API key regenerated!')

        // Show the new key
        navigator.clipboard.writeText(data.auth_token)
        toast.success('New key copied to clipboard!')

        fetchedRef.current = false
        await fetchData()
      } catch (error) {
        toast.error('Failed to regenerate key')
      }
    },
    [fetchData]
  )

  const copyWebhookUrl = useCallback((webhook) => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/agent-webhooks/${webhook.id}/invoke`
    navigator.clipboard.writeText(url)
    toast.success('Webhook URL copied to clipboard!')
  }, [])

  // Modal handlers
  const handleCreateWebhook = useCallback(
    async (webhookData) => {
      try {
        const response = await fetch(`/api/agents/${id}/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData)
        })

        if (!response.ok) throw new Error('Failed to create webhook')

        toast.success('Webhook created successfully!')
        setShowCreateModal(false)
        fetchedRef.current = false
        await fetchData()
      } catch (error) {
        toast.error('Failed to create webhook')
      }
    },
    [id, fetchData]
  )

  const handleUpdateWebhook = useCallback(
    async (webhookId, updates) => {
      try {
        const response = await fetch(`/api/agent-webhooks/${webhookId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })

        if (!response.ok) throw new Error('Failed to update webhook')

        toast.success('Webhook updated successfully!')
        setShowEditModal(false)
        setShowSecurityModal(false)
        fetchedRef.current = false
        await fetchData()
      } catch (error) {
        toast.error('Failed to update webhook')
      }
    },
    [fetchData]
  )

  // Memoized empty state
  const emptyState = useMemo(
    () => (
      <div className='flex flex-col items-center justify-center py-16'>
        <div className='rounded-full bg-orange-900/20 p-6 ring-1 ring-orange-500/30'>
          <Webhook className='h-12 w-12 text-orange-500' />
        </div>
        <h3 className='mt-6 text-xl font-semibold text-neutral-100'>
          No Webhooks Yet
        </h3>
        <p className='mt-2 max-w-md text-center text-sm text-neutral-400'>
          Create your first webhook to start receiving real-time notifications
          from your agent.
        </p>
        <Button onClick={() => setShowCreateModal(true)} className='mt-6'>
          <Plus className='mr-2 h-4 w-4' />
          Create Webhook
        </Button>
      </div>
    ),
    []
  )

  // Loading state
  if (authLoading || (fetching && !isInitialized)) {
    return (
      <LoadingState
        message={authLoading ? 'Authenticating...' : 'Loading Webhook...'}
        className='min-h-screen'
      />
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
              message='Webhook Management'
              agent={agent}
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
              {/* Page Header */}
              <div className='mb-8 rounded-2xl border border-orange-600/20 bg-gradient-to-br from-orange-950/10 via-neutral-950/50 to-neutral-950/30 p-6 backdrop-blur-sm'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <h1 className='text-3xl font-bold text-neutral-100'>
                      Webhooks
                    </h1>
                    <p className='text-sm text-neutral-400'>
                      Manage real-time event notifications for{' '}
                      {agent?.name || 'your agent'}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className='flex items-center gap-2'
                  >
                    <Plus className='h-4 w-4' />
                    Create Webhook
                  </Button>
                </div>
              </div>

              {webhooks.length === 0 ? (
                emptyState
              ) : (
                <>
                  {/* Stats Grid */}
                  {selectedWebhook && (
                    <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                      <StatCard
                        icon={Activity}
                        label='Total Invocations'
                        value={stats.totalInvocations}
                      />
                      <StatCard
                        icon={CheckCircle}
                        label='Success Rate'
                        value={`${stats.successRate}%`}
                      />
                      <StatCard
                        icon={Zap}
                        label='Avg Response Time'
                        value={`${stats.avgResponseTime}ms`}
                      />
                      <StatCard
                        icon={Activity}
                        label='Last 24 Hours'
                        value={stats.last24h}
                      />
                    </div>
                  )}

                  {/* Main Content Grid */}
                  <div className='grid gap-6 lg:grid-cols-3'>
                    {/* Webhooks List */}
                    <div className='space-y-4 lg:col-span-1'>
                      <div className='rounded-xl border border-neutral-800/50 bg-neutral-950/30 p-4 backdrop-blur-sm'>
                        <h2 className='mb-4 text-lg font-semibold text-neutral-100'>
                          Your Webhooks
                        </h2>
                        <div className='space-y-3'>
                          {webhooks.map((webhook) => (
                            <WebhookCard
                              key={webhook.id}
                              webhook={webhook}
                              isSelected={selectedWebhook?.id === webhook.id}
                              onSelect={handleSelectWebhook}
                              onToggle={toggleWebhook}
                              onEdit={(w) => {
                                setSelectedWebhook(w)
                                setShowEditModal(true)
                              }}
                              onDelete={deleteWebhook}
                              onRegenerateKey={regenerateKey}
                              onCopyUrl={copyWebhookUrl}
                              onViewSecurity={(w) => {
                                setSelectedWebhook(w)
                                setShowSecurityModal(true)
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Invocations Panel */}
                    <div className='lg:col-span-2'>
                      {selectedWebhook ? (
                        <div className='rounded-xl border border-neutral-800/50 bg-neutral-950/30 p-6 backdrop-blur-sm'>
                          <div className='mb-6 flex items-center justify-between'>
                            <h2 className='text-lg font-semibold text-neutral-100'>
                              Recent Invocations
                            </h2>
                            <div className='flex gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  fetchInvocations(selectedWebhook.id)
                                }
                              >
                                <RefreshCw className='mr-2 h-3 w-3' />
                                Refresh
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setShowTestModal(true)}
                              >
                                <Zap className='mr-2 h-3 w-3' />
                                Test
                              </Button>
                            </div>
                          </div>

                          <div className='space-y-3'>
                            {invocations.length === 0 ? (
                              <div className='flex flex-col items-center justify-center py-12'>
                                <div className='rounded-full bg-neutral-900/50 p-4 ring-1 ring-neutral-800/50'>
                                  <Activity className='h-8 w-8 text-neutral-500' />
                                </div>
                                <p className='mt-4 text-sm text-neutral-400'>
                                  No invocations yet
                                </p>
                              </div>
                            ) : (
                              invocations.map((invocation) => (
                                <InvocationRow
                                  key={invocation.id}
                                  invocation={invocation}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className='flex h-full items-center justify-center rounded-xl border border-neutral-800/50 bg-neutral-950/30 p-12 backdrop-blur-sm'>
                          <p className='text-neutral-400'>
                            Select a webhook to view invocations
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </SideBarLayout>

      {/* Modals - Dynamically loaded */}
      {showCreateModal && (
        <Suspense fallback={<ModalLoadingSkeleton />}>
          <CreateWebhookModal
            agentId={id}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateWebhook}
          />
        </Suspense>
      )}

      {showEditModal && selectedWebhook && (
        <Suspense fallback={<ModalLoadingSkeleton />}>
          <EditWebhookModal
            webhook={selectedWebhook}
            onClose={() => setShowEditModal(false)}
            onUpdate={(updates) =>
              handleUpdateWebhook(selectedWebhook.id, updates)
            }
          />
        </Suspense>
      )}

      {showTestModal && selectedWebhook && (
        <Suspense fallback={<ModalLoadingSkeleton />}>
          <TestWebhookModal
            webhook={selectedWebhook}
            onClose={() => setShowTestModal(false)}
            onRefresh={() => fetchInvocations(selectedWebhook.id)}
          />
        </Suspense>
      )}

      {showSecurityModal && selectedWebhook && (
        <Suspense fallback={<ModalLoadingSkeleton />}>
          <SecurityModal
            webhook={selectedWebhook}
            onClose={() => setShowSecurityModal(false)}
            onUpdate={(updates) =>
              handleUpdateWebhook(selectedWebhook.id, updates)
            }
          />
        </Suspense>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

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