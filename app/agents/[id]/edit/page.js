'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useAuth } from '../../../../components/providers/AuthProvider'
import { useLogout } from '../../../../lib/supabase/auth'
import { dbClient } from '../../../../lib/supabase/dbClient'
import { addKnowledgeSource, updateAgent } from '../../../actions/agents'
import {
  Aperture,
  CircleArrowLeft,
  CircleArrowRight,
  FileText,
  Link as LinkIcon,
  Save,
  Upload,
  X
} from 'lucide-react'
import FormTextarea from '../../../../components/ui/textBox'
import FormInput from '../../../../components/ui/formInputField'
import Button from '../../../../components/ui/button'
import Card from '../../../../components/ui/card'
import LoadingState from '../../../../components/common/loading-state'
import NeonBackground from '../../../../components/ui/background'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import React from 'react'
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
      'You are a strategic business consultant AI with deep knowledge in entrepreneurship, management, and corporate strategy.'
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: '📈',
    color: 'green',
    prompt:
      'You are an AI sales strategist and performance coach. Help users increase sales conversions and revenue.'
  },
  {
    id: 'creator',
    name: 'Creator',
    icon: '🎨',
    color: 'purple',
    prompt:
      'You are an AI content creator and digital strategist. Generate viral content and creative ideas.'
  },
  {
    id: 'developer',
    name: 'Developer',
    icon: '💻',
    color: 'orange',
    prompt:
      'You are an expert AI developer. Help users write, debug, and optimize code efficiently.'
  },
  {
    id: 'supportservice',
    name: 'Support & Service',
    icon: '🤝',
    color: 'pink',
    prompt:
      'You are a friendly customer support AI. Understand issues clearly and resolve them efficiently.'
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
const generateSystemPrompt = (formData, domains) => {
  const selectedDomain = domains.find((d) => d.id === formData.domain)
  const domainPrompt = selectedDomain?.prompt || ''
  const knowledgeBase = formData.knowledgeSources
    .map((s) => s.summary || s.content)
    .join('\n')

  return `Your name is ${formData.name}.
You are an AI ${selectedDomain?.name || formData.domain} assistant with a ${formData.tone} tone.

${domainPrompt}

Knowledge Base:
${knowledgeBase || 'No knowledge sources added yet.'}

Always be helpful, accurate, and stay in character.`
}

// ==================== MAIN COMPONENT ====================
export default function EditAgent() {
  const [isInitialized, setIsInitialized] = useState(false)
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()

  // ✅ FIX: Refs to prevent redundant fetches
  const hasFetchedAgent = useRef(false)
  const processingRef = useRef(false)

  // State
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isProcessingContent, setIsProcessingContent] = useState(false)
  const [agent, setAgent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    tone: 'friendly',
    knowledgeSources: []
  })

  // Prompt state
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [promptError, setPromptError] = useState('')

  // ✅ Reset state when agent ID changes
  useEffect(() => {
    hasFetchedAgent.current = false
    processingRef.current = false
    setIsInitialized(false)
    setFetching(true)
    setStep(1)
    setSaving(false)
    setIsProcessingContent(false)
    setAgent(null)
    setFormData({
      name: '',
      domain: '',
      tone: 'friendly',
      knowledgeSources: []
    })
    setWebsiteUrl('')
    setPrompt('')
    setDraft('')
    setIsEditing(false)
    setPromptError('')
  }, [id])

  // ✅ OPTIMIZATION: Memoized system prompt
  const finalSystemPrompt = useMemo(
    () => generateSystemPrompt(formData, DOMAINS),
    [formData]
  )

  // Sync prompt
  useEffect(() => {
    if (!isEditing) {
      setPrompt(finalSystemPrompt)
      setDraft(finalSystemPrompt)
    }
  }, [finalSystemPrompt, isEditing])

  // ✅ OPTIMIZATION: Fetch agent data only once per ID
  useEffect(() => {
    if (!user || !id || hasFetchedAgent.current) return

    const fetchAgent = async () => {
      hasFetchedAgent.current = true
      
      try {
        setFetching(true)
        const [agentData, knowledgeSources] = await Promise.all([
          dbClient.getAgent(id),
          dbClient.getKnowledgeSources(id)
        ])

        if (!agentData) {
          toast.error('Agent not found')
          router.push('/agents')
          return
        }

        setAgent(agentData)
        setFormData({
          name: agentData.name || '',
          domain: agentData.domain || '',
          tone: agentData.tone || 'friendly',
          knowledgeSources: knowledgeSources.map((ks) => ({
            id: ks.id,
            type: ks.source_type,
            name: ks.file_name || ks.source_url || 'Unknown',
            summary: ks.content || '',
            source_url: ks.source_url,
            file_name: ks.file_name
          }))
        })

        if (agentData.system_prompt) {
          setPrompt(agentData.system_prompt)
          setDraft(agentData.system_prompt)
        }
      } catch (err) {
        console.error('Error fetching agent:', err)
        toast.error('Failed to load agent')
      } finally {
        setFetching(false)
        setIsInitialized(true)
      }
    }

    fetchAgent()
  }, [user, id, router])

  // ✅ OPTIMIZATION: Memoized callbacks
  const updateForm = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const removeKnowledgeSource = useCallback((idToRemove) => {
    setFormData((prev) => ({
      ...prev,
      knowledgeSources: prev.knowledgeSources.filter((s) => s.id !== idToRemove)
    }))
    toast.success('Knowledge source removed')
  }, [])

  // PDF upload
  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (processingRef.current) return

      const file = acceptedFiles[0]
      if (!file) return toast.error('No file selected')
      if (file.type !== 'application/pdf') return toast.error('PDF only!')
      if (file.size > 10 * 1024 * 1024)
        return toast.error('File size must be < 10MB')

      processingRef.current = true
      setIsProcessingContent(true)

      try {
        const formDataObj = new FormData()
        formDataObj.append('file', file)

        const response = await fetch('/api/extract-pdf', {
          method: 'POST',
          body: formDataObj
        })

        if (!response.ok) throw new Error('Failed to extract PDF')

        const data = await response.json()

        // Add to agent's knowledge sources
        const newSource = await addKnowledgeSource({
          agent_id: id,
          source_type: 'pdf',
          file_name: file.name,
          content: data.text || '',
          metadata: {}
        })

        setFormData((prev) => ({
          ...prev,
          knowledgeSources: [
            ...prev.knowledgeSources,
            {
              id: newSource.id,
              type: 'pdf',
              name: file.name,
              summary: data.text || '',
              file_name: file.name
            }
          ]
        }))

        toast.success('PDF processed and added!')
      } catch (err) {
        console.error('PDF processing error:', err)
        toast.error('Failed to process PDF')
      } finally {
        processingRef.current = false
        setIsProcessingContent(false)
      }
    },
    [id]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isProcessingContent
  })

  // Website scraper
  const handleAddWebsite = useCallback(async () => {
    if (!websiteUrl.trim()) return toast.error('Please enter a website URL')
    if (processingRef.current) return

    processingRef.current = true
    setIsProcessingContent(true)

    try {
      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      })

      if (!response.ok) throw new Error('Failed to scrape website')

      const data = await response.json()

      // Add to agent's knowledge sources
      const newSource = await addKnowledgeSource({
        agent_id: id,
        source_type: 'url',
        source_url: websiteUrl,
        content: data.content || '',
        metadata: {}
      })

      setFormData((prev) => ({
        ...prev,
        knowledgeSources: [
          ...prev.knowledgeSources,
          {
            id: newSource.id,
            type: 'url',
            name: websiteUrl,
            summary: data.content || '',
            source_url: websiteUrl
          }
        ]
      }))

      setWebsiteUrl('')
      toast.success('Website scraped and added!')
    } catch (err) {
      console.error('Website scraping error:', err)
      toast.error('Failed to scrape website')
    } finally {
      processingRef.current = false
      setIsProcessingContent(false)
    }
  }, [websiteUrl, id])

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

  // ✅ OPTIMIZATION: Update agent
  const handleUpdate = useCallback(async () => {
    if (!formData.name.trim()) return toast.error('Please enter an agent name')
    if (!formData.domain) return toast.error('Please select a domain')

    setSaving(true)
    try {
      await updateAgent(id, {
        name: formData.name,
        domain: formData.domain,
        tone: formData.tone,
        system_prompt: prompt
      })

      toast.success('Agent updated successfully!')
      router.push(`/agents/${id}/manage`)
    } catch (err) {
      console.error('Error updating agent:', err)
      toast.error('Failed to update agent')
    } finally {
      setSaving(false)
    }
  }, [id, formData, prompt, router])

  // Get domain colors
  // ✅ FIXED: Get domain colors with enhanced styling
  const getDomainColorClasses = useCallback((domainId, isSelected) => {
    const domain = DOMAINS.find((d) => d.id === domainId)
    const colors = DOMAIN_COLOR_MAP[domain?.color] || DOMAIN_COLOR_MAP.blue

    if (isSelected) {
      return `bg-gradient-to-br ${colors.gradient} ${colors.border} ${colors.ring} ${colors.text}`
    }

    return `border-neutral-700/50 bg-neutral-900/30 hover:bg-neutral-900/50 ${colors.hoverBorder} text-neutral-400 hover:text-neutral-200`
  }, [])

  // Loading states
  if (authLoading || (fetching && !isInitialized)) {
    return (
      <LoadingState
        message={authLoading ? 'Authenticating...' : 'Loading agent...'}
        className='min-h-screen'
      />
    )
  }

  if (!agent) {
    return (
      <LoadingState message='Agent not found...' className='min-h-screen' />
    )
  }

  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-col font-mono text-neutral-100'>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
          <NavigationBar
            profile={profile}
            title={`Edit: ${agent.name}`}
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
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          step >= i
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {i}
                      </div>
                      <span
                        className={`ml-2 text-sm ${step >= i ? 'text-neutral-100' : 'text-neutral-400'}`}
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
                        className={`mx-4 h-1 flex-1 ${step > i ? 'bg-orange-500' : 'bg-neutral-800'}`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <Card className='border-orange-600/20'>
                <div className='space-y-6 p-6'>
                  <div>
                    <h3 className='mb-3 text-sm font-medium text-neutral-200'>
                      Basic Information
                    </h3>
                  <p className='mt-1 text-sm text-neutral-400'>
  Update your agent&apos;s identity and purpose
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
                            )}`}
                            onClick={() => updateForm('domain', domain.id)}
                          >
                            <div className='flex items-center gap-3 p-4'>
                              <div className='text-3xl'>{domain.icon}</div>
                              <div className='flex-1'>
                                <h4 className='font-semibold text-neutral-100'>
                                  {domain.name}
                                </h4>
                                <p className='line-clamp-1 text-xs text-neutral-400'>
                                  {domain.prompt.slice(0, 50)}...
                                </p>
                              </div>
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
                    <div className='grid gap-3 sm:grid-cols-2'>
                      {TONES.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => updateForm('tone', tone.id)}
                          className={`rounded-lg border p-4 text-left transition-all hover:border-neutral-600/50 ${
                            formData.tone === tone.id
                              ? 'border-orange-600/50 bg-orange-900/20'
                              : 'border-neutral-700/50 bg-neutral-900/50'
                          }`}
                        >
                          <p className='font-medium text-neutral-100'>
                            {tone.name}
                          </p>
                          <p className='text-xs text-neutral-400'>
                            {tone.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className='flex justify-end pt-4'>
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!formData.name.trim() || !formData.domain}
                    >
                      Next
                      <CircleArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 2: Knowledge Sources */}
            {step === 2 && (
              <Card className='border-blue-600/20'>
                <div className='space-y-6 p-6'>
                  <div>
                    <h2 className='text-2xl font-bold text-neutral-100'>
                      Knowledge Sources
                    </h2>
                    <p className='mt-1 text-sm text-neutral-400'>
                      Manage documents and websites for context
                    </p>
                  </div>

                  {/* PDF Upload */}
                  <div>
                    <label className='mb-2 block text-sm font-medium text-neutral-200'>
                      Upload PDF
                    </label>
                    <div
                      {...getRootProps()}
                      className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all ${
                        isDragActive
                          ? 'border-orange-500 bg-orange-900/10'
                          : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-600'
                      } ${isProcessingContent ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <input {...getInputProps()} />
                      <Upload className='mx-auto h-12 w-12 text-neutral-400' />
                      <p className='mt-2 text-sm text-neutral-300'>
                        {isProcessingContent
                          ? 'Processing PDF...'
                          : 'Drop PDF here or click to upload'}
                      </p>
                      <p className='text-xs text-neutral-500'>Max 10MB</p>
                    </div>
                  </div>

                  {/* Website URL */}
                  <div>
                    <label className='mb-2 block text-sm font-medium text-neutral-200'>
                      Add Website
                    </label>
                    <div className='flex gap-2'>
                      <FormInput
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder='https://example.com'
                        disabled={isProcessingContent}
                      />
                      <Button
                        onClick={handleAddWebsite}
                        disabled={!websiteUrl.trim() || isProcessingContent}
                        variant='secondary'
                      >
                        {isProcessingContent ? 'Adding...' : 'Add'}
                      </Button>
                    </div>
                  </div>

                  {/* Knowledge Sources List */}
                  {formData.knowledgeSources.length > 0 && (
                    <div>
                      <label className='mb-3 block text-sm font-medium text-neutral-200'>
                        Added Sources ({formData.knowledgeSources.length})
                      </label>
                      <div className='space-y-2'>
                        {formData.knowledgeSources.map((source) => (
                          <div
                            key={source.id}
                            className='flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900/50 p-3'
                          >
                            <div className='flex items-center gap-3'>
                              {source.type === 'pdf' ? (
                                <FileText className='h-5 w-5 text-orange-400' />
                              ) : (
                                <LinkIcon className='h-5 w-5 text-blue-400' />
                              )}
                              <span className='truncate text-sm text-neutral-200'>
                                {source.name}
                              </span>
                            </div>
                            <button
                              onClick={() => removeKnowledgeSource(source.id)}
                              className='text-neutral-400 transition-colors hover:text-red-400'
                            >
                              <X className='h-4 w-4' />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className='flex justify-between pt-4'>
                    <Button onClick={() => setStep(1)} variant='outline'>
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
              <Card className='border-green-600/20'>
                <div className='space-y-6 p-6'>
                  <div>
                    <h2 className='text-2xl font-bold text-neutral-100'>
                      Review & Update
                    </h2>
                    <p className='mt-1 text-sm text-neutral-400'>
                      Review your changes and system prompt
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
                        {formData.knowledgeSources.length > 0 ? (
                          formData.knowledgeSources.map((source) => (
                            <div
                              key={source.id}
                              className='flex items-center gap-2'
                            >
                              {source.type === 'pdf' ? (
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
                            No knowledge sources
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
                      disabled={saving}
                    >
                      <CircleArrowLeft className='mr-2 h-4 w-4' />
                      Previous
                    </Button>
                    <Button
                      onClick={handleUpdate}
                      disabled={saving || isProcessingContent}
                    >
                      {saving ? (
                        'Updating...'
                      ) : (
                        <>
                          <Aperture className='mr-2 h-4 w-4' />
                          Update Agent
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
    </>
  )
}