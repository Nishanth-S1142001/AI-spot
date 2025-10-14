'use client'

import {
  Aperture,
  ArrowLeft,
 
  Globe,
  LoaderPinwheel,
  RefreshCw,
  SendHorizonal,
  Settings,
  User
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../../../components/providers/AuthProvider'
import NeonBackground from '../../../../components/ui/background'
import Button from '../../../../components/ui/button'
import { dbClient } from '../../../../lib/supabase/dbClient'
import { updateAgent } from '../../../actions/agents'
import LoadingState from '../../../../components/common/loading-state'
 
// Generate a random, simple Session ID for the playground testing
const generateSessionId = () => Math.random().toString(36).substring(2, 15)

export default function AgentTest() {
  const router = useRouter()
  const chatEndRef = useRef(null)
  const chatButtonRef = useRef(null)
  const instructionsButtonRef = useRef(null)
  const { id } = useParams()
  const { user, profile, loading } = useAuth()
  const [agent, setAgent] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [loadingResponse, setLoadingResponse] = useState(false)
  const [typingDots, setTypingDots] = useState('')
  const [error, setError] = useState('')

  // State to hold a unique session ID for the playground
  const [sessionId, setSessionId] = useState(generateSessionId())

  const [prompt, setPrompt] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! How can I help you today?' }
  ])
  const [instructionMessages, setInstructionMessages] = useState([
    'Greet the user in the beginning of the chat'
  ])
  const [chatInput, setChatInput] = useState('')
  const [instructionsInput, setInstructionsInput] = useState('')
  const [bodyResponse, setBodyResponse] = useState(false)
  const [botBody, setBotBody] = useState('')

  const MAX_INSTRUCTIONS = 20 // limit instruction history

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
      // We will assume agentData.knowledge_base is what the UI should display/edit
      setBotBody(agentData.knowledge_base || '')
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

  // Reset chat whenever botBody updates
  useEffect(() => {
    setChatMessages([
      { role: 'assistant', content: 'Hi! How can I help you today?' }
    ])
  }, [botBody])

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !agent) return

    const userMessage = chatInput
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setChatInput('')
    setLoadingResponse(true)
    setError('')

    try {
      console.log('Sending message to agent ID:', id, 'Session ID:', sessionId)
      const res = await fetch(`/api/agents/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
          userId: user?.id,
          metadata: { playground: true }
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
    }
  }

  const sendInstructions = async () => {
    if (!instructionsInput.trim() || !agent) return
    setError('')
    setBodyResponse(true)
    const instructionText = instructionsInput
    setInstructionMessages((prev) =>
      [...prev, instructionText].slice(-MAX_INSTRUCTIONS)
    )
    setInstructionsInput('')

    // --- REFACTORED INSTRUCTIONS LOGIC to use API ---
    try {
      // NOTE: We assume a new API endpoint like /api/agents/[id]/knowledge
      // or /api/agents/[id]/update-knowledge is created for this.
      const res = await fetch(`/api/agents/${id}/knowledge-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Send the new instruction and the current knowledge base
          instruction: instructionText,
          currentKnowledge: botBody,
          userId: user?.id
        })
      })

      const data = await res.json()

      if (data.error) {
        console.error('Bot update error:', data.error)
        alert('Error updating bot: ' + data.error)
      } else {
        const { knowledge_base: updatedContent } = data // Assume API returns updated content in 'knowledge_base'

        if (updatedContent) {
          setBotBody(updatedContent)
          // Use the existing client-side action to persist to the DB after AI processing
          await updateAgent(agent?.id, { knowledge_base: updatedContent })
        } else {
          alert('Bot knowledge update failed: No content returned.')
        }
      }
    } catch (err) {
      console.error('Bot Body error:', err)
      alert('Unexpected error updating bot')
    } finally {
      setBodyResponse(false)
    }
    // --- END REFACTORED INSTRUCTIONS LOGIC ---
  }

  const refreshChat = () => {
    // Generate a new Session ID to ensure a fresh conversation history on the server
    setSessionId(generateSessionId())
    setChatMessages([
      { role: 'assistant', content: 'Hi! How can I help you today?' }
    ])
  }

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

  // The rest of the UI is unchanged
  return (
    <div className='flex h-screen overflow-hidden font-mono'>
      <NeonBackground />

      <div className='flex flex-1 flex-col text-neutral-100'>
        {/* Top Header */}
        <div className='mx-4 flex h-16 flex-shrink-0 items-center justify-between border-b border-neutral-700'>
          <Button onClick={() => router.back()}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <p>Agent Playground</p>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='text-lg'>
              Credits:{' '}
              <span className='font-semibold text-neutral-400'>
                {profile?.api_credits}
              </span>
            </div>
            <Link href='/settings'>
              <Settings className='h-6 w-6 text-neutral-400 hover:text-neutral-200' />
            </Link>
            <Link href='/profile'>
              <User className='h-6 w-6 text-neutral-400 hover:text-neutral-200' />
            </Link>
            <button
              onClick={refreshChat}
              className='flex items-center space-x-1 rounded bg-cyan-600 px-2 py-1 hover:bg-cyan-500'
            >
              <RefreshCw className='h-4 w-4' />
              <span className='text-sm'>Refresh Chat</span>
            </button>
          </div>
        </div>

        <div className='flex flex-1 overflow-hidden'>
          {/* Chat Section */}
          <div className='flex w-1/2 flex-col'>
            <div className='custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4'>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-2 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Assistant Icon - Simplified for cleaner JSX */}
                  {msg.role === 'assistant' && (
                    <LoaderPinwheel
                      className={`mt-1 h-5 w-5 text-orange-600 ${
                        idx === chatMessages.length - 1 && loadingResponse
                          ? 'animate-spin'
                          : ''
                      }`}
                    />
                  )}

                  {/* Chat Bubble */}
                  <div
                    className={`max-w-[70%] p-2 ${
                      msg.role === 'user'
                        ? 'rounded-l-xl rounded-b-xl bg-neutral-600 text-neutral-200'
                        : 'rounded-r-xl rounded-b-xl text-white'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Optional: user side icon (for symmetry) */}
                  {/* {msg.role === 'user' && <User className='mt-1 h-5 w-5 text-neutral-400' />} */}
                </div>
              ))}

              {/* Bot typing animation is handled by the last message's icon now, but keeping this for potential future use */}
              {/* {loadingResponse && (
                <div className='flex items-end space-x-2'>
                  <LoaderPinwheel className='h-5 w-5 animate-spin text-orange-600' />
                </div>
              )} */}

              <div ref={chatEndRef} />
            </div>

            <div className='p-3'>
              <div className='flex rounded-lg'>
                <input
                  className='w-full rounded-md bg-neutral-900 p-2 font-mono text-sm text-neutral-300 focus:ring-2 focus:ring-neutral-500 focus:outline-none'
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder='Type your message...'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      chatButtonRef.current?.click()
                    }
                  }}
                  disabled={loadingResponse || bodyResponse}
                />
                <button
                  ref={chatButtonRef}
                  onClick={sendChatMessage}
                  disabled={
                    !chatInput.trim() || loadingResponse || bodyResponse
                  }
                  className='rounded-r-lg px-4 py-2 text-white disabled:opacity-50'
                >
                  <SendHorizonal className='h-8 w-8 text-neutral-400 hover:cursor-pointer hover:text-cyan-400' />
                </button>
              </div>
            </div>
          </div>

          {/* Knowledge Base */}
          <div className='m-10 flex w-1/2 flex-col overflow-hidden rounded-xl border border-neutral-700'>
            <div className='sticky top-0 z-10 flex-shrink-0 p-4'>
              <div className='m-2 border-b border-neutral-600'>
                <div className='flex items-center space-x-4'>
                  {getPurposeIcon(agent?.purpose)}
                  <div>
                    <h1 className='text-lg font-semibold text-neutral-400'>
                      {agent?.name}
                    </h1>
                    <p className='text-sm text-neutral-400 uppercase'>
                      {agent?.purpose} Agent
                    </p>
                  </div>
                  <div
                    className={`h-[20px] w-[20px] rounded-full px-2 py-1 font-medium ${
                      agent?.is_active
                        ? 'bg-green-600 text-green-800'
                        : 'bg-orange-500 text-orange-800'
                    }`}
                  >
                    {/* Status indicator - visual only */}
                  </div>
                </div>
              </div>
            </div>

            <div className='custom-scrollbar flex-1 overflow-y-auto p-6'>
              <div className='mb-6'>
                {!bodyResponse ? (
                  <p className='whitespace-pre-line text-neutral-400'>
                    {botBody}
                  </p>
                ) : (
                  <div className='flex flex-col justify-center text-center'>
                    <Aperture className='mx-auto mb-4 h-12 w-12 animate-spin text-cyan-700' />
                    <p className='text-lg text-neutral-400'>
                      Updating bot knowledge...
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className='sticky bottom-0 m-3 flex flex-shrink-0 rounded-lg'>
              <textarea
                className='custom-scrollbar h-[200px] w-full rounded-md border border-neutral-700 bg-neutral-900 p-2 font-mono text-sm text-neutral-300 focus:ring-1 focus:ring-neutral-500 focus:outline-none'
                placeholder='Instruct your bot to improvise...'
                value={instructionsInput}
                onChange={(e) => setInstructionsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    instructionsButtonRef.current?.click()
                  }
                }}
                disabled={loadingResponse || bodyResponse}
              />
              <button
                ref={instructionsButtonRef}
                onClick={sendInstructions}
                disabled={
                  !instructionsInput.trim() || loadingResponse || bodyResponse
                }
                className='rounded-r-lg px-4 py-2 text-white disabled:opacity-50'
              >
                <SendHorizonal className='h-8 w-8 text-neutral-400 hover:cursor-pointer hover:text-cyan-400' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
