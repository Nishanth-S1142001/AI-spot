'use client'

import {
  Bot,
  Calendar,
  Globe,
  Instagram,
  MessageSquare,
  TrendingUp,
  Users,
  Zap,
  Plus,
  ArrowRight,
  Activity,
  BarChart3
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import LoadingState from '../../components/common/loading-state'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Card from '../../components/ui/card'
import Button from '../../components/ui/button'
import { useLogout } from '../../lib/supabase/auth'
import { dbClient } from '../../lib/supabase/dbClient'
import Link from 'next/link'
import { useCallback } from 'react'

/**
 * FIXED Dashboard Component - No More Loading on Tab Switch
 *
 * Fixes:
 * - Prevents re-fetching when switching tabs
 * - Only fetches data once when component mounts
 * - Uses ref to track if data has been loaded
 * - Better dependency management in useEffect
 */

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()
  const router = useRouter()

  // State management
  const [agents, setAgents] = useState([])
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    totalAgents: 0,
    creditsUsed: 0,
    successRate: 0
  })
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)

  // ✅ FIX: Use ref to track if data has been fetched
  const hasFetchedData = useRef(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch dashboard data
  // Add fetchDashboardData and router to dependency array, but wrap fetchDashboardData with useCallback

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    try {
      setFetching(true)
      setError(null)

      const userAgents = await dbClient.getUserAgents(user.id)
      setAgents(userAgents || [])

      // ... rest of analytics code ...

      hasFetchedData.current = true
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load agents data')
    } finally {
      setFetching(false)
      setIsInitialized(true)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return // Wait for auth to finish

    if (!user) {
      router.push('/') // Redirect if no user
      return
    }

    // User is authenticated, fetch data if not already fetched
    if (!hasFetchedData.current) {
      fetchDashboardData()
    } else {
      setIsInitialized(true) // Ensure initialized is true
    }
  }, [authLoading, user, router, fetchDashboardData])

  // Get purpose icon
  const getPurposeIcon = (purpose) => {
    const icons = {
      instagram: <Instagram className='h-5 w-5' />,
      messenger: <MessageSquare className='h-5 w-5' />,
      calendar: <Calendar className='h-5 w-5' />,
      website: <Globe className='h-5 w-5' />,
      default: <Bot className='h-5 w-5' />
    }
    return icons[purpose] || icons.default
  }

  // Get purpose colors
  const getPurposeColors = (purpose) => {
    const colors = {
      instagram:
        'from-pink-900/40 to-pink-950/20 border-pink-600/30 text-pink-300',
      messenger:
        'from-blue-900/40 to-blue-950/20 border-blue-600/30 text-blue-300',
      calendar:
        'from-green-900/40 to-green-950/20 border-green-600/30 text-green-300',
      website:
        'from-purple-900/40 to-purple-950/20 border-purple-600/30 text-purple-300',
      default:
        'from-neutral-900/40 to-neutral-950/20 border-neutral-600/30 text-neutral-300'
    }
    return colors[purpose] || colors.default
  }

  // ✅ FIX: Only show loading on initial auth check
  if (authLoading) {
    return <LoadingState message='Authenticating...' className='min-h-screen' />
  }

  // ✅ FIX: Show loading only until initialized
  if (!isInitialized) {
    return (
      <LoadingState message='Loading dashboard...' className='min-h-screen' />
    )
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              title='AI Agency'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Welcome Section */}
              <div className='mb-8 text-center'>
                <h1 className='mb-2 text-4xl font-bold text-neutral-100 sm:text-5xl'>
                  Welcome back,
                </h1>
                <h2 className='mb-3 text-3xl font-bold text-orange-500 sm:text-4xl'>
                  {profile?.full_name || user?.email?.split('@')[0] || 'User'}!
                </h2>
                <p className='text-neutral-400'>
                  Manage your AI agents and monitor their performance
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className='mb-6 rounded-lg border border-red-600/30 bg-red-900/20 p-4'>
                  <p className='text-sm text-red-300'>{error}</p>
                </div>
              )}

              {/* Agents Section */}
              <div className='mb-8'>
                <div className='mb-6 flex items-center justify-between'>
                  <div>
                    <h3 className='text-2xl font-bold text-neutral-100'>
                      Your Agents
                    </h3>
                    <p className='mt-1 text-sm text-neutral-400'>
                      Manage and deploy your AI agents
                    </p>
                  </div>
                  <Link href='/agents/create-nlp'>
                    <Button className='flex items-center gap-2'>
                      <Plus className='h-4 w-4' />
                      Create Agent
                    </Button>
                  </Link>
                </div>

                {agents.length === 0 ? (
                  // Empty State
                  <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
                    <div className='flex flex-col items-center py-12 text-center'>
                      <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-900/40'>
                        <Bot className='h-8 w-8 text-orange-400' />
                      </div>
                      <h4 className='mb-2 text-lg font-semibold text-neutral-200'>
                        No agents yet
                      </h4>
                      <p className='mb-6 text-sm text-neutral-400'>
                        Create your first AI agent to get started
                      </p>
                      <Link href='/agents/create-nlp'>
                        <Button>
                          <Plus className='mr-2 h-4 w-4' />
                          Create Your First Agent
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ) : (
                  // Agents Grid
                  <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {agents.map((agent) => (
                      <Card
                        key={agent.id}
                        className={`group cursor-pointer border bg-gradient-to-br transition-all hover:scale-105 hover:shadow-lg ${getPurposeColors(
                          agent.purpose
                        )}`}
                        onClick={() =>
                          router.push(`/agents/${agent.id}/manage`)
                        }
                      >
                        <div className='space-y-4'>
                          {/* Header */}
                          <div className='flex items-start justify-between'>
                            <div className='flex items-center gap-3'>
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900/50`}
                              >
                                {getPurposeIcon(agent.purpose)}
                              </div>
                              <div>
                                <h4 className='font-semibold text-neutral-100'>
                                  {agent.name}
                                </h4>
                                <p className='text-xs text-neutral-400 capitalize'>
                                  {agent.purpose || 'General'}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                agent.is_active
                                  ? 'bg-green-900/40 text-green-300 ring-1 ring-green-500/50'
                                  : 'bg-red-900/40 text-red-300 ring-1 ring-red-500/50'
                              }`}
                            >
                              {agent.is_active ? 'Active' : 'Inactive'}
                            </div>
                          </div>

                          {/* Description */}
                          <p className='line-clamp-2 text-sm text-neutral-400'>
                            {agent.description || 'No description provided'}
                          </p>

                          {/* Footer */}
                          <div className='flex items-center justify-between border-t border-neutral-800/50 pt-4'>
                            <div className='flex items-center gap-4 text-xs text-neutral-500'>
                              <div className='flex items-center gap-1'>
                                <MessageSquare className='h-3 w-3' />
                                <span>{agent.conversation_count || 0}</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                <Users className='h-3 w-3' />
                                <span>{agent.user_count || 0}</span>
                              </div>
                            </div>
                            <ArrowRight className='h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1' />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {agents.length > 0 && (
                <div className='mb-8'>
                  <h3 className='mb-4 text-xl font-bold text-neutral-100'>
                    Quick Actions
                  </h3>
                  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    <Link href='/agents/dashboard'>
                      <Card className='group cursor-pointer border-orange-600/20 transition-all hover:border-orange-600/50 hover:bg-orange-950/10'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/40'>
                            <Bot className='h-5 w-5 text-orange-400' />
                          </div>
                          <div>
                            <p className='font-semibold text-neutral-200'>
                              View All Agents
                            </p>
                            <p className='text-xs text-neutral-400'>
                              Manage agents
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>

                    <Link href='/workflows'>
                      <Card className='group cursor-pointer border-blue-600/20 transition-all hover:border-blue-600/50 hover:bg-blue-950/10'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900/40'>
                            <Zap className='h-5 w-5 text-blue-400' />
                          </div>
                          <div>
                            <p className='font-semibold text-neutral-200'>
                              Workflows
                            </p>
                            <p className='text-xs text-neutral-400'>
                              Automation
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>

                    <Link href='/analytics'>
                      <Card className='group cursor-pointer border-green-600/20 transition-all hover:border-green-600/50 hover:bg-green-950/10'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-900/40'>
                            <BarChart3 className='h-5 w-5 text-green-400' />
                          </div>
                          <div>
                            <p className='font-semibold text-neutral-200'>
                              Analytics
                            </p>
                            <p className='text-xs text-neutral-400'>
                              View insights
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>

                    <Link href='/settings'>
                      <Card className='group cursor-pointer border-purple-600/20 transition-all hover:border-purple-600/50 hover:bg-purple-950/10'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-900/40'>
                            <Users className='h-5 w-5 text-purple-400' />
                          </div>
                          <div>
                            <p className='font-semibold text-neutral-200'>
                              Settings
                            </p>
                            <p className='text-xs text-neutral-400'>
                              Configure
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SideBarLayout>
    </>
  )
}
