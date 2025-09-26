'use client'

import React, { useState, useEffect, useRef } from 'react'
import NeonBackground from '../../../../components/background'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '../../../../components/sideBar'
import { dbClient } from '../../../../lib/supabase/dbClient'
import { useAuth } from '../../../../components/providers/AuthProvider'
import SubSidebar from '../../../../components/subSideBar'
import { updateAgent } from '../../../actions/agents'
import { menuItems } from '../../../../config/menuconfig'
import Button from '../../../../components/button'
import { subMenuItems } from '../../../../config/submenuconfig'
import {
  BarChart3,
  Aperture,
  ArrowLeft,
  ChartNoAxesColumnIncreasing,
  Zap,
  Settings,
  User,
  Home,
  SendHorizonal,
  Globe,
  RefreshCw
} from 'lucide-react'

export default function AgentTest() {
  const router = useRouter()
  const chatEndRef = useRef(null)
  const chatButtonRef = useRef(null)
  const instructionsButtonRef = useRef(null)

  const { id } = useParams()
  const { user } = useAuth()

  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingResponse, setLoadingResponse] = useState(false)
  const [typingDots, setTypingDots] = useState('')
  const [error, setError] = useState('')

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
      //   case 'instagram':
      //     return <Instagram className="h-5 w-5 text-pink-500" />
      //   case 'messenger':
      //     return <MessageSquare className="h-5 w-5 text-blue-500" />
      //   case 'calendar':
      //     return <Calendar className="h-5 w-5 text-green-500" />
      case 'website':
        return <Globe className='h-5 w-5 text-purple-500' />
      //   default:
      //     return <Bot className="h-5 w-5 text-gray-500" />
    }
  }

  const fetchAgentData = async () => {
    try {
      setLoading(true)
      const agentData = await dbClient.getAgent(id, user.id)
      if (!agentData) throw new Error('Agent not found or access denied')
      setAgent(agentData)
      setPrompt(agentData.system_prompt)
      setBotBody(agentData.knowledge_base)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id && user && !agent) fetchAgentData()
    else setLoading(false)
  }, [id, user, agent])

  useEffect(() => {
    if (loadingResponse) {
      const interval = setInterval(() => {
        setTypingDots((prev) => (prev.length < 3 ? prev + '.' : ''))
      }, 500)
      return () => clearInterval(interval)
    } else {
      setTypingDots('')
    }
  }, [loadingResponse])

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
    setChatMessages((prev) => [...prev, { role: 'user', content: chatInput }])
    setChatInput('')
    setLoadingResponse(true)
    setError('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: chatInput,
          context: botBody,
          prompt
        })
      })
      const data = await res.json()
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer || '⚠️ No response from bot' }
      ])
    } catch (err) {
      console.error(err)
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Error fetching response' }
      ])
    } finally {
      setLoadingResponse(false)
    }
  }

  const sendInstructions = async () => {
    if (!instructionsInput.trim() || !agent) return
    setError('')
    setBodyResponse(true)

    const newMessages = [...instructionMessages, instructionsInput].slice(
      -MAX_INSTRUCTIONS
    )
    setInstructionMessages(newMessages)
    setInstructionsInput('')

    try {
      const res = await fetch('/api/botInstructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructions: newMessages,
          content: agent.knowledge_base
        })
      })
      const data = await res.json()

      if (data.error) {
        console.error('Bot update error:', data.error)
        alert('Error updating bot: ' + data.error)
      } else {
        const { content: updatedContent } = data
        setBotBody(updatedContent || '')
        await updateAgent(agent.id, { knowledge_base: updatedContent })
      }
    } catch (err) {
      console.error('Bot Body error:', err)
      alert('Unexpected error updating bot')
    } finally {
      setBodyResponse(false)
    }
  }

  const refreshChat = () => {
    setChatMessages([
      { role: 'assistant', content: 'Hi! How can I help you today?' }
    ])
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <div className='text-center'>
          <Aperture className='mx-auto mb-4 h-12 w-12 animate-spin text-neutral-400' />
          <p className='text-lg text-neutral-400'>Loading ...</p>
          <p className='text-lg text-neutral-400'>
            Refresh if it takes time...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono text-red-500'>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className='flex h-screen overflow-hidden font-mono'>
      <NeonBackground />
      <Sidebar menuItems={menuItems} />
      <SubSidebar menuItems={subMenuItems} />

      <div className='flex flex-1 flex-col text-neutral-100'>
        {/* Top Header */}
        <div className='mx-4 flex h-16 flex-shrink-0 items-center justify-between border-b border-neutral-700'>
          <div className='flex items-center space-x-4'>
            <Button onClick={() => router.back()}>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            {getPurposeIcon(agent.purpose)}
            <div>
              <h1 className='text-lg font-semibold text-neutral-400'>
                {agent.name}
              </h1>
              <p className='text-sm text-neutral-400 uppercase'>
                {agent.purpose} Agent
              </p>
            </div>
            <div
              className={`h-[20px] w-[20px] rounded-full px-2 py-1 font-medium ${
                agent.is_active
                  ? 'bg-green-600 text-green-800'
                  : 'bg-red-500 text-red-800'
              }`}
            >
              {/* {agent.is_active ? 'Active' : 'Inactive'} */}
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='text-lg'>
              Credits:{' '}
              <span className='font-semibold text-neutral-400'>{0}</span>
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
                  className={`max-w-[70%] p-2 ${
                    msg.role === 'user'
                      ? 'ml-auto rounded-l-xl rounded-b-xl bg-neutral-600 text-neutral-200'
                      : 'rounded-r-xl rounded-b-xl bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {loadingResponse && (
                <div className='h-[40px] max-w-[70%] rounded-r-xl rounded-b-xl bg-neutral-200 p-2 text-2xl text-neutral-700'>
                  {typingDots}
                </div>
              )}
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
                  disabled={bodyResponse}
                />
                <button
                  ref={chatButtonRef}
                  onClick={sendChatMessage}
                  disabled={!chatInput}
                  className='rounded-r-lg px-4 py-2 text-white disabled:cursor-none'
                >
                  <SendHorizonal className='h-8 w-8 text-neutral-400 hover:cursor-pointer' />
                </button>
              </div>
            </div>
          </div>

          {/* Knowledge Base */}
          <div className='m-10 flex w-1/2 flex-col overflow-hidden rounded-xl border border-neutral-700'>
            <div className='sticky top-0 z-10 flex-shrink-0 p-4'>
              <div className='m-2 border-b border-neutral-600'>
                <h2 className='m-2 text-lg font-semibold'>Bot trainer</h2>
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
              />
              <button
                ref={instructionsButtonRef}
                onClick={sendInstructions}
                disabled={!instructionsInput}
                className='rounded-r-lg px-4 py-2 text-white disabled:cursor-none'
              >
                <SendHorizonal className='h-8 w-8 text-neutral-400 hover:cursor-pointer' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
