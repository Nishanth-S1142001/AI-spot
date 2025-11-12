'use client'

import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Key,
  Settings
} from 'lucide-react'
import { useState } from 'react'
import { useUpdateAgent } from '../../lib/hooks/useAgentData'
import {
  useApiKeys
} from '../../lib/hooks/useApiKeys'
import ApiKeyInput from '../ApiKeyInput'
import Button from '../ui/button'
import Card from '../ui/card'

export default function ApiKeySection({ agent, agentId }) {
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [isChangingKey, setIsChangingKey] = useState(false)

  const { data: userKeys = [], isLoading: keysLoading } = useApiKeys()
  const updateAgentMutation = useUpdateAgent(agentId)

  // Get the current key configuration
  const currentKeyId = agent?.api_key_id
  const usePlatformKey = agent?.use_platform_key ?? false

  // Find the specific key being used
  const currentUserKey = currentKeyId
    ? userKeys.find((k) => k.id === currentKeyId)
    : null

  // Determine key status
  const getKeyStatus = () => {
    if (usePlatformKey || !currentKeyId) {
      return {
        type: 'platform',
        label: 'Platform Credits',
        status: 'active',
        description:
          'Using platform API key - credits will be deducted per usage',
        icon: '💳',
        color: 'blue'
      }
    }

    if (currentUserKey) {
      return {
        type: 'user',
        label: currentUserKey.key_name || 'Your API Key',
        status: 'active',
        description: `Using your ${currentUserKey.provider.toUpperCase()} key - you pay for usage directly`,
        icon: '🔑',
        color: 'green',
        lastUsed: currentUserKey.last_used_at
      }
    }

    return {
      type: 'none',
      label: 'No Key Configured',
      status: 'error',
      description: 'Agent has no valid API key',
      icon: '⚠️',
      color: 'red'
    }
  }

  const keyStatus = getKeyStatus()

  // Switch to platform key
  const switchToPlatformKey = async () => {
    try {
      await updateAgentMutation.mutateAsync({
        use_platform_key: true,
        api_key_id: null
      })
    } catch (error) {
      console.error('Failed to switch to platform key:', error)
    }
  }

  // Switch to user key
  const switchToUserKey = async (keyId) => {
    try {
      await updateAgentMutation.mutateAsync({
        use_platform_key: false,
        api_key_id: keyId
      })
      setShowKeyInput(false)
      setIsChangingKey(false)
    } catch (error) {
      console.error('Failed to switch to user key:', error)
    }
  }

  // if (keysLoading) {
  //   return (
  //     <Card className='p-6'>
  //       <div className='flex items-center gap-3'>
  //         <Loader2 className='h-5 w-5 animate-spin text-neutral-400' />
  //         <span className='text-sm text-neutral-400'>Loading API key status...</span>
  //       </div>
  //     </Card>
  //   )
  // }

  return (
    <Card className='p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-orange-900/20 p-2'>
            <Key className='h-5 w-5 text-orange-400' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-neutral-100'>
              API Key Configuration
            </h3>
            <p className='text-sm text-neutral-400'>
              Control which API key powers this agent
            </p>
          </div>
        </div>
      </div>

      {/* Current Key Status */}
      <div
        className={`mb-6 rounded-lg border p-4 ${
          keyStatus.color === 'green'
            ? 'border-green-600/30 bg-green-900/10'
            : keyStatus.color === 'blue'
              ? 'border-blue-600/30 bg-blue-900/10'
              : 'border-red-600/30 bg-red-900/10'
        }`}
      >
        <div className='flex items-start justify-between'>
          <div className='flex items-start gap-3'>
            <div className='text-2xl'>{keyStatus.icon}</div>
            <div className='flex-1'>
              <div className='mb-1 flex items-center gap-2'>
                <h4 className='font-semibold text-neutral-100'>
                  {keyStatus.label}
                </h4>
                {keyStatus.status === 'active' && (
                  <CheckCircle2 className='h-4 w-4 text-green-500' />
                )}
                {keyStatus.status === 'error' && (
                  <AlertCircle className='h-4 w-4 text-red-500' />
                )}
              </div>
              <p className='text-sm text-neutral-400'>
                {keyStatus.description}
              </p>
              {keyStatus.lastUsed && (
                <p className='mt-2 text-xs text-neutral-500'>
                  Last used: {new Date(keyStatus.lastUsed).toLocaleDateString()}{' '}
                  at {new Date(keyStatus.lastUsed).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {!isChangingKey && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsChangingKey(true)}
            >
              <Settings className='mr-2 h-4 w-4' />
              Change
            </Button>
          )}
        </div>
      </div>

      {/* Change Key Options */}
      {isChangingKey && (
        <div className='space-y-4'>
          <div className='rounded-lg border border-neutral-700 bg-neutral-900/50 p-4'>
            <h4 className='mb-4 font-semibold text-neutral-200'>
              Select API Key Source
            </h4>

            {/* Option 1: Platform Key */}
            <button
              onClick={switchToPlatformKey}
              disabled={updateAgentMutation.isPending}
              className={`mb-3 w-full rounded-lg border p-4 text-left transition-all ${
                keyStatus.type === 'platform'
                  ? 'border-blue-600/40 bg-blue-900/20 ring-2 ring-blue-500/30'
                  : 'border-neutral-700 bg-neutral-900/30 hover:border-neutral-600'
              }`}
            >
              <div className='flex items-center gap-3'>
                <div className='text-2xl'>💳</div>
                <div className='flex-1'>
                  <div className='font-semibold text-neutral-100'>
                    Use Platform Credits
                  </div>
                  <div className='text-sm text-neutral-400'>
                    Pay-as-you-go using your account credits
                  </div>
                </div>
                {keyStatus.type === 'platform' && (
                  <CheckCircle2 className='h-5 w-5 text-blue-500' />
                )}
              </div>
            </button>

            {/* Option 2: Existing User Keys */}
            {userKeys.length > 0 && (
              <div className='mb-3 space-y-2'>
                <p className='text-sm font-medium text-neutral-300'>
                  Your API Keys:
                </p>
                {userKeys.map((key) => (
                  <button
                    key={key.id}
                    onClick={() => switchToUserKey(key.id)}
                    disabled={updateAgentMutation.isPending}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                      currentKeyId === key.id
                        ? 'border-green-600/40 bg-green-900/20 ring-2 ring-green-500/30'
                        : 'border-neutral-700 bg-neutral-900/30 hover:border-neutral-600'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <div className='text-2xl'>🔑</div>
                      <div className='flex-1'>
                        <div className='font-semibold text-neutral-100'>
                          {key.key_name}
                        </div>
                        <div className='text-sm text-neutral-400 capitalize'>
                          {key.provider} • Last used:{' '}
                          {key.last_used_at
                            ? new Date(key.last_used_at).toLocaleDateString()
                            : 'Never'}
                        </div>
                      </div>
                      {currentKeyId === key.id && (
                        <CheckCircle2 className='h-5 w-5 text-green-500' />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Option 3: Add New Key */}
            {!showKeyInput ? (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowKeyInput(true)}
                className='w-full'
              >
                + Add New API Key
              </Button>
            ) : (
              <div className='rounded-lg border border-neutral-700 bg-neutral-950/50 p-4'>
                <ApiKeyInput
                  provider={
                    agent.model?.includes('gpt') ? 'openai' : 'anthropic'
                  }
                  onKeySaved={(keyId) => {
                    switchToUserKey(keyId)
                    setShowKeyInput(false)
                  }}
                />
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowKeyInput(false)}
                  className='mt-2 w-full'
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Cancel */}
            <div className='mt-4 flex justify-end'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setIsChangingKey(false)
                  setShowKeyInput(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className='mt-4 rounded-lg border border-neutral-800 bg-neutral-950/50 p-4'>
        <div className='flex items-start gap-3'>
          <div className='rounded bg-blue-900/30 p-1'>
            <ExternalLink className='h-4 w-4 text-blue-400' />
          </div>
          <div className='flex-1 text-sm text-neutral-400'>
            <p className='mb-2 font-medium text-neutral-300'>How it works:</p>
            <ul className='space-y-1 text-xs'>
              <li>
                • <strong>Platform Credits:</strong> We use our API key and
                charge you credits per usage
              </li>
              <li>
                • <strong>Your API Key:</strong> You provide your own
                OpenAI/Anthropic key and pay them directly
              </li>
              <li>
                • Switching keys takes effect immediately for new conversations
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
