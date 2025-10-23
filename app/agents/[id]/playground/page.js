'use client'

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  Suspense
} from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Aperture, Globe, LoaderPinwheel, SendHorizonal } from 'lucide-react'

import { useAuth } from '../../../../components/providers/AuthProvider'
import { useLogout } from '../../../../lib/supabase/auth'
import { dbClient } from '../../../../lib/supabase/dbClient'
import { updateAgent } from '../../../actions/agents'

import NeonBackground from '../../../../components/ui/background'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import LoadingState from '../../../../components/common/loading-state'
import SideBarLayout from '../../../../components/sideBarLayout'

// --- Utils ---
const generateSessionId = () => Math.random().toString(36).substring(2, 15)
const getPurposeIcon = (purpose) => {
  const icons = {
    website: <Globe className='h-5 w-5 text-purple-500' />
  }
  return icons[purpose] || <Aperture className='h-5 w-5 text-gray-500' />
}

export default function AgentTest() {
  const router = useRouter()
  const { id } = useParams()
  const { user, profile, loading } = useAuth()
  const { logout } = useLogout()

  // --- Refs ---
  const chatEndRef = useRef(null)
  const chatButtonRef = useRef(null)
  const instructionsButtonRef = useRef(null)
  const fetchedAgentRef = useRef(false)

  // --- States ---
  const [agent, setAgent] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [loadingResponse, setLoadingResponse] = useState(false)
  const [bodyResponse, setBodyResponse] = useState(false)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState(generateSessionId())

  const [chatMessages, setChatMessages] = useState(() => [
    { role: 'assistant', content: 'Hi! How can I help you today?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [instructionsInput, setInstructionsInput] = useState('')
  const [botBody, setBotBody] = useState('')

  // --- Fetch agent data once ---
  const fetchAgentData = useCallback(async () => {
    if (!id || !user || fetchedAgentRef.current) return
    fetchedAgentRef.current = true

    try {
      setFetching(true)
      const agentData = await dbClient.getAgent(id, user.id)
      if (!agentData) throw new Error('Agent not found or access denied')

      setAgent(agentData)
      setBotBody(agentData.knowledge_base || '')
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setFetching(false)
    }
  }, [id, user])

  useEffect(() => {
    fetchAgentData()
  }, [fetchAgentData])

  // --- Auto scroll chat ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // --- Reset chat on knowledge base update ---
  useEffect(() => {
    setChatMessages([
      { role: 'assistant', content: 'Hi! How can I help you today?' }
    ])
  }, [botBody])

  // --- Send chat message ---
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || !agent) return

    const message = chatInput.trim()
    setChatInput('')
    setLoadingResponse(true)
    setError('')

    setChatMessages((prev) => [...prev, { role: 'user', content: message }])

    try {
      const res = await fetch(`/api/agents/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId,
          userId: user?.id,
          metadata: { playground: true }
        })
      })

      const data = await res.json()
      const botContent = data.response || '⚠️ No response from bot'

      if (data.error) setError(data.error)
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: botContent }
      ])
    } catch (err) {
      console.error(err)
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Unexpected network error.' }
      ])
    } finally {
      setLoadingResponse(false)
    }
  }, [chatInput, agent, id, sessionId, user?.id])

  // --- Update bot knowledge base ---
  const sendInstructions = useCallback(async () => {
    if (!instructionsInput.trim() || !agent) return

    const instruction = instructionsInput.trim()
    setInstructionsInput('')
    setBodyResponse(true)

    try {
      const res = await fetch(`/api/agents/${id}/knowledge-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction,
          currentKnowledge: botBody,
          userId: user?.id
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      if (data.knowledge_base) {
        setBotBody(data.knowledge_base)
        await updateAgent(agent.id, { knowledge_base: data.knowledge_base })
      }
    } catch (err) {
      console.error(err)
      alert('Error updating bot: ' + err.message)
    } finally {
      setBodyResponse(false)
    }
  }, [instructionsInput, agent, id, botBody, user?.id])

  // --- Refresh chat ---
  const refreshChat = useCallback(() => {
    setSessionId(generateSessionId())
    setChatMessages([
      { role: 'assistant', content: 'Hi! How can I help you today?' }
    ])
  }, [])

  // --- Loading/Error States ---
  if (loading || fetching)
    return (
      <LoadingState
        message='Loading... (Refresh the window if delayed)'
        className='min-h-screen'
      />
    )

  if (error && !loadingResponse)
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono text-orange-500'>
        <p>{error}</p>
      </div>
    )

  // --- Render UI ---
  return (
    <div className='flex h-screen overflow-hidden font-mono'>
      <NeonBackground />
      <SideBarLayout>
        {fetching ? (
          <LoadingState message='Loading WebHook Data...' />
        ) : (
          <Suspense
            fallback={<LoadingState message='Loading WebHook Data...' />}
          >
            <div className='flex h-[calc(100vh-10px)] flex-1 flex-col text-neutral-100'>
              {/* Header */}
              <div className='sticky top-0 z-10 flex h-16 items-center'>
                <NavigationBar
                  profile={profile}
                  message='Playground'
                  agent={agent}
                  onLogOutClick={logout}
                />
              </div>

              <div className='flex flex-1 overflow-hidden'>
                {/* Chat Section */}
                <div className='flex w-1/2 flex-col'>
                  <div className='custom-scrollbar flex-1 space-y-3 overflow-y-auto rounded-lg p-4 shadow-2xl shadow-neutral-700'>
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start space-x-2 ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <LoaderPinwheel
                            className={`mt-1 h-5 w-5 text-orange-600 ${
                              idx === chatMessages.length - 1 && loadingResponse
                                ? 'animate-spin'
                                : ''
                            }`}
                          />
                        )}
                        <div
                          className={`max-w-[70%] p-2 ${
                            msg.role === 'user'
                              ? 'rounded-l-xl rounded-b-xl bg-orange-700 text-neutral-200'
                              : 'rounded-r-xl rounded-b-xl bg-neutral-600 text-white'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className='sticky flex rounded-lg p-3'>
                    <input
                      className='w-full rounded-md bg-neutral-900 p-2 font-mono text-sm text-neutral-300 focus:ring-2 focus:ring-neutral-500 focus:outline-none'
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder='Type your message...'
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        !e.shiftKey &&
                        chatButtonRef.current?.click()
                      }
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

                {/* Knowledge Base Section */}
                <div className='m-10 flex w-1/2 flex-col overflow-hidden rounded-xl border border-neutral-700'>
                  {/* Header */}
                  <div className='sticky top-0 z-10 flex-shrink-0 p-4'>
                    <div className='m-2 flex items-center space-x-4 border-b border-neutral-600'>
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
                        className={`h-[20px] w-[20px] rounded-full ${
                          agent?.is_active ? 'bg-green-600' : 'bg-orange-500'
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className='custom-scrollbar flex-1 overflow-y-auto p-6'>
                    {bodyResponse ? (
                      <div className='flex flex-col justify-center text-center'>
                        <Aperture className='mx-auto mb-4 h-12 w-12 animate-spin text-cyan-700' />
                        <p className='text-lg text-neutral-400'>
                          Updating bot knowledge...
                        </p>
                      </div>
                    ) : (
                      <p className='whitespace-pre-line text-neutral-400'>
                        {botBody}
                      </p>
                    )}
                  </div>

                  {/* Instructions Input */}
                  <div className='sticky bottom-0 m-3 flex flex-shrink-0 rounded-lg'>
                    <textarea
                      className='custom-scrollbar h-[200px] w-full rounded-md border border-neutral-700 bg-neutral-900 p-2 font-mono text-sm text-neutral-300 focus:ring-1 focus:ring-neutral-500 focus:outline-none'
                      placeholder='Instruct your bot to improvise...'
                      value={instructionsInput}
                      onChange={(e) => setInstructionsInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        !e.shiftKey &&
                        instructionsButtonRef.current?.click()
                      }
                      disabled={loadingResponse || bodyResponse}
                    />
                    <button
                      ref={instructionsButtonRef}
                      onClick={sendInstructions}
                      disabled={
                        !instructionsInput.trim() ||
                        loadingResponse ||
                        bodyResponse
                      }
                      className='rounded-r-lg px-4 py-2 text-white disabled:opacity-50'
                    >
                      <SendHorizonal className='h-8 w-8 text-neutral-400 hover:cursor-pointer hover:text-cyan-400' />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Suspense>
        )}
      </SideBarLayout>
    </div>
  )
}
