'use client'

import { memo } from 'react'
import { Check, Zap, Crown, Rocket } from 'lucide-react'
import Card from '../components/ui/card'
import Button from '../components/ui/button'

const plans = [
  {
    name: 'Starter',
    icon: Rocket,
    price: 'Free',
    period: null,
    description: 'Perfect for trying out our platform',
    features: [
      '1 AI Agent',
      '1,000 Operations/mo',
      'Basic Templates',
      'Community Support',
      'Basic Analytics'
    ],
    cta: 'Get Started',
    popular: false,
    color: 'blue'
  },
  {
    name: 'Pro',
    icon: Zap,
    price: '$99',
    period: '/mo',
    description: 'Best for growing businesses',
    features: [
      '10 AI Agents',
      '100,000 Operations/mo',
      'Advanced API Integrations',
      'Priority Support',
      'Advanced Analytics',
      'Custom Templates'
    ],
    cta: 'Choose Pro',
    popular: true,
    color: 'orange'
  },
  {
    name: 'Enterprise',
    icon: Crown,
    price: 'Custom',
    period: null,
    description: 'For large-scale operations',
    features: [
      'Unlimited AI Agents',
      'Unlimited Operations',
      'Dedicated Account Manager',
      '24/7 Support',
      'Custom Integrations',
      'SLA Guarantee'
    ],
    cta: 'Contact Sales',
    popular: false,
    color: 'purple'
  }
]

const colorClasses = {
  orange: {
    badge: 'bg-orange-500/10 text-orange-400 ring-orange-500/20',
    border: 'border-orange-600/30 hover:border-orange-600/50',
    gradient: 'from-orange-900/40 to-orange-950/20',
    icon: 'text-orange-400',
    button: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
  },
  blue: {
    badge: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    border: 'border-blue-600/30 hover:border-blue-600/50',
    gradient: 'from-blue-900/40 to-blue-950/20',
    icon: 'text-blue-400',
    button: 'bg-neutral-800 hover:bg-neutral-700'
  },
  purple: {
    badge: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
    border: 'border-purple-600/30 hover:border-purple-600/50',
    gradient: 'from-purple-900/40 to-purple-950/20',
    icon: 'text-purple-400',
    button: 'bg-neutral-800 hover:bg-neutral-700'
  }
}

const PricingSection = memo(({ onSelectPlan }) => {
  return (
    <section id='pricing' className='relative bg-neutral-950 px-4 py-20 sm:py-24'>
      <div className='mx-auto max-w-7xl'>
        {/* Heading */}
        <div className='mb-16 text-center'>
          <h2 className='text-4xl font-bold text-neutral-100 sm:text-5xl'>
            Simple,{' '}
            <span className='bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent'>
              Transparent
            </span>{' '}
            Pricing
          </h2>
          <p className='mt-4 text-lg text-neutral-400'>
            Choose the perfect plan for your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} onSelect={onSelectPlan} />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className='mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-400'>
          <div className='flex items-center gap-2'>
            <Check className='h-5 w-5 text-green-400' />
            <span>No credit card required</span>
          </div>
          <div className='flex items-center gap-2'>
            <Check className='h-5 w-5 text-green-400' />
            <span>Cancel anytime</span>
          </div>
          <div className='flex items-center gap-2'>
            <Check className='h-5 w-5 text-green-400' />
            <span>14-day money back</span>
          </div>
        </div>
      </div>
    </section>
  )
})

PricingSection.displayName = 'PricingSection'

// Pricing Card Component
const PricingCard = memo(({ plan, onSelect }) => {
  const colors = colorClasses[plan.color]
  const Icon = plan.icon

  return (
    <Card
      className={`group relative flex flex-col transition-all hover:scale-105 
        bg-gradient-to-br ${colors.gradient} ${colors.border}
        ${plan.popular ? 'ring-2 ring-orange-500/20 shadow-xl shadow-orange-500/10' : ''}`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className='absolute -top-4 left-1/2 -translate-x-1/2'>
          <div className='rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-1 text-xs font-semibold text-white shadow-lg'>
            Most Popular
          </div>
        </div>
      )}

      <div className='flex flex-grow flex-col p-8'>
        {/* Icon & Name */}
        <div className='mb-6 flex items-center gap-3'>
          <div className={`rounded-lg bg-neutral-800/50 p-2 ring-1 ring-neutral-700`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
          <div>
            <h3 className='text-2xl font-bold text-neutral-100'>{plan.name}</h3>
            <p className='text-sm text-neutral-400'>{plan.description}</p>
          </div>
        </div>

        {/* Price */}
        <div className='mb-6'>
          <div className='flex items-baseline gap-2'>
            <span className='text-5xl font-bold text-neutral-100'>{plan.price}</span>
            {plan.period && (
              <span className='text-lg text-neutral-500'>{plan.period}</span>
            )}
          </div>
        </div>

        {/* Features */}
        <ul className='mb-8 flex-grow space-y-3'>
          {plan.features.map((feature, idx) => (
            <li key={idx} className='flex items-start gap-3 text-neutral-300'>
              <Check className='h-5 w-5 flex-shrink-0 text-green-400' />
              <span className='text-sm'>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          onClick={onSelect}
          className={`w-full transition-all ${colors.button}`}
          text={plan.cta}
        />
      </div>
    </Card>
  )
})

PricingCard.displayName = 'PricingCard'

export default PricingSection
