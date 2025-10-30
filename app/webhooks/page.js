'use client'

import { format } from 'date-fns'
import {
  Webhook,
  Plus,
  Settings,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
  Copy,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Key,
  Shield,
  Clock,
  BarChart3,
  MessageSquare,
  Globe,
  Instagram,
  Calendar,
  Bot,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, memo, useCallback } from 'react'
import LoadingState from '../../components/common/loading-state'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'
import { useLogout } from '../../lib/supabase/auth'
import { dbClient, supabase } from '../../lib/supabase/dbClient'
import BottomModal from '../../components/ui/modal'

/**
 * Individual Webhook Item Component
 * ✅ FIXED: Now accepts agent prop for proper logs routing
 */
const WebhookItem = memo(({ webhook, agent, onRegenerate, onDelete }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    const webhookUrl = webhook?.webhook_key
      ? `${window.location.origin}/api/webhooks/${webhook.webhook_key}`
      : `${window.location.origin}/api/agent-webhooks/${webhook.id}`
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [webhook])

  const statusConfig = webhook?.is_active
    ? {
        icon: CheckCircle,
        bg: 'bg-green-900/40',
        text: 'text-green-300',
        ring: 'ring-green-500/50'
      }
    : {
        icon: XCircle,
        bg: 'bg-red-900/40',
        text: 'text-red-300',
        ring: 'ring-red-500/50'
      }

  const StatusIcon = statusConfig.icon

  return (
    <div className='rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4 transition-all hover:border-neutral-700/50 hover:bg-neutral-900/50'>
      <div className='flex items-start justify-between gap-4'>
        {/* Webhook Info */}
        <div className='min-w-0 flex-1 space-y-3'>
          {/* Header */}
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900/40'>
              <Webhook className='h-4 w-4 text-blue-400' />
            </div>
            <div className='min-w-0 flex-1'>
              <h4 className='truncate font-semibold text-neutral-200'>
                {webhook?.name || 'Unnamed Webhook'}
              </h4>
              <div className='mt-1 flex items-center gap-2'>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ring-1 ${statusConfig.ring}`}
                >
                  <StatusIcon className='mr-1 h-3 w-3' />
                  {webhook?.is_active ? 'Active' : 'Inactive'}
                </span>
                {webhook?.requires_auth && (
                  <span className='inline-flex items-center rounded-full bg-orange-900/40 px-2 py-0.5 text-xs font-medium text-orange-300 ring-1 ring-orange-500/50'>
                    <Shield className='mr-1 h-3 w-3' />
                    Auth
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {webhook?.description && (
            <p className='line-clamp-2 text-sm text-neutral-400'>
              {webhook.description}
            </p>
          )}

          {/* Webhook URL */}
          <div className='rounded-lg border border-neutral-800/50 bg-neutral-950/50 p-3'>
            <div className='flex items-center justify-between gap-2'>
              <div className='min-w-0 flex-1'>
                <p className='mb-1 text-xs text-neutral-500'>Webhook URL</p>
                <p className='truncate font-mono text-sm text-neutral-300'>
                  {webhook?.webhook_key
                    ? `/api/webhooks/${webhook.webhook_key}`
                    : `/api/agent-webhooks/${webhook?.id}`}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className='flex-shrink-0 rounded-lg bg-neutral-800/50 p-2 transition-colors hover:bg-neutral-700/50'
                title='Copy URL'
              >
                {copied ? (
                  <CheckCircle className='h-4 w-4 text-green-400' />
                ) : (
                  <Copy className='h-4 w-4 text-neutral-400' />
                )}
              </button>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className='flex items-center justify-between border-t border-neutral-800/50 pt-2 text-xs text-neutral-500'>
            <span>
              Created{' '}
              {format(
                new Date(webhook?.created_at || new Date()),
                'MMM d, yyyy'
              )}
            </span>
            <span>
              Updated{' '}
              {format(
                new Date(webhook?.updated_at || new Date()),
                'MMM d, h:mm a'
              )}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className='flex flex-col gap-2'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onRegenerate(webhook)}
            className='w-full justify-start text-xs'
            title='Regenerate webhook key'
          >
            <Key className='mr-1 h-3 w-3' />
            Regen
          </Button>
          {/* ✅ FIXED: Proper logs routing with agent ID */}
          <Link href={`/agents/${agent?.id}/webhook`}>
            <Button
              size='sm'
              variant='ghost'
              className='w-full justify-start text-xs'
            >
              <Activity className='mr-1 h-3 w-3' />
              Logs
            </Button>
          </Link>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onDelete(webhook)}
            className='w-full justify-start text-xs text-red-400 hover:bg-red-900/20 hover:text-red-300'
            title='Delete webhook'
          >
            <Trash2 className='mr-1 h-3 w-3' />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
})

WebhookItem.displayName = 'WebhookItem'

/**
 * Agent Webhooks Group Component - Shows all webhooks for one agent
 * ✅ FIXED: Now passes agent prop to WebhookItem
 */
const AgentWebhooksGroup = memo(
  ({
    agent,
    webhooks,
    onCreateWebhook,
    onRegenerateWebhook,
    onDeleteWebhook,
    getPurposeIcon
  }) => {
    const [isExpanded, setIsExpanded] = useState(true)
    const [webhookStats, setWebhookStats] = useState(null)
    const [loadingStats, setLoadingStats] = useState(false)

    // Fetch webhook stats for this agent
    useEffect(() => {
      const fetchStats = async () => {
        if (!agent?.id || !isExpanded) return

        setLoadingStats(true)
        try {
          const response = await fetch(`/api/agents/${agent.id}/webhook/stats`)
          if (response.ok) {
            const data = await response.json()
            setWebhookStats(data)
          }
        } catch (error) {
          console.error('Error fetching webhook stats:', error)
        } finally {
          setLoadingStats(false)
        }
      }

      fetchStats()
    }, [agent?.id, isExpanded, webhooks.length])

    const getPurposeColors = () => {
      const colors = {
        instagram: 'from-pink-900/40 to-pink-950/20 border-pink-600/30',
        messenger: 'from-blue-900/40 to-blue-950/20 border-blue-600/30',
        calendar: 'from-green-900/40 to-green-950/20 border-green-600/30',
        website: 'from-purple-900/40 to-purple-950/20 border-purple-600/30',
        default: 'from-blue-900/40 to-blue-950/20 border-blue-600/30'
      }
      return colors[agent?.purpose] || colors.default
    }

    const getIconBgColor = () => {
      const colors = {
        instagram: 'bg-pink-900/40',
        messenger: 'bg-blue-900/40',
        calendar: 'bg-green-900/40',
        website: 'bg-purple-900/40',
        default: 'bg-blue-900/40'
      }
      return colors[agent?.purpose] || colors.default
    }

    return (
      <Card className={`border bg-gradient-to-br ${getPurposeColors()}`}>
        {/* Agent Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='flex w-full items-center justify-between rounded-t-lg p-6 transition-colors hover:bg-white/5'
        >
          <div className='flex items-center gap-4'>
            {/* Agent Icon */}
            <div className='relative'>
              <div
                className={`absolute inset-0 ${getIconBgColor()} opacity-50 blur-xl`}
              />
              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-lg ${getIconBgColor()} border border-neutral-800/50`}
              >
                {getPurposeIcon(agent?.purpose)}
              </div>
            </div>

            {/* Agent Info */}
            <div className='text-left'>
              <h3 className='text-xl font-bold text-neutral-100'>
                {agent?.name || 'Untitled Agent'}
              </h3>
              <p className='mt-1 text-sm text-neutral-400'>
                {webhooks.length}{' '}
                {webhooks.length === 1 ? 'webhook' : 'webhooks'}
                {webhookStats &&
                  ` • ${webhookStats.overall.activeWebhooks} active`}
              </p>
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <div className='flex items-center gap-4'>
            {/* Quick Stats */}
            {webhookStats && !loadingStats && (
              <div className='flex items-center gap-4 text-sm'>
                <div className='text-center'>
                  <p className='text-xs text-neutral-400'>Calls</p>
                  <p className='font-bold text-neutral-200'>
                    {webhookStats.overall.totalInvocations}
                  </p>
                </div>
                <div className='text-center'>
                  <p className='text-xs text-neutral-400'>Success</p>
                  <p className='font-bold text-green-400'>
                    {webhookStats.overall.avgSuccessRate}%
                  </p>
                </div>
              </div>
            )}

            {isExpanded ? (
              <ChevronUp className='h-5 w-5 text-neutral-400' />
            ) : (
              <ChevronDown className='h-5 w-5 text-neutral-400' />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className='space-y-4 px-6 pb-6'>
            {/* Stats Cards */}
            {webhookStats &&
              !loadingStats &&
              webhookStats.overall.totalWebhooks > 0 && (
                <div className='mb-4 grid grid-cols-4 gap-3'>
                  <div className='rounded-lg border border-neutral-800/30 bg-neutral-900/50 p-3'>
                    <p className='text-xs text-neutral-500'>Total Calls</p>
                    <p className='mt-1 text-lg font-bold text-neutral-200'>
                      {webhookStats.overall.totalInvocations}
                    </p>
                  </div>
                  <div className='rounded-lg border border-neutral-800/30 bg-neutral-900/50 p-3'>
                    <p className='text-xs text-neutral-500'>Success Rate</p>
                    <p className='mt-1 text-lg font-bold text-green-400'>
                      {webhookStats.overall.avgSuccessRate}%
                    </p>
                  </div>
                  <div className='rounded-lg border border-neutral-800/30 bg-neutral-900/50 p-3'>
                    <p className='text-xs text-neutral-500'>Avg Response</p>
                    <p className='mt-1 text-lg font-bold text-blue-400'>
                      {webhookStats.overall.avgResponseTime}ms
                    </p>
                  </div>
                  <div className='rounded-lg border border-neutral-800/30 bg-neutral-900/50 p-3'>
                    <p className='text-xs text-neutral-500'>Last 24h</p>
                    <p className='mt-1 text-lg font-bold text-purple-400'>
                      {webhookStats.overall.last24hTotal}
                    </p>
                  </div>
                </div>
              )}

            {/* Webhooks List */}
            {webhooks.length === 0 ? (
              <div className='rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-8 text-center'>
                <Webhook className='mx-auto mb-3 h-12 w-12 text-neutral-600' />
                <p className='mb-4 text-neutral-400'>
                  No webhooks created for this agent yet
                </p>
                <Button
                  size='sm'
                  onClick={() => onCreateWebhook(agent)}
                  className='mx-auto'
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Create First Webhook
                </Button>
              </div>
            ) : (
              <div className='space-y-3'>
                {/* ✅ FIXED: Pass agent prop to WebhookItem */}
                {webhooks.map((webhook) => (
                  <WebhookItem
                    key={webhook.id}
                    webhook={webhook}
                    agent={agent}
                    onRegenerate={onRegenerateWebhook}
                    onDelete={onDeleteWebhook}
                  />
                ))}
              </div>
            )}

            {/* Create New Webhook Button */}
            {webhooks.length > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => onCreateWebhook(agent)}
                className='w-full'
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Another Webhook
              </Button>
            )}
          </div>
        )}
      </Card>
    )
  }
)

AgentWebhooksGroup.displayName = 'AgentWebhooksGroup'

/**
 * MAIN WEBHOOKS DASHBOARD COMPONENT
 */
export default function WebhooksDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()
  const router = useRouter()

  // State management
  const [agents, setAgents] = useState([])
  const [webhooksByAgent, setWebhooksByAgent] = useState({})
  const [analytics, setAnalytics] = useState({
    totalWebhooks: 0,
    totalCalls: 0,
    successRate: 0,
    avgResponseTime: 0,
    activeWebhooks: 0
  })
  const [fetching, setFetching] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)

  const hasFetchedData = useRef(false)

  // Memoized icon getter
  const getPurposeIcon = useCallback((purpose) => {
    const iconProps = 'h-5 w-5'
    switch (purpose) {
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
  }, [])

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    try {
      setFetching(true)

      // Fetch all agents
      const userAgents = await dbClient.getUserAgents(user.id)
      setAgents(userAgents || [])

      if (!userAgents || !userAgents.length) {
        setAnalytics({
          totalWebhooks: 0,
          totalCalls: 0,
          successRate: 0,
          avgResponseTime: 0,
          activeWebhooks: 0
        })
        hasFetchedData.current = true
        return
      }

      // Fetch webhooks for each agent
      const webhooksMap = {}
      let totalWebhooks = 0
      let totalActive = 0

      for (const agent of userAgents) {
        try {
          const response = await fetch(`/api/agents/${agent.id}/webhook`)
          if (response.ok) {
            const data = await response.json()
            webhooksMap[agent.id] = data.webhooks || []
            totalWebhooks += data.webhooks?.length || 0
            totalActive += data.webhooks?.filter((w) => w.is_active).length || 0
          } else {
            webhooksMap[agent.id] = []
          }
        } catch (error) {
          console.error(`Error fetching webhooks for agent ${agent.id}:`, error)
          webhooksMap[agent.id] = []
        }
      }

      setWebhooksByAgent(webhooksMap)

      // Calculate overall analytics
      setAnalytics({
        totalWebhooks,
        activeWebhooks: totalActive,
        totalCalls: 0,
        successRate: 0,
        avgResponseTime: 0
      })

      hasFetchedData.current = true
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setFetching(false)
    }
  }, [user])

  // ✅ FIXED: Simpler auth check and data fetching
  useEffect(() => {
    if (authLoading) return // Wait for auth to finish

    if (!user) {
      router.push('/') // Redirect if no user
      return
    }

    // User is authenticated, fetch data if not already fetched
    if (!hasFetchedData.current) {
      fetchDashboardData()
    } else {
      setFetching(false)
    }
  }, [authLoading, user, router, fetchDashboardData])

  // Handle create webhook
  const handleCreateWebhook = (agent) => {
    setSelectedAgent(agent)
    setIsCreateModalOpen(true)
  }

  // Handle regenerate webhook
  const handleRegenerateWebhook = async (webhook) => {
    if (
      !confirm(
        'Are you sure you want to regenerate this webhook? The current URL will become invalid.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(
        `/api/agent-webhooks/${webhook.id}/regenerate`,
        {
          method: 'POST'
        }
      )

      if (response.ok) {
        alert('Webhook regenerated successfully!')
        fetchDashboardData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to regenerate webhook'}`)
      }
    } catch (error) {
      console.error('Error regenerating webhook:', error)
      alert('Failed to regenerate webhook')
    }
  }

  // Handle delete webhook
  const handleDeleteWebhook = async (webhook) => {
    if (
      !confirm(
        `Are you sure you want to delete "${webhook.name}"? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/agent-webhooks/${webhook.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Webhook deleted successfully!')
        fetchDashboardData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to delete webhook'}`)
      }
    } catch (error) {
      console.error('Error deleting webhook:', error)
      alert('Failed to delete webhook')
    }
  }

  // Handle create new webhook submission
  const handleCreateWebhookSubmit = async (agent) => {
    router.push(`/agents/${agent.id}/webhook`)
    setIsCreateModalOpen(false)
  }

  // Loading states
  // if (authLoading) {
  //   return <LoadingState message='Authenticating...' className='min-h-screen' />
  // }

  // if (fetching && !hasFetchedData.current) {
  //   return (
  //     <LoadingState
  //       message='Loading your webhooks...'
  //       className='min-h-screen'
  //     />
  //   )
  // }

  // Loading states
  if (authLoading || fetching) {
    return (
      <LoadingState
        message={authLoading ? 'Authenticating...' : 'Loading your webhooks...'}
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
              message='Webhooks'
              title='AI Agency'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Hero Section */}
              <div className='relative mb-12 flex min-h-[35vh] flex-col items-center justify-center'>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[100px]' />
                </div>

                <div className='relative z-10 text-center'>
                  <h1 className='mb-3 text-4xl font-bold text-neutral-100'>
                    Webhook Management
                  </h1>
                  <p className='mb-6 text-lg text-neutral-400'>
                    Connect your AI agents to external services
                  </p>

                  {/* Quick Create */}
                  {agents.length > 0 && (
                    <div className='flex items-center justify-center gap-3'>
                      <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className='flex items-center gap-2'
                      >
                        <Plus className='h-4 w-4' />
                        Create Webhook
                      </Button>
                      <Link href='/agents/dashboard'>
                        <Button variant='outline'>View Agents</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Analytics Cards */}
              <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                <Card className='border-blue-600/20 bg-gradient-to-br from-blue-900/20 to-neutral-950/50'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-neutral-400'>
                        Total Webhooks
                      </p>
                      <p className='mt-2 text-3xl font-bold text-blue-400'>
                        {analytics.totalWebhooks}
                      </p>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/40'>
                      <Webhook className='h-6 w-6 text-blue-400' />
                    </div>
                  </div>
                  <div className='mt-4 flex items-center text-xs text-neutral-500'>
                    <TrendingUp className='mr-1 h-3 w-3' />
                    Across {agents.length} agents
                  </div>
                </Card>

                <Card className='border-green-600/20 bg-gradient-to-br from-green-900/20 to-neutral-950/50'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-neutral-400'>
                        Active Webhooks
                      </p>
                      <p className='mt-2 text-3xl font-bold text-green-400'>
                        {analytics.activeWebhooks}
                      </p>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-900/40'>
                      <CheckCircle className='h-6 w-6 text-green-400' />
                    </div>
                  </div>
                  <div className='mt-4 flex items-center text-xs text-neutral-500'>
                    <Activity className='mr-1 h-3 w-3' />
                    {analytics.totalWebhooks > 0
                      ? `${Math.round((analytics.activeWebhooks / analytics.totalWebhooks) * 100)}% active rate`
                      : 'No webhooks yet'}
                  </div>
                </Card>

                <Card className='border-purple-600/20 bg-gradient-to-br from-purple-900/20 to-neutral-950/50'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-neutral-400'>
                        Agents
                      </p>
                      <p className='mt-2 text-3xl font-bold text-purple-400'>
                        {agents.length}
                      </p>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/40'>
                      <Bot className='h-6 w-6 text-purple-400' />
                    </div>
                  </div>
                  <div className='mt-4 flex items-center text-xs text-neutral-500'>
                    <Activity className='mr-1 h-3 w-3' />
                    With webhook support
                  </div>
                </Card>

                <Card className='border-orange-600/20 bg-gradient-to-br from-orange-900/20 to-neutral-950/50'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-neutral-400'>
                        Total Calls
                      </p>
                      <p className='mt-2 text-3xl font-bold text-orange-400'>
                        {analytics.totalCalls.toLocaleString()}
                      </p>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-900/40'>
                      <Zap className='h-6 w-6 text-orange-400' />
                    </div>
                  </div>
                  <div className='mt-4 flex items-center text-xs text-neutral-500'>
                    <Activity className='mr-1 h-3 w-3' />
                    All time requests
                  </div>
                </Card>
              </div>

              {/* Agents with Webhooks */}
              <div className='mb-8'>
                <div className='mb-6 flex items-center justify-between'>
                  <div>
                    <h3 className='text-2xl font-bold text-neutral-100'>
                      Webhooks by Agent
                    </h3>
                    <p className='mt-1 text-sm text-neutral-400'>
                      Manage webhooks organized by their AI agents
                    </p>
                  </div>
                  {agents.length > 0 && (
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      className='flex items-center gap-2'
                    >
                      <Plus className='h-4 w-4' />
                      Create Webhook
                    </Button>
                  )}
                </div>

                {agents.length === 0 ? (
                  // Empty State - No Agents
                  <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
                    <div className='flex flex-col items-center py-16 text-center'>
                      <div className='mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-900/40'>
                        <AlertCircle className='h-10 w-10 text-blue-400' />
                      </div>
                      <h4 className='mb-2 text-xl font-semibold text-neutral-200'>
                        No agents found
                      </h4>
                      <p className='mb-6 max-w-md text-sm text-neutral-400'>
                        Create an AI agent first to start using webhooks
                      </p>
                      <Link href='/agents/create'>
                        <Button>
                          <Plus className='mr-2 h-4 w-4' />
                          Create Your First Agent
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ) : (
                  // Agents List with Webhooks
                  <div className='space-y-6'>
                    {agents.map((agent) => (
                      <AgentWebhooksGroup
                        key={agent.id}
                        agent={agent}
                        webhooks={webhooksByAgent[agent.id] || []}
                        onCreateWebhook={handleCreateWebhook}
                        onRegenerateWebhook={handleRegenerateWebhook}
                        onDeleteWebhook={handleDeleteWebhook}
                        getPurposeIcon={getPurposeIcon}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SideBarLayout>

      {/* Create Webhook Modal */}
      <BottomModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSelectedAgent(null)
        }}
      >
        <div className='space-y-6'>
          <div className='text-center'>
            <h3 className='mb-2 text-2xl font-bold text-neutral-100'>
              {selectedAgent
                ? `Create Webhook for ${selectedAgent.name}`
                : 'Select an Agent'}
            </h3>
            <p className='text-sm text-neutral-400'>
              {selectedAgent
                ? 'This will create a new webhook endpoint for your agent'
                : 'Choose which agent to create a webhook for'}
            </p>
          </div>

          {selectedAgent ? (
            <div className='space-y-4'>
              <Button
                onClick={() => handleCreateWebhookSubmit(selectedAgent)}
                className='w-full'
              >
                <Plus className='mr-2 h-4 w-4' />
                Create Webhook for {selectedAgent.name}
              </Button>
              <Button
                variant='outline'
                onClick={() => setSelectedAgent(null)}
                className='w-full'
              >
                Choose Different Agent
              </Button>
            </div>
          ) : (
            <div className='grid max-h-96 gap-3 overflow-y-auto'>
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className='group w-full rounded-lg border-2 border-blue-600/30 bg-gradient-to-br from-blue-900/20 to-blue-950/10 p-4 text-left transition-all hover:scale-[1.02] hover:border-blue-500/50 hover:from-blue-900/30 hover:to-blue-950/20'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900/40'>
                      {getPurposeIcon(agent.purpose)}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h4 className='truncate font-bold text-neutral-100'>
                        {agent.name}
                      </h4>
                      <p className='text-xs text-neutral-400 capitalize'>
                        {agent.purpose}
                      </p>
                    </div>
                    <div className='text-xs text-neutral-500'>
                      {(webhooksByAgent[agent.id] || []).length} webhooks
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </BottomModal>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes agent-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
        }

        .agent-pulse {
          animation: agent-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
