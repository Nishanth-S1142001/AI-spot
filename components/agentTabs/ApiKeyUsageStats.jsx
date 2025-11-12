'use client'

import { BarChart3, DollarSign, Key, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import Card from '../ui/card'

export default function ApiKeyUsageStats({ analytics = [] }) {
  const stats = useMemo(() => {
    if (!analytics || analytics.length === 0) {
      return {
        totalRequests: 0,
        platformRequests: 0,
        userKeyRequests: 0,
        platformPercentage: 0,
        userKeyPercentage: 0,
        totalTokens: 0,
        platformTokens: 0,
        userKeyTokens: 0
      }
    }

    const totalRequests = analytics.length
    const platformRequests = analytics.filter(
      (a) => a.event_data?.api_key_source === 'platform'
    ).length
    const userKeyRequests = analytics.filter(
      (a) => a.event_data?.api_key_source === 'user'
    ).length

    const totalTokens = analytics.reduce((sum, a) => sum + (a.tokens_used || 0), 0)
    const platformTokens = analytics
      .filter((a) => a.event_data?.api_key_source === 'platform')
      .reduce((sum, a) => sum + (a.tokens_used || 0), 0)
    const userKeyTokens = analytics
      .filter((a) => a.event_data?.api_key_source === 'user')
      .reduce((sum, a) => sum + (a.tokens_used || 0), 0)

    return {
      totalRequests,
      platformRequests,
      userKeyRequests,
      platformPercentage: totalRequests > 0 ? ((platformRequests / totalRequests) * 100).toFixed(1) : 0,
      userKeyPercentage: totalRequests > 0 ? ((userKeyRequests / totalRequests) * 100).toFixed(1) : 0,
      totalTokens,
      platformTokens,
      userKeyTokens
    }
  }, [analytics])

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {/* Total Requests */}
      <Card className='p-4'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-blue-900/30 p-2'>
            <BarChart3 className='h-5 w-5 text-blue-400' />
          </div>
          <div className='flex-1'>
            <p className='text-sm text-neutral-400'>Total Requests</p>
            <p className='text-2xl font-bold text-neutral-100'>{stats.totalRequests}</p>
          </div>
        </div>
      </Card>

      {/* Platform Key Usage */}
      <Card className='p-4'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-orange-900/30 p-2'>
            <DollarSign className='h-5 w-5 text-orange-400' />
          </div>
          <div className='flex-1'>
            <p className='text-sm text-neutral-400'>Platform Credits</p>
            <p className='text-2xl font-bold text-neutral-100'>{stats.platformRequests}</p>
            <p className='text-xs text-neutral-500'>{stats.platformPercentage}% of total</p>
          </div>
        </div>
      </Card>

      {/* User Key Usage */}
      <Card className='p-4'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-green-900/30 p-2'>
            <Key className='h-5 w-5 text-green-400' />
          </div>
          <div className='flex-1'>
            <p className='text-sm text-neutral-400'>Your API Key</p>
            <p className='text-2xl font-bold text-neutral-100'>{stats.userKeyRequests}</p>
            <p className='text-xs text-neutral-500'>{stats.userKeyPercentage}% of total</p>
          </div>
        </div>
      </Card>

      {/* Total Tokens */}
      <Card className='p-4'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-purple-900/30 p-2'>
            <TrendingUp className='h-5 w-5 text-purple-400' />
          </div>
          <div className='flex-1'>
            <p className='text-sm text-neutral-400'>Total Tokens</p>
            <p className='text-2xl font-bold text-neutral-100'>
              {stats.totalTokens.toLocaleString()}
            </p>
            <p className='text-xs text-neutral-500'>
              Platform: {stats.platformTokens.toLocaleString()} • User: {stats.userKeyTokens.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}