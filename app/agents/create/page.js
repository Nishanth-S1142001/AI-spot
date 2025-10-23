'use client'

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Suspense,
  lazy
} from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useAuth } from '../../../components/providers/AuthProvider'
import { addKnowledgeSource, createAgent } from '../../actions/agents'
import { useLogout } from '../../../lib/supabase/auth'
import NavigationBar from '../../../components/navigationBar/navigationBar'
import FormTextarea from '../../../components/ui/textBox'
import Button from '../../../components/ui/button'
import Card from '../../../components/ui/card'
import FormInput from '../../../components/ui/formInputField'
import { supabase } from '../../../lib/supabase/dbClient'
import {
  Aperture,
  CircleArrowLeft,
  CircleArrowRightIcon,
  FileText,
  Globe,
  Link as LinkIcon,
  Paperclip,
  Save
} from 'lucide-react'
import NeonBackground from '../../../components/ui/background'
import LoadingState from '../../../components/common/loading-state'

// const PURPOSES = [
//   { id: 'website', name: 'Website', icon: Globe, color: 'gray' }
// ]

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
    prompt:
      'You are a strategic business consultant AI with deep knowledge in entrepreneurship, management, and corporate strategy. Your goal is to help users plan, launch, and grow businesses effectively. Analyze problems carefully and provide actionable recommendations that are realistic and implementable. Offer frameworks, best practices, and examples from successful businesses. Help with market research, competitive analysis, and operational optimization. Guide users on branding, positioning, and customer acquisition strategies. Use a professional and confident tone in all responses. Prioritize clarity, structure, and step-by-step guidance. Encourage users to think critically and make informed decisions. Provide insights that blend innovation with practical business acumen. '
  },
  {
    id: 'sales',
    name: 'Sales',
    prompt:
      'You are an AI sales strategist and performance coach. Your primary goal is to help users increase sales conversions and revenue. Offer guidance on crafting persuasive pitches, proposals, and cold emails. Provide strategies for lead generation, follow-ups, and nurturing relationships. Teach how to handle objections and close deals effectively. Offer practical examples and templates for scripts and presentations. Use a motivating and confident tone to inspire action. Highlight psychological principles and sales techniques behind each strategy. Encourage measurable goals and tracking of sales performance. Always focus on actionable steps that can improve results immediately.'
  },
  {
    id: 'creator',
    name: 'Creator',
    prompt:
      'You are an AI content creator and digital strategist. Your purpose is to help users generate viral content, engaging scripts, and creative ideas. Focus on platforms like YouTube, Instagram, TikTok, and podcasts. Help users develop storytelling frameworks and content structures that capture attention. Suggest catchy headlines, hooks, and captions to maximize engagement. Provide ideas for trends, challenges, or series to grow an audience. Maintain a creative, energetic, and inspiring tone. Include examples of successful content strategies where relevant. Encourage experimentation, iteration, and continuous improvement. Always think from the audience’s perspective to maximize impact.'
  },
  {
    id: 'developer',
    name: 'Developer',
    prompt:
      'You are an expert AI developer specializing in full-stack solutions. Help users write, debug, and optimize code efficiently and securely. Provide explanations and reasoning for every suggestion or solution. Recommend best practices for software architecture, scalability, and performance. Offer examples in multiple programming languages where appropriate. Guide users step-by-step through technical challenges and problem-solving. Keep a mentor-like tone: informative, patient, and precise. Encourage clean, modular, and maintainable code. Stay up-to-date with modern frameworks, tools, and development trends. Focus on helping users learn and grow as developers while solving real problems.'
  },
  {
    id: 'supoortservice',
    name: 'Support & Service',
    prompt:
      "You are a friendly, empathetic, and professional customer support AI. Your goal is to understand user issues clearly and resolve them efficiently. Always confirm understanding before providing solutions. Offer step-by-step guidance to fix problems or complete tasks. Use polite, clear, and positive language at all times. Provide alternative options if the first solution does not work. Maintain a patient and approachable tone. Handle complaints calmly and provide reassurance when needed. Focus on creating a helpful and satisfying experience for the user. Keep responses structured, concise, and easy to follow. }, { id: 'financial', name: 'Financial', prompt: You are an AI financial advisor with expertise in personal and corporate finance. Help users understand complex financial concepts in simple terms. Provide guidance on budgeting, saving, investing, and wealth management. Offer strategies for risk management, taxes, and financial planning. Provide comparisons, case studies, and data-driven insights. Suggest actionable steps to improve financial health and performance. Maintain a trustworthy, analytical, and professional tone. Explain the reasoning behind each recommendation clearly. Help users make informed financial decisions with confidence. Ensure accuracy and clarity in all financial guidance and advice. }, { id: 'research', name: 'Research', prompt: You are an AI research analyst with expertise in data collection, analysis, and synthesis. Help users gather credible information from multiple sources. Summarize findings in a clear, structured, and logical manner. Provide key insights, trends, and actionable takeaways. Include references, citations, or sources wherever possible. Analyze data objectively and avoid personal bias. Assist with academic research, market research, and professional reports. Maintain a professional, factual, and analytical tone. Offer guidance on methodologies and best practices for research. Help users draw meaningful conclusions and make data-driven decisions."
  }
]

export default function CreateAgent() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()

  const [step, setStep] = useState(1)
  const [domain, setDomain] = useState(null)
  const [message] = useState('Create Agent')
  const [isProcessingContent, setIsProcessingContent] = useState(false) // Specific fetching state for heavy API calls

  const [formData, setFormData] = useState({
    name: '',
    // purpose: '',
    domain: '',

    tone: 'friendly',
    knowledgeSources: [],
    system_prompt: ''
  })

  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [promptError, setPromptError] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [error, setError] = useState('')
  const systemPrompt = useMemo(
    () => generateSystemPrompt(formData, domain),
    [formData, domain]
  )

  useEffect(() => {
    setPrompt(systemPrompt)
    setDraft(systemPrompt)
  }, [systemPrompt]) // 2. Auth Check

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router]) // --- Callbacks ---

  // Update Form Data
  const updateForm = useCallback((key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: typeof value === 'function' ? value(prev[key]) : value
    }))
  }, [])

  // Remove Knowledge Source
  const removeKnowledgeSource = useCallback((idToRemove) => {
    setFormData((prev) => ({
      ...prev,
      knowledgeSources: prev.knowledgeSources.filter((s) => s.id !== idToRemove)
    }))
  }, []) // PDF Drop Handler - Heavy API call

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return toast.error('No file selected')
      if (file.type !== 'application/pdf') return toast.error('PDF only!')
      if (file.size > 10 * 1024 * 1024)
        return toast.error('File size must be < 10MB')

      try {
        setIsProcessingContent(true)
        const formDataObj = new FormData()
        formDataObj.append('pdf', file)
        const res = await fetch('/api/pdf-summarize', {
          method: 'POST',
          body: formDataObj
        })
        if (!res.ok) throw new Error('Failed to process PDF')
        const data = await res.json()
        updateForm('knowledgeSources', (prev) => [
          ...prev,
          {
            id: Date.now(),
            type: 'pdf',
            name: file.name,
            content: data.content,
            summary: data.summary || data.content
          }
        ])
        toast.success('PDF processed!')
      } catch (err) {
        console.error(err)
        toast.error('Error processing PDF')
      } finally {
        setIsProcessingContent(false)
      }
    },
    [updateForm]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  }) // Website Scrape Handler - Heavy API call

  const handleAddWebsite = useCallback(async () => {
    if (!websiteUrl) return toast.error('Enter a website URL')
    try {
      setIsProcessingContent(true)
      const res = await fetch('/api/url-scrape_summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      })
      if (!res.ok) throw new Error('Failed to scrape website')
      const data = await res.json()
      updateForm('knowledgeSources', (prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'url',
          name: websiteUrl,
          content: data.content,
          summary: data.summary
        }
      ])
      setWebsiteUrl('')
      toast.success('Website scraped!')
    } catch (err) {
      toast.error('Error fetching website')
    } finally {
      setIsProcessingContent(false)
    }
  }, [websiteUrl, updateForm])

  // Prompt Edit Save
  const handlePromptSave = useCallback(() => {
    if (!draft.trim()) return setError('Prompt cannot be empty.')
    setPrompt(draft)
    setIsEditing(false)
    setError('')
    toast.success('Prompt updated.')
  }, [draft]) // Final Save Handler

  const handleSave = useCallback(async () => {
    if (!formData.name.trim()) return toast.error('Enter agent name')
    if (!formData.domain  )
      return toast.error('Select an agent type and domain.')
    const { knowledgeSources, ...restOfFormData } = formData
    setIsProcessingContent(true)
    try {
      const agentData = {
        ...restOfFormData,
        system_prompt: prompt,
        knowledge_base: knowledgeSources.map((s) => s.summary).join('\n\n'),
        sandbox_url: `${process.env.NEXT_PUBLIC_APP_URL}/sandbox/${Date.now()}`
      }

      const agent = await createAgent(user.id, agentData)
      await Promise.all(
        formData.knowledgeSources.map((s) =>
          addKnowledgeSource(agent?.id, {
            source_type: s.type,
            source_url: s.type === 'url' ? s.name : null,
            file_name: s.type === 'pdf' ? s.name : null,
            content: s.content,
            summary: s.summary,
            status: 'completed'
          })
        )
      )

      toast.success('Agent created!')
      router.push(`/agents/${agent?.id}/manage`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to create agent')
    } finally {
      setIsProcessingContent(false)
    }
  }, [formData, prompt, router, user]) // --- Conditional Render / Loading State ---

  if (authLoading) {
    return (
      <LoadingState
        message='Loading...(Refresh the window if delayed)'
        className='min-h-screen'
      />
    )
  }

  // 🧱 The rest of the JSX (UI) stays identical to yours
  // just replace dynamic handlers with optimized versions above
  return (
    <>
      <NeonBackground />
      {isProcessingContent && (
        <LoadingState message='Processing knowledge base...' />
      )}

      <div className='flex h-screen w-full flex-row font-mono text-neutral-100'>
        <div className='custom-scrollbar relative flex-1 overflow-y-auto'>
          <div className='sticky top-0 z-10 flex h-16 items-center'>
            <NavigationBar
              profile={profile}
              message={message}
              onLogOutClick={logout}
            />
          </div>

          <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
            <div className='flex items-center justify-center space-x-8'>
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className='flex items-center justify-center'>
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
                      className={`tems-center mx-4 h-1 w-16 justify-center ${
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
            <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
              <Card>
                <div className='space-y-6 p-6'>
                  <div>
                    <h2 className='text-xl font-semibold text-neutral-200'>
                      Basic{' '}
                      <span className='text-orange-500'> Information</span>
                    </h2>
                    <p className='text-white'>
                      Set up your agent&apos;s core details and personality.
                    </p>
                  </div>

                  <FormInput
                    label='Agent Name *'
                    className='mb-20 w-full'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    placeholder='Agent Name : ( E.g., Customer Support Assistant )'
                  />
                  <p className='text-white'>Choose domain.</p>
                  <div className='mb-20 grid grid-cols-2 gap-4 md:grid-cols-4'>
                    {DOMAINS.map((domain) => (
                      <button
                        key={domain.id}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            domain: domain.id
                          }))
                          setDomain(domain.prompt)
                        }}
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

                  <div>
                    <label className='mb-2 block text-sm font-medium text-neutral-300'>
                      Tone of Voice
                    </label>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      {TONES.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              tone: tone.id
                            }))
                          }
                          className={`rounded-lg border-2 p-4 text-left transition-all ${
                            formData.tone === tone.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          <div className='mb-1 font-medium text-neutral-200'>
                            {tone.name}
                          </div>
                          <div className='text-sm text-neutral-400'>
                            {tone.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className='flex justify-end'>
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!formData.name}
                    >
                      <div className='flex flex-row place-content-center justify-center'>
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

          {/* Step 2: Type of Agent */}
          {step === 2 && (
            <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
              <Card>
                <div>
                  <h2 className='text-xl font-semibold text-neutral-200'>
                    Knowledge <span className='text-orange-500'> Base</span>
                  </h2>
                  <p className='text-white'>
                    Scrpape websites... upload PDFs..
                  </p>
                </div>

                <div className='flex flex-col justify-center'>
                  <div className='flex w-full flex-row items-stretch justify-between'>
                    {/* Website Scraping */}
                    <div className='w-full space-y-4'>
                      <h3 className='mt-10 flex items-center gap-2 font-medium text-neutral-200'>
                        <LinkIcon className='h-4 w-4' />
                        Scrape website, attach a PDF
                      </h3>
                      <div className='mb-4 flex flex-col space-y-3'>
                        <div className='relative flex w-full cursor-pointer items-center rounded-lg p-2 transition-colors hover:border-neutral-600'>
                          <FormInput
                            type='url'
                            className='w-full pr-8'
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder='https://example.com'
                            id='websiteUrl'
                          />
                          <div
                            {...getRootProps({
                              onClick: (e) => e.preventDefault()
                            })}
                          >
                            <Paperclip className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 cursor-pointer text-gray-400' />
                            <input {...getInputProps()} />
                          </div>
                        </div>
                        <Button
                          onClick={handleAddWebsite}
                          disabled={authLoading || !websiteUrl}
                          variant='outline'
                        >
                          Scrape Website
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* 
                   
                 

              
              {/* Knowledge Sources List */}
                  <Card>
                    <div className='space-y-3 p-6'>
                      <h3 className='text-lg font-semibold text-neutral-200'>
                        Added Knowledge Bases
                      </h3>

                      <div className='max-h-[60vh] space-y-4 overflow-y-auto rounded-lg bg-neutral-800 p-4'>
                        {isProcessingContent ? (
                          <p className='animate-pulse text-neutral-400'>
                            Processing content, please wait...
                          </p>
                        ) : formData.knowledgeSources.length === 0 ? (
                          <p className='text-neutral-400'>
                            No content added yet.
                          </p>
                        ) : (
                          formData.knowledgeSources.map((source, index) => (
                            <div
                              key={source.id}
                              className='relative flex items-start justify-between rounded bg-neutral-700 p-3'
                            >
                              <div className='flex items-start space-x-3'>
                                {/* Icon based on type */}
                                {source.type === 'url' && (
                                  <LinkIcon className='mt-1 h-5 w-5 text-blue-500' />
                                )}
                                {source.type === 'pdf' && (
                                  <FileText className='mt-1 h-5 w-5 text-orange-500' />
                                )}
                                {source.type === 'text' && (
                                  <FileText className='mt-1 h-5 w-5 text-neutral-500' />
                                )}

                                <div className='truncate'>
                                  <p className='mb-1 font-semibold text-neutral-200'>
                                    {source.type === 'url'
                                      ? `Website: ${source.name}`
                                      : source.type === 'pdf'
                                        ? `PDF: ${source.name}`
                                        : 'Content:'}
                                  </p>
                                  <p className='whitespace-pre-line text-neutral-200'>
                                    {source.summary}
                                  </p>
                                </div>
                              </div>

                              {/* Remove button */}
                              <Button
                                onClick={() => removeKnowledgeSource(source.id)}
                                className='ml-4 text-sm text-orange-400 hover:text-orange-300'
                                variant='ghost'
                              >
                                Remove
                              </Button>

                              {/* Line separator, except for last item */}
                              {index !==
                                formData.knowledgeSources.length - 1 && (
                                <hr className='absolute right-4 bottom-0 left-4 border-neutral-600' />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </Card>

                  <div className='mt-4 flex justify-between'>
                    <Button onClick={() => setStep(1)}>
                      <div className='flex flex-row place-content-center justify-center'>
                        <CircleArrowLeft
                          className={`mx-auto mr-2 h-8 w-8 text-white`}
                        />
                        Previous
                      </div>
                    </Button>
                    <Button onClick={() => setStep(3)}>
                      <div className='flex flex-row place-content-center justify-center'>
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

          {step === 3 && (
            <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
              <Card>
                <div className='space-y-6 p-6'>
                  <div>
                    <h2 className='text-xl font-semibold text-neutral-200'>
                      Review Your Agent
                    </h2>
                    <p className='text-neutral-400'>
                      Make sure everything looks correct before creating your
                      agent?.
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
                            <span className='font-medium'>{formData.name}</span>
                          </div> 
                          <div>
                            <span className='text-neutral-400'>Domain:</span>
                            <span className='font-medium'> {DOMAINS.find((d) => d.id === formData.domain)
                                ?.name || 'N/A'}</span>
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
                            formData.knowledgeSources.map((source, index) => (
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
                                {source.type === 'text' && (
                                  <FileText className='h-4 w-4 text-neutral-500' />
                                )}
                                <span>{source.name}</span>
                              </div>
                            ))
                          ) : (
                            <p className='text-neutral-500 italic'>
                              No knowledge bases added
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className='mb-2 font-medium text-neutral-200'>
                        Generated System Prompt
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
                          <pre className='font-mono text-sm whitespace-pre-wrap text-neutral-300'>
                            {prompt}
                          </pre>
                        )}

                        {promptError && (
                          <p className='mt-2 text-sm text-orange-400'>
                            {promptError}
                          </p>
                        )}

                        <div className='mt-2 flex justify-end gap-2'>
                          {isEditing ? (
                            <>
                              <Button onClick={handlePromptSave}>Save</Button>
                              <Button
                                variant='secondary'
                                onClick={() => {
                                  setDraft(prompt) // restore original
                                  setIsEditing(false)
                                  setError('')
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button onClick={() => setIsEditing(true)}>
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-between'>
                    <Button onClick={() => setStep(2)} variant='outline'>
                      <div className='flex flex-row items-center justify-center'>
                        <CircleArrowLeft
                          className={`mr-2 h-5 w-5 text-white`}
                        />
                        Previous
                      </div>
                    </Button>
                    <div className='flex space-x-3'>
                      <Button
                        onClick={() => {
                          // Save as draft logic here
                          toast.success('Agent saved as draft!')
                        }}
                        variant='outline'
                      >
                        <div className='flex flex-row items-center justify-center'>
                          <Save className='mr-2 h-4 w-4' />
                          Save Draft
                        </div>
                      </Button>
                      <Button onClick={handleSave} disabled={authLoading}>
                        <div className='flex flex-row items-center justify-center'>
                          {authLoading ? (
                            'Creating...'
                          ) : (
                            <>
                              <Aperture className='mr-2 h-4 w-4' />
                              Create Agent
                            </>
                          )}
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// 🧠 Optimized prompt generator
function generateSystemPrompt(formData, domain) {
  return `Your name is ${formData.name}. You are an AI ${domain} assistant with a ${formData.tone} tone.
 
Knowledge Base:
${formData.knowledgeSources.map((s) => s.summary).join('\n')}
Always stay accurate and in character.`
}
