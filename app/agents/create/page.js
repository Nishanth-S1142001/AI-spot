'use client'

import {
  Aperture,
  CircleArrowLeft,
  CircleArrowRight,
  FileText,
  Link as LinkIcon,
  Loader2
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

  return `Your name is ${formData.name}.
You are an AI ${selectedDomain?.name || formData.domain} assistant with a ${formData.tone} tone.

${domainPrompt}

You have access to a knowledge base with ${knowledgeSourcesCount} source(s).
When users ask questions, you will automatically search this knowledge base and provide accurate information based on the most relevant content.

Always cite your sources when using information from the knowledge base.`
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
    tone: 'friendly'
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
      const draftAgentData = {
        user_id: user.id,
        name: formData.name,
        domain: formData.domain,
        tone: formData.tone,
        system_prompt: systemPrompt,
        is_active: false // Draft mode
      }

      const newAgent = await createAgentMutation.mutateAsync({
        userId: user.id,
        agentData: draftAgentData
      })

      setCreatedAgent(newAgent)
      setStep(2)
    } catch (error) {
      console.error('Error creating draft agent:', error)
      // Error already handled by mutation
    }
  }, [formData, user, createdAgent, systemPrompt, createAgentMutation])

  // Handle final save - activates agent
  const handleSave = useCallback(async () => {
    if (!createdAgent) {
      toast.error('Agent not created yet')
      return
    }

    try {
      await finalizeAgentMutation.mutateAsync({
        agentId: createdAgent.id,
        updates: {
          is_active: true,
          system_prompt: prompt
        }
      })

      router.push(`/agents/${createdAgent.id}/manage`)
    } catch (error) {
      console.error('Error finalizing agent:', error)
      // Error already handled by mutation
    }
  }, [createdAgent, prompt, router, finalizeAgentMutation])

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
                {[1, 2, 3].map((i) => (
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
                        className={`ml-2 text-sm font-medium transition-colors ${step >= i ? 'text-neutral-100' : 'text-neutral-400'}`}
                      >
                        {i === 1
                          ? 'Basic Info'
                          : i === 2
                            ? 'Knowledge'
                            : 'Review'}
                      </span>
                    </div>
                    {i < 3 && (
                      <div
                        className={`mx-4 h-1 flex-1 rounded transition-all ${step > i ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-neutral-800'}`}
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

            {/* Step 2: Knowledge Base */}
            {step === 2 && (
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
                      onClick={() => setStep(1)} 
                      variant='outline'
                      disabled={isFinalizingAgent}
                    >
                      <CircleArrowLeft className='mr-2 h-4 w-4' />
                      Previous
                    </Button>
                    <Button onClick={() => setStep(3)}>
                      Next
                      <CircleArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
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
                      onClick={() => setStep(2)}
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