/**
 * OPTIMIZED SMS Tab Component Views
 * Memoized views with React Query integration
 */

'use client'

import {
  AlertCircle,
  Check,
  CheckCircle,
  Copy,
  Loader2,
  MessageCircle,
  Send,
  Settings
} from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import Button from '../ui/button'
import Card from '../ui/card'

// Import React Query hooks
import {
  useCopySmsWebhookUrl,
  useTestSmsConnection
} from '../../lib/hooks/useAgentData'

// =====================================================
// SETUP VIEW - Initial configuration (Memoized)
// =====================================================
export const SetupView = memo(({ 
  provider, 
  setProvider, 
  config, 
  setConfig, 
  settings,
  setSettings,
  loading, 
  handleCreateConfig 
}) => {
  const providers = [
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'Global SMS service (Recommended for international)',
      region: 'Global',
      icon: '🌍'
    },
    {
      id: 'msg91',
      name: 'MSG91',
      description: 'Popular in India with competitive rates',
      region: 'India',
      icon: '🇮🇳'
    },
    {
      id: 'textlocal',
      name: 'TextLocal',
      description: 'Reliable Indian SMS provider',
      region: 'India',
      icon: '🇮🇳'
    },
    {
      id: 'gupshup',
      name: 'Gupshup',
      description: 'Enterprise-grade SMS platform',
      region: 'India',
      icon: '🇮🇳'
    }
  ]

  const handleConfigChange = useCallback((field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }, [setConfig])

  const handleProviderSelect = useCallback((providerId) => {
    setProvider(providerId)
  }, [setProvider])
  
  return (
    <div className='space-y-6'>
      {/* Provider Selection */}
      <Card className='border-purple-600/20'>
        <h4 className='mb-4 text-lg font-semibold text-neutral-100'>
          1. Select SMS Provider
        </h4>
        
        <div className='grid gap-3 sm:grid-cols-2'>
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProviderSelect(p.id)}
              className={`rounded-lg border p-4 text-left transition-all ${
                provider === p.id
                  ? 'border-purple-500 bg-purple-900/40'
                  : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-600'
              }`}
            >
              <div className='flex items-start gap-3'>
                <span className='text-2xl'>{p.icon}</span>
                <div>
                  <h5 className='font-semibold text-neutral-200'>{p.name}</h5>
                  <p className='mt-1 text-xs text-neutral-400'>{p.description}</p>
                  <span className='mt-2 inline-block rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-300'>
                    {p.region}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>
      
      {/* Provider Configuration */}
      <Card className='border-blue-600/20'>
        <h4 className='mb-4 text-lg font-semibold text-neutral-100'>
          2. Configure {providers.find(p => p.id === provider)?.name}
        </h4>
        
        {provider === 'twilio' && (
          <TwilioConfig config={config} onConfigChange={handleConfigChange} />
        )}
        
        {provider === 'msg91' && (
          <Msg91Config config={config} onConfigChange={handleConfigChange} />
        )}
        
        {provider === 'textlocal' && (
          <TextLocalConfig config={config} onConfigChange={handleConfigChange} />
        )}
        
        {provider === 'gupshup' && (
          <GupshupConfig config={config} onConfigChange={handleConfigChange} />
        )}
        
        <InfoAlert />
      </Card>
      
      {/* Create Button */}
      <div className='flex justify-end'>
        <Button
          onClick={handleCreateConfig}
          disabled={loading}
          className='gap-2'
        >
          {loading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <CheckCircle className='h-4 w-4' />
          )}
          Create SMS Configuration
        </Button>
      </div>
    </div>
  )
})
SetupView.displayName = 'SetupView'

// =====================================================
// Provider Config Components (Memoized)
// =====================================================
const TwilioConfig = memo(({ config, onConfigChange }) => (
  <div className='space-y-4'>
    <ConfigInput
      label='Account SID *'
      value={config.accountSid}
      onChange={(e) => onConfigChange('accountSid', e.target.value)}
      placeholder='ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    />
    <ConfigInput
      label='Auth Token *'
      type='password'
      value={config.authToken}
      onChange={(e) => onConfigChange('authToken', e.target.value)}
      placeholder='Your auth token'
    />
    <ConfigInput
      label='Phone Number *'
      value={config.phoneNumber}
      onChange={(e) => onConfigChange('phoneNumber', e.target.value)}
      placeholder='+1234567890'
      helperText='Your Twilio phone number (include country code with +)'
    />
  </div>
))
TwilioConfig.displayName = 'TwilioConfig'

const Msg91Config = memo(({ config, onConfigChange }) => (
  <div className='space-y-4'>
    <ConfigInput
      label='Auth Key *'
      type='password'
      value={config.authKey}
      onChange={(e) => onConfigChange('authKey', e.target.value)}
      placeholder='Your MSG91 auth key'
    />
    <ConfigInput
      label='Sender ID *'
      value={config.senderId}
      onChange={(e) => onConfigChange('senderId', e.target.value)}
      placeholder='TXTSMS'
      helperText='6-character sender ID (registered with MSG91)'
    />
    <div>
      <label className='mb-2 block text-sm font-medium text-neutral-300'>
        Route
      </label>
      <select
        value={config.route || 'transactional'}
        onChange={(e) => onConfigChange('route', e.target.value)}
        className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-100 focus:border-purple-500 focus:outline-none'
      >
        <option value='transactional'>Transactional</option>
        <option value='promotional'>Promotional</option>
      </select>
    </div>
  </div>
))
Msg91Config.displayName = 'Msg91Config'

const TextLocalConfig = memo(({ config, onConfigChange }) => (
  <div className='space-y-4'>
    <ConfigInput
      label='API Key *'
      type='password'
      value={config.apiKey}
      onChange={(e) => onConfigChange('apiKey', e.target.value)}
      placeholder='Your TextLocal API key'
    />
    <ConfigInput
      label='Sender *'
      value={config.sender}
      onChange={(e) => onConfigChange('sender', e.target.value)}
      placeholder='TXTLCL'
      helperText='6-character sender name (registered with TextLocal)'
    />
  </div>
))
TextLocalConfig.displayName = 'TextLocalConfig'

const GupshupConfig = memo(({ config, onConfigChange }) => (
  <div className='space-y-4'>
    <ConfigInput
      label='API Key *'
      type='password'
      value={config.apiKey}
      onChange={(e) => onConfigChange('apiKey', e.target.value)}
      placeholder='Your Gupshup API key'
    />
    <ConfigInput
      label='App ID *'
      value={config.appId}
      onChange={(e) => onConfigChange('appId', e.target.value)}
      placeholder='Your Gupshup App ID'
    />
  </div>
))
GupshupConfig.displayName = 'GupshupConfig'

// =====================================================
// Reusable Components (Memoized)
// =====================================================
const ConfigInput = memo(({ label, type = 'text', value, onChange, placeholder, helperText }) => (
  <div>
    <label className='mb-2 block text-sm font-medium text-neutral-300'>
      {label}
    </label>
    <input
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-100 focus:border-purple-500 focus:outline-none'
    />
    {helperText && (
      <p className='mt-1 text-xs text-neutral-500'>{helperText}</p>
    )}
  </div>
))
ConfigInput.displayName = 'ConfigInput'

const InfoAlert = memo(() => (
  <div className='mt-4 rounded-lg bg-blue-900/20 p-4'>
    <div className='flex items-start gap-3'>
      <AlertCircle className='h-5 w-5 flex-shrink-0 text-blue-400' />
      <div className='text-sm text-neutral-300'>
        <p className='font-semibold text-blue-400'>Setup Guide</p>
        <p className='mt-1'>
          Need help? Check our comprehensive setup guide in the documentation for step-by-step instructions.
        </p>
      </div>
    </div>
  </div>
))
InfoAlert.displayName = 'InfoAlert'

// =====================================================
// SETTINGS VIEW (Memoized)
// =====================================================
export const SettingsView = memo(({ 
  settings, 
  setSettings, 
  loading, 
  handleUpdateSettings 
}) => {
  const handleSettingChange = useCallback((field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }, [setSettings])

  const toggleAutoReply = useCallback(() => {
    setSettings(prev => ({ ...prev, autoReply: !prev.autoReply }))
  }, [setSettings])

  return (
    <div className='space-y-6'>
      <Card className='border-purple-600/20'>
        <h4 className='mb-4 text-lg font-semibold text-neutral-100'>
          Response Settings
        </h4>
        
        <div className='space-y-4'>
          <ToggleSwitch
            label='Auto Reply'
            description='Automatically respond to incoming SMS messages'
            enabled={settings.autoReply}
            onToggle={toggleAutoReply}
          />
          
          <TextAreaSetting
            label='Greeting Message'
            value={settings.greetingMessage}
            onChange={(e) => handleSettingChange('greetingMessage', e.target.value)}
            helperText='First message sent to new users'
          />
          
          <TextAreaSetting
            label='Fallback Message'
            value={settings.fallbackMessage}
            onChange={(e) => handleSettingChange('fallbackMessage', e.target.value)}
            helperText="Sent when the AI doesn't understand the message"
          />
          
          <NumberInput
            label='Max Response Length (characters)'
            value={settings.maxResponseLength}
            onChange={(e) => handleSettingChange('maxResponseLength', parseInt(e.target.value))}
            min={160}
            max={1600}
            helperText='Recommended: 1600 (SMS messages are typically 160 characters, but can be concatenated)'
          />
          
          <NumberInput
            label='Rate Limit (messages per phone number per hour)'
            value={settings.rateLimit}
            onChange={(e) => handleSettingChange('rateLimit', parseInt(e.target.value))}
            min={1}
            max={100}
            helperText='Prevent spam by limiting messages per phone number'
          />
        </div>
        
        <div className='mt-6 flex justify-end'>
          <Button onClick={handleUpdateSettings} disabled={loading}>
            {loading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Settings className='mr-2 h-4 w-4' />
            )}
            Update Settings
          </Button>
        </div>
      </Card>
    </div>
  )
})
SettingsView.displayName = 'SettingsView'

// =====================================================
// Settings Components (Memoized)
// =====================================================
const ToggleSwitch = memo(({ label, description, enabled, onToggle }) => (
  <div className='flex items-center justify-between'>
    <div>
      <label className='font-medium text-neutral-200'>{label}</label>
      <p className='text-sm text-neutral-400'>{description}</p>
    </div>
    <button
      onClick={onToggle}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        enabled ? 'bg-purple-600' : 'bg-neutral-700'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          enabled ? 'left-5' : 'left-0.5'
        }`}
      />
    </button>
  </div>
))
ToggleSwitch.displayName = 'ToggleSwitch'

const TextAreaSetting = memo(({ label, value, onChange, helperText }) => (
  <div>
    <label className='mb-2 block text-sm font-medium text-neutral-300'>
      {label}
    </label>
    <textarea
      value={value ?? ''}
      onChange={onChange}
      rows={3}
      className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-100 focus:border-purple-500 focus:outline-none'
    />
    {helperText && (
      <p className='mt-1 text-xs text-neutral-500'>{helperText}</p>
    )}
  </div>
))
TextAreaSetting.displayName = 'TextAreaSetting'

const NumberInput = memo(({ label, value, onChange, min, max, helperText }) => (
  <div>
    <label className='mb-2 block text-sm font-medium text-neutral-300'>
      {label}
    </label>
    <input
      type='number'
      value={value ?? ''}
      onChange={onChange}
      min={min}
      max={max}
      className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-100 focus:border-purple-500 focus:outline-none'
    />
    {helperText && (
      <p className='mt-1 text-xs text-neutral-500'>{helperText}</p>
    )}
  </div>
))
NumberInput.displayName = 'NumberInput'

// =====================================================
// WEBHOOK VIEW (Memoized)
// =====================================================
export const WebhookView = memo(({ smsConfig }) => {
  const [copied, setCopied] = useState(false)
  const copyUrl = useCopySmsWebhookUrl()

  const handleCopy = useCallback(async () => {
    await copyUrl.mutateAsync(smsConfig.webhook_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [copyUrl, smsConfig.webhook_url])

  return (
    <div className='space-y-6'>
      <Card className='border-green-600/20'>
        <h4 className='mb-4 text-lg font-semibold text-neutral-100'>
          Webhook Configuration
        </h4>
        
        <div className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Webhook URL
            </label>
            <div className='flex gap-2'>
              <input
                type='text'
                value={smsConfig.webhook_url ?? ''}
                readOnly
                className='flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-100 focus:border-purple-500 focus:outline-none'
              />
              <Button onClick={handleCopy} variant='outline'>
                {copied ? (
                  <Check className='h-4 w-4 text-green-400' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </div>
            <p className='mt-1 text-xs text-neutral-500'>
              Copy this URL and configure it in your SMS provider's webhook settings
            </p>
          </div>
          
          <div className='rounded-lg bg-orange-900/20 p-4'>
            <div className='flex items-start gap-3'>
              <AlertCircle className='h-5 w-5 flex-shrink-0 text-orange-400' />
              <div className='text-sm text-neutral-300'>
                <p className='font-semibold text-orange-400'>Important</p>
                <p className='mt-1'>
                  Configure this webhook URL in your SMS provider's dashboard to receive incoming messages.
                  Refer to the documentation for provider-specific instructions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className='border-blue-600/20'>
        <h4 className='mb-4 text-lg font-semibold text-neutral-100'>
          Provider: {smsConfig.provider?.toUpperCase() ?? 'N/A'}
        </h4>
        
        <div className='space-y-2 text-sm text-neutral-300'>
          <p>
            <span className='font-medium text-neutral-200'>Phone Number:</span>{' '}
            {smsConfig.twilio_phone_number || smsConfig.msg91_sender_id || smsConfig.textlocal_sender || 'Not configured'}
          </p>
          <p>
            <span className='font-medium text-neutral-200'>Status:</span>{' '}
            <span className={smsConfig.is_active ? 'text-green-400' : 'text-orange-400'}>
              {smsConfig.is_active ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
      </Card>
    </div>
  )
})
WebhookView.displayName = 'WebhookView'

// =====================================================
// ANALYTICS VIEW (Memoized)
// =====================================================
export const AnalyticsView = memo(({ smsConfig }) => (
  <div className='space-y-6'>
    <div className='grid gap-4 sm:grid-cols-2'>
      <StatCard
        icon={MessageCircle}
        label='Messages Received'
        value={smsConfig.total_messages_received || 0}
        colorClass='blue'
      />
      
      <StatCard
        icon={Send}
        label='Messages Sent'
        value={smsConfig.total_messages_sent || 0}
        colorClass='green'
      />
    </div>
    
    <Card className='border-purple-600/20'>
      <p className='text-center text-neutral-400'>
        More detailed analytics coming soon! 📊
      </p>
    </Card>
  </div>
))
AnalyticsView.displayName = 'AnalyticsView'

const StatCard = memo(({ icon: Icon, label, value, colorClass }) => (
  <Card className={`border-${colorClass}-600/20`}>
    <div className='flex items-center gap-3'>
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${colorClass}-900/40`}>
        <Icon className={`h-6 w-6 text-${colorClass}-400`} />
      </div>
      <div>
        <p className='text-sm text-neutral-400'>{label}</p>
        <p className='text-2xl font-bold text-neutral-100'>{value}</p>
      </div>
    </div>
  </Card>
))
StatCard.displayName = 'StatCard'

// =====================================================
// TEST VIEW (Memoized)
// =====================================================
export const TestView = memo(({ agentId, userId }) => {
  const [testPhoneNumber, setTestPhoneNumber] = useState('')
  const testConnection = useTestSmsConnection(agentId)

  const handleTestConnection = useCallback(async () => {
    await testConnection.mutateAsync({
      userId,
      testType: 'connection'
    })
  }, [testConnection, userId])

  const handleSendTestSms = useCallback(async () => {
    if (!testPhoneNumber) return
    
    await testConnection.mutateAsync({
      userId,
      testType: 'message',
      testPhoneNumber
    })
    
    setTestPhoneNumber('')
  }, [testConnection, userId, testPhoneNumber])

  return (
    <div className='space-y-6'>
      <Card className='border-purple-600/20'>
        <h4 className='mb-4 text-lg font-semibold text-neutral-100'>
          Test Connection
        </h4>
        
        <p className='mb-4 text-sm text-neutral-400'>
          Verify that your SMS provider credentials are correct
        </p>
        
        <Button 
          onClick={handleTestConnection} 
          disabled={testConnection.isPending} 
          variant='outline'
        >
          {testConnection.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <CheckCircle className='mr-2 h-4 w-4' />
          )}
          Test Connection
        </Button>
      </Card>
      
      <Card className='border-green-600/20'>
        <h4 className='mb-4 text-lg font-semibold text-neutral-100'>
          Send Test SMS
        </h4>
        
        <div className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Test Phone Number
            </label>
            <input
              type='tel'
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
              placeholder='+919876543210'
              className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-100 focus:border-purple-500 focus:outline-none'
            />
            <p className='mt-1 text-xs text-neutral-500'>
              Include country code (e.g., +91 for India, +1 for USA)
            </p>
          </div>
          
          <Button 
            onClick={handleSendTestSms} 
            disabled={testConnection.isPending || !testPhoneNumber}
          >
            {testConnection.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Send className='mr-2 h-4 w-4' />
            )}
            Send Test Message
          </Button>
        </div>
      </Card>
    </div>
  )
})
TestView.displayName = 'TestView'