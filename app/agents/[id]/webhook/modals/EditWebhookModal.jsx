'use client'

import { XCircle, Edit2 } from 'lucide-react'
import { useState, memo } from 'react'
import Button from '../../../../../components/ui/button'
import FormInput from '../../../../../components/ui/formInputField'
import FormTextarea from '../../../../../components/ui/textBox'

const EditWebhookModal = memo(({ webhook, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: webhook.name || '',
    description: webhook.description || '',
    url: webhook.url || '',
    events: webhook.events || [],
    is_active: webhook.is_active
  })
  const [updating, setUpdating] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    await onUpdate(formData)
    setUpdating(false)
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
              <Edit2 className='h-5 w-5 text-orange-500' />
            </div>
            <h3 className='text-xl font-semibold text-neutral-100'>
              Edit Webhook
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
              disabled={updating || !formData.name || !formData.url}
              className='transition-transform hover:scale-105'
            >
              {updating ? 'Updating...' : 'Update Webhook'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
})

EditWebhookModal.displayName = 'EditWebhookModal'

export default EditWebhookModal