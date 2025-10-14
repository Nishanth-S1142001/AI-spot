'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useAuth } from '../../../../components/providers/AuthProvider'
import FormTextarea from '../../../../components/ui/textBox'
import Button from '../../../../components/ui/button'
import Card from '../../../../components/ui/card'
import FormInput from '../../../../components/ui/formInputField'
import { dbClient } from '../../../../lib/supabase/dbClient'
import { addKnowledgeSource, updateAgent } from '../../../actions/agents'
import LoadingState from '../../../../components/common/loading-state'
import {
  Aperture,
  ArrowLeft,
  CircleArrowLeft,
  CircleArrowRightIcon,
  Globe,
  Save
} from 'lucide-react'
import NeonBackground from '../../../../components/ui/background'

export default function EditAgent() {
  const { id } = useParams()
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    domain: '',
    persona: '',
    tone: 'friendly',

    sys_prompt: ''
  })
  const [fetching, setFetching] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [knowledgeText, setKnowledgeText] = useState('')
  const [agent, setAgent] = useState(null)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [scrapedSummary, setScrapedSummary] = useState([])
  const [knowledgeSources, setKnowledgeSources] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const purposes = [
    { id: 'website', name: 'Website', icon: Globe, color: 'gray' }
  ]

  const tones = [
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

  // const functionality = [
  //   {
  //     id: 'calendar',
  //     name: 'Calendar Booking',
  //     icon: Calendar,
  //     color: 'gray',
  //     description:
  //       'Add a calendar widget to your Aperture to book events, or meetings....'
  //   },
  //   {
  //     id: 'none',
  //     name: 'None',
  //     icon: Ban,
  //     color: 'gray',
  //     description: 'I will pass....'
  //   }
  // ]

  const domain = [
    {
      id: 'business',
      name: 'Business',
      prompt: `You are a strategic business consultant AI with deep knowledge in entrepreneurship, management, and corporate strategy.
Your goal is to help users plan, launch, and grow businesses effectively.
Analyze problems carefully and provide actionable recommendations that are realistic and implementable.
Offer frameworks, best practices, and examples from successful businesses.
Help with market research, competitive analysis, and operational optimization.
Guide users on branding, positioning, and customer acquisition strategies.
Use a professional and confident tone in all responses.
Prioritize clarity, structure, and step-by-step guidance.
Encourage users to think critically and make informed decisions.
Provide insights that blend innovation with practical business acumen.`
    },
    {
      id: 'sales',
      name: 'Sales',
      prompt: `You are an AI sales strategist and performance coach.
Your primary goal is to help users increase sales conversions and revenue.
Offer guidance on crafting persuasive pitches, proposals, and cold emails.
Provide strategies for lead generation, follow-ups, and nurturing relationships.
Teach how to handle objections and close deals effectively.
Offer practical examples and templates for scripts and presentations.
Use a motivating and confident tone to inspire action.
Highlight psychological principles and sales techniques behind each strategy.
Encourage measurable goals and tracking of sales performance.
Always focus on actionable steps that can improve results immediately.`
    },
    {
      id: 'creator',
      name: 'Creator',
      prompt: `You are an AI content creator and digital strategist.
Your purpose is to help users generate viral content, engaging scripts, and creative ideas.
Focus on platforms like YouTube, Instagram, TikTok, and podcasts.
Help users develop storytelling frameworks and content structures that capture attention.
Suggest catchy headlines, hooks, and captions to maximize engagement.
Provide ideas for trends, challenges, or series to grow an audience.
Maintain a creative, energetic, and inspiring tone.
Include examples of successful content strategies where relevant.
Encourage experimentation, iteration, and continuous improvement.
Always think from the audience’s perspective to maximize impact.`
    },
    {
      id: 'developer',
      name: 'Developer',
      prompt: `You are an expert AI developer specializing in full-stack solutions.
Help users write, debug, and optimize code efficiently and securely.
Provide explanations and reasoning for every suggestion or solution.
Recommend best practices for software architecture, scalability, and performance.
Offer examples in multiple programming languages where appropriate.
Guide users step-by-step through technical challenges and problem-solving.
Keep a mentor-like tone: informative, patient, and precise.
Encourage clean, modular, and maintainable code.
Stay up-to-date with modern frameworks, tools, and development trends.
Focus on helping users learn and grow as developers while solving real problems.`
    },
    {
      id: 'supoortservice',
      name: 'Support & Service',
      prompt: `You are a friendly, empathetic, and professional customer support AI.
Your goal is to understand user issues clearly and resolve them efficiently.
Always confirm understanding before providing solutions.
Offer step-by-step guidance to fix problems or complete tasks.
Use polite, clear, and positive language at all times.
Provide alternative options if the first solution does not work.
Maintain a patient and approachable tone.
Handle complaints calmly and provide reassurance when needed.
Focus on creating a helpful and satisfying experience for the user.
Keep responses structured, concise, and easy to follow.`
    },
    {
      id: 'financial',
      name: 'Financial',
      prompt: `You are an AI financial advisor with expertise in personal and corporate finance.
Help users understand complex financial concepts in simple terms.
Provide guidance on budgeting, saving, investing, and wealth management.
Offer strategies for risk management, taxes, and financial planning.
Provide comparisons, case studies, and data-driven insights.
Suggest actionable steps to improve financial health and performance.
Maintain a trustworthy, analytical, and professional tone.
Explain the reasoning behind each recommendation clearly.
Help users make informed financial decisions with confidence.
Ensure accuracy and clarity in all financial guidance and advice.`
    },
    {
      id: 'research',
      name: 'Research',
      prompt: `You are an AI research analyst with expertise in data collection, analysis, and synthesis.
Help users gather credible information from multiple sources.
Summarize findings in a clear, structured, and logical manner.
Provide key insights, trends, and actionable takeaways.
Include references, citations, or sources wherever possible.
Analyze data objectively and avoid personal bias.
Assist with academic research, market research, and professional reports.
Maintain a professional, factual, and analytical tone.
Offer guidance on methodologies and best practices for research.
Help users draw meaningful conclusions and make data-driven decisions.`
    }
  ]
  const generateSystemPrompt = () => {
    const purposeInstructions = {
      website:
        'You are a website customer support agent?. Answer questions and provide assistance to website visitors.'
    }

    // ✅ Find the domain object based on selected ID
    const selectedDomain = domain.find((d) => d.id === formData.domain)

    return `
Your name is ${formData.name}.
You are an AI ${selectedDomain?.name || formData.domain} assistant with a ${formData.tone} tone.
${formData.persona ? `Your personality: ${formData.persona}.` : ''}
${purposeInstructions[formData.purpose] || ''}

Always be helpful, accurate, and stay in character.
Additional optional information:
${selectedDomain ? selectedDomain.prompt : ''}
`
  }

  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState(prompt)
  const [promptError, setPromptError] = useState('')
  const [newKnowledge, setNewKnowledge] = useState({
    type: 'text',
    content: '',
    url: ''
  })

  useEffect(() => {
    if (id && user) {
      fetchAgent()
    }
  }, [id, user])

  const fetchAgent = async () => {
    try {
      setFetching(true)
      const agentData = await dbClient.getAgent(id)

      if (!agentData) {
        toast.error('Agent not found')
        router.push('/agents')
        return
      }

      setAgent(agentData)
      setFormData({
        name: agentData.name || '',

        domain: agentData.domain || '',
        purpose: agentData.purpose || 'website',
        persona: agentData.persona || '',
        tone: agentData.tone || 'friendly',
        system_prompt: agentData.system_prompt || ''
      })
      // setKnowledgeSources(agentData.knowledge_sources || [])
    } catch (error) {
      console.error('Error fetching agent:', error)
      toast.error('Failed to load agent')
      router.push('/agents')
    } finally {
      setFetching(false)
    }
  }

  // for pdf summarization
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0]
    console.log(file)
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload PDF files only')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    try {
      setUploading(true)

      // Convert PDF to ArrayBuffer

      const formData = new FormData()
      formData.append('pdf', file)

      // Send to API for text extraction & summary
      const response = await fetch('/api/pdf-summarize', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('PDF processing failed')

      const data = await response.json()

      const source = {
        id: Date.now(),
        type: 'pdf',
        name: file.name,
        content: data.content,
        summary: data.summary || data.content
      }
      const newKnowledgeSource = await addKnowledgeSource(id, {
        source_type: 'pdf',
        file_name: file.name,
        content: processedContent,
        summary: summary,
        status: 'completed'
      })
      setKnowledgeSources((prev) => [...prev, newKnowledgeSource])

      toast.success('PDF uploaded and processed successfully!')
    } catch (error) {
      console.error('Error processing PDF:', error)
      toast.error('Failed to process PDF')
    } finally {
      setFetching(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const handleAddWebsite = async () => {
    if (!websiteUrl) {
      toast.error('Please enter a website URL')
      return
    }

    try {
      setFetching(true)

      const response = await fetch('/api/url-scrape_summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      })

      if (!response.ok) throw new Error('Failed to scrape website')

      const data = await response.json()

      const knowledgeSource = await addKnowledgeSource(id, {
        source_type: 'url',
        source_url: websiteUrl,
        content: data.content,
        summary: data.summary,
        status: 'completed'
      })
      setKnowledgeSources((prev) => [...prev, knowledgeSource])

      setScrapedSummary((prev) => [...prev, source])

      setWebsiteUrl('')
      toast.success('Website content added successfully!')
    } catch (error) {
      console.error('Error scraping website:', error)
      toast.error('Failed to scrape website content')
    } finally {
      setUploading(false)
    }
  }

  const handleAddText = () => {
    if (!knowledgeText.trim()) {
      toast.error('Please enter some text content')
      return
    }

    const source = {
      id: Date.now(),
      type: 'text',
      name: 'Custom Text',
      content: knowledgeText,
      summary: knowledgeText
    }

    setFormData((prev) => ({
      ...prev,
      knowledgeSources: [...prev.knowledgeSources, source]
    }))

    setKnowledgeText('')
    toast.success('Text content added successfully!')
  }

  const removeKnowledgeSource = (id) => {
    setFormData((prev) => ({
      ...prev,
      knowledgeSources: prev.knowledgeSources.filter(
        (source) => source.id !== id
      )
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter an agent name')
      return
    }

    try {
      setSaving(true)
      console.log('Update the agent')

      // Update the agent
      const updates = {
        ...formData,
        updated_at: new Date().toISOString()
      }

      await updateAgent(id, updates)
      toast.success('Agent updated successfully!')
      console.log('agentData', agent, 'userid', user.id)
      router.push(`/agents/${agent?.id}`)
    } catch (error) {
      console.error('Error updating agent:', error)
      toast.error('Failed to update agent')
    } finally {
      setSaving(false)
    }
  }
  useEffect(() => {
    if (step === 3) {
      const generated = generateSystemPrompt()
      setPrompt(generated)
      setDraft(generated)
    }
  }, [formData, step])

  if (loading) {
    return (
      <LoadingState
        message='Loading... (Refresh the window if delayed)'
        className='min-h-screen'
      />
    )
  }
  //This will generate system prompt

  const validatePrompt = (text) => {
    const trimmedText = text.trim()
    if (!trimmedText) return false // empty
    if (trimmedText.length < 10) return false // too short
    if (trimmedText.split(/\s+/).length < 3) return false // too few words
    if (/^(.)\1+$/.test(trimmedText)) return false // single char spam
    if (/^[0-9\W]+$/.test(trimmedText)) return false // only numbers/punct
    const blacklist = ['test', 'blah', 'asdf', 'prompt', 'write here']
    if (blacklist.includes(trimmedText.toLowerCase())) return false // meaningless
    return true
  }

  const handlePromptSave = () => {
    if (validatePrompt(draft)) {
      setPrompt(draft)
      setIsEditing(false)
      setPromptError('')
    } else {
      setPromptError(
        '⚠ Please type a meaningful prompt or use the system-generated one.'
      )
      setPrompt(generateSystemPrompt()) // fallback
      setIsEditing(false)
    }
  }

  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-row font-mono text-neutral-100'>
        <div className='custom-scrollbar relative flex-1 overflow-y-auto'>
          {/* Header */}

          <div className='mx-4 mb-5 flex h-16 items-center border-b border-neutral-700'>
            {/* Progress Steps */}

            <div className='flex items-center justify-start'>
              <Button onClick={() => router.back()}>
                <ArrowLeft className='h-4 w-4' />
              </Button>
            </div>

            <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
              <div className='flex items-center justify-center space-x-8'>
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className='flex items-center'>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                        step >= stepNum
                          ? 'bg-neutral-400 text-white'
                          : 'bg-neutral-700 text-neutral-400'
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
                      Update your agent&apos;s core details and personality.
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
                  />
                  <p className='text-white'>Choose domain.</p>
                  <div className='mb-20 grid grid-cols-2 gap-4 md:grid-cols-4'>
                    {domain.map((domain) => (
                      <button
                        key={domain.id}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            domain: domain.id
                          }))
                        }
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

                  <FormTextarea
                    type='textarea'
                    label='Personality & Persona'
                    className='w-full'
                    value={formData.persona}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        persona: e.target.value
                      }))
                    }
                    placeholder="Describe your agent's personality or expertise, or how it should behave..."
                    rows={4}
                  />

                  <div className='flex justify-end'>
                    <Button onClick={() => setStep(2)}>
                      <div className='flex flex-row place-content-center justify-center'>
                        Select Type
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
                <div className='space-y-6 p-6'>
                  <div>
                    <h2 className='text-xl font-semibold text-neutral-200'>
                      Type <span className='text-orange-500'> of Agent</span>
                    </h2>
                    <p className='text-white'>
                      Set up your agent's purpose, optional integrations and the
                      tone of your agent?.
                    </p>
                  </div>

                  {/* Purpose Selection */}
                  <div>
                    <label className='mb-2 block text-sm font-medium text-neutral-300'>
                      Purpose *
                    </label>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                      {purposes.map((purpose) => (
                        <button
                          key={purpose.id}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              purpose: purpose.id
                            }))
                          }
                          className={`rounded-lg border-2 p-4 transition-all ${
                            formData.purpose === purpose.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          <purpose.icon
                            className={`mx-auto mb-2 h-8 w-8 text-${purpose.color}-400`}
                          />
                          <div className='text-sm font-medium text-neutral-200'>
                            {purpose.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tone Selection */}
                  <div>
                    <label className='mb-2 block text-sm font-medium text-neutral-300'>
                      Tone of Voice
                    </label>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      {tones.map((tone) => (
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

                  <div className='flex justify-between'>
                    <Button onClick={() => setStep(1)}>
                      <div className='flex flex-row place-content-center justify-center'>
                        <CircleArrowLeft
                          className={`mx-auto mr-2 h-8 w-8 text-white`}
                        />
                        Basic Knowledge
                      </div>
                    </Button>
                    <Button
                      onClick={() => {
                        const generated = generateSystemPrompt()
                        setPrompt(generated)
                        setDraft(generated)
                        setStep(3)
                      }}
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

          {/* Step 3: Review */}

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
                            <span className='text-neutral-400'>Name:</span>{' '}
                            <span className='font-medium'>{formData.name}</span>
                          </div>
                          <div>
                            <span className='text-neutral-400'>Purpose:</span>{' '}
                            <span className='font-medium capitalize'>
                              {formData.purpose}
                            </span>
                          </div>
                          <div>
                            <span className='text-neutral-400'>Tone:</span>{' '}
                            <span className='font-medium capitalize'>
                              {formData.tone}
                            </span>
                          </div>
                          {formData.description && (
                            <div>
                              <span className='text-neutral-400'>
                                Description:
                              </span>{' '}
                              <span className='font-medium'>
                                {formData.description}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {formData.persona && (
                      <div>
                        <h3 className='mb-2 font-medium text-neutral-200'>
                          Personality
                        </h3>
                        <p className='rounded-lg bg-neutral-700 p-3 text-sm text-neutral-400'>
                          {formData.persona}
                        </p>
                      </div>
                    )}

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
                      <Button onClick={handleSave} disabled={loading}>
                        <div className='flex flex-row items-center justify-center'>
                          {loading ? (
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
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
