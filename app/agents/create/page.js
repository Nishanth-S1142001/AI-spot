'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../components/providers/AuthProvider'
import { dbClient } from '../../../lib/supabase/dbClient'
import { createAgent, addKnowledgeSource } from '../../actions/agents'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import Sidebar from '../../../components/sideBar'
import SubSidebar from '../../../components/subSideBar'
import Card from '../../../components/card'
import Button from '../../../components/button'
import FormInput from '../../../components/formInputField'
import hyperLink from '../../../components/hyperLinks'
import FormTextarea from '../../../components/textBox'
import { FilePond } from 'react-filepond'
import { menuItems } from '../../../config/menuconfig'
import {
  Bot,
  Paperclip,
  Upload,
  CircleArrowLeft,
  CircleArrowRightIcon,
  Ban,
  Link as LinkIcon,
  FileText,
  Instagram,
  MessageSquare,
  Calendar,
  Globe,
  ArrowLeft,
  Save,
  Smartphone,
  Eye,
  Plus,
  Settings,
  BarChart3,
  Zap,
  User,
  ChartNoAxesColumnIncreasing,
  TrendingUp,
  Activity,
  Home,
  Aperture
} from 'lucide-react'
import NeonBackground from '../../../components/background'
import { subMenuItems } from '../../../config/submenuconfig'

export default function CreateAgent() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: 'website',
    persona: '',
    functionality: '',
    tone: 'friendly',
    knowledgeSources: [],
    sys_prompt: ''
  })
  const [loading, setLoading] = useState(false)
  const [knowledgeText, setKnowledgeText] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [scrapedSummary, setScrapedSummary] = useState([])

  const purposes = [
    ,
    // {
    //   id: 'instagram',
    //   name: 'Instagram Bot',
    //   icon: Instagram,
    //   color: 'gray'
    // },
    // {
    //   id: 'messenger',
    //   name: 'Messenger Bot',
    //   icon: MessageSquare,
    //   color: 'gray'
    // },
    { id: 'website', name: 'Website Bot', icon: Globe, color: 'gray' }
    // { id: 'sms', name: 'SMS Bot', icon: Smartphone, color: 'gray' }
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

  const functionality = [
    {
      id: 'calendar',
      name: 'Calendar Booking',
      icon: Calendar,
      color: 'gray',
      description:
        'Add a calendar widget to your bot to book events, or meetings....'
    },
    {
      id: 'none',
      name: 'None',
      icon: Ban,
      color: 'gray',
      description: 'I will pass....'
    }
  ]

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
      setLoading(true)

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

      setFormData((prev) => ({
        ...prev,
        knowledgeSources: [...prev.knowledgeSources, source]
      }))

      toast.success('PDF uploaded and summarized successfully!')
    } catch (error) {
      console.error('Error processing PDF:', error)
      toast.error('Failed to process PDF')
    } finally {
      setLoading(false)
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
      setLoading(true)

      const response = await fetch('/api/url-scrape_summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      })

      if (!response.ok) throw new Error('Failed to scrape website')

      const data = await response.json()

      const source = {
        id: Date.now(),
        type: 'url',
        name: websiteUrl,
        content: data.content,
        summary: data.summary
      }
      setScrapedSummary((prev) => [...prev, source])

      setFormData((prev) => ({
        ...prev,
        knowledgeSources: [...prev.knowledgeSources, source]
      }))

      setWebsiteUrl('')
      toast.success('Website content added successfully!')
    } catch (error) {
      console.error('Error scraping website:', error)
      toast.error('Failed to scrape website content')
    } finally {
      setLoading(false)
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
      setLoading(true)
      console.log('Create the agent')

      // Create the agent
      const agentData = {
        name: formData.name,
        description: formData.description,
        purpose: formData.purpose,
        persona: formData.persona,
        functionality: formData.functionality,
        tone: formData.tone,
        system_prompt: prompt,
        knowledge_base: formData.knowledgeSources
          .map((s) => s.summary)
          .join('\n\n'),
        sandbox_url: `${process.env.NEXT_PUBLIC_APP_URL}/sandbox/${Date.now()}`
      }

      console.log('agentData', agentData, 'userid', user.id)
      let agent
      try {
        agent = await createAgent(user.id, agentData)
        console.log('Agent created:', agent)
      } catch (err) {
        console.error('Failed to create agent:', err)
        toast.error('Failed to create agent')
        setLoading(false)
        return
      }
      // Save knowledge sources
      for (const source of formData.knowledgeSources) {
        await addKnowledgeSource(agent.id, {
          source_type: source.type,
          source_url: source.type === 'url' ? source.name : null,
          file_name: source.type === 'pdf' ? source.name : null,
          content: source.content,
          summary: source.summary,
          status: 'completed'
        })
      }

      toast.success('Agent created successfully!')
      router.push(`/agents/${agent.id}`)
    } catch (error) {
      console.error('Error creating agent:', error)
      toast.error('Failed to create agent')
    } finally {
      setLoading(false)
    }
  }

 
   

  //This will generate system prompt
  const generateSystemPrompt = () => {
    const purposeInstructions = {
      // instagram:
      //   'You are an Instagram DM assistant. Respond to direct messages professionally and help users with their inquiries.',
      // messenger:
      //   'You are a Messenger chatbot. Provide helpful responses and guide users through conversations.',
      // sms: 'You are a SMS chatbot assistant.  Provide helpful responses and guide users through conversations.',
      website:
        'You are a website customer support agent. Answer questions and provide assistance to website visitors.'
    }

    return `You are an AI assistant with a ${formData.tone} tone. 
${formData.persona ? `Your personality: ${formData.persona}. ` : ''}${purposeInstructions[formData.purpose]}
Use the following knowledge base to answer questions:
${formData.knowledgeSources.map((s) => s.summary).join('\n')}
Always be helpful, accurate, and stay in character.`
  }
  const [isEditing, setIsEditing] = useState(false)
  const [prompt, setPrompt] = useState(generateSystemPrompt())
  const [draft, setDraft] = useState(prompt)
  const [promptError, setPromptError] = useState('')

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
      <div className='font-mono flex h-screen w-full flex-row text-neutral-100'>
        <Sidebar menuItems={menuItems} />
        <SubSidebar menuItems={subMenuItems} />

        <div className='custom-scrollbar relative flex-1 overflow-y-auto'>
          {/* Header */}

          <div className='mx-4 mb-5 flex h-16 items-center border-b border-neutral-700'>
            {/* Progress Steps */}

            <div className='flex justify-start items-center'>
              <Button onClick={() => router.back()}>
                <ArrowLeft className='h-4 w-4' />
              </Button>
            </div>

            <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
              <div className='flex items-center justify-center space-x-8'>
                {[1, 2, 3, 4].map((stepNum) => (
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
                    {stepNum < 4 && (
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
                      Basic Information
                    </h2>
                    <p className='text-neutral-400'>
                      Set up your agent&apos;s core details and personality.
                    </p>
                  </div>

                  <FormInput
                    label='Agent Name *'
                    className='w-full'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    placeholder='Agent Name : ( E.g., Customer Support Assistant )'
                  />

                  <FormTextarea
                    type='textarea'
                    label='Description'
                    className='w-full'
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value
                      }))
                    }
                    placeholder='Brief description of what this agent does...'
                    rows={3}
                  />

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
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!formData.name || !formData.purpose}
                    >
                      <div className='flex flex-row place-content-center justify-center'>
                        Select Type
                        <CircleArrowRightIcon
                          className={`mx-auto ml-2 h-8 w-8 text-neutral-900`}
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
                      Type of Agent
                    </h2>
                    <p className='text-neutral-400'>
                      Set up your agent's purpose, optional integrations and the
                      tone of your agent.
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

                  <div>
                    <label className='mb-2 block text-sm font-medium text-neutral-300'>
                      Optional Functionality
                    </label>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      {functionality.map((functionality) => (
                        <button
                          key={functionality.id}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              functionality: functionality.id
                            }))
                          }
                          className={`rounded-lg border-2 p-4 text-left transition-all ${
                            formData.functionality === functionality.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          <functionality.icon
                            className={`mx-auto mb-2 h-8 w-8 text-${functionality.color}-400`}
                          />
                          <div className='mb-1 text-center font-medium text-neutral-200'>
                            {functionality.name}
                          </div>
                          <div className='text-sm text-neutral-400'>
                            {functionality.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className='flex justify-between'>
                    <Button onClick={() => setStep(1)}>
                      <div className='flex flex-row place-content-center justify-center'>
                        <CircleArrowLeft
                          className={`mx-auto mr-2 h-8 w-8 text-neutral-900`}
                        />
                        Basic Knowledge
                      </div>
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!formData.functionality}
                    >
                      <div className='flex flex-row place-content-center justify-center'>
                        Knowledge Base
                        <CircleArrowRightIcon
                          className={`mx-auto ml-2 h-8 w-8 text-neutral-900`}
                        />
                      </div>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 3: Knowledge Base */}
          {step === 3 && (
            <Card className='mr-10 mb-10 ml-10'>
              <div>
                <h2 className='text-xl font-semibold text-neutral-200'>
                  Knowledge Base
                </h2>
                <p className='text-neutral-400'>
                  Train your agent with relevant information and context.
                </p>
                <p className='text-neutral-400'>
                  Upload a pdf, or scrape information from a website . . . . .
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
                        disabled={loading || !websiteUrl}
                        variant='outline'
                      >
                        Scrape Website
                      </Button>
                    </div>
                    {/* 
                    <div className='max-h-[60vh] overflow-y-auto rounded-lg bg-neutral-800 p-4'>
                      {loading ? (
                        <p className='animate-pulse text-neutral-400'>
                          Processing content, please wait...
                        </p>
                      ) : formData.knowledgeSources.length === 0 ? (
                        <p className='text-neutral-400'>
                          No content added yet.
                        </p>
                      ) : (
                        <p className='whitespace-pre-line text-neutral-200'>
                          {formData.knowledgeSources
                            .map(
                              (src) =>
                                `${src.type === 'url' ? 'Content from website:' : 'Content from PDF:'}\n${src.summary}`
                            )
                            .join('\n\n')}
                        </p>
                      )}
                    </div> */}
                  </div>
                </div>

                {/* Text Input */}
                {/* <div className='space-y-4'>
                  <h3 className='mt-20 flex items-center gap-2 font-medium text-neutral-200'>
                    <FileText className='h-4 w-4' />
                    Add Text
                  </h3>
                  <div className='flex flex-col space-y-3'>
                    <FormTextarea
                      className='w-full'
                      value={knowledgeText}
                      onChange={(e) => setKnowledgeText(e.target.value)}
                      placeholder='Paste or type information for your agent...'
                      rows={4}
                      id='knowledgeText'
                    />
                    <Button
                      onClick={handleAddText}
                      disabled={!knowledgeText.trim()}
                      variant='outline'
                    >
                      Add Text
                    </Button>
                  </div>
                </div> */}
              </div>

              {/* Knowledge Sources List */}
              {/* Knowledge Sources List */}
              <Card>
                <div className='space-y-3 p-6'>
                  <h3 className='text-lg font-semibold text-neutral-200'>
                    Added Knowledge Bases
                  </h3>

                  <div className='max-h-[60vh] space-y-4 overflow-y-auto rounded-lg bg-neutral-800 p-4'>
                    {loading ? (
                      <p className='animate-pulse text-neutral-400'>
                        Processing content, please wait...
                      </p>
                    ) : formData.knowledgeSources.length === 0 ? (
                      <p className='text-neutral-400'>No content added yet.</p>
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
                              <FileText className='mt-1 h-5 w-5 text-red-500' />
                            )}
                            {source.type === 'text' && (
                              <FileText className='mt-1 h-5 w-5 text-neutral-500' />
                            )}

                            <div>
                              <p className='mb-1 font-semibold text-neutral-200'>
                                {source.type === 'url'
                                  ? `Content from website: ${source.name}`
                                  : source.type === 'pdf'
                                    ? `Content from PDF: ${source.name}`
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
                            className='ml-4 text-sm text-red-400 hover:text-red-300'
                            variant='ghost'
                          >
                            Remove
                          </Button>

                          {/* Line separator, except for last item */}
                          {index !== formData.knowledgeSources.length - 1 && (
                            <hr className='absolute right-4 bottom-0 left-4 border-neutral-600' />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>

              <div className='mt-4 flex justify-between'>
                <Button onClick={() => setStep(2)}>
                  <div className='flex flex-row place-content-center justify-center'>
                    <CircleArrowLeft
                      className={`mx-auto mr-2 h-8 w-8 text-neutral-900`}
                    />
                    Type of Agent
                  </div>
                </Button>
                <Button onClick={() => setStep(4)}>
                  <div className='flex flex-row place-content-center justify-center'>
                    Review
                    <CircleArrowRightIcon
                      className={`mx-auto ml-2 h-8 w-8 text-neutral-900`}
                    />
                  </div>
                </Button>
              </div>
            </Card>
          )}

          {step === 4 && (
            <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
              <Card>
                <div className='space-y-6 p-6'>
                  <div>
                    <h2 className='text-xl font-semibold text-neutral-200'>
                      Review Your Agent
                    </h2>
                    <p className='text-neutral-400'>
                      Make sure everything looks correct before creating your
                      agent.
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
                                  <FileText className='h-4 w-4 text-red-500' />
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
                          <p className='mt-2 text-sm text-red-400'>
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
                    <Button onClick={() => setStep(3)} variant='outline'>
                      <div className='flex flex-row items-center justify-center'>
                        <CircleArrowLeft className={`mr-2 h-5 w-5`} />
                        Knowledge Base
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
                            'Creating...'
                          ) : (
                            <>
                              <Bot className='mr-2 h-4 w-4' />
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
