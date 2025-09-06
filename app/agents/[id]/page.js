'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../components/providers/AuthProvider'
import { dbClient } from '../../../lib/supabase/dbClient'
import { updateAgent, deleteAgent } from '../../actions/agents'
import toast from 'react-hot-toast'
import {
  Bot,
  Settings,
  BarChart3,
  Zap,
  Code,
  Play,
  Copy,
  Aperture,
  ExternalLink,
  Edit,
  Trash2,
  ArrowLeft,
  MessageSquare,
  Calendar,
  Instagram,
  Globe,
  Share,
  FileText,
  Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function AgentManagement() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [agent, setAgent] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState([])
  const [analytics, setAnalytics] = useState([])

  useEffect(() => {
    if (id && user) fetchAgentData()
  }, [id, user])

  const fetchAgentData = async () => {
    try {
      setLoading(true)
      const agentData = await dbClient.getAgent(id)
      setAgent(agentData)
      console.log(agentData)
      const conversationData = await dbClient.getConversations(id, 20)
      setConversations(conversationData)

      const analyticsData = await dbClient.getAnalytics(id)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error fetching agent data:', error)
      toast.error('Failed to load agent data')
    } finally {
      setLoading(false)
    }
  }

  const toggleAgentStatus = async () => {
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
  }

  const delete_Agent = async () => {
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
    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/sandbox/${id}`
    navigator.clipboard.writeText(shareLink)
    toast.success('Share link copied to clipboard!')
  }

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
      //     return <Bot className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading && !agent) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900'>
        <div className='text-center'>
          <Aperture className='mx-auto mb-4 h-12 w-12 animate-spin text-neutral-400' />
          <p className='text-lg text-neutral-400'>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <Bot className='mx-auto mb-4 h-16 w-16 text-gray-400' />
          <h2 className='mb-2 text-xl font-semibold text-gray-900'>
            Agent not found
          </h2>
          <p className='mb-6 text-gray-600'>
            The agent you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <Link href='/dashboard' className='btn btn-primary'>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='border-b border-gray-200 bg-white'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button onClick={() => router.back()} className='btn btn-ghost'>
                <ArrowLeft className='h-4 w-4' />
              </button>
              {getPurposeIcon(agent.purpose)}
              <div>
                <h1 className='text-lg font-semibold text-gray-900'>
                  {agent.name}
                </h1>
                <p className='text-sm text-gray-600 capitalize'>
                  {agent.purpose} Agent
                </p>
              </div>
              <div
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  agent.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {agent.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <Link href={`/agents/${id}/test`} className='btn btn-outline'>
                <Play className='mr-2 h-4 w-4' />
                Test
              </Link>
              <button onClick={copyShareLink} className='btn btn-outline'>
                <Share className='mr-2 h-4 w-4' />
                Share
              </button>
              <Link href={`/agents/${id}/edit`} className='btn btn-primary'>
                <Edit className='mr-2 h-4 w-4' />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-8 border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            {[
              { id: 'overview', name: 'Overview', icon: Bot },
              {
                id: 'conversations',
                name: 'Conversations',
                icon: MessageSquare
              },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 },
              { id: 'workflows', name: 'Workflows', icon: Zap },
              { id: 'embed', name: 'Deploy', icon: Code }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
            <div className='grid gap-6 md:grid-cols-2'>
              <div className='card'>
                <div className='card-header'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Agent Details
                  </h3>
                </div>
                <div className='card-content space-y-4'>
                  <div>
                    <label className='text-sm font-medium text-gray-600'>
                      Description
                    </label>
                    <p className='text-gray-900'>
                      {agent.description || 'No description provided'}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-600'>
                      Personality
                    </label>
                    <p className='text-gray-900'>
                      {agent.persona || 'No personality defined'}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-600'>
                      Tone
                    </label>
                    <p className='text-gray-900 capitalize'>{agent.tone}</p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-600'>
                      Created
                    </label>
                    <p className='text-gray-900'>
                      {format(new Date(agent.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>

              <div className='card'>
                <div className='card-header'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Quick Actions
                  </h3>
                </div>
                <div className='card-content space-y-3'>
                  <button
                    onClick={toggleAgentStatus}
                    className={`btn w-full ${agent.is_active ? 'btn-destructive' : 'btn-primary'}`}
                  >
                    {agent.is_active ? 'Deactivate Agent' : 'Activate Agent'}
                  </button>

                  <Link
                    href={`/agents/${id}/test`}
                    className='btn btn-outline w-full'
                  >
                    <Play className='mr-2 h-4 w-4' />
                    Test in Sandbox
                  </Link>

                  <button
                    onClick={copyShareLink}
                    className='btn btn-outline w-full'
                  >
                    <Share className='mr-2 h-4 w-4' />
                    Copy Share Link
                  </button>

                  <button
                    onClick={copyEmbedCode}
                    className='btn btn-outline w-full'
                  >
                    <Code className='mr-2 h-4 w-4' />
                    Copy Embed Code
                  </button>

                  <button
                    onClick={delete_Agent}
                    className='btn btn-destructive w-full'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete Agent
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversations Tab */}
        {activeTab === 'conversations' && (
          <div className='card'>
            <div className='card-header'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Recent Conversations
              </h3>
            </div>
            <div className='card-content space-y-4'>
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className='rounded-lg border border-gray-200 p-4'
                  >
                    <div className='mb-3 flex items-start justify-between'>
                      <span className='text-xs text-gray-500'>
                        {format(
                          new Date(conv.created_at),
                          'MMM d, yyyy h:mm a'
                        )}
                      </span>
                      <span className='text-xs text-gray-500'>
                        Session: {conv.session_id.slice(-8)}
                      </span>
                    </div>
                    <div className='space-y-3'>
                      <div className='flex justify-end'>
                        <div className='max-w-xs rounded-lg bg-blue-100 p-3 text-blue-900'>
                          <p className='text-sm'>{conv.user_message}</p>
                        </div>
                      </div>
                      <div className='flex justify-start'>
                        <div className='max-w-xs rounded-lg bg-gray-100 p-3 text-gray-900'>
                          <p className='text-sm'>{conv.agent_response}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='py-12 text-center'>
                  <MessageSquare className='mx-auto mb-3 h-12 w-12 text-gray-400' />
                  <p className='text-gray-600'>No conversations yet</p>
                  <Link
                    href={`/agents/${id}/test`}
                    className='btn btn-primary mt-3'
                  >
                    Start Testing
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <div className='card p-6 text-center'>
                <MessageSquare className='mx-auto mb-2 h-8 w-8 text-blue-600' />
                <p className='text-2xl font-bold text-gray-900'>
                  {conversations.length}
                </p>
                <p className='text-sm text-gray-600'>Total Conversations</p>
              </div>
              <div className='card p-6 text-center'>
                <BarChart3 className='mx-auto mb-2 h-8 w-8 text-green-600' />
                <p className='text-2xl font-bold text-gray-900'>
                  {analytics.filter((a) => a.success).length}
                </p>
                <p className='text-sm text-gray-600'>Successful Interactions</p>
              </div>
              <div className='card p-6 text-center'>
                <Zap className='mx-auto mb-2 h-8 w-8 text-purple-600' />
                <p className='text-2xl font-bold text-gray-900'>
                  {analytics.reduce((sum, a) => sum + (a.tokens_used || 0), 0)}
                </p>
                <p className='text-sm text-gray-600'>Tokens Used</p>
              </div>
            </div>
          </div>
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className='card'>
            <div className='card-header flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Automation Workflows
              </h3>
              <Link
                href={`/agents/${id}/workflows/create`}
                className='btn btn-primary'
              >
                <Zap className='mr-2 h-4 w-4' /> Create Workflow
              </Link>
            </div>
            <div className='card-content space-y-4'>
              {agent.workflows?.length > 0 ? (
                agent.workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className='flex items-start justify-between rounded-lg border border-gray-200 p-4'
                  >
                    <div>
                      <h4 className='font-medium text-gray-900'>
                        {workflow.name}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {workflow.description}
                      </p>
                      <p className='mt-1 text-xs text-gray-500'>
                        Trigger: {workflow.trigger_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          workflow.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {workflow.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Link
                        href={`/workflows/${workflow.id}`}
                        className='btn btn-ghost btn-sm'
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className='py-12 text-center'>
                  <Zap className='mx-auto mb-3 h-12 w-12 text-gray-400' />
                  <p className='mb-2 text-gray-600'>No workflows created yet</p>
                  <p className='mb-6 text-sm text-gray-500'>
                    Create workflows to automate actions when your agent
                    receives messages
                  </p>
                  <Link
                    href={`/agents/${id}/workflows/create`}
                    className='btn btn-primary'
                  >
                    Create Your First Workflow
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Embed Tab */}
        {activeTab === 'embed' && (
          <div className='space-y-6'>
            <div className='card'>
              <div className='card-header'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Website Embedding
                </h3>
                <p className='text-gray-600'>
                  Add this agent to your website with a simple iframe.
                </p>
              </div>
              <div className='card-content'>
                <div className='mb-4 rounded-lg bg-gray-900 p-4'>
                  <pre className='overflow-x-auto text-sm text-green-400'>
                    {`<iframe
  src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${id}"
  width="350"
  height="500"
  frameborder="0">
</iframe>`}
                  </pre>
                </div>
                <button onClick={copyEmbedCode} className='btn btn-primary'>
                  <Copy className='mr-2 h-4 w-4' /> Copy Embed Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
