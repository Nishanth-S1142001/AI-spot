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
  Webhook,
  XCircle,
  Zap,
  Loader2
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import {
  useState,
  useCallback,
  useMemo,
  memo,
  Suspense,
  useEffect
} from 'react'
import LoadingState from '../../../../components/common/loading-state'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../../components/providers/AuthProvider'
import SideBarLayout from '../../../../components/sideBarLayout'
import NeonBackground from '../../../../components/ui/background'
import Badge from '../../../../components/ui/badge'
import Button from '../../../../components/ui/button'
import Card from '../../../../components/ui/card'
import { useLogout } from '../../../../lib/supabase/auth'
import WebhookManagementSkeleton from '../../../../components/skeleton/WebhookManagementSkeleton'
import {
  useAgent,
  useWebhooks,
  useWebhookInvocations,
  useWebhookStats,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useToggleWebhook,
  useRegenerateWebhookKey,
  useCopyWebhookUrl
} from '../../../../lib/hooks/useAgentData'
import CreateWebhookModalSkeleton from '../../../../components/skeleton/CreateWebhookModalSkeleton'
import EditWebhookModalSkeleton from '../../../../components/skeleton/EditWebhookModalSkeleton'
import TestWebhookModalSkeleton from '../../../../components/skeleton/TestWebhookModalSkeleton'
import SecurityModalSkeleton from '../../../../components/skeleton/SecurityModalSkeleton'
// Dynamic imports for modals
const CreateWebhookModal = dynamic(
  () => import('./modals/CreateWebhookModal'),
  {
    loading: () => <CreateWebhookModalSkeleton />,
    ssr: false
  }
)
const EditWebhookModal = dynamic(() => import('./modals/EditWebhookModal'), {
  loading: () => <EditWebhookModalSkeleton />,
  ssr: false
})
const TestWebhookModal = dynamic(() => import('./modals/TestWebhookModal'), {
  loading: () => <TestWebhookModalSkeleton />,
  ssr: false
})
const SecurityModal = dynamic(() => import('./modals/SecurityModal'), {
  loading: () => <SecurityModalSkeleton />,
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

// Stats card component
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

// Webhook card component
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
    onViewSecurity,
    isLoading
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
            disabled={isLoading}
            className={`rounded-lg p-2 transition-colors disabled:opacity-50 ${
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
            disabled={isLoading}
            className='rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-50'
            title='Edit'
          >
            <Edit2 className='h-4 w-4' />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(webhook.id)
            }}
            disabled={isLoading}
            className='rounded-lg p-2 text-red-400 transition-colors hover:bg-red-900/20 hover:text-red-300 disabled:opacity-50'
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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

// Invocation row component
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
            {JSON.stringify(
              {
                request_body: invocation.request_body,
                response_body: invocation.response_body,
                error_message: invocation.error_message,
                request_method: invocation.request_method
              },
              null,
              2
            )}
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

  // Local state - must be declared before any conditional returns
  const [selectedWebhook, setSelectedWebhook] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // React Query hooks - must be called before any conditional returns
  const {
    data: agent,
    isLoading: agentLoading,
    error: agentError
  } = useAgent(id)

  const {
    data: webhooks = [],
    isLoading: webhooksLoading,
    error: webhooksError
  } = useWebhooks(id)

  // Hooks for selected webhook
  const {
    data: invocations = [],
    isLoading: invocationsLoading,
    refetch: refetchInvocations
  } = useWebhookInvocations(selectedWebhook?.id, !!selectedWebhook)

  const stats = useWebhookStats(selectedWebhook?.id)

  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }
  // Mutations
  const createWebhookMutation = useCreateWebhook(id)
  const updateWebhookMutation = useUpdateWebhook(id)
  const deleteWebhookMutation = useDeleteWebhook(id)
  const toggleWebhookMutation = useToggleWebhook(id)
  const regenerateKeyMutation = useRegenerateWebhookKey(id)
  const copyUrlMutation = useCopyWebhookUrl()

  // Auto-select first webhook - use useEffect instead of useMemo
  useEffect(() => {
    if (webhooks.length > 0 && !selectedWebhook) {
      setSelectedWebhook(webhooks[0])
    }
  }, [webhooks, selectedWebhook])

  // Handlers - must be before conditional returns
  const handleSelectWebhook = useCallback((webhook) => {
    setSelectedWebhook(webhook)
  }, [])

  const handleToggle = useCallback(
    (webhook) => {
      toggleWebhookMutation.mutate({
        webhookId: webhook.id,
        isActive: webhook.is_active
      })
    },
    [toggleWebhookMutation]
  )

  const handleDelete = useCallback(
    (webhookId) => {
      if (
        !confirm(
          'Are you sure you want to delete this webhook? This action cannot be undone.'
        )
      ) {
        return
      }

      deleteWebhookMutation.mutate(webhookId, {
        onSuccess: () => {
          if (selectedWebhook?.id === webhookId) {
            setSelectedWebhook(null)
          }
        }
      })
    },
    [deleteWebhookMutation, selectedWebhook]
  )

  const handleRegenerateKey = useCallback(
    (webhook) => {
      if (
        !confirm(
          'Are you sure you want to regenerate the API key? The old key will stop working.'
        )
      ) {
        return
      }

      regenerateKeyMutation.mutate(webhook.id)
    },
    [regenerateKeyMutation]
  )

  const handleCopyUrl = useCallback(
    (webhook) => {
      copyUrlMutation.mutate(webhook.id)
    },
    [copyUrlMutation]
  )

  const handleCreateWebhook = useCallback(
    async (webhookData) => {
      await createWebhookMutation.mutateAsync(webhookData)
      setShowCreateModal(false)
    },
    [createWebhookMutation]
  )

  const handleUpdateWebhook = useCallback(
    async (webhookId, updates) => {
      await updateWebhookMutation.mutateAsync({ webhookId, updates })
      setShowEditModal(false)
      setShowSecurityModal(false)
    },
    [updateWebhookMutation]
  )

  // Empty state - memoized
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
    [setShowCreateModal]
  )

  const isLoading = useMemo(
    () =>
      toggleWebhookMutation.isPending ||
      deleteWebhookMutation.isPending ||
      updateWebhookMutation.isPending ||
      regenerateKeyMutation.isPending,
    [
      toggleWebhookMutation.isPending,
      deleteWebhookMutation.isPending,
      updateWebhookMutation.isPending,
      regenerateKeyMutation.isPending
    ]
  )

  // NOW we can do conditional returns - after all hooks are called
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Loading state
  if (authLoading || agentLoading || webhooksLoading) {
    return (
      <LoadingState message='Loading webhooks...' className='min-h-screen' />
    )
  }

  // Handle errors
  if (agentError || webhooksError) {
    const error = agentError || webhooksError
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <Card className='max-w-md border-red-600/30 bg-gradient-to-br from-red-900/20 to-neutral-950/50'>
          <div className='p-8 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/40'>
              <AlertCircle className='h-8 w-8 text-red-400' />
            </div>
            <h3 className='mb-2 text-xl font-bold text-neutral-100'>Error</h3>
            <p className='text-sm text-neutral-400'>{error.message}</p>
            <Button onClick={() => router.back()} className='mt-6'>
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    )
  }
  // Artificial delay so skeleton shows at least 3 seconds
  const [delayedLoading, setDelayedLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  if (!agent) {
    return (
      <LoadingState message='Agent not found...' className='min-h-screen' />
    )
  }
  if (delayedLoading) {
    return (
      <LoadingState message='Loading Webhooks...' className='min-h-screen' />
    )
  }

  // Loading state - show skeleton
  if (authLoading || agentLoading || webhooksLoading) {
    return (
      <WebhookManagementSkeleton
        userProfile={userProfile}
        agentName={agent?.name || 'Agent'}
      />
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
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
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
                      Manage real-time event notifications for {agent.name}
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
                              onToggle={handleToggle}
                              onEdit={(w) => {
                                setSelectedWebhook(w)
                                setShowEditModal(true)
                              }}
                              onDelete={handleDelete}
                              onRegenerateKey={handleRegenerateKey}
                              onCopyUrl={handleCopyUrl}
                              onViewSecurity={(w) => {
                                setSelectedWebhook(w)
                                setShowSecurityModal(true)
                              }}
                              isLoading={isLoading}
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
                                onClick={() => refetchInvocations()}
                                disabled={invocationsLoading}
                              >
                                <RefreshCw
                                  className={`mr-2 h-3 w-3 ${invocationsLoading ? 'animate-spin' : ''}`}
                                />
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
                            {invocationsLoading ? (
                              <div className='flex items-center justify-center py-12'>
                                <Loader2 className='h-8 w-8 animate-spin text-orange-500' />
                              </div>
                            ) : invocations.length === 0 ? (
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

      {/* Modals */}
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
            onRefresh={() => refetchInvocations()}
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
