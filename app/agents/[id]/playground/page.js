'use client'

import { useEffect, useRef, useState, useCallback, memo, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Globe,
  Send,
  Bot,
  RefreshCw,
  Sparkles,
  Zap,
  AlertCircle,
  CheckCircle,
  FileText,
  Trash2
} from 'lucide-react'

import { useAuth } from '../../../../components/providers/AuthProvider'
import { useLogout } from '../../../../lib/supabase/auth'
import {
  useAgent,
  useKnowledgeSources,
  useSendChatMessage,
  useAddKnowledge,
  useDeleteKnowledgeSource
} from '../../../../lib/hooks/useAgentData'

import NeonBackground from '../../../../components/ui/background'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import PlaygroundSkeleton from '../../../../components/skeleton/PlaygroundSkeleton'
import LoadingState from '../../../../components/common/loading-state'
import SideBarLayout from '../../../../components/sideBarLayout'
import Card from '../../../../components/ui/card'
import Button from '../../../../components/ui/button'
import '../../../styles/agent-dashboard-styles.css'

// --- Utils ---
const generateSessionId = () =>
  `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

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
    <div className='animate-fade-in flex items-start gap-3'>
      <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-900/40 ring-1 ring-orange-600/20'>
        <Bot className='h-4 w-4 animate-pulse text-orange-400' />
      </div>
      <div className='rounded-2xl border border-orange-600/30 bg-neutral-900/80 px-4 py-3 shadow-lg'>
        <div className='flex items-center gap-1.5'>
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              className='h-2 w-2 animate-bounce rounded-full bg-orange-400'
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
      className={`animate-slide-in flex items-start gap-3 ${
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
        <p className='text-sm leading-relaxed whitespace-pre-wrap'>
          {msg.content}
        </p>
      </div>
    </div>
  )
})

ChatMessage.displayName = 'ChatMessage'

// Knowledge Source Card Component
const KnowledgeSourceCard = memo(({ source, onDelete, isDeleting }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className='rounded-lg border border-purple-600/20 bg-neutral-900/50 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex flex-1 items-start gap-3'>
          <FileText className='mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400' />
          <div className='min-w-0 flex-1'>
            <h4 className='truncate text-sm font-medium text-neutral-200'>
              {source.file_name || 'Knowledge Entry'}
            </h4>
            <p className='mt-1 text-xs text-neutral-500'>
              {source.vector_count || 0} vectors •{' '}
              {new Date(source.created_at).toLocaleDateString()}
            </p>
            {source.content && (
              <div className='mt-2'>
                <p
                  className={`text-sm text-neutral-300 ${expanded ? '' : 'line-clamp-3'}`}
                >
                  {source.content}
                </p>
                {source.content.length > 200 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className='mt-1 text-xs text-purple-400 hover:text-purple-300'
                  >
                    {expanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(source.id)}
            disabled={isDeleting}
            className='text-red-400 transition-colors hover:text-red-300 disabled:opacity-50'
            title='Delete knowledge source'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        )}
      </div>
    </div>
  )
})

KnowledgeSourceCard.displayName = 'KnowledgeSourceCard'

// Success Display Component
const SuccessDisplay = memo(({ message, onDismiss }) => (
  <div className='animate-fade-in rounded-lg border border-green-600/30 bg-green-900/20 p-4'>
    <div className='flex items-start gap-3'>
      <CheckCircle className='h-5 w-5 flex-shrink-0 text-green-400' />
      <div className='flex-1'>
        <p className='text-sm font-medium text-green-400'>Success</p>
        <p className='mt-1 text-sm text-neutral-300'>{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className='mt-2 text-xs text-neutral-400 transition-colors hover:text-neutral-300'
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  </div>
))

SuccessDisplay.displayName = 'SuccessDisplay'

// Error Display Component
const ErrorDisplay = memo(({ error, onRetry, onDismiss }) => (
  <div className='animate-fade-in rounded-lg border border-red-600/30 bg-red-900/20 p-4'>
    <div className='flex items-start gap-3'>
      <AlertCircle className='h-5 w-5 flex-shrink-0 text-red-400' />
      <div className='flex-1'>
        <p className='text-sm font-medium text-red-400'>Error</p>
        <p className='mt-1 text-sm text-neutral-300'>{error}</p>
        <div className='mt-3 flex gap-2'>
          {onRetry && (
            <button
              onClick={onRetry}
              className='text-xs text-red-400 transition-colors hover:text-red-300'
            >
              Try Again
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className='text-xs text-neutral-400 transition-colors hover:text-neutral-300'
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

  // Artificial delay so skeleton shows at least 3 seconds
  const [delayedLoading, setDelayedLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // React Query hooks
  const {
    data: agent,
    isLoading: agentLoading,
    error: agentError
  } = useAgent(id)

  const { data: knowledgeSources = [], isLoading: sourcesLoading } =
    useKnowledgeSources(id, user?.id)

  const sendChatMutation = useSendChatMessage(id)
  const addKnowledgeMutation = useAddKnowledge(id)
  const deleteSourceMutation = useDeleteKnowledgeSource(id)

  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }

  // Refs
  const chatEndRef = useRef(null)

  // Local state
  const [sessionId, setSessionId] = useState(generateSessionId())
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! How can I help you today?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [instructionsInput, setInstructionsInput] = useState('')
  const [chatError, setChatError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Handle agent not found
  useEffect(() => {
    if (agentError && !agentLoading) {
      router.push('/agents')
    }
  }, [agentError, agentLoading, router])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, sendChatMutation.isPending])

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Send chat message
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || !agent || sendChatMutation.isPending) return

    const message = chatInput.trim()
    setChatInput('')
    setChatError(null)

    // Add user message immediately
    setChatMessages((prev) => [...prev, { role: 'user', content: message }])

    try {
      const data = await sendChatMutation.mutateAsync({
        message,
        sessionId,
        userId: user?.id
      })

      const botContent = data.response || '⚠️ No response received'
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: botContent }
      ])

      if (data.knowledge?.searchPerformed && data.knowledge?.sourcesFound > 0) {
        console.log(
          `✅ Used ${data.knowledge.sourcesFound} knowledge source(s)`
        )
      }
    } catch (err) {
      setChatError(err.message || 'Failed to send message')
      // Remove user message on error
      setChatMessages((prev) => prev.slice(0, -1))
    }
  }, [chatInput, agent, sessionId, user?.id, sendChatMutation])

  // Send instructions
  const sendInstructions = useCallback(async () => {
    if (!instructionsInput.trim() || !agent || addKnowledgeMutation.isPending)
      return

    const instructions = instructionsInput.trim()
    setInstructionsInput('')
    setChatError(null)

    try {
      await addKnowledgeMutation.mutateAsync({
        instructions,
        userId: user?.id
      })

      // Reset chat after adding knowledge
      setSessionId(generateSessionId())
      setChatMessages([
        { role: 'assistant', content: 'Hi! How can I help you today?' }
      ])
    } catch (err) {
      setChatError(err.message || 'Failed to update knowledge')
    }
  }, [instructionsInput, agent, user?.id, addKnowledgeMutation])

  // Delete knowledge source
  const deleteKnowledgeSource = useCallback(
    async (sourceId) => {
      if (!confirm('Are you sure you want to delete this knowledge source?'))
        return

      try {
        await deleteSourceMutation.mutateAsync(sourceId)
      } catch (err) {
        setChatError(err.message || 'Failed to delete knowledge source')
      }
    },
    [deleteSourceMutation]
  )

  // Refresh chat
  const refreshChat = useCallback(() => {
    setSessionId(generateSessionId())
    setChatMessages([
      { role: 'assistant', content: 'Hi! How can I help you today?' }
    ])
    setChatError(null)
    setSuccessMessage(null)
  }, [])

  // Memoized values
  const isDisabled = useMemo(
    () => sendChatMutation.isPending || addKnowledgeMutation.isPending,
    [sendChatMutation.isPending, addKnowledgeMutation.isPending]
  )

  // Show skeleton during delayed loading or initial loading
  if (authLoading || agentLoading) {
    return <PlaygroundSkeleton userProfile={userProfile} />
  }
  if (delayedLoading) {
    return (
      <LoadingState message='Loading playground...' className='min-h-screen' />
    )
  }

  if (!agent) {
    return (
      <LoadingState message='Agent not found...' className='min-h-screen' />
    )
  }

  // Main UI
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
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
                      <h3 className='font-semibold text-neutral-100'>
                        Test Chat
                      </h3>
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
                    <ChatMessage
                      key={`${msg.role}-${idx}`}
                      msg={msg}
                      index={idx}
                    />
                  ))}

                  {sendChatMutation.isPending && <TypingIndicator />}

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
                      <h3 className='font-semibold text-neutral-100'>
                        Knowledge Sources
                      </h3>
                      <p className='text-xs text-neutral-400'>
                        {sourcesLoading
                          ? 'Loading...'
                          : `${knowledgeSources.length} source${knowledgeSources.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <div
                      className={`h-3 w-3 rounded-full ${
                        agent?.is_active
                          ? 'bg-green-500 shadow-lg shadow-green-500/50'
                          : 'bg-orange-500 shadow-lg shadow-orange-500/50'
                      } animate-pulse`}
                      title={agent?.is_active ? 'Active' : 'Inactive'}
                    />
                  </div>
                </div>

                {/* Knowledge Body */}
                <div className='custom-scrollbar flex-1 overflow-y-auto p-6'>
                  {addKnowledgeMutation.isPending ? (
                    <div className='animate-fade-in flex h-full items-center justify-center'>
                      <div className='text-center'>
                        <div className='mb-4 flex justify-center'>
                          <Sparkles className='h-12 w-12 animate-pulse text-purple-400' />
                        </div>
                        <p className='text-sm text-neutral-400'>
                          Vectorizing knowledge...
                        </p>
                        <p className='mt-2 text-xs text-neutral-500'>
                          Creating semantic embeddings
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {successMessage && (
                        <SuccessDisplay
                          message={successMessage}
                          onDismiss={() => setSuccessMessage(null)}
                        />
                      )}

                      {sourcesLoading ? (
                        <div className='flex items-center justify-center py-8'>
                          <div className='text-center'>
                            <Sparkles className='mx-auto h-8 w-8 animate-spin text-purple-400' />
                            <p className='mt-2 text-sm text-neutral-400'>
                              Loading knowledge sources...
                            </p>
                          </div>
                        </div>
                      ) : knowledgeSources.length > 0 ? (
                        <>
                          {knowledgeSources.map((source) => (
                            <KnowledgeSourceCard
                              key={source.id}
                              source={source}
                              onDelete={deleteKnowledgeSource}
                              isDeleting={deleteSourceMutation.isPending}
                            />
                          ))}
                          <div className='rounded-lg border border-blue-600/20 bg-blue-900/10 p-3'>
                            <p className='text-xs text-blue-300'>
                              💡 All knowledge is vectorized for semantic search
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className='rounded-lg border border-purple-600/20 bg-neutral-900/50 p-8 text-center'>
                          <FileText className='mx-auto mb-3 h-12 w-12 text-neutral-600' />
                          <p className='text-sm text-neutral-400'>
                            No knowledge sources yet. Add some below to teach
                            your agent!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Instructions Input */}
                <div className='border-t border-neutral-800/50 p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Zap className='h-4 w-4 text-purple-400' />
                    <label className='text-sm font-medium text-neutral-300'>
                      Add Knowledge
                    </label>
                  </div>
                  <div className='flex gap-2'>
                    <textarea
                      className='custom-scrollbar h-24 flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 transition-all focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none disabled:opacity-50'
                      placeholder='Example: Our return policy is 30 days for all items...'
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
                    Press Ctrl+Enter • Will be vectorized for semantic search
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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
