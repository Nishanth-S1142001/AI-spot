'use client'
import {
  Aperture,
  ArrowLeft,
  MessageCircle,
  RefreshCw,
  Send,
  Settings,
  X,
  Zap
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import LoadingState from '../../../components/common/loading-state'
import { useAuth } from '../../../components/providers/AuthProvider'
import NeonBackground from '../../../components/ui/background'
import Button from '../../../components/ui/button'
import Card from '../../../components/ui/card'
import { dbClient } from '../../../lib/supabase/dbClient'
import { supabase } from '../../../lib/supabase/dbClient'
export default function ChatSandbox() {
  const colorOptions = [
    { name: 'Orange', value: '#EA580C', class: 'bg-orange-600' },
    { name: 'Blue', value: '#2563EB', class: 'bg-blue-600' },
    { name: 'Green', value: '#16A34A', class: 'bg-green-600' },
    { name: 'Purple', value: '#9333EA', class: 'bg-purple-600' },
    { name: 'Red', value: '#DC2626', class: 'bg-red-600' },
    { name: 'Pink', value: '#DB2777', class: 'bg-pink-600' },
    { name: 'Teal', value: '#0D9488', class: 'bg-teal-600' },
    { name: 'Amber', value: '#D97706', class: 'bg-amber-600' },
    { name: 'Indigo', value: '#4F46E5', class: 'bg-indigo-600' },
    { name: 'Gray', value: '#6B7280', class: 'bg-gray-600' }
  ]

  const [botColorMode, setBotColorMode] = useState('light') // 'light', 'dark', 'night'
  const [prompt, setPrompt] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [credits, setCredits] = useState(8450)
  const [tokenCount, setTokenCount] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [botColor, setBotColor] = useState('#EA580C')
  const router = useRouter()
  const chatEndRef = useRef(null)
  const chatButtonRef = useRef(null)
  const instructionsButtonRef = useRef(null)
  const { id } = useParams()
  const { user, profile, loading } = useAuth()
  const [agent, setAgent] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [loadingResponse, setLoadingResponse] = useState(false)
  const [error, setError] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! How can I help you today?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const getPurposeIcon = (purpose) => {
    switch (purpose) {
      case 'website':
        return <Globe className='h-5 w-5 text-purple-500' />
      default:
        return <Aperture className='h-5 w-5 text-gray-500' /> // Added default case
    }
  }
  const fetchAgentData = async () => {
    try {
      setFetching(true)
      // Note: Assuming dbClient.getAgent requires agentId and optional userId for access check
      const agentData = await dbClient.getAgent(id, user.id)
      if (!agentData) throw new Error('Agent not found or access denied')
      setAgent(agentData)
      // Note: The system_prompt is handled on the server. botBody now only holds the knowledge base for display/editing.
      setPrompt(agentData.system_prompt)
      // The API server uses 'knowledge_sources', but the UI state uses 'knowledge_base'
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setFetching(false)
    }
  }
  useEffect(() => {
    if (id && user && !agent) fetchAgentData()
    else setFetching(false)
  }, [id, user]) // Removed 'agent' from dependency array to prevent infinite loop

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !agent) return
    const userMessage = chatInput
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setChatInput('')
    setIsTyping(true) // ← show typing indicato
    setLoadingResponse(true)
    setError('')

    try {
      const res = await fetch(`/api/agents/${id}/sandbox_testing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userId: user?.id,
          metadata: { sandbox: true }
        })
      })

      const data = await res.json()
      const botResponseContent = data.response || '⚠️ No response from bot'

      if (data.error) setError(data.error)

      // Update UI
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: botResponseContent }
      ])

      // Save to database
    } catch (err) {
      console.error(err)
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Unexpected network error.' }
      ])
    } finally {
      setLoadingResponse(false)
      setIsTyping(false) // ← show typing indicato
    }
  }
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session)
        router.push('/') // redirect if not logged in
      else setFetching(false)
    })
  }, [])
  if (loading) {
    return (
      <LoadingState
        message='Loading... (Refresh the window if delayed)'
        className='min-h-screen'
      />
    )
  }

  if (error && !loadingResponse) {
    // Only show full error if not actively loading a response
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono text-orange-500'>
        <p>{error}</p>
      </div>
    )
  }

  const clearChat = () => {
    setChatMessages([
      { role: 'assistant', content: 'Hi! How can I help you today?' }
    ])
    setTokenCount(0)
  }

  const quickTestMessages = [
    'Hello, I need help with my account',
    'What are your pricing plans?',
    "I'm having trouble with my order",
    'Can you help me schedule a demo?',
    'What services do you offer?'
  ]

  return (
    <>
      <NeonBackground />
      <div className='custom-scrollbar relative w-full flex-1 font-mono text-neutral-100'>
        {/* Sticky Header */}
        <div className='sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-700 bg-neutral-900/80 px-6 backdrop-blur-sm'>
          <div className='flex items-center space-x-4'>
            <Aperture className='h-8 w-8 text-orange-400' />
            <div>
              <h1 className='text-xl font-bold text-neutral-100'>
                Agent Testing Sandbox
              </h1>
              <p className='text-sm text-neutral-400'>AI agent demo</p>
            </div>
          </div>
          <div className='flex items-center space-x-4 text-sm text-neutral-400'>
            <div>
              Credits:{' '}
              <span className='font-semibold text-orange-400'>{credits}</span>
            </div>
            <div>
              Tokens Used:{' '}
              <span className='font-semibold text-green-400'>{tokenCount}</span>
            </div>
          </div>
        </div>

        <div className='w-full px-6 py-8'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
            {/* Left Sidebar */}
            <div className='h-fit space-y-6 lg:col-span-2'>
              <Card className='h-full w-full'>
                <div className='flex h-full w-full flex-col items-center p-6'>
                  <div className='space-y-4'>
                    {/* Header */}
                    <span className='text-lg font-medium text-neutral-100'>
                      Quick Actions
                    </span>

                    {/* Action Buttons */}
                    <div className='space-y-3'>
                      <Button
                        variant='ghost'
                        className='flex w-full items-center justify-center space-x-2'
                        onClick={clearChat}
                      >
                        <RefreshCw className='h-4 w-4' />
                        <span>Clear Chat</span>
                      </Button>

                      <Button
                        variant='ghost'
                        className='flex w-full items-center justify-center space-x-2'
                        onClick={() => setShowSettings(true)}
                      >
                        <Settings className='h-4 w-4' />
                        <span>Test Settings</span>
                      </Button>
                    </div>

                    {/* Response Delay */}
                    <div className='space-y-2'>
                      <label className='block font-medium text-neutral-300'>
                        Response Delay
                      </label>
                      <select className='w-full rounded-lg border border-neutral-600 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'>
                        <option value='realistic'>
                          Realistic (1–2 seconds)
                        </option>
                        <option value='instant'>Instant</option>
                        <option value='slow'>Slow (3–5 seconds)</option>
                      </select>
                    </div>

                    {/* Bot Accent Color */}
                    <div className='space-y-2'>
                      <label className='block font-medium text-neutral-300'>
                        Bot Accent Color
                      </label>

                      {/* Color Palette */}
                      <div className='flex flex-wrap gap-2'>
                        {colorOptions.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setBotColor(color.value)}
                            className={`h-8 w-8 rounded-full border-2 ${
                              botColor === color.value
                                ? 'border-white'
                                : 'border-neutral-700'
                            } ${color.class}`}
                            title={color.name}
                          />
                        ))}
                      </div>

                      {/* Mode Buttons */}
                      <div className='mt-2 flex w-full items-center gap-2'>
                        <button
                          onClick={() => setBotColorMode('light')}
                          className={`flex-1 rounded border px-2 py-1 text-center text-sm ${
                            botColorMode === 'light'
                              ? 'bg-white text-black'
                              : 'bg-neutral-700 text-neutral-100'
                          }`}
                        >
                          ☀️ Light
                        </button>
                        <button
                          onClick={() => setBotColorMode('dark')}
                          className={`flex-1 rounded border px-2 py-1 text-center text-sm ${
                            botColorMode === 'dark'
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-700 text-neutral-100'
                          }`}
                        >
                          🌙 Dark
                        </button>
                        <button
                          onClick={() => setBotColorMode('night')}
                          className={`flex-1 rounded border px-2 py-1 text-center text-sm ${
                            botColorMode === 'night'
                              ? 'bg-indigo-900 text-white'
                              : 'bg-neutral-700 text-neutral-100'
                          }`}
                        >
                          🌓 Night
                        </button>
                      </div>

                      {/* Manual Color Input */}
                      <input
                        type='text'
                        value={botColor}
                        onChange={(e) => setBotColor(e.target.value)}
                        className='mt-2 w-full rounded-lg border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                      />
                      <p className='text-xs text-neutral-500'>
                        Choose or enter your bot’s accent color
                      </p>
                    </div>
                  </div>

                  {/* Preview Button (sticks to bottom) */}
                  <Button
                    className='mt-6 flex w-full items-center justify-center space-x-2'
                    onClick={() => setShowPreview(true)}
                  >
                    <MessageCircle className='h-6 w-6' />
                    <span>Preview Chatbot Widget</span>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Main Chat Interface */}
            <div className='h-[calc(100vh-130px)] lg:col-span-10'>
              <Card className='flex h-full flex-col'>
                {/* Chat Header */}
                <div className='flex items-center justify-between border-b border-neutral-700 bg-neutral-800/50 p-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-600'>
                      <Aperture className='h-6 w-6 text-neutral-100' />
                    </div>
                    <div>
                      <h3 className='font-medium text-neutral-100'>
                        {agent?.name}
                      </h3>
                      <p className='text-sm text-neutral-400 capitalize'>
                        {agent?.domain} • {agent?.persona}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2 text-sm text-neutral-400'>
                    <Zap className='h-4 w-4' />
                    <span>{tokenCount} tokens used</span>
                  </div>
                </div>

                {/* Messages Container */}
                <div className='flex-1 space-y-4 overflow-y-auto bg-neutral-900/50 p-4'>
                  {chatMessages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex max-w-xs items-start space-x-2 md:max-w-md lg:max-w-lg ${
                          message.role === 'user'
                            ? 'flex-row-reverse space-x-reverse'
                            : ''
                        }`}
                      >
                        <div
                          className={`px-4 py-2 ${
                            message.role === 'user'
                              ? 'rounded-l-lg rounded-b-lg bg-orange-600 text-neutral-100'
                              : 'rounded-r-lg rounded-b-lg bg-neutral-700 text-neutral-100'
                          }`}
                        >
                          <p className='text-sm'>{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className='flex justify-start'>
                      <div className='flex items-start space-x-2'>
                        <div className='rounded-lg bg-neutral-700 px-4 py-2'>
                          <div className='flex space-x-1'>
                            <div className='h-2 w-2 animate-bounce rounded-full bg-neutral-400'></div>
                            <div
                              className='h-2 w-2 animate-bounce rounded-full bg-neutral-400'
                              style={{ animationDelay: '0.1s' }}
                            ></div>
                            <div
                              className='h-2 w-2 animate-bounce rounded-full bg-neutral-400'
                              style={{ animationDelay: '0.2s' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className='border-t border-neutral-700 bg-neutral-800/50 p-4'>
                  <div className='flex space-x-2'>
                    <textarea
                      type='text'
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()

                          sendChatMessage() // ← call directly instead of using button ref
                        }
                      }}
                      placeholder='Type your message...'
                      className='w-full flex-1 rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-2 text-neutral-100 placeholder-neutral-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                    />
                    <Button
                      ref={chatButtonRef}
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || isTyping}
                      className='px-4 disabled:opacity-50'
                    >
                      <Send className='h-5 w-5' />
                    </Button>
                  </div>
                  <div className='mt-2 flex items-center justify-between text-xs text-neutral-500'>
                    <span>Press Enter to send</span>
                    {/* <span>
                      Estimated cost: ~
                      {Math.floor(inputMessage.length / 4) + 20} tokens
                    </span> */}
                  </div>
                </div>

                {/* Quick Test Messages */}
                <div className='border-t border-neutral-700 bg-neutral-800/50 p-4'>
                  <h3 className='mb-3 text-sm font-medium text-neutral-300'>
                    Quick Tests
                  </h3>
                  <div className='grid grid-cols-3 gap-2'>
                    {quickTestMessages.map((msg, index) => (
                      <Button
                        key={index}
                        variant='ghost'
                        className='w-full justify-center text-sm'
                        onClick={() => setChatInput(msg)}
                      >
                        {msg}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Chatbot Preview Modal */}
        {showPreview && (
          <>
            {/* Background overlay */}
            <div
              className='fixed inset-0 z-40 backdrop-blur-sm'
              onClick={() => setShowPreview(false)}
            />

            {/* Chatbot Widget */}
            <div
              className='fixed right-6 bottom-6 z-50 flex flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300'
              style={{
                width: '22rem',
                transition: 'all 0.3s ease-in-out',

                transform: showPreview ? 'translateY(0)' : 'translateY(50px)',
                opacity: showPreview ? 1 : 0,

                height: '600px',
                border: `1px solid ${botColor}`,
                backgroundColor:
                  botColorMode === 'light'
                    ? '#fff'
                    : botColorMode === 'dark'
                      ? '#1a1a1a'
                      : '#121212'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className='flex items-center space-x-3 p-4'
                style={{ backgroundColor: botColor }}
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white'>
                  <Aperture className='h-5 w-5' style={{ color: botColor }} />
                </div>
                <div>
                  <h3
                    className={`font-medium ${
                      botColorMode === 'light'
                        ? 'text-neutral-900'
                        : 'text-neutral-100'
                    }`}
                  >
                    AI Assistant
                  </h3>
                  <p
                    className={`text-xs ${
                      botColorMode === 'light'
                        ? 'text-neutral-700'
                        : 'text-neutral-200'
                    }`}
                  >
                    Online now
                  </p>
                </div>
              </div>

              {/* Chat Area */}

              <div
                className='custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-3'
                style={{
                  backgroundColor:
                    botColorMode === 'light'
                      ? '#f9f9f9'
                      : botColorMode === 'dark'
                        ? '#1a1a1a'
                        : '#121212'
                }}
              >
                {chatMessages.map((message, idx) => {
                  const isUser = message.role === 'user'
                  const userBg = botColor
                  const botBg = botColorMode === 'light' ? '#e5e7eb' : '#2a2a2a'
                  const botText =
                    botColorMode === 'light' ? '#111827' : '#f9f9f9'

                  return (
                    <div
                      key={idx}
                      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                          isUser
                            ? 'rounded-tr-none text-white'
                            : 'rounded-tl-none'
                        }`}
                        style={{
                          backgroundColor: isUser ? userBg : botBg,
                          color: isUser ? '#fff' : botText,
                          maxWidth: '80%'
                        }}
                      >
                        {message.content}
                      </div>
                    </div>
                  )
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className='flex justify-start'>
                    <div
                      className='rounded-2xl rounded-tl-none px-3 py-2'
                      style={{
                        backgroundColor:
                          botColorMode === 'light' ? '#e5e7eb' : '#2a2a2a'
                      }}
                    >
                      <div className='flex space-x-1'>
                        <div className='h-2 w-2 animate-bounce rounded-full bg-gray-400'></div>
                        <div
                          className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div
                className='flex items-center space-x-2 p-3'
                style={{
                  backgroundColor:
                    botColorMode === 'light'
                      ? '#f3f4f6'
                      : botColorMode === 'dark'
                        ? '#1f1f1f'
                        : '#121212'
                }}
              >
                <textarea
                  type='text'
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendChatMessage() // ← call directly instead of using button ref
                    }
                  }}
                  placeholder='Type your message...'
                  className='w-full flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none'
                  style={{
                    borderColor: botColor,
                    backgroundColor:
                      botColorMode === 'light' ? '#fff' : '#2a2a2a',
                    color: botColorMode === 'light' ? '#111827' : '#f9f9f9'
                  }}
                  rows={1}
                />
                <button
                  ref={chatButtonRef}
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || isTyping}
                  className='flex items-center justify-center rounded-lg px-3 py-2 shadow-sm disabled:cursor-pointer disabled:opacity-50'
                  style={{ backgroundColor: botColor }}
                >
                  <Send className='h-4 w-4 text-white' />
                </button>
              </div>

              {/* Close Button */}
              <button
                variant='ghost'
                size='sm'
                className={`absolute top-3 right-3 cursor-pointer text-neutral-100 hover:text-${botColor}`}
                onClick={() => setShowPreview(false)}
              >
                <X className='h-5 w-5' />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
