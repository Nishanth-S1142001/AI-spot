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
  Workflow
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../components/providers/AuthProvider'
import Badge from '../../components/ui/badge'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useLogout } from '../../lib/supabase/auth'
import LoadingState from '../../components/common/loading-state'

export default function WorkflowsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [workflows, setWorkflows] = useState([])
  const [fetching, setFetching] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { logout } = useLogout()
  useEffect(() => {
    if (user) {
      fetchWorkflows()
    }
  }, [user])

  const fetchWorkflows = async () => {
    try {
      setFetching(true)
      const res = await fetch('/api/workflows')
      const data = await res.json()
      setWorkflows(data.workflows || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load workflows')
    } finally {
      setFetching(false)
    }
  }

  const createWorkflow = async (workflowData) => {
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      })
      if (!res.ok) throw new Error('Failed to create workflow')
      const data = await res.json()
      toast.success('Workflow created!')
      router.push(`/workflows/${data.workflow.id}/builder`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to create workflow')
    }
  }

  const deleteWorkflow = async (workflowId) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return
    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete workflow')
      toast.success('Workflow deleted')
      fetchWorkflows()
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete workflow')
    }
  }

  const duplicateWorkflow = async (workflow) => {
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${workflow.name} (Copy)`,
          description: workflow.description,
          trigger_type: workflow.trigger_type,
          workflow_data: workflow.workflow_data
        })
      })
      if (!res.ok) throw new Error('Failed to duplicate workflow')
      toast.success('Workflow duplicated!')
      fetchWorkflows()
    } catch (error) {
      console.error(error)
      toast.error('Failed to duplicate workflow')
    }
  }

  if (authLoading) {
    return (
      <LoadingState
        message='Loading...(Refresh the window if delayed)'
        className='min-h-screen'
        icon={<Workflow className='h-8 w-8 animate-pulse text-orange-400' />}
      />
    )
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout>
        {fetching && <LoadingState message='Loading workflows...' />}

        <div className='relative w-full flex-1 font-mono text-neutral-100'>
          {/* Header (Sticky Navigation Area) */}
          <div className='sticky top-0 z-10 mb-5 flex h-16 items-center'>
            <NavigationBar
              profile={profile}
              title={`${workflows.length} workflows`}
              onLogOutClick={logout}
              icon={<Workflow className='h-6 w-6 text-orange-400' />}
              createWorkflow={() => setShowCreateModal(true)}
            />
          </div>

          {/* Workflows Grid */}
          {workflows.length === 0 ? (
            <EmptyState onCreate={() => setShowCreateModal(true)} />
          ) : (
            <div className='grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3'>
              {workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onEdit={() =>
                    router.push(`/workflows/${workflow.id}/builder`)
                  }
                  onDelete={() => deleteWorkflow(workflow.id)}
                  onDuplicate={() => duplicateWorkflow(workflow)}
                />
              ))}
            </div>
          )}

          {/* Create Modal */}
          {showCreateModal && (
            <CreateWorkflowModal
              onClose={() => setShowCreateModal(false)}
              onCreate={createWorkflow}
            />
          )}
        </div>
      </SideBarLayout>
    </>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-900/30'>
        <Workflow className='h-12 w-12 text-blue-400' />
      </div>
      <h2 className='mb-4 text-2xl font-bold text-gray-100'>
        Create Your First Workflow
      </h2>
      <p className='mx-auto mb-8 max-w-md text-center text-gray-400'>
        Build powerful automations with AI agents, API calls, and integrations.
        Connect your tools and automate your processes.
      </p>
      <Button onClick={onCreate} size='lg' className='flex items-center'>
        <Plus className='mr-2 h-5 w-5' /> Create Workflow
      </Button>
    </div>
  )
}

function WorkflowCard({ workflow, onEdit, onDelete, onDuplicate }) {
  const getTriggerIcon = (type) => {
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
  }

  const TriggerIcon = getTriggerIcon(workflow.trigger_type)

  return (
    <Card className='hover:shadow-neon border border-blue-700/20 text-gray-100 transition-shadow'>
      <div className='space-y-3 p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold'>{workflow.name}</h3>
            {workflow.description && (
              <p className='line-clamp-2 text-sm text-gray-400'>
                {workflow.description}
              </p>
            )}
          </div>
          <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
            {workflow.is_active ? 'Active' : 'Draft'}
          </Badge>
        </div>

        <div className='flex items-center space-x-4 text-sm text-gray-400'>
          <div className='flex items-center'>
            <TriggerIcon className='mr-1 h-4 w-4' />
            <span className='capitalize'>{workflow.trigger_type}</span>
          </div>
          {workflow.execution_count > 0 && (
            <div className='flex items-center'>
              <Play className='mr-1 h-4 w-4' />
              <span>{workflow.execution_count} runs</span>
            </div>
          )}
        </div>

        <div className='flex items-center justify-between border-t border-blue-700/30 pt-3'>
          <span className='text-xs text-gray-500'>
            {format(new Date(workflow.created_at), 'MMM d, yyyy')}
          </span>
          <div className='flex space-x-2'>
            <Button variant='ghost' size='sm' onClick={onEdit}>
              <Edit2 className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='sm' onClick={onDuplicate}>
              <Copy className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='sm' onClick={onDelete}>
              <Trash2 className='h-4 w-4 text-red-500' />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function CreateWorkflowModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [triggerType, setTriggerType] = useState('manual')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Workflow name is required')
    setCreating(true)
    await onCreate({
      name: name.trim(),
      description: description.trim(),
      trigger_type: triggerType
    })
    setCreating(false)
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
      <div className='shadow-neon mx-4 w-full max-w-md rounded-lg bg-neutral-900 p-6 text-gray-100'>
        <h3 className='mb-4 text-xl font-semibold'>Create New Workflow</h3>
        <div className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium'>
              Workflow Name *
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full rounded-lg bg-neutral-800 px-3 py-2 text-gray-100'
              placeholder='e.g., Order Processing'
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium'>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className='w-full rounded-lg bg-neutral-800 px-3 py-2 text-gray-100'
              placeholder='What does this workflow do?'
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium'>
              Trigger Type
            </label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className='w-full rounded-lg bg-neutral-800 px-3 py-2 text-gray-100'
            >
              <option value='manual'>Manual - Run manually</option>
              <option value='webhook'>Webhook - HTTP trigger</option>
              <option value='schedule'>Schedule - Cron schedule</option>
            </select>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Create Workflow'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
