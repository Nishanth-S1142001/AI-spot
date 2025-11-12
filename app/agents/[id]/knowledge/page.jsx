'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from '../../../../components/providers/AuthProvider'
import {
  useAgent,
  useKnowledgeSources,
  useUpdateKnowledgeSource,
} from '../../../../lib/hooks/useAgentData'
import { useLogout } from '../../../../lib/supabase/auth'
import KnowledgeUploadSection from '../../../../components/KnowledgeUploadSection'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import NeonBackground from '../../../../components/ui/background'
import Card from '../../../../components/ui/card'
import KnowledgeSkeleton from '../../../../components/skeleton/KnowledgeSkeleton'
import LoadingState from '../../../../components/common/loading-state'

import { FileText, Database, Zap, Loader2, Wrench, Link as LinkIcon } from 'lucide-react'

export default function AgentKnowledgePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()

  // Artificial delay so skeleton shows at least 3 seconds
  const [delayedLoading, setDelayedLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // React Query hooks
  const {
    data: agent,
    isLoading: agentLoading,
    error: agentError
  } = useAgent(id)

  const {
    data: knowledgeSources = [],
    isLoading: sourcesLoading,
    refetch: refetchSources
  } = useKnowledgeSources(id, user?.id)

  const updateSourceMutation = useUpdateKnowledgeSource(id)

  // User profile for skeleton
  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }

  // Handle source updates
  const handleSourceAdded = useCallback(
    (source) => {
      updateSourceMutation.mutate({ source, userId: user?.id })
    },
    [updateSourceMutation, user?.id]
  )

  // Memoized stats
  const stats = useMemo(() => {
    const totalVectors = knowledgeSources.reduce(
      (sum, s) => sum + (s.vectorCount || 0),
      0
    )
    const fileCount = knowledgeSources.filter(
      (s) => s.type === 'pdf' || s.type === 'file'
    ).length
    const urlCount = knowledgeSources.filter((s) => s.type === 'url').length
    const textCount = knowledgeSources.filter((s) => s.type === 'text').length
    const instructionsCount = knowledgeSources.filter(
      (s) => s.type === 'instruction'
    ).length

    return {
      total: knowledgeSources.length,
      totalVectors,
      fileCount,
      urlCount,
      textCount,
      instructionsCount
    }
  }, [knowledgeSources])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Handle agent not found
  useEffect(() => {
    if (agentError && !agentLoading) {
      router.push('/agents')
    }
  }, [agentError, agentLoading, router])

  // Show skeleton during delayed loading or initial loading
  if (delayedLoading || authLoading || agentLoading) {
    return (
      <KnowledgeSkeleton
        userProfile={userProfile}
        agentName={agent?.name || 'Agent'}
      />
    )
  }

  if (!agent) {
    return (
      <LoadingState
        message='Agent not found...'
        className='min-h-screen'
      />
    )
  }

  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
          <NavigationBar
            profile={profile}
            title={`${agent.name} - Knowledge Base`}
            onLogOutClick={logout}
          />
        </div>

        {/* Content */}
        <div className='custom-scrollbar flex-1 overflow-y-auto p-6'>
          <div className='mx-auto max-w-6xl'>
            {/* Header */}
            <div className='mb-6'>
              <h1 className='text-3xl font-bold text-neutral-100'>
                Knowledge Base
              </h1>
              <p className='mt-2 text-neutral-400'>
                Manage your agent's knowledge sources and vectorized content
              </p>
            </div>

            {/* Stats Cards */}
            <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
              {/* Total Sources */}
              <Card className='border-purple-600/20 bg-gradient-to-br from-purple-950/10 to-neutral-950/50 transition-all hover:scale-105'>
                <div className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/40 ring-2 ring-purple-600/20'>
                      <Database className='h-6 w-6 text-purple-400' />
                    </div>
                    <div>
                      {sourcesLoading ? (
                        <div className='h-8 w-12 animate-pulse rounded bg-neutral-800' />
                      ) : (
                        <p className='text-2xl font-bold text-neutral-100'>
                          {stats.total}
                        </p>
                      )}
                      <p className='text-xs text-neutral-400'>Total Sources</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Files */}
              <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50 transition-all hover:scale-105'>
                <div className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-900/40 ring-2 ring-orange-600/20'>
                      <FileText className='h-6 w-6 text-orange-400' />
                    </div>
                    <div>
                      {sourcesLoading ? (
                        <div className='h-8 w-12 animate-pulse rounded bg-neutral-800' />
                      ) : (
                        <p className='text-2xl font-bold text-neutral-100'>
                          {stats.fileCount}
                        </p>
                      )}
                      <p className='text-xs text-neutral-400'>Files</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* URLs */}
              <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50 transition-all hover:scale-105'>
                <div className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/40 ring-2 ring-blue-600/20'>
                      <LinkIcon className='h-6 w-6 text-blue-400' />
                    </div>
                    <div>
                      {sourcesLoading ? (
                        <div className='h-8 w-12 animate-pulse rounded bg-neutral-800' />
                      ) : (
                        <p className='text-2xl font-bold text-neutral-100'>
                          {stats.urlCount}
                        </p>
                      )}
                      <p className='text-xs text-neutral-400'>URLs</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Instructions */}
              <Card className='border-red-600/20 bg-gradient-to-br from-red-950/10 to-neutral-950/50 transition-all hover:scale-105'>
                <div className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-900/40 ring-2 ring-red-600/20'>
                      <Wrench className='h-6 w-6 text-red-400' />
                    </div>
                    <div>
                      {sourcesLoading ? (
                        <div className='h-8 w-12 animate-pulse rounded bg-neutral-800' />
                      ) : (
                        <p className='text-2xl font-bold text-neutral-100'>
                          {stats.instructionsCount}
                        </p>
                      )}
                      <p className='text-xs text-neutral-400'>Instructions</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Total Vectors */}
              <Card className='border-green-600/20 bg-gradient-to-br from-green-950/10 to-neutral-950/50 transition-all hover:scale-105'>
                <div className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-900/40 ring-2 ring-green-600/20'>
                      <Zap className='h-6 w-6 text-green-400' />
                    </div>
                    <div>
                      {sourcesLoading ? (
                        <div className='h-8 w-12 animate-pulse rounded bg-neutral-800' />
                      ) : (
                        <p className='text-2xl font-bold text-neutral-100'>
                          {stats.totalVectors.toLocaleString()}
                        </p>
                      )}
                      <p className='text-xs text-neutral-400'>Vectors</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Knowledge Upload Section */}
            <Card className='border-purple-600/20'>
              <div className='p-6'>
                {sourcesLoading ? (
                  <div className='flex items-center justify-center py-16'>
                    <div className='text-center'>
                      <Loader2 className='mx-auto h-12 w-12 animate-spin text-purple-500' />
                      <p className='mt-4 text-sm text-neutral-400'>
                        Loading knowledge sources...
                      </p>
                    </div>
                  </div>
                ) : (
                  <KnowledgeUploadSection
                    agentId={id}
                    userId={user?.id}
                    onSourceAdded={handleSourceAdded}
                    knowledgeSources={knowledgeSources}
                  />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
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