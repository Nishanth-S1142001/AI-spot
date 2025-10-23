'use client'
import Card from '../ui/card'
import Button from '../ui/button'
import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function WorkflowsTab({ agent, id }) {
  return (
    <Card>
      <div className='card-header flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-neutral-200'>Automation Workflows</h3>
        <Link href={`/agents/${id}/workflows/create`} passHref>
          <Button variant='primary'>
            <div className='flex items-center'>
              <Zap className='mr-2 h-4 w-4' /> Create Workflow
            </div>
          </Button>
        </Link>
      </div>
      <div className='card-content space-y-4'>
        {agent?.workflows?.length > 0 ? (
          agent?.workflows.map((workflow) => (
            <div key={workflow.id} className='flex items-start justify-between rounded-lg border border-neutral-700 p-4'>
              <div>
                <h4 className='font-medium text-neutral-200'>{workflow.name}</h4>
                <p className='text-sm text-neutral-400'>{workflow.description}</p>
                <p className='mt-1 text-xs text-neutral-500'>Trigger: {workflow.trigger_type.replace('_', ' ')}</p>
              </div>
              <div className='flex items-center space-x-2'>
                <span className={`rounded px-2 py-1 text-xs font-medium ${workflow.is_active ? 'bg-green-600/20 text-green-400' : 'bg-neutral-700 text-neutral-400'}`}>
                  {workflow.is_active ? 'Active' : 'Inactive'}
                </span>
                <Link href={`/workflows/${workflow.id}`} passHref>
                  <Button variant='ghost' className='btn-sm'>Edit</Button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className='py-12 text-center'>
            <Zap className='mx-auto mb-3 h-12 w-12 text-neutral-600' />
            <p className='mb-2 text-neutral-400'>No workflows created yet</p>
            <p className='mb-6 text-sm text-neutral-500'>Create workflows to automate actions when your agent receives messages</p>
            <Link href={`/agents/${id}/workflows/create`} passHref>
              <Button variant='primary'>Create Your First Workflow</Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}
