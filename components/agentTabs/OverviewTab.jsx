'use client'
import { format, isValid } from 'date-fns'
import {
  Calendar,
  Check,
  CirclePower,
  Code,
  Copy,
  Cpu,
  ExternalLink,
  FileText,
  Globe,
  Hash,
  Layers,
  MessageCircle,
  MessageSquare,
  Play,
  Settings,
  Share,
  Smile,
  Thermometer,
  Trash2,
  User,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import Button from '../ui/button'
import Card from '../ui/card'

/**
 * Modernized OverviewTab Component with Icon-Only Quick Actions
 * Features:
 * - Icon-only quick actions with tooltips
 * - Expanded agent details (model, temperature, tokens, etc.)
 * - Clean, organized layout
 * - Smooth animations
 * - Professional styling
 */

export default function OverviewTab({
  agent,
  toggleAgentStatus,
  delete_Agent,
  copyEmbedCode,
  copyShareLink,
  shareLink
}) {
  const [linkCopied, setLinkCopied] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const handleCopyLink = () => {
    copyShareLink()
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleCopyEmbed = () => {
    copyEmbedCode()
    setEmbedCopied(true)
    setTimeout(() => setEmbedCopied(false), 2000)
  }

  // Helper to format model name
  const formatModelName = (model) => {
    if (!model) return 'Not specified'
    const modelMap = {
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo'
    }
    return modelMap[model] || model
  }

  // Helper to format services
  const formatServices = (services) => {
    if (!services || services.length === 0) return 'None'
    const serviceMap = {
      calendar: 'Calendar',
      mail: 'Mail'
    }
    return services.map((s) => serviceMap[s] || s).join(', ')
  }

  // Helper to format interface
  const formatInterface = (iface) => {
    if (!iface) return 'Not specified'
    const interfaceMap = {
      website: 'Website Widget',
      sms: 'SMS',
      instagram: 'Instagram'
    }
    return interfaceMap[iface] || iface
  }

  const handleDeleteAgent = useCallback(async () => {
    if (isDeleting) return // Prevent double-click

    try {
      setIsDeleting(true)

      // Fetch dependencies first
      const response = await fetch(`/api/agents/${agent?.id}/dependencies`)

      if (!response.ok) {
        throw new Error('Failed to fetch agent dependencies')
      }

      const dependencies = await response.json()

      // Build detailed warning message
      let warningMessage = '⚠️ DELETE AGENT WARNING\n\n'
      warningMessage += `Agent: "${agent.name}"\n\n`

      if (dependencies.hasActiveDependencies) {
        warningMessage += '🗑️ This will permanently delete:\n\n'

        if (dependencies.webhooks?.length > 0) {
          warningMessage += `• ${dependencies.webhooks.length} Webhook(s)\n`
          dependencies.webhooks.slice(0, 3).forEach((w) => {
            warningMessage += `  - ${w.name}\n`
          })
          if (dependencies.webhooks.length > 3) {
            warningMessage += `  ... and ${dependencies.webhooks.length - 3} more\n`
          }
          warningMessage += '\n'
        }

        if (dependencies.workflows?.length > 0) {
          const activeWorkflows = dependencies.workflows.filter(
            (w) => w.is_active
          )
          warningMessage += `• ${dependencies.workflows.length} Workflow(s)`
          if (activeWorkflows.length > 0) {
            warningMessage += ` (${activeWorkflows.length} active)`
          }
          warningMessage += '\n'
          dependencies.workflows.slice(0, 3).forEach((w) => {
            warningMessage += `  - ${w.name}${w.is_active ? ' (ACTIVE)' : ''}\n`
          })
          if (dependencies.workflows.length > 3) {
            warningMessage += `  ... and ${dependencies.workflows.length - 3} more\n`
          }
          warningMessage += '\n'
        }

        if (dependencies.knowledgeSources?.length > 0) {
          warningMessage += `• ${dependencies.knowledgeSources.length} Knowledge Source(s)\n\n`
        }

        if (dependencies.testAccounts?.length > 0) {
          warningMessage += `• ${dependencies.testAccounts.length} Test Account(s)\n`
          dependencies.testAccounts.slice(0, 3).forEach((acc) => {
            warningMessage += `  - ${acc.name} (${acc.email})\n`
          })
          if (dependencies.testAccounts.length > 3) {
            warningMessage += `  ... and ${dependencies.testAccounts.length - 3} more\n`
          }
          warningMessage += '\n'
        }

        if (dependencies.bookings?.length > 0) {
          warningMessage += `• ${dependencies.bookings.length} Active Booking(s) (will be cancelled)\n\n`
        }

        if (dependencies.smsConfig) {
          warningMessage += `• SMS Configuration (${dependencies.smsConfig.provider})\n\n`
        }

        if (dependencies.calendar) {
          warningMessage += `• Calendar Configuration\n\n`
        }

        if (dependencies.conversationsCount > 0) {
          warningMessage += `📦 Will archive (not delete):\n`
          warningMessage += `• ${dependencies.conversationsCount} Conversation(s)\n`
          warningMessage += `• ${dependencies.analyticsCount} Analytics Record(s)\n\n`
        }

        warningMessage += '🚨 THIS ACTION CANNOT BE UNDONE!\n\n'
        warningMessage += 'Type the agent name to confirm deletion:\n'
        warningMessage += `"${agent.name}"`

        // Require typing agent name for confirmation
        const userInput = prompt(warningMessage)

        if (userInput !== agent.name) {
          if (userInput !== null) {
            toast.error('Agent name does not match. Deletion cancelled.')
          }
          setIsDeleting(false)
          return
        }
      } else {
        // Simple confirmation for agents without dependencies
        warningMessage += 'This agent has no active dependencies.\n\n'
        warningMessage += 'Are you sure you want to delete it?\n'
        warningMessage += 'This action cannot be undone.'

        if (!confirm(warningMessage)) {
          setIsDeleting(false)
          return
        }
      }

      // Call the delete function from parent
      await delete_Agent()
    } catch (error) {
      console.error('Delete preparation failed:', error)
      toast.error('Failed to check agent dependencies. Please try again.')
      setIsDeleting(false)
    }
  }, [agent, delete_Agent, isDeleting])

  return (
    <div className='space-y-6'>
      {/* Status Banner */}
      <div
        className={`rounded-xl border p-4 transition-all ${
          agent?.is_active
            ? 'border-green-600/30 bg-gradient-to-r from-green-950/20 to-neutral-950/50'
            : 'border-orange-600/30 bg-gradient-to-r from-orange-950/20 to-neutral-950/50'
        }`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                agent?.is_active
                  ? 'bg-green-900/40 ring-2 ring-green-500/50'
                  : 'bg-orange-900/40 ring-2 ring-orange-500/50'
              }`}
            >
              {agent?.is_active ? (
                <CirclePower className='h-5 w-5 text-green-400' />
              ) : (
                <Play className='h-5 w-5 text-orange-400' />
              )}
            </div>
            <div>
              <h3 className='font-semibold text-neutral-100'>Agent Status</h3>
              <p className='text-sm text-neutral-400'>
                {agent?.is_active
                  ? 'Your agent is live and ready to chat'
                  : 'Your agent is currently inactive'}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                agent?.is_active
                  ? 'bg-green-900/40 text-green-300 ring-1 ring-green-500/50'
                  : 'bg-orange-900/40 text-orange-300 ring-1 ring-orange-500/50'
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  agent?.is_active ? 'bg-green-500' : 'bg-orange-500'
                } animate-pulse`}
              />
              {agent?.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* LEFT COLUMN - Quick Actions (Icon Only) */}
        <div className='space-y-6 lg:col-span-1'>
          {/* Quick Actions Card */}
          <Card className='border-orange-600/20'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b border-neutral-800 pb-4'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-900/40'>
                  <Play className='h-4 w-4 text-orange-400' />
                </div>
                <h3 className='text-lg font-semibold text-neutral-100'>
                  Quick Actions
                </h3>
              </div>

              {/* Primary Actions - Icon Grid */}
              <div className='grid grid-cols-3 gap-3'>
                {/* Activate/Deactivate */}
                <button
                  onClick={toggleAgentStatus}
                  className={`group relative flex h-16 flex-col items-center justify-center gap-1 rounded-lg border transition-all hover:scale-105 ${
                    agent?.is_active
                      ? 'border-red-600/40 bg-red-950/20 hover:bg-red-950/30'
                      : 'border-green-600/40 bg-green-950/20 hover:bg-green-950/30'
                  }`}
                  title={
                    agent?.is_active ? 'Deactivate Agent' : 'Activate Agent'
                  }
                >
                  {agent?.is_active ? (
                    <CirclePower className='h-6 w-6 text-red-400' />
                  ) : (
                    <Play className='h-6 w-6 text-green-400' />
                  )}
                  <span className='text-xs font-medium text-neutral-400 group-hover:text-neutral-300'>
                    {agent?.is_active ? 'Deactivate' : 'Activate'}
                  </span>
                </button>

                {/* Manage Knowledge */}
                <Link
                  href={`/agents/${agent?.id}/knowledge`}
                  className='group relative flex h-16 flex-col items-center justify-center gap-1 rounded-lg border border-orange-600/40 bg-orange-950/20 transition-all hover:scale-105 hover:bg-orange-950/30'
                  title='Manage Knowledge'
                >
                  <FileText className='h-6 w-6 text-orange-400' />
                  <span className='text-xs font-medium text-neutral-400 group-hover:text-neutral-300'>
                    Knowledge
                  </span>
                </Link>

                {/* Test Playground */}
                <Link
                  href={`/agents/${agent?.id}/playground`}
                  className='group relative flex h-16 flex-col items-center justify-center gap-1 rounded-lg border border-blue-600/40 bg-blue-950/20 transition-all hover:scale-105 hover:bg-blue-950/30'
                  title='Test in Playground'
                >
                  <Play className='h-6 w-6 text-blue-400' />
                  <span className='text-xs font-medium text-neutral-400 group-hover:text-neutral-300'>
                    Playground
                  </span>
                </Link>

                {/* View Conversations */}
                <Link
                  href={`/agents/${agent?.id}/conversations`}
                  className='group relative flex h-16 flex-col items-center justify-center gap-1 rounded-lg border border-purple-600/40 bg-purple-950/20 transition-all hover:scale-105 hover:bg-purple-950/30'
                  title='View Conversations'
                >
                  <MessageSquare className='h-6 w-6 text-purple-400' />
                  <span className='text-xs font-medium text-neutral-400 group-hover:text-neutral-300'>
                    Chats
                  </span>
                </Link>

                {/* Test Accounts */}
                <Link
                  href={`/agents/${agent?.id}/test-accounts`}
                  className='group relative flex h-16 flex-col items-center justify-center gap-1 rounded-lg border border-indigo-600/40 bg-indigo-950/20 transition-all hover:scale-105 hover:bg-indigo-950/30'
                  title='Test Accounts'
                >
                  <Users className='h-6 w-6 text-indigo-400' />
                  <span className='text-xs font-medium text-neutral-400 group-hover:text-neutral-300'>
                    Accounts
                  </span>
                </Link>

                {/* Copy Embed */}
                <button
                  onClick={handleCopyEmbed}
                  className='group relative flex h-16 flex-col items-center justify-center gap-1 rounded-lg border border-teal-600/40 bg-teal-950/20 transition-all hover:scale-105 hover:bg-teal-950/30'
                  title='Copy Embed Code'
                >
                  {embedCopied ? (
                    <Check className='h-6 w-6 text-green-400' />
                  ) : (
                    <Code className='h-6 w-6 text-teal-400' />
                  )}
                  <span className='text-xs font-medium text-neutral-400 group-hover:text-neutral-300'>
                    {embedCopied ? 'Copied!' : 'Embed'}
                  </span>
                </button>
              </div>

              {/* Danger Zone */}
              <div className='space-y-3 border-t border-red-900/30 pt-4'>
                <p className='text-xs font-medium text-neutral-500'>
                  Danger Zone
                </p>
                <Button
                  onClick={handleDeleteAgent}
                  variant='destructive'
                  className='w-full'
                  disabled={isDeleting}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete Agent
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN - Share Link & Details */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Share Test Link Card */}
          <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between border-b border-neutral-800 pb-4'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-900/40'>
                    <Share className='h-4 w-4 text-orange-400' />
                  </div>
                  <h3 className='text-lg font-semibold text-neutral-100'>
                    Share Test Link
                  </h3>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    agent?.is_active
                      ? 'bg-green-900/40 text-green-300 ring-1 ring-green-500/50'
                      : 'bg-orange-900/40 text-orange-300 ring-1 ring-orange-500/50'
                  }`}
                >
                  {agent?.is_active ? '● Live' : '● Inactive'}
                </div>
              </div>

              <p className='text-sm text-neutral-400'>
                Share this link with your team or customers to test your agent
                in a sandbox environment.
              </p>

              {/* Link Display */}
              <div className='flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900/50 p-3'>
                <span className='flex-1 truncate text-sm text-neutral-300'>
                  {shareLink || 'No link available'}
                </span>
                <button
                  onClick={handleCopyLink}
                  className='rounded-md p-2 transition-colors hover:bg-neutral-800'
                  title='Copy link'
                >
                  {linkCopied ? (
                    <Check className='h-4 w-4 text-green-400' />
                  ) : (
                    <Copy className='h-4 w-4 text-orange-400' />
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className='grid grid-cols-2 gap-3'>
                <Button
                  onClick={handleCopyLink}
                  variant='outline'
                  className='w-full'
                >
                  {linkCopied ? (
                    <>
                      <Check className='mr-2 h-4 w-4 text-green-400' />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className='mr-2 h-4 w-4' />
                      Copy Link
                    </>
                  )}
                </Button>
                <a
                  href={shareLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block'
                >
                  <Button variant='default' className='w-full'>
                    <ExternalLink className='mr-2 h-4 w-4' />
                    Open Link
                  </Button>
                </a>
              </div>
            </div>
          </Card>

          {/* Agent Details Card - EXPANDED */}
          <Card className='border-orange-600/20'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b border-neutral-800 pb-4'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-900/40'>
                  <Settings className='h-4 w-4 text-orange-400' />
                </div>
                <h3 className='text-lg font-semibold text-neutral-100'>
                  Agent Configuration
                </h3>
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                {/* Name */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-orange-400' />
                    <label className='text-sm font-medium text-neutral-400'>
                      Name
                    </label>
                  </div>
                  <p className='rounded-lg bg-neutral-900/50 p-3 text-sm text-neutral-200'>
                    {agent?.name || 'Unnamed Agent'}
                  </p>
                </div>

                {/* Domain */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Layers className='h-4 w-4 text-blue-400' />
                    <label className='text-sm font-medium text-neutral-400'>
                      Domain
                    </label>
                  </div>
                  <p className='rounded-lg bg-neutral-900/50 p-3 text-sm text-neutral-200 capitalize'>
                    {agent?.domain || 'Not specified'}
                  </p>
                </div>

                {/* Tone */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Smile className='h-4 w-4 text-purple-400' />
                    <label className='text-sm font-medium text-neutral-400'>
                      Tone
                    </label>
                  </div>
                  <p className='rounded-lg bg-neutral-900/50 p-3 text-sm text-neutral-200 capitalize'>
                    {agent?.tone || 'Not specified'}
                  </p>
                </div>

                {/* Model */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Cpu className='h-4 w-4 text-green-400' />
                    <label className='text-sm font-medium text-neutral-400'>
                      AI Model
                    </label>
                  </div>
                  <p className='rounded-lg bg-neutral-900/50 p-3 text-sm text-neutral-200'>
                    {formatModelName(agent?.model)}
                  </p>
                </div>

         
                {/* Temperature */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Thermometer className='h-4 w-4 text-red-400' />
                    <label className='text-sm font-medium text-neutral-400'>
                      Temperature
                    </label>
                  </div>
                  <p className='rounded-lg bg-neutral-900/50 p-3 text-sm text-neutral-200'>
                    {agent?.temperature !== undefined
                      ? agent.temperature
                      : 'Not set'}
                  </p>
                </div>

                {/* Max Tokens */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Hash className='h-4 w-4 text-yellow-400' />
                    <label className='text-sm font-medium text-neutral-400'>
                      Max Tokens
                    </label>
                  </div>
                  <p className='rounded-lg bg-neutral-900/50 p-3 text-sm text-neutral-200'>
                    {agent?.max_tokens
                      ? agent.max_tokens.toLocaleString()
                      : 'Not set'}
                  </p>
                </div>

                {/* Interface */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Globe className='h-4 w-4 text-cyan-400' />
                    <label className='text-sm font-medium text-neutral-400'>
                      Interface
                    </label>
                  </div>
                  <p className='rounded-lg bg-neutral-900/50 p-3 text-sm text-neutral-200'>
                    {formatInterface(agent?.interface)}
                  </p>
                </div>

                {/* Services */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Settings className='h-4 w-4 text-indigo-400' />
                    <label className='text-sm font-medium text-neutral-400'>
                      Services
                    </label>
                  </div>
                  <p className='rounded-lg bg-neutral-900/50 p-3 text-sm text-neutral-200'>
                    {formatServices(agent?.services)}
                  </p>
                </div>

                {/* Description (Full Width) */}
                <div className='space-y-2 sm:col-span-2'>
                  <div className='flex items-center gap-2'>
                    <MessageCircle className='h-4 w-4 text-orange-400' />
                    <label className='text-sm font-medium text-neutral-400'>
                      Description
                    </label>
                  </div>
                  <p className='rounded-lg bg-neutral-900/50 p-3 text-sm text-neutral-200'>
                    {agent?.description || 'No description provided'}
                  </p>
                </div>

                {/* Created Date */}
                <div className='space-y-2 sm:col-span-2'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-orange-400' />
                    <label className='text-sm font-medium text-neutral-400'>
                      Created
                    </label>
                  </div>
                  <p className='rounded-lg bg-neutral-900/50 p-3 text-sm text-neutral-200'>
                    {agent?.created_at && isValid(new Date(agent.created_at))
                      ? format(
                          new Date(agent.created_at),
                          'MMMM d, yyyy • h:mm a'
                        )
                      : 'Date not available'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style jsx>{`
        button[title]:hover::before,
        a[title]:hover::before {
          content: attr(title);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          font-size: 12px;
          border-radius: 6px;
          white-space: nowrap;
          z-index: 1000;
          pointer-events: none;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        button[title]:hover::after,
        a[title]:hover::after {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-2px);
          border: 6px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.9);
          z-index: 999;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
