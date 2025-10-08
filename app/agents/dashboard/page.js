'use client'

import NeonBackground from '../../../components/background'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../components/providers/AuthProvider'
import { dbClient } from '../../../lib/supabase/dbClient'
import {
  Bot,
  Plus,
  MessageSquare,
  Calendar,
  Instagram,
  Globe,
  Settings,
  BarChart3,
  Zap,
  User,
  Aperture,
  X,
  Cpu,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import Card from '../../../components/card'
import Button from '../../../components/button'
import SideBarLayout from '../../../components/sideBarLayout'

const AgentInfoCard = ({ isOpen, onClose, agent }) => {
  return (
    <div
      // z-[60] is higher than the regular modal z-50 to ensure it's visible when the modal is closed
      className={`pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-500`}
    >
      <div
        className={`transform transition-all duration-500 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        } pointer-events-auto w-full max-w-sm rounded-xl border border-orange-700/50 bg-gradient-to-br from-orange-800/80 to-neutral-900/90 p-6 shadow-2xl backdrop-blur-md`}
      >
        {agent?.name || ''}
      </div>
    </div>
  )
}
// Create this component *outside* of the Dashboard function, perhaps right before it.

const AgentCardWithInfo = ({ agent, getPurposeIcon }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isTooltipLeft, setIsTooltipLeft] = useState(false)
  const cardRef = useState(null)[0] || useRef(null)

  useEffect(() => {
    if (!cardRef.current) return

    const handlePositionCheck = () => {
      const rect = cardRef.current.getBoundingClientRect()
      const screenWidth = window.innerWidth

      // If tooltip would overflow right side, flip to left
      if (rect.right + 300 > screenWidth) {
        setIsTooltipLeft(true)
      } else if (rect.left - 300 < 0) {
        setIsTooltipLeft(false)
      } else {
        setIsTooltipLeft(false)
      }
    }

    handlePositionCheck()
    window.addEventListener('resize', handlePositionCheck)
    return () => window.removeEventListener('resize', handlePositionCheck)
  }, [cardRef])

  const activeBg = agent.is_active
    ? 'border-green-600/20 bg-green-600/20'
    : 'border-red-600/20 bg-red-600/20'
  const inactiveBg = agent.is_active ? 'bg-green-600/50' : 'bg-red-600/50'

  return (
    <div
      ref={cardRef}
      className='relative'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='relative flex cursor-pointer flex-col items-center justify-center border border-neutral-700 hover:shadow-md'>
        <div className='relative z-10 mt-5 flex w-fit flex-col items-center justify-center'>
          <div className='relative flex h-36 w-36 transform cursor-pointer items-center justify-center transition-transform duration-300 hover:scale-105'>
            {/* <div
              className={`agent-pulse absolute h-36 w-36 rounded-full duration-1000 ${inactiveBg}`}
            />
            <div
              className={`agent-pulse absolute h-48 w-48 rounded-full ${inactiveBg} duration-2000`}
              style={{ animationDelay: '0.5s' }}
            /> */}
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className={`h-[200px] w-[200px] rounded-full ${inactiveBg} blur-[80px]`} />
            </div>
            <div
              className={`relative flex h-28 w-28 items-center justify-center rounded-full border-4 ${activeBg}`}
            >
              {getPurposeIcon(agent.purpose, agent.is_active)}
            </div>
          </div>
          <p className='mt-4 text-2xl font-extrabold text-orange-300/80'>
            {agent.name || 'Untitled Agent'}
          </p>
        </div>

        <div className='flex flex-row justify-between space-x-2 p-6'>
          <Link href={`/agents/${agent.id}`} className='flex-1'>
            <Button>Manage</Button>
          </Link>
          <Link href={`/agents/${agent.id}/edit`} className='flex-1'>
            <Button>Edit</Button>
          </Link>
          <Link href={`/agents/${agent.id}/test`} className='flex-1'>
            <Button variant='outline'>Test</Button>
          </Link>
        </div>
      </div>

      {/* Tooltip (Smart-positioned) */}
      <div
        className={`absolute top-1/2 w-[70%] ${
          isTooltipLeft ? 'right-[70%]' : 'left-[70%]'
        } z-50 -translate-y-1/2 transition-all duration-300 ${
          isHovered
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-90 opacity-0'
        }`}
      >
        <div className='w-64 rounded-xl border border-orange-700/50 bg-gradient-to-br from-orange-800/90 to-neutral-900/95 p-4 text-lg shadow-2xl backdrop-blur-sm'>
          <p className='font-bold text-orange-200'>{agent.name}</p>
          <p className='mt-1 text-neutral-300'>
            Status:{' '}
            <span
              className={agent.is_active ? 'text-green-400' : 'text-red-400'}
            >
              {agent.is_active ? 'Active' : 'Inactive'}
            </span>
          </p>
          <p className='mt-1 text-neutral-400'>Purpose: {agent.purpose}</p>
          <p className='mt-1 text-neutral-400'>
            Description: {agent.description || 'No description provided'}
          </p>
          <p className='mt-2 text-xs text-neutral-500'>
            Created: {format(new Date(agent.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, loading } = useAuth()
  const [agents, setAgents] = useState([])

  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    totalAgents: 0,
    corangeitsUsed: 0,
    successRate: 0
  })
  // const [loading, setLoading] = useState(true)
  const [authloading, setAuthLoading] = useState(true)
  const [fetching, setFetching] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setFetching(true)
      if (!user) return
      const userAgents = await dbClient.getUserAgents(user.id)
      setAgents(userAgents)

      let totalConversations = 0
      let totalCorangeitsUsed = 0
      let successfulInteractions = 0
      let totalInteractions = 0

      for (const agent of userAgents) {
        const agentAnalytics = await dbClient.getAnalytics(agent.id)
        agentAnalytics.forEach((record) => {
          if (record.event_type === 'conversation') {
            totalConversations++
            totalInteractions++
            if (record.success) successfulInteractions++
          }
          totalCorangeitsUsed += record.tokens_used || 0
        })
      }

      setAnalytics({
        totalConversations,
        totalAgents: userAgents.length,
        corangeitsUsed: totalCorangeitsUsed,
        successRate:
          totalInteractions > 0
            ? (successfulInteractions / totalInteractions) * 100
            : 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setFetching(false)
    }
  }
  useEffect(() => {
    if (user) {
      console.log(user)
      fetchDashboardData()
    }
    setFetching(false) // let the dashboard render even if profile is missing
  }, [user])
  const getPurposeIcon = (purpose, is_active) => {
    switch (purpose) {
      case 'instagram':
        return <Instagram className='h-5 w-5 text-pink-400' />
      case 'messenger':
        return <MessageSquare className='h-5 w-5 text-blue-400' />
      case 'calendar':
        return <Calendar className='h-5 w-5 text-green-400' />
      case 'website':
        return <Globe className='h-16 w-16 text-white' />
      default:
        return <Bot className='h-5 w-5 text-neutral-400' />
    }
  }

  const getPurposeBadgeColor = (purpose) => {
    switch (purpose) {
      case 'instagram':
        return 'bg-pink-900 text-pink-200'
      case 'messenger':
        return 'bg-blue-900 text-blue-200'
      case 'calendar':
        return 'bg-green-900 text-green-200'
      case 'website':
        return 'bg-purple-900 text-purple-200'
      default:
        return 'bg-neutral-800 text-neutral-300'
    }
  }

  if (loading || fetching) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <div className='text-center'>
          <Aperture className='mx-auto mb-4 h-12 w-12 animate-spin text-neutral-400' />
          <p className='text-lg text-neutral-400'>Loading ...</p>
          <p className='text-lg text-neutral-400'>
            Refresh the window if it takes time...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 1. NeonBackground is fixed and z-0 */}
      <NeonBackground />

      {/* 2. SideBarLayout is z-10 or higher and contains all layout + content */}
      {/* Remove 'h-screen' and 'overflow-hidden' from main div, let SideBarLayout handle it */}
      <SideBarLayout>
        {/* Everything inside SideBarLayout is rendeorange as {children} */}
        <div className='relative w-full flex-1 font-mono text-neutral-100'>
          {/* Header is here */}
          <div className='sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-700 backdrop-blur-sm'>
            {/* Added a sticky header with dark transparent background to float over scrolling content */}
            <span className='text-xl font-bold'>AgentBuilder</span>
            <div className='flex items-center space-x-4'>
              <div className='text-lg'>
                Credits:{' '}
                <span className='font-semibold text-neutral-400'>
                  {profile?.api_credits || 0}
                </span>
              </div>
              <Link href='/settings'>
                <Settings className='h-6 w-6 text-neutral-400 hover:text-neutral-200' />
              </Link>
              <Link href='/profile'>
                <User className='h-6 w-6 text-neutral-400 hover:text-neutral-200' />
              </Link>
            </div>
          </div>
          {/* Analytics */}
          <div className='w-full px-6 py-8'>
            {/* Hero Content - REPLACED WITH INTERACTIVE AGENT BUTTON */}
            <div
              id='home'
              className='relative flex h-[50vh] flex-col items-center justify-center p-4'
            >
              {/* Static Blur Background */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='h-[600px] w-[600px] rounded-full bg-orange-500/30 blur-[120px]' />
              </div>

              {/* Interactive Agent Button */}
              <Link href='/agents/create'>
                <div
                  className='relative z-10 flex w-fit flex-col items-center justify-center'
                  // onMouseEnter={() => setIsAgentCardOpen(true)}
                  // onMouseLeave={() => setIsAgentCardOpen(false)}
                >
                  <div
                    // onClick={toggleAgentCard}
                    className='relative flex h-36 w-36 transform cursor-pointer items-center justify-center transition-transform duration-300 hover:scale-105'
                  >
                    {/* Pulsing Ring 1 (Inner glow) */}
                    <div
                      className={`agent-pulse absolute h-36 w-36 rounded-full bg-orange-600/50 duration-1000`}
                    />

                    {/* Pulsing Ring 2 (Outer glow) */}
                    <div
                      className={`agent-pulse absolute h-48 w-48 rounded-full bg-orange-600/20 duration-2000`}
                      style={{ animationDelay: '0.5s' }}
                    />

                    {/* Central Button/Core */}
                    <div className='relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-orange-500 bg-orange-700 shadow-2xl shadow-orange-500/50'>
                      <Plus className='h-16 w-16 text-white' />
                    </div>
                  </div>
                  <p className='mt-4 text-lg font-medium text-orange-300/80'>
                    Click to build your agent!
                  </p>
                </div>
              </Link>

              {/* Agent Info Card Component */}
              {/* <AgentInfoCard 
                            isOpen={isAgentCardOpen} 
                            onClose={() => setIsAgentCardOpen(false)} 
                        /> */}
            </div>
            <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <div className='flex items-center space-x-6 p-6'>
                  <Bot className='h-20 w-20 text-neutral-400' />
                  <div>
                    <p className='text-xl font-medium'>Total Agents</p>
                    <p className='text-2xl font-bold text-neutral-300'>
                      {analytics.totalAgents}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            <Card>
              <div className='p-6'>
                {agents.length === 0 ? (
                  <div className='flex flex-row items-center justify-center space-x-10'>
                    <Card className='py-12 text-center'>
                      <Bot className='mx-auto mb-4 h-16 w-16 text-neutral-400' />
                      <h3 className='mb-2 text-lg font-medium text-neutral-300'>
                        No agents yet
                      </h3>
                      <p className='text-neutral-400'>
                        Create your first AI agent to get started.
                      </p>
                    </Card>
                  </div>
                ) : (
                  <>
                    <div className='grid grid-cols-1 gap-6 overflow-visible md:grid-cols-2 lg:grid-cols-3'>
                      {agents.map((agent) => (
                        <AgentCardWithInfo
                          key={agent.id}
                          agent={agent}
                          getPurposeIcon={getPurposeIcon}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Recent Activity */}
            {agents.length > 0 && (
              <Card className='mt-8'>
                <div className='p-6'>
                  <h2 className='mb-4 text-xl font-semibold text-neutral-300'>
                    Recent Activity
                  </h2>
                  <div className='space-y-4'>
                    {agents.slice(0, 5).map((agent) => (
                      <div
                        key={agent.id}
                        className='flex items-center justify-between border-b border-neutral-700 pb-3 last:border-b-0'
                      >
                        <div className='flex items-center space-x-3'>
                          {getPurposeIcon(agent.purpose)}
                          <div>
                            <p className='font-medium text-neutral-300'>
                              {agent.name}
                            </p>
                            <p className='text-sm text-neutral-500'>
                              Last updated{' '}
                              {format(
                                new Date(agent.updated_at),
                                'MMM d, h:mm a'
                              )}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              agent.is_active
                                ? 'bg-green-900 text-green-200'
                                : 'bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {agent.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <Link href={`/agents/${agent.id}`}>
                            <Button variant='ghost' size='sm'>
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </SideBarLayout>
    </>
  )
}
