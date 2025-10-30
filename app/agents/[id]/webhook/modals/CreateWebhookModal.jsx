'use client'

import { XCircle, Plus } from 'lucide-react'
import { useState, memo } from 'react'
import Button from '../../../../../components/ui/button'
import FormInput from '../../../../../components/ui/formInputField'
import FormTextarea from '../../../../../components/ui/textBox'

const CreateWebhookModal = memo(({ agentId, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    events: ['conversation.created', 'conversation.completed'],
    is_active: true
  })
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreating(true)
    await onCreate(formData)
    setCreating(false)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn'>
      <div className='mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-orange-600/20 bg-gradient-to-br from-neutral-950/95 via-neutral-900/90 to-neutral-950/95 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-neutral-800/50'>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-orange-900/30 p-2 ring-1 ring-orange-500/50'>
              <Plus className='h-5 w-5 text-orange-500' />
            </div>
            <h3 className='text-xl font-semibold text-neutral-100'>
              Create New Webhook
            </h3>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg p-2 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-neutral-200'
          >
            <XCircle className='h-5 w-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* Name */}
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Webhook Name
              <span className='text-orange-500'>*</span>
            </label>
            <FormInput
              type='text'
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder='e.g., New Conversation Webhook'
              required
              className='w-full rounded-lg border border-neutral-700 bg-neutral-900/50 text-neutral-100 placeholder-neutral-500 backdrop-blur-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
            />
          </div>

          {/* Description */}
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Description
            </label>
            <FormTextarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder='Describe what this webhook does...'
              rows={3}
              className='w-full rounded-lg border border-neutral-700 bg-neutral-900/50 text-neutral-100 placeholder-neutral-500 backdrop-blur-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
            />
          </div>

          {/* URL */}
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Endpoint URL
              <span className='text-orange-500'>*</span>
            </label>
            <FormInput
              type='url'
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder='https://your-domain.com/webhook'
              required
              className='w-full rounded-lg border border-neutral-700 bg-neutral-900/50 text-neutral-100 placeholder-neutral-500 backdrop-blur-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
            />
            <p className='mt-1.5 text-xs text-neutral-500'>
              The URL where webhook events will be sent
            </p>
          </div>

          {/* Events */}
          <div>
            <label className='mb-3 block text-sm font-medium text-neutral-300'>
              Events to Subscribe
            </label>
            <div className='space-y-2'>
              {[
                { value: 'conversation.created', label: 'Conversation Created' },
                { value: 'conversation.completed', label: 'Conversation Completed' },
                { value: 'message.received', label: 'Message Received' },
                { value: 'agent.updated', label: 'Agent Updated' }
              ].map((event) => (
                <label
                  key={event.value}
                  className='flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-3 transition-all hover:bg-neutral-900/50'
                >
                  <input
                    type='checkbox'
                    checked={formData.events.includes(event.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleChange('events', [...formData.events, event.value])
                      } else {
                        handleChange('events', formData.events.filter(ev => ev !== event.value))
                      }
                    }}
                    className='h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-orange-600 transition-all focus:ring-2 focus:ring-orange-500/50'
                  />
                  <span className='text-sm text-neutral-300'>{event.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div>
            <label className='flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4 transition-all hover:bg-neutral-900/50'>
              <input
                type='checkbox'
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className='h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-orange-600 transition-all focus:ring-2 focus:ring-orange-500/50'
              />
              <div>
                <span className='font-medium text-neutral-200'>Activate Immediately</span>
                <p className='text-xs text-neutral-500'>
                  Start receiving events as soon as the webhook is created
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 border-t border-neutral-800/50 pt-5'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='transition-transform hover:scale-105'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={creating || !formData.name || !formData.url}
              className='transition-transform hover:scale-105'
            >
              {creating ? 'Creating...' : 'Create Webhook'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
})

CreateWebhookModal.displayName = 'CreateWebhookModal'

export default CreateWebhookModal