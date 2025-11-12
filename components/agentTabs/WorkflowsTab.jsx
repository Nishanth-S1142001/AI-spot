'use client'

import { Calendar, ChevronRight, Mail, Plus, Webhook as WebhookIcon, Zap } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'

import Button from '../ui/button'
import Card from '../ui/card'

/**
 * OPTIMIZED Workflows Tab Component
 * 
 * Improvements:
 * - Memoized workflow cards
 * - Better workflow visualization
 * - Enhanced UI matching reference
 * - Improved empty state
 */

const getTriggerIcon = (triggerType) => {
  const icons = {
    message_received: Mail,
    schedule: Calendar,
    webhook: WebhookIcon,
    default: Zap
  }
  const Icon = icons[triggerType] || icons.default
  return Icon
}

const getTriggerColor = (triggerType) => {
  const colors = {
    message_received: 'blue',
    schedule: 'green',
    webhook: 'purple',
    default: 'orange'
  }
  return colors[triggerType] || colors.default
}

const WorkflowCard = memo(({ workflow }) => {
  const Icon = getTriggerIcon(workflow.trigger_type)
  const color = getTriggerColor(workflow.trigger_type)

  return (
    <Link href={`/workflows/${workflow.id}`}>
      <Card className={`group cursor-pointer border-${color}-600/20 bg-gradient-to-br from-${color}-950/10 to-neutral-950/50 transition-all hover:scale-[1.02] hover:shadow-lg`}>
        <div className='space-y-4'>
          {/* Header */}
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${color}-900/40`}>
                <Icon className={`h-5 w-5 text-${color}-400`} />
              </div>
              <div>
                <h4 className='font-semibold text-neutral-200'>{workflow.name}</h4>
                <p className='text-xs capitalize text-neutral-500'>
                  {workflow.trigger_type.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                workflow.is_active
                  ? 'bg-green-900/40 text-green-300 ring-1 ring-green-500/50'
                  : 'bg-neutral-700 text-neutral-400'
              }`}
            >
              {workflow.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Description */}
          <p className='line-clamp-2 text-sm text-neutral-400'>
            {workflow.description || 'No description provided'}
          </p>

          {/* Footer */}
          <div className='flex items-center justify-between border-t border-neutral-800/50 pt-4'>
            <div className='flex items-center gap-2 text-xs text-neutral-500'>
              <Zap className='h-3 w-3' />
              <span>Automated workflow</span>
            </div>
            <ChevronRight className='h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1' />
          </div>
        </div>
      </Card>
    </Link>
  )
})

WorkflowCard.displayName = 'WorkflowCard'

export default function WorkflowsTab({ agent, id }) {
  const workflows = agent?.workflows || []

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-2xl font-bold text-neutral-100'>
            Automation Workflows
          </h3>
          <p className='mt-1 text-sm text-neutral-400'>
            Create automated workflows to extend your agent's capabilities
          </p>
        </div>
        <Link href={`/agents/${id}/workflows/create`}>
          <Button className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            Create Workflow
          </Button>
        </Link>
      </div>

      {/* Workflows Grid */}
      {workflows.length > 0 ? (
        <>
          <div className='grid gap-6 sm:grid-cols-1 lg:grid-cols-2'>
            {workflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>

          {/* Stats */}
          <div className='grid gap-4 sm:grid-cols-3'>
            <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/20 to-neutral-950/50'>
              <div className='text-center'>
                <p className='text-sm text-neutral-400'>Total Workflows</p>
                <p className='mt-1 text-2xl font-bold text-blue-400'>
                  {workflows.length}
                </p>
              </div>
            </Card>

            <Card className='border-green-600/20 bg-gradient-to-br from-green-950/20 to-neutral-950/50'>
              <div className='text-center'>
                <p className='text-sm text-neutral-400'>Active Workflows</p>
                <p className='mt-1 text-2xl font-bold text-green-400'>
                  {workflows.filter(w => w.is_active).length}
                </p>
              </div>
            </Card>

            <Card className='border-purple-600/20 bg-gradient-to-br from-purple-950/20 to-neutral-950/50'>
              <div className='text-center'>
                <p className='text-sm text-neutral-400'>Trigger Types</p>
                <p className='mt-1 text-2xl font-bold text-purple-400'>
                  {new Set(workflows.map(w => w.trigger_type)).size}
                </p>
              </div>
            </Card>
          </div>
        </>
      ) : (
        // Empty State
        <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
          <div className='flex flex-col items-center py-16 text-center'>
            <div className='mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-900/40'>
              <Zap className='h-10 w-10 text-orange-400' />
            </div>
            <h4 className='mb-2 text-xl font-semibold text-neutral-200'>
              No workflows yet
            </h4>
            <p className='mb-6 max-w-md text-sm text-neutral-400'>
              Create workflows to automate actions when your agent receives messages. Connect to external services, send notifications, or trigger custom logic.
            </p>
            <Link href={`/agents/${id}/workflows/create`}>
              <Button className='flex items-center gap-2'>
                <Plus className='h-4 w-4' />
                Create Your First Workflow
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Features */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card className='border-blue-600/20'>
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900/40'>
              <Mail className='h-5 w-5 text-blue-400' />
            </div>
            <div>
              <h4 className='text-sm font-semibold text-neutral-200'>Message Triggers</h4>
              <p className='mt-1 text-xs text-neutral-400'>
                React to incoming messages
              </p>
            </div>
          </div>
        </Card>

        <Card className='border-green-600/20'>
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-900/40'>
              <Calendar className='h-5 w-5 text-green-400' />
            </div>
            <div>
              <h4 className='text-sm font-semibold text-neutral-200'>Scheduled Tasks</h4>
              <p className='mt-1 text-xs text-neutral-400'>
                Run workflows on a schedule
              </p>
            </div>
          </div>
        </Card>

        <Card className='border-purple-600/20'>
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-900/40'>
              <WebhookIcon className='h-5 w-5 text-purple-400' />
            </div>
            <div>
              <h4 className='text-sm font-semibold text-neutral-200'>Webhook Actions</h4>
              <p className='mt-1 text-xs text-neutral-400'>
                Connect to external APIs
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}