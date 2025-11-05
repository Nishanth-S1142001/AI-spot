'use client'

import {
  Aperture,
  CircleArrowLeft,
  CircleArrowRight,
  FileText,
  Link as LinkIcon,
  Loader2,
  Calendar,
  Mail,
  Globe,
  MessageSquare,
  Instagram
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import LoadingState from '../../../components/common/loading-state'
import NavigationBar from '../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../components/providers/AuthProvider'
import NeonBackground from '../../../components/ui/background'
import Button from '../../../components/ui/button'
import Card from '../../../components/ui/card'
import FormInput from '../../../components/ui/formInputField'
import { useLogout } from '../../../lib/supabase/auth'
import KnowledgeUploadSection from '../../../components/KnowledgeUploadSection'
import {
  useCreateAgent,
  useFinalizeAgent,
  useKnowledgeSources,
} from '../../../lib/hooks/useAgentData'

// ==================== CONSTANTS ====================
// UPDATED: Only OpenAI models
const MODELS = [
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o', 
    description: 'Most capable, best for complex tasks',
    provider: 'OpenAI'
  },
  { 
    id: 'gpt-4o-mini', 
    name: 'GPT-4o Mini', 
    description: 'Fast and cost-effective',
    provider: 'OpenAI'
  },
  { 
    id: 'gpt-4-turbo', 
    name: 'GPT-4 Turbo', 
    description: 'Advanced reasoning and analysis',
    provider: 'OpenAI'
  },
  { 
    id: 'gpt-3.5-turbo', 
    name: 'GPT-3.5 Turbo', 
    description: 'Fast responses, good for simple tasks',
    provider: 'OpenAI'
  }
]

const TONES = [
  { id: 'friendly', name: 'Friendly', description: 'Warm and approachable' },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Formal and business-like'
  },
  { id: 'casual', name: 'Casual', description: 'Relaxed and conversational' },
  {
    id: 'enthusiastic',
    name: 'Enthusiastic',
    description: 'Energetic and excited'
  },
  {
    id: 'helpful',
    name: 'Helpful',
    description: 'Solution-focused and supportive'
  }
]

const DOMAINS = [
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    color: 'blue',
    prompt:
      'You are a strategic business consultant AI with deep knowledge in entrepreneurship, management, and corporate strategy. Your goal is to help users plan, launch, and grow businesses effectively. Use a professional and confident tone.'
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: '📈',
    color: 'green',
    prompt:
      'You are an AI sales strategist and performance coach. Your primary goal is to help users increase sales conversions and revenue. Use a motivating and confident tone to inspire action.'
  },
  {
    id: 'creator',
    name: 'Creator',
    icon: '🎨',
    color: 'purple',
    prompt:
      'You are an AI content creator and digital strategist. Your purpose is to help users generate viral content, engaging scripts, and creative ideas. Maintain a creative, energetic, and inspiring tone.'
  },
  {
    id: 'developer',
    name: 'Developer',
    icon: '💻',
    color: 'orange',
    prompt:
      'You are an expert AI developer specializing in full-stack solutions. Help users write, debug, and optimize code efficiently and securely. Keep a mentor-like tone: informative, patient, and precise.'
  },
  {
    id: 'supportservice',
    name: 'Support & Service',
    icon: '🤝',
    color: 'pink',
    prompt:
      'You are a friendly, empathetic, and professional customer support AI. Your goal is to understand user issues clearly and resolve them efficiently. Maintain a patient and approachable tone.'
  }
]

const SERVICES = [
  {
    id: 'calendar',
    name: 'Calendar Bookings',
    icon: Calendar,
    description: 'Enable appointment scheduling and calendar management',
    color: 'blue'
  },
  {
    id: 'mail',
    name: 'Mail Service',
    icon: Mail,
    description: 'Send automated emails and manage communications',
    color: 'green'
  }
]

const INTERFACES = [
  {
    id: 'website',
    name: 'Website Widget',
    icon: Globe,
    description: 'Embed as a chat widget on your website',
    color: 'blue'
  },
  {
    id: 'sms',
    name: 'SMS',
    icon: MessageSquare,
    description: 'Interact via text messages',
    color: 'green'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    description: 'Connect to Instagram DMs',
    color: 'purple'
  }
]

const DOMAIN_COLOR_MAP = {
  blue: {
    gradient: 'from-blue-900/50 to-blue-950/30',
    border: 'border-blue-600/40',
    ring: 'ring-2 ring-blue-500/30',
    text: 'text-blue-300',
    iconGlow: 'shadow-lg shadow-blue-500/20',
    hoverBorder: 'hover:border-blue-500/60'
  },
  green: {
    gradient: 'from-green-900/50 to-green-950/30',
    border: 'border-green-600/40',
    ring: 'ring-2 ring-green-500/30',
    text: 'text-green-300',
    iconGlow: 'shadow-lg shadow-green-500/20',
    hoverBorder: 'hover:border-green-500/60'
  },
  purple: {
    gradient: 'from-purple-900/50 to-purple-950/30',
    border: 'border-purple-600/40',
    ring: 'ring-2 ring-purple-500/30',
    text: 'text-purple-300',
    iconGlow: 'shadow-lg shadow-purple-500/20',
    hoverBorder: 'hover:border-purple-500/60'
  },
  orange: {
    gradient: 'from-orange-900/50 to-orange-950/30',
    border: 'border-orange-600/40',
    ring: 'ring-2 ring-orange-500/30',
    text: 'text-orange-300',
    iconGlow: 'shadow-lg shadow-orange-500/20',
    hoverBorder: 'hover:border-orange-500/60'
  },
  pink: {
    gradient: 'from-pink-900/50 to-pink-950/30',
    border: 'border-pink-600/40',
    ring: 'ring-2 ring-pink-500/30',
    text: 'text-pink-300',
    iconGlow: 'shadow-lg shadow-pink-500/20',
    hoverBorder: 'hover:border-pink-500/60'
  }
}

// Generate system prompt
const generateSystemPrompt = (formData, domains, knowledgeSourcesCount) => {
  const selectedDomain = domains.find((d) => d.id === formData.domain)
  const domainPrompt = selectedDomain?.prompt || ''
  
  // Add service-specific instructions (only if services are selected)
  let serviceInstructions = ''
  if (formData.services && formData.services.length > 0) {
    if (formData.services.includes('calendar')) {
      serviceInstructions += '\n\nCALENDAR BOOKING SERVICE:\nYou can help users schedule appointments. When a user wants to book an appointment, collect their name, email, phone, preferred date and time, and any special notes.'
    }
    if (formData.services.includes('mail')) {
      serviceInstructions += '\n\nMAIL SERVICE:\nYou can send emails on behalf of the user. When composing emails, ensure clarity, professionalism, and proper formatting.'
    }
  }

  // Add interface-specific instructions
  let interfaceInstructions = ''
  if (formData.interface === 'sms') {
    interfaceInstructions = '\n\nSMS INTERFACE:\nKeep responses concise and under 1600 characters. Use clear, direct language suitable for text messages.'
  } else if (formData.interface === 'instagram') {
    interfaceInstructions = '\n\nINSTAGRAM INTERFACE:\nMaintain a friendly, conversational tone suitable for social media. Keep responses engaging and concise.'
  } else if (formData.interface === 'website') {
    interfaceInstructions = '\n\nWEBSITE WIDGET:\nProvide detailed, helpful responses. Use formatting when appropriate to enhance readability.'
  }

  const knowledgeSection = knowledgeSourcesCount > 0 
    ? `\n\nYou have access to a knowledge base with ${knowledgeSourcesCount} source(s).\nWhen users ask questions, you will automatically search this knowledge base and provide accurate information based on the most relevant content.\n\nAlways cite your sources when using information from the knowledge base.`
    : ''

  return `Your name is ${formData.name}.
You are an AI ${selectedDomain?.name || formData.domain} assistant with a ${formData.tone} tone.

${domainPrompt}
${serviceInstructions}
${interfaceInstructions}${knowledgeSection}`
}

// ==================== MAIN COMPONENT ====================
export default function CreateAgent() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()

  // React Query mutations
  const createAgentMutation = useCreateAgent()
  const finalizeAgentMutation = useFinalizeAgent()

  // State
  const [step, setStep] = useState(1)
  const [createdAgent, setCreatedAgent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    tone: 'friendly',
    model: 'gpt-4o', // Default to GPT-4o
    temperature: 0.7,
    max_tokens: 4096,
    services: [],
    interface: ''
  })

  // Knowledge sources from React Query (only after agent created)
  const {
    data: knowledgeSources = [],
    isLoading: sourcesLoading
  } = useKnowledgeSources(createdAgent?.id, user?.id)

  // Prompt state
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [promptError, setPromptError] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Memoized system prompt
  const systemPrompt = useMemo(
    () => generateSystemPrompt(formData, DOMAINS, knowledgeSources.length),
    [formData, knowledgeSources.length]
  )

  // Sync prompt with system prompt
  useEffect(() => {
    if (!isEditing) {
      setPrompt(systemPrompt)
      setDraft(systemPrompt)
    }
  }, [systemPrompt, isEditing])

  // Callbacks
  const updateForm = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const toggleService = useCallback((serviceId) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId]
    }))
  }, [])

  // Handle next to step 2 - creates draft agent
  const handleNextToStep2 = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter an agent name')
      return
    }
    if (!formData.domain) {
      toast.error('Please select a domain')
      return
    }

    // If agent already created, just go to step 2
    if (createdAgent) {
      setStep(2)
      return
    }

    try {
      // Generate sandbox URL
      const tempId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const sandboxUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sandbox/${tempId}`

      const draftAgentData = {
        user_id: user.id,
        name: formData.name,
        domain: formData.domain,
        tone: formData.tone,
        model: formData.model,
        temperature: formData.temperature,
        max_tokens: formData.max_tokens,
        system_prompt: systemPrompt,
        is_active: false,
        services: formData.services,
        interface: formData.interface || null,
        service_config: {},
        sandbox_url: sandboxUrl
      }

      console.log('Creating agent with data:', draftAgentData)

      const newAgent = await createAgentMutation.mutateAsync({
        userId: user.id,
        agentData: draftAgentData
      })

      // Update sandbox URL with actual agent ID
      const actualSandboxUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sandbox/${newAgent.id}`
      
      // Store agent with updated sandbox URL
      setCreatedAgent({ ...newAgent, sandbox_url: actualSandboxUrl })
      setStep(2)
    } catch (error) {
      console.error('Error creating draft agent:', error)
    }
  }, [formData, user, createdAgent, systemPrompt, createAgentMutation])

  // Handle next to step 3
  const handleNextToStep3 = useCallback(() => {
    setStep(3)
  }, [])

  // Handle final save - activates agent
  const handleSave = useCallback(async () => {
    if (!createdAgent) {
      toast.error('Agent not created yet')
      return
    }

    try {
      // Ensure sandbox URL is set correctly
      const sandboxUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sandbox/${createdAgent.id}`

      await finalizeAgentMutation.mutateAsync({
        agentId: createdAgent.id,
        updates: {
          is_active: true,
          system_prompt: prompt,
          services: formData.services,
          interface: formData.interface,
          service_config: {},
          sandbox_url: sandboxUrl,
          model: formData.model,
          temperature: formData.temperature,
          max_tokens: formData.max_tokens
        }
      })

      router.push(`/agents/${createdAgent.id}/manage`)
    } catch (error) {
      console.error('Error finalizing agent:', error)
    }
  }, [createdAgent, prompt, formData, router, finalizeAgentMutation])

  // Prompt handlers
  const handlePromptSave = useCallback(() => {
    if (!draft.trim()) {
      setPromptError('Prompt cannot be empty')
      return
    }
    setPrompt(draft)
    setIsEditing(false)
    setPromptError('')
    toast.success('Prompt updated')
  }, [draft])

  const handlePromptCancel = useCallback(() => {
    setDraft(prompt)
    setIsEditing(false)
    setPromptError('')
  }, [prompt])

  // Get domain colors
  const getDomainColorClasses = useCallback((domainId, isSelected) => {
    const domain = DOMAINS.find((d) => d.id === domainId)
    const colors = DOMAIN_COLOR_MAP[domain?.color] || DOMAIN_COLOR_MAP.blue

    if (isSelected) {
      return `bg-gradient-to-br ${colors.gradient} ${colors.border} ${colors.ring} ${colors.text}`
    }

    return `border-neutral-700/50 bg-neutral-900/30 hover:bg-neutral-900/50 ${colors.hoverBorder} text-neutral-400 hover:text-neutral-200`
  }, [])

  // Get service/interface color classes
  const getColorClasses = useCallback((color, isSelected) => {
    const colors = DOMAIN_COLOR_MAP[color] || DOMAIN_COLOR_MAP.blue

    if (isSelected) {
      return `bg-gradient-to-br ${colors.gradient} ${colors.border} ${colors.ring} ${colors.text}`
    }

    return `border-neutral-700/50 bg-neutral-900/30 hover:bg-neutral-900/50 ${colors.hoverBorder} text-neutral-400 hover:text-neutral-200`
  }, [])

  // Loading states
  if (authLoading) {
    return <LoadingState message='Authenticating...' className='min-h-screen' />
  }

  const isCreatingAgent = createAgentMutation.isPending
  const isFinalizingAgent = finalizeAgentMutation.isPending

  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-col font-mono text-neutral-100'>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
          <NavigationBar
            profile={profile}
            title='Create Agent'
            onLogOutClick={logout}
          />
        </div>

        {/* Content */}
        <div className='custom-scrollbar flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
            {/* Progress indicator */}
            <div className='mb-8'>
              <div className='flex items-center justify-between'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <React.Fragment key={i}>
                    <div className='flex items-center'>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                          step >= i
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {i}
                      </div>
                      <span
                        className={`ml-2 text-xs font-medium transition-colors ${step >= i ? 'text-neutral-100' : 'text-neutral-400'}`}
                      >
                        {i === 1
                          ? 'Basic Info'
                          : i === 2
                            ? 'Services'
                            : i === 3
                              ? 'Interface'
                              : i === 4
                                ? 'Knowledge'
                                : 'Review'}
                      </span>
                    </div>
                    {i < 5 && (
                      <div
                        className={`mx-2 h-1 flex-1 rounded transition-all ${step > i ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-neutral-800'}`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <Card className='border-orange-600/20 shadow-xl'>
                <div className='space-y-6 p-6'>
                  <div>
                    <h3 className='mb-3 text-sm font-medium text-neutral-200'>
                      Basic Information
                    </h3>
                    <p className='mt-1 text-sm text-neutral-400'>
                      Set up your agent&apos;s identity and purpose
                    </p>
                  </div>

                  {/* Agent Name */}
                  <div>
                    <label className='mb-2 block text-sm font-medium text-neutral-200'>
                      Agent Name *
                    </label>
                    <FormInput
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      placeholder='e.g., Sales Assistant, Support Bot...'
                      disabled={isCreatingAgent}
                    />
                  </div>

                  {/* Domain Selection */}
                  <div>
                    <label className='mb-3 block text-sm font-medium text-neutral-200'>
                      Select Domain *
                    </label>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      {DOMAINS.map((domain) => {
                        const isSelected = formData.domain === domain.id
                        const colors = DOMAIN_COLOR_MAP[domain.color]

                        return (
                          <Card
                            key={domain.id}
                            className={`group cursor-pointer border transition-all duration-300 hover:scale-105 ${getDomainColorClasses(
                              domain.id,
                              isSelected
                            )} ${isCreatingAgent ? 'opacity-50 pointer-events-none' : ''}`}
                            onClick={() => !isCreatingAgent && updateForm('domain', domain.id)}
                          >
                            <div className='flex items-center gap-3 p-4'>
                              <div
                                className={`text-3xl transition-all ${isSelected ? colors.iconGlow : ''}`}
                              >
                                {domain.icon}
                              </div>
                              <div className='flex-1'>
                                <h4
                                  className={`font-semibold transition-colors ${
                                    isSelected
                                      ? 'text-neutral-100'
                                      : 'text-neutral-300 group-hover:text-neutral-100'
                                  }`}
                                >
                                  {domain.name}
                                </h4>
                                <p
                                  className={`line-clamp-1 text-xs transition-colors ${
                                    isSelected
                                      ? colors.text
                                      : 'text-neutral-500 group-hover:text-neutral-400'
                                  }`}
                                >
                                  {domain.prompt.slice(0, 50)}...
                                </p>
                              </div>
                              {isSelected && (
                                <div
                                  className={`h-3 w-3 rounded-full ${colors.text.replace('text-', 'bg-')} animate-pulse ${colors.iconGlow}`}
                                />
                              )}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  {/* Tone Selection */}
                  <div>
                    <label className='mb-3 block text-sm font-medium text-neutral-200'>
                      Select Tone
                    </label>
                    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                      {TONES.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => updateForm('tone', tone.id)}
                          disabled={isCreatingAgent}
                          className={`rounded-lg border p-3 text-left transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none ${
                            formData.tone === tone.id
                              ? 'border-orange-600/40 bg-gradient-to-br from-orange-900/40 to-orange-950/20 text-orange-300 ring-2 ring-orange-500/30'
                              : 'border-neutral-700/50 bg-neutral-900/30 text-neutral-400 hover:border-neutral-600/50 hover:bg-neutral-900/50 hover:text-neutral-200'
                          }`}
                        >
                          <div className='font-semibold text-neutral-100'>
                            {tone.name}
                          </div>
                          <div className='text-xs'>{tone.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Model Selection */}
                  <div>
                    <label className='mb-3 block text-sm font-medium text-neutral-200'>
                      AI Model *
                    </label>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      {MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => updateForm('model', model.id)}
                          disabled={isCreatingAgent}
                          className={`rounded-lg border p-4 text-left transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none ${
                            formData.model === model.id
                              ? 'border-orange-600/40 bg-gradient-to-br from-orange-900/40 to-orange-950/20 text-orange-300 ring-2 ring-orange-500/30'
                              : 'border-neutral-700/50 bg-neutral-900/30 text-neutral-400 hover:border-neutral-600/50 hover:bg-neutral-900/50 hover:text-neutral-200'
                          }`}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='font-semibold text-neutral-100'>
                              {model.name}
                            </div>
                            <div className='text-xs text-neutral-500'>
                              {model.provider}
                            </div>
                          </div>
                          <div className='mt-1 text-xs'>{model.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Temperature & Max Tokens */}
                  <div className='grid gap-6 sm:grid-cols-2'>
                    {/* Temperature */}
                    <div>
                      <label className='mb-2 block text-sm font-medium text-neutral-200'>
                        Temperature: {formData.temperature}
                      </label>
                      <input
                        type='range'
                        min='0'
                        max='1'
                        step='0.1'
                        value={formData.temperature}
                        onChange={(e) => updateForm('temperature', parseFloat(e.target.value))}
                        disabled={isCreatingAgent}
                        className='w-full accent-orange-500 disabled:opacity-50'
                      />
                      <div className='mt-1 flex justify-between text-xs text-neutral-500'>
                        <span>Precise</span>
                        <span>Creative</span>
                      </div>
                    </div>

                    {/* Max Tokens */}
                    <div>
                      <label className='mb-2 block text-sm font-medium text-neutral-200'>
                        Max Tokens
                      </label>
                      <select
                        value={formData.max_tokens}
                        onChange={(e) => updateForm('max_tokens', parseInt(e.target.value))}
                        disabled={isCreatingAgent}
                        className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50'
                      >
                        <option value={1024}>1,024 tokens</option>
                        <option value={2048}>2,048 tokens</option>
                        <option value={4096}>4,096 tokens (Default)</option>
                        <option value={8192}>8,192 tokens</option>
                        <option value={16384}>16,384 tokens</option>
                      </select>
                      <p className='mt-1 text-xs text-neutral-500'>
                        Maximum length of generated responses
                      </p>
                    </div>
                  </div>

                  <div className='flex justify-end pt-4'>
                    <Button
                      onClick={handleNextToStep2}
                      disabled={!formData.name.trim() || !formData.domain || isCreatingAgent}
                    >
                      {isCreatingAgent ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Creating Draft...
                        </>
                      ) : (
                        <>
                          Next
                          <CircleArrowRight className='ml-2 h-4 w-4' />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 2: Services Selection */}
            {step === 2 && (
              <Card className='border-blue-600/20 shadow-xl'>
                <div className='space-y-6 p-6'>
                  <div>
                    <h2 className='text-2xl font-bold text-neutral-100'>
                      Select Services
                    </h2>
                    <p className='mt-1 text-sm text-neutral-400'>
                      Choose the services your agent will provide (optional)
                    </p>
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2'>
                    {SERVICES.map((service) => {
                      const isSelected = formData.services.includes(service.id)
                      const Icon = service.icon
                      const colors = DOMAIN_COLOR_MAP[service.color]

                      return (
                        <Card
                          key={service.id}
                          className={`group cursor-pointer border transition-all duration-300 hover:scale-105 ${getColorClasses(
                            service.color,
                            isSelected
                          )}`}
                          onClick={() => toggleService(service.id)}
                        >
                          <div className='flex items-start gap-4 p-5'>
                            <div
                              className={`rounded-lg p-3 transition-all ${
                                isSelected
                                  ? `${colors.gradient} ${colors.border}`
                                  : 'bg-neutral-800/50 border border-neutral-700/50'
                              }`}
                            >
                              <Icon
                                className={`h-6 w-6 ${
                                  isSelected ? colors.text : 'text-neutral-400'
                                }`}
                              />
                            </div>
                            <div className='flex-1'>
                              <h4
                                className={`font-semibold transition-colors ${
                                  isSelected
                                    ? 'text-neutral-100'
                                    : 'text-neutral-300 group-hover:text-neutral-100'
                                }`}
                              >
                                {service.name}
                              </h4>
                              <p
                                className={`mt-1 text-sm transition-colors ${
                                  isSelected
                                    ? colors.text
                                    : 'text-neutral-500 group-hover:text-neutral-400'
                                }`}
                              >
                                {service.description}
                              </p>
                            </div>
                            {isSelected && (
                              <div
                                className={`h-3 w-3 rounded-full ${colors.text.replace('text-', 'bg-')} animate-pulse ${colors.iconGlow}`}
                              />
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>

                  {formData.services.length > 0 && (
                    <div className='rounded-lg border border-blue-600/20 bg-blue-900/10 p-4'>
                      <p className='text-sm text-blue-300'>
                        <span className='font-semibold'>Selected services:</span>{' '}
                        {formData.services
                          .map((s) => SERVICES.find((srv) => srv.id === s)?.name)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  {formData.services.length === 0 && (
                    <div className='rounded-lg border border-neutral-600/20 bg-neutral-800/10 p-4'>
                      <p className='text-sm text-neutral-400'>
                        No services selected. You can add services later or continue without them.
                      </p>
                    </div>
                  )}

                  <div className='flex justify-between pt-4'>
                    <Button 
                      onClick={() => setStep(1)} 
                      variant='outline'
                      disabled={isFinalizingAgent}
                    >
                      <CircleArrowLeft className='mr-2 h-4 w-4' />
                      Previous
                    </Button>
                    <Button onClick={handleNextToStep3}>
                      Next
                      <CircleArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Interface Selection */}
            {step === 3 && (
              <Card className='border-purple-600/20 shadow-xl'>
                <div className='space-y-6 p-6'>
                  <div>
                    <h2 className='text-2xl font-bold text-neutral-100'>
                      Select Interface
                    </h2>
                    <p className='mt-1 text-sm text-neutral-400'>
                      Choose how users will interact with your agent (select one)
                    </p>
                  </div>

                  <div className='grid gap-4 sm:grid-cols-3'>
                    {INTERFACES.map((iface) => {
                      const isSelected = formData.interface === iface.id
                      const Icon = iface.icon
                      const colors = DOMAIN_COLOR_MAP[iface.color]

                      return (
                        <Card
                          key={iface.id}
                          className={`group cursor-pointer border transition-all duration-300 hover:scale-105 ${getColorClasses(
                            iface.color,
                            isSelected
                          )}`}
                          onClick={() => updateForm('interface', iface.id)}
                        >
                          <div className='flex flex-col items-center gap-4 p-5 text-center'>
                            <div
                              className={`rounded-lg p-4 transition-all ${
                                isSelected
                                  ? `${colors.gradient} ${colors.border}`
                                  : 'bg-neutral-800/50 border border-neutral-700/50'
                              }`}
                            >
                              <Icon
                                className={`h-8 w-8 ${
                                  isSelected ? colors.text : 'text-neutral-400'
                                }`}
                              />
                            </div>
                            <div>
                              <h4
                                className={`font-semibold transition-colors ${
                                  isSelected
                                    ? 'text-neutral-100'
                                    : 'text-neutral-300 group-hover:text-neutral-100'
                                }`}
                              >
                                {iface.name}
                              </h4>
                              <p
                                className={`mt-1 text-sm transition-colors ${
                                  isSelected
                                    ? colors.text
                                    : 'text-neutral-500 group-hover:text-neutral-400'
                                }`}
                              >
                                {iface.description}
                              </p>
                            </div>
                            {isSelected && (
                              <div
                                className={`h-3 w-3 rounded-full ${colors.text.replace('text-', 'bg-')} animate-pulse ${colors.iconGlow}`}
                              />
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>

                  {formData.interface && (
                    <div className='rounded-lg border border-purple-600/20 bg-purple-900/10 p-4'>
                      <p className='text-sm text-purple-300'>
                        <span className='font-semibold'>Selected interface:</span>{' '}
                        {INTERFACES.find((i) => i.id === formData.interface)?.name}
                      </p>
                    </div>
                  )}

                  <div className='flex justify-between pt-4'>
                    <Button 
                      onClick={() => setStep(2)} 
                      variant='outline'
                      disabled={isFinalizingAgent}
                    >
                      <CircleArrowLeft className='mr-2 h-4 w-4' />
                      Previous
                    </Button>
                    <Button 
                      onClick={() => {
                        if (!formData.interface) {
                          toast.error('Please select an interface')
                          return
                        }
                        setStep(4)
                      }} 
                      disabled={!formData.interface}
                    >
                      Next
                      <CircleArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 4: Knowledge Base */}
            {step === 4 && (
              <Card className='border-blue-600/20 shadow-xl'>
                <div className='space-y-6 p-6'>
                  <div>
                    <h2 className='text-2xl font-bold text-neutral-100'>
                      Knowledge Base
                    </h2>
                    <p className='mt-1 text-sm text-neutral-400'>
                      Add documents and websites to power your agent
                    </p>
                  </div>

                  {createdAgent ? (
                    <KnowledgeUploadSection
                      agentId={createdAgent.id}
                      userId={user.id}
                      knowledgeSources={knowledgeSources}
                    />
                  ) : (
                    <div className='flex items-center justify-center py-8'>
                      <Loader2 className='h-8 w-8 animate-spin text-orange-500' />
                      <p className='ml-3 text-neutral-400'>Loading...</p>
                    </div>
                  )}

                  <div className='flex justify-between pt-4'>
                    <Button 
                      onClick={() => setStep(3)} 
                      variant='outline'
                      disabled={isFinalizingAgent}
                    >
                      <CircleArrowLeft className='mr-2 h-4 w-4' />
                      Previous
                    </Button>
                    <Button onClick={() => setStep(5)}>
                      Next
                      <CircleArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <Card className='border-green-600/20 shadow-xl'>
                <div className='space-y-6 p-6'>
                  <div>
                    <h2 className='text-2xl font-bold text-neutral-100'>
                      Review & Create
                    </h2>
                    <p className='mt-1 text-sm text-neutral-400'>
                      Review your agent configuration and system prompt
                    </p>
                  </div>

                  {/* Summary Grid */}
                  <div className='grid gap-6 md:grid-cols-2'>
                    <div>
                      <h3 className='mb-3 text-sm font-medium text-neutral-200'>
                        Basic Information
                      </h3>
                      <div className='space-y-2 text-sm'>
                        <div>
                          <span className='text-neutral-400'>Name: </span>
                          <span className='font-medium text-neutral-100'>
                            {formData.name}
                          </span>
                        </div>
                        <div>
                          <span className='text-neutral-400'>Domain: </span>
                          <span className='font-medium text-neutral-100'>
                            {DOMAINS.find((d) => d.id === formData.domain)
                              ?.name || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className='text-neutral-400'>Tone: </span>
                          <span className='font-medium text-neutral-100 capitalize'>
                            {formData.tone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className='mb-3 text-sm font-medium text-neutral-200'>
                        Model Settings
                      </h3>
                      <div className='space-y-2 text-sm'>
                        <div>
                          <span className='text-neutral-400'>Model: </span>
                          <span className='font-medium text-neutral-100'>
                            {MODELS.find((m) => m.id === formData.model)?.name || formData.model}
                          </span>
                        </div>
                        <div>
                          <span className='text-neutral-400'>Temperature: </span>
                          <span className='font-medium text-neutral-100'>
                            {formData.temperature}
                          </span>
                        </div>
                        <div>
                          <span className='text-neutral-400'>Max Tokens: </span>
                          <span className='font-medium text-neutral-100'>
                            {formData.max_tokens.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className='mb-3 text-sm font-medium text-neutral-200'>
                        Services & Interface
                      </h3>
                      <div className='space-y-2 text-sm'>
                        <div>
                          <span className='text-neutral-400'>Services: </span>
                          <span className='font-medium text-neutral-100'>
                            {formData.services
                              .map((s) => SERVICES.find((srv) => srv.id === s)?.name)
                              .join(', ') || 'None'}
                          </span>
                        </div>
                        <div>
                          <span className='text-neutral-400'>Interface: </span>
                          <span className='font-medium text-neutral-100'>
                            {INTERFACES.find((i) => i.id === formData.interface)
                              ?.name || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className='mb-3 text-sm font-medium text-neutral-200'>
                        Knowledge Sources
                      </h3>
                      <div className='space-y-2 text-sm'>
                        {sourcesLoading ? (
                          <div className='flex items-center gap-2'>
                            <Loader2 className='h-4 w-4 animate-spin text-neutral-400' />
                            <span className='text-neutral-400'>Loading sources...</span>
                          </div>
                        ) : knowledgeSources.length > 0 ? (
                          knowledgeSources.map((source) => (
                            <div
                              key={source.id}
                              className='flex items-center gap-2'
                            >
                              {source.type === 'pdf' || source.type === 'file' ? (
                                <FileText className='h-4 w-4 text-orange-400' />
                              ) : (
                                <LinkIcon className='h-4 w-4 text-blue-400' />
                              )}
                              <span className='truncate text-neutral-300'>
                                {source.name}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className='text-neutral-500 italic'>
                            No knowledge sources added
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* System Prompt */}
                  <div>
                    <h3 className='mb-2 text-sm font-medium text-neutral-200'>
                      Generated System Prompt
                    </h3>
                    <div className='rounded-lg border border-neutral-700 bg-neutral-900 p-4'>
                      {isEditing ? (
                        <textarea
                          className='w-full rounded-md bg-neutral-800 p-3 font-mono text-sm text-neutral-200 focus:ring-2 focus:ring-orange-500 focus:outline-none'
                          rows={10}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                        />
                      ) : (
                        <pre className='max-h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap text-neutral-300'>
                          {prompt}
                        </pre>
                      )}

                      {promptError && (
                        <p className='mt-2 text-sm text-red-400'>
                          {promptError}
                        </p>
                      )}

                      <div className='mt-4 flex justify-end gap-2'>
                        {isEditing ? (
                          <>
                            <Button onClick={handlePromptSave} size='sm'>
                              Save
                            </Button>
                            <Button
                              onClick={handlePromptCancel}
                              variant='secondary'
                              size='sm'
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => setIsEditing(true)}
                            variant='outline'
                            size='sm'
                            disabled={isFinalizingAgent}
                          >
                            Edit Prompt
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-between pt-4'>
                    <Button
                      onClick={() => setStep(4)}
                      variant='outline'
                      disabled={isFinalizingAgent}
                    >
                      <CircleArrowLeft className='mr-2 h-4 w-4' />
                      Previous
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isFinalizingAgent || !createdAgent}
                    >
                      {isFinalizingAgent ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Finalizing...
                        </>
                      ) : (
                        <>
                          <Aperture className='mr-2 h-4 w-4' />
                          Create Agent
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(23, 23, 23, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 4px;
          transition: background 0.2s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.5);
        }
      `}</style>
    </>
  )
}