'use client'
import {
  Aperture,
  BarChart3,
  Code,
  MessageSquare,
  Zap,
  Calendar,
  Settings,
  Loader2
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useRef, Suspense } from 'react'
import toast from 'react-hot-toast'
import LoadingState from '../../../../components/common/loading-state'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../../components/providers/AuthProvider'
import SideBarLayout from '../../../../components/sideBarLayout'
import NeonBackground from '../../../../components/ui/background'
import { useLogout } from '../../../../lib/supabase/auth'
import { dbClient } from '../../../../lib/supabase/dbClient'
import { deleteAgent, updateAgent } from '../../../actions/agents'

// Dynamic imports for code splitting
const OverviewTab = dynamic(
  () => import('../../../../components/agentTabs/OverviewTab'),
  { loading: () => <TabLoadingSkeleton /> }
)
const ConversationsTab = dynamic(
  () => import('../../../../components/agentTabs/ConversationsTab'),
  { loading: () => <TabLoadingSkeleton /> }
)
const AnalyticsTab = dynamic(
  () => import('../../../../components/agentTabs/AnalyticsTab'),
  { loading: () => <TabLoadingSkeleton /> }
)
const WorkflowsTab = dynamic(
  () => import('../../../../components/agentTabs/WorkflowsTab'),
  { loading: () => <TabLoadingSkeleton /> }
)
const EmbedTab = dynamic(
  () => import('../../../../components/agentTabs/EmbedTab'),
  { loading: () => <TabLoadingSkeleton /> }
)
const CalendarBookingTab = dynamic(
  () => import('../../../../components/agentTabs/CalendarBookingTab'),
  { loading: () => <TabLoadingSkeleton /> }
)
const CalendarSettings = dynamic(
  () => import('../../../../components/CalendarSettings'),
  { loading: () => <TabLoadingSkeleton /> }
)

// Loading skeleton for tabs
function TabLoadingSkeleton() {
  return (
    <div className='flex items-center justify-center py-16'>
      <div className='text-center'>
        <Loader2 className='mx-auto h-8 w-8 animate-spin text-orange-500' />
        <p className='mt-4 text-sm text-neutral-400'>Loading content...</p>
      </div>
    </div>
  )
}

// Tab configuration
const TABS = [
  { 
    id: 'overview', 
    name: 'Overview', 
    icon: Aperture,
    description: 'Agent details and quick actions'
  },
  {
    id: 'conversations',
    name: 'Conversations',
    icon: MessageSquare,
    description: 'View chat history'
  },
  { 
    id: 'analytics', 
    name: 'Analytics', 
    icon: BarChart3,
    description: 'Performance metrics'
  },
  { 
    id: 'workflows', 
    name: 'Workflows', 
    icon: Zap,
    description: 'Automation & integrations'
  },
  { 
    id: 'bookings', 
    name: 'Bookings', 
    icon: Calendar,
    description: 'Appointment management'
  },
  {
    id: 'calendar-settings',
    name: 'Calendar Setup',
    icon: Settings,
    description: 'Configure booking settings'
  },
  { 
    id: 'embed', 
    name: 'Deploy', 
    icon: Code,
    description: 'Embed & share your agent'
  }
]

export default function AgentManagement() {
  
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()
  const [isInitialized, setIsInitialized] = useState(false)
  
  // State management
  const [agent, setAgent] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [fetching, setFetching] = useState(true)
  const [conversations, setConversations] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [shareLink, setShareLink] = useState(null)

  const fetchedRef = useRef(false)

  // Reset state when agent ID changes
  useEffect(() => {
    fetchedRef.current = false
    setIsInitialized(false)
    setFetching(true)
    setAgent(null)
    setConversations(null)
    setAnalytics(null)
    setShareLink(null)
  }, [id])

  // Fetch core agent data
  const fetchAgentData = useCallback(async () => {
    if (!id || !user || fetchedRef.current) return
    fetchedRef.current = true

    try {
      setFetching(true)
      const agentData = await dbClient.getAgent(id)

      if (!agentData) {
        toast.error('Agent not found')
        router.push('/agents')
        return
      }

      setAgent(agentData)
      setShareLink(`${process.env.NEXT_PUBLIC_APP_URL}/sandbox/${id}`)
    } catch (error) {
      console.error('Error fetching agent data:', error)
      toast.error('Failed to load agent data')
    } finally {
      setFetching(false)
      setIsInitialized(true)
    }
  }, [id, user, router])

  useEffect(() => {
    if (user && !authLoading) {
      fetchAgentData()
    }
  }, [fetchAgentData, user, authLoading])

  // Fetch tab-specific data
  const fetchTabData = useCallback(
    async (tab) => {
      try {
        if (tab === 'conversations' && conversations === null) {
          const conversationData = await dbClient.getConversations(id)
          setConversations(conversationData || [])
        } else if (tab === 'analytics' && analytics === null) {
          const analyticsData = await dbClient.getAnalytics(id)
          setAnalytics(analyticsData || [])
        }
      } catch (error) {
        console.error(`Error fetching data for ${tab}:`, error)
        toast.error(`Failed to load ${tab} data`)
      }
    },
    [id, conversations, analytics]
  )

  useEffect(() => {
    if (activeTab === 'conversations' || activeTab === 'analytics') {
      fetchTabData(activeTab)
    }
  }, [activeTab, fetchTabData])

  // Authentication check
  useEffect(() => {
    if (authLoading === false && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Agent actions
  const toggleAgentStatus = useCallback(async () => {
    if (!agent) return
    try {
      const updatedAgent = await updateAgent(id, {
        is_active: !agent.is_active
      })
      setAgent(updatedAgent)
      toast.success(
        `Agent ${updatedAgent.is_active ? 'activated' : 'deactivated'} successfully`
      )
    } catch (error) {
      console.error('Error updating agent status:', error)
      toast.error('Failed to update agent status')
    }
  }, [agent, id])

  const delete_Agent = useCallback(async () => {
    if (
      !confirm(
        'Are you sure you want to delete this agent? This action cannot be undone.'
      )
    )
      return
    try {
      await deleteAgent(id)
      toast.success('Agent deleted successfully')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting agent:', error)
      toast.error('Failed to delete agent')
    }
  }, [id, router])

  const copyEmbedCode = useCallback(() => {
    if (!agent) return
    const embedCode = `<iframe src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${id}" width="350" height="500" frameborder="0"></iframe>`
    navigator.clipboard.writeText(embedCode)
    toast.success('Embed code copied to clipboard!')
  }, [agent, id])

  const copyShareLink = useCallback(() => {
    if (!shareLink) return
    navigator.clipboard.writeText(shareLink)
    toast.success('Share link copied to clipboard!')
  }, [shareLink])

  // Loading state
  if (authLoading || (fetching && !isInitialized)) {
    return (
      <LoadingState
        message={authLoading ? 'Authenticating...' : 'Loading Agent...'}
        className='min-h-screen'
      />
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
              message='Agent Management'
              agent={agent}
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content Area */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
              {/* Agent Header Card */}
              <div className='mb-8 rounded-2xl border border-orange-600/20 bg-gradient-to-br from-orange-950/10 via-neutral-950/50 to-neutral-950/30 p-6 backdrop-blur-sm'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <h1 className='text-3xl font-bold text-neutral-100'>
                      {agent?.name || 'Loading...'}
                    </h1>
                    <p className='text-sm text-neutral-400'>
                      {agent?.purpose ? `${agent.purpose} Agent` : 'AI Agent'} • 
                      <span className='ml-2'>
                        {agent?.model || 'GPT-4'}
                      </span>
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <div className='flex items-center gap-3'>
                    <div
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                        agent?.is_active
                          ? 'bg-green-900/30 text-green-300 ring-1 ring-green-500/50'
                          : 'bg-red-900/30 text-red-300 ring-1 ring-red-500/50'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          agent?.is_active ? 'bg-green-500' : 'bg-red-500'
                        } animate-pulse`}
                      />
                      {agent?.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className='mb-6'>
                <div className='rounded-xl border border-neutral-800/50 bg-neutral-950/50 p-1 backdrop-blur-sm'>
                  <nav className='flex flex-wrap gap-1'>
                    {TABS.map((tab) => {
                      const Icon = tab.icon
                      const isActive = activeTab === tab.id
                      
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`group relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/25'
                              : 'text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                          <span className='hidden sm:inline'>{tab.name}</span>
                          
                          {/* Hover tooltip for mobile */}
                          <div className='pointer-events-none absolute -top-12 left-1/2 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 opacity-0 shadow-xl ring-1 ring-neutral-700 transition-opacity group-hover:opacity-100 sm:hidden'>
                            {tab.name}
                            <div className='absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-neutral-900' />
                          </div>
                        </button>
                      )
                    })}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className='animate-fadeIn'>
                {/* Overview Tab */}
                {activeTab === 'overview' && agent && (
                  <Suspense fallback={<TabLoadingSkeleton />}>
                    <OverviewTab
                      agent={agent}
                      copyEmbedCode={copyEmbedCode}
                      toggleAgentStatus={toggleAgentStatus}
                      delete_Agent={delete_Agent}
                      copyShareLink={copyShareLink}
                      shareLink={shareLink}
                    />
                  </Suspense>
                )}

                {/* Conversations Tab */}
                {activeTab === 'conversations' && (
                  <Suspense fallback={<TabLoadingSkeleton />}>
                    {conversations === null ? (
                      <TabLoadingSkeleton />
                    ) : (
                      <ConversationsTab conversations={conversations} agentId={id}/>
                    )}
                  </Suspense>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <Suspense fallback={<TabLoadingSkeleton />}>
                    {analytics === null ? (
                      <TabLoadingSkeleton />
                    ) : (
                      <AnalyticsTab
                        conversations={conversations}
                        analytics={analytics}
                      />
                    )}
                  </Suspense>
                )}

                {/* Workflows Tab */}
                {activeTab === 'workflows' && agent && (
                  <Suspense fallback={<TabLoadingSkeleton />}>
                    <WorkflowsTab agent={agent} id={id} />
                  </Suspense>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && agent && (
                  <Suspense fallback={<TabLoadingSkeleton />}>
                    <CalendarBookingTab agent={agent} id={id} />
                  </Suspense>
                )}

                {/* Calendar Settings Tab */}
                {activeTab === 'calendar-settings' && agent && (
                  <Suspense fallback={<TabLoadingSkeleton />}>
                    <CalendarSettings agent={agent} id={id} />
                  </Suspense>
                )}

                {/* Embed/Deploy Tab */}
                {activeTab === 'embed' && (
                  <Suspense fallback={<TabLoadingSkeleton />}>
                    <EmbedTab id={id} copyEmbedCode={copyEmbedCode} />
                  </Suspense>
                )}
              </div>
            </div>
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(23, 23, 23, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 4px;
          transition: background 0.2s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.5);
        }
      `}</style>
    </>
  )
}