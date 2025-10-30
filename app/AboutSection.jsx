'use client'

import { memo } from 'react'
import { Sparkles, Target, Users } from 'lucide-react'

const AboutSection = memo(() => {
  return (
    <section id='about' className='relative bg-neutral-900 px-4 py-20 sm:py-24'>
      <div className='mx-auto max-w-7xl'>
        {/* Heading */}
        <h2 className='mb-12 text-4xl font-bold text-neutral-100 sm:text-5xl'>
          About <span className='bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent'>Us</span>
        </h2>

        {/* Main Content */}
        <div className='grid gap-12 lg:grid-cols-2 lg:gap-16'>
          {/* Description */}
          <div className='space-y-6'>
            <p className='text-lg leading-relaxed text-neutral-300'>
              We are pioneers in the no-code AI revolution, empowering businesses and individuals 
              to harness the power of artificial intelligence without technical barriers.
            </p>
            <p className='text-lg leading-relaxed text-neutral-400'>
              Our platform enables anyone to create intelligent AI agents that can transform the 
              way they work, communicate, and innovate. No coding skills required—just bring your 
              ideas, and we'll help you bring them to life.
            </p>

            {/* Stats */}
            <div className='grid grid-cols-3 gap-6 pt-8'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-orange-400'>10K+</div>
                <div className='mt-2 text-sm text-neutral-400'>Active Users</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-orange-400'>50K+</div>
                <div className='mt-2 text-sm text-neutral-400'>AI Agents</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-orange-400'>99.9%</div>
                <div className='mt-2 text-sm text-neutral-400'>Uptime</div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className='space-y-6'>
            <FeatureCard
              icon={<Sparkles className='h-6 w-6 text-orange-400' />}
              title='Innovation First'
              description='Cutting-edge AI technology made accessible for everyone'
            />
            <FeatureCard
              icon={<Target className='h-6 w-6 text-blue-400' />}
              title='Results Driven'
              description='Focus on delivering measurable business value and ROI'
            />
            <FeatureCard
              icon={<Users className='h-6 w-6 text-green-400' />}
              title='Community Powered'
              description='Built with feedback from thousands of users worldwide'
            />
          </div>
        </div>
      </div>
    </section>
  )
})

AboutSection.displayName = 'AboutSection'

// Feature Card Component
const FeatureCard = memo(({ icon, title, description }) => (
  <div className='group flex gap-4 rounded-lg border border-neutral-800 bg-neutral-800/30 p-6 transition-all hover:border-orange-600/30 hover:bg-neutral-800/50'>
    <div className='flex-shrink-0'>
      <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 ring-1 ring-neutral-700 transition-all group-hover:ring-orange-600/30'>
        {icon}
      </div>
    </div>
    <div>
      <h3 className='mb-2 text-lg font-semibold text-neutral-100'>{title}</h3>
      <p className='text-sm text-neutral-400'>{description}</p>
    </div>
  </div>
))

FeatureCard.displayName = 'FeatureCard'

export default AboutSection
