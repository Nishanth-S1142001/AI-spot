'use client'
import Card from '../ui/card'
import Button from '../ui/button'
import {
  CirclePower,
  Play,
  Share,
  Code,
  Trash2,
  MessageSquare,
  ExternalLink,
  Copy,
  Calendar,
  User,
  MessageCircle,
  Smile,
  Check,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { format, isValid } from 'date-fns'
import { useState } from 'react'

/**
 * Modernized OverviewTab Component
 * Features:
 * - Clean, organized layout
 * - Better visual hierarchy
 * - Separated sections for clarity
 * - Smooth animations
 * - Professional styling
 * - Responsive design
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
        {/* LEFT COLUMN - Quick Actions */}
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

              {/* Primary Actions */}
              <div className='space-y-3'>
                <Button
                  onClick={toggleAgentStatus}
                  className='w-full'
                  variant={agent?.is_active ? 'destructive' : 'primary'}
                >
                  {agent?.is_active ? (
                    <>
                      <CirclePower className='mr-2 h-4 w-4' />
                      Deactivate Agent
                    </>
                  ) : (
                    <>
                      <Play className='mr-2 h-4 w-4' />
                      Activate Agent
                    </>
                  )}
                </Button>

                <Link
                  href={`/agents/${agent?.id}/playground`}
                  className='block'
                >
                  <Button variant='outline' className='w-full'>
                    <Play className='mr-2 h-4 w-4' />
                    Test in Playground
                  </Button>
                </Link>

                <Link
                  href={`/agents/${agent?.id}/conversations`}
                  className='block'
                >
                  <Button variant='outline' className='w-full'>
                    <MessageSquare className='mr-2 h-4 w-4' />
                    View Conversations
                  </Button>
                </Link>
                <Link
                  href={`/agents/${agent?.id}/test-accounts`}
                  className='block'
                >
                  <Button variant='outline' className='w-full'>
                    <Users className='mr-2 h-4 w-4' />
                    Test Accounts
                  </Button>
                </Link>
              </div>

              {/* Deployment Actions */}
              <div className='space-y-3 border-t border-neutral-800 pt-4'>
                <Button
                  onClick={handleCopyEmbed}
                  variant='outline'
                  className='w-full'
                >
                  {embedCopied ? (
                    <>
                      <Check className='mr-2 h-4 w-4 text-green-400' />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Code className='mr-2 h-4 w-4' />
                      Copy Embed Code
                    </>
                  )}
                </Button>
              </div>

              {/* Danger Zone */}
              <div className='space-y-3 border-t border-red-900/30 pt-4'>
                <p className='text-xs font-medium text-neutral-500'>
                  Danger Zone
                </p>
                <Button
                  onClick={delete_Agent}
                  variant='destructive'
                  className='w-full'
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

          {/* Agent Details Card */}
          <Card className='border-orange-600/20'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 border-b border-neutral-800 pb-4'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-900/40'>
                  <User className='h-4 w-4 text-orange-400' />
                </div>
                <h3 className='text-lg font-semibold text-neutral-100'>
                  Agent Details
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

                {/* Tone */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Smile className='h-4 w-4 text-orange-400' />
                    <label className='text-sm font-medium text-neutral-400'>
                      Tone
                    </label>
                  </div>
                  <p className='rounded-lg bg-neutral-900/50 p-3 text-sm text-neutral-200 capitalize'>
                    {agent?.tone || 'Not specified'}
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

                {/* Personality (Full Width) */}
                <div className='space-y-2 sm:col-span-2'>
                  <div className='flex items-center gap-2'>
                    <Smile className='h-4 w-4 text-orange-400' />
                    <label className='text-sm font-medium text-neutral-400'>
                      Personality
                    </label>
                  </div>
                  <p className='rounded-lg bg-neutral-900/50 p-3 text-sm text-neutral-200'>
                    {agent?.persona || 'No personality defined'}
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
    </div>
  )
}
