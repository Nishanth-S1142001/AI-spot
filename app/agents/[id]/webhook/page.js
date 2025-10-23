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
  Zap
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import LoadingState from '../../../../components/common/loading-state'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../../components/providers/AuthProvider'
import SideBarLayout from '../../../../components/sideBarLayout'
import NeonBackground from '../../../../components/ui/background'
import Badge from '../../../../components/ui/badge'
import Button from '../../../../components/ui/button'
import Card from '../../../../components/ui/card'
import FormInput from '../../../../components/ui/formInputField'
import { useLogout } from '../../../../lib/supabase/auth'
import { Suspense } from 'react'
import FormTextarea from '../../../../components/ui/textBox'
export default function AgentWebhookPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const title = 'Webhook'
  const [agent, setAgent] = useState(null)
  const [webhooks, setWebhooks] = useState([])
  const [selectedWebhook, setSelectedWebhook] = useState(null)
  const [invocations, setInvocations] = useState([])
  const [fetching, setFetching] = useState(false)
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

  const { logout } = useLogout()
  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value
    if (value && typeof value === 'object') return Object.values(value)
    return []
  }

  // --- Fetch agent & webhooks (parallel) ---
  const fetchData = useCallback(async () => {
    if (!id || !user) return
    const controller = new AbortController()
    setFetching(true)
    try {
      const [agentRes, webhooksRes] = await Promise.all([
        fetch(`/api/agents/${id}`, { signal: controller.signal }),
        fetch(`/api/agents/${id}/webhook`, { signal: controller.signal })
      ])

      const agentData = await agentRes.json()
      const webhooksData = await webhooksRes.json()
      setAgent(agentData)
      console.log('Fetched webhooks:', webhooksData.webhooks)

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
        console.error(err)
        toast.error('Failed to load webhook data')
      }
    } finally {
      setFetching(false)
    }
    return () => controller.abort()
  }, [id, user])
  useEffect(() => {
    let cleanupFn

    const run = async () => {
      cleanupFn = await fetchData()
    }

    run()

    return () => {
      // Abort any pending requests if component unmounts or ID changes
      if (typeof cleanupFn === 'function') cleanupFn()
    }
  }, [fetchData])

  const fetchInvocations = useCallback(async (webhookId) => {
    try {
      const res = await fetch(
        `/api/agent-webhooks/${webhookId}/invocations?limit=50`
      )
      const data = await res.json()

      const normalized = Array.isArray(data.invocations)
        ? data.invocations
        : Object.values(data.invocations || {})

      setInvocations(normalized)
      calculateStats(normalized)
    } catch (err) {
      console.error('Error fetching invocations:', err)
    }
  }, [])

  const handleSelectWebhook = useCallback(
    (webhook) => {
      setSelectedWebhook(webhook)
      fetchInvocations(webhook.id)
    },
    [fetchInvocations]
  )

  const calculateStats = useCallback((invokesRaw) => {
    const invokes = Array.isArray(invokesRaw)
      ? invokesRaw
      : Object.values(invokesRaw || {})
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
  }, [])

  const createWebhook = async (webhookData) => {
    try {
      const response = await fetch(`/api/agents/${id}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      })

      if (!response.ok) throw new Error('Failed to create webhook')

      const data = await response.json()
      toast.success('Webhook created successfully!')
      setShowCreateModal(false)
      await fetchData()
    } catch (error) {
      console.error('Error creating webhook:', error)
      toast.error('Failed to create webhook')
    }
  }

  const toggleWebhook = async (webhook) => {
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
      await fetchData()
    } catch (error) {
      console.error('Error toggling webhook:', error)
      toast.error('Failed to update webhook')
    }
  }
  const deleteWebhook = async (webhookId) => {
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
      await fetchData()
    } catch (error) {
      console.error('Error deleting webhook:', error)
      toast.error('Failed to delete webhook')
    }
  }
  const regenerateKey = async (webhook) => {
    if (!confirm('Are you sure? This will invalidate the current webhook URL.'))
      return

    try {
      const response = await fetch(
        `/api/agent-webhooks/${webhook.id}/regenerate`,
        {
          method: 'POST'
        }
      )

      if (!response.ok) throw new Error('Failed to regenerate key')

      toast.success('Webhook key regenerated!')
      await fetchData()
    } catch (error) {
      console.error('Error regenerating key:', error)
      toast.error('Failed to regenerate key')
    }
  }
  const copyToClipboard = useCallback((text, message) => {
    navigator.clipboard.writeText(text)
    toast.success(message || 'Copied!')
  }, [])

  if (loading) {
    return (
      <LoadingState
        message='Loading... (Refresh the window if delayed)'
        className='min-h-screen'
      />
    )
  }

  return (
    <>
      {/* 1. NeonBackground fixed and z-0 */}
      <NeonBackground />

      {/* 2. SideBarLayout z-10, contains all content */}
      <SideBarLayout>
        {fetching && <LoadingState message='Loading WebHook Data...' />}
        {!fetching && (
          <Suspense
            fallback={<LoadingState message='Loading WebHook Data...' />}
          >
            <div className='relative w-full flex-1 font-mono text-white'>
              {/* Header */}
              <div className='sticky top-0 z-20 flex h-16 items-center'>
                <NavigationBar
                  profile={profile}
                  title = {title}
                  agent={agent}
                  onLogOutClick={logout}
                />
              </div>

              <div className='mx-auto w-full px-6 py-8'>
                {/* Hero Section */}
                <EmptyState onCreateWebhook={() => setShowCreateModal(true)} />

                {/* Webhook Info Cards */}
                {webhooks.length === 0 ? (
                  <div className='mx-auto flex max-w-6xl flex-row items-center justify-center'>
                    <div className='relative p-12 text-center'>
                      {/* Blur background */}
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='h-[300px] w-[300px] rounded-full bg-orange-600/30 blur-[120px]' />
                      </div>

                      <div className='relative z-10'>
                        <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-300'>
                          <Webhook className='h-10 w-10 text-white' />
                        </div>

                        <p className='mx-auto mb-8 max-w-lg text-neutral-200'>
                          Transform your AI agent into multiple webhook
                          endpoints. Create different webhooks for Zapier,
                          Make.com, your app, or any external integration.
                        </p>
                      </div>
                    </div>
                    <div className='mx-auto mb-8 flex max-w-3xl flex-col gap-4 text-left md:grid-cols-3'>
                      <Card className='rounded-lg bg-neutral-50 p-4'>
                        <Zap className='mb-2 h-6 w-6 text-yellow-600' />
                        <h3 className='mb-1 font-medium text-neutral-200'>
                          Multiple Endpoints
                        </h3>
                        <p className='text-sm text-neutral-400'>
                          Create unlimited webhooks per agent
                        </p>
                      </Card>
                      <Card className='rounded-lg bg-neutral-50 p-4'>
                        <Shield className='mb-2 h-6 w-6 text-green-600' />
                        <h3 className='mb-1 font-medium text-neutral-200'>
                          Individual Security
                        </h3>
                        <p className='text-sm text-neutral-400'>
                          Each webhook has own auth & rate limits
                        </p>
                      </Card>
                      <Card className='rounded-lg bg-neutral-50 p-4'>
                        <Activity className='mb-2 h-6 w-6 text-purple-600' />
                        <h3 className='mb-1 font-medium text-neutral-200'>
                          Separate Tracking
                        </h3>
                        <p className='text-sm text-neutral-400'>
                          Monitor each webhook independently
                        </p>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className='mt-8 grid grid-cols-1 gap-6 md:grid-cols-3'>
                    {/* Webhook List */}
                    <div className='md:col-span-1'>
                      <Card className='space-y-4 p-6'>
                        <h2 className='text-lg font-semibold text-white'>
                          Webhooks ({webhooks.length})
                        </h2>
                        <div className='divide-y divide-neutral-700'>
                          {webhooks.map((webhook) => (
                            <WebhookListItem
                              key={webhook.id}
                              webhook={webhook}
                              isSelected={selectedWebhook?.id === webhook.id}
                              onSelect={() => handleSelectWebhook(webhook)}
                              onToggle={() => toggleWebhook(webhook)}
                              onDelete={() => deleteWebhook(webhook.id)}
                            />
                          ))}
                        </div>
                      </Card>
                    </div>

                    {/* Webhook Details */}
                    <div className='md:col-span-2'>
                      {selectedWebhook ? (
                        <WebhookDetails
                          webhook={selectedWebhook}
                          invocations={invocations}
                          onTest={() => setShowTestModal(true)}
                          onSecurity={() => setShowSecurityModal(true)}
                          onRegenerate={() => regenerateKey(selectedWebhook)}
                          onEdit={() => setShowEditModal(true)}
                          copyToClipboard={copyToClipboard}
                        />
                      ) : (
                        <Card className='p-12 text-center'>
                          <Webhook className='mx-auto mb-4 h-16 w-16 text-white' />
                          <p className='text-white'>
                            Select a webhook to view details
                          </p>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                {/* Modals */}
                {showCreateModal && (
                  <CreateWebhookModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={createWebhook}
                  />
                )}

                {showTestModal && selectedWebhook && (
                  <TestModal
                    webhook={selectedWebhook}
                    onClose={() => setShowTestModal(false)}
                    onRefresh={() => fetchInvocations(selectedWebhook.id)}
                  />
                )}

                {showSecurityModal && selectedWebhook && (
                  <SecurityModal
                    webhook={selectedWebhook}
                    onClose={() => setShowSecurityModal(false)}
                    onUpdate={() => {
                      setShowSecurityModal(false)
                      fetchData()
                    }}
                  />
                )}

                {showEditModal && selectedWebhook && (
                  <EditWebhookModal
                    webhook={selectedWebhook}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={() => {
                      setShowEditModal(false)
                      fetchData()
                    }}
                  />
                )}
              </div>
            </div>
          </Suspense>
        )}
      </SideBarLayout>
    </>
  )
}
function EmptyState({ onCreateWebhook }) {
  return (
    <div className='mx-auto mt-8 max-w-3xl'>
      <div className='relative flex h-[40vh] flex-col items-center justify-center'>
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='h-[400px] w-[400px] animate-pulse rounded-full bg-orange-600/40 blur-[120px]' />
        </div>
        <div className='relative z-10 flex flex-col items-center'>
          {' '}
          <button
            onClick={onCreateWebhook}
            size='lg'
            className='flex cursor-pointer flex-col items-center justify-center px-8 hover:scale-105'
          >
            <Webhook className='mb-4 h-24 w-24 animate-bounce text-orange-400' />
            <p className='text-lg font-medium text-white'>
              Click here to create the webhook
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
function WebhookListItem({
  webhook,
  isSelected,
  onSelect,
  onToggle,
  onDelete
}) {
  return (
    <div
      className={`cursor-pointer rounded-lg p-4 transition-all duration-200 ${
        isSelected
          ? 'border-l-4 border-orange-600 bg-neutral-900 shadow-md'
          : 'hover:bg-neutral-50 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className='flex items-start justify-between'>
        <div className='min-w-0 flex-1'>
          <div className='mb-1 flex items-center space-x-2'>
            <h3 className='truncate font-medium text-neutral-200'>
              {webhook.name}
            </h3>
            <Badge
              variant={webhook.is_active ? 'success' : 'inactive'}
              className={`text-xs text-${webhook.is_active ? 'bg-green-500' : 'bg-red-500'}`}
            >
              {webhook.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {webhook.description && (
            <p className='mb-2 truncate text-sm text-neutral-300'>
              {webhook.description}
            </p>
          )}
          <div className='flex items-center space-x-4 text-xs text-neutral-200'>
            <span className='flex items-center'>
              {webhook.requires_auth ? (
                <Lock className='mr-1 h-3 w-3 text-neutral-500' />
              ) : (
                <Unlock className='mr-1 h-3 w-3 text-neutral-500' />
              )}
              {webhook.requires_auth ? 'Auth' : 'No Auth'}
            </span>
            <span>{webhook.rate_limit}/min</span>
          </div>
        </div>

        <div
          className='ml-2 flex items-center space-x-1'
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            onClick={onToggle}
            className='rounded p-1 transition-colors hover:bg-neutral-200'
            title={webhook.is_active ? 'Disable' : 'Enable'}
          >
            <Power
              className={`h-4 w-4 ${
                webhook.is_active ? 'text-green-600' : 'text-white'
              }`}
            />
          </Button>
          <Button
            onClick={onDelete}
            className='rounded p-1 transition-colors hover:bg-red-100'
            title='Delete'
          >
            <Trash2 className='h-4 w-4 text-red-600' />
          </Button>
        </div>
      </div>
    </div>
  )
}

function WebhookDetails({
  webhook,
  invocations,
  onTest,
  onSecurity,
  onRegenerate,
  onEdit,
  copyToClipboard
}) {
  const [showToken, setShowToken] = useState(false)

  const stats = calculateStats(invocations)

  return (
    <div className='space-y-6'>
      {/* Stats */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        {[
          {
            label: 'Status',
            value: webhook.is_active ? 'Active' : 'Inactive',
            icon: webhook.is_active ? CheckCircle : XCircle,
            color: webhook.is_active ? 'text-green-600' : 'text-white'
          },
          {
            label: 'Total Calls',
            value: stats.totalInvocations,
            icon: Activity,
            color: 'text-blue-600'
          },
          {
            label: 'Success Rate',
            value: `${stats.successRate}%`,
            icon: CheckCircle,
            color: 'text-green-600'
          },
          {
            label: 'Avg Response',
            value: `${stats.avgResponseTime}ms`,
            icon: Zap,
            color: 'text-yellow-600'
          }
        ].map((stat) => (
          <Card
            key={stat.label}
            className='flex flex-col items-center justify-center space-y-2 rounded-lg bg-neutral-50 p-4 text-center shadow transition-all hover:shadow-lg'
          >
            <stat.icon className={`h-6 w-6 ${stat.color}`} />
            <p className='text-sm text-neutral-200'>{stat.label}</p>
            <p className='text-lg font-semibold text-neutral-200'>
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Configuration */}
      <Card className='relative rounded-lg p-6 shadow-lg transition-all hover:shadow-xl'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-neutral-200'>
            Name: {webhook.name}
          </h2>
          <Button variant='outline' size='sm' onClick={onEdit}>
            <Edit2 className='mr-2 h-3 w-3' />
            Edit
          </Button>
        </div>
        {webhook.description && (
          <p className='mb-4 text-lg text-neutral-200'>
            Description: {webhook.description}
          </p>
        )}

        {/* Webhook URL */}
        <div className='mb-4'>
          <label className='mb-2 block text-sm font-medium text-neutral-400'>
            Webhook URL
          </label>
          <div className='flex space-x-2'>
            <FormInput
              value={webhook.webhook_url}
              readOnly
              className='w-full font-mono text-sm'
            />
            <Button
              variant='outline'
              onClick={() =>
                copyToClipboard(webhook.webhook_url, 'Webhook URL copied!')
              }
            >
              <Copy className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Authentication */}
        <div className='mb-4'>
          <div className='mb-2 flex items-center justify-between'>
            <label className='text-sm font-medium text-neutral-400'>
              Authentication
            </label>
            <div className='flex items-center space-x-2'>
              {webhook.requires_auth ? (
                <Lock className='h-4 w-4 text-green-600' />
              ) : (
                <Unlock className='h-4 w-4 text-white' />
              )}
              <span className='text-sm text-neutral-600'>
                {webhook.requires_auth ? 'Required' : 'Not Required'}
              </span>
            </div>
          </div>
          {webhook.requires_auth && webhook.auth_token && (
            <div className='flex space-x-2'>
              <FormInput
                type={showToken ? 'text' : 'password'}
                value={webhook.auth_token}
                readOnly
                className='w-full font-mono text-sm'
              />
              <Button
                variant='outline'
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  copyToClipboard(webhook.auth_token, 'Auth token copied!')
                }
              >
                <Copy className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='flex space-x-3 border-t pt-4'>
          <Button variant='outline' onClick={onTest}>
            <Activity className='mr-2 h-4 w-4 text-blue-600' />
            Test Webhook
          </Button>
          <Button variant='outline' onClick={onSecurity}>
            <Shield className='mr-2 h-4 w-4 text-green-600' />
            Security
          </Button>
          <Button
            variant='outline'
            onClick={onRegenerate}
            className='text-red-600'
          >
            <RefreshCw className='mr-2 h-4 w-4' />
            Regenerate
          </Button>
        </div>
      </Card>

      {/* Integration Examples */}
      <IntegrationExamples webhook={webhook} />

      {/* Invocations */}
      <InvocationsList invocations={invocations} />
    </div>
  )
}

function StatsCard({ label, value, icon: Icon, iconColor }) {
  return (
    <Card className='rounded-lg bg-neutral-50 p-4 shadow-sm transition-all duration-200 hover:shadow-md'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-neutral-600'>{label}</p>
          <p className='text-xl font-bold text-neutral-900'>{value}</p>
        </div>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </Card>
  )
}

function CreateWebhookModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [requiresAuth, setRequiresAuth] = useState(false)
  const [rateLimit, setRateLimit] = useState(100)
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Webhook name is required')
      return
    }

    setCreating(true)
    await onCreate({
      name: name.trim(),
      description: description.trim(),
      requires_auth: requiresAuth,
      rate_limit: parseInt(rateLimit)
    })
    setCreating(false)
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
      <Card className='mx-4 w-full max-w-md rounded-2xl p-6 shadow-2xl'>
        {/* Header */}
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-xl font-semibold text-orange-500'>
            Create New Webhook
          </h3>
          <button onClick={onClose} className='hover:cursor-pointer'>
            <XCircle className='h-6 w-6 text-orange-600' />
          </button>
        </div>

        {/* Form Fields */}
        <div className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-white'>
              Webhook Name *
            </label>
            <FormInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g., Zapier Integration'
              className='w-full rounded-lg focus:ring-2 focus:ring-blue-400'
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-white'>
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full rounded-lg border border-neutral-300 p-3 text-sm focus:ring-2 focus:ring-blue-400'
              rows='3'
              placeholder='What is this webhook used for?'
            />
          </div>

          <div>
            <label className='flex items-center space-x-3'>
              <input
                type='checkbox'
                checked={requiresAuth}
                onChange={(e) => setRequiresAuth(e.target.checked)}
                className='h-4 w-4 rounded text-blue-600 transition-colors'
              />
              <div>
                <span className='font-medium text-white'>
                  Require Authentication
                </span>
                <p className='text-sm text-white'>
                  Requests must include a bearer token
                </p>
              </div>
            </label>
          </div>

          <div className='flex flex-row items-center justify-between'>
            <label className='mb-2 block text-sm font-medium text-white'>
              Rate Limit (requests per minute)
            </label>
            <FormInput
              type='number'
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              min='1'
              max='1000'
              className='rounded-lg bg-orange-600/20 font-mono focus:ring focus:ring-blue-800'
            />
          </div>

          {/* Actions */}
          <div className='flex justify-end space-x-3 border-t pt-4'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className='hover:scale-105 hover:shadow-lg'
            >
              {creating ? 'Creating...' : 'Create Webhook'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
function EditWebhookModal({ webhook, onClose, onUpdate }) {
  const [name, setName] = useState(webhook.name)
  const [description, setDescription] = useState(webhook.description || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Webhook name is required')
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/agent-webhooks/${webhook.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim()
        })
      })

      if (!response.ok) throw new Error('Failed to update webhook')

      toast.success('Webhook updated successfully!')
      onUpdate()
    } catch (error) {
      console.error('Error updating webhook:', error)
      toast.error('Failed to update webhook')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
      <Card className='mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all hover:shadow-xl'>
        {/* Header */}
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-xl font-semibold text-orange-500'>
            Edit Webhook
          </h3>
          <button
            onClick={onClose}
            className='text-orange-600 transition-transform hover:scale-110 hover:cursor-pointer hover:text-orange-400'
          >
            <XCircle className='h-6 w-6' />
          </button>
        </div>

        {/* Form Fields */}
        <div className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-400'>
              Webhook Name *
            </label>
            <FormInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g., Zapier Integration'
              className='w-full'
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-400'>
              Description (Optional)
            </label>
            <FormTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full'
              rows='3'
              placeholder='What is this webhook used for?'
            />
          </div>

          {/* Actions */}
          <div className='flex justify-end space-x-3 border-t pt-4'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className='text-white hover:scale-105 hover:shadow-lg'
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
function StatsCards({ webhook, stats }) {
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
      {[
        {
          label: 'Status',
          value: webhook.is_active ? 'Active' : 'Inactive',
          icon: webhook.is_active ? CheckCircle : XCircle,
          color: webhook.is_active ? 'text-green-400' : 'text-neutral-500'
        },
        {
          label: 'Total Calls',
          value: stats.totalInvocations,
          icon: Activity,
          color: 'text-blue-400'
        },
        {
          label: 'Success Rate',
          value: `${stats.successRate}%`,
          icon: CheckCircle,
          color: 'text-green-400'
        },
        {
          label: 'Avg Response',
          value: `${stats.avgResponseTime}ms`,
          icon: Zap,
          color: 'text-yellow-400'
        }
      ].map((stat) => (
        <Card
          key={stat.label}
          className='relative flex items-center justify-between rounded-2xl bg-neutral-800/70 p-6 shadow-lg ring-1 ring-orange-500/40 transition-all hover:scale-105 hover:shadow-xl'
        >
          <div>
            <p className='text-sm font-medium text-white'>{stat.label}</p>
            <p className='text-2xl font-bold'>{stat.value}</p>
          </div>
          <stat.icon className={`h-10 w-10 ${stat.color}`} />
        </Card>
      ))}
    </div>
  )
}

function calculateStats(invocations) {
  const totalInvocations = invocations.length
  const successful = invocations.filter((i) => i.success).length
  const successRate =
    totalInvocations > 0
      ? ((successful / totalInvocations) * 100).toFixed(1)
      : 0

  const responseTimes = invocations
    .filter((i) => i.response_time_ms)
    .map((i) => i.response_time_ms)
  const avgResponseTime =
    responseTimes.length > 0
      ? Math.round(
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        )
      : 0

  return { totalInvocations, successRate, avgResponseTime }
}
function IntegrationExamples({ webhook }) {
  const [selectedLang, setSelectedLang] = useState('curl')

  const examples = {
    curl: `curl -X POST ${webhook.webhook_url} \\
  -H "Content-Type: application/json" \\
  ${webhook.requires_auth ? `-H "Authorization: Bearer ${webhook.auth_token}" \\\n  ` : ''}-d '{
    "message": "Hello, AI agent!",
    "sessionId": "user-123"
  }'`,

    javascript: `const response = await fetch('${webhook.webhook_url}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',${webhook.requires_auth ? `\n    'Authorization': 'Bearer ${webhook.auth_token}',` : ''}
  },
  body: JSON.stringify({
    message: 'Hello, AI agent!',
    sessionId: 'user-123'
  })
});

const data = await response.json();
console.log(data.response);`,

    python: `import requests

url = '${webhook.webhook_url}'
headers = {
    'Content-Type': 'application/json',${webhook.requires_auth ? `\n    'Authorization': 'Bearer ${webhook.auth_token}',` : ''}
}
payload = {
    'message': 'Hello, AI agent!',
    'sessionId': 'user-123'
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()['response'])`,

    php: `<?php
$url = '${webhook.webhook_url}';
$data = array(
    'message' => 'Hello, AI agent!',
    'sessionId' => 'user-123'
);

$options = array(
    'http' => array(
        'header'  => "Content-Type: application/json\\r\\n"${
          webhook.requires_auth
            ? ` .
                   "Authorization: Bearer ${webhook.auth_token}\\r\\n"`
            : ''
        },
        'method'  => 'POST',
        'content' => json_encode($data)
    )
);

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);
echo json_decode($result)->response;
?>`
  }

  const languages = [
    { id: 'curl', name: 'cURL' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'php', name: 'PHP' }
  ]

  const copyCode = () => {
    navigator.clipboard.writeText(examples[selectedLang])
    toast.success('Code copied to clipboard!')
  }

  return (
    <Card className='rounded-2xl bg-neutral-900/80 p-6 shadow-lg transition-all hover:shadow-xl'>
      <div>
        <h2 className='text-xl font-semibold text-white'>
          Integration Examples
        </h2>
      </div>

      <div className='mt-4'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex space-x-2'>
            {languages.map((lang) => (
              <Button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                  selectedLang === lang.id
                    ? 'bg-blue-600 text-white shadow-inner'
                    : 'text-white hover:bg-blue-500/20'
                }`}
              >
                {lang.name}
              </Button>
            ))}
          </div>
          <Button variant='outline' size='sm' onClick={copyCode}>
            <Copy className='mr-2 h-3 w-3' />
            Copy
          </Button>
        </div>

        <pre className='overflow-x-auto rounded-lg bg-neutral-800 p-4 font-mono text-sm text-white'>
          <code>{examples[selectedLang]}</code>
        </pre>

        <div className='mt-4 rounded-lg border border-orange-300 bg-blue-50/20 p-4'>
          <h4 className='mb-2 flex items-center font-medium text-orange-600'>
            <AlertCircle className='mr-2 h-4 w-4' />
            Expected Response
          </h4>
          <pre className='overflow-x-auto font-mono text-sm text-orange-400'>
            {`{
  "response": "AI agent's response here",
  "sessionId": "user-123",
  "tokensUsed": 150,
  "responseTimeMs": 1200,
  "timestamp": "2025-01-15T10:00:00Z"
}`}
          </pre>
        </div>
      </div>
    </Card>
  )
}

function InvocationsList({ invocations }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <Card className='rounded-2xl bg-neutral-900/80 p-6 shadow-lg transition-all hover:shadow-xl'>
      <div>
        <h2 className='text-xl font-semibold text-white'>Recent Invocations</h2>
      </div>

      <div className='mt-4'>
        {invocations.length === 0 ? (
          <div className='py-12 text-center'>
            <Activity className='mx-auto mb-3 h-12 w-12 animate-pulse text-white' />
            <p className='text-white'>No invocations yet</p>
            <p className='text-sm text-neutral-400'>
              Start sending requests to this webhook
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {invocations.map((invocation) => (
              <div
                key={invocation.id}
                className='rounded-xl bg-neutral-800/70 p-4 ring-1 ring-orange-500/30 transition-all hover:bg-neutral-700/60'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    {invocation.success ? (
                      <CheckCircle className='h-6 w-6 text-green-400' />
                    ) : (
                      <XCircle className='h-6 w-6 text-red-400' />
                    )}
                    <div>
                      <div className='font-medium text-white'>
                        {invocation.request_method} • Status{' '}
                        {invocation.response_status || 'N/A'}
                      </div>
                      <div className='text-sm text-white'>
                        {format(
                          new Date(invocation.created_at),
                          'MMM d, yyyy h:mm a'
                        )}{' '}
                        • {invocation.response_time_ms}ms
                      </div>
                    </div>
                  </div>

                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-orange-400 transition-transform hover:scale-105 hover:text-orange-500'
                    onClick={() =>
                      setExpanded(
                        expanded === invocation.id ? null : invocation.id
                      )
                    }
                  >
                    {expanded === invocation.id ? 'Hide' : 'Details'}
                  </Button>
                </div>

                {expanded === invocation.id && (
                  <div className='mt-4 space-y-3 border-t border-neutral-700 pt-4'>
                    <div>
                      <label className='text-sm font-medium text-white'>
                        Request Body:
                      </label>
                      <pre className='mt-1 overflow-x-auto rounded-lg bg-neutral-700/50 p-3 font-mono text-xs'>
                        {JSON.stringify(invocation.request_body, null, 2)}
                      </pre>
                    </div>

                    {invocation.response_body && (
                      <div>
                        <label className='text-sm font-medium text-white'>
                          Response:
                        </label>
                        <pre className='mt-1 overflow-x-auto rounded-lg bg-neutral-700/50 p-3 font-mono text-xs'>
                          {JSON.stringify(invocation.response_body, null, 2)}
                        </pre>
                      </div>
                    )}

                    {invocation.error_message && (
                      <div>
                        <label className='text-sm font-medium text-red-400'>
                          Error:
                        </label>
                        <div className='mt-1 rounded-lg border border-red-200 bg-red-50/50 p-3 font-mono text-sm text-red-600'>
                          {invocation.error_message}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function TestModal({ webhook, onClose, onRefresh }) {
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(
      {
        message: 'Test message from webhook interface',
        sessionId: 'test-session-' + Date.now()
      },
      null,
      2
    )
  )
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)

  const handleTest = async () => {
    try {
      setTesting(true)
      setTestResult(null)

      const payload = JSON.parse(testPayload)

      const response = await fetch(webhook.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhook.requires_auth && webhook.auth_token
            ? {
                Authorization: `Bearer ${webhook.auth_token}`
              }
            : {})
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      setTestResult({
        success: response.ok,
        status: response.status,
        data: data
      })

      if (response.ok) {
        toast.success('Test request successful!')
        setTimeout(() => {
          onRefresh()
        }, 1000)
      } else {
        toast.error('Test request failed')
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      })
      toast.error('Test request failed')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-neutral-900 p-6 shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-xl font-semibold text-orange-400'>
            Test Webhook - {webhook.name}
          </h3>
          <button
            onClick={onClose}
            className='cursor-pointer text-orange-600 transition-colors hover:text-orange-400'
          >
            <XCircle className='h-6 w-6' />
          </button>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-white'>
              Request Payload (JSON)
            </label>
            <textarea
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              className='h-48 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 font-mono text-sm text-white placeholder-neutral-400 focus:border-blue-500 focus:ring focus:ring-blue-200'
              placeholder='{"message": "Your test message"}'
            />
          </div>

          {testResult && (
            <div
              className={`rounded-xl p-4 ${
                testResult.success
                  ? 'border border-green-200 bg-orange-900/40'
                  : 'border border-red-200 bg-black'
              }`}
            >
              <h4
                className={`mb-2 font-medium ${
                  testResult.success ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {testResult.success ? '✓ Test Successful' : '✗ Test Failed'}
                {testResult.status && ` (${testResult.status})`}
              </h4>
              <pre
                className={`overflow-x-auto font-mono text-xs ${
                  testResult.success ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {JSON.stringify(testResult.data || testResult.error, null, 2)}
              </pre>
            </div>
          )}

          <div className='flex justify-end space-x-3'>
            <Button
              variant='outline'
              onClick={onClose}
              className='transition-transform hover:scale-105'
            >
              Close
            </Button>
            <Button
              onClick={handleTest}
              disabled={testing}
              className='transition-transform hover:scale-105'
            >
              {testing ? 'Testing...' : 'Send Test Request'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SecurityModal({ webhook, onClose, onUpdate }) {
  const [requiresAuth, setRequiresAuth] = useState(webhook.requires_auth)
  const [rateLimit, setRateLimit] = useState(webhook.rate_limit)
  const [allowedOrigins, setAllowedOrigins] = useState(
    webhook.allowed_origins?.join('\n') || ''
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)

      const response = await fetch(`/api/agent-webhooks/${webhook.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requires_auth: requiresAuth,
          rate_limit: parseInt(rateLimit),
          allowed_origins: allowedOrigins
            .split('\n')
            .map((o) => o.trim())
            .filter(Boolean)
        })
      })

      if (!response.ok) throw new Error('Failed to update settings')

      toast.success('Security settings updated!')
      onUpdate()
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-neutral-900 p-6 shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-xl font-semibold text-orange-500'>
            Security Settings - {webhook.name}
          </h3>
          <button
            onClick={onClose}
            className='cursor-pointer text-orange-400 transition-colors hover:text-orange-600'
          >
            <XCircle className='h-6 w-6' />
          </button>
        </div>

        <div className='space-y-6'>
          {/* Authentication */}
          <div>
            <label className='flex items-center space-x-3'>
              <input
                type='checkbox'
                checked={requiresAuth}
                onChange={(e) => setRequiresAuth(e.target.checked)}
                className='h-4 w-4 rounded text-blue-600'
              />
              <div>
                <span className='font-medium text-white'>
                  Require Authentication
                </span>
                <p className='text-sm text-white'>
                  Requests must include a valid bearer token
                </p>
              </div>
            </label>
          </div>

          {/* Rate Limit */}
          <div>
            <label className='mb-2 block text-sm font-medium text-orange-500'>
              Rate Limit (requests per minute)
            </label>
            <FormInput
              type='number'
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              min='1'
              max='1000'
              className='rounded-lg border border-neutral-700 bg-neutral-800 text-white focus:border-blue-500 focus:ring focus:ring-blue-200'
            />
            <p className='mt-1 text-sm text-white'>
              Maximum number of requests allowed per minute from a single IP
            </p>
          </div>

          {/* Allowed Origins */}
          <div>
            <label className='mb-2 block text-sm font-medium text-orange-500'>
              Allowed Origins (CORS)
            </label>
            <textarea
              value={allowedOrigins}
              onChange={(e) => setAllowedOrigins(e.target.value)}
              className='h-32 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 font-mono text-sm text-white placeholder-neutral-400 focus:border-blue-500 focus:ring focus:ring-blue-200'
              placeholder='https://example.com&#10;https://app.example.com&#10;*'
            />
            <p className='mt-1 text-sm text-white'>
              One origin per line. Use * to allow all origins (not recommended)
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end space-x-3 border-t border-neutral-700 pt-4'>
            <Button
              variant='outline'
              onClick={onClose}
              className='transition-transform hover:scale-105'
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className='transition-transform hover:scale-105'
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
