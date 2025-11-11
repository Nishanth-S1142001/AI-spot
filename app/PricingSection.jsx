'use client'

import { useState } from 'react'
import Button from '../components/ui/button'
export default function PricingSection({ onSelectPlan }) {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: 'Starter',
      description: 'For the first client',
      price: isAnnual ? 15 : 25,
      credits: {
        amount: 500,
        price: isAnnual ? '$15' : '$25'
      },
      features: [
        'Unlimited Agents',
        '1 Sub Account',
        'Basic Support',
        'Basic Demos'
      ]
    },
    {
      name: 'Growth',
      description: 'For the first 5 clients',
      price: isAnnual ? 47 : 79,
      credits: {
        amount: '3,000',
        price: isAnnual ? '$47' : '$79'
      },
      popular: true,
      features: [
        'Everything in Starter, plus:',
        '5 Sub Accounts',
        'Advanced Demos',
        'Marketplace'
      ]
    },
    {
      name: 'Scale',
      description: 'For unlimited clients',
      price: isAnnual ? 178 : 297,
      credits: {
        amount: '10,000',
        price: isAnnual ? '$178' : '$297'
      },
      features: [
        'Everything in Growth, plus:',
        'Unlimited Sub Accounts',
        'White label sub accounts',
        'Whitelabel Demos'
      ]
    },
    {
      name: 'Enterprise',
      description: 'Custom',
      price: '2,000+',
      credits: null,
      features: [
        'Everything in Scale, plus:',
        'Bulk credit deals',
        'Priority Support',
        'Whiteglove Onboarding'
      ]
    }
  ]

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[800px] w-[800px] rounded-full bg-orange-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center justify-center mb-8">
            <span className="px-6 py-2 rounded-full border border-neutral-700 bg-neutral-900/50 backdrop-blur-sm text-neutral-300 text-sm">
              Pricing
            </span>
          </div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-12 text-neutral-300">
            Simple, transparent pricing
          </h2>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span
              className={`text-sm ${!isAnnual ? 'text-neutral-300' : 'text-neutral-500'}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 rounded-full bg-neutral-800 border border-neutral-700 transition-colors"
            >
              <div
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-neutral-200 transition-transform duration-300 ${
                  isAnnual ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-sm ${isAnnual ? 'text-neutral-300' : 'text-neutral-500'}`}
            >
              Annually
            </span>
            {isAnnual && (
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                -40%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? 'border-orange-600/30 bg-neutral-900/80'
                  : 'border-neutral-800 bg-neutral-900/50'
              } backdrop-blur-sm p-8 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-orange-500 text-white text-xs font-medium flex items-center gap-2">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-200 mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-neutral-500">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-orange-400">
                    ${plan.price}
                  </span>
                  {typeof plan.price === 'number' && (
                    <span className="text-sm text-neutral-500">MONTH</span>
                  )}
                  {typeof plan.price === 'string' && (
                    <span className="text-sm text-neutral-500">MONTH</span>
                  )}
                </div>
              </div>

              {/* Credits */}
              {plan.credits && (
                <div className="mb-6 p-3 rounded-lg border border-neutral-800 bg-neutral-950/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm text-neutral-300">
                        {plan.credits.amount} credits
                      </span>
                    </div>
                    <span className="text-xs text-orange-400">
                      {plan.credits.price}
                    </span>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-neutral-400">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={onSelectPlan}
                className="w-full py-3 px-4 rounded-lg border border-neutral-700 bg-neutral-800/50 text-neutral-200 hover:bg-neutral-700/50 hover:border-orange-600/50 transition-all duration-300"
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}