'use client'
import { format } from 'date-fns'
import {
  Aperture,
  ArrowLeft,
  BarChart3,
  CirclePower,
  Code,
  Copy,
  Edit,
  ExternalLink,
  Globe,
  LoaderPinwheel,
  MessageSquare,
  Play,
  Share,
  Trash2,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../../../components/providers/AuthProvider'
import SideBarLayout from '../../../../components/sideBarLayout'
import NeonBackground from '../../../../components/ui/background'
import Button from '../../../../components/ui/button'
import Card from '../../../../components/ui/card'
import { dbClient } from '../../../../lib/supabase/dbClient'
import { deleteAgent, updateAgent } from '../../../actions/agents'
import LoadingState from '../../../../components/common/loading-state'
export default function AgentManagement() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [agent, setAgent] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const [fetching, setFetching] = useState(true)
  const [conversations, setConversations] = useState([])
  const [analytics, setAnalytics] = useState([])
  const [shareLink, setShareLink] = useState(null)

  useEffect(() => {
    if (id && user) fetchAgentData()
  }, [id, user])

  const fetchAgentData = async () => {
    try {
      setFetching(true)
      console.log(typeof id, id) // should be string
      const [agentData, conversationData, analyticsData] = await Promise.all([
        dbClient.getAgent(id),
        dbClient.getConversations(id),
        dbClient.getAnalytics(id)
      ])
      setAgent(agentData)
      setConversations(conversationData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error fetching agent data:', error)
      toast.error('Failed to load agent data')
      setAgent(null)
    } finally {
      setFetching(false)
    }
  }
  const toggleAgentStatus = async () => {
    try {
      const updatedAgent = await updateAgent(id, {
        is_active: !agent?.is_active
      })
      setAgent(updatedAgent)
      toast.success(
        `Agent ${updatedAgent?.is_active ? 'activated' : 'deactivated'} successfully`
      )
    } catch (error) {
      console.error('Error updating agent status:', error)
      toast.error('Failed to update agent status')
    }
  }

  const delete_Agent = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this agent?. This action cannot be undone.'
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
  }

  const copyEmbedCode = () => {
    const embedCode = `<iframe
  src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${id}"
  width="350"
  height="500"
  frameborder="0">
</iframe>`
    navigator.clipboard.writeText(embedCode)
    toast.success('Embed code copied to clipboard!')
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast.success('Share link copied to clipboard!')
  }
  const generateShareLink = () => {
    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/sandbox/${id}`
    setShareLink(shareLink)
  }

  useEffect(() => {
    copyShareLink
  }, [agent])

  const getPurposeIcon = (purpose) => {
    switch (purpose) {
      //   case 'instagram':
      //     return <Instagram className="h-5 w-5 text-pink-500" />
      //   case 'messenger':
      //     return <MessageSquare className="h-5 w-5 text-blue-500" />
      //   case 'calendar':
      //     return <Calendar className="h-5 w-5 text-green-500" />
      case 'website':
        return <Globe className='h-5 w-5 text-purple-500' />
      //   default:
      //     return <Aperture className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <LoadingState
        message='Loading... (Refresh the window if delayed)'
        className="min-h-screen"
      />
    )
  }
 
   

  return (
    <>
      <NeonBackground />
      <SideBarLayout>
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
          <div className='flex w-full flex-row font-mono text-neutral-100'>
            <div className='custom-scrollbar relative flex-1 overflow-y-auto'>
              {/* Header */}
              <div className='mx-4 mb-5 flex h-16 items-center justify-between border-b border-neutral-700'>
                <div className='flex items-center space-x-4'>
                  <Button onClick={() => router.back()}>
                    <ArrowLeft className='h-4 w-4' />
                  </Button>
                  {getPurposeIcon(agent?.purpose)}
                  <div>
                    <h1 className='text-lg font-semibold text-neutral-400'>
                      {agent?.name}
                    </h1>
                    <p className='text-sm text-neutral-400 uppercase'>
                      {agent?.purpose} Agent
                    </p>
                  </div>
                  <div
                    className={`h-[20px] w-[20px] rounded-full px-2 py-1 font-medium ${
                      agent?.is_active
                        ? 'bg-green-600 text-green-800'
                        : 'bg-red-500 text-red-800'
                    }`}
                  >
                    {/* {agent?.is_active ? 'Active' : 'Inactive'} */}
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <Link href={`/agents/${id}/playground`} passHref>
                    <Button>
                      <div className='flex items-center'>
                        <Play className='mr-2 h-4 w-4' />
                        Playground
                      </div>
                    </Button>
                  </Link>
                  <Link href={`/sandbox/${id}`} passHref>
                    <Button>
                      <div className='flex items-center'>
                        <Play className='mr-2 h-4 w-4' />
                        Test
                      </div>
                    </Button>
                  </Link>
                  <Button onClick={copyShareLink}>
                    <div className='flex items-center'>
                      <Share className='mr-2 h-4 w-4' />
                      Share
                    </div>
                  </Button>
                  <Link href={`/agents/${id}/edit`} passHref>
                    <Button>
                      <div className='flex items-center'>
                        <Edit className='mr-2 h-4 w-4' />
                        Edit
                      </div>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Tabs */}
              <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
                <div className='mb-8 border-b border-gray-200'>
                  <nav className='-mb-px flex space-x-8'>
                    {[
                      { id: 'overview', name: 'Overview', icon: Aperture },
                      {
                        id: 'conversations',
                        name: 'Chat History',
                        icon: MessageSquare
                      },
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

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className='space-y-6'>
                    {/* Agent Details */}
                    <div className='flex flex-row gap-6 md:flex-row'>
                      <Card className='min-w-sm'>
                        <div className='card-header'>
                          <h3 className='mb-5 flex items-center justify-center text-lg font-semibold text-neutral-100'>
                            Quick Actions
                          </h3>
                        </div>
                        <div className='flex flex-col items-stretch'>
                          <Button
                            onClick={toggleAgentStatus}
                            className='w-full'
                            variant={
                              agent?.is_active ? 'destructive' : 'primary'
                            }
                          >
                            <div className='flex items-center justify-center'>
                              {agent?.is_active ? (
                                <>
                                  <CirclePower className='mr-2 h-4 w-4 text-neutral-200' />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Play className='mr-2 h-4 w-4 text-neutral-200' />
                                  Activate
                                </>
                              )}
                            </div>
                          </Button>
                          <Link href={`/agents/${id}/playground`} passHref>
                            <Button variant='outline' className='w-full'>
                              <div className='flex items-center justify-center'>
                                <Play className='mr-2 h-4 w-4' />
                                Playground
                              </div>
                            </Button>
                          </Link>
                        </div>
                        <Card className='my-10'>
                          {/* Header */}
                          <div className='mb-4 flex items-center justify-between'>
                            <h3 className='text-lg font-semibold text-neutral-100'>
                              Share Test Link
                            </h3>
                            <span className='rounded-full bg-green-600/20 px-2 py-1 text-xs font-medium text-green-400'>
                              {agent?.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          {/* Generate Button */}
                          <Button
                            onClick={generateShareLink}
                            className='mb-4 w-full'
                            variant='default'
                          >
                            <div className='flex items-center justify-center'>
                              <Share className='mr-2 h-4 w-4' />
                              Generate Test Link
                            </div>
                          </Button>
                          {/* Link Box */}
                          <div className='mb-4 flex w-full items-center justify-between rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-sm'>
                            <span className='mr-2 break-all text-neutral-200'>
                              {shareLink || 'No link generated yet'}
                            </span>
                            <button
                              onClick={copyShareLink}
                              className='text-blue-400 transition hover:text-blue-300'
                              title='Copy link'
                            >
                              <Copy className='h-4 w-4 text-orange-400' />
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className='grid grid-cols-2 gap-3'>
                            <button
                              onClick={copyShareLink}
                              className='flex items-center justify-center rounded-lg bg-orange-800 px-4 py-2.5 text-sm font-medium text-neutral-100 shadow-sm transition hover:cursor-pointer hover:bg-orange-600/20 hover:text-white'
                            >
                              <Copy className='mr-2 h-4 w-4' />
                              Copy Link
                            </button>

                            <a
                              href={shareLink}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='flex items-center justify-center rounded-lg bg-orange-800 px-4 py-2.5 text-sm font-medium text-neutral-100 shadow-sm transition hover:cursor-pointer hover:bg-orange-600/20 hover:text-white'
                            >
                              <ExternalLink className='mr-2 h-4 w-4' />
                              Open Link
                            </a>
                          </div>

                          {/* Footer Text */}
                          <p className='mt-4 text-center text-xs text-neutral-400'>
                            Share this link with your customers to test your
                            agent?.
                          </p>
                        </Card>
                        <div className='flex flex-col gap-3'>
                          <Button
                            onClick={copyEmbedCode}
                            variant='outline'
                            className='w-full'
                          >
                            <div className='flex items-center justify-center'>
                              <Code className='mr-2 h-4 w-4' />
                              Copy Embed Code
                            </div>
                          </Button>
                          <Link href={`/agents/${id}/conversations`} passHref>
                            <Button variant='destructive' className='w-full'>
                              <div className='flex items-center justify-center'>
                                <Aperture className='mr-2 h-4 w-4' />
                                Conversations
                              </div>
                            </Button>
                          </Link>
                          <Button
                            onClick={delete_Agent}
                            variant='destructive'
                            className='w-full'
                          >
                            <div className='flex items-center justify-center'>
                              <Trash2 className='mr-2 h-4 w-4' />
                              Delete Agent
                            </div>
                          </Button>
                        </div>
                      </Card>
                      <Card className='w-full'>
                        <div className='card-header'>
                          <h3 className='flex items-center justify-center text-lg font-semibold text-neutral-200'>
                            Agent Details
                          </h3>
                        </div>
                        <div className='card-content space-y-4'>
                          <div>
                            <label className='text-sm font-medium text-neutral-400'>
                              Name
                            </label>
                            <p className='text-neutral-200'>
                              {agent?.name || 'No description provided'}
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-neutral-400'>
                              Description
                            </label>
                            <p className='text-neutral-200'>
                              {agent?.description || 'No description provided'}
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-neutral-400'>
                              Personality
                            </label>
                            <p className='text-neutral-200'>
                              {agent?.persona || 'No personality defined'}
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-neutral-400'>
                              Tone
                            </label>
                            <p className='text-neutral-200 capitalize'>
                              {agent?.tone}
                            </p>
                          </div>
                          <div>
                            <label className='text-sm font-medium text-neutral-400'>
                              Created
                            </label>
                            <p className='text-neutral-200'>
                              {format(
                                new Date(agent?.created_at),
                                'MMM d, yyyy h:mm a'
                              )}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Conversations Tab */}
                {activeTab === 'conversations' && (
                  <Card>
                    <div className='card-header'>
                      <h3 className='text-lg font-semibold text-neutral-200'>
                        Recent Conversations
                      </h3>
                    </div>
                    <div className='card-content space-y-4'>
                      {conversations.length > 0 ? (
                        <div className='space-y-4'>
                          {conversations.map((conv, index) => {
                            const currentDate = new Date(conv.created_at)
                            const prevDate =
                              index > 0
                                ? new Date(conversations[index - 1].created_at)
                                : null

                            // show timestamp only if different from previous message
                            const showTimestamp =
                              !prevDate ||
                              currentDate.toDateString() !==
                                prevDate.toDateString() ||
                              Math.abs(currentDate - prevDate) > 5 * 60 * 1000 // 5 min gap

                            return (
                              <div key={conv.id} className='relative'>
                                {showTimestamp && (
                                  <div className='my-4 flex items-center justify-center'>
                                    <span className='rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400'>
                                      {format(
                                        currentDate,
                                        'MMM d, yyyy h:mm a'
                                      )}
                                    </span>
                                  </div>
                                )}

                                <div className='flex flex-col space-y-2'>
                                  {/* Agent Response */}
                                  {conv.agent_response && (
                                    <div className='flex justify-start'>
                                      <div className='flex flex-col'>
                                        <LoaderPinwheel
                                          className={`mt-1 ml-3 h-5 w-5 text-orange-600/40`}
                                        />
                                        <div className='max-w-lg rounded-r-xl rounded-b-xl p-3 text-neutral-200'>
                                          <p className='text-sm'>
                                            {conv.agent_response}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* User Message */}
                                  {conv.user_message && (
                                    <div className='flex justify-end'>
                                      <div className='max-w-xs rounded-l-xl rounded-b-xl border border-orange-700 bg-orange-900/40 p-3 text-white'>
                                        <p className='text-sm'>
                                          {conv.user_message}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Session ID at right end */}
                                {showTimestamp && (
                                  <div className='absolute top-0 right-0'>
                                    <span className='text-[15px] text-neutral-500'>
                                      Session: {conv.session_id.slice(-8)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className='py-12 text-center'>
                          <MessageSquare className='mx-auto mb-3 h-12 w-12 text-neutral-600' />
                          <p className='text-neutral-400'>
                            No conversations yet
                          </p>
                          <Link href={`/agents/${id}/test`} passHref>
                            <Button variant='primary' className='mt-3'>
                              Start Testing
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <div className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                      <Card>
                        <div className='p-6 text-center'>
                          <MessageSquare className='mx-auto mb-2 h-8 w-8 text-blue-400' />
                          <p className='text-2xl font-bold text-neutral-200'>
                            {conversations.length}
                          </p>
                          <p className='text-sm text-neutral-400'>
                            Total Conversations
                          </p>
                        </div>
                      </Card>
                      <Card>
                        <div className='p-6 text-center'>
                          <BarChart3 className='mx-auto mb-2 h-8 w-8 text-green-400' />
                          <p className='text-2xl font-bold text-neutral-200'>
                            {analytics.filter((a) => a.success).length}
                          </p>
                          <p className='text-sm text-neutral-400'>
                            Successful Interactions
                          </p>
                        </div>
                      </Card>
                      <Card>
                        <div className='p-6 text-center'>
                          <Zap className='mx-auto mb-2 h-8 w-8 text-purple-400' />
                          <p className='text-2xl font-bold text-neutral-200'>
                            {analytics.reduce(
                              (sum, a) => sum + (a.tokens_used || 0),
                              0
                            )}
                          </p>
                          <p className='text-sm text-neutral-400'>
                            Tokens Used
                          </p>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
                {/* Workflows Tab */}
                {activeTab === 'workflows' && (
                  <Card>
                    <div className='card-header flex items-center justify-between'>
                      <h3 className='text-lg font-semibold text-neutral-200'>
                        Automation Workflows
                      </h3>
                      <Link href={`/agents/${id}/workflows/create`} passHref>
                        <Button variant='primary'>
                          <div className='flex items-center'>
                            <Zap className='mr-2 h-4 w-4' />
                            Create Workflow
                          </div>
                        </Button>
                      </Link>
                    </div>
                    <div className='card-content space-y-4'>
                      {agent?.workflows?.length > 0 ? (
                        agent?.workflows.map((workflow) => (
                          <div
                            key={workflow.id}
                            className='flex items-start justify-between rounded-lg border border-neutral-700 p-4'
                          >
                            <div>
                              <h4 className='font-medium text-neutral-200'>
                                {workflow.name}
                              </h4>
                              <p className='text-sm text-neutral-400'>
                                {workflow.description}
                              </p>
                              <p className='mt-1 text-xs text-neutral-500'>
                                Trigger:{' '}
                                {workflow.trigger_type.replace('_', ' ')}
                              </p>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <span
                                className={`rounded px-2 py-1 text-xs font-medium ${
                                  workflow.is_active
                                    ? 'bg-green-600/20 text-green-400'
                                    : 'bg-neutral-700 text-neutral-400'
                                }`}
                              >
                                {workflow.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <Link href={`/workflows/${workflow.id}`} passHref>
                                <Button variant='ghost' className='btn-sm'>
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className='py-12 text-center'>
                          <Zap className='mx-auto mb-3 h-12 w-12 text-neutral-600' />
                          <p className='mb-2 text-neutral-400'>
                            No workflows created yet
                          </p>
                          <p className='mb-6 text-sm text-neutral-500'>
                            Create workflows to automate actions when your agent
                            receives messages
                          </p>
                          <Link
                            href={`/agents/${id}/workflows/create`}
                            passHref
                          >
                            <Button variant='primary'>
                              Create Your First Workflow
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Embed Tab */}
                {activeTab === 'embed' && (
                  <div className='space-y-6'>
                    <Card>
                      <div className='card-header'>
                        <h3 className='text-lg font-semibold text-neutral-200'>
                          Website Embedding
                        </h3>
                        <p className='text-neutral-400'>
                          Add this agent to your website with a simple iframe.
                        </p>
                      </div>
                      <div className='card-content'>
                        <div className='mb-4 rounded-lg bg-neutral-900 p-4'>
                          <pre className='overflow-x-auto text-sm text-green-400'>
                            {`<iframe
  src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${id}"
  width="350"
  height="500"
  frameborder="0">
</iframe>`}
                          </pre>
                        </div>
                        <Button onClick={copyEmbedCode} variant='primary'>
                          <div className='flex items-center'>
                            <Copy className='mr-2 h-4 w-4' />
                            Copy Embed Code
                          </div>
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </SideBarLayout>
    </>
  )
}
