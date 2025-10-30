'use client'

import {
  Aperture,
  Send,
  RefreshCw,
  Star,
  MessageSquare,
  Clock,
  CheckCircle
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'
import LoadingState from '../../components/common/loading-state'
import NeonBackground from '../../components/ui/background'

export default function PublicTestPortal() {
  const { accessToken } = useParams()
  const router = useRouter()
  const chatEndRef = useRef(null)

  // State
  const [testAccount, setTestAccount] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Chat state
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // ✅ FIXED: Define startSession first (not as useCallback to avoid circular dependency)
  const startSession = async (agentName) => {
    try {
      const response = await fetch(`/api/test/${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_session' })
      })

      if (!response.ok) {
        throw new Error('Failed to start session')
      }

      const data = await response.json()
      setSessionId(data.sessionId)

      // Add welcome message
      setMessages([
        {
          role: 'assistant',
          content: `Hi! I'm ${agentName || 'your AI assistant'}. How can I help you today?`,
          timestamp: new Date()
        }
      ])
    } catch (err) {
      console.error('Session start error:', err)
    }
  }

  // ✅ FIXED: Validate access token and load account (no circular dependency)
  const validateAccess = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/test/${accessToken}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Invalid test link')
      }

      const data = await response.json()
      setTestAccount(data.testAccount)

      // Start session with agent name
      await startSession(data.testAccount?.agentName)
    } catch (err) {
      console.error('Validation error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [accessToken]) // ✅ Only depends on accessToken

  // Send message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending || !sessionId) return

    const userMessage = input.trim()
    setInput('')
    setSending(true)

    // Add user message to UI
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      }
    ])

    try {
      const response = await fetch(`/api/test/${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          sessionId,
          message: userMessage
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          tokensUsed: data.tokensUsed
        }
      ])
    } catch (err) {
      console.error('Send message error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
      ])
    } finally {
      setSending(false)
    }
  }, [input, sending, sessionId, accessToken])

  // Submit feedback
  const submitFeedback = useCallback(async () => {
    if (!rating) {
      alert('Please provide a rating')
      return
    }

    try {
      await fetch(`/api/test/${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          sessionId,
          rating,
          feedback: feedback.trim()
        })
      })

      setSubmitted(true)
    } catch (err) {
      console.error('Feedback error:', err)
      alert('Failed to submit feedback')
    }
  }, [rating, sessionId, feedback, accessToken])

  useEffect(() => {
    if (accessToken) {
      validateAccess()
    }
  }, [accessToken, validateAccess])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  // Loading state
  if (loading) {
    return (
      <LoadingState
        message='Validating your test link...'
        className='min-h-screen'
      />
    )
  }

  // Error state
  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <NeonBackground />
        <Card className='relative max-w-md border-red-600/30 bg-gradient-to-br from-red-900/20 to-neutral-950/50'>
          <div className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/40'>
              <MessageSquare className='h-8 w-8 text-red-400' />
            </div>
            <h3 className='mb-2 text-xl font-bold text-neutral-100'>
              Invalid Test Link
            </h3>
            <p className='text-sm text-neutral-400'>{error}</p>
            <p className='mt-4 text-xs text-neutral-500'>
              Please contact the sender for a new invitation
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Feedback submitted state
  if (submitted) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <NeonBackground />
        <Card className='relative max-w-md border-green-600/30 bg-gradient-to-br from-green-900/20 to-neutral-950/50'>
          <div className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-900/40'>
              <CheckCircle className='h-8 w-8 text-green-400' />
            </div>
            <h3 className='mb-2 text-xl font-bold text-neutral-100'>
              Thank You!
            </h3>
            <p className='text-sm text-neutral-400'>
              Your feedback has been submitted successfully.
            </p>
            <p className='mt-4 text-xs text-neutral-500'>
              You can now close this window.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Main chat interface
  return (
    <>
      <NeonBackground />
      <div className='relative flex min-h-screen w-full flex-col font-mono text-neutral-100'>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
          <div className='flex h-16 items-center justify-between px-6'>
            <div className='flex items-center gap-3'>
              <div className='relative'>
                <div className='absolute inset-0 bg-orange-500/50 opacity-50 blur-lg' />
                <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-900/40 ring-1 ring-orange-500/50'>
                  <Aperture className='h-5 w-5 text-orange-400' />
                </div>
              </div>
              <div>
                <h1 className='text-lg font-bold text-neutral-100'>
                  {testAccount?.agentName}
                </h1>
                <p className='text-xs text-neutral-400'>AI Test Session</p>
              </div>
            </div>

            <div className='flex items-center gap-4 text-sm text-neutral-400'>
              <div className='flex items-center gap-1'>
                <MessageSquare className='h-4 w-4' />
                <span>{messages.filter((m) => m.role === 'user').length}</span>
              </div>
              <Button
                size='sm'
                variant='outline'
                onClick={() => setShowFeedback(true)}
              >
                End & Review
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className='custom-scrollbar flex-1 overflow-y-auto bg-neutral-900/30 p-6'>
          <div className='mx-auto max-w-3xl space-y-4'>
            {/* Info Banner */}
            <Card className='border-blue-600/30 bg-gradient-to-br from-blue-900/20 to-neutral-950/20'>
              <div className='flex items-start gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-900/40'>
                  <MessageSquare className='h-5 w-5 text-blue-400' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-neutral-100'>
                    Welcome, {testAccount?.name}!
                  </h3>
                  <p className='mt-1 text-sm text-neutral-400'>
                    {testAccount?.agentDescription ||
                      'Test this AI agent and share your feedback. Your input helps us improve!'}
                  </p>
                  <div className='mt-3 flex items-center gap-4 text-xs text-neutral-500'>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-3 w-3' />
                      <span>
                        {testAccount?.remainingSessions} sessions remaining
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Messages */}
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/20'
                      : 'border border-neutral-800/50 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 text-neutral-100'
                  }`}
                >
                  <p className='text-sm leading-relaxed'>{message.content}</p>
                  <p className='mt-2 text-xs opacity-60'>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {sending && (
              <div className='flex justify-start'>
                <div className='rounded-2xl border border-neutral-800/50 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 px-4 py-3'>
                  <div className='flex space-x-1'>
                    <div className='h-2 w-2 animate-bounce rounded-full bg-neutral-400' />
                    <div
                      className='h-2 w-2 animate-bounce rounded-full bg-neutral-400'
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className='h-2 w-2 animate-bounce rounded-full bg-neutral-400'
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className='sticky bottom-0 border-t border-neutral-800/50 bg-neutral-950/80 p-6 backdrop-blur-xl'>
          <div className='mx-auto max-w-3xl'>
            <div className='flex gap-3'>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder='Type your message...'
                rows={1}
                disabled={sending}
                className='custom-scrollbar flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className='px-6'
              >
                <Send className='h-4 w-4' />
              </Button>
            </div>
            <p className='mt-2 text-xs text-neutral-500'>
              Press{' '}
              <kbd className='rounded bg-neutral-800 px-1.5 py-0.5'>Enter</kbd>{' '}
              to send
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='absolute inset-0 bg-black/80 backdrop-blur-sm'
            onClick={() => setShowFeedback(false)}
          />
          <Card className='relative z-10 m-4 w-full max-w-md border-orange-600/30 bg-gradient-to-br from-neutral-900/95 to-neutral-950/95'>
            <div className='space-y-6'>
              <div className='text-center'>
                <h3 className='text-xl font-bold text-neutral-100'>
                  How was your experience?
                </h3>
                <p className='mt-2 text-sm text-neutral-400'>
                  Your feedback helps us improve
                </p>
              </div>

              {/* Star Rating */}
              <div className='flex justify-center gap-2'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className='group'
                  >
                    <Star
                      className={`h-10 w-10 transition-all ${
                        star <= rating
                          ? 'fill-orange-400 text-orange-400'
                          : 'text-neutral-600 group-hover:text-orange-400/50'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback Text */}
              <div>
                <label className='mb-2 block text-sm font-medium text-neutral-300'>
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder='Share your thoughts...'
                  rows={4}
                  className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:outline-none'
                />
              </div>

              {/* Actions */}
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={() => setShowFeedback(false)}
                >
                  Continue Testing
                </Button>
                <Button
                  className='flex-1'
                  onClick={submitFeedback}
                  disabled={!rating}
                >
                  Submit Feedback
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
