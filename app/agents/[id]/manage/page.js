'use client'
import {
  Aperture,
  BarChart3,
  Code,
  Globe,
  MessageSquare,
  Zap
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useRef, Suspense } from 'react'
import toast from 'react-hot-toast'
import LoadingState from '../../../../components/common/loading-state'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../../components/providers/AuthProvider'
import SideBarLayout from '../../../../components/sideBarLayout' // Assuming correct path
import NeonBackground from '../../../../components/ui/background' // Assuming correct path
import { useLogout } from '../../../../lib/supabase/auth'
import { dbClient } from '../../../../lib/supabase/dbClient'
import { deleteAgent, updateAgent } from '../../../actions/agents'
import { supabase } from '../../../../lib/supabase/dbClient'

// Dynamic imports are still correct for chunking
const OverviewTab = dynamic(
  () => import('../../../../components/agentTabs/OverviewTab')
)
const ConversationsTab = dynamic(
  () => import('../../../../components/agentTabs/ConversationsTab')
)
const AnalyticsTab = dynamic(
  () => import('../../../../components/agentTabs/AnalyticsTab')
)
const WorkflowsTab = dynamic(
  () => import('../../../../components/agentTabs/WorkflowsTab')
)
const EmbedTab = dynamic(
  () => import('../../../../components/agentTabs/EmbedTab')
)

export default function AgentManagement() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth() // Renamed for clarity
  const { logout } = useLogout()

  const [agent, setAgent] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [fetching, setFetching] = useState(true) // For initial agent data fetch

  // Data for heavy tabs - initialized to null to trigger lazy loading
  const [conversations, setConversations] = useState(null)
  const [analytics, setAnalytics] = useState(null)

  const [shareLink, setShareLink] = useState(null)
  const [message] = useState('Information') // No need for useState if never changed

  // --- Ref to prevent multiple initial fetches ---
  const fetchedRef = useRef(false)

  // --- Core Agent Data Fetch (Runs only once) ---
  const fetchAgentData = useCallback(async () => {
    // Check if initial fetching is done or user is not available
    if (!id || !user || fetchedRef.current) return
    fetchedRef.current = true // Mark as fetched

    let isMounted = true

    try {
      setFetching(true)

      // Only fetch the small, core agent data
      const agentData = await dbClient.getAgent(id)

      if (!isMounted) return

      if (!agentData) {
        toast.error('Agent not found')
        router.push('/agents')
        return
      }

      setAgent(agentData)
      setShareLink(`${process.env.NEXT_PUBLIC_APP_URL}/sandbox/${id}`)
    } catch (error) {
      console.error('Error fetching agent data:', error)
      if (isMounted) toast.error('Failed to load agent data')
    } finally {
      if (isMounted) setFetching(false)
    }

    // Cleanup function is unnecessary here as data isn't being subscribed to
  }, [id, user, router])

  useEffect(() => {
    // Only fetch agent data after user authentication is complete
    if (user && !authLoading) {
        fetchAgentData()
    }
  }, [fetchAgentData, user, authLoading])

  // --- Separate Effect to fetch Conversation/Analytics Data on Tab Click ---
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
        toast.error(`Failed to load ${tab} data.`)
      }
    },
    [id, conversations, analytics]
  )

  useEffect(() => {
    // Trigger fetch for heavy data only when the tab is clicked AND data is null
    if (activeTab === 'conversations' || activeTab === 'analytics') {
      fetchTabData(activeTab)
    }
  }, [activeTab, fetchTabData])
  
  // --- Authentication check (simplified to rely mostly on useAuth) ---
  useEffect(() => {
     if (authLoading === false && !user) {
         router.push('/');
     }
  }, [authLoading, user, router])


  // --- Callbacks for actions (Unchanged, already good) ---
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


  // --- Consolidated Loading State ---
  if (authLoading || fetching || !agent) {
    return (
      <LoadingState
        message={authLoading ? 'Authenticating...' : 'Loading Agent Details...'}
        className='min-h-screen'
      />
    )
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout>
        {/* Suspense wrapper moved out or removed based on the component's structure */}
        <div className='flex w-full flex-row font-mono text-neutral-100'>
          <div className='custom-scrollbar relative flex-1 overflow-y-auto'>
            <div className='sticky top-0 z-10 mb-10 flex h-16 items-center'>
              <NavigationBar
                profile={profile}
                message={message}
                agent={agent}
                onLogOutClick={logout}
              />
            </div>

            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Tabs */}
              <div className='mb-8 border-b border-gray-200'>
                <nav className='-mb-px flex space-x-8'>
                  {[
                    { id: 'overview', name: 'Overview', icon: Aperture },
                    { id: 'conversations', name: 'Chat History', icon: MessageSquare },
                    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                    { id: 'workflows', name: 'Workflows', icon: Zap },
                    { id: 'embed', name: 'Deploy', icon: Code }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-lg font-medium ${
                        activeTab === tab.id
                          ? 'border-orange-500 text-neutral-200'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-neutral-300'
                      }`}
                    >
                      <tab.icon className='h-4 w-4' />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Render active tab */}
              {activeTab === 'overview' && (
                <OverviewTab
                  agent={agent}
                  copyEmbedCode={copyEmbedCode}
                  toggleAgentStatus={toggleAgentStatus}
                  delete_Agent={delete_Agent}
                  copyShareLink={copyShareLink}
                  shareLink={shareLink}
                />
              )}
              
              {/* Lazy-Loaded Conversations Tab */}
              {activeTab === 'conversations' && (
                <Suspense fallback={<LoadingState message='Loading Chat History...' />}>
                  {conversations === null ? (
                    <LoadingState message='Fetching Chat History...' />
                  ) : (
                    <ConversationsTab conversations={conversations} />
                  )}
                </Suspense>
              )}
              
              {/* Lazy-Loaded Analytics Tab */}
              {activeTab === 'analytics' && (
                <Suspense fallback={<LoadingState message='Loading Analytics Data...' />}>
                  {analytics === null ? (
                    <LoadingState message='Fetching Analytics Data...' />
                  ) : (
                    <AnalyticsTab
                      conversations={conversations}
                      analytics={analytics}
                    />
                  )}
                </Suspense>
              )}
              
              {activeTab === 'workflows' && (
                <WorkflowsTab agent={agent} id={id} />
              )}
              
              {activeTab === 'embed' && (
                <EmbedTab id={id} copyEmbedCode={copyEmbedCode} />
              )}
            </div>
          </div>
        </div>
      </SideBarLayout>
    </>
  )
}