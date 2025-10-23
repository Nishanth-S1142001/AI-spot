'use client'

import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
// No longer needed: import { supabase } from '../../../../lib/supabase/dbClient'

// Providers & Helpers
import { useRef } from 'react'
import { useAuth } from '../../../../components/providers/AuthProvider'
import { useLogout } from '../../../../lib/supabase/auth'
import { dbClient } from '../../../../lib/supabase/dbClient'
import { addKnowledgeSource, updateAgent } from '../../../actions/agents'
// Icons
import {
  Aperture,
  CircleArrowLeft,
  CircleArrowRightIcon,
  FileText,
  Globe,
  Link as LinkIcon,
  Save,
  X,
  Paperclip
} from 'lucide-react'

// Dynamic imports (kept, good for performance)
const FormTextarea = dynamic(() => import('../../../../components/ui/textBox'))
const FormInput = dynamic(
  () => import('../../../../components/ui/formInputField')
)
const Button = dynamic(() => import('../../../../components/ui/button'))
const Card = dynamic(() => import('../../../../components/ui/card'))
const LoadingState = dynamic(
  () => import('../../../../components/common/loading-state')
)
const NeonBackground = dynamic(
  () => import('../../../../components/ui/background')
)
const NavigationBar = dynamic(
  () => import('../../../../components/navigationBar/navigationBar')
)

// --- Static Constants (Moved logic out of the component) ---

const PURPOSES = [
  { id: 'website', name: 'Website', icon: Globe, color: 'gray' }
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

// Note: Replaced the placeholder prompts with the correct format for full domain descriptions
const DOMAINS = [
  {
    id: 'business',
    name: 'Business',
    prompt:
      'You are a strategic business consultant AI with deep knowledge in entrepreneurship, management, and corporate strategy. Your goal is to help users plan, launch, and grow businesses effectively. Use a professional and confident tone.'
  },
  {
    id: 'sales',
    name: 'Sales',
    prompt:
      'You are an AI sales strategist and performance coach. Your primary goal is to help users increase sales conversions and revenue. Use a motivating and confident tone to inspire action.'
  },
  {
    id: 'creator',
    name: 'Creator',
    prompt:
      'You are an AI content creator and digital strategist. Your purpose is to help users generate viral content, engaging scripts, and creative ideas. Maintain a creative, energetic, and inspiring tone.'
  },
  {
    id: 'developer',
    name: 'Developer',
    prompt:
      'You are an expert AI developer specializing in full-stack solutions. Help users write, debug, and optimize code efficiently and securely. Keep a mentor-like tone: informative, patient, and precise.'
  },
  {
    id: 'supportservice',
    name: 'Support & Service',
    prompt:
      'You are a friendly, empathetic, and professional customer support AI. Your goal is to understand user issues clearly and resolve them efficiently. Maintain a patient and approachable tone.'
  },
  {
    id: 'financial',
    name: 'Financial',
    prompt:
      'You are an AI financial advisor with expertise in personal and corporate finance. Help users understand complex financial concepts in simple terms. Maintain a trustworthy, analytical, and professional tone.'
  },
  {
    id: 'research',
    name: 'Research',
    prompt:
      'You are an AI research analyst with expertise in data collection, analysis, and synthesis. Help users gather credible information from multiple sources. Maintain a professional, factual, and analytical tone.'
  }
]

// --- System Prompt Generator Function ---
// Moved the logic outside the component, relying on memoization in the component for efficiency.
const generateSystemPrompt = (formData, domains) => {
  const selectedDomain = domains.find((d) => d.id === formData.domain)
  const domainPrompt = selectedDomain?.prompt || ''

  return `Your name is ${formData.name}.
You are an AI ${selectedDomain?.name || formData.domain} assistant with a ${formData.tone} tone.
 
 

Always be helpful, accurate, and stay in character.
Additional Instructions from Domain:
${domainPrompt}

Knowledge Base Summary:
${formData.knowledgeSources.map((s) => s.summary).join('\n')}
`
}

export default function EditAgent() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout() // UI States

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(true) // Set true initially for agent data fetch
  const [isProcessingContent, setIsProcessingContent] = useState(false) // For heavy API calls (scrape/pdf)
  // Agent & Form Data

  const [agent, setAgent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',

    domain: '',

    tone: 'friendly',
    knowledgeSources: []
  }) // Prompt Management

  const [websiteUrl, setWebsiteUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [promptError, setPromptError] = useState('')
  const message = 'Update the Agent' // Constant, no need for useState
  // Refs
  const fetchedAgentRef = useRef(false) // --- Memoized Data & Handlers ---
  // 1. System Prompt Generation (Memoized)

  const finalSystemPrompt = useMemo(
    () => generateSystemPrompt(formData, DOMAINS),
    [formData]
  )

  useEffect(() => {
    // Initialize prompt states only when the final system prompt changes (i.e., form data changes)
    setPrompt(finalSystemPrompt)
    setDraft(finalSystemPrompt)
  }, [finalSystemPrompt]) // 2. Form Updater

  const updateForm = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, []) // 3. Remove Knowledge Source

  const removeKnowledgeSource = useCallback((idToRemove) => {
    setFormData((prev) => ({
      ...prev,
      knowledgeSources: prev.knowledgeSources.filter((s) => s.id !== idToRemove)
    }))
    toast.success('Source removed.')
  }, []) // --- Data Fetching: Agent (Runs on load) ---

  const fetchAgent = useCallback(async () => {
    if (!id || fetchedAgentRef.current) return
    fetchedAgentRef.current = true

    try {
      setFetching(true)

      const [agentData, knowledgeSources] = await Promise.all([
        dbClient.getAgent(id),
        dbClient.getKnowledgeSources(id) // Assuming a function to fetch existing knowledge sources
      ])

      if (!agentData) {
        toast.error('Agent not found')
        router.push('/agents')
        return
      }

      setAgent(agentData)

      setFormData((prev) => ({
        ...prev,
        name: agentData.name || '',
        domain: agentData.domain || '',

        tone: agentData.tone || 'friendly',
        // Note: system_prompt is dynamically generated/edited, but loaded data initializes it
        // The separate prompt state handles the final value.
        knowledgeSources: knowledgeSources || []
      }))

      console.log(knowledgeSources)
      // Initial prompt setup based on fetched data
      setPrompt(
        agentData.system_prompt || generateSystemPrompt(agentData, DOMAINS)
      )
    } catch (err) {
      console.error(err)
      toast.error('Failed to load agent')
      router.push('/agents')
    } finally {
      setFetching(false)
    }
  }, [id, router])

  useEffect(() => {
    if (!authLoading && user) {
      fetchAgent()
    } else if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, fetchAgent, router]) // --- Core Callbacks for Data Manipulation (Optimistic UI) ---
  // PDF Drop Handler

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0] // ... [Validation checks] ...
      if (!acceptedFiles?.length) return
      if (file.type !== 'application/pdf')
        return toast.error('Please upload PDF files only')
      if (file.size > 10 * 1024 * 1024)
        return toast.error('File size must be <10MB')

      const tempId = Date.now()
      const tempSource = {
        id: tempId,
        type: 'pdf',
        name: file.name,
        content: '',
        summary: '',
        status: 'processing'
      }

      setFormData((prev) => ({
        ...prev,
        knowledgeSources: [...prev.knowledgeSources, tempSource]
      }))

      try {
        const formDataToUpload = new FormData() // Renamed to avoid collision with state
        formDataToUpload.append('pdf', file)

        const res = await fetch('/api/pdf-summarize', {
          method: 'POST',
          body: formDataToUpload
        })
        if (!res.ok) throw new Error('PDF processing failed')
        const data = await res.json() // Update UI

        setFormData((prev) => ({
          ...prev,
          knowledgeSources: prev.knowledgeSources.map((src) =>
            src.id === tempId
              ? {
                  ...src,
                  content: data.content,
                  summary: data.summary,
                  status: 'completed'
                }
              : src
          )
        })) // Persist to DB in background

        await addKnowledgeSource(id, {
          source_type: 'pdf',
          file_name: file.name,
          content: data.content,
          summary: data.summary,
          status: 'completed'
        })

        toast.success('PDF uploaded and processed!')
      } catch (err) {
        console.error(err)
        toast.error('Failed to process PDF') // Mark as failed
        setFormData((prev) => ({
          ...prev,
          knowledgeSources: prev.knowledgeSources.map((src) =>
            src.id === tempId ? { ...src, status: 'failed' } : src
          )
        }))
      }
    },
    [id]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  }) // Website Scrape Handler

  const handleAddWebsite = async () => {
    if (!websiteUrl.trim()) return toast.error('Please enter a website URL')

    const tempId = Date.now()
    const tempSource = {
      id: tempId,
      type: 'url',
      source_url: websiteUrl,
      content: '',
      summary: '',
      status: 'processing'
    }

    setFormData((prev) => ({
      ...prev,
      knowledgeSources: [...prev.knowledgeSources, tempSource]
    }))

    try {
      const res = await fetch('/api/url-scrape_summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      })
      if (!res.ok) throw new Error('Failed to scrape website')
      const data = await res.json() // Update UI

      setFormData((prev) => ({
        ...prev,
        knowledgeSources: prev.knowledgeSources.map((src) =>
          src.id === tempId
            ? {
                ...src,
                content: data.content,
                summary: data.summary,
                status: 'completed'
              }
            : src
        )
      })) // Save to DB in background

      await addKnowledgeSource(id, {
        source_type: 'url',
        source_url: websiteUrl,
        content: data.content,
        summary: data.summary,
        status: 'completed'
      })

      toast.success('Website content added successfully!')
      setWebsiteUrl('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to scrape website')
      setFormData((prev) => ({
        ...prev,
        knowledgeSources: prev.knowledgeSources.map((src) =>
          src.id === tempId ? { ...src, status: 'failed' } : src
        )
      }))
    }
  } // Final Save Handler

  const handleUpdate = useCallback(async () => {
    if (!formData.name.trim()) return toast.error('Please enter an agent name')
    try {
      setSaving(true)
      const updatedAgent = await updateAgent(id, {
        name: formData.name,

        domain: formData.domain,

        tone: formData.tone,
        // Use the currently approved 'prompt' state
        system_prompt: prompt,
        updated_at: new Date().toISOString()
      })
      toast.success('Agent updated successfully! Redirecting...')
      router.push(`/agents/${id}/manage`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update agent')
    } finally {
      setSaving(false)
    }
  }, [formData, prompt, id, router]) // Prompt Editor Handlers

  const handlePromptSave = useCallback(() => {
    if (!draft.trim()) return setPromptError('Prompt cannot be empty.')
    setPrompt(draft)
    setIsEditing(false)
    setPromptError('')
    toast.success('Prompt updated.')
  }, [draft])

  const handlePromptCancel = useCallback(() => {
    setDraft(prompt) // restore original
    setIsEditing(false)
    setPromptError('')
  }, [prompt]) // --- Loading Screen ---

  if (authLoading || fetching || !agent) {
    return (
      <LoadingState
        message={authLoading ? 'Authenticating...' : 'Loading Agent Data...'}
        className='min-h-screen'
      />
    )
  }
  return (
    <>
      <NeonBackground />
      <Suspense
        fallback={
          <LoadingState message='Loading ...' className='min-h-screen' />
        }
      >
        {isProcessingContent && (
          <LoadingState message='Processing knowledge base...' />
        )}
        {saving && <LoadingState message='Saving agent updates...' />}
        <div className='relative w-full flex-1 font-mono text-neutral-100'>
          {/* Header */}
          <div className='sticky top-0 z-10 flex h-16 items-center'>
            <NavigationBar
              profile={profile}
              message={message}
              agent={agent}
              onLogOutClick={logout}
            />
          </div>
          <div className='flex h-[calc(100vh-64px)] flex-col overflow-hidden'>
            <div className='mx-auto max-w-4xl flex-none px-4 py-8 pt-6 sm:px-6 lg:px-8'>
              <div className='flex items-center justify-center space-x-8'>
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className='flex items-center'>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                        step >= stepNum
                          ? 'bg-orange-400 text-white'
                          : 'bg-neutral-700 text-orange-400'
                      }`}
                    >
                      {stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div
                        className={`mx-4 h-1 w-16 ${
                          step > stepNum ? 'bg-neutral-400' : 'bg-neutral-700'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className='mx-auto max-w-4xl flex-1  custom-scrollbar overflow-y-auto px-4 py-8 sm:px-6 lg:px-8'>
                <Card>
                  <div className='space-y-6 p-6'>
                    <div>
                      <h2 className='text-xl font-semibold text-neutral-200'>
                        Basic
                        <span className='text-orange-500'> Information</span>
                      </h2>
                      <p className='text-white'>
                        Update your agent&apos;s core details and personality.
                      </p>
                    </div>
                    <p className='text-white'>Name:</p>
                    <FormInput
                      label='Agent Name *'
                      className='mb-20 w-full'
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      placeholder='Agent Name'
                    />
                    <p className='text-white'>Choose domain.</p>
                    <div className='mb-20 grid grid-cols-2 gap-4 md:grid-cols-4'>
                      {DOMAINS.map((domain) => (
                        <button
                          key={domain.id}
                          onClick={() => updateForm('domain', domain.id)}
                          className={`rounded-lg border-2 p-4 transition-all ${
                            formData.domain === domain.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          {/* <purpose.icon
                            className={`mx-auto mb-2 h-8 w-8 text-${purpose.color}-400`}
                          /> */}
                          <div className='text-sm font-medium text-neutral-200'>
                            {domain.name}
                          </div>
                        </button>
                      ))}
                    </div>
                    {/* Purpose Selection */}

                    <p className='text-white'>Tone.</p>
                    <div className='mb-20 grid grid-cols-2 gap-4 md:grid-cols-4'>
                      {TONES.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => updateForm('tone', tone.id)}
                          className={`rounded-lg border-2 p-4 transition-all ${
                            formData.tone === tone.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          <div className='text-sm font-medium text-neutral-200'>
                            {tone.name}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className='flex justify-end'>
                      <Button
                        onClick={() => setStep(2)}
                        disabled={!formData.name.trim() || !formData.domain}
                      >
                        <div className='flex flex-row'>
                          Next
                          <CircleArrowRightIcon
                            className={`mx-auto ml-2 h-8 w-8 text-white`}
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            {/* Step 2: Agent Type, Tone & Knowledge Base */}
            {step === 2 && (
              <div className='mx-auto max-w-4xl flex-1  custom-scrollbar  overflow-y-auto px-4 py-8 sm:px-6 lg:px-8'>
                <Card>
                  <div className='space-y-6 p-6'>
                    <div>
                      <h2 className='text-xl font-semibold text-neutral-200'>
                        Knowledge
                        <span className='text-orange-500'> Base</span>
                      </h2>
                    </div>
                    <h3 className='mt-10 flex items-center gap-2 font-medium text-neutral-200'>
                      <LinkIcon className='h-4 w-4' />
                      Add Knowledge Base
                    </h3>
                    <p className='mb-4 text-sm text-neutral-400'>
                      Train your agent with relevant information by uploading a
                      PDF or scraping a website URL.
                    </p>
                    <div className='flex flex-col justify-center space-y-4'>
                      {/* Website Input */}
                      <div className='relative flex w-full cursor-pointer items-center rounded-lg'>
                        <FormInput
                          type='url'
                          className='w-full pr-12'
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder='https://your-data-source.com'
                          id='websiteUrl'
                          disabled={isProcessingContent}
                        />
                        <button
                          onClick={handleAddWebsite}
                          disabled={isProcessingContent || !websiteUrl.trim()}
                          className='absolute top-0 right-0 h-full cursor-pointer rounded-l-none'
                          variant='default'
                        >
                          <Globe className='h-4 w-4' />
                        </button>
                      </div>

                      {/* PDF Dropzone */}
                      <div
                        {...getRootProps()}
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                          isProcessingContent
                            ? 'border-neutral-600 bg-neutral-800/50'
                            : 'border-orange-500/50 bg-neutral-900 hover:border-orange-400'
                        }`}
                        aria-disabled={isProcessingContent}
                      >
                        <input
                          {...getInputProps()}
                          disabled={isProcessingContent}
                        />
                        <Paperclip className='mb-2 h-5 w-5 text-neutral-400' />
                        <p className='text-xs text-neutral-400'>
                          {isProcessingContent
                            ? 'Processing file...'
                            : 'Drop a PDF here, or click to select file (<10MB)'}
                        </p>
                      </div>
                    </div>
                    {/* Knowledge Sources List */}
                    <div className='mt-6 space-y-3 rounded-lg bg-neutral-800 p-6'>
                      <h4 className='text-sm font-semibold text-neutral-200'>
                        Attached Sources ({formData.knowledgeSources.length})
                      </h4>
                      {formData.knowledgeSources.length === 0 ? (
                        <p className='text-xs text-neutral-400 italic'>
                          No sources attached yet.
                        </p>
                      ) : (
                        <div className='space-y-2'>
                          {formData.knowledgeSources.map((source) => (
                            <div
                              key={source.id}
                              className={`flex items-center justify-between rounded-md p-2 ${
                                source.status === 'processing'
                                  ? 'animate-pulse bg-blue-900/30'
                                  : 'bg-neutral-700'
                              }`}
                            >
                              <div className='flex items-center space-x-2 truncate'>
                                {source.type === 'url' ? (
                                  <LinkIcon className='h-4 w-4 text-blue-400' />
                                ) : (
                                  <FileText className='h-4 w-4 text-orange-400' />
                                )}
                                <span className='truncate text-sm'>
                                  <span className='truncate text-sm'>
                                    {source.name ||
                                      source.file_name ||
                                      source.source_url ||
                                      'Unnamed Source'}
                                  </span>
                                </span>
                                {source.status === 'processing' && (
                                  <span className='text-xs text-blue-300'>
                                    (Processing...)
                                  </span>
                                )}
                                {source.status === 'failed' && (
                                  <span className='text-xs text-red-400'>
                                    (Failed)
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => removeKnowledgeSource(source.id)}
                                className='p-1 text-red-400 hover:text-red-300'
                                title='Remove source'
                                disabled={source.status === 'processing'}
                              >
                                <X className='h-4 w-4' />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className='mt-4 flex justify-between'>
                      <Button onClick={() => setStep(1)} variant='outline'>
                        <div className='flex flex-row place-content-center justify-center'>
                          <CircleArrowLeft
                            className={`mx-auto mr-2 h-8 w-8 text-white`}
                          />
                          Previous
                        </div>
                      </Button>
                      <Button
                        onClick={() => {
                          setStep(3)
                        }}
                        disabled={isProcessingContent}
                      >
                        <div className='flex flex-row place-content-center justify-center'>
                          Review
                          <CircleArrowRightIcon
                            className={`mx-auto ml-2 h-8 w-8 text-white`}
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            {/* Step 3: Review & Final Save */}
            {step === 3 && (
              <div className='mx-auto max-w-4xl flex-1 custom-scrollbar overflow-y-auto px-4 py-8 sm:px-6 lg:px-8'>
                <Card>
                  <div className='space-y-6 p-6'>
                    <div>
                      <h2 className='text-xl font-semibold text-neutral-200'>
                        Review & Save
                      </h2>
                      <p className='text-neutral-400'>
                        Review the generated prompt and finalize your agent
                        update.
                      </p>
                    </div>
                    <div className='card-content space-y-6'>
                      <div className='grid gap-6 md:grid-cols-2'>
                        <div>
                          <h3 className='mb-3 font-medium text-neutral-200'>
                            Basic Information
                          </h3>
                          <div className='space-y-2 text-sm'>
                            <div>
                              <span className='text-neutral-400'>Name:</span>
                              <span className='font-medium'>
                                {formData.name}
                              </span>
                            </div>
                            <div>
                              <span className='text-neutral-400'>Domain:</span>
                              <span className='font-medium capitalize'>
                                {DOMAINS.find((d) => d.id === formData.domain)
                                  ?.name || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className='text-neutral-400'>Tone:</span>
                              <span className='font-medium capitalize'>
                                {formData.tone}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className='mb-3 font-medium text-neutral-200'>
                            Knowledge Bases
                          </h3>
                          <div className='space-y-2 text-sm'>
                            {formData.knowledgeSources.length > 0 ? (
                              formData.knowledgeSources.map((source) => (
                                <div
                                  key={source.id}
                                  className='flex items-center gap-2'
                                >
                                  {source.type === 'pdf' && (
                                    <FileText className='h-4 w-4 text-orange-500' />
                                  )}
                                  {source.type === 'url' && (
                                    <LinkIcon className='h-4 w-4 text-blue-500' />
                                  )}
                                  {/* Display processing status if needed */}
                                  {source.status === 'processing' && (
                                    <span className='text-xs text-blue-300'>
                                      (Processing...)
                                    </span>
                                  )}
                                  <span>
                                    <span className='truncate text-sm'>
                                      {source.name ||
                                        source.file_name ||
                                        source.source_url ||
                                        'Unnamed Source'}
                                    </span>
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className='text-neutral-500 italic'>
                                No external data sources added.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className='mb-2 font-medium text-neutral-200'>
                          Generated System Prompt (Final AI Instructions)
                        </h3>
                        <div className='rounded-lg bg-neutral-800 p-4'>
                          {isEditing ? (
                            <textarea
                              className='w-full rounded-md bg-neutral-900 p-2 font-mono text-sm text-neutral-300 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                              rows={6}
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                            />
                          ) : (
                            <div className='relative w-full'>
                              <div className='h-[300px] custom-scrollbar overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm whitespace-pre-wrap text-neutral-100'>
                                {prompt}
                              </div>
                            </div>
                          )}
                          {promptError && (
                            <p className='mt-2 text-sm text-orange-400'>
                              {promptError}
                            </p>
                          )}
                          <div className='mt-2 flex justify-end gap-2'>
                            {isEditing ? (
                              <>
                                <Button
                                  onClick={handlePromptSave}
                                  disabled={isProcessingContent}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant='secondary'
                                  onClick={handlePromptCancel}
                                  disabled={isProcessingContent}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() => setIsEditing(true)}
                                disabled={isProcessingContent}
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-between'>
                    <Button
                      onClick={() => setStep(2)}
                      variant='outline'
                      disabled={saving}
                    >
                      <div className='flex flex-row items-center justify-center'>
                        <CircleArrowLeft
                          className={`mr-2 h-5 w-5 text-white`}
                        />
                        Previous
                      </div>
                    </Button>
                    <div className='flex space-x-3'>
                      <Button
                        onClick={() => toast.success('Agent saved as draft!')} // Placeholder for draft saving
                        variant='outline'
                        disabled={saving}
                      >
                        <div className='flex flex-row items-center justify-center'>
                          <Save className='mr-2 h-4 w-4' />
                          Save Draft
                        </div>
                      </Button>
                      <Button
                        onClick={handleUpdate}
                        disabled={saving || isProcessingContent}
                      >
                        <div className='flex flex-row items-center justify-center'>
                          {saving ? (
                            'Updating...'
                          ) : (
                            <>
                              <Aperture className='mr-2 h-4 w-4' />
                              Update Agent
                            </>
                          )}
                        </div>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </Suspense>
    </>
  )
}
