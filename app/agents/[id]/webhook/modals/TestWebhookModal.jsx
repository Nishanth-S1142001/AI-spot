'use client'

import { XCircle, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { useState, memo } from 'react'
import Button from '../../../../../components/ui/button'

const TestWebhookModal = memo(({ webhook, onClose, onRefresh }) => {
  const [testPayload, setTestPayload] = useState(
  JSON.stringify(
    {
      message: 'This is a test webhook invocation',
      event: 'test',
      timestamp: new Date().toISOString(),
      agent_id: webhook.agent_id
    },
    null,
    2
  )
)

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleTest = async () => {
    try {
      setTesting(true)
      setTestResult(null)

      let payload
      try {
        payload = JSON.parse(testPayload)
      } catch (e) {
        setTestResult({
          success: false,
          error: 'Invalid JSON payload'
        })
        setTesting(false)
        return
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhook.requires_auth && webhook.auth_token
            ? { Authorization: `Bearer ${webhook.auth_token}` }
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
        setTimeout(() => {
          onRefresh()
        }, 1000)
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn'>
      <div className='mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-orange-600/20 bg-gradient-to-br from-neutral-950/95 via-neutral-900/90 to-neutral-950/95 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-neutral-800/50'>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-orange-900/30 p-2 ring-1 ring-orange-500/50'>
              <Zap className='h-5 w-5 text-orange-500' />
            </div>
            <div>
              <h3 className='text-xl font-semibold text-neutral-100'>
                Test Webhook
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

        <div className='space-y-5'>
          {/* Payload Editor */}
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Request Payload (JSON)
            </label>
            <textarea
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              className='custom-scrollbar h-64 w-full rounded-lg border border-neutral-700 bg-neutral-900/50 p-4 font-mono text-sm text-neutral-100 placeholder-neutral-500 backdrop-blur-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
              placeholder='{"message": "Your test message"}'
            />
            <p className='mt-1.5 text-xs text-neutral-500'>
              This payload will be sent to: <span className='font-mono text-neutral-400'>{webhook.url}</span>
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`rounded-xl border p-5 ${
                testResult.success
                  ? 'border-green-600/30 bg-green-900/10 ring-1 ring-green-500/20'
                  : 'border-red-600/30 bg-red-900/10 ring-1 ring-red-500/20'
              }`}
            >
              <div className='mb-3 flex items-center gap-2'>
                {testResult.success ? (
                  <CheckCircle className='h-5 w-5 text-green-400' />
                ) : (
                  <AlertCircle className='h-5 w-5 text-red-400' />
                )}
                <h4
                  className={`font-semibold ${
                    testResult.success ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {testResult.success ? 'Test Successful' : 'Test Failed'}
                  {testResult.status && ` • HTTP ${testResult.status}`}
                </h4>
              </div>
              <pre
                className={`custom-scrollbar max-h-48 overflow-auto rounded-lg border p-3 font-mono text-xs ${
                  testResult.success
                    ? 'border-green-800/30 bg-green-950/50 text-green-300'
                    : 'border-red-800/30 bg-red-950/50 text-red-300'
                }`}
              >
                {JSON.stringify(testResult.data || testResult.error, null, 2)}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 border-t border-neutral-800/50 pt-5'>
            <Button
              type='button'
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
              <Zap className='mr-2 h-4 w-4' />
              {testing ? 'Testing...' : 'Send Test Request'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})

TestWebhookModal.displayName = 'TestWebhookModal'

export default TestWebhookModal