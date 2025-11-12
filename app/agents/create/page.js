'use client'

import {
  Aperture,
  Bot,
  Calendar,
  Check,
  Coins,
  FileText,
  Globe,
  Instagram,
  Key,
  Link as LinkIcon,
  Loader2,
  Mail,
  MessageSquare,
  Settings
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import CreateAgentSkeleton from '../../../components/skeleton/CreateAgentSkeleton'
import toast from 'react-hot-toast'
import ApiKeyInput from '../../../components/ApiKeyInput'
import LoadingState from '../../../components/common/loading-state'
import KnowledgeUploadSection from '../../../components/KnowledgeUploadSection'
import NavigationBar from '../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../components/providers/AuthProvider'
import NeonBackground from '../../../components/ui/background'
import Button from '../../../components/ui/button'
import FormInput from '../../../components/ui/formInputField'
import RightSlideModal from '../../../components/ui/right-slide-modal'
import {
  useCreateAgent,
  useFinalizeAgent,
  useKnowledgeSources
} from '../../../lib/hooks/useAgentData'
import { useLogout } from '../../../lib/supabase/auth'

// ==================== CONSTANTS ====================
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

// Ring step configuration
const RING_STEPS = [
  {
    id: 1,
    label: 'Basic Info',
    icon: Settings,
    color: 'orange',
    angle: 0, // Top
    modalTitle: 'Basic Information'
  },
  {
    id: 2,
    label: 'Services',
    icon: Calendar,
    color: 'blue',
    angle: 72, // Top-right
    modalTitle: 'Select Services'
  },
  {
    id: 3,
    label: 'Interface',
    icon: Globe,
    color: 'green',
    angle: 144, // Bottom-right
    modalTitle: 'Select Interface'
  },
  {
    id: 4,
    label: 'Knowledge',
    icon: FileText,
    color: 'purple',
    angle: 216, // Bottom-left
    modalTitle: 'Knowledge Base'
  },
  {
    id: 5,
    label: 'Review',
    icon: Check,
    color: 'pink',
    angle: 288, // Top-left
    modalTitle: 'Review & Create'
  }
]

// Generate system prompt
const generateSystemPrompt = (formData, domains, knowledgeSourcesCount) => {
  const selectedDomain = domains.find((d) => d.id === formData.domain)
  const domainPrompt = selectedDomain?.prompt || ''

  let serviceInstructions = ''
  if (formData.services && formData.services.length > 0) {
    if (formData.services.includes('calendar')) {
      serviceInstructions +=
        '\n\nCALENDAR BOOKING SERVICE:\nYou can help users schedule appointments. When a user wants to book an appointment, collect their name, email, phone, preferred date and time, and any special notes.'
    }
    if (formData.services.includes('mail')) {
      serviceInstructions +=
        '\n\nMAIL SERVICE:\nYou can send emails on behalf of the user. When composing emails, ensure clarity, professionalism, and proper formatting.'
    }
  }

  let interfaceInstructions = ''
  if (formData.interface === 'sms') {
    interfaceInstructions =
      '\n\nSMS INTERFACE:\nKeep responses concise and under 1600 characters. Use clear, direct language suitable for text messages.'
  } else if (formData.interface === 'instagram') {
    interfaceInstructions =
      '\n\nINSTAGRAM INTERFACE:\nMaintain a friendly, conversational tone suitable for social media. Keep responses engaging and concise.'
  } else if (formData.interface === 'website') {
    interfaceInstructions =
      '\n\nWEBSITE WIDGET:\nProvide detailed, helpful responses. Use formatting when appropriate to enhance readability.'
  }

  const knowledgeSection =
    knowledgeSourcesCount > 0
      ? `\n\nYou have access to a knowledge base with ${knowledgeSourcesCount} source(s).\nWhen users ask questions, you will automatically search this knowledge base and provide accurate information based on the most relevant content.\n\nAlways cite your sources when using information from the knowledge base.`
      : ''

  return `Your name is ${formData.name}.
You are an AI ${selectedDomain?.name || formData.domain} assistant with a ${formData.tone} tone.

${domainPrompt}
${serviceInstructions}
${interfaceInstructions}${knowledgeSection}`
}

// Color mapping for rings
// Color mapping for rings
// Update RING_COLORS with better line colors
const RING_COLORS = {
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-500',
    glow: 'shadow-orange-500',
    text: 'text-orange-300',
    ring: 'ring-orange-500',
    hover: 'hover:border-orange-400',
    pulse: 'bg-orange-600',
    lineColor: 'rgba(249, 115, 22, 0.6)', // Solid with good opacity
    lineGlow: '0 0 8px rgba(249, 115, 22, 0.5)'
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-500',
    glow: 'shadow-blue-500',
    text: 'text-blue-300',
    ring: 'ring-blue-500',
    hover: 'hover:border-blue-400',
    pulse: 'bg-blue-600',
    lineColor: 'rgba(59, 130, 246, 0.6)',
    lineGlow: '0 0 8px rgba(59, 130, 246, 0.5)'
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-500',
    glow: 'shadow-green-500',
    text: 'text-green-300',
    ring: 'ring-green-500',
    hover: 'hover:border-green-400',
    pulse: 'bg-green-600',
    lineColor: 'rgba(34, 197, 94, 0.6)',
    lineGlow: '0 0 8px rgba(34, 197, 94, 0.5)'
  },
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-500',
    glow: 'shadow-purple-500',
    text: 'text-purple-300',
    ring: 'ring-purple-500',
    hover: 'hover:border-purple-400',
    pulse: 'bg-purple-600',
    lineColor: 'rgba(168, 85, 247, 0.6)',
    lineGlow: '0 0 8px rgba(168, 85, 247, 0.5)'
  },
  pink: {
    border: 'border-pink-500',
    bg: 'bg-pink-500',
    glow: 'shadow-pink-500',
    text: 'text-pink-300',
    ring: 'ring-pink-500',
    hover: 'hover:border-pink-400',
    pulse: 'bg-pink-600',
    lineColor: 'rgba(236, 72, 153, 0.6)',
    lineGlow: '0 0 8px rgba(236, 72, 153, 0.5)'
  }
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
  const [activeStep, setActiveStep] = useState(null) // null means no modal open
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [createdAgent, setCreatedAgent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    tone: 'friendly',
    model: 'gpt-4o',
    temperature: 0.7,
    max_tokens: 4096,
    services: [],
    interface: ''
  })

  // Artificial delay so skeleton shows at least 3 seconds
  const [delayedLoading, setDelayedLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  // Knowledge sources
  const { data: knowledgeSources = [], isLoading: sourcesLoading } =
    useKnowledgeSources(createdAgent?.id, user?.id)

  // Prompt state
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Memoized system prompt
  const systemPrompt = useMemo(
    () => generateSystemPrompt(formData, DOMAINS, knowledgeSources.length),
    [formData, knowledgeSources.length]
  )

  // Sync prompt
  useEffect(() => {
    if (!isEditing) {
      setPrompt(systemPrompt)
      setDraft(systemPrompt)
    }
  }, [systemPrompt, isEditing])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

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

  const markStepComplete = useCallback((stepId) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]))
  }, [])

  const openStep = useCallback((stepId) => {
    setActiveStep(stepId)
  }, [])

  const closeModal = useCallback(() => {
    setActiveStep(null)
  }, [])

  // Handle step 1 save - creates draft agent
  const handleStep1Save = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter an agent name')
      return
    }
    if (!formData.domain) {
      toast.error('Please select a domain')
      return
    }

    if (createdAgent) {
      markStepComplete(1)
      closeModal()
      return
    }

    try {
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

      const newAgent = await createAgentMutation.mutateAsync({
        userId: user.id,
        agentData: draftAgentData
      })

      const actualSandboxUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sandbox/${newAgent.id}`
      setCreatedAgent({ ...newAgent, sandbox_url: actualSandboxUrl })
      markStepComplete(1)
      closeModal()
      toast.success('Agent draft created!')
    } catch (error) {
      console.error('Error creating draft agent:', error)
    }
  }, [
    formData,
    user,
    createdAgent,
    systemPrompt,
    createAgentMutation,
    markStepComplete,
    closeModal
  ])

  // Handle step 2 save
  const handleStep2Save = useCallback(() => {
    markStepComplete(2)
    closeModal()
    toast.success('Services configured!')
  }, [markStepComplete, closeModal])

  // Handle step 3 save
  const handleStep3Save = useCallback(() => {
    if (!formData.interface) {
      toast.error('Please select an interface')
      return
    }
    markStepComplete(3)
    closeModal()
    toast.success('Interface selected!')
  }, [formData.interface, markStepComplete, closeModal])

  // Handle step 4 save
  const handleStep4Save = useCallback(() => {
    markStepComplete(4)
    closeModal()
    toast.success('Knowledge base configured!')
  }, [markStepComplete, closeModal])

  // Handle final save - activates agent
  const handleFinalSave = useCallback(async () => {
    if (!createdAgent) {
      toast.error('Please complete Basic Info first')
      return
    }

    if (!formData.interface) {
      toast.error('Please select an interface')
      return
    }

    try {
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

      markStepComplete(5)
      toast.success('Agent created successfully!')
      setTimeout(() => {
        router.push(`/agents/${createdAgent.id}/manage`)
      }, 1000)
    } catch (error) {
      console.error('Error finalizing agent:', error)
    }
  }, [
    createdAgent,
    prompt,
    formData,
    router,
    finalizeAgentMutation,
    markStepComplete
  ])

  // Prompt handlers
  const handlePromptSave = useCallback(() => {
    if (!draft.trim()) {
      toast.error('Prompt cannot be empty')
      return
    }
    setPrompt(draft)
    setIsEditing(false)
    toast.success('Prompt updated')
  }, [draft])

  const handlePromptCancel = useCallback(() => {
    setDraft(prompt)
    setIsEditing(false)
  }, [prompt])

  // Loading states

  // Show skeleton for minimum 3 seconds
  if (delayedLoading) {
    return <LoadingState message='Authenticating...' className='min-h-screen' />
  }

  // Loading state - show skeleton
  if (authLoading) {
    return <CreateAgentSkeleton userProfile={userProfile} />
  }

  const isCreatingAgent = createAgentMutation.isPending
  const isFinalizingAgent = finalizeAgentMutation.isPending

  // Calculate ring positions
  const getRingPosition = (angle, radius) => {
    const radian = (angle - 90) * (Math.PI / 180) // -90 to start from top
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    }
  }

  const currentStepConfig = RING_STEPS.find((s) => s.id === activeStep)

  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
          <NavigationBar
            profile={profile}
            title='Create Agent'
            onLogOutClick={logout}
          />
        </div>

        {/* Main Content - Orbital Interface */}
        <div className='custom-scrollbar flex-1 overflow-y-auto'>
          <div className='flex min-h-[calc(100vh-73px)] items-center justify-center p-8'>
            <div className='relative flex h-[600px] w-[600px] items-center justify-center'>
              {/* Background blur glow - Dashboard style */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='h-[500px] w-[500px] rounded-full bg-orange-500/20 blur-[100px]' />
              </div>

              {/* Central Agent Node - Dashboard style */}
              <div className='relative z-10 flex flex-col items-center justify-center'>
                <button className='group relative mx-auto flex h-36 w-36 transform cursor-pointer items-center justify-center transition-transform duration-300 hover:scale-110'>
                  {/* Pulse rings - 2 rings like dashboard */}
                  <div className='agent-pulse absolute h-36 w-36 rounded-full bg-orange-600/50' />
                  <div
                    className='agent-pulse absolute h-48 w-48 rounded-full bg-orange-600/20'
                    style={{ animationDelay: '0.5s' }}
                  />

                  {/* Central node */}
                  <div className='relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-orange-500 bg-gradient-to-br from-orange-600 to-orange-700 shadow-2xl shadow-orange-500/50 transition-all group-hover:border-orange-400 group-hover:shadow-orange-400/60'>
                    <Bot className='h-14 w-14 text-white' />
                  </div>
                </button>

                {/* Agent name display */}
                {formData.name && (
                  <div className='mt-6 whitespace-nowrap'>
                    <p className='text-center text-xl font-bold text-neutral-100'>
                      {formData.name}
                    </p>
                    <p className='text-center text-sm text-neutral-400'>
                      {completedSteps.size}/5 steps completed
                    </p>
                  </div>
                )}
              </div>

              {/* Orbital Ring Steps */}
              {RING_STEPS.map((step) => {
                const pos = getRingPosition(step.angle, 220)
                const isCompleted = completedSteps.has(step.id)
                const colors = RING_COLORS[step.color]
                const StepIcon = step.icon

                return (
                  <button
                    key={step.id}
                    onClick={() => openStep(step.id)}
                    className='group absolute z-20 transform transition-all duration-300 hover:scale-110'
                    style={{
                      left: `calc(50% + ${pos.x}px)`,
                      top: `calc(50% + ${pos.y}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {/* Ring glow effect */}
                    <div
                      className={`absolute inset-0 rounded-full ${colors.bg} opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-40`}
                    />

                    {/* Main ring */}
                    <div
                      className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 backdrop-blur-sm transition-all duration-300 ${
                        isCompleted
                          ? `${colors.border} ${colors.bg} shadow-lg ${colors.glow}/50`
                          : `border-neutral-700 bg-neutral-900/90 ${colors.hover}`
                      } `}
                    >
                      <StepIcon
                        className={`h-8 w-8 transition-colors ${isCompleted ? 'text-white' : colors.text}`}
                      />

                      {/* Completion checkmark */}
                      {isCompleted && (
                        <div className='absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 ring-2 ring-neutral-950'>
                          <Check className='h-4 w-4 text-white' />
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <div className='absolute top-24 left-1/2 -translate-x-1/2 whitespace-nowrap'>
                      <p
                        className={`text-sm font-semibold transition-colors ${isCompleted ? colors.text : 'text-neutral-400 group-hover:text-neutral-200'}`}
                      >
                        {step.label}
                      </p>
                    </div>

                    {/* Connection line to center - colored and gradient */}
                    {/* Connection line to center - solid when complete, dashed when incomplete */}
                    <div
                      className='absolute top-1/2 left-1/2 origin-left transition-all duration-500'
                      style={{
                        width: '220px',
                        height: '2px',
                        transform: `rotate(${step.angle + 180}deg) translateX(-50%)`,
                        background: isCompleted
                          ? colors.lineColor
                          : 'transparent',
                        borderTop: isCompleted
                          ? 'none'
                          : '2px dashed rgba(115, 115, 115, 0.3)',
                        boxShadow: isCompleted ? colors.lineGlow : 'none'
                      }}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Basic Information Modal */}
      <RightSlideModal
        isOpen={activeStep === 1}
        onClose={closeModal}
        title={currentStepConfig?.modalTitle}
        color={currentStepConfig?.color}
      >
        <div className='space-y-6'>
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
            <div className='grid gap-3'>
              {DOMAINS.map((domain) => {
                const isSelected = formData.domain === domain.id
                return (
                  <button
                    key={domain.id}
                    onClick={() => updateForm('domain', domain.id)}
                    disabled={isCreatingAgent}
                    className={`rounded-lg border p-4 text-left transition-all hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50 ${
                      isSelected
                        ? 'border-orange-600/40 bg-gradient-to-br from-orange-900/40 to-orange-950/20 text-orange-300 ring-2 ring-orange-500/30'
                        : 'border-neutral-700/50 bg-neutral-900/30 text-neutral-400 hover:border-neutral-600/50 hover:bg-neutral-900/50 hover:text-neutral-200'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <span className='text-2xl'>{domain.icon}</span>
                      <div className='flex-1'>
                        <div className='font-semibold text-neutral-100'>
                          {domain.name}
                        </div>
                        <div className='mt-1 line-clamp-2 text-xs'>
                          {domain.prompt.slice(0, 100)}...
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tone Selection */}
          <div>
            <label className='mb-3 block text-sm font-medium text-neutral-200'>
              Select Tone
            </label>
            <div className='grid gap-2'>
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => updateForm('tone', tone.id)}
                  disabled={isCreatingAgent}
                  className={`rounded-lg border p-3 text-left transition-all hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50 ${
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
            <div className='grid gap-3'>
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => updateForm('model', model.id)}
                  disabled={isCreatingAgent}
                  className={`rounded-lg border p-4 text-left transition-all hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50 ${
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

          {/* API Key Configuration */}
          <div>
            <label className='mb-3 block text-sm font-medium text-neutral-200'>
              API Key Configuration
            </label>

            <div className='space-y-4'>
              {/* Option 1: Use User's Own Key */}
              <button
                onClick={() => updateForm('useOwnKey', true)}
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  formData.useOwnKey
                    ? 'border-orange-600/40 bg-gradient-to-br from-orange-900/40 to-orange-950/20 ring-2 ring-orange-500/30'
                    : 'border-neutral-700/50 bg-neutral-900/30 hover:border-neutral-600/50'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <Key className='h-5 w-5 text-orange-400' />
                  <div className='flex-1'>
                    <div className='font-semibold text-neutral-100'>
                      Use My Own API Key
                    </div>
                    <div className='text-xs text-neutral-400'>
                      You control costs and usage with your own{' '}
                      {formData.model.includes('gpt') ? 'OpenAI' : 'provider'}{' '}
                      key
                    </div>
                  </div>
                </div>
              </button>

              {/* Show API Key Input if "Use Own Key" selected */}
              {formData.useOwnKey && (
                <ApiKeyInput
                  provider={
                    formData.model.includes('gpt') ? 'openai' : 'anthropic'
                  }
                  onKeySaved={(keyId) => updateForm('apiKeyId', keyId)}
                />
              )}

              {/* Option 2: Use Platform Credits */}
              <button
                onClick={() => updateForm('useOwnKey', false)}
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  !formData.useOwnKey
                    ? 'border-blue-600/40 bg-gradient-to-br from-blue-900/40 to-blue-950/20 ring-2 ring-blue-500/30'
                    : 'border-neutral-700/50 bg-neutral-900/30 hover:border-neutral-600/50'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <Coins className='h-5 w-5 text-blue-400' />
                  <div className='flex-1'>
                    <div className='font-semibold text-neutral-100'>
                      Use Platform Credits
                    </div>
                    <div className='text-xs text-neutral-400'>
                      Pay-as-you-go using your account credits (
                      {profile?.api_credits || 0} remaining)
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
          {/* Temperature & Max Tokens */}
          <div className='grid gap-6'>
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
                onChange={(e) =>
                  updateForm('temperature', parseFloat(e.target.value))
                }
                disabled={isCreatingAgent}
                className='w-full accent-orange-500 disabled:opacity-50'
              />
              <div className='mt-1 flex justify-between text-xs text-neutral-500'>
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-200'>
                Max Tokens
              </label>
              <select
                value={formData.max_tokens}
                onChange={(e) =>
                  updateForm('max_tokens', parseInt(e.target.value))
                }
                disabled={isCreatingAgent}
                className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none disabled:opacity-50'
              >
                <option value={1024}>1,024 tokens</option>
                <option value={2048}>2,048 tokens</option>
                <option value={4096}>4,096 tokens (Default)</option>
                <option value={8192}>8,192 tokens</option>
                <option value={16384}>16,384 tokens</option>
              </select>
            </div>
          </div>

          <div className='flex justify-end pt-4'>
            <Button
              onClick={handleStep1Save}
              disabled={
                !formData.name.trim() || !formData.domain || isCreatingAgent
              }
            >
              {isCreatingAgent ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                'Save & Continue'
              )}
            </Button>
          </div>
        </div>
      </RightSlideModal>

      {/* Step 2: Services Modal */}
      <RightSlideModal
        isOpen={activeStep === 2}
        onClose={closeModal}
        title={currentStepConfig?.modalTitle}
        color={currentStepConfig?.color}
      >
        <div className='space-y-6'>
          <p className='text-sm text-neutral-400'>
            Choose the services your agent will provide (optional)
          </p>

          <div className='grid gap-4'>
            {SERVICES.map((service) => {
              const isSelected = formData.services.includes(service.id)
              const Icon = service.icon

              return (
                <button
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`rounded-lg border p-5 text-left transition-all hover:scale-[1.02] ${
                    isSelected
                      ? 'border-blue-600/40 bg-gradient-to-br from-blue-900/40 to-blue-950/20 text-blue-300 ring-2 ring-blue-500/30'
                      : 'border-neutral-700/50 bg-neutral-900/30 text-neutral-400 hover:border-neutral-600/50 hover:bg-neutral-900/50'
                  }`}
                >
                  <div className='flex items-start gap-4'>
                    <div
                      className={`rounded-lg p-3 ${isSelected ? 'bg-blue-900/40' : 'bg-neutral-800/50'}`}
                    >
                      <Icon
                        className={`h-6 w-6 ${isSelected ? 'text-blue-300' : 'text-neutral-400'}`}
                      />
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-semibold text-neutral-100'>
                        {service.name}
                      </h4>
                      <p className='mt-1 text-sm'>{service.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className='flex justify-end pt-4'>
            <Button onClick={handleStep2Save}>Save & Continue</Button>
          </div>
        </div>
      </RightSlideModal>

      {/* Step 3: Interface Modal */}
      <RightSlideModal
        isOpen={activeStep === 3}
        onClose={closeModal}
        title={currentStepConfig?.modalTitle}
        color={currentStepConfig?.color}
      >
        <div className='space-y-6'>
          <p className='text-sm text-neutral-400'>
            Choose how users will interact with your agent
          </p>

          <div className='grid gap-4'>
            {INTERFACES.map((iface) => {
              const isSelected = formData.interface === iface.id
              const Icon = iface.icon

              return (
                <button
                  key={iface.id}
                  onClick={() => updateForm('interface', iface.id)}
                  className={`rounded-lg border p-5 text-left transition-all hover:scale-[1.02] ${
                    isSelected
                      ? 'border-green-600/40 bg-gradient-to-br from-green-900/40 to-green-950/20 text-green-300 ring-2 ring-green-500/30'
                      : 'border-neutral-700/50 bg-neutral-900/30 text-neutral-400 hover:border-neutral-600/50 hover:bg-neutral-900/50'
                  }`}
                >
                  <div className='flex items-start gap-4'>
                    <div
                      className={`rounded-lg p-3 ${isSelected ? 'bg-green-900/40' : 'bg-neutral-800/50'}`}
                    >
                      <Icon
                        className={`h-6 w-6 ${isSelected ? 'text-green-300' : 'text-neutral-400'}`}
                      />
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-semibold text-neutral-100'>
                        {iface.name}
                      </h4>
                      <p className='mt-1 text-sm'>{iface.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className='flex justify-end pt-4'>
            <Button onClick={handleStep3Save} disabled={!formData.interface}>
              Save & Continue
            </Button>
          </div>
        </div>
      </RightSlideModal>

      {/* Step 4: Knowledge Base Modal */}
      <RightSlideModal
        isOpen={activeStep === 4}
        onClose={closeModal}
        title={currentStepConfig?.modalTitle}
        color={currentStepConfig?.color}
      >
        <div className='space-y-6'>
          {createdAgent ? (
            <KnowledgeUploadSection
              agentId={createdAgent.id}
              userId={user.id}
              knowledgeSources={knowledgeSources}
            />
          ) : (
            <div className='rounded-lg border border-neutral-700 bg-neutral-900/50 p-8 text-center'>
              <p className='text-neutral-400'>
                Please complete Basic Info first to add knowledge sources
              </p>
            </div>
          )}

          <div className='flex justify-end pt-4'>
            <Button onClick={handleStep4Save}>Save & Continue</Button>
          </div>
        </div>
      </RightSlideModal>

      {/* Step 5: Review Modal */}
      <RightSlideModal
        isOpen={activeStep === 5}
        onClose={closeModal}
        title={currentStepConfig?.modalTitle}
        color={currentStepConfig?.color}
      >
        <div className='space-y-6'>
          {/* Summary Grid */}
          <div className='grid gap-6'>
            <div>
              <h3 className='mb-3 text-sm font-medium text-neutral-200'>
                Basic Information
              </h3>
              <div className='space-y-2 text-sm'>
                <div>
                  <span className='text-neutral-400'>Name: </span>
                  <span className='font-medium text-neutral-100'>
                    {formData.name || 'Not set'}
                  </span>
                </div>
                <div>
                  <span className='text-neutral-400'>Domain: </span>
                  <span className='font-medium text-neutral-100'>
                    {DOMAINS.find((d) => d.id === formData.domain)?.name ||
                      'Not set'}
                  </span>
                </div>
                <div>
                  <span className='text-neutral-400'>Tone: </span>
                  <span className='font-medium text-neutral-100 capitalize'>
                    {formData.tone}
                  </span>
                </div>
                <div>
                  <span className='text-neutral-400'>Model: </span>
                  <span className='font-medium text-neutral-100'>
                    {MODELS.find((m) => m.id === formData.model)?.name ||
                      formData.model}
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
                      ?.name || 'Not set'}
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
                    <span className='text-neutral-400'>Loading...</span>
                  </div>
                ) : knowledgeSources.length > 0 ? (
                  knowledgeSources.map((source) => (
                    <div key={source.id} className='flex items-center gap-2'>
                      {source.type === 'pdf' || source.type === 'file' ? (
                        <FileText className='h-4 w-4 text-purple-400' />
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
              System Prompt
            </h3>
            <div className='rounded-lg border border-neutral-700 bg-neutral-900 p-4'>
              {isEditing ? (
                <textarea
                  className='w-full rounded-md bg-neutral-800 p-3 font-mono text-sm text-neutral-200 focus:ring-2 focus:ring-pink-500 focus:outline-none'
                  rows={10}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
              ) : (
                <pre className='max-h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap text-neutral-300'>
                  {prompt}
                </pre>
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
                  >
                    Edit Prompt
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className='flex justify-end pt-4'>
            <Button
              onClick={handleFinalSave}
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
      </RightSlideModal>

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
