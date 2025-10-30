'use client'

import { memo } from 'react'
import { TrendingUp, Users, Zap, Globe } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Active Users',
    color: 'orange',
    description: 'Businesses trust our platform'
  },
  {
    icon: Zap,
    value: '50,000+',
    label: 'AI Agents Created',
    color: 'blue',
    description: 'Deployed and running'
  },
  {
    icon: TrendingUp,
    value: '99.9%',
    label: 'Uptime',
    color: 'green',
    description: 'Reliable and always available'
  },
  {
    icon: Globe,
    value: '120+',
    label: 'Countries',
    color: 'purple',
    description: 'Global reach and impact'
  }
]

const colorClasses = {
  orange: 'from-orange-500 to-orange-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600'
}

const StatsSection = memo(() => {
  return (
    <section className='relative bg-neutral-900 px-4 py-20 sm:py-24'>
      <div className='mx-auto max-w-7xl'>
        {/* Optional Heading */}
        <div className='mb-12 text-center'>
          <h2 className='text-3xl font-bold text-neutral-100 sm:text-4xl'>
            Trusted by Thousands{' '}
            <span className='bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent'>
              Worldwide
            </span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  )
})

StatsSection.displayName = 'StatsSection'

// Stat Card Component
const StatCard = memo(({ stat }) => {
  const Icon = stat.icon
  const gradientClass = colorClasses[stat.color]

  return (
    <div className='group relative overflow-hidden rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 p-8 text-center transition-all hover:border-orange-600/30 hover:scale-105'>
      {/* Icon */}
      <div className='mb-4 flex justify-center'>
        <div className={`rounded-full bg-gradient-to-br ${gradientClass} p-3 shadow-lg`}>
          <Icon className='h-6 w-6 text-white' />
        </div>
      </div>

      {/* Value */}
      <div className={`mb-2 text-4xl font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
        {stat.value}
      </div>

      {/* Label */}
      <div className='mb-1 text-lg font-semibold text-neutral-100'>
        {stat.label}
      </div>

      {/* Description */}
      <div className='text-sm text-neutral-400'>
        {stat.description}
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${gradientClass} opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-10`} />
    </div>
  )
})

StatCard.displayName = 'StatCard'

export default StatsSection
