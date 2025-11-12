'use client'

import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useApiKeys, useSaveApiKey } from '../lib/hooks/useApiKeys'
import Button from './ui/button'
import FormInput from './ui/formInputField'

export default function ApiKeyInput({ provider, onKeySaved }) {
  const [showKey, setShowKey] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [keyName, setKeyName] = useState('')

  const { data: existingKeys = [] } = useApiKeys()
  const saveKeyMutation = useSaveApiKey()

  const existingKey = existingKeys.find((k) => k.provider === provider)

  const handleSave = async () => {
    if (!apiKey.trim()) {
      return
    }

    await saveKeyMutation.mutateAsync({
      provider,
      apiKey: apiKey.trim(),
      keyName: keyName.trim() || `${provider} key`,
    })

    if (onKeySaved) {
      onKeySaved(existingKey?.id)
    }

    setApiKey('')
    setKeyName('')
  }

  if (existingKey) {
    return (
      <div className='rounded-lg border border-green-600/40 bg-green-900/20 p-4'>
        <div className='flex items-center gap-2'>
          <div className='h-2 w-2 rounded-full bg-green-500' />
          <span className='text-sm font-medium text-green-300'>
            {existingKey.key_name} connected
          </span>
        </div>
        <p className='mt-1 text-xs text-neutral-400'>
          Last used: {existingKey.last_used_at ? new Date(existingKey.last_used_at).toLocaleDateString() : 'Never'}
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4 rounded-lg border border-neutral-700 bg-neutral-900/50 p-4'>
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-200'>
          {provider === 'openai' ? 'OpenAI API Key' : 'API Key'}
        </label>
        <div className='relative'>
          <FormInput
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder='sk-...'
            disabled={saveKeyMutation.isPending}
          />
          <button
            type='button'
            onClick={() => setShowKey(!showKey)}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200'
          >
            {showKey ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
          </button>
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-200'>
          Key Name (Optional)
        </label>
        <FormInput
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          placeholder='e.g., Production Key'
          disabled={saveKeyMutation.isPending}
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={!apiKey.trim() || saveKeyMutation.isPending}
        size='sm'
      >
        {saveKeyMutation.isPending ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Saving...
          </>
        ) : (
          'Save API Key'
        )}
      </Button>

      <p className='text-xs text-neutral-500'>
        🔒 Your API key is encrypted and stored securely. You'll never see it again after saving.
      </p>
    </div>
  )
}