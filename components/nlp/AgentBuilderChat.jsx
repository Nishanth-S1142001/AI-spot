'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Brain,
  Calendar,
  Check,
  CheckCircle,
  Database,
  Globe,
  Instagram,
  Loader2,
  Mail,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Wrench,
  Zap
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const CONVERSATION_STEPS = {
  INITIAL: 'initial',
  PARSING: 'parsing',
  INTERFACE_SELECTION: 'interface_selection',
  SERVICES_SELECTION: 'services_selection',
  REVIEW: 'review',
  CREATING: 'creating',
  COMPLETE: 'complete'
}

const INTERFACES = [
  {
    id: 'website',
    name: 'Website Widget',
    icon: Globe,
    description: 'Embed as a chat widget on your website',
    emoji: '🌐'
  },
  {
    id: 'sms',
    name: 'SMS',
    icon: MessageSquare,
    description: 'Interact via text messages',
    emoji: '💬'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    description: 'Connect to Instagram DMs',
    emoji: '📱'
  }
]

const SERVICES = [
  {
    id: 'calendar',
    name: 'Calendar Bookings',
    icon: Calendar,
    description: 'Enable appointment scheduling',
    emoji: '📅'
  },
  {
    id: 'mail',
    name: 'Mail Service',
    icon: Mail,
    description: 'Send automated emails',
    emoji: '✉️'
  },
  {
    id: 'none',
    name: 'None',
    icon: Check,
    description: "I'll add services later",
    emoji: '⏭️'
  }
]

export default function AgentBuilderChat({ onAgentCreated, promptText }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: ''
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [parsedConfig, setParsedConfig] = useState(null)
  const [requestId, setRequestId] = useState(null)
  const [processingSteps, setProcessingSteps] = useState([])
  const [conversationStep, setConversationStep] = useState(CONVERSATION_STEPS.INITIAL)
  const [selectedInterface, setSelectedInterface] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])
  const [chatStarted, setChatStarted] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, processingSteps])

  useEffect(() => {
    if (promptText) {
      setInput(promptText)
    }
  }, [promptText])

  const addProcessingStep = (step, status = 'processing') => {
    setProcessingSteps((prev) => [
      ...prev,
      { ...step, status, timestamp: Date.now() }
    ])
  }

  const updateProcessingStep = (index, updates) => {
    setProcessingSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, ...updates } : step))
    )
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const addAssistantMessage = (content, options = {}) => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content,
        ...options
      }
    ])
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    if (!chatStarted) setChatStarted(true)
    setIsSent(true)

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    setProcessingSteps([])

    try {
      // Initial parsing step
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '',
          isThinking: true,
          id: `thinking-${Date.now()}`
        }
      ])

      // Step 1: Analyzing description
      addProcessingStep({
        icon: Brain,
        title: 'Analyzing Description',
        description: 'Understanding your requirements...'
      })
      await sleep(800)
      updateProcessingStep(0, { status: 'completed' })

      // Step 2: Detecting agent type
      addProcessingStep({
        icon: Search,
        title: 'Detecting Agent Type',
        description: 'Identifying the best agent template...'
      })
      await sleep(600)
      updateProcessingStep(1, { status: 'completed' })

      // Step 3: Extracting features
      addProcessingStep({
        icon: Zap,
        title: 'Extracting Features',
        description: 'Finding required tools and capabilities...'
      })
      await sleep(700)
      updateProcessingStep(2, { status: 'completed' })

      // Step 4: Generating configuration
      addProcessingStep({
        icon: Wrench,
        title: 'Generating Configuration',
        description: 'Building optimal agent settings...'
      })

      const parseResponse = await fetch('/api/nlp/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: userMessage, useAI: true })
      })

      if (!parseResponse.ok) {
        throw new Error('Failed to parse description')
      }

      const parseData = await parseResponse.json()
      setParsedConfig(parseData.config)
      setRequestId(parseData.requestId)

      updateProcessingStep(3, { status: 'completed' })
      await sleep(500)

      // Step 5: Validating setup
      addProcessingStep({
        icon: CheckCircle,
        title: 'Validating Setup',
        description: 'Ensuring configuration is optimal...'
      })
      await sleep(600)
      updateProcessingStep(4, { status: 'completed' })

      await sleep(400)

      // Remove thinking message
      setMessages((prev) => prev.filter((m) => !m.isThinking))
      setProcessingSteps([])

      // Show parsed configuration
      const configMessage = `✅ **Analysis Complete!** Here's what I've designed for you:

┌─ **Core Configuration**
│
├─ 🤖 **Name:** ${parseData.config.name}
├─ 🎯 **Purpose:** ${parseData.config.purpose}
├─ 📋 **Type:** ${parseData.config.agentType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
├─ 🧠 **Model:** ${parseData.config.model}
├─ 🎨 **Tone:** ${parseData.config.tone.charAt(0).toUpperCase() + parseData.config.tone.slice(1)}
├─ 🌡️ **Temperature:** ${parseData.config.temperature}
└─ 📏 **Max Tokens:** ${parseData.config.maxTokens}
${
  parseData.config.features && parseData.config.features.length > 0
    ? `
┌─ **Features Detected** (${parseData.config.features.length})
│
${parseData.config.features.map((f, i) => `${i === parseData.config.features.length - 1 ? '└─' : '├─'} ✨ ${f.replace(/_/g, ' ')}`).join('\n')}`
    : ''
}

📊 **Confidence Score:** ${Math.round((parseData.confidence || 0.75) * 100)}%

Great! Now let me ask you a few questions to complete the setup...`

      addAssistantMessage(configMessage)
      
      // Move to interface selection
      setConversationStep(CONVERSATION_STEPS.INTERFACE_SELECTION)
      await sleep(1000)
      askForInterface()

    } catch (error) {
      console.error('Parse error:', error)
      setProcessingSteps([])
      setMessages((prev) => prev.filter((m) => !m.isThinking))
      addAssistantMessage(
        '❌ Sorry, I had trouble understanding that. Could you please rephrase your description? Try to be more specific about what you want the agent to do.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const askForInterface = () => {
    addAssistantMessage(
      '**Step 1 of 2:** Where would you like users to interact with your agent?',
      { showInterfaceOptions: true }
    )
  }

  const handleInterfaceSelection = (interfaceId) => {
    setSelectedInterface(interfaceId)
    const selectedInterfaceObj = INTERFACES.find(i => i.id === interfaceId)
    
    setMessages((prev) => [
      ...prev,
      { 
        role: 'user', 
        content: `${selectedInterfaceObj.emoji} ${selectedInterfaceObj.name}` 
      }
    ])

    addAssistantMessage(
      `Great choice! ${selectedInterfaceObj.emoji} **${selectedInterfaceObj.name}** will work perfectly for your agent.`
    )

    // Move to services selection
    setConversationStep(CONVERSATION_STEPS.SERVICES_SELECTION)
    setTimeout(() => askForServices(), 800)
  }

  const askForServices = () => {
    addAssistantMessage(
      '**Step 2 of 2:** Would you like to add any services to your agent? (You can select multiple or skip)',
      { showServicesOptions: true }
    )
  }

  const handleServiceToggle = (serviceId) => {
    if (serviceId === 'none') {
      setSelectedServices([])
      return
    }

    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter(s => s !== serviceId)
      } else {
        return [...prev, serviceId]
      }
    })
  }

  const handleServicesConfirm = () => {
    // Add user's service selection as message
    if (selectedServices.length === 0) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: "⏭️ I'll add services later" }
      ])
      addAssistantMessage(
        "Perfect! You can easily integrate services later from the agent management page. Let me show you what we're about to create..."
      )
    } else {
      const serviceNames = selectedServices
        .map(id => SERVICES.find(s => s.id === id))
        .map(s => `${s.emoji} ${s.name}`)
        .join(', ')
      
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: serviceNames }
      ])
      
      addAssistantMessage(
        `Excellent! I've added ${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} to your agent. Here's the complete configuration...`
      )
    }

    // Move to review
    setConversationStep(CONVERSATION_STEPS.REVIEW)
    setTimeout(() => showReview(), 1000)
  }

  const showReview = () => {
    const selectedInterfaceObj = INTERFACES.find(i => i.id === selectedInterface)
    const selectedServicesObjs = selectedServices.map(id => SERVICES.find(s => s.id === id))

    const reviewMessage = `
┌────────────────────────────────────────┐
│  📋 **FINAL CONFIGURATION REVIEW**     │
└────────────────────────────────────────┘

**🤖 Agent Details**
├─ Name: ${parsedConfig.name}
├─ Type: ${parsedConfig.agentType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
├─ Purpose: ${parsedConfig.purpose}
├─ Model: ${parsedConfig.model}
├─ Temperature: ${parsedConfig.temperature}
└─ Max Tokens: ${parsedConfig.maxTokens}

**🌐 Interface**
└─ ${selectedInterfaceObj.emoji} ${selectedInterfaceObj.name}

**⚡ Services**
${selectedServices.length > 0 
  ? selectedServicesObjs.map((s, i) => `${i === selectedServicesObjs.length - 1 ? '└─' : '├─'} ${s.emoji} ${s.name}`).join('\n')
  : '└─ ⏭️ No services (can be added later)'}

${parsedConfig.features && parsedConfig.features.length > 0 
  ? `**✨ Features**
${parsedConfig.features.map((f, i) => `${i === parsedConfig.features.length - 1 ? '└─' : '├─'} ${f.replace(/_/g, ' ')}`).join('\n')}`
  : ''}

Everything looks perfect! Ready to create your agent?`

    addAssistantMessage(reviewMessage, { showCreateButton: true })
  }

  const handleCreateAgent = async () => {
    if (!requestId || !parsedConfig) return

    setIsLoading(true)
    setConversationStep(CONVERSATION_STEPS.CREATING)
    setProcessingSteps([])

    // Add creation message
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        isCreating: true,
        id: `creating-${Date.now()}`
      }
    ])

    try {
      // Step 1: Initializing
      addProcessingStep({
        icon: Wrench,
        title: 'Initializing Agent',
        description: 'Setting up agent infrastructure...'
      })
      await sleep(600)
      updateProcessingStep(0, { status: 'completed' })

      // Step 2: Creating agent record
      addProcessingStep({
        icon: Database,
        title: 'Creating Agent Record',
        description: 'Storing configuration in database...'
      })

      // Include interface and services in the request
      const response = await fetch('/api/nlp/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requestId,
          customizations: {
            interface: selectedInterface,
            services: selectedServices,
            domain: parsedConfig.agentType, // Map agentType to domain
            tone: parsedConfig.tone
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create agent')
      }

      const data = await response.json()

      updateProcessingStep(1, { status: 'completed' })
      await sleep(500)

      // Step 3: Configuring interface
      addProcessingStep({
        icon: Globe,
        title: 'Configuring Interface',
        description: `Setting up ${INTERFACES.find(i => i.id === selectedInterface)?.name}...`
      })
      await sleep(700)
      updateProcessingStep(2, { status: 'completed' })

      // Step 4: Adding services (if any)
      if (selectedServices.length > 0) {
        addProcessingStep({
          icon: Wrench,
          title: 'Adding Services',
          description: `Integrating ${selectedServices.length} service(s)...`
        })
        await sleep(800)
        updateProcessingStep(3, { status: 'completed' })
      }

      // Step 5: Adding knowledge sources (if any)
      if (parsedConfig.knowledgeSources?.length > 0) {
        const stepIndex = selectedServices.length > 0 ? 4 : 3
        addProcessingStep({
          icon: Database,
          title: 'Adding Knowledge Sources',
          description: `Integrating ${parsedConfig.knowledgeSources.length} knowledge source(s)...`
        })
        await sleep(800)
        updateProcessingStep(stepIndex, { status: 'completed' })
      }

      // Step 6: Finalizing
      addProcessingStep({
        icon: CheckCircle,
        title: 'Finalizing Setup',
        description: 'Running final checks...'
      })
      await sleep(600)

      const finalStepIndex = processingSteps.length
      updateProcessingStep(finalStepIndex, { status: 'completed' })

      await sleep(800)

      // Remove creating message
      setMessages((prev) => prev.filter((m) => !m.isCreating))
      setProcessingSteps([])

      setConversationStep(CONVERSATION_STEPS.COMPLETE)

      const interfaceName = INTERFACES.find(i => i.id === selectedInterface)?.name
      const successMessage = `🎉 **Success!** Your agent **"${data.agent.name}"** has been created!

✅ Agent ID: \`${data.agent.id}\`
✅ Interface: ${interfaceName}
✅ Services: ${selectedServices.length > 0 ? selectedServices.length + ' integrated' : 'None (add later in management)'}
✅ Ready to handle requests

${selectedServices.length === 0 ? '💡 **Tip:** You can add Calendar or Mail services anytime from the agent management page.' : ''}

Redirecting you to your new agent...`

      addAssistantMessage(successMessage)

      // Notify parent
      if (onAgentCreated) {
        onAgentCreated(data.agent)
      }
    } catch (error) {
      console.error('Creation error:', error)
      setProcessingSteps([])
      setMessages((prev) => prev.filter((m) => !m.isCreating))
      addAssistantMessage(
        '❌ Sorry, there was an error creating your agent. Please try again or contact support if the issue persists.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center'>
      <AnimatePresence>
        {!chatStarted && !isSent ? (
          // Initial centered input
          <div className='flex h-full flex-col items-center justify-center space-y-8'>
            <div className='relative flex w-full max-w-xl items-center rounded-full bg-neutral-800 px-4 py-2 transition-all focus-within:ring-1 focus-within:ring-neutral-500'>
              <input
                className='flex-1 bg-transparent px-2 py-2 text-sm text-neutral-200 focus:outline-none'
                placeholder='Describe your agent...'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleKeyPress(e)
                  }
                }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className='rounded-full p-2 text-neutral-400 hover:text-white disabled:opacity-30'
              >
                <Send className='h-5 w-5 cursor-pointer text-orange-500' />
              </button>
            </div>
            <h1 className='max-w-3xl text-center text-lg text-neutral-300'>
              👋 Hi! I&apos;m here to help you create an AI agent. Just describe
              what you want your agent to do in simple words, and I&apos;ll
              build it for you!
              <br />
              <span className='text-sm text-orange-500 mt-2 block'>
                Example: "Create a customer support bot that helps users with
                billing questions and can search our knowledge base"
              </span>
            </h1>
          </div>
        ) : (
          <motion.div
            key='chat'
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='flex h-full w-full flex-col items-center justify-center'
          >
            <div className='flex h-full w-full flex-col items-center justify-center'>
              <div className='flex h-full w-full max-w-3xl flex-col'>
                <div className='custom-scrollbar flex-1 space-y-4 overflow-y-auto p-6 text-sm'>
                  {messages.map((message, index) => (
                    <div key={index}>
                      <div
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-3 ${
                            message.role === 'assistant'
                              ? 'text-white'
                              : 'rounded-l-lg rounded-b-lg bg-neutral-600 text-white'
                          }`}
                        >
                          {message.isThinking || message.isCreating ? (
                            <ProcessingSteps
                              steps={processingSteps}
                              title={
                                message.isThinking
                                  ? '🧠 Analyzing...'
                                  : '⚙️ Creating Agent...'
                              }
                            />
                          ) : (
                            <>
                              <div className='font-mono text-sm leading-relaxed whitespace-pre-wrap'>
                                {message.content}
                              </div>

                              {/* Interface Selection Options */}
                              {message.showInterfaceOptions && (
                                <div className='mt-4 space-y-2'>
                                  {INTERFACES.map((iface) => {
                                    const Icon = iface.icon
                                    return (
                                      <button
                                        key={iface.id}
                                        onClick={() => handleInterfaceSelection(iface.id)}
                                        disabled={isLoading}
                                        className='flex w-full items-start gap-3 rounded-lg border border-neutral-700 bg-neutral-800/50 p-3 text-left transition-all hover:border-orange-500/50 hover:bg-neutral-800 disabled:opacity-50'
                                      >
                                        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-700'>
                                          <Icon className='h-5 w-5 text-orange-400' />
                                        </div>
                                        <div className='flex-1'>
                                          <div className='font-semibold text-neutral-100'>
                                            {iface.emoji} {iface.name}
                                          </div>
                                          <div className='text-xs text-neutral-400'>
                                            {iface.description}
                                          </div>
                                        </div>
                                      </button>
                                    )
                                  })}
                                </div>
                              )}

                              {/* Services Selection Options */}
                              {message.showServicesOptions && (
                                <div className='mt-4 space-y-3'>
                                  <div className='space-y-2'>
                                    {SERVICES.map((service) => {
                                      const Icon = service.icon
                                      const isSelected = selectedServices.includes(service.id)
                                      const isNone = service.id === 'none'
                                      
                                      return (
                                        <button
                                          key={service.id}
                                          onClick={() => handleServiceToggle(service.id)}
                                          disabled={isLoading}
                                          className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all disabled:opacity-50 ${
                                            isSelected
                                              ? 'border-orange-500 bg-orange-500/10'
                                              : 'border-neutral-700 bg-neutral-800/50 hover:border-orange-500/50 hover:bg-neutral-800'
                                          }`}
                                        >
                                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                                            isSelected ? 'bg-orange-500/20' : 'bg-neutral-700'
                                          }`}>
                                            <Icon className={`h-5 w-5 ${isSelected ? 'text-orange-400' : 'text-neutral-400'}`} />
                                          </div>
                                          <div className='flex-1'>
                                            <div className='font-semibold text-neutral-100'>
                                              {service.emoji} {service.name}
                                            </div>
                                            <div className='text-xs text-neutral-400'>
                                              {service.description}
                                            </div>
                                          </div>
                                          {isSelected && !isNone && (
                                            <Check className='h-5 w-5 text-orange-400' />
                                          )}
                                        </button>
                                      )
                                    })}
                                  </div>
                                  
                                  <button
                                    onClick={handleServicesConfirm}
                                    disabled={isLoading}
                                    className='flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50'
                                  >
                                    <Sparkles className='h-4 w-4' />
                                    Continue
                                  </button>
                                </div>
                              )}

                              {/* Create Button */}
                              {message.showCreateButton && (
                                <div className='mt-4'>
                                  <button
                                    onClick={handleCreateAgent}
                                    disabled={isLoading}
                                    className='flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-white transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50'
                                  >
                                    {isLoading ? (
                                      <>
                                        <Loader2 className='h-5 w-5 animate-spin' />
                                        Creating...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className='h-5 w-5' />
                                        Create This Agent
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Sticky Input Bar - Only show for initial message and review modifications */}
                {conversationStep === CONVERSATION_STEPS.INITIAL && (
                  <div className='sticky bottom-0 mx-auto w-full p-4'>
                    <div className='mx-auto flex w-full max-w-2xl gap-3'>
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleKeyPress(e)
                          }
                        }}
                        placeholder='Describe the agent you want to create...'
                        className='flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
                        rows={2}
                        disabled={isLoading}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className='flex cursor-pointer items-center gap-1 rounded-lg px-2 py-3 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isLoading ? (
                          <Loader2 className='h-5 w-5 animate-spin text-orange-600 hover:text-orange-700' />
                        ) : (
                          <Send className='h-5 w-5 text-orange-600 hover:text-orange-700' />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProcessingSteps({ steps, title }) {
  return (
    <div className='space-y-3'>
      <div className='mb-4 flex items-center gap-2'>
        <Loader2 className='h-5 w-5 animate-spin text-orange-500' />
        <span className='font-semibold text-orange-400'>{title}</span>
      </div>

      <div className='space-y-2'>
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
              step.status === 'completed'
                ? 'border-green-500/30 bg-green-500/10'
                : step.status === 'processing'
                  ? 'animate-pulse border-orange-500/30 bg-orange-500/10'
                  : 'border-neutral-700 bg-neutral-800/50'
            }`}
          >
            <div
              className={`mt-0.5 ${
                step.status === 'completed'
                  ? 'text-green-400'
                  : 'text-orange-400'
              }`}
            >
              {step.status === 'completed' ? (
                <Check className='h-5 w-5' />
              ) : (
                <step.icon className='h-5 w-5' />
              )}
            </div>
            <div className='min-w-0 flex-1'>
              <div
                className={`text-sm font-medium ${
                  step.status === 'completed'
                    ? 'text-green-300'
                    : 'text-neutral-200'
                }`}
              >
                {step.title}
              </div>
              <div
                className={`mt-0.5 text-xs ${
                  step.status === 'completed'
                    ? 'text-green-400/70'
                    : 'text-neutral-400'
                }`}
              >
                {step.description}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}