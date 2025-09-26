'use client'

import NeonBackground from '../../components/background'
import { useState, useEffect } from 'react'
import { useAuth } from '../../components/providers/AuthProvider'
import { dbClient } from '../../lib/supabase/dbClient'
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
  ChartNoAxesColumnIncreasing,
  TrendingUp,
  Activity,
  Home,
  Aperture
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import Sidebar from '../../components/sideBar'
import Card from '../../components/card'
import Button from '../../components/button'
import SubSidebar from '../../components/subSideBar'
import FormTextarea from '../../components/textBox'
import { subMenuItems } from '../../config/submenuconfig'
import { menuItems } from '../../config/menuconfig'
export default function Dashboard() {
  const { user, profile, loading } = useAuth()
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
        const agentAnalytics = await dbClient.getAnalytics(agent.id)
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
      <NeonBackground />
      <div className='flex h-screen w-full flex-row font-mono text-neutral-100'>
        <Sidebar   menuItems={menuItems} />
        <SubSidebar  menuItems={ subMenuItems }/>

        <div className='relative flex-1 overflow-y-auto'>
          {/* Header */}
          <div className='mx-4 flex h-16 items-center justify-between border-b border-neutral-700'>
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
              <Card>
                <div className='flex items-center space-x-6 p-6'>
                  <MessageSquare className='h-20 w-20 text-neutral-400' />
                  <div>
                    <p className='text-xl font-medium'>Conversations</p>
                    <p className='text-2xl font-bold text-neutral-300'>
                      {analytics.totalConversations}
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className='flex items-center space-x-6 p-6'>
                  <TrendingUp className='h-20 w-20 text-neutral-400' />
                  <div>
                    <p className='text-xl font-medium'>Success Rate</p>
                    <p className='text-2xl font-bold text-neutral-300'>
                      {analytics.successRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className='flex items-center space-x-6 p-6'>
                  <Activity className='h-20 w-20 text-neutral-400' />
                  <div>
                    <p className='text-xl font-medium'>Credits Used</p>
                    <p className='text-2xl font-bold text-neutral-300'>
                      {analytics.creditsUsed}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

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
            <Card>
              <div className='p-6'>
                {agents.length === 0 ? (
                  <div className='flex flex-row items-center justify-center space-x-10'>
                    <Link href='/agents/create'>
                      <Card className='py-12 text-center'>
                        <Bot className='mx-auto mb-4 h-16 w-16 text-neutral-400' />
                        <h3 className='mb-2 text-lg font-medium text-neutral-300'>
                          No agents yet
                        </h3>
                        <p className='text-neutral-400'>
                          Create your first AI agent to get started.
                        </p>
                      </Card>
                    </Link>

                    <div className='flex flex-col space-y-6 text-center text-2xl'>
                      <Link href='/agents/create'>
                        <Card className='p-6 hover:bg-neutral-800'>
                          <div className='flex items-center space-x-3'>
                            <Plus className='h-12 w-12 text-neutral-400' />
                            <div className='flex flex-col'>
                              <h3 className='font-medium text-neutral-300'>
                                Create Agent
                              </h3>
                              <p className='text-neutral-400'>
                                Build a new AI agent
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>

                      <Link href='/analytics'>
                        <Card className='p-6 hover:bg-neutral-800'>
                          <div className='flex items-center space-x-3'>
                            <BarChart3 className='h-12 w-12 text-neutral-400' />
                            <div className='flex flex-col'>
                              <h3 className='font-medium text-neutral-300'>
                                Analytics
                              </h3>
                              <p className='text-neutral-400'>
                                View detailed metrics
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>

                      <Link href='/workflows'>
                        <Card className='p-6 hover:bg-neutral-800'>
                          <div className='flex items-center space-x-3'>
                            <Zap className='h-12 w-12 text-neutral-400' />
                            <div className='flex flex-col'>
                              <h3 className='font-medium text-neutral-300'>
                                Workflows
                              </h3>
                              <p className='text-neutral-400'>
                                Automation builder
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link href='/agents/create'>
                      <Card className='mb-10 py-12 text-center'>
                        <Bot className='mx-auto mb-4 h-16 w-16 text-neutral-400' />

                        <p className='text-neutral-400'>Build agent....</p>
                      </Card>
                    </Link>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                      {agents.map((agent) => (
                        <Card
                          key={agent.id}
                          className='cursor-pointer border border-neutral-700 hover:shadow-md'
                        >
                          <div className='mb-4 flex items-start justify-between'>
                            <div className='flex items-center space-x-3'>
                              {getPurposeIcon(agent.purpose)}
                              <div>
                                <h3 className='font-semibold text-neutral-300'>
                                  {agent.name}
                                </h3>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPurposeBadgeColor(agent.purpose)}`}
                                >
                                  {agent.purpose}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`h-3 w-3 rounded-full ${
                                agent.is_active
                                  ? 'bg-green-500'
                                  : 'bg-neutral-500'
                              }`}
                            ></div>
                          </div>

                          <p className='mb-4 text-sm text-neutral-400'>
                            {agent.description || 'No description provided'}
                          </p>

                          <div className='mb-4 text-xs text-neutral-500'>
                            Created{' '}
                            {format(new Date(agent.created_at), 'MMM d, yyyy')}
                          </div>

                          <div className='flex space-x-2'>
                            <Link
                              href={`/agents/${agent.id}`}
                              className='flex-1'
                            >
                              <Button>Manage</Button>
                            </Link>
                            <Link
                              href={`/agents/${agent.id}/test`}
                              className='flex-1'
                            >
                              <Button variant='outline'>Test</Button>
                            </Link>
                          </div>
                        </Card>
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
      </div>
    </>
  )
}
