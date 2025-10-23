'use client'
import Card from '../ui/card'
import Button from '../ui/button'
import { MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { LoaderPinwheel } from 'lucide-react'

export default function ConversationsTab({ conversations }) {
  if (!conversations.length) {
    return (
      <div className='py-12 text-center'>
        <MessageSquare className='mx-auto mb-3 h-12 w-12 text-neutral-600' />
        <p className='text-neutral-400'>No conversations yet</p>
        <Link
          href={`/agents/${conversations[0]?.agent_id || ''}/test`}
          passHref
        >
          <Button variant='primary' className='mt-3'>
            Start Testing
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <Card>
      <div className='card-header'>
        <h3 className='text-lg font-semibold text-neutral-200'>
          Recent Conversations
        </h3>
      </div>
      <div className='card-content space-y-4'>
        {conversations.map((conv, index) => {
          const currentDate = new Date(conv.created_at)
          const prevDate =
            index > 0 ? new Date(conversations[index - 1].created_at) : null
          const showTimestamp =
            !prevDate ||
            currentDate.toDateString() !== prevDate.toDateString() ||
            Math.abs(currentDate - prevDate) > 5 * 60 * 1000
          return (
            <div key={conv.id} className='relative'>
              {showTimestamp && (
                <div className='my-4 flex items-center justify-center'>
                  <span className='rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400'>
                    {format(currentDate, 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              )}
              <div className='flex flex-col space-y-2'>
                {conv.agent_response && (
                  <div className='flex justify-start'>
                    <div className='flex flex-col'>
                      <LoaderPinwheel className='mt-1 ml-3 h-5 w-5 text-orange-600/40' />
                      <div className='max-w-lg rounded-r-xl rounded-b-xl p-3 text-neutral-200'>
                        <p className='text-sm'>{conv.agent_response}</p>
                      </div>
                    </div>
                  </div>
                )}
                {conv.user_message && (
                  <div className='flex justify-end'>
                    <div className='max-w-xs rounded-l-xl rounded-b-xl border border-orange-700 bg-orange-900/40 p-3 text-white'>
                      <p className='text-sm'>{conv.user_message}</p>
                    </div>
                  </div>
                )}
              </div>
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
    </Card>
  )
}
