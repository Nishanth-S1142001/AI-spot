'use client'

import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  Copy,
  Edit2,
  Play,
  Plus,
  Trash2,
  Webhook,
  Workflow,
  Activity,
  Zap,
  TrendingUp,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, memo, useMemo } from 'react'
import { useAuth } from '../../components/providers/AuthProvider'
import Badge from '../../components/ui/badge'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'
import SearchBar from '../../components/common/search-bar'
import Pagination from '../../components/common/pagination'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useLogout } from '../../lib/supabase/auth'
import LoadingState from '../../components/common/loading-state'
import {
  useWorkflows,
  useCreateWorkflow,
  useDeleteWorkflow
} from '../../lib/hooks/useWorkflowData'
import WorkflowExecutionsPageSkeleton from '../../components/skeleton/WorkflowExecutionsPageSkeleton'
/**
 * FULLY OPTIMIZED Workflows List Page
 *
 * React Query Integration:
 * - Automatic data fetching with caching
 * - Optimistic updates for better UX
 * - Consistent with Dashboard patterns
 */

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
        className='rounded bg-orange-500/30 px-0.5 font-bold text-orange-300'
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
  ({ icon: Icon, label, value, subValue, colorClass, bgClass }) => (
    <Card className={`border-opacity-20 ${bgClass}`}>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-neutral-400'>{label}</p>
          <p className={`mt-2 text-3xl font-bold ${colorClass}`}>{value}</p>
          {subValue && (
            <div className='mt-2 flex items-center text-xs text-neutral-500'>
              <TrendingUp className='mr-1 h-3 w-3' />
              {subValue}
            </div>
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
 * Memoized Empty State Component
 */
const EmptyState = memo(({ onCreate, hasSearch, onClearSearch }) => (
  <div className='flex flex-col items-center justify-center py-16'>
    <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-900/40 to-orange-950/20 ring-1 ring-orange-500/50'>
      <Workflow className='h-12 w-12 text-orange-400' />
    </div>
    <h2 className='mb-3 text-3xl font-bold text-neutral-100'>
      {hasSearch ? 'No Workflows Found' : 'Create Your First Workflow'}
    </h2>
    <p className='mx-auto mb-8 max-w-md text-center text-neutral-400'>
      {hasSearch
        ? 'No workflows match your search criteria. Try adjusting your filters.'
        : 'Build powerful automations with AI agents, API calls, and integrations. Connect your tools and automate your processes.'}
    </p>
    {hasSearch ? (
      <Button
        onClick={onClearSearch}
        variant='outline'
        size='lg'
        className='group flex items-center'
      >
        Clear Filters
      </Button>
    ) : (
      <Button
        onClick={onCreate}
        size='lg'
        className='group flex items-center bg-gradient-to-r from-orange-600 to-orange-500 font-semibold shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-500/40'
      >
        <Plus className='mr-2 h-5 w-5 transition-transform group-hover:rotate-90' />
        Create Workflow
      </Button>
    )}
  </div>
))
EmptyState.displayName = 'EmptyState'

/**
 * Memoized Workflow Card Component with Search Highlighting
 */
const WorkflowCard = memo(
  ({ workflow, onEdit, onDelete, onDuplicate, onView, searchQuery }) => {
    const getTriggerIcon = useCallback((type) => {
      switch (type) {
        case 'webhook':
          return Webhook
        case 'schedule':
          return Calendar
        case 'manual':
          return Play
        default:
          return Clock
      }
    }, [])

    const TriggerIcon = useMemo(
      () => getTriggerIcon(workflow.trigger_type),
      [workflow.trigger_type, getTriggerIcon]
    )

    const formattedDate = useMemo(
      () => format(new Date(workflow.created_at), 'MMM d, yyyy'),
      [workflow.created_at]
    )

    const formattedTime = useMemo(
      () => format(new Date(workflow.created_at), 'h:mm a'),
      [workflow.created_at]
    )

    const gradientClass = useMemo(() => {
      if (workflow.is_active) {
        return 'from-green-900/30 to-green-950/20 border-green-600/30 hover:shadow-green-500/20'
      }
      return 'from-orange-900/20 to-orange-950/20 border-orange-600/20 hover:shadow-orange-500/20'
    }, [workflow.is_active])

    return (
      <Card
        className={`group bg-gradient-to-br ${gradientClass} cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg`}
        onClick={onEdit}
      >
        <div className='space-y-4 p-5'>
          {/* Header */}
          <div className='flex items-start justify-between'>
            <div className='min-w-0 flex-1'>
              <h3 className='mb-2 truncate text-lg font-bold text-neutral-100 transition-colors group-hover:text-orange-400'>
                {highlightText(workflow.name, searchQuery)}
              </h3>
              {workflow.description && (
                <p className='line-clamp-2 text-sm text-neutral-400'>
                  {workflow.description}
                </p>
              )}
            </div>
            <Badge
              variant={workflow.is_active ? 'default' : 'secondary'}
              className={`ml-2 flex-shrink-0 ${
                workflow.is_active
                  ? 'bg-green-600/80 ring-1 ring-green-500/50'
                  : 'bg-neutral-700/80'
              }`}
            >
              {workflow.is_active ? 'Active' : 'Draft'}
            </Badge>
          </div>

          {/* Meta Information */}
          <div className='flex flex-wrap items-center gap-2 text-sm'>
            <div className='flex items-center rounded-full border border-neutral-700/50 bg-neutral-800/60 px-3 py-1.5'>
              <TriggerIcon className='mr-1.5 h-4 w-4 text-orange-400' />
              <span className='text-neutral-300 capitalize'>
                {workflow.trigger_type}
              </span>
            </div>
            {workflow.execution_count > 0 && (
              <div className='flex items-center rounded-full border border-neutral-700/50 bg-neutral-800/60 px-3 py-1.5'>
                <Play className='mr-1.5 h-4 w-4 text-green-400' />
                <span className='font-medium text-neutral-300'>
                  {workflow.execution_count}
                </span>
              </div>
            )}
          </div>

          {/* Date and Actions */}
          <div className='flex items-center justify-between border-t border-neutral-700/50 pt-4'>
            <div className='flex items-center gap-2 text-xs text-neutral-500'>
              <Calendar className='h-3.5 w-3.5' />
              <span>{formattedDate}</span>
              <span className='text-neutral-700'>•</span>
              <Clock className='h-3.5 w-3.5' />
              <span>{formattedTime}</span>
            </div>
            <div
              className='flex space-x-1'
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  onView()
                }}
                className='hover:bg-blue-600/20 hover:text-blue-400'
                title='View Executions'
              >
                <Activity className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className='hover:bg-orange-600/20 hover:text-orange-400'
                title='Edit Workflow'
              >
                <Edit2 className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate()
                }}
                className='hover:bg-purple-600/20 hover:text-purple-400'
                title='Duplicate Workflow'
              >
                <Copy className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className='hover:bg-red-600/20 hover:text-red-400'
                title='Delete Workflow'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }
)
WorkflowCard.displayName = 'WorkflowCard'

/**
 * Memoized Create Modal Component
 */
const CreateWorkflowModal = memo(({ onClose, onCreate }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [triggerType, setTriggerType] = useState('manual')

  const createWorkflow = useCreateWorkflow()

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return

    await createWorkflow.mutateAsync({
      name: name.trim(),
      description: description.trim(),
      trigger_type: triggerType
    })
    onCreate()
  }, [name, description, triggerType, createWorkflow, onCreate])

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleCreate()
      } else if (e.key === 'Escape') {
        onClose()
      }
    },
    [handleCreate, onClose]
  )

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='animate-in fade-in zoom-in mx-4 w-full max-w-md rounded-xl border border-orange-600/30 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 shadow-2xl shadow-orange-500/20 duration-200'
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className='mb-6 flex items-center gap-2 text-2xl font-bold text-orange-400'>
          <Workflow className='h-6 w-6' />
          Create New Workflow
        </h3>
        <div className='space-y-5' onKeyDown={handleKeyPress}>
          <div>
            <label className='mb-2 block text-sm font-semibold text-neutral-200'>
              Workflow Name <span className='text-orange-400'>*</span>
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
              placeholder='e.g., Order Processing'
              autoFocus
              maxLength={100}
            />
            <p className='mt-1 text-xs text-neutral-500'>
              {name.length}/100 characters
            </p>
          </div>

          <div>
            <label className='mb-2 block text-sm font-semibold text-neutral-200'>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className='w-full resize-none rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
              placeholder='What does this workflow do?'
              maxLength={500}
            />
            <p className='mt-1 text-xs text-neutral-500'>
              {description.length}/500 characters
            </p>
          </div>

          <div>
            <label className='mb-2 block text-sm font-semibold text-neutral-200'>
              Trigger Type
            </label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
            >
              <option value='manual'>
                🎯 Manual - Run manually when needed
              </option>
              <option value='webhook'>
                🔗 Webhook - Trigger via HTTP request
              </option>
              <option value='schedule'>⏰ Schedule - Run on a schedule</option>
            </select>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button
              variant='outline'
              onClick={onClose}
              disabled={createWorkflow.isPending}
              className='border-neutral-700 hover:bg-neutral-800'
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createWorkflow.isPending || !name.trim()}
              className='bg-gradient-to-r from-orange-600 to-orange-500 font-semibold shadow-lg shadow-orange-500/30 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {createWorkflow.isPending ? (
                <>
                  <Zap className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Workflow
                </>
              )}
            </Button>
          </div>
        </div>
        <p className='mt-4 text-center text-xs text-neutral-500'>
          Press{' '}
          <kbd className='rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-400'>
            Ctrl
          </kbd>{' '}
          +{' '}
          <kbd className='rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-400'>
            Enter
          </kbd>{' '}
          to create •{' '}
          <kbd className='rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-400'>
            Esc
          </kbd>{' '}
          to cancel
        </p>
      </div>
    </div>
  )
})
CreateWorkflowModal.displayName = 'CreateWorkflowModal'

export default function WorkflowsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()
  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }
  // Local UI state - MUST be declared before any conditional returns
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [triggerFilter, setTriggerFilter] = useState('all')
  const itemsPerPage = 9

  // React Query hooks - MUST be called before any conditional returns
  const { data: workflows = [], isLoading: workflowsLoading } = useWorkflows()
  const deleteWorkflow = useDeleteWorkflow()
  const createWorkflow = useCreateWorkflow()

  // Calculate statistics - MUST be before conditional returns
  const statistics = useMemo(() => {
    const total = workflows.length
    const active = workflows.filter((w) => w.is_active).length
    const draft = workflows.filter((w) => !w.is_active).length
    const totalExecutions = workflows.reduce(
      (sum, w) => sum + (w.execution_count || 0),
      0
    )

    const byTrigger = {
      webhook: workflows.filter((w) => w.trigger_type === 'webhook').length,
      schedule: workflows.filter((w) => w.trigger_type === 'schedule').length,
      manual: workflows.filter((w) => w.trigger_type === 'manual').length
    }

    return {
      total,
      active,
      draft,
      totalExecutions,
      byTrigger
    }
  }, [workflows])

  // Filter workflows - MUST be before conditional returns
  const filteredWorkflows = useMemo(() => {
    let filtered = workflows

    if (statusFilter === 'active') {
      filtered = filtered.filter((w) => w.is_active)
    } else if (statusFilter === 'draft') {
      filtered = filtered.filter((w) => !w.is_active)
    }

    if (triggerFilter !== 'all') {
      filtered = filtered.filter((w) => w.trigger_type === triggerFilter)
    }

    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter((workflow) => {
        const nameLower = (workflow.name || '').toLowerCase()
        const descLower = (workflow.description || '').toLowerCase()

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

        if (searchIndex === searchLower.length) return true

        searchIndex = 0
        for (
          let i = 0;
          i < descLower.length && searchIndex < searchLower.length;
          i++
        ) {
          if (descLower[i] === searchLower[searchIndex]) {
            searchIndex++
          }
        }

        return searchIndex === searchLower.length
      })
    }

    return filtered
  }, [workflows, searchQuery, statusFilter, triggerFilter])

  // Paginate - MUST be before conditional returns
  const paginatedWorkflows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredWorkflows.slice(startIndex, endIndex)
  }, [filteredWorkflows, currentPage, itemsPerPage])

  const totalPages = useMemo(
    () => Math.ceil(filteredWorkflows.length / itemsPerPage),
    [filteredWorkflows.length, itemsPerPage]
  )

  const hasFilters = useMemo(
    () => searchQuery || statusFilter !== 'all' || triggerFilter !== 'all',
    [searchQuery, statusFilter, triggerFilter]
  )

  // Handlers - MUST be before conditional returns
  const handleCreateClick = useCallback(() => setShowCreateModal(true), [])
  const handleCloseModal = useCallback(() => setShowCreateModal(false), [])

  const handleCreateSuccess = useCallback(() => {
    setShowCreateModal(false)
  }, [])

  const handleEditWorkflow = useCallback(
    (workflowId) => router.push(`/workflows/${workflowId}/builder`),
    [router]
  )

  const handleViewExecutions = useCallback(
    (workflowId) => router.push(`/workflows/${workflowId}/executions`),
    [router]
  )

  const handleDeleteWorkflow = useCallback(
    async (workflowId) => {
      if (
        !confirm(
          'Are you sure you want to delete this workflow? This action cannot be undone.'
        )
      )
        return

      await deleteWorkflow.mutateAsync(workflowId)
    },
    [deleteWorkflow]
  )

  const handleDuplicateWorkflow = useCallback(
    async (workflow) => {
      await createWorkflow.mutateAsync({
        name: `${workflow.name} (Copy)`,
        description: workflow.description,
        trigger_type: workflow.trigger_type,
        workflow_data: workflow.workflow_data
      })
    },
    [createWorkflow]
  )

  const handleSearch = useCallback((query) => setSearchQuery(query), [])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    document
      .getElementById('workflows-section')
      ?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setTriggerFilter('all')
  }, [])

  // NOW we can do conditional logic - after all hooks are called
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, triggerFilter])
  const [delayedLoading, setDelayedLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Loading state
  if (delayedLoading) {
    return (
      <LoadingState
        message='Loading workflows...'
        className='min-h-screen'
        icon={<Workflow className='h-8 w-8 animate-pulse text-orange-400' />}
      />
    )
  }
  if (authLoading || workflowsLoading) {
    return <WorkflowExecutionsPageSkeleton userProfile={userProfile} />
  }
  // Don't render if not authenticated
  if (!user) {
    return null
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='relative flex h-screen w-full flex-col bg-neutral-900/30 font-mono text-neutral-100'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              title='Workflows'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Statistics Cards */}
              {workflows.length > 0 && (
                <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                  <StatCard
                    icon={Workflow}
                    label='Total Workflows'
                    value={statistics.total}
                    colorClass='text-orange-400'
                    bgClass='border-orange-600/20 bg-gradient-to-br from-orange-900/20 to-neutral-950/50'
                  />

                  <StatCard
                    icon={CheckCircle}
                    label='Active'
                    value={statistics.active}
                    subValue={`${statistics.draft} in draft`}
                    colorClass='text-green-400'
                    bgClass='border-green-600/20 bg-gradient-to-br from-green-900/20 to-neutral-950/50'
                  />

                  <StatCard
                    icon={Activity}
                    label='Total Executions'
                    value={statistics.totalExecutions}
                    colorClass='text-blue-400'
                    bgClass='border-blue-600/20 bg-gradient-to-br from-blue-900/20 to-neutral-950/50'
                  />

                  <StatCard
                    icon={Zap}
                    label='Most Used Trigger'
                    value={
                      statistics.byTrigger.webhook >
                      statistics.byTrigger.schedule
                        ? statistics.byTrigger.webhook >
                          statistics.byTrigger.manual
                          ? 'Webhook'
                          : 'Manual'
                        : statistics.byTrigger.schedule >
                            statistics.byTrigger.manual
                          ? 'Schedule'
                          : 'Manual'
                    }
                    subValue={`${Math.max(...Object.values(statistics.byTrigger))} workflows`}
                    colorClass='text-purple-400'
                    bgClass='border-purple-600/20 bg-gradient-to-br from-purple-900/20 to-neutral-950/50'
                  />
                </div>
              )}

              {/* Workflows Section */}
              <div id='workflows-section'>
                {workflows.length === 0 ? (
                  <EmptyState onCreate={handleCreateClick} hasSearch={false} />
                ) : (
                  <>
                    {/* Header with Search and Filters */}
                    <div className='mb-8 space-y-4'>
                      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                          <h2 className='text-2xl font-bold text-neutral-100'>
                            Your Workflows
                          </h2>
                          <p className='mt-1 text-sm text-neutral-400'>
                            {filteredWorkflows.length}{' '}
                            {filteredWorkflows.length === 1
                              ? 'workflow'
                              : 'workflows'}
                            {hasFilters && ' matching your filters'}
                          </p>
                        </div>

                        <Button
                          onClick={handleCreateClick}
                          className='flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg shadow-orange-500/30 hover:scale-105'
                        >
                          <Plus className='h-4 w-4' />
                          Create Workflow
                        </Button>
                      </div>

                      {/* Search Bar */}
                      <SearchBar
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder='Search workflows by name or description...'
                        variant='orange'
                        debounceMs={300}
                      />

                      {/* Filter Buttons */}
                      <div className='flex flex-wrap items-center gap-3'>
                        <Filter className='h-4 w-4 text-neutral-400' />

                        {/* Status Filters */}
                        <div className='flex flex-wrap gap-2'>
                          <span className='text-xs text-neutral-500'>
                            Status:
                          </span>
                          {['all', 'active', 'draft'].map((status) => (
                            <button
                              key={status}
                              onClick={() => setStatusFilter(status)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                statusFilter === status
                                  ? 'bg-orange-600/30 text-orange-300 ring-1 ring-orange-500/50'
                                  : 'bg-neutral-800/30 text-neutral-400 hover:bg-neutral-800/50'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                              {status === 'all' && ` (${statistics.total})`}
                              {status === 'active' && ` (${statistics.active})`}
                              {status === 'draft' && ` (${statistics.draft})`}
                            </button>
                          ))}
                        </div>

                        <span className='text-neutral-700'>|</span>

                        {/* Trigger Filters */}
                        <div className='flex flex-wrap gap-2'>
                          <span className='text-xs text-neutral-500'>
                            Trigger:
                          </span>
                          {['all', 'webhook', 'schedule', 'manual'].map(
                            (trigger) => (
                              <button
                                key={trigger}
                                onClick={() => setTriggerFilter(trigger)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                  triggerFilter === trigger
                                    ? 'bg-purple-600/30 text-purple-300 ring-1 ring-purple-500/50'
                                    : 'bg-neutral-800/30 text-neutral-400 hover:bg-neutral-800/50'
                                }`}
                              >
                                {trigger.charAt(0).toUpperCase() +
                                  trigger.slice(1)}
                                {trigger === 'all' && ` (${statistics.total})`}
                                {trigger === 'webhook' &&
                                  ` (${statistics.byTrigger.webhook})`}
                                {trigger === 'schedule' &&
                                  ` (${statistics.byTrigger.schedule})`}
                                {trigger === 'manual' &&
                                  ` (${statistics.byTrigger.manual})`}
                              </button>
                            )
                          )}
                        </div>

                        {hasFilters && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={handleClearFilters}
                            className='ml-auto text-xs'
                          >
                            <XCircle className='mr-1 h-3 w-3' />
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Workflows Grid */}
                    {filteredWorkflows.length === 0 ? (
                      <EmptyState
                        onCreate={handleCreateClick}
                        hasSearch={hasFilters}
                        onClearSearch={handleClearFilters}
                      />
                    ) : (
                      <>
                        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                          {paginatedWorkflows.map((workflow) => (
                            <WorkflowCard
                              key={workflow.id}
                              workflow={workflow}
                              onEdit={() => handleEditWorkflow(workflow.id)}
                              onDelete={() => handleDeleteWorkflow(workflow.id)}
                              onDuplicate={() =>
                                handleDuplicateWorkflow(workflow)
                              }
                              onView={() => handleViewExecutions(workflow.id)}
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
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Create Modal */}
          {showCreateModal && (
            <CreateWorkflowModal
              onClose={handleCloseModal}
              onCreate={handleCreateSuccess}
            />
          )}
        </div>
      </SideBarLayout>

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
