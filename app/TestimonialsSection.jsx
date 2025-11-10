'use client'

import { useEffect, useRef, useState } from 'react'

export default function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef(null)

  const testimonials = [
    {
      text: "They made it easy to bring everything used for this work. Extremely easy to create, demo and launch.",
      author: "Michael",
      handle: "@michael",
      color: "orange"
    },
    {
      text: "The marketplace is just amazing! The consulting deal with one of the clients posting his offer in Marketplace section.",
      author: "Marcin Luks",
      handle: "@marcin",
      color: "orange"
    },
    {
      text: "I just signed up recently to access AI.",
      author: "Pasquale S.",
      handle: "@pasquale",
      color: "purple"
    },
    {
      text: "The service is top notch. The people running the company care. I'm looking forward to building great things with this software.",
      author: "Anonymous",
      handle: "@user",
      color: "pink"
    },
    {
      text: "It's a monster when it comes to AI Chatbot prompting. Makes a beginner into an expert in no time. Highly recommended.",
      author: "Syed M. Awais",
      handle: "@syed",
      color: "yellow"
    },
    {
      text: "10/10 would recommend. This is a solid software! The founders care about the people who use it and are always looking for ways to improve.",
      author: "Aaron Perry",
      handle: "@aaron",
      color: "pink"
    }
  ]

  const colorClasses = {
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-500'
  }

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials
  ]

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId
    const scrollSpeed = 0.5 // Adjust speed here (pixels per frame)

    const animate = () => {
      if (!isPaused && scrollContainer) {
        // Get current scroll position
        const currentScroll = scrollContainer.scrollTop
        const maxScroll = scrollContainer.scrollHeight / 3 // height of 1 set of testimonials
        
        // Calculate new scroll position
        let newScroll = currentScroll + scrollSpeed
        
        // Reset to beginning when we've scrolled through one complete set
        if (newScroll >= maxScroll) {
          newScroll = 0
        }
        
        scrollContainer.scrollTop = newScroll
      }
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isPaused])

  return (
    <section className='relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8'>
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[120px]" />
      </div>

      <div className='relative mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-16 text-center'>
          {/* Badge */}
          <div className='mb-8 inline-flex items-center justify-center'>
            <span className='rounded-full border border-neutral-700 bg-neutral-900/50 px-6 py-2 text-sm text-neutral-300 backdrop-blur-sm'>
              Testimonials
            </span>
          </div>

          {/* Title */}
          <h2 className='mb-4 text-4xl font-bold text-neutral-400 sm:text-5xl'>
            What our users say
          </h2>

          {/* Subtitle */}
          <p className='text-lg text-neutral-500'>
            Our app has become an essential tool for users around the world.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className='relative flex items-center justify-center'>
          <div className='relative mx-auto w-full max-w-5xl'>
            {/* Gradient Masks */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-neutral-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent z-10 pointer-events-none" />

            {/* Scrollable Grid Container */}
            <div
              ref={scrollRef}
              className='scrollbar-hide relative h-[600px] overflow-y-scroll'
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <div className='grid grid-cols-3 gap-6 px-4 py-32'>
                {duplicatedTestimonials.map((testimonial, index) => (
                  <div
                    key={`${testimonial.author}-${index}`}
                    className='group relative'
                  >
                    {/* Card */}
                    <div className='relative flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/50 hover:bg-neutral-900'>
                      {/* Testimonial Text */}
                      <p className="text-neutral-400 text-sm leading-relaxed flex-grow">
                        "{testimonial.text}"
                      </p>

                      {/* Author Info */}
                      <div className="flex items-center gap-3 pt-2">
                        <div
                          className={`w-10 h-10 rounded-full ${
                            colorClasses[testimonial.color]
                          } flex items-center justify-center text-white font-bold text-sm transition-transform duration-300 group-hover:scale-110`}
                        >
                          {testimonial.author[0]}
                        </div>
                        <div>
                          <p className="text-neutral-300 text-sm font-medium group-hover:text-white transition-colors">
                            {testimonial.author}
                          </p>
                          <p className="text-neutral-500 text-xs">
                            {testimonial.handle}
                          </p>
                        </div>
                      </div>

                      {/* Shine Effect */}
                      <div className='pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400/0 via-orange-400/0 to-orange-400/0 opacity-0 transition-opacity duration-500 group-hover:from-orange-400/10 group-hover:via-transparent group-hover:to-transparent group-hover:opacity-100' />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Decorative Card - Right */}
            <div className='absolute top-1/4 -right-32 hidden xl:block'>
              <div className='animate-float relative'>
                <div className='flex h-36 w-36 rotate-12 transform items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-xl backdrop-blur-sm transition-all duration-500 hover:rotate-6'>
                  <div className='absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-50' />
                  <div className='relative flex h-16 w-16 items-center justify-center rounded-xl bg-orange-500/20'>
                    <svg
                      className='h-8 w-8 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Decorative Card - Left */}
            <div className='absolute bottom-1/4 -left-32 hidden xl:block'>
              <div className='animate-float-delayed relative'>
                <div className='flex h-28 w-28 -rotate-12 transform items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-xl backdrop-blur-sm transition-all duration-500 hover:-rotate-6'>
                  <div className='absolute inset-0 bg-gradient-to-bl from-orange-500/20 to-transparent opacity-50' />
                  <div className='relative flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20'>
                    <svg
                      className='h-6 w-6 text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.5)]'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(12deg);
          }
          50% {
            transform: translateY(-20px) rotate(18deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0) rotate(-12deg);
          }
          50% {
            transform: translateY(-15px) rotate(-18deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </section>
  )
}