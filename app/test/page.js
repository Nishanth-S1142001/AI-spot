'use client'

import { format } from 'date-fns'
import {
  Activity,
  BarChart3,
  Bot,
  Calendar,
  ChartNoAxesColumnIncreasing,
  Globe,
  Home,
  Instagram,
  MessageSquare,
  Plus,
  Settings,
  TrendingUp,
  User,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../../components/providers/AuthProvider'
import Sidebar from '../../components/sideBar'
import SubSidebar from '../../components/subSideBar'
import NeonBackground from '../../components/ui/background'
import Card from '../../components/ui/card'
import { dbClient } from '../../lib/supabase/dbClient'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [agents, setAgents] = useState([])
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    totalAgents: 0,
    creditsUsed: 0,
    successRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const menuItems = [
  
    {
      name: 'Mini Analysis',
      icon: <ChartNoAxesColumnIncreasing size={20} />,
      submenu: [
        { name: 'Total Agents', href: '/mini-analysis/total' },
        { name: 'Coversations', href: '/mini-analysis/conversaitons' },
        { name: 'Success Rate', href: '/mini-analysis/successRate' },
        { name: 'Credits Used', href: '/mini-analysis/creditsUsed' }
      ]
    },
    {
      name: 'Analytics',
      icon: <BarChart3 size={20} />
      // href: '/settings'
    },
    {
      name: 'Workflow',
      icon: <Zap size={20} />
      // href: '/logout'
    },
      {
      name: 'Dashboard',
      icon: <Home size={20} />
      //  href: '/'
    },
  ]
  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch user's agents
      const userAgents = await dbClient.getUserAgents(user.id)
      setAgents(userAgents)

      // Calculate analytics
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
      setLoading(false)
    }
  }

  const getPurposeIcon = (purpose) => {
    switch (purpose) {
      case 'instagram':
        return <Instagram className='h-5 w-5 text-pink-500' />
      case 'messenger':
        return <MessageSquare className='h-5 w-5 text-blue-500' />
      case 'calendar':
        return <Calendar className='h-5 w-5 text-green-500' />
      case 'website':
        return <Globe className='h-5 w-5 text-purple-500' />
      default:
        return <Bot className='h-5 w-5 text-gray-500' />
    }
  }

  const getPurposeBadgeColor = (purpose) => {
    switch (purpose) {
      case 'instagram':
        return 'bg-pink-100 text-pink-800'
      case 'messenger':
        return 'bg-blue-100 text-blue-800'
      case 'calendar':
        return 'bg-green-100 text-green-800'
      case 'website':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  //   if (loading) {
  //     return (
  //         <>
  //         <NeonBackground/>
  //       <div className="min-h-screen bg-url[(/backgroundImage1.png)] flex items-center justify-center">
  //         <div className="text-center">
  //           <Aperture className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin" />
  //           <p className="text-gray-400">Loading your dashboard...</p>
  //         </div>
  //       </div>
  //       </>
  //     )
  //   }

  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-row'>
        <Sidebar />
        <SubSidebar menuItems={menuItems} />
        <div className='relative flex-1 overflow-y-auto'>
          {/* Header */}

          {/* <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'> */}
          <div className='mx-4 flex h-16 items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <span className='text-xl font-bold text-white'>AgentBuilder</span>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='text-lg text-white'>
                Credits:{' '}
                <span className='font-semibold text-gray-400'>
                  {profile?.api_credits || 0}
                </span>
              </div>
              <Link href='/settings' className='btn btn-ghost text-white'>
                <Settings className='h-6 w-6' />
              </Link>

              <Link href='/profile' className='btn btn-ghost text-white'>
                <User className='h-6 w-6' />
              </Link>
            </div>
          </div>
          {/* </div> */}

          <div className='w-full px-6 py-8'>
            {/* Analytics Cards */}
            <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <div className='card-content p-6'>
                  <div className='flex flex-row items-center justify-center space-x-6'>
                    <Bot className='h-20 w-20 text-blue-400' />
                    <div className='flex flex-row items-center justify-center'>
                      <p className='text-xl font-medium text-white'>
                        Total Agents :
                      </p>

                      <p className='ml-1 text-2xl font-bold text-gray-400'>
                        {analytics.totalAgents}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className='card-content p-6'>
                  <div className='flex flex-row items-center justify-center space-x-6'>
                    <MessageSquare className='h-20 w-20 text-blue-400' />
                    <div className='flex flex-row items-center justify-center'>
                      <p className='text-xl font-medium text-white'>
                        Conversations :
                      </p>
                      <p className='ml-1 text-2xl font-bold text-gray-400'>
                        {analytics.totalConversations}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className='card-content p-6'>
                  <div className='flex flex-row items-center justify-center space-x-6'>
                    <TrendingUp className='h-20 w-20 text-blue-400' />
                    <div className='flex flex-row items-center justify-center'>
                      <p className='text-xl font-medium text-white'>
                        Success Rate
                      </p>
                      <p className='ml-1 text-2xl font-bold text-gray-400'>
                        {analytics.successRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className='card-content p-6'>
                  <div className='flex flex-row items-center justify-center space-x-6'>
                    <Activity className='h-20 w-20 text-blue-400' />
                    <div className='flex flex-row items-center justify-center'>
                      <p className='text-xl font-medium text-white'>
                        Credits Used
                      </p>
                      <p className='ml-1 text-2xl font-bold text-gray-400'>
                        {analytics.creditsUsed}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Welcome Section */}
            <div className='mt-40 mb-20 flex flex-col items-center justify-center'>
              <h1 className='mb-2 text-8xl font-bold text-gray-400'>
                Welcome back {profile?.full_name || user?.email}!
              </h1>
              <p className='text-white'>
                Manage your AI agents and monitor their performance from your
                dashboard.
              </p>
            </div>
            <div className='card'>
              <div className='card-content'>
                {agents.length === 0 ? (
                  <div className='flex flex-row items-center justify-center'>
                    <Link href='/agents/create'>
                      <Card className='py-12 text-center'>
                        <Bot className='mx-auto mb-4 h-16 w-16 text-gray-400' />
                        <h3 className='mb-2 text-lg font-medium text-gray-400'>
                          No agents yet
                        </h3>
                        <p className='mb-6 text-white'>
                          Create your first AI agent to get started with
                          automated conversations.
                        </p>
                      </Card>
                    </Link>
                    {/* Quick Actions */}
                    {/* <div className='mt-8 grid grid-cols-1 gap-4 text-center md:grid-cols-2 lg:grid-cols-4'> */}
                    <div className='ml-10 flex flex-col items-center justify-center text-center text-2xl'>
                      <Link
                        href='/agents/create'
                        className='card border p-6 text-center transition-shadow hover:rounded-full hover:bg-gray-800 hover:shadow-md'
                      >
                        <div className='items-cente flex flex-row justify-center'>
                          <Plus className='mx-auto mr-2 mb-3 h-15 w-15 text-blue-400' />
                          <div className='flex flex-col'>
                            <h3 className='font-medium text-gray-400'>
                              Create Agent :
                            </h3>

                            <p className='text-white'>
                              Build a new AI agent.....
                            </p>
                          </div>
                        </div>
                      </Link>

                      <Link
                        href='/analytics'
                        className='card border p-6 text-center transition-shadow hover:rounded-full hover:bg-gray-800 hover:shadow-md'
                      >
                        <div className='items-cente flex flex-row justify-center text-2xl'>
                          <BarChart3 className='mx-auto mr-2 mb-3 h-15 w-15 text-blue-400' />
                          <div className='flex flex-col'>
                            <h3 className='font-medium text-gray-400'>
                              Analytics
                            </h3>
                            <p className='text-white'>
                              View detailed metrics....
                            </p>
                          </div>
                        </div>
                      </Link>

                      <Link
                        href='/workflows'
                        className='card border p-6 text-center transition-shadow hover:rounded-full hover:bg-gray-800 hover:shadow-md'
                      >
                        <div className='items-cente flex flex-row justify-center text-2xl'>
                          <Zap className='mx-auto mr-2 mb-3 h-15 w-15 text-blue-400' />
                          <div className='flex flex-col'>
                            <h3 className='font-medium text-gray-400'>
                              Workflows
                            </h3>
                            <p className='text-white'>
                              Automation builder......
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                    {/* </div> */}
                  </div>
                ) : (
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className='rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md'
                      >
                        <div className='mb-4 flex items-start justify-between'>
                          <div className='flex items-center space-x-3'>
                            {getPurposeIcon(agent.purpose)}
                            <div>
                              <h3 className='font-semibold text-gray-400'>
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
                            className={`h-3 w-3 rounded-full ${agent.is_active ? 'bg-green-500' : 'bg-gray-400'}`}
                          ></div>
                        </div>

                        <p className='mb-4 line-clamp-2 text-sm text-white'>
                          {agent.description || 'No description provided'}
                        </p>

                        <div className='mb-4 text-xs text-gray-500'>
                          Created{' '}
                          {format(new Date(agent.created_at), 'MMM d, yyyy')}
                        </div>

                        <div className='flex space-x-2'>
                          <Link
                            href={`/agents/${agent.id}`}
                            className='btn btn-primary flex-1 text-sm'
                          >
                            Manage
                          </Link>
                          <Link
                            href={`/agents/${agent.id}/test`}
                            className='btn btn-outline flex-1 text-sm'
                          >
                            Test
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            {agents.length > 0 && (
              <div className='card mt-8'>
                <div className='card-header'>
                  <h2 className='text-xl font-semibold text-gray-400'>
                    Recent Activity
                  </h2>
                </div>
                <div className='card-content'>
                  <div className='space-y-4'>
                    {agents.slice(0, 5).map((agent) => (
                      <div
                        key={agent.id}
                        className='flex items-center justify-between border-b border-gray-100 py-3 last:border-b-0'
                      >
                        <div className='flex items-center space-x-3'>
                          {getPurposeIcon(agent.purpose)}
                          <div>
                            <p className='font-medium text-gray-400'>
                              {agent.name}
                            </p>
                            <p className='text-sm text-white'>
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
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${agent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {agent.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <Link
                            href={`/agents/${agent.id}`}
                            className='btn btn-ghost btn-sm'
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
    