'use client'

import { format } from 'date-fns'
import { Aperture, Bot, Plus, Webhook } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import LoadingState from '../../components/common/loading-state'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'
import { useLogout } from '../../lib/supabase/auth'
import { dbClient, supabase } from '../../lib/supabase/dbClient'
const AgentCardWithInfo = ({ agent, getPurposeIcon }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isTooltipLeft, setIsTooltipLeft] = useState(false)
  const cardRef = useState(null)[0] || useRef(null)

  const handlePositionCheck = () => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const screenWidth = window.innerWidth

    if (rect.right + 300 > screenWidth) {
      setIsTooltipLeft(true)
    } else if (rect.left - 300 < 0) {
      setIsTooltipLeft(false)
    } else {
      setIsTooltipLeft(false)
    }
  }

  const activeBg = agent?.is_active
    ? 'border-green-600/20 bg-green-600/20'
    : 'border-red-600/20 bg-red-600/20'
  const inactiveBg = agent?.is_active ? 'bg-green-600/50' : 'bg-red-600/50'

  return (
    <div
      ref={cardRef}
      className='relative'
      onMouseEnter={() => {
        handlePositionCheck() // Run check ONLY on mouse enter
        setIsHovered(true)
      }}
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
              <div
                className={`h-[200px] w-[200px] rounded-full ${inactiveBg} blur-[80px]`}
              />
            </div>
            <div
              className={`relative flex h-28 w-28 items-center justify-center rounded-full border-4 ${activeBg}`}
            >
              {getPurposeIcon()}
            </div>
          </div>
          <p className='mt-4 text-2xl font-extrabold text-orange-300/80'>
            {agent?.name || 'Untitled Agent'}
          </p>
        </div>

        <div className='p-6'>
          <div className='grid grid-cols-1 justify-between gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3'>
            <Link
              href={`/agents/${agent?.id}/webhook`}
              className='flex'
              prefetch={true}
            >
              <Button variant='outline' className='w-fit'>
                Webhook
              </Button>
            </Link>
          </div>
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
          <p className='font-bold text-orange-200'>{agent?.name}</p>
          <p className='mt-1 text-neutral-300'>
            Status:{' '}
            <span
              className={agent?.is_active ? 'text-green-400' : 'text-red-400'}
            >
              {agent?.is_active ? 'Active' : 'Inactive'}
            </span>
          </p>
          <p className='mt-1 text-neutral-400'>Purpose: {agent?.purpose}</p>
          <p className='mt-1 text-neutral-400'>
            Description: {agent?.description || 'No description provided'}
          </p>
          <p className='mt-2 text-xs text-neutral-500'>
            Created: {format(new Date(agent?.created_at), 'MMM d, yyyy')}
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
    CreditsUsed: 0,
    successRate: 0
  })
  const [message, setMessage] = useState('Webhooks')
  const [title, setTitle] = useState('Ai Agency')
  const { logout } = useLogout()
  const [fetching, setFetching] = useState(true)
  const router = useRouter()
  // In Dashboard component

  const fetchDashboardData = async () => {
    try {
      setFetching(true)
      if (!user) return

      // 1. Fetch all user agents
      const userAgents = await dbClient.getUserAgents(user.id)
      setAgents(userAgents)

      // 2. Fetch all analytics *concurrently* instead of in a loop (N+1 query fix)
      const analyticsPromises = userAgents.map((agent) =>
        dbClient.getAnalytics(agent?.id)
      )
      const allAgentAnalytics = await Promise.all(analyticsPromises)

      let totalConversations = 0
      let totalCreditsUsed = 0 // Assuming 'Credits' is a typo for 'Credits'
      let successfulInteractions = 0
      let totalInteractions = 0

      // 3. Process the results from the concurrent fetches
      allAgentAnalytics.flat().forEach((record) => {
        if (record.event_type === 'conversation') {
          totalConversations++
          totalInteractions++
          if (record.success) successfulInteractions++
        }
        totalCreditsUsed += record.tokens_used || 0
      })

      setAnalytics({
        totalConversations,
        totalAgents: userAgents.length,
        CreditsUsed: totalCreditsUsed,
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
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session)
        router.push('/') // redirect if not logged in
      else setFetching(false)
    })
  }, [])
  useEffect(() => {
    if (user) {
      console.log(user)
      fetchDashboardData()
    }
    setFetching(false) // let the dashboard render even if profile is missing
  }, [user])
  const getPurposeIcon = () => {
    return <Bot className='h-16 w-16 text-white' />
  }

  if (loading) {
    return (
      <LoadingState
        message='Loading... (Refresh the window if delayed)'
        className='min-h-screen'
      />
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
        {fetching ? (
          <div className='flex h-[80vh] items-center justify-center p-6'>
            <div className='text-center'>
              {/* START OF SVG SPINNER REPLACEMENT */}
              <svg
                className='mx-auto mb-4 h-12 w-12 animate-spin text-orange-400'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                {/* Background Ring (e.g., neutral color) */}
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                {/* Foreground Arc (e.g., brand color) */}
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              {/* END OF SVG SPINNER REPLACEMENT */}
              <p className='text-lg text-orange-400'>
                Fetching your dashboard data...
              </p>
            </div>
          </div>
        ) : (
          <div className='relative w-full flex-1 font-mono text-neutral-100'>
            {/* Header is here */}

            <div className='sticky top-0 z-10 mb-10 flex h-16 items-center'>
              <NavigationBar
                profile={profile}
                message={message}
                title={title}
                onLogOutClick={logout}
              />
            </div>
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
                        <Webhook className='h-16 w-16 text-white' />
                      </div>
                    </div>
                    <p className='mt-4 text-lg font-medium text-white'>
                      Click to build your Webhook!
                    </p>
                  </div>
                </Link>

                {/* Agent Info Card Component */}
                {/* <AgentInfoCard 
                            isOpen={isAgentCardOpen} 
                            onClose={() => setIsAgentCardOpen(false)} 
                        /> */}
              </div>
              <div className='mb-8 max-w-sm gap-6'>
                <Card>
                  <div className='flex items-center space-x-6 p-6'>
                    <Aperture className='h-20 w-20 text-neutral-400' />
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
                        <Aperture className='mx-auto mb-4 h-16 w-16 text-neutral-400' />
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
                          <AgentCardWithInfo key={agent?.id} agent={agent} getPurposeIcon={getPurposeIcon} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Recent Activity */}
            </div>
          </div>
        )}
      </SideBarLayout>
    </>
  )
}
