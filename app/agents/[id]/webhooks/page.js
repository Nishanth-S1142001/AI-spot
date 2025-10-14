'use client'

import Breadcrumbs from '../../../../components/ui/breadcrumbs'
import Badge from '../../../../components/ui/badge'
import Modal from '../../../../components/ui/modal'
import { format } from 'date-fns'
import {
  Activity,
  CheckCircle,
  Copy,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Power,
  RefreshCw,
  Trash2,
  Webhook,
  XCircle
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../../../components/providers/AuthProvider'
import Button from '../../../../components/ui/button'
import LoadingState from '../../../../components/common/loading-state'
export default function AgentWebhooks() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [agent, setAgent] = useState(null)
  const [webhooks, setWebhooks] = useState([])
  const [webhookLogs, setWebhookLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState(null)
  const [activeTab, setActiveTab] = useState('webhooks')

  useEffect(() => {
    if (id && user) {
      fetchData()
    }
  }, [id, user])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch agent
      const agentResponse = await fetch(`/api/agents/${id}`)
      const agentData = await agentResponse.json()
      setAgent(agentData)

      // Fetch webhooks
      const webhooksResponse = await fetch(`/api/agents/${id}/webhooks`)
      const webhooksData = await webhooksResponse.json()
      setWebhooks(webhooksData.webhooks || [])

      // Fetch recent logs
      const logsResponse = await fetch(
        `/api/agents/${id}/webhooks/logs?limit=50`
      )
      const logsData = await logsResponse.json()
      setWebhookLogs(logsData.logs || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load webhooks')
    } finally {
      setLoading(false)
    }
  }

  const toggleWebhookStatus = async (webhookId, currentStatus) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (!response.ok) throw new Error('Failed to update webhook')

      setWebhooks((prev) =>
        prev.map((w) =>
          w.id === webhookId ? { ...w, is_active: !currentStatus } : w
        )
      )

      toast.success(`Webhook ${!currentStatus ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error toggling webhook:', error)
      toast.error('Failed to update webhook status')
    }
  }

  const deleteWebhook = async (webhookId) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete webhook')

      setWebhooks((prev) => prev.filter((w) => w.id !== webhookId))
      toast.success('Webhook deleted successfully')
    } catch (error) {
      console.error('Error deleting webhook:', error)
      toast.error('Failed to delete webhook')
    }
  }

  const testWebhook = async (webhookId) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Test failed')

      toast.success('Test webhook sent successfully!')
      fetchData() // Refresh logs
    } catch (error) {
      console.error('Error testing webhook:', error)
      toast.error('Webhook test failed: ' + error.message)
    }
  }

  const copyWebhookUrl = (url) => {
    navigator.clipboard.writeText(url)
    toast.success('Webhook URL copied to clipboard!')
  }

  const viewLogs = async (webhookId) => {
    setSelectedWebhook(webhooks.find((w) => w.id === webhookId))
    setShowLogsModal(true)

    try {
      const response = await fetch(`/api/webhooks/${webhookId}/logs`)
      const data = await response.json()
      setWebhookLogs(data.logs || [])
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Failed to load webhook logs')
    }
  }

  const breadcrumbItems = [
    { name: 'Agents', href: '/agents' },
    { name: agent?.name || 'Agent', href: `/agents/${id}` },
    { name: 'Webhooks' }
  ]

  if (loading) {
    return (
      <LoadingState
        message='Loading... (Refresh the window if delayed)'
        className='min-h-screen'
      />
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='border-b border-gray-200 bg-white'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Button variant='ghost' onClick={() => router.back()}>
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <div>
                <h1 className='text-lg font-semibold text-gray-900'>
                  Webhooks
                </h1>
                <p className='text-sm text-gray-600'>{agent?.name}</p>
              </div>
            </div>

            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Create Webhook
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <Breadcrumbs items={breadcrumbItems} />

        {/* Tabs */}
        <div className='mb-6 border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            {[
              { id: 'webhooks', name: 'Webhooks', icon: Webhook },
              { id: 'logs', name: 'Activity Logs', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <tab.icon className='h-4 w-4' />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div>
            {webhooks.length === 0 ? (
              <div className='rounded-lg border bg-white p-12 text-center shadow-sm'>
                <Webhook className='mx-auto mb-4 h-16 w-16 text-gray-400' />
                <h3 className='mb-2 text-lg font-medium text-gray-900'>
                  No webhooks configured
                </h3>
                <p className='mb-6 text-gray-600'>
                  Create webhooks to receive real-time notifications when events
                  occur with your agent?.
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Your First Webhook
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                {webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className='rounded-lg border bg-white p-6 shadow-sm'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center space-x-3'>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {webhook.name}
                          </h3>
                          <Badge
                            variant={
                              webhook.is_active ? 'default' : 'secondary'
                            }
                          >
                            {webhook.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        <div className='mb-3 flex items-center space-x-2'>
                          <code className='rounded bg-gray-100 px-3 py-1 text-sm text-gray-700'>
                            {webhook.url}
                          </code>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => copyWebhookUrl(webhook.url)}
                          >
                            <Copy className='h-3 w-3' />
                          </Button>
                        </div>

                        <div className='mb-3 flex flex-wrap gap-2'>
                          {webhook.events.map((event) => (
                            <Badge
                              key={event}
                              variant='outline'
                              className='text-xs'
                            >
                              {event}
                            </Badge>
                          ))}
                        </div>

                        <div className='text-sm text-gray-500'>
                          Created{' '}
                          {format(new Date(webhook.created_at), 'MMM d, yyyy')}{' '}
                          • Timeout: {webhook.timeout_seconds}s • Retry:{' '}
                          {webhook.retry_count}x
                        </div>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => testWebhook(webhook.id)}
                        >
                          <RefreshCw className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => viewLogs(webhook.id)}
                        >
                          <Activity className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setSelectedWebhook(webhook)
                            setShowEditModal(true)
                          }}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            toggleWebhookStatus(webhook.id, webhook.is_active)
                          }
                        >
                          <Power
                            className={`h-4 w-4 ${webhook.is_active ? 'text-green-600' : 'text-gray-400'}`}
                          />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => deleteWebhook(webhook.id)}
                          className='text-red-600 hover:text-red-800'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className='rounded-lg border bg-white shadow-sm'>
            <div className='p-6'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Recent Activity
              </h3>

              {webhookLogs.length === 0 ? (
                <div className='py-12 text-center'>
                  <Activity className='mx-auto mb-3 h-12 w-12 text-gray-400' />
                  <p className='text-gray-600'>No webhook activity yet</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {webhookLogs.map((log) => (
                    <WebhookLogItem key={log.id} log={log} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Webhook Modal */}
      {showCreateModal && (
        <CreateWebhookModal
          agentId={id}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchData()
          }}
        />
      )}

      {/* Edit Webhook Modal */}
      {showEditModal && selectedWebhook && (
        <EditWebhookModal
          webhook={selectedWebhook}
          onClose={() => {
            setShowEditModal(false)
            setSelectedWebhook(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedWebhook(null)
            fetchData()
          }}
        />
      )}

      {/* Logs Modal */}
      {showLogsModal && selectedWebhook && (
        <WebhookLogsModal
          webhook={selectedWebhook}
          logs={webhookLogs}
          onClose={() => {
            setShowLogsModal(false)
            setSelectedWebhook(null)
          }}
        />
      )}
    </div>
  )
}

// ============================================
// WEBHOOK LOG ITEM COMPONENT
// ============================================

function WebhookLogItem({ log }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className='rounded-lg border border-gray-200 p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          {log.success ? (
            <CheckCircle className='h-5 w-5 text-green-500' />
          ) : (
            <XCircle className='h-5 w-5 text-red-500' />
          )}
          <div>
            <div className='font-medium text-gray-900'>{log.event_type}</div>
            <div className='text-sm text-gray-500'>
              {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')} • Attempt{' '}
              {log.attempt_number} • Status: {log.response_status || 'N/A'}
            </div>
          </div>
        </div>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <EyeOff className='h-4 w-4' />
          ) : (
            <Eye className='h-4 w-4' />
          )}
        </Button>
      </div>

      {expanded && (
        <div className='mt-4 space-y-3'>
          <div>
            <label className='text-sm font-medium text-gray-700'>
              Payload:
            </label>
            <pre className='mt-1 overflow-x-auto rounded bg-gray-100 p-3 text-xs'>
              {JSON.stringify(log.payload, null, 2)}
            </pre>
          </div>

          {log.response_body && (
            <div>
              <label className='text-sm font-medium text-gray-700'>
                Response:
              </label>
              <pre className='mt-1 overflow-x-auto rounded bg-gray-100 p-3 text-xs'>
                {log.response_body}
              </pre>
            </div>
          )}

          {log.error_message && (
            <div>
              <label className='text-sm font-medium text-red-700'>Error:</label>
              <div className='mt-1 rounded bg-red-50 p-3 text-sm text-red-600'>
                {log.error_message}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export function CreateWebhookModal({ agentId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState(['message_received'])
  const [customHeaders, setCustomHeaders] = useState([{ key: '', value: '' }])

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const availableEvents = [
    {
      id: 'message_received',
      name: 'Message Received',
      description: 'When a user sends a message'
    },
    {
      id: 'agent_responded',
      name: 'Agent Responded',
      description: 'When the agent sends a response'
    },
    {
      id: 'conversation_started',
      name: 'Conversation Started',
      description: 'When a new conversation begins'
    },
    {
      id: 'conversation_ended',
      name: 'Conversation Ended',
      description: 'When a conversation ends'
    },
    {
      id: 'workflow_triggered',
      name: 'Workflow Triggered',
      description: 'When a workflow is triggered'
    },
    {
      id: 'booking_created',
      name: 'Booking Created',
      description: 'When a calendar booking is made'
    }
  ]

  const toggleEvent = (eventId) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    )
  }

  const onSubmit = async (data) => {
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`/api/webhooks/${webhook.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          url: data.url,
          events: selectedEvents,
          secret: data.secret || null,
          retry_count: parseInt(data.retry_count),
          timeout_seconds: parseInt(data.timeout_seconds)
        })
      })

      if (!response.ok) throw new Error('Failed to update webhook')

      toast.success('Webhook updated successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error updating webhook:', error)
      toast.error('Failed to update webhook')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen onClose={onClose} title='Edit Webhook' size='lg'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Webhook Name *
          </label>
          <Input
            {...register('name', { required: 'Name is required' })}
            className={errors.name ? 'border-red-500' : ''}
          />
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Webhook URL *
          </label>
          <Input
            {...register('url', { required: 'URL is required' })}
            className={errors.url ? 'border-red-500' : ''}
          />
        </div>

        <div>
          <label className='mb-3 block text-sm font-medium text-gray-700'>
            Events *
          </label>
          <div className='space-y-2'>
            {availableEvents.map((event) => (
              <label
                key={event.id}
                className='flex cursor-pointer items-center space-x-3'
              >
                <input
                  type='checkbox'
                  checked={selectedEvents.includes(event.id)}
                  onChange={() => toggleEvent(event.id)}
                  className='h-4 w-4 rounded text-blue-600'
                />
                <span>{event.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Retry Count
            </label>
            <Input type='number' {...register('retry_count')} min={0} max={5} />
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Timeout (seconds)
            </label>
            <Input
              type='number'
              {...register('timeout_seconds')}
              min={5}
              max={120}
            />
          </div>
        </div>

        <div className='flex justify-end space-x-3'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? 'Updating...' : 'Update Webhook'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ============================================
// WEBHOOK LOGS MODAL
// ============================================

export function WebhookLogsModal({ webhook, logs, onClose }) {
  return (
    <Modal isOpen onClose={onClose} title={`Logs: ${webhook.name}`} size='xl'>
      <div className='max-h-96 space-y-4 overflow-y-auto'>
        {logs.length === 0 ? (
          <div className='py-8 text-center'>
            <Activity className='mx-auto mb-3 h-12 w-12 text-gray-400' />
            <p className='text-gray-600'>No logs available for this webhook</p>
          </div>
        ) : (
          logs.map((log) => <WebhookLogItem key={log.id} log={log} />)
        )}
      </div>
    </Modal>
  )
}
