'use client'

import { format } from 'date-fns'
import { Bot, MessageSquare, Play, User } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'

import Button from '../ui/button'
import Card from '../ui/card'

/**
 * OPTIMIZED Conversations Tab Component
 *
 * Improvements:
 * - Memoized message components
 * - Better chat bubble design
 * - Improved scrolling behavior
 * - Cleaner UI matching reference
 */

const ChatMessage = memo(({ message, isAgent }) => (
  <div
    className={`flex items-start gap-3 ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}
  >
    {isAgent && (
      <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-900/40'>
        <Bot className='h-4 w-4 text-orange-400' />
      </div>
    )}
    {!isAgent && (
      <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-900/40'>
        <User className='h-4 w-4 text-blue-400' />
      </div>
    )}
    <div
      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
        isAgent
          ? 'border border-orange-600/30 bg-neutral-900/80 text-neutral-100'
          : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
      }`}
    >
      <p className='text-sm whitespace-pre-wrap'>{message}</p>
    </div>
  </div>
))

ChatMessage.displayName = 'ChatMessage'

const ConversationBlock = memo(({ conv, showTimestamp, index }) => {
  const currentDate = new Date(conv.created_at)

  return (
    <div className='space-y-4'>
      {showTimestamp && (
        <div className='flex items-center justify-center'>
          <div className='flex items-center gap-2 rounded-full bg-neutral-800/50 px-4 py-1.5'>
            <span className='text-xs text-neutral-400'>
              {format(currentDate, 'MMM d, yyyy • h:mm a')}
            </span>
            <span className='text-[10px] text-neutral-600'>
              Session: {conv.session_id.slice(-8)}
            </span>
          </div>
        </div>
      )}

      <div className='space-y-3'>
        {conv.agent_response && (
          <ChatMessage message={conv.agent_response} isAgent={true} />
        )}
        {conv.user_message && (
          <ChatMessage message={conv.user_message} isAgent={false} />
        )}
      </div>
    </div>
  )
})

ConversationBlock.displayName = 'ConversationBlock'

export default function ConversationsTab({ conversations = [], agentId }) {
  if (!conversations.length) {
    return (
      <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
        <div className='flex flex-col items-center py-16 text-center'>
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-900/40'>
            <MessageSquare className='h-8 w-8 text-orange-400' />
          </div>
          <h4 className='mb-2 text-xl font-semibold text-neutral-200'>
            No conversations yet
          </h4>
          <p className='mb-6 max-w-md text-sm text-neutral-400'>
            Start testing your agent to see conversations appear here
          </p>
          <Link href={`/agents/${agentId}/playground`}>
            <Button className='flex items-center gap-2'>
              <Play className='h-4 w-4' />
              Start Testing
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-2xl font-bold text-neutral-100'>
            Recent Conversations
          </h3>
          <p className='mt-1 text-sm text-neutral-400'>
            {conversations.length} total conversation
            {conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href={`/agents/${agentId}/playground`}>
          <Button variant='outline' className='flex items-center gap-2'>
            <Play className='h-4 w-4' />
            Test Agent
          </Button>
        </Link>
      </div>

      {/* Conversations */}
      <Card className='border-neutral-700/50'>
        <div className='custom-scrollbar max-h-[calc(100vh-300px)] space-y-6 overflow-y-auto p-6'>
          {conversations.map((conv, index) => {
            const currentDate = new Date(conv.created_at)
            const prevDate =
              index > 0 ? new Date(conversations[index - 1].created_at) : null
            const showTimestamp = useMemo(() => {
              if (!prevDate) return true
              return (
                currentDate.toDateString() !== prevDate.toDateString() ||
                Math.abs(currentDate - prevDate) > 5 * 60 * 1000
              )
            }, [currentDate, prevDate])

            return (
              <ConversationBlock
                key={conv.id}
                conv={conv}
                showTimestamp={showTimestamp}
                index={index}
              />
            )
          })}
        </div>
      </Card>

      {/* Stats Footer */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/20 to-neutral-950/50'>
          <div className='text-center'>
            <p className='text-sm text-neutral-400'>Total Messages</p>
            <p className='mt-1 text-2xl font-bold text-blue-400'>
              {conversations.reduce((sum, c) => {
                return (
                  sum + (c.user_message ? 1 : 0) + (c.agent_response ? 1 : 0)
                )
              }, 0)}
            </p>
          </div>
        </Card>

        <Card className='border-green-600/20 bg-gradient-to-br from-green-950/20 to-neutral-950/50'>
          <div className='text-center'>
            <p className='text-sm text-neutral-400'>Unique Sessions</p>
            <p className='mt-1 text-2xl font-bold text-green-400'>
              {new Set(conversations.map((c) => c.session_id)).size}
            </p>
          </div>
        </Card>

        <Card className='border-purple-600/20 bg-gradient-to-br from-purple-950/20 to-neutral-950/50'>
          <div className='text-center'>
            <p className='text-sm text-neutral-400'>Response Rate</p>
            <p className='mt-1 text-2xl font-bold text-purple-400'>
              {Math.round(
                (conversations.filter((c) => c.agent_response).length /
                  conversations.length) *
                  100
              )}
              %
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
