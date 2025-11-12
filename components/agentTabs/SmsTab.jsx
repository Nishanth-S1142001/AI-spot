'use client'

import {
  BarChart3,
  Loader2,
  MessageCircle,
  Power,
  Settings,
  TestTube
} from 'lucide-react'
import { memo, useCallback, useMemo, useState } from 'react'
import Button from '../ui/button'

// Import all view components
import {
  AnalyticsView,
  SettingsView,
  SetupView,
  TestView,
  WebhookView
} from './SmsTabViews'

// Import React Query hooks
import {
  useCreateSmsConfig,
  useSmsConfig,
  useUpdateSmsConfig
} from '../../lib/hooks/useAgentData'

/**
 * FULLY OPTIMIZED SMS Tab Component
 * 
 * React Query Integration:
 * - Automatic data fetching with caching
 * - Optimistic updates
 * - No manual state management for server data
 * - Consistent with Dashboard patterns
 * 
 * Performance:
 * - Memoized components
 * - Smart caching prevents re-fetching
 * - Optimized rendering
 */

/**
 * Memoized Tab Button Component
 */
const TabButton = memo(({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? 'border-b-2 border-purple-500 text-purple-400'
        : 'text-neutral-400 hover:text-neutral-300'
    }`}
  >
    <Icon className='mr-2 inline h-4 w-4' />
    {label}
  </button>
))
TabButton.displayName = 'TabButton'

/**
 * Main SMS Tab Component
 */
export default function SmsTab({ agentId, userId }) {
  // React Query hooks - MUST be called before any conditional returns
  const {
    data: smsConfig,
    isLoading,
    error
  } = useSmsConfig(agentId, userId)

  const createConfig = useCreateSmsConfig(agentId)
  const updateConfig = useUpdateSmsConfig(agentId)

  // Local UI state
  const [activeTab, setActiveTab] = useState('setup')
  
  // Setup form state (only for creating new config)
  const [provider, setProvider] = useState('twilio')
  const [config, setConfig] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
    authKey: '',
    senderId: '',
    route: 'transactional',
    apiKey: '',
    sender: '',
    appId: ''
  })
  
  // Settings form state (synced with server data)
  const [settings, setSettings] = useState({
    autoReply: true,
    greetingMessage: 'Hello! I\'m your AI assistant. How can I help you today?',
    fallbackMessage: 'I\'m sorry, I didn\'t understand that. Can you please rephrase?',
    maxResponseLength: 1600,
    rateLimit: 10
  })

  // Sync settings with server data when available
  useMemo(() => {
    if (smsConfig) {
      setSettings({
        autoReply: smsConfig.auto_reply_enabled,
        greetingMessage: smsConfig.greeting_message,
        fallbackMessage: smsConfig.fallback_message,
        maxResponseLength: smsConfig.max_response_length,
        rateLimit: smsConfig.rate_limit_per_number
      })
      setProvider(smsConfig.provider)
      
      // Switch to settings tab if config exists
      if (activeTab === 'setup') {
        setActiveTab('settings')
      }
    }
  }, [smsConfig, activeTab])

  // Memoized handlers
  const handleCreateConfig = useCallback(async () => {
    await createConfig.mutateAsync({
      userId,
      provider,
      config,
      settings
    })
  }, [createConfig, userId, provider, config, settings])

  const handleUpdateSettings = useCallback(async () => {
    await updateConfig.mutateAsync({
      userId,
      settings
    })
  }, [updateConfig, userId, settings])

  const handleToggleActive = useCallback(async () => {
    await updateConfig.mutateAsync({
      userId,
      isActive: !smsConfig.is_active
    })
  }, [updateConfig, userId, smsConfig])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
  }, [])

  // Loading state
  // if (isLoading) {
  //   return <LoadingState message='Loading SMS configuration...' />
  // }

  // Error state
  if (error) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <p className='text-red-400'>Failed to load SMS configuration</p>
          <p className='mt-2 text-sm text-neutral-500'>{error.message}</p>
        </div>
      </div>
    )
  }

  // Tab configuration
  const tabs = [
    { id: 'settings', icon: Settings, label: 'Settings', show: !!smsConfig },
    { id: 'webhook', icon: MessageCircle, label: 'Webhook', show: !!smsConfig },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', show: !!smsConfig },
    { id: 'test', icon: TestTube, label: 'Test', show: !!smsConfig }
  ]

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-2xl font-bold text-neutral-100'>SMS Bot</h3>
            <p className='mt-1 text-sm text-neutral-400'>
              Enable your agent to respond to SMS messages
            </p>
          </div>
          
          {smsConfig && (
            <div className='flex items-center gap-3'>
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                smsConfig.is_active 
                  ? 'bg-green-900/40 text-green-400' 
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                <Power className='h-4 w-4' />
                <span className='text-sm font-medium'>
                  {smsConfig.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <Button
                onClick={handleToggleActive}
                variant={smsConfig.is_active ? 'outline' : 'primary'}
                disabled={updateConfig.isPending}
              >
                {updateConfig.isPending && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                {smsConfig.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {!smsConfig ? (
        // Setup View - Create new configuration
        <SetupView
          provider={provider}
          setProvider={setProvider}
          config={config}
          setConfig={setConfig}
          settings={settings}
          setSettings={setSettings}
          loading={createConfig.isPending}
          handleCreateConfig={handleCreateConfig}
        />
      ) : (
        <>
          {/* Tabs */}
          <div className='flex gap-2 border-b border-neutral-800'>
            {tabs.filter(tab => tab.show).map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                icon={tab.icon}
                label={tab.label}
                onClick={() => handleTabChange(tab.id)}
              />
            ))}
          </div>
          
          {/* Tab Content */}
          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              setSettings={setSettings}
              loading={updateConfig.isPending}
              handleUpdateSettings={handleUpdateSettings}
            />
          )}
          
          {activeTab === 'webhook' && (
            <WebhookView smsConfig={smsConfig} />
          )}
          
          {activeTab === 'analytics' && (
            <AnalyticsView smsConfig={smsConfig} />
          )}
          
          {activeTab === 'test' && (
            <TestView agentId={agentId} userId={userId} />
          )}
        </>
      )}
    </div>
  )
}