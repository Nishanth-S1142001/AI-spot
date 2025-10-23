'use client'
import Card from '../ui/card'
import { MessageSquare, BarChart3, Zap } from 'lucide-react'

export default function AnalyticsTab({ conversations, analytics }) {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <Card>
          <div className='p-6 text-center'>
            <MessageSquare className='mx-auto mb-2 h-8 w-8 text-blue-400' />
            <p className='text-2xl font-bold text-neutral-200'>
              {conversations.length}
            </p>
            <p className='text-sm text-neutral-400'>Total Conversations</p>
          </div>
        </Card>
        <Card>
          <div className='p-6 text-center'>
            <BarChart3 className='mx-auto mb-2 h-8 w-8 text-green-400' />
            <p className='text-2xl font-bold text-neutral-200'>
              {analytics.filter((a) => a.success).length}
            </p>
            <p className='text-sm text-neutral-400'>Successful Interactions</p>
          </div>
        </Card>
        <Card>
          <div className='p-6 text-center'>
            <Zap className='mx-auto mb-2 h-8 w-8 text-purple-400' />
            <p className='text-2xl font-bold text-neutral-200'>
              {analytics.reduce((sum, a) => sum + (a.tokens_used || 0), 0)}
            </p>
            <p className='text-sm text-neutral-400'>Tokens Used</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
