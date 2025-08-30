'use client'

import React, { useState, useEffect, useRef } from 'react'
import NeonBackground from '../../components/background'
import { useAuth } from '../../contexts/authContext'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { logout } = useAuth()
  const router = useRouter()
  const [summaries, setSummaries] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)

  const handleLogout = async () => {
    await logout()
    router.push('/userAuthentication/login')
  }

  // Fetch summaries when page loads
  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(
          `/api/scrape?url=https://en.wikipedia.org/wiki/Web_scraping`
        )
        const data = await res.json()
        setSummaries((prev) => [...prev, ...data.summaries])
      } catch (err) {
        console.error('Error fetching summary', err)
      }
    }
    fetchSummary()
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: input }])
    const userMessage = input
    setInput('')

    try {
      console.log("Sending question:", userMessage);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      })

       console.log("After fetch:", userMessage);

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer }
      ])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Error fetching response' }
      ])
    }
  }

  return (
    <div className='flex min-h-screen flex-col bg-gray-50'>
      <NeonBackground />
      <h1 className='m-6 rounded bg-white p-2 text-black shadow'>
        Chat with your scraped data
      </h1>

      {/* Summaries (debug/preview) */}
      <div className='m-6 rounded-lg bg-white p-4 text-black shadow'>
        <h2 className='mb-2 font-bold'>Summaries:</h2>
        <ul className='text-sm'>
          {summaries.map((s, i) => (
            <li key={i} className='mb-2'>
              {s.summary}
            </li>
          ))}
        </ul>
      </div>

      {/* WhatsApp-style Chatbox */}
      <div className='m-6 flex flex-1 flex-col rounded-lg bg-white shadow-md'>
        {/* Messages */}
        <div className='flex-1 overflow-y-auto rounded-t-lg bg-gray-100 p-4'>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`mb-2 flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs rounded-lg px-3 py-2 shadow ${
                  m.role === 'user'
                    ? 'rounded-br-none bg-green-500 text-white'
                    : 'rounded-bl-none bg-gray-200 text-black'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className='flex items-center rounded-b-lg border-t bg-gray-50 p-2'>
          <input
            disabled={summaries.length === 0}
            className='mr-2 flex-1 rounded-full border px-4 py-2 disabled:bg-gray-200'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              summaries.length === 0
                ? 'Loading summaries...'
                : 'Type a message...'
            }
          />
          <button
            onClick={sendMessage}
            className='rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
          >
            Send
          </button>
        </div>
      </div>

       
    </div>
  )
}
