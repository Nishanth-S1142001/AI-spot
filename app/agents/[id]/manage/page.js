'use client'
import {
  Aperture,
  BarChart3,
  Calendar,
  Code,
  FileText,
  Instagram,
  Loader2,
  MessageSquare,
  Phone,
  Settings,
  Zap
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../../components/providers/AuthProvider'
import SideBarLayout from '../../../../components/sideBarLayout'
import AgentManagementSkeleton from '../../../../components/skeleton/AgentManagementSkeleton'
import AnalyticsTabSkeleton from '../../../../components/skeleton/AnalyticsTabSkeleton'
import ApiKeySectionSkeleton from '../../../../components/skeleton/ApiKeySectionSkeleton'
import CalendarSettingsSkeleton from '../../../../components/skeleton/CalendarSettingsSkeleton'
import CalendarTabSkeleton from '../../../../components/skeleton/CalendarTabSkeleton'
import ConversationsTabSkeleton from '../../../../components/skeleton/ConversationsTabSkeleton'
import EmbedTabSkeleton from '../../../../components/skeleton/EmbedTabSkeleton'
import KnowledgeTabSkeleton from '../../../../components/skeleton/KnowledgeTabSkeleton'
import OverviewTabSkeleton from '../../../../components/skeleton/OverviewTabSkeleton'
import SmsTabSkeleton from '../../../../components/skeleton/SmsTabSkeleton'
import WorkflowsTabSkeleton from '../../../../components/skeleton/WorkflowsTabSkeleton'
import NeonBackground from '../../../../components/ui/background'
import {
  useAgent,
  useAnalytics,
  useConversation,
  useDeleteAgent,
  usePrefetchAnalytics,
  usePrefetchConversations,
  useToggleAgentStatus
} from '../../../../lib/hooks/useAgentData'
import { useLogout } from '../../../../lib/supabase/auth'

// Dynamic imports
const OverviewTab = dynamic(
  () => import('../../../../components/agentTabs/OverviewTab'),
  { loading: () => <OverviewTabSkeleton />, ssr: false }
)
const ConversationsTab = dynamic(
  () => import('../../../../components/agentTabs/ConversationsTab'),
  { loading: () => <ConversationsTabSkeleton />, ssr: false }
)
const AnalyticsTab = dynamic(
  () => import('../../../../components/agentTabs/AnalyticsTab'),
  { loading: () => <AnalyticsTabSkeleton />, ssr: false }
)
const WorkflowsTab = dynamic(
  () => import('../../../../components/agentTabs/WorkflowsTab'),
  { loading: () => <WorkflowsTabSkeleton />, ssr: false }
)
const EmbedTab = dynamic(
  () => import('../../../../components/agentTabs/EmbedTab'),
  { loading: () => <EmbedTabSkeleton />, ssr: false }
)
const CalendarBookingTab = dynamic(
  () => import('../../../../components/agentTabs/CalendarBookingTab'),
  { loading: () => <CalendarTabSkeleton />, ssr: false }
)
const CalendarSettings = dynamic(
  () => import('../../../../components/CalendarSettings'),
  { loading: () => <CalendarSettingsSkeleton />, ssr: false }
)
const KnowledgeTab = dynamic(
  () => import('../../../../components/agentTabs/KnowledgeTab'),
  { loading: () => <KnowledgeTabSkeleton />, ssr: false }
)
const SmsTab = dynamic(
  () => import('../../../../components/agentTabs/SmsTab'),
  { loading: () => <SmsTabSkeleton />, ssr: false }
)

const ApiKeySectionTab = dynamic(
  () => import('../../../../components/agentTabs/ApiKeySection'),
  { loading: () => <ApiKeySectionSkeleton />, ssr: false }
)

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

// All available tabs with conditions
const ALL_TABS = [
  {
    id: 'overview',
    name: 'Overview',
    icon: Aperture,
    description: 'Agent details and quick actions',
    condition: () => true // Always show
  },
  {
    id: 'apiKeySection',
    name: 'API Key',
    icon: Aperture,
    description: 'Api Key Setting',
    condition: () => true // Always show
  },

  {
    id: 'knowledge',
    name: 'Knowledge',
    icon: FileText,
    description: 'Manage knowledge sources',
    condition: () => true // Always show
  },
  {
    id: 'conversations',
    name: 'Conversations',
    icon: MessageSquare,
    description: 'View chat history',
    condition: () => true // Always show
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    description: 'Performance metrics',
    condition: () => true // Always show
  },
  {
    id: 'workflows',
    name: 'Workflows',
    icon: Zap,
    description: 'Automation & integrations',
    condition: () => true // Always show
  },
  {
    id: 'bookings',
    name: 'Bookings',
    icon: Calendar,
    description: 'Appointment management',
    condition: () => true // Always show
  },
  {
    id: 'calendar-settings',
    name: 'Calendar Setup',
    icon: Settings,
    description: 'Configure booking settings',
    condition: () => true // Always show
  },
  {
    id: 'embed',
    name: 'Deploy',
    icon: Code,
    description: 'Embed & share your agent',
    condition: (agent) => agent?.interface === 'website' // Show only for website interface
  },
  {
    id: 'sms',
    name: 'SMS Bot',
    icon: Phone,
    description: 'SMS configuration and management',
    condition: (agent) => agent?.interface === 'sms' // Show only for SMS interface
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    description: 'Instagram DM configuration',
    condition: (agent) => agent?.interface === 'instagram' // Show only for Instagram interface
  }
]

export default function AgentManagement() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()
  const [activeTab, setActiveTab] = useState('overview')
  const [isDeleting, setIsDeleting] = useState(false)

  // Artificial delay so skeleton shows at least 3 seconds
  const [delayedLoading, setDelayedLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }

  // React Query hooks
  const {
    data: agent,
    isLoading: agentLoading,
    error: agentError
  } = useAgent(id)

  const { data: conversations, isLoading: conversationsLoading } =
    useConversation(id)

  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(id)

  // Mutations
  const toggleStatusMutation = useToggleAgentStatus(id)

  // Prefetch functions
  const prefetchConversations = usePrefetchConversations(id)
  const prefetchAnalytics = usePrefetchAnalytics(id)

  // Memoized share link
  const shareLink = useMemo(
    () => (agent ? `${process.env.NEXT_PUBLIC_APP_URL}/sandbox/${id}` : null),
    [agent, id]
  )

  // Filter tabs based on agent configuration
  const visibleTabs = useMemo(() => {
    if (!agent) return []
    return ALL_TABS.filter((tab) => tab.condition(agent))
  }, [agent])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Handle agent not found
  useEffect(() => {
    if (agentError && !agentLoading && !isDeleting) {
      toast.error('Agent not found')
      router.push('/agents/dashboard')
    }
  }, [agentError, agentLoading, router, isDeleting])

  // Ensure active tab is visible, otherwise switch to overview
  useEffect(() => {
    if (agent && visibleTabs.length > 0) {
      const isActiveTabVisible = visibleTabs.some((tab) => tab.id === activeTab)
      if (!isActiveTabVisible) {
        setActiveTab('overview')
      }
    }
  }, [agent, visibleTabs, activeTab])

  // Actions
  const toggleAgentStatus = useCallback(() => {
    toggleStatusMutation.mutate()
  }, [toggleStatusMutation])

  // ✅ NEW CODE
  const deleteAgentMutation = useDeleteAgent(id, user?.id, () => {
    // This callback will be called after successful deletion
    console.log('🎯 Navigation callback triggered')

    router.push('/agents/dashboard')
  })

  const delete_Agent = useCallback(async () => {
    try {
      setIsDeleting(true) // ← SET FLAG FIRST
      const loadingToast = toast.loading('Deleting agent...')
      await deleteAgentMutation.mutateAsync()
      toast.dismiss(loadingToast)
    } catch (error) {
      console.error('Delete failed:', error)
      setIsDeleting(false)
    }
  }, [deleteAgentMutation])

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

  // Tab change handler with prefetching
  const handleTabChange = useCallback(
    (tabId) => {
      setActiveTab(tabId)

      // Prefetch data for adjacent tabs
      if (tabId === 'overview' || tabId === 'knowledge') {
        prefetchConversations()
      } else if (tabId === 'conversations') {
        prefetchAnalytics()
      }
    },
    [prefetchConversations, prefetchAnalytics]
  )

  // Show skeleton during delayed loading or initial loading
  if (delayedLoading || authLoading || agentLoading) {
    return <AgentManagementSkeleton userProfile={userProfile} />
  }

  // No agent found
  if (!agent) {
    return null
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
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
                      {agent.name}
                    </h1>
                    <div className='flex items-center gap-2 text-sm text-neutral-400'>
                      <span>{agent.description || 'AI Agent'}</span>
                      <span>•</span>
                      <span className='capitalize'>
                        {agent.model || 'GPT-4o'}
                      </span>
                      {agent.interface && (
                        <>
                          <span>•</span>
                          <span className='capitalize'>{agent.interface}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className='flex items-center gap-3'>
                    <div
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                        agent.is_active
                          ? 'bg-green-900/30 text-green-300 ring-1 ring-green-500/50'
                          : 'bg-red-900/30 text-red-300 ring-1 ring-red-500/50'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          agent.is_active ? 'bg-green-500' : 'bg-red-500'
                        } animate-pulse`}
                      />
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation - Only show visible tabs */}
              <div className='mb-6'>
                <div className='rounded-xl border border-neutral-800/50 bg-neutral-950/50 p-1 backdrop-blur-sm'>
                  <nav className='flex flex-wrap gap-1'>
                    {visibleTabs.map((tab) => {
                      const Icon = tab.icon
                      const isActive = activeTab === tab.id

                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          onMouseEnter={() => {
                            // Prefetch on hover
                            if (tab.id === 'conversations')
                              prefetchConversations()
                            if (tab.id === 'analytics') prefetchAnalytics()
                          }}
                          className={`group relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/25'
                              : 'text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200'
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 ${isActive ? '' : 'transition-transform group-hover:scale-110'}`}
                          />
                          <span className='hidden sm:inline'>{tab.name}</span>

                          {/* Hover tooltip for mobile */}
                          <div className='pointer-events-none absolute -top-12 left-1/2 z-50 hidden -translate-x-1/2 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs whitespace-nowrap text-neutral-300 opacity-0 shadow-xl ring-1 ring-neutral-700 transition-opacity group-hover:opacity-100 sm:hidden'>
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

                {activeTab === 'apiKeySection' && (
                  <ApiKeySectionTab agent={agent} agentId={id} />
                )}

                {/* {activeTab === 'apiKeyUsageStats' && (
                  <ApiKeyUsageStats analytics={analytics} />
                )} */}

                {activeTab === 'knowledge' && (
                  <KnowledgeTab agent={agent} agentId={id} userId={user?.id} />
                )}

                {activeTab === 'conversations' &&
                  (conversationsLoading ? (
                    <ConversationsTabSkeleton />
                  ) : (
                    <ConversationsTab
                      conversations={conversations}
                      agentId={id}
                    />
                  ))}

                {activeTab === 'analytics' &&
                  (analyticsLoading ? (
                    <AnalyticsTabSkeleton />
                  ) : (
                    <AnalyticsTab
                      conversations={conversations}
                      analytics={analytics}
                    />
                  ))}

                {activeTab === 'workflows' && (
                  <WorkflowsTab agent={agent} id={id} />
                )}

                {activeTab === 'bookings' && (
                  <CalendarBookingTab agent={agent} id={id} />
                )}

                {activeTab === 'calendar-settings' && (
                  <CalendarSettings agent={agent} id={id} />
                )}

                {activeTab === 'sms' && (
                  <SmsTab agentId={agent?.id} userId={user?.id} />
                )}

                {activeTab === 'embed' && (
                  <EmbedTab id={id} copyEmbedCode={copyEmbedCode} />
                )}

                {/* Instagram tab - placeholder for now */}
                {activeTab === 'instagram' && (
                  <div className='rounded-xl border border-purple-600/20 bg-gradient-to-br from-purple-950/10 to-neutral-950/50 p-8 text-center'>
                    <Instagram className='mx-auto mb-4 h-16 w-16 text-purple-400' />
                    <h3 className='mb-2 text-2xl font-bold text-neutral-100'>
                      Instagram Integration
                    </h3>
                    <p className='text-neutral-400'>
                      Instagram DM integration coming soon. Connect your
                      Instagram account to manage conversations.
                    </p>
                  </div>
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
