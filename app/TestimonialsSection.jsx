'use client'

import { memo } from 'react'
import { Quote, Star } from 'lucide-react'
import Card from '../components/ui/card'

const testimonials = [
  {
    quote: 'This platform changed the game for our startup. We built an AI customer support agent in hours instead of months.',
    author: 'Jane Doe',
    role: 'CEO',
    company: 'Tech Innovators',
    rating: 5,
    avatar: 'JD'
  },
  {
    quote: 'The no-code interface is incredibly intuitive. Our productivity has skyrocketed since adopting it.',
    author: 'John Smith',
    role: 'Operations Manager',
    company: 'Growth Corp',
    rating: 5,
    avatar: 'JS'
  },
  {
    quote: 'Best investment we made this year. The AI agents handle tasks we never thought possible without a dev team.',
    author: 'Sarah Chen',
    role: 'Founder',
    company: 'StartupXYZ',
    rating: 5,
    avatar: 'SC'
  }
]

const TestimonialsSection = memo(() => {
  return (
    <section id='testimonials' className='relative bg-neutral-900 px-4 py-20 sm:py-24'>
      <div className='mx-auto max-w-7xl'>
        {/* Heading */}
        <div className='mb-16 text-center'>
          <h2 className='text-4xl font-bold text-neutral-100 sm:text-5xl'>
            What Our{' '}
            <span className='bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent'>
              Clients Say
            </span>
          </h2>
          <p className='mt-4 text-lg text-neutral-400'>
            Trusted by thousands of businesses worldwide
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
})

TestimonialsSection.displayName = 'TestimonialsSection'

// Testimonial Card Component
const TestimonialCard = memo(({ testimonial }) => (
  <Card className='group relative flex flex-col border border-neutral-800 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 p-8 transition-all hover:border-orange-600/30 hover:scale-105'>
    {/* Quote Icon */}
    <div className='mb-4'>
      <Quote className='h-8 w-8 text-orange-400/40' />
    </div>

    {/* Rating Stars */}
    <div className='mb-4 flex gap-1'>
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className='h-4 w-4 fill-orange-400 text-orange-400' />
      ))}
    </div>

    {/* Quote */}
    <blockquote className='mb-6 flex-grow text-base italic leading-relaxed text-neutral-300'>
      "{testimonial.quote}"
    </blockquote>

    {/* Author Info */}
    <div className='flex items-center gap-4 border-t border-neutral-700/50 pt-6'>
      {/* Avatar */}
      <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-bold text-white ring-2 ring-orange-500/20'>
        {testimonial.avatar}
      </div>

      {/* Details */}
      <div className='flex-grow'>
        <div className='font-semibold text-neutral-100'>
          {testimonial.author}
        </div>
        <div className='text-sm text-neutral-400'>
          {testimonial.role} at {testimonial.company}
        </div>
      </div>
    </div>

    {/* Hover Effect Gradient */}
    <div className='absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/0 opacity-0 transition-opacity duration-300 group-hover:from-orange-500/5 group-hover:via-orange-500/10 group-hover:to-orange-500/5 group-hover:opacity-100' />
  </Card>
))

TestimonialCard.displayName = 'TestimonialCard'

export default TestimonialsSection
