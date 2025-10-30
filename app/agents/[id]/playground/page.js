'use client'

import { useEffect, useRef, useState, useCallback, memo, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Globe, Send, Bot, RefreshCw, Sparkles, Zap, AlertCircle } from 'lucide-react'

import { useAuth } from '../../../../components/providers/AuthProvider'
import { useLogout } from '../../../../lib/supabase/auth'
import { dbClient } from '../../../../lib/supabase/dbClient'
import { updateAgent } from '../../../actions/agents'

import NeonBackground from '../../../../components/ui/background'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import LoadingState from '../../../../components/common/loading-state'
import SideBarLayout from '../../../../components/sideBarLayout'
import Card from '../../../../components/ui/card'
import Button from '../../../../components/ui/button'
import '../../../styles/agent-dashboard-styles.css'

/**
 * FULLY OPTIMIZED Agent Playground Component
 * 
 * Improvements:
 * - ✅ Fixed console error with better error handling
 * - ✅ Reduced re-renders with better memoization
 * - ✅ Improved loading states and error boundaries
 * - ✅ Better visual design matching style guide
 * - ✅ Performance optimizations
 * - ✅ Cleaner code structure
 * - ✅ Fixed navigation loading issue
 */

// --- Utils ---
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

const getPurposeIcon = (purpose) => {
  const icons = {
    website: <Globe className='h-5 w-5 text-purple-400' />,
    chatbot: <Bot className='h-5 w-5 text-blue-400' />,
    assistant: <Sparkles className='h-5 w-5 text-green-400' />,
    default: <Bot className='h-5 w-5 text-orange-400' />
  }
  return icons[purpose] || icons.default
}

// Typing Indicator Component
const TypingIndicator = memo(() => {
  return (
    <div className='flex items-start gap-3 animate-fade-in'>
      <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-900/40 ring-1 ring-orange-600/20'>
        <Bot className='h-4 w-4 animate-pulse text-orange-400' />
      </div>
      <div className='rounded-2xl border border-orange-600/30 bg-neutral-900/80 px-4 py-3 shadow-lg'>
        <div className='flex items-center gap-1.5'>
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              className='h-2 w-2 rounded-full bg-orange-400 animate-bounce'
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

TypingIndicator.displayName = 'TypingIndicator'

// Memoized Chat Message Component
const ChatMessage = memo(({ msg, index }) => {
  const isUser = msg.role === 'user'
  
  return (
    <div
      className={`flex items-start gap-3 animate-slide-in ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {!isUser && (
        <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-900/40 ring-1 ring-orange-600/20'>
          <Bot className='h-4 w-4 text-orange-400' />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-lg transition-all hover:scale-[1.02] ${
          isUser
            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white ring-1 ring-orange-400/20'
            : 'border border-orange-600/30 bg-neutral-900/80 text-neutral-100'
        }`}
      >
        <p className='text-sm leading-relaxed whitespace-pre-wrap'>{msg.content}</p>
      </div>
    </div>
  )
})

ChatMessage.displayName = 'ChatMessage'

// Error Display Component
const ErrorDisplay = memo(({ error, onRetry, onDismiss }) => (
  <div className='rounded-lg border border-red-600/30 bg-red-900/20 p-4 animate-fade-in'>
    <div className='flex items-start gap-3'>
      <AlertCircle className='h-5 w-5 flex-shrink-0 text-red-400' />
      <div className='flex-1'>
        <p className='text-sm font-medium text-red-400'>Error</p>
        <p className='mt-1 text-sm text-neutral-300'>{error}</p>
        <div className='mt-3 flex gap-2'>
          {onRetry && (
            <button
              onClick={onRetry}
              className='text-xs text-red-400 hover:text-red-300 transition-colors'
            >
              Try Again
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className='text-xs text-neutral-400 hover:text-neutral-300 transition-colors'
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
))

ErrorDisplay.displayName = 'ErrorDisplay'

export default function AgentPlayground() {
  const router = useRouter()
  const { id } = useParams()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()

  // --- Refs ---
  const chatEndRef = useRef(null)
  const hasFetchedAgent = useRef(false)
  const abortControllerRef = useRef(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // --- States ---
  const [agent, setAgent] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [loadingResponse, setLoadingResponse] = useState(false)
  const [updatingKnowledge, setUpdatingKnowledge] = useState(false)
  const [error, setError] = useState(null)
  const [chatError, setChatError] = useState(null)
  const [sessionId, setSessionId] = useState(generateSessionId())

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! How can I help you today?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [instructionsInput, setInstructionsInput] = useState('')
  const [knowledgeBase, setKnowledgeBase] = useState('')

  // ✅ Reset state when agent ID changes
  useEffect(() => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Reset all state
    hasFetchedAgent.current = false
    setIsInitialized(false)
    setFetching(true)
    setAgent(null)
    setLoadingResponse(false)
    setUpdatingKnowledge(false)
    setError(null)
    setChatError(null)
    setSessionId(generateSessionId())
    setChatMessages([
      { role: 'assistant', content: 'Hi! How can I help you today?' }
    ])
    setChatInput('')
    setInstructionsInput('')
    setKnowledgeBase('')
  }, [id])

  // --- Fetch agent data with better error handling ---
  const fetchAgentData = useCallback(async () => {
    if (!id || !user || hasFetchedAgent.current) return
    hasFetchedAgent.current = true

    try {
      setFetching(true)
      setError(null)
      
      const agentData = await dbClient.getAgent(id, user.id)
      
      if (!agentData) {
        throw new Error('Agent not found or you do not have access to this agent.')
      }

      setAgent(agentData)
      setKnowledgeBase(agentData.knowledge_base || '')
    } catch (err) {
      // Better error handling - no console.error in production
      const errorMessage = err?.message || 'Failed to load agent. Please try again.'
      setError(errorMessage)
      
      // Log to error tracking service in production (not console)
      if (process.env.NODE_ENV === 'production' && window.errorTracker) {
        window.errorTracker.captureException(err, {
          context: 'fetchAgentData',
          agentId: id,
          userId: user?.id
        })
      }
    } finally {
      setFetching(false)
      setIsInitialized(true)
    }
  }, [id, user])

  // --- Effects ---
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (user && !hasFetchedAgent.current) {
      fetchAgentData()
    }
  }, [authLoading, user, fetchAgentData, router])

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Reset chat on knowledge base update
  useEffect(() => {
    setChatMessages([
      { role: 'assistant', content: 'Hi! How can I help you today?' }
    ])
  }, [knowledgeBase])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // --- Send chat message with better error handling ---
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || !agent || loadingResponse) return

    const message = chatInput.trim()
    setChatInput('')
    setLoadingResponse(true)
    setChatError(null)

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    // Optimistically add user message
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
        }),
        signal: abortControllerRef.current.signal
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()
      const botContent = data.response || '⚠️ No response received'

      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: botContent }
      ])
    } catch (err) {
      if (err.name === 'AbortError') {
        return // Request was cancelled
      }

      const errorMessage = err?.message || 'Failed to send message. Please try again.'
      setChatError(errorMessage)
      
      // Remove user message on error
      setChatMessages((prev) => prev.slice(0, -1))

      if (process.env.NODE_ENV === 'production' && window.errorTracker) {
        window.errorTracker.captureException(err, {
          context: 'sendChatMessage',
          agentId: id
        })
      }
    } finally {
      setLoadingResponse(false)
      abortControllerRef.current = null
    }
  }, [chatInput, agent, id, sessionId, user?.id, loadingResponse])

  // --- Send instructions with better error handling ---
  const sendInstructions = useCallback(async () => {
    if (!instructionsInput.trim() || !agent || updatingKnowledge) return

    const instructions = instructionsInput.trim()
    setInstructionsInput('')
    setUpdatingKnowledge(true)
    setChatError(null)

    try {
      const res = await fetch(`/api/agents/${id}/update-knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructions,
          currentKnowledge: knowledgeBase,
          userId: user?.id
        })
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()

      if (data.knowledge_base) {
        setKnowledgeBase(data.knowledge_base)
        
        // Update in database
        await updateAgent(agent.id, { knowledge_base: data.knowledge_base })
        
        // Show success feedback
        setChatError(null)
      }
    } catch (err) {
      const errorMessage = err?.message || 'Failed to update knowledge. Please try again.'
      setChatError(errorMessage)

      if (process.env.NODE_ENV === 'production' && window.errorTracker) {
        window.errorTracker.captureException(err, {
          context: 'sendInstructions',
          agentId: id
        })
      }
    } finally {
      setUpdatingKnowledge(false)
    }
  }, [instructionsInput, agent, id, knowledgeBase, user?.id, updatingKnowledge])

  // --- Refresh chat ---
  const refreshChat = useCallback(() => {
    setSessionId(generateSessionId())
    setChatMessages([
      { role: 'assistant', content: 'Hi! How can I help you today?' }
    ])
    setChatError(null)
  }, [])

  // --- Retry agent fetch ---
  const retryFetch = useCallback(() => {
    hasFetchedAgent.current = false
    setError(null)
    fetchAgentData()
  }, [fetchAgentData])

  // --- Memoized values ---
  const isDisabled = useMemo(
    () => loadingResponse || updatingKnowledge,
    [loadingResponse, updatingKnowledge]
  )

  // --- Loading States ---
  if (authLoading) {
    return <LoadingState message='Authenticating...' className='min-h-screen' />
  }

  if (fetching && !isInitialized) {
    return <LoadingState message='Loading playground...' className='min-h-screen' />
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-950 font-mono'>
        <Card className='max-w-md border-red-600/20 bg-gradient-to-br from-red-950/20 to-neutral-950/50'>
          <div className='p-8 text-center'>
            <div className='mb-4 flex justify-center'>
              <div className='rounded-full bg-red-900/40 p-4'>
                <AlertCircle className='h-8 w-8 text-red-400' />
              </div>
            </div>
            <h3 className='mb-2 text-lg font-semibold text-red-400'>Error Loading Agent</h3>
            <p className='mb-6 text-sm text-neutral-400'>{error}</p>
            <div className='flex gap-3 justify-center'>
              <Button onClick={retryFetch} variant='outline'>
                Try Again
              </Button>
              <Button onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!agent) {
    return <LoadingState message='Agent not found...' className='min-h-screen' />
  }

  // --- Main UI ---
  return (
    <>
      <NeonBackground />
      <SideBarLayout>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              message='Playground'
              agent={agent}
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='flex flex-1 gap-6 overflow-hidden p-6'>
            {/* Left: Chat Section */}
            <div className='flex w-1/2 flex-col'>
              <Card className='flex h-full flex-col border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
                {/* Chat Header */}
                <div className='flex items-center justify-between border-b border-neutral-800/50 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-900/40 ring-1 ring-orange-600/20'>
                      <Bot className='h-5 w-5 text-orange-400' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-neutral-100'>Test Chat</h3>
                      <p className='text-xs text-neutral-500'>
                        Session: {sessionId.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={refreshChat}
                    variant='ghost'
                    size='sm'
                    className='group'
                    title='Refresh chat'
                  >
                    <RefreshCw className='h-4 w-4 transition-transform group-hover:rotate-180' />
                  </Button>
                </div>

                {/* Messages */}
                <div className='custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4'>
                  {chatMessages.map((msg, idx) => (
                    <ChatMessage key={`${msg.role}-${idx}`} msg={msg} index={idx} />
                  ))}

                  {/* Typing Indicator */}
                  {loadingResponse && <TypingIndicator />}

                  {/* Chat Error */}
                  {chatError && (
                    <ErrorDisplay
                      error={chatError}
                      onDismiss={() => setChatError(null)}
                    />
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className='border-t border-neutral-800/50 p-4'>
                  <div className='flex gap-2'>
                    <input
                      className='flex-1 rounded-lg border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:opacity-50'
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder='Type your message...'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendChatMessage()
                        }
                      }}
                      disabled={isDisabled}
                    />
                    <Button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || isDisabled}
                      className='flex items-center gap-2 transition-all hover:scale-105'
                    >
                      <Send className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Knowledge Base Section */}
            <div className='flex w-1/2 flex-col'>
              <Card className='flex h-full flex-col border-purple-600/20 bg-gradient-to-br from-purple-950/10 to-neutral-950/50'>
                {/* Knowledge Header */}
                <div className='border-b border-neutral-800/50 p-4'>
                  <div className='flex items-center gap-3'>
                    {getPurposeIcon(agent?.purpose)}
                    <div className='flex-1'>
                      <h3 className='font-semibold text-neutral-100'>{agent?.name}</h3>
                      <p className='text-xs text-neutral-400 uppercase'>
                        {agent?.purpose} Agent
                      </p>
                    </div>
                    <div
                      className={`h-3 w-3 rounded-full ${
                        agent?.is_active ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-orange-500 shadow-lg shadow-orange-500/50'
                      } animate-pulse`}
                      title={agent?.is_active ? 'Active' : 'Inactive'}
                    />
                  </div>
                </div>

                {/* Knowledge Body */}
                <div className='custom-scrollbar flex-1 overflow-y-auto p-6'>
                  {updatingKnowledge ? (
                    <div className='flex h-full items-center justify-center animate-fade-in'>
                      <div className='text-center'>
                        <div className='mb-4 flex justify-center'>
                          <Sparkles className='h-12 w-12 animate-pulse text-purple-400' />
                        </div>
                        <p className='text-sm text-neutral-400'>
                          Updating agent knowledge...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='rounded-lg border border-purple-600/20 bg-neutral-900/50 p-4'>
                      <p className='text-sm leading-relaxed whitespace-pre-wrap text-neutral-300'>
                        {knowledgeBase || 'No knowledge base defined yet. Add instructions below to teach your agent.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions Input */}
                <div className='border-t border-neutral-800/50 p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Zap className='h-4 w-4 text-purple-400' />
                    <label className='text-sm font-medium text-neutral-300'>
                      Update Knowledge
                    </label>
                  </div>
                  <div className='flex gap-2'>
                    <textarea
                      className='custom-scrollbar h-24 flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 transition-all focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none disabled:opacity-50'
                      placeholder='Tell your agent how to improve or what to learn...'
                      value={instructionsInput}
                      onChange={(e) => setInstructionsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          e.preventDefault()
                          sendInstructions()
                        }
                      }}
                      disabled={isDisabled}
                    />
                    <Button
                      onClick={sendInstructions}
                      disabled={!instructionsInput.trim() || isDisabled}
                      variant='outline'
                      className='self-end transition-all hover:scale-105'
                      title='Ctrl+Enter to send'
                    >
                      <Send className='h-4 w-4' />
                    </Button>
                  </div>
                  <p className='mt-2 text-xs text-neutral-500'>
                    Press Ctrl+Enter to send
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </SideBarLayout>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </>
  )
}