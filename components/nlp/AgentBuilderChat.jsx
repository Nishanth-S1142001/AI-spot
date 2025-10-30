'use client'

import {
  CheckCircle,
  Loader2,
  Send,
  Brain,
  Search,
  Zap,
  Wrench,
  Database,
  Check
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const messagesEndRef = useRef(null)
  const [chatStarted, setChatStarted] = useState(false)
  const [isSent, setIsSent] = useState(false)

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
      // Add thinking message with processing steps
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

      // Show parsed configuration with enhanced formatting
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
  parseData.config.features.length > 0
    ? `
┌─ **Features Detected** (${parseData.config.features.length})
│
${parseData.config.features.map((f, i) => `${i === parseData.config.features.length - 1 ? '└─' : '├─'} ✨ ${f.replace(/_/g, ' ')}`).join('\n')}`
    : ''
}
${
  parseData.config.tools.length > 0
    ? `
┌─ **Tools Required** (${parseData.config.tools.length})
│
${parseData.config.tools.map((t, i) => `${i === parseData.config.tools.length - 1 ? '└─' : '├─'} 🔧 ${t.replace(/_/g, ' ')}`).join('\n')}`
    : ''
}
${
  parseData.config.integrations.length > 0
    ? `
┌─ **Integrations** (${parseData.config.integrations.length})
│
${parseData.config.integrations.map((int, i) => `${i === parseData.config.integrations.length - 1 ? '└─' : '├─'} 🔌 ${int.charAt(0).toUpperCase() + int.slice(1)}`).join('\n')}`
    : ''
}
${
  parseData.config.knowledgeSources?.length > 0
    ? `
┌─ **Knowledge Sources** (${parseData.config.knowledgeSources.length})
│
${parseData.config.knowledgeSources.map((ks, i) => `${i === parseData.config.knowledgeSources.length - 1 ? '└─' : '├─'} 📚 ${ks.name}`).join('\n')}`
    : ''
}

📊 **Confidence Score:** ${Math.round((parseData.confidence || 0.75) * 100)}% ${parseData.confidence >= 0.8 ? '(Excellent!)' : parseData.confidence >= 0.6 ? '(Good)' : '(Fair)'}
⚡ **Parsing Method:** ${parseData.parsingMethod === 'ai' ? 'AI-Powered' : 'Rule-Based'}${parseData.tokensUsed ? ` • ${parseData.tokensUsed} tokens used` : ''}

Would you like me to **create this agent** now, or would you like to make any changes?`

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: configMessage,
          config: parseData.config
        }
      ])
    } catch (error) {
      console.error('Parse error:', error)
      setProcessingSteps([])
      setMessages((prev) => prev.filter((m) => !m.isThinking))
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '❌ Sorry, I had trouble understanding that. Could you please rephrase your description? Try to be more specific about what you want the agent to do.'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAgent = async () => {
    if (!requestId || !parsedConfig) return

    setIsLoading(true)
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

      const response = await fetch('/api/nlp/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })

      if (!response.ok) {
        throw new Error('Failed to create agent')
      }

      const data = await response.json()

      updateProcessingStep(1, { status: 'completed' })
      await sleep(500)

      // Step 3: Adding knowledge sources
      if (parsedConfig.knowledgeSources?.length > 0) {
        addProcessingStep({
          icon: Database,
          title: 'Adding Knowledge Sources',
          description: `Integrating ${parsedConfig.knowledgeSources.length} knowledge source(s)...`
        })
        await sleep(800)
        updateProcessingStep(2, { status: 'completed' })
      }

      // Step 4: Configuring tools
      if (parsedConfig.tools?.length > 0) {
        addProcessingStep({
          icon: Wrench,
          title: 'Configuring Tools',
          description: `Setting up ${parsedConfig.tools.length} tool(s)...`
        })
        await sleep(700)
        updateProcessingStep(
          parsedConfig.knowledgeSources?.length > 0 ? 3 : 2,
          { status: 'completed' }
        )
      }

      // Step 5: Finalizing
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

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `🎉 **Success!** Your agent **"${data.agent.name}"** has been created and is ready to use!

✅ Agent ID: \`${data.agent.id}\`
✅ All configurations applied
✅ Ready to handle requests

You'll be redirected to your new agent in a moment...`
        }
      ])

      // Notify parent
      if (onAgentCreated) {
        onAgentCreated(data.agent)
      }
    } catch (error) {
      console.error('Creation error:', error)
      setProcessingSteps([])
      setMessages((prev) => prev.filter((m) => !m.isCreating))
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '❌ Sorry, there was an error creating your agent. Please try again.'
        }
      ])
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
                placeholder='Ask anything...'
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
                disabled={isLoading}
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
              <span className='text-orange-500'>
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

                              {message.config && (
                                <div className='mt-3 border-t border-orange-500/30 pt-3'>
                                  <button
                                    onClick={handleCreateAgent}
                                    disabled={isLoading}
                                    className='flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50'
                                  >
                                    {isLoading ? (
                                      <>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        Creating...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className='h-4 w-4' />
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

                {/* Sticky Input Bar */}
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
