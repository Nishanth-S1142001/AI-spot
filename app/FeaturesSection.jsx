'use client'

import { memo } from 'react'
import {
  Activity,
  Bot,
  MessageSquare,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import Card from '../components/ui/card'

const services = [
  {
    icon: Bot,
    title: 'Custom AI Agent Builder',
    description: 'An intuitive drag-and-drop interface to create bespoke AI agents tailored to your unique needs.',
    color: 'orange'
  },
  {
    icon: MessageSquare,
    title: 'Conversational AI',
    description: 'Engage your audience with intelligent, natural language chatbots that understand context and intent.',
    color: 'blue'
  },
  {
    icon: Zap,
    title: 'Automation Workflows',
    description: 'Automate complex processes by chaining AI agents together to perform sophisticated tasks.',
    color: 'purple'
  },
  {
    icon: Users,
    title: 'Collaboration Tools',
    description: 'Empower your team with AI-enhanced collaboration and productivity tools.',
    color: 'green'
  },
  {
    icon: TrendingUp,
    title: 'Analytics & Insights',
    description: 'Gain deep insights into your data through AI-powered analytics and reporting.',
    color: 'pink'
  },
  {
    icon: Activity,
    title: 'Continuous Learning',
    description: 'Our AI agents improve over time, adapting to new data and evolving business needs.',
    color: 'blue'
  }
]

const colorClasses = {
  orange: {
    gradient: 'from-orange-900/40 to-orange-950/20',
    border: 'border-orange-600/30 hover:border-orange-600/50',
    icon: 'text-orange-400',
    glow: 'group-hover:shadow-orange-500/20'
  },
  blue: {
    gradient: 'from-blue-900/40 to-blue-950/20',
    border: 'border-blue-600/30 hover:border-blue-600/50',
    icon: 'text-blue-400',
    glow: 'group-hover:shadow-blue-500/20'
  },
  purple: {
    gradient: 'from-purple-900/40 to-purple-950/20',
    border: 'border-purple-600/30 hover:border-purple-600/50',
    icon: 'text-purple-400',
    glow: 'group-hover:shadow-purple-500/20'
  },
  green: {
    gradient: 'from-green-900/40 to-green-950/20',
    border: 'border-green-600/30 hover:border-green-600/50',
    icon: 'text-green-400',
    glow: 'group-hover:shadow-green-500/20'
  },
  pink: {
    gradient: 'from-pink-900/40 to-pink-950/20',
    border: 'border-pink-600/30 hover:border-pink-600/50',
    icon: 'text-pink-400',
    glow: 'group-hover:shadow-pink-500/20'
  }
}

const FeaturesSection = memo(() => {
  return (
    <section id='services' className='relative bg-neutral-950 px-4 py-20 sm:py-24'>
      <div className='mx-auto max-w-7xl'>
        {/* Heading */}
        <div className='mb-16'>
          <h2 className='text-4xl font-bold text-neutral-100 sm:text-5xl'>
            Our{' '}
            <span className='bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent'>
              Services
            </span>
          </h2>
          <p className='mt-4 text-lg text-neutral-400'>
            Powerful AI solutions designed to transform your business
          </p>
        </div>

        {/* Services Grid */}
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
})

FeaturesSection.displayName = 'FeaturesSection'

// Service Card Component
const ServiceCard = memo(({ service }) => {
  const colors = colorClasses[service.color]
  const Icon = service.icon

  return (
    <Card
      className={`group flex flex-col items-center p-8 text-center transition-all hover:scale-105 
        bg-gradient-to-br ${colors.gradient} ${colors.border} ${colors.glow}`}
    >
      <div className='mb-6 rounded-full bg-neutral-800/50 p-4 ring-1 ring-neutral-700 transition-all group-hover:ring-2 group-hover:ring-current'>
        <Icon className={`h-8 w-8 ${colors.icon}`} />
      </div>
      
      <h3 className='mb-3 text-xl font-semibold text-neutral-100'>
        {service.title}
      </h3>
      
      <p className='text-sm leading-relaxed text-neutral-400'>
        {service.description}
      </p>
    </Card>
  )
})

ServiceCard.displayName = 'ServiceCard'

export default FeaturesSection
