'use client'
import Card from '../ui/card'
import Button from '../ui/button'
import {
  CirclePower,
  Play,
  Share,
  Code,
  Trash2,
  Aperture,
  ExternalLink,
  Copy
} from 'lucide-react'
import Link from 'next/link'

import { format, isValid } from 'date-fns'

export default function OverviewTab({
  agent,
  toggleAgentStatus,
  delete_Agent,
  copyEmbedCode,
  copyShareLink,
  shareLink
}) {
  return (
    <div className='space-y-6'>
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
              variant={agent?.is_active ? 'destructive' : 'primary'}
            >
              <div className='flex items-center justify-center'>
                {agent?.is_active ? (
                  <>
                    <CirclePower className='mr-2 h-4 w-4 text-neutral-200' />{' '}
                    Deactivate
                  </>
                ) : (
                  <>
                    <Play className='mr-2 h-4 w-4 text-neutral-200' /> Activate
                  </>
                )}
              </div>
            </Button>
            <Link href={`/agents/${agent?.id}/playground`} passHref>
              <Button variant='outline' className='w-full'>
                <div className='flex items-center justify-center'>
                  <Play className='mr-2 h-4 w-4' /> Playground
                </div>
              </Button>
            </Link>
          </div>

          <Card className='my-10'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-neutral-100'>
                Share Test Link
              </h3>
              <span className='rounded-full bg-green-600/20 px-2 py-1 text-xs font-medium text-green-400'>
                {agent?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Button
              onClick={() => navigator.clipboard.writeText(shareLink)}
              className='mb-4 w-full'
              variant='default'
            >
              <div className='flex items-center justify-center'>
                <Share className='mr-2 h-4 w-4' /> Generate Test Link
              </div>
            </Button>
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

            <div className='grid grid-cols-2 gap-3'>
              <button
                onClick={copyShareLink}
                className='flex items-center justify-center rounded-lg bg-orange-800 px-4 py-2.5 text-sm font-medium text-neutral-100 shadow-sm transition hover:cursor-pointer hover:bg-orange-600/20 hover:text-white'
              >
                <Copy className='mr-2 h-4 w-4' /> Copy Link
              </button>
              <a
                href={shareLink}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center rounded-lg bg-orange-800 px-4 py-2.5 text-sm font-medium text-neutral-100 shadow-sm transition hover:cursor-pointer hover:bg-orange-600/20 hover:text-white'
              >
                <ExternalLink className='mr-2 h-4 w-4' /> Open Link
              </a>
            </div>
            <p className='mt-4 text-center text-xs text-neutral-400'>
              Share this link with your customers to test your agent?.
            </p>
          </Card>

          <div className='flex flex-col gap-3'>
            <Button
              onClick={copyEmbedCode}
              variant='outline'
              className='w-full'
            >
              <div className='flex items-center justify-center'>
                <Code className='mr-2 h-4 w-4' /> Copy Embed Code
              </div>
            </Button>
            <Link href={`/agents/${agent?.id}/conversations`} passHref>
              <Button variant='destructive' className='w-full'>
                <div className='flex items-center justify-center'>
                  <Aperture className='mr-2 h-4 w-4' /> Conversations
                </div>
              </Button>
            </Link>
            <Button
              onClick={delete_Agent}
              variant='destructive'
              className='w-full'
            >
              <div className='flex items-center justify-center'>
                <Trash2 className='mr-2 h-4 w-4' /> Delete Agent
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
              <p className='text-neutral-200 capitalize'>{agent?.tone}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-neutral-400'>
                Created
              </label>
              <p className='text-neutral-200'>
                {agent?.created_at && isValid(new Date(agent.created_at))
                  ? format(new Date(agent.created_at), 'MMM d, yyyy h:mm a')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
