'use client'

import {
  Bot,
  Calendar,
  Globe,
  Instagram,
  MessageSquare
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingState from '../../components/common/loading-state'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import { useLogout } from '../../lib/supabase/auth'
import { dbClient, supabase } from '../../lib/supabase/dbClient'
export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const [title, setTitle] = useState('AI Agency')
  const [agents, setAgents] = useState([])
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    totalAgents: 0,
    creditsUsed: 0,
    successRate: 0
  })
  // const [loading, setLoading] = useState(true)
  const [authloading, setAuthLoading] = useState(true)
  const [fetching, setFetching] = useState(true)
  const { logout } = useLogout()
  const router = useRouter()
  const fetchDashboardData = async () => {
    try {
      setFetching(true)
      if (!user) return
      const userAgents = await dbClient.getUserAgents(user.id)
      setAgents(userAgents)

      let totalConversations = 0
      let totalCreditsUsed = 0
      let successfulInteractions = 0
      let totalInteractions = 0

      for (const agent of userAgents) {
        const agentAnalytics = await dbClient.getAnalytics(agent?.id)
        agentAnalytics.forEach((record) => {
          if (record.event_type === 'conversation') {
            totalConversations++
            totalInteractions++
            if (record.success) successfulInteractions++
          }
          totalCreditsUsed += record.tokens_used || 0
        })
      }

      setAnalytics({
        totalConversations,
        totalAgents: userAgents.length,
        creditsUsed: totalCreditsUsed,
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
  const getPurposeIcon = (purpose) => {
    switch (purpose) {
      case 'instagram':
        return <Instagram className='h-5 w-5 text-pink-400' />
      case 'messenger':
        return <MessageSquare className='h-5 w-5 text-blue-400' />
      case 'calendar':
        return <Calendar className='h-5 w-5 text-green-400' />
      case 'website':
        return <Globe className='h-5 w-5 text-purple-400' />
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
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session)
        router.push('/') // redirect if not logged in
      else setFetching(false)
    })
  }, [])
  if (authLoading) {
    return (
      <LoadingState
        message='Loading...(Refresh the window if delayed)'
        className='min-h-screen'
      />
    )
  }

  return (
    <>
      {/* 1. NeonBackground is fixed and z-0 */}
      <NeonBackground />
      {fetching && <LoadingState message='Loading data...' />}
      {/* 2. SideBarLayout is z-10 or higher and contains all layout + content */}
      {/* Remove 'h-screen' and 'overflow-hidden' from main div, let SideBarLayout handle it */}
      <SideBarLayout>
        {/* Everything inside SideBarLayout is rendered as {children} */}
        <div className='relative w-full flex-1 font-mono text-neutral-100'>
          {/* Header is here */}

          <div className='sticky top-0 z-10 mb-10 flex h-16 items-center'>
            <NavigationBar
              profile={profile}
              title={title}
              onLogOutClick={logout}
            />
          </div>
          {/* Analytics */}
          <div className='w-full px-6 py-8'>
            {/* Welcome Section */}
            <div className='mt-40 mb-20 flex flex-col items-center'>
              <h1 className='mb-2 text-6xl font-bold text-neutral-300'>
                Welcome back {profile?.full_name || user?.email}!
              </h1>
              <p className='text-neutral-400'>
                Manage your AI agents and monitor their performance.
              </p>
            </div>

            {/* Agents */}
            {/* Recent Activity */}
          </div>
        </div>
      </SideBarLayout>
    </>
  )
}
