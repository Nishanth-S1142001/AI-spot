'use client'

import React, { useState, useEffect, useRef } from 'react'
import NeonBackground from '../../components/background'
 
import { useRouter } from 'next/navigation'
import FormInput from '../../components/formInputField'
import Button from '../../components/button'
import Sidebar from '../../components/sideBar'

export default function DashboardPage() {
  
  const router = useRouter()
  const [summaries, setSummaries] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [url, setUrl] = useState('')
  const [urlInput, setUrlInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)
  const [chatInput, setChatInput] = useState('')
  const [instructionsInput, setInstructionsInput] = useState('')

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Fetch summaries
  const fetchSummary = async () => {
    if (!url.trim()) return
    setLoading(true)
    setSummaries([])
    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      setSummaries(data.summaries || [])
    } catch (err) {
      console.error('Error fetching summary', err)
      setSummaries([{ summary: '⚠️ Error fetching summary' }])
    } finally {
      setLoading(false)
    }
  }

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    setMessages((prev) => [...prev, { role: 'user', content: input }])
    const userMessage = input
    setInput('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, summaries })
      })

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
    <div className='flex h-screen'>
      <NeonBackground />
     <Sidebar/>
      {/* BEFORE SCRAPE → Center URL input */}
      {summaries.length !== 0 ? (
        <div className='flex flex-1 items-center justify-center'>
          <div className='flex w-[50%] max-w-lg flex-row items-stretch gap-2 rounded-full bg-gray-900 p-4 px-8 shadow-xl'>
            <FormInput
              type='text'
              className='w-full flex-1'
              placeholder='Enter a URL to scrape...'
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setUrlInput(true)
              }}
            />
            <Button
              disabled={!urlInput || loading}
              // onClick={fetchSummary}
              text={loading ? 'Loading...' : 'Scrape'}
            />
          </div>
        </div>
      ) : (
        // AFTER SCRAPE → Show Summaries + Chat + Instructions

        <div className='mt-10 flex flex-1 flex-row gap-4 p-4'>
          {/* Summaries Column + instructions*/}

          <div className='m-1 flex w-[60%] flex-col rounded-sm p-4'>
            {/* Summaries Box → fixed height 60% */}
            <div className='mb-2 flex h-[60vh] flex-col rounded-t-lg border-b border-l border-gray-800 p-4 shadow-2xl'>
              <div className='flex-col overflow-y-auto'>
                <h2 className='mb-4 text-lg font-bold text-white'>
                  Summaries (FAQ):
                </h2>
                <p className='text-white'>
                  Cover Letter Dear Hiring Manager, I am writing to express my
                  interest in the Working Student IT Support and Analytics at
                  Siemens Healthineers. With a strong foundation in computer
                  science, hands-on experience in full-stack web development,
                  and advanced training in data science, I am eager to
                  contribute my skills to your team while further developing my
                  expertise in the company. Currently, I am pursuing a Master of
                  Science in Web and Data Science at the University of Koblenz,
                  where I am gaining in-depth knowledge in data analytics,
                  machine learning, and intelligent web-based systems. My
                  academic journey is complemented by practical experience,
                  including internships and several data-driven projects: Power
                  BI E-commerce Dashboard (2025): Built an interactive dashboard
                  analyzing 50,000+ transactions to track revenue, profit
                  margins, customer segments, and regional performance. Used DAX
                  measures, filters, and drill-through functionality to improve
                  decision-making insights. Churn Prediction Analysis on Retail
                  Data (2025): Conducted predictive modeling on 10,000+
                  transactions with 22 features, engineering RFM-style variables
                  and training ML models to achieve strong ROC-AUC. Identified
                  key churn drivers such as discounts, recency, and category
                  mix, and proposed data-driven retention strategies. HR
                  Analytics Dashboard (2024): Developed a Power BI dashboard to
                  monitor workforce demographics, attrition trends, and hiring
                  insights. Designed DAX measures for attrition rate, tenure,
                  and salary analysis, enabling HR teams to identify high-risk
                  departments and improve retention strategies. Alongside these,
                  I bring industry exposure through my internships at
                  BaselPractitioners Pvt. Ltd. (API development, Next.js
                  integration, mentorship) and Universal Automations Pvt. Ltd.
                  (server administration, ERP coordination). I am particularly
                  drawn to Siemens Healthineer because of its commitment to
                  innovation, quality, and creating user-centric digital
                  experiences with real added value. I believe my skills in
                  Power BI, Python, SQL, and machine learning combined with my
                  passion for solving business problems with data make me a
                  strong fit for this role. Thank you for considering my
                  application. I would welcome the opportunity to discuss how my
                  background and skills align with the goals of your team.
                  Thanks and Regards, Nishanth Srinivasa
                  nishanth.germany@gmail.com +49 15563657719 Dear Hiring
                  Manager, I am writing to express my interest in the Working
                  Student IT Support and Analytics at Siemens Healthineers. With
                  a strong foundation in computer science, hands-on experience
                  in full-stack web development, and advanced training in data
                  science, I am eager to contribute my skills to your team while
                  further developing my expertise in the company. Currently, I
                  am pursuing a Master of Science in Web and Data Science at the
                  University of Koblenz, where I am gaining in-depth knowledge
                  in data analytics, machine learning, and intelligent web-based
                  systems. My academic journey is complemented by practical
                  experience, including internships and several data-driven
                  projects: Power BI E-commerce Dashboard (2025): Built an
                  interactive dashboard analyzing 50,000+ transactions to track
                  revenue, profit margins, customer segments, and regional
                  performance. Used DAX measures, filters, and drill-through
                  functionality to improve decision-making insights. Churn
                  Prediction Analysis on Retail Data (2025): Conducted
                  predictive modeling on 10,000+ transactions with 22 features,
                  engineering RFM-style variables and training ML models to
                  achieve strong ROC-AUC. Identified key churn drivers such as
                  discounts, recency, and category mix, and proposed data-driven
                  retention strategies. HR Analytics Dashboard (2024):
                  Developed a Power BI dashboard to monitor workforce
                  demographics, attrition trends, and hiring insights. Designed
                  DAX measures for attrition rate, tenure, and salary analysis,
                  enabling HR teams to identify high-risk departments and
                  improve retention strategies. Alongside these, I bring
                  industry exposure through my internships at BaselPractitioners
                  Pvt. Ltd. (API development, Next.js integration, mentorship)
                  and Universal Automations Pvt. Ltd. (server administration,
                  ERP coordination). I am particularly drawn to Siemens
                  Healthineer because of its commitment to innovation, quality,
                  and creating user-centric digital experiences with real added
                  value. I believe my skills in Power BI, Python, SQL, and
                  machine learning combined with my passion for solving business
                  problems with data make me a strong fit for this role. Thank
                  you for considering my application. I would welcome the
                  opportunity to discuss how my background and skills align with
                  the goals of your team. Thanks and Regards, Nishanth Srinivasa
                  nishanth.germany@gmail.com +49 15563657719
                </p>
              </div>
              <div className='m-2 mt-auto flex flex-row gap-2 rounded-lg p-4 shadow'>
                <FormInput
                  type='text'
                  className='w-full flex-1'
                  placeholder='Enter a URL to scrape...'
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setUrlInput(true)
                  }}
                />
                <Button
                  disabled={!urlInput}
                  onClick={fetchSummary}
                  text={loading ? 'Loading...' : 'Scrape'}
                />
              </div>
            </div>

            {/* URL input (sticks below summaries) */}

            {/* Instructions → fixed height 40% */}
            <div
              name='instructions'
              className='flex h-[40vh] flex-col rounded-lg border-l border-gray-800'
            >
              <div className='flex-1 overflow-y-auto p-4'></div>
              <div className='flex items-center p-2'>
                <FormInput
                  className='mr-2 flex-1 rounded-xl px-4 py-2'
                  value={instructionsInput}
                  onChange={(e) => setInstructionsInput(e.target.value)}
                  placeholder='Type your instructions..'
                />
                <Button
                  onClick={sendMessage}
                  className='rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
                  text={'Send'}
                />
              </div>
            </div>
          </div>

          {/* Chat   */}
          <div name='chat' className='flex w-[40%] flex-col'>
            <div className='m-1 flex flex-1 flex-col rounded-lg border-r border-l border-gray-800 p-2 shadow-md'>
              <h1 className='m-2 flex justify-center text-xl font-bold text-white underline'>
                Chatbot
              </h1>
              <div className='h-[60vh] flex-1 overflow-y-auto rounded-t-lg p-4'>
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

              {/* Chat Input */}
              <div className='flex items-center rounded-full p-2'>
                <FormInput
                  className='mr-2 flex-1 rounded-xl border px-4 py-2'
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder='Type a message...'
                />
                <Button
                  onClick={sendMessage}
                  className='rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
                  text={'Send'}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
