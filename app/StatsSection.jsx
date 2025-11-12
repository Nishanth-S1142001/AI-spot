'use client'

import { Brain, Globe, Layers, Monitor, TrendingUp, Users, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const stats = [
  {
    label: 'Frontend Features',
    value: '60+',
    icon: Monitor,
    color: 'from-orange-500 to-orange-600'
  },
  {
    label: 'Backend Capabilities',
    value: '40+',
    icon: Brain,
    color: 'from-orange-400 to-orange-500'
  },
  {
    label: 'Workflow Blueprints',
    value: '100+',
    icon: Layers,
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Users,
    value: '10,000+',
    label: 'Active Users',
    color: 'from-orange-500 to-red-500',
    description: 'Businesses trust our platform'
  },
  {
    icon: Zap,
    value: '50,000+',
    label: 'AI Agents Created',
    color: 'from-orange-500 to-red-500',
    description: 'Deployed and running'
  },
  {
    icon: TrendingUp,
    value: '99.9%',
    label: 'Uptime',
    color: 'from-orange-500 to-red-500',
    description: 'Reliable and always available'
  },
  {
    icon: Globe,
    value: '120+',
    label: 'Countries',
    color: 'from-orange-500 to-red-500',
    description: 'Global reach and impact'
  }
]

const StatCard = ({ stat, isCenter }) => {
  const Icon = stat.icon

  return (
    <div
      className={`w-64 flex-none rounded-2xl border border-neutral-800 bg-neutral-900/50 px-6 py-8 backdrop-blur-xl transition-all duration-500 ease-out ${
        isCenter
          ? 'scale-110 border-orange-600/40 shadow-[0_0_40px_rgba(249,115,22,0.4)]'
          : 'scale-95 opacity-80 hover:shadow-[0_0_25px_rgba(249,115,22,0.2)]'
      } `}
    >
      <div
        className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${stat.color} mb-4 flex items-center justify-center shadow-xl`}
      >
        <Icon className='h-8 w-8 text-white drop-shadow' />
      </div>
      <p className='mb-1 bg-gradient-to-r from-neutral-100 to-neutral-300 bg-clip-text text-4xl font-bold text-transparent'>
        {stat.value}
      </p>
      <p className='text-neutral-400'>{stat.label}</p>
    </div>
  )
}

export function WorkflowStats() {
  const scrollRef = useRef(null)
  const [centerIndex, setCenterIndex] = useState(0)

  const infiniteStats = [...stats, ...stats, ...stats]

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    scrollContainer.style.scrollBehavior = 'auto'

    let scrollSpeed = 0.6
    let rafId = null
    let isInitialized = false

    const animate = () => {
      // Initialize scroll position to middle set on first frame
      if (!isInitialized && scrollContainer.scrollWidth > 0) {
        const oneSetWidth = scrollContainer.scrollWidth / 3
        scrollContainer.scrollLeft = oneSetWidth
        isInitialized = true
      }

      scrollContainer.scrollLeft += scrollSpeed

      // Calculate one set width
      const oneSetWidth = scrollContainer.scrollWidth / 3
      
      // Reset scroll position for infinite loop (using middle set as anchor)
      if (scrollContainer.scrollLeft >= oneSetWidth * 2) {
        scrollContainer.scrollLeft = oneSetWidth
      } else if (scrollContainer.scrollLeft <= 0) {
        scrollContainer.scrollLeft = oneSetWidth
      }

      // Calculate center card index using real card width
      const centerPos =
        scrollContainer.scrollLeft + scrollContainer.offsetWidth / 2

      const firstChild = scrollContainer.children[0]
      const gap = parseFloat(getComputedStyle(scrollContainer).gap || 0)
      const cardWidth = firstChild
        ? firstChild.getBoundingClientRect().width + gap
        : 280

      // Calculate which card is currently centered
      const rawIndex = Math.floor(centerPos / cardWidth)
      const currentIndex = rawIndex % stats.length

      setCenterIndex(currentIndex)

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => rafId && cancelAnimationFrame(rafId)
  }, [])

  return (
    <section className='relative bg-neutral-950 px-4 py-32 sm:px-6 lg:px-8'>
      {/* Background Glow */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='h-[800px] w-[800px] rounded-full bg-orange-500/10 blur-[150px]' />
      </div>

      <div className='relative mx-auto mb-16 max-w-7xl text-center'>
        <div className='mb-8 inline-flex items-center justify-center'>
          <span className='rounded-full border border-neutral-700 bg-neutral-900/50 px-6 py-2 text-sm text-neutral-300 backdrop-blur-sm'>
            Capabilities
          </span>
        </div>

        <h2 className='mb-6 text-4xl font-bold text-neutral-300 sm:text-5xl lg:text-6xl'>
          Your AI System{' '}
          <span className='bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent'>
            Power Stats
          </span>
        </h2>
        <p className='mx-auto max-w-2xl text-xl text-neutral-400'>
          A complete suite of AI-powered workflows designed to automate your
          business at scale.
        </p>
      </div>

      {/* Carousel Container */}
      <div className='relative'>
        {/* Gradient Overlays for fade effect */}
        <div className='pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-32 bg-gradient-to-r from-neutral-950 to-transparent' />
        <div className='pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-32 bg-gradient-to-l from-neutral-950 to-transparent' />

        <div
          ref={scrollRef}
          className='flex w-full gap-8 overflow-x-hidden py-8 select-none'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {infiniteStats.map((stat, index) => {
            const statIndex = index % stats.length
            const isCenter = statIndex === centerIndex

            return <StatCard key={index} stat={stat} isCenter={isCenter} />
          })}
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}

export default WorkflowStats