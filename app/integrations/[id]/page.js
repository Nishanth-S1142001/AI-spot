'use client'

import { useState, useEffect, useMemo, memo, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import NavigationBar from '../../../components/navigationBar/navigationBar'
import NeonBackground from '../../../components/ui/background'
import SideBarLayout from '../../../components/sideBarLayout'
import { useLogout } from '../../../lib/supabase/auth'
import IntegrationSetupSkeleton from '../../../components/skeleton/IntegrationSetupSkeleton'
import {
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  Shield,
  Zap,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '../../../components/providers/AuthProvider'
import {
  useIntegration,
  useSaveIntegration,
  useDeleteIntegration,
  useTestIntegration
} from '../../../lib/hooks/useIntegrationData'
import LoadingState from '../../../components/common/loading-state'

// ============================================
// INTEGRATION CONFIGURATIONS
// ============================================

const INTEGRATION_CONFIGS = {
  razorpay: {
    name: 'Razorpay',
    description: 'Accept payments via UPI, Cards, Netbanking, and Wallets',
    logo: '💳',
    color: 'blue',
    fields: [
      {
        key: 'keyId',
        label: 'Key ID',
        type: 'text',
        placeholder: 'rzp_test_xxxxx',
        required: true,
        description: 'Your Razorpay API Key ID'
      },
      {
        key: 'keySecret',
        label: 'Key Secret',
        type: 'password',
        placeholder: 'xxxxxxxxxxxxx',
        required: true,
        description: 'Your Razorpay API Key Secret'
      },
      {
        key: 'webhookSecret',
        label: 'Webhook Secret',
        type: 'password',
        placeholder: 'whsec_xxxxx',
        required: false,
        description: 'Optional: For webhook verification'
      }
    ],
    docs: 'https://razorpay.com/docs/api/'
  },
  cashfree: {
    name: 'Cashfree',
    description: 'Payment gateway for Indian businesses',
    logo: '💰',
    color: 'green',
    fields: [
      {
        key: 'appId',
        label: 'App ID',
        type: 'text',
        required: true,
        description: 'Your Cashfree Application ID'
      },
      {
        key: 'secretKey',
        label: 'Secret Key',
        type: 'password',
        required: true,
        description: 'Your Cashfree Secret Key'
      },
      {
        key: 'environment',
        label: 'Environment',
        type: 'select',
        options: ['sandbox', 'production'],
        required: true,
        description: 'Select environment'
      }
    ],
    docs: 'https://docs.cashfree.com/'
  },
  msg91: {
    name: 'MSG91',
    description: 'SMS, OTP, and WhatsApp messaging platform',
    logo: '📧',
    color: 'orange',
    fields: [
      {
        key: 'authKey',
        label: 'Auth Key',
        type: 'password',
        required: true,
        description: 'Your MSG91 Authentication Key'
      },
      {
        key: 'senderId',
        label: 'Sender ID',
        type: 'text',
        required: true,
        description: 'Your registered Sender ID'
      },
      {
        key: 'whatsappNumber',
        label: 'WhatsApp Number',
        type: 'text',
        required: false,
        description: 'Optional: For WhatsApp messages'
      }
    ],
    docs: 'https://docs.msg91.com/'
  },
  whatsapp_official: {
    name: 'WhatsApp Official',
    description: 'Meta Cloud API for WhatsApp Business',
    logo: '✅',
    color: 'green',
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        required: true,
        description: 'Your WhatsApp Business API Access Token'
      },
      {
        key: 'phoneNumberId',
        label: 'Phone Number ID',
        type: 'text',
        required: true,
        description: 'Your WhatsApp Phone Number ID'
      },
      {
        key: 'businessAccountId',
        label: 'Business Account ID',
        type: 'text',
        required: true,
        description: 'Your WhatsApp Business Account ID'
      },
      {
        key: 'webhookVerifyToken',
        label: 'Webhook Verify Token',
        type: 'password',
        required: false,
        description: 'Token for webhook verification'
      }
    ],
    docs: 'https://developers.facebook.com/docs/whatsapp'
  },
  telegram: {
    name: 'Telegram',
    description: 'Telegram Bot API integration',
    logo: '✈️',
    color: 'blue',
    fields: [
      {
        key: 'botToken',
        label: 'Bot Token',
        type: 'password',
        required: true,
        placeholder: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        description: 'Get from @BotFather on Telegram'
      }
    ],
    docs: 'https://core.telegram.org/bots/api'
  },
  shopify: {
    name: 'Shopify',
    description: 'Ecommerce platform integration',
    logo: '🛒',
    color: 'green',
    fields: [
      {
        key: 'shopDomain',
        label: 'Shop Domain',
        type: 'text',
        placeholder: 'your-store.myshopify.com',
        required: true,
        description: 'Your Shopify store domain'
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        required: true,
        description: 'Admin API access token'
      },
      {
        key: 'apiVersion',
        label: 'API Version',
        type: 'text',
        placeholder: '2024-01',
        required: false,
        description: 'Optional: API version'
      }
    ],
    docs: 'https://shopify.dev/docs/api'
  },
  openai: {
    name: 'OpenAI',
    description: 'GPT models and AI capabilities',
    logo: '🤖',
    color: 'green',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'sk-proj-xxxxx',
        required: true,
        description: 'Your OpenAI API key'
      },
      {
        key: 'organizationId',
        label: 'Organization ID',
        type: 'text',
        required: false,
        description: 'Optional: Organization identifier'
      }
    ],
    docs: 'https://platform.openai.com/docs'
  },
  custom_api: {
    name: 'Custom API',
    description: 'Connect any custom REST API',
    logo: '⚡',
    color: 'gray',
    fields: [
      {
        key: 'baseUrl',
        label: 'Base URL',
        type: 'text',
        placeholder: 'https://api.example.com',
        required: true,
        description: 'API base URL'
      },
      {
        key: 'authType',
        label: 'Auth Type',
        type: 'select',
        options: ['none', 'bearer', 'basic', 'apikey'],
        required: true,
        description: 'Authentication method'
      },
      {
        key: 'authValue',
        label: 'Auth Value',
        type: 'password',
        required: false,
        description: 'API key, token, or credentials'
      },
      {
        key: 'headers',
        label: 'Custom Headers',
        type: 'json',
        required: false,
        description: 'Optional: JSON object of headers'
      }
    ],
    docs: null
  }
}

// ============================================
// MEMOIZED COMPONENTS
// ============================================

/**
 * Field Input Component
 */
const FieldInput = memo(
  ({ field, value, onChange, showSecret, onToggleSecret }) => {
    if (field.type === 'select') {
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          className='w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-neutral-200 transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none'
        >
          <option value=''>Select...</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )
    }

    if (field.type === 'json') {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder='{"key": "value"}'
          rows={4}
          className='w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 font-mono text-sm text-neutral-200 transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none'
        />
      )
    }

    return (
      <div className='relative'>
        <input
          type={field.type === 'password' && !showSecret ? 'password' : 'text'}
          value={value || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className='w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 pr-10 text-neutral-200 transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none'
        />
        {field.type === 'password' && (
          <button
            type='button'
            onClick={() => onToggleSecret(field.key)}
            className='absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-400'
          >
            {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    )
  }
)
FieldInput.displayName = 'FieldInput'

/**
 * Test Result Badge
 */
const TestResultBadge = memo(({ result }) => {
  if (!result) return null

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 transition-all ${
        result.success
          ? 'border-green-500/20 bg-green-500/10 text-green-400'
          : 'border-red-500/20 bg-red-500/10 text-red-400'
      }`}
    >
      {result.success ? (
        <CheckCircle size={20} className='mt-0.5 flex-shrink-0' />
      ) : (
        <X size={20} className='mt-0.5 flex-shrink-0' />
      )}
      <p className='text-sm font-medium'>{result.message}</p>
    </div>
  )
})
TestResultBadge.displayName = 'TestResultBadge'

// ============================================
// MAIN COMPONENT
// ============================================

export default function IntegrationSetupPage() {
  const router = useRouter()
  const params = useParams()
  const { user, profile } = useAuth()
  const integrationId = params.id
  const { logout } = useLogout()
  // React Query hooks
  const { data: existingIntegration, isLoading: loadingIntegration } =
    useIntegration(integrationId, user?.id)
  const saveIntegration = useSaveIntegration()
  const deleteIntegration = useDeleteIntegration()
  const testIntegration = useTestIntegration()
  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }
  // Local state
  const [credentials, setCredentials] = useState({})
  const [showSecrets, setShowSecrets] = useState({})
  const [testResult, setTestResult] = useState(null)
  const [error, setError] = useState('')

  const config = INTEGRATION_CONFIGS[integrationId]
  const [delayedLoading, setDelayedLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  // Load existing credentials
  useEffect(() => {
    if (existingIntegration?.credentials) {
      setCredentials(existingIntegration.credentials)
    }
  }, [existingIntegration])

  // Redirect if invalid integration
  useEffect(() => {
    if (!config) {
      router.push('/integrations')
    }
  }, [config, router])

  // Handlers
  const handleFieldChange = useCallback((key, value) => {
    setCredentials((prev) => ({ ...prev, [key]: value }))
    setError('')
    setTestResult(null)
  }, [])

  const toggleSecretVisibility = useCallback((key) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const validateFields = useCallback(() => {
    const requiredFields = config.fields.filter((f) => f.required)
    const missingFields = requiredFields.filter((f) => !credentials[f.key])

    if (missingFields.length > 0) {
      setError(
        `Please fill in: ${missingFields.map((f) => f.label).join(', ')}`
      )
      return false
    }

    return true
  }, [config, credentials])

  const handleTest = useCallback(async () => {
    if (!validateFields()) return

    setTestResult(null)
    setError('')

    try {
      const result = await testIntegration.mutateAsync({
        integrationType: integrationId,
        credentials
      })
      setTestResult({ success: true, message: 'Connection successful!' })
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message || 'Connection failed'
      })
    }
  }, [validateFields, testIntegration, integrationId, credentials])

  const handleSave = useCallback(async () => {
    if (!validateFields()) return

    try {
      await saveIntegration.mutateAsync({
        integrationId: existingIntegration?.id,
        data: {
          integration_type: integrationId,
          name: config.name,
          credentials,
          config: {},
          is_active: true
        },
        method: existingIntegration ? 'PATCH' : 'POST'
      })
      router.push('/integrations')
    } catch (error) {
      setError(error.message || 'Failed to save integration')
    }
  }, [
    validateFields,
    saveIntegration,
    existingIntegration,
    integrationId,
    config,
    credentials,
    router
  ])

  const handleDelete = useCallback(async () => {
    if (!existingIntegration) return

    if (!confirm('Are you sure you want to delete this integration?')) {
      return
    }

    try {
      await deleteIntegration.mutateAsync(existingIntegration.id)
      router.push('/integrations')
    } catch (error) {
      setError(error.message || 'Failed to delete integration')
    }
  }, [existingIntegration, deleteIntegration, router])

  if (!config) return null

  if (delayedLoading) {
    return <LoadingState message='Loading integration...' />
  }
  if (loadingIntegration) {
    return <IntegrationSetupPage userProfile={userProfile} />
  }

  return (
    <div className='relative min-h-screen font-mono'>
      {/* Fixed Background */}
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar profile={profile} onLogOutClick={logout} />
          </div>

          <div className='m-10 mx-auto max-w-3xl'>
            {/* Header */}

            {/* Integration Info */}
            <div className='mb-8 flex items-start gap-4'>
              <div className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-3xl shadow-lg'>
                {config.logo}
              </div>
              <div className='flex-1'>
                <h1 className='mb-2 text-2xl font-bold text-neutral-100'>
                  {config.name}
                </h1>
                <p className='text-neutral-400'>{config.description}</p>
                {config.docs && (
                  <a
                    href={config.docs}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-3 inline-flex items-center gap-1 text-sm text-orange-400 transition-colors hover:text-orange-300'
                  >
                    <ExternalLink size={14} />
                    View Documentation
                  </a>
                )}
              </div>
            </div>

            {/* Configuration Form */}
            <div className='rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 shadow-xl'>
              <div className='mb-6 flex items-center gap-2'>
                <Zap className='h-5 w-5 text-orange-400' />
                <h2 className='text-lg font-semibold text-neutral-100'>
                  Configuration
                </h2>
              </div>

              <div className='space-y-6'>
                {config.fields.map((field) => (
                  <div key={field.key}>
                    <label className='mb-2 flex items-center gap-2 text-sm font-medium text-neutral-300'>
                      {field.label}
                      {field.required && (
                        <span className='text-red-400'>*</span>
                      )}
                    </label>

                    {field.description && (
                      <p className='mb-2 text-xs text-neutral-500'>
                        {field.description}
                      </p>
                    )}

                    <FieldInput
                      field={field}
                      value={credentials[field.key]}
                      onChange={handleFieldChange}
                      showSecret={showSecrets[field.key]}
                      onToggleSecret={toggleSecretVisibility}
                    />
                  </div>
                ))}
              </div>

              {/* Test Result */}
              {testResult && (
                <div className='mt-6'>
                  <TestResultBadge result={testResult} />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className='mt-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400'>
                  <AlertCircle size={20} className='mt-0.5 flex-shrink-0' />
                  <p className='text-sm font-medium'>{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className='mt-8 flex flex-wrap gap-3'>
                <button
                  onClick={handleTest}
                  disabled={testIntegration.isPending}
                  className='hover:bg-neutral-750 flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-6 py-2.5 text-sm font-medium text-neutral-300 transition-all disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {testIntegration.isPending ? (
                    <>
                      <Loader2 size={16} className='animate-spin' />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Test Connection
                    </>
                  )}
                </button>

                <button
                  onClick={handleSave}
                  disabled={saveIntegration.isPending}
                  className='flex items-center gap-2 rounded-lg border border-orange-500/50 bg-orange-500/10 px-6 py-2.5 text-sm font-medium text-orange-400 transition-all hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {saveIntegration.isPending ? (
                    <>
                      <Loader2 size={16} className='animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {existingIntegration ? 'Update' : 'Save'} Integration
                    </>
                  )}
                </button>

                {existingIntegration && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteIntegration.isPending}
                    className='ml-auto flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-6 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {deleteIntegration.isPending ? (
                      <>
                        <Loader2 size={16} className='animate-spin' />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <X size={16} />
                        Delete
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Security Info Box */}
            <div className='mt-6 flex gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-400'>
              <Shield size={20} className='mt-0.5 flex-shrink-0' />
              <div>
                <p className='font-medium'>Security Note</p>
                <p className='mt-1 text-blue-400/80'>
                  Your credentials are encrypted and stored securely. They are
                  never shared with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SideBarLayout>
    </div>
  )
}
