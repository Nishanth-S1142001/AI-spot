'use client'

import { useEffect, useRef, useState } from 'react'

export default function FeaturesSection() {
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef(null)

  const integrations = [
    {
      name: 'Discord',
      icon: (
        <svg className='h-8 w-8' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z' />
        </svg>
      ),
      color: 'text-indigo-400'
    },
    {
      name: 'Notion',
      icon: (
        <svg className='h-8 w-8' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233l4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z' />
        </svg>
      ),
      color: 'text-neutral-300'
    },
    {
      name: 'Salesforce',
      icon: (
        <svg className='h-8 w-8' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M10.006 5.413a4.207 4.207 0 0 1 4.518-2.027a4.218 4.218 0 0 1 3.083 2.534a3.439 3.439 0 0 1 1.78-.497a3.465 3.465 0 0 1 3.456 3.456a3.458 3.458 0 0 1-.578 1.917a3.018 3.018 0 0 1 1.929 2.813a3.022 3.022 0 0 1-3.02 3.02a2.998 2.998 0 0 1-1.574-.44a4.235 4.235 0 0 1-3.854 2.458a4.22 4.22 0 0 1-3.22-1.486a3.857 3.857 0 0 1-1.782.43a3.866 3.866 0 0 1-3.86-3.86a3.854 3.854 0 0 1 .792-2.35a3.307 3.307 0 0 1-1.334-2.647a3.31 3.31 0 0 1 3.31-3.31a3.296 3.296 0 0 1 1.354.294z' />
        </svg>
      ),
      color: 'text-blue-400'
    },
    {
      name: 'YouTube',
      icon: (
        <svg className='h-8 w-8' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
        </svg>
      ),
      color: 'text-red-500'
    },
    {
      name: 'Telegram',
      icon: (
        <svg className='h-8 w-8' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635z' />
        </svg>
      ),
      color: 'text-blue-400'
    },
    {
      name: 'Twilio',
      icon: (
        <svg className='h-8 w-8' viewBox='0 0 24 24' fill='currentColor'>
          <circle cx='12' cy='12' r='11' />
          <circle cx='8.5' cy='8.5' r='2.5' fill='#000' />
          <circle cx='15.5' cy='8.5' r='2.5' fill='#000' />
          <circle cx='8.5' cy='15.5' r='2.5' fill='#000' />
          <circle cx='15.5' cy='15.5' r='2.5' fill='#000' />
        </svg>
      ),
      color: 'text-red-400'
    },
    {
      name: 'Messenger',
      icon: (
        <svg className='h-8 w-8' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464c6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26l-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z' />
        </svg>
      ),
      color: 'text-blue-500'
    },
    {
      name: 'Instagram',
      icon: (
        <svg className='h-8 w-8' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M12 2.163c3.204 0 3.584.012 4.85.07c3.252.148 4.771 1.691 4.919 4.919c.058 1.265.069 1.645.069 4.849c0 3.205-.012 3.584-.069 4.849c-.149 3.225-1.664 4.771-4.919 4.919c-1.266.058-1.644.07-4.85.07c-3.204 0-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92c-.058-1.265-.07-1.644-.07-4.849c0-3.204.013-3.583.07-4.849c.149-3.227 1.664-4.771 4.919-4.919c1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072C2.695.272.273 2.69.073 7.052C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98c.059-1.28.073-1.689.073-4.948c0-3.259-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324a6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8a4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881a1.44 1.44 0 0 0 0-2.881z' />
        </svg>
      ),
      color: 'text-pink-500'
    },
    {
      name: 'Apollo',
      icon: (
        <svg className='h-8 w-8' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm0 2.5l8.892 5.136v10.728L12 23.5l-8.892-5.136V7.636L12 2.5z' />
        </svg>
      ),
      color: 'text-yellow-500'
    },
    {
      name: 'Slack',
      icon: (
        <svg className='h-8 w-8' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' />
        </svg>
      ),
      color: 'text-purple-400'
    },
    {
      name: 'GitHub',
      icon: (
        <svg className='h-8 w-8' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
        </svg>
      ),
      color: 'text-neutral-300'
    },
    {
      name: 'Zapier',
      icon: (
        <svg className='h-8 w-8' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
        </svg>
      ),
      color: 'text-orange-500'
    }
  ]

  // Duplicate integrations for seamless loop
  const duplicatedIntegrations = [
    ...integrations,
    ...integrations,
    ...integrations
  ]

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId
    const scrollSpeed = 0.7 // Adjust speed here (pixels per frame)

    const animate = () => {
      if (!isPaused && scrollContainer) {
        // Get current scroll position
        const currentScroll = scrollContainer.scrollTop
        const maxScroll = scrollContainer.scrollHeight / 3 // height of 1 set of integrations
        
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
      {/* <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[600px] w-[600px] rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute h-[400px] w-[400px] rounded-full bg-orange-400/10 blur-[100px] animate-pulse" />
      </div> */}

      <div className='relative mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-16 text-center'>
          {/* Badge */}
          <div className='mb-8 inline-flex items-center justify-center'>
            <span className='rounded-full border border-neutral-700 bg-neutral-900/50 px-6 py-2 text-sm text-neutral-300 backdrop-blur-sm'>
              Integrations
            </span>
          </div>

          {/* Title */}
          <h2 className='mb-4 text-4xl font-bold text-neutral-400 sm:text-5xl'>
            Connect <span className='text-neutral-300'>800+</span> Apps
          </h2>

          {/* Subtitle */}
          <p className='text-lg text-neutral-500'>
            Connect your AI Agents with the real world
          </p>
        </div>

        {/* Grid Layout with Animated Scroll */}
        <div className='relative flex items-center justify-center'>
          <div className='relative mx-auto w-full max-w-5xl'>
            {/* Gradient Masks */}
            {/* <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-neutral-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent z-10 pointer-events-none" /> */}

            {/* Scrollable Grid Container */}
            <div
              ref={scrollRef}
              className='scrollbar-hide relative h-[500px] overflow-y-scroll'
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <div className='grid grid-cols-3 gap-6 px-4 py-16'>
                {duplicatedIntegrations.map((integration, index) => (
                  <div
                    key={`${integration.name}-${index}`}
                    className='group relative'
                  >
                    {/* Card */}
                    <div className='relative flex h-30 flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-800 p-8 backdrop-blur-sm transition-all duration-300 hover:bg-neutral-900'>
                      {/* Icon */}
                      <div
                        className={`${integration.color} transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_currentColor]`}
                      >
                        {integration.icon}
                      </div>

                      {/* Name */}
                      <p className='text-center text-sm font-medium text-neutral-300 transition-colors group-hover:text-white'>
                        {integration.name}
                      </p>

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
                        strokeWidth={1.5}
                        d='M13 10V3L4 14h7v7l9-11h-7z'
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
                        d='M5 13l4 4L19 7'
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