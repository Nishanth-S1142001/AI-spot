'use client'

import { XCircle, Shield, Lock, Zap, Globe } from 'lucide-react'
import { useState, memo } from 'react'
import Button from '../../../../../components/ui/button'
import FormInput from '../../../../../components/ui/formInputField'

const SecurityModal = memo(({ webhook, onClose, onUpdate }) => {
  const [requiresAuth, setRequiresAuth] = useState(webhook.requires_auth)
  const [rateLimit, setRateLimit] = useState(webhook.rate_limit || 60)
  const [allowedOrigins, setAllowedOrigins] = useState(
    webhook.allowed_origins?.join('\n') || ''
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)

      await onUpdate({
        requires_auth: requiresAuth,
        rate_limit: parseInt(rateLimit),
        allowed_origins: allowedOrigins
          .split('\n')
          .map((o) => o.trim())
          .filter(Boolean)
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn'>
      <div className='mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-orange-600/20 bg-gradient-to-br from-neutral-950/95 via-neutral-900/90 to-neutral-950/95 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-neutral-800/50'>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-orange-900/30 p-2 ring-1 ring-orange-500/50'>
              <Shield className='h-5 w-5 text-orange-500' />
            </div>
            <div>
              <h3 className='text-xl font-semibold text-neutral-100'>
                Security Settings
              </h3>
              <p className='text-sm text-neutral-400'>{webhook.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg p-2 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-neutral-200'
          >
            <XCircle className='h-5 w-5' />
          </button>
        </div>

        <div className='space-y-6'>
          {/* Authentication */}
          <div className='rounded-xl border border-neutral-800/50 bg-neutral-900/30 p-5'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-lg bg-blue-900/30 p-2 ring-1 ring-blue-500/50'>
                <Lock className='h-4 w-4 text-blue-400' />
              </div>
              <h4 className='font-semibold text-neutral-200'>Authentication</h4>
            </div>
            <label className='flex cursor-pointer items-start gap-3'>
              <input
                type='checkbox'
                checked={requiresAuth}
                onChange={(e) => setRequiresAuth(e.target.checked)}
                className='mt-1 h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-orange-600 transition-all focus:ring-2 focus:ring-orange-500/50'
              />
              <div className='flex-1'>
                <span className='font-medium text-neutral-200'>
                  Require Authentication
                </span>
                <p className='mt-1 text-sm text-neutral-400'>
                  Incoming requests must include a valid bearer token in the Authorization header
                </p>
              </div>
            </label>
          </div>

          {/* Rate Limit */}
          <div className='rounded-xl border border-neutral-800/50 bg-neutral-900/30 p-5'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-lg bg-yellow-900/30 p-2 ring-1 ring-yellow-500/50'>
                <Zap className='h-4 w-4 text-yellow-400' />
              </div>
              <h4 className='font-semibold text-neutral-200'>Rate Limiting</h4>
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Requests per minute
              </label>
              <FormInput
                type='number'
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                min='1'
                max='1000'
                className='w-full rounded-lg border border-neutral-700 bg-neutral-900/50 text-neutral-100 placeholder-neutral-500 backdrop-blur-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
              />
              <p className='mt-2 text-sm text-neutral-400'>
                Maximum number of requests allowed per minute from a single IP address. Helps prevent abuse and ensures fair usage.
              </p>
            </div>
          </div>

          {/* CORS Origins */}
          <div className='rounded-xl border border-neutral-800/50 bg-neutral-900/30 p-5'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='rounded-lg bg-purple-900/30 p-2 ring-1 ring-purple-500/50'>
                <Globe className='h-4 w-4 text-purple-400' />
              </div>
              <h4 className='font-semibold text-neutral-200'>Allowed Origins (CORS)</h4>
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Allowed domains
              </label>
              <textarea
                value={allowedOrigins}
                onChange={(e) => setAllowedOrigins(e.target.value)}
                className='custom-scrollbar h-32 w-full rounded-lg border border-neutral-700 bg-neutral-900/50 p-3 font-mono text-sm text-neutral-100 placeholder-neutral-500 backdrop-blur-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                placeholder='https://example.com&#10;https://app.example.com&#10;*'
              />
              <p className='mt-2 text-sm text-neutral-400'>
                One origin per line. Use <span className='font-mono text-neutral-300'>*</span> to allow all origins (not recommended for production)
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div className='rounded-xl border border-blue-600/30 bg-blue-900/10 p-4 ring-1 ring-blue-500/20'>
            <div className='flex gap-3'>
              <Shield className='h-5 w-5 flex-shrink-0 text-blue-400' />
              <div className='text-sm text-blue-200'>
                <p className='font-medium'>Security Best Practices</p>
                <ul className='mt-2 space-y-1 text-blue-300/80'>
                  <li>• Always enable authentication for production webhooks</li>
                  <li>• Set appropriate rate limits to prevent abuse</li>
                  <li>• Restrict CORS origins to trusted domains only</li>
                  <li>• Regularly rotate your authentication tokens</li>
                </ul>
              </div>
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
              onClick={handleSave}
              disabled={saving}
              className='transition-transform hover:scale-105'
            >
              <Shield className='mr-2 h-4 w-4' />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})

SecurityModal.displayName = 'SecurityModal'

export default SecurityModal