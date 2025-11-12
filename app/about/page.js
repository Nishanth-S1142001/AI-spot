'use client'

import {
  Bot,
  Sparkles,
  Users,
  Zap,
  Target,
  Heart,
  TrendingUp,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { memo, useMemo, useState, useEffect } from 'react'
import AboutSkeleton from '../../components/skeleton/AboutSkeleton'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'
import { useLogout } from '../../lib/supabase/auth'

/**
 * FULLY OPTIMIZED About Page Component
 * 
 * Optimizations:
 * - Memoized components prevent unnecessary re-renders
 * - Static data stored outside component (no recreation on render)
 * - Proper hook ordering (before any conditionals)
 * - Consistent with Dashboard/FAQ page patterns
 * - Performance-optimized rendering
 * - Skeleton loading for better UX
 */

// Static data - defined outside component to prevent recreation
const STATS_DATA = [
  { number: '10K+', label: 'Active Users', icon: Users },
  { number: '50K+', label: 'AI Agents Created', icon: Bot },
  { number: '1M+', label: 'Conversations Handled', icon: Zap },
  { number: '99.9%', label: 'Uptime Guarantee', icon: Shield }
]

const VALUES_DATA = [
  {
    icon: Heart,
    title: 'Customer First',
    description: 'We put our customers at the heart of everything we do, ensuring their success is our success.',
    color: 'red'
  },
  {
    icon: Sparkles,
    title: 'Innovation',
    description: 'We constantly push boundaries, exploring new AI technologies to deliver cutting-edge solutions.',
    color: 'purple'
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'Your data security is paramount. We employ industry-leading security measures to protect your information.',
    color: 'blue'
  },
  {
    icon: TrendingUp,
    title: 'Continuous Growth',
    description: 'We believe in constant improvement, both for our platform and our customers\' businesses.',
    color: 'green'
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'We foster a collaborative environment where ideas flourish and teams thrive together.',
    color: 'orange'
  },
  {
    icon: Globe,
    title: 'Global Impact',
    description: 'We aim to democratize AI, making powerful automation tools accessible to businesses worldwide.',
    color: 'cyan'
  }
]

const MILESTONES_DATA = [
  { year: '2023', title: 'Company Founded', description: 'AI-Spot was born with a vision to democratize AI agent creation.' },
  { year: '2023', title: 'First 100 Users', description: 'Reached our first major milestone with 100 active users.' },
  { year: '2024', title: 'Major Features Launch', description: 'Introduced workflows, advanced analytics, and integrations.' },
  { year: '2024', title: 'Enterprise Tier', description: 'Launched enterprise solutions for large organizations.' },
  { year: '2025', title: 'Global Expansion', description: 'Expanding our services to businesses across 50+ countries.' }
]

const MISSION_POINTS = [
  'Make AI accessible to businesses of all sizes',
  'Simplify AI agent creation and deployment',
  'Provide enterprise-grade capabilities at affordable prices',
  'Foster innovation through cutting-edge technology',
  'Support businesses in their digital transformation journey'
]

const VISION_POINTS = [
  'Lead the no-code AI revolution',
  'Establish AI-Spot as the industry standard',
  'Expand globally to serve businesses in every market',
  'Continuously innovate with cutting-edge AI capabilities',
  'Build a thriving ecosystem of AI-powered businesses'
]

// Utility function for color classes - memoized
const getColorClasses = (color) => {
  const colors = {
    red: 'from-red-900/40 to-red-950/20 border-red-600/30 text-red-400',
    purple: 'from-purple-900/40 to-purple-950/20 border-purple-600/30 text-purple-400',
    blue: 'from-blue-900/40 to-blue-950/20 border-blue-600/30 text-blue-400',
    green: 'from-green-900/40 to-green-950/20 border-green-600/30 text-green-400',
    orange: 'from-orange-900/40 to-orange-950/20 border-orange-600/30 text-orange-400',
    cyan: 'from-cyan-900/40 to-cyan-950/20 border-cyan-600/30 text-cyan-400'
  }
  return colors[color] || colors.orange
}

/**
 * Memoized Stat Card Component
 */
const StatCard = memo(({ stat }) => {
  const Icon = stat.icon
  return (
    <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50 text-center'>
      <div className='flex flex-col items-center'>
        <Icon className='mb-4 h-8 w-8 text-orange-400' />
        <div className='mb-2 text-4xl font-bold text-neutral-100'>
          {stat.number}
        </div>
        <div className='text-sm text-neutral-400'>{stat.label}</div>
      </div>
    </Card>
  )
})
StatCard.displayName = 'StatCard'

/**
 * Memoized Value Card Component
 */
const ValueCard = memo(({ value }) => {
  const Icon = value.icon
  const colors = useMemo(() => getColorClasses(value.color), [value.color])

  return (
    <Card
      className={`border bg-gradient-to-br transition-all hover:scale-105 ${colors}`}
    >
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-neutral-900/50 p-3'>
            <Icon className='h-6 w-6' />
          </div>
          <h3 className='text-xl font-semibold text-neutral-100'>
            {value.title}
          </h3>
        </div>
        <p className='text-sm text-neutral-400 leading-relaxed'>
          {value.description}
        </p>
      </div>
    </Card>
  )
})
ValueCard.displayName = 'ValueCard'

/**
 * Memoized Milestone Item Component
 */
const MilestoneItem = memo(({ milestone }) => {
  return (
    <div className='relative pl-20'>
      {/* Timeline Dot */}
      <div className='absolute left-6 top-2 h-5 w-5 rounded-full bg-orange-500 ring-4 ring-neutral-950' />
      
      <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-orange-900/40 px-3 py-1 text-sm font-semibold text-orange-300'>
              {milestone.year}
            </span>
            <h3 className='text-xl font-bold text-neutral-100'>
              {milestone.title}
            </h3>
          </div>
          <p className='text-neutral-400'>{milestone.description}</p>
        </div>
      </Card>
    </div>
  )
})
MilestoneItem.displayName = 'MilestoneItem'

/**
 * Memoized Mission/Vision List Item
 */
const ListItem = memo(({ text, color }) => {
  return (
    <li className='flex items-start gap-3'>
      <CheckCircle2 className={`h-5 w-5 text-${color}-400 flex-shrink-0 mt-0.5`} />
      <span className='text-neutral-400'>{text}</span>
    </li>
  )
})
ListItem.displayName = 'ListItem'

/**
 * Memoized Hero Section
 */
const HeroSection = memo(() => {
  return (
    <div className='mb-16 text-center'>
      <div className='mb-6 flex justify-center'>
        <div className='rounded-full bg-gradient-to-br from-orange-500 to-orange-600 p-6'>
          <Bot className='h-12 w-12 text-white' />
        </div>
      </div>
      <h1 className='mb-4 text-5xl font-bold text-neutral-100'>
        About <span className='text-orange-500'>AI-Spot</span>
      </h1>
      <p className='mx-auto max-w-3xl text-xl text-neutral-400'>
        Empowering businesses to harness the power of AI through intelligent, 
        customizable agents that automate workflows, enhance customer engagement, 
        and drive growth.
      </p>
    </div>
  )
})
HeroSection.displayName = 'HeroSection'

/**
 * Memoized Stats Section
 */
const StatsSection = memo(() => {
  return (
    <div className='mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      {STATS_DATA.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  )
})
StatsSection.displayName = 'StatsSection'

/**
 * Memoized Story Section
 */
const StorySection = memo(() => {
  return (
    <div className='mb-16'>
      <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
        <div className='space-y-6'>
          <div className='flex items-center gap-3'>
            <Sparkles className='h-6 w-6 text-blue-400' />
            <h2 className='text-3xl font-bold text-neutral-100'>Our Story</h2>
          </div>
          <div className='space-y-4 text-neutral-300 leading-relaxed'>
            <p>
              AI-Spot was founded with a simple yet powerful vision: to democratize artificial 
              intelligence and make it accessible to businesses of all sizes. We recognized that 
              while AI technology was advancing rapidly, creating and deploying AI agents remained 
              complex, expensive, and out of reach for many organizations.
            </p>
            <p>
              Our journey began when our founders, experienced AI engineers and entrepreneurs, 
              witnessed firsthand the struggles businesses faced when trying to implement AI 
              solutions. They saw companies paying exorbitant fees for custom development, dealing 
              with lengthy implementation timelines, and struggling to maintain their AI systems.
            </p>
            <p>
              That&apos;s when the idea for AI-Spot was born. We set out to create a platform that would 
              eliminate these barriers – a no-code solution that would empower anyone, regardless of 
              technical expertise, to create sophisticated AI agents in minutes, not months.
            </p>
            <p>
              Today, AI-Spot serves thousands of businesses worldwide, from small startups to 
              enterprise organizations. Our platform has facilitated millions of conversations, 
              automated countless workflows, and helped businesses achieve unprecedented efficiency 
              and customer satisfaction.
            </p>
            <p>
              But we&apos;re just getting started. Every day, we&apos;re working to make AI more accessible, 
              more powerful, and more beneficial for businesses everywhere. Join us on this journey 
              to reshape how businesses interact with their customers and automate their operations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
})
StorySection.displayName = 'StorySection'

/**
 * Memoized Mission & Vision Section
 */
const MissionVisionSection = memo(() => {
  return (
    <div className='mb-16 grid gap-6 lg:grid-cols-2'>
      {/* Mission */}
      <Card className='border-purple-600/20 bg-gradient-to-br from-purple-950/10 to-neutral-950/50'>
        <div className='space-y-4'>
          <div className='flex items-center gap-3'>
            <Target className='h-6 w-6 text-purple-400' />
            <h2 className='text-2xl font-bold text-neutral-100'>Our Mission</h2>
          </div>
          <p className='text-neutral-300 leading-relaxed'>
            To empower every business with AI capabilities that enhance customer experiences, 
            streamline operations, and unlock new opportunities for growth. We believe that AI 
            should be accessible to everyone, not just large corporations with massive budgets.
          </p>
          <ul className='space-y-3'>
            {MISSION_POINTS.map((item, idx) => (
              <ListItem key={idx} text={item} color='purple' />
            ))}
          </ul>
        </div>
      </Card>

      {/* Vision */}
      <Card className='border-green-600/20 bg-gradient-to-br from-green-950/10 to-neutral-950/50'>
        <div className='space-y-4'>
          <div className='flex items-center gap-3'>
            <TrendingUp className='h-6 w-6 text-green-400' />
            <h2 className='text-2xl font-bold text-neutral-100'>Our Vision</h2>
          </div>
          <p className='text-neutral-300 leading-relaxed'>
            To become the world&apos;s leading platform for AI agent creation, where businesses can 
            effortlessly build, deploy, and scale intelligent automation that drives meaningful 
            results and transforms customer interactions.
          </p>
          <ul className='space-y-3'>
            {VISION_POINTS.map((item, idx) => (
              <ListItem key={idx} text={item} color='green' />
            ))}
          </ul>
        </div>
      </Card>
    </div>
  )
})
MissionVisionSection.displayName = 'MissionVisionSection'

/**
 * Memoized Values Section
 */
const ValuesSection = memo(() => {
  return (
    <div className='mb-16'>
      <div className='mb-8 text-center'>
        <h2 className='mb-2 text-3xl font-bold text-neutral-100'>Our Values</h2>
        <p className='text-neutral-400'>
          The principles that guide everything we do
        </p>
      </div>
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {VALUES_DATA.map((value, index) => (
          <ValueCard key={index} value={value} />
        ))}
      </div>
    </div>
  )
})
ValuesSection.displayName = 'ValuesSection'

/**
 * Memoized Timeline Section
 */
const TimelineSection = memo(() => {
  return (
    <div className='mb-16'>
      <div className='mb-8 text-center'>
        <h2 className='mb-2 text-3xl font-bold text-neutral-100'>Our Journey</h2>
        <p className='text-neutral-400'>
          Key milestones in our growth story
        </p>
      </div>
      <div className='relative'>
        {/* Timeline Line */}
        <div className='absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-orange-600 to-orange-700' />
        
        {/* Timeline Items */}
        <div className='space-y-8'>
          {MILESTONES_DATA.map((milestone, index) => (
            <MilestoneItem key={index} milestone={milestone} />
          ))}
        </div>
      </div>
    </div>
  )
})
TimelineSection.displayName = 'TimelineSection'

/**
 * Memoized CTA Section
 */
const CTASection = memo(() => {
  return (
    <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/20 to-neutral-950/50 text-center'>
      <div className='space-y-6'>
        <h2 className='text-3xl font-bold text-neutral-100'>
          Ready to Transform Your Business?
        </h2>
        <p className='mx-auto max-w-2xl text-neutral-400'>
          Join thousands of businesses already using AI-Spot to automate workflows, 
          enhance customer engagement, and drive growth.
        </p>
        <div className='flex flex-wrap justify-center gap-4'>
          <Link href='/agents/create-nlp'>
            <Button className='flex items-center gap-2 bg-orange-600 hover:bg-orange-700'>
              Get Started Free
              <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
          <Link href='/settings/subscription'>
            <Button variant='outline' className='flex items-center gap-2'>
              View Pricing
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
})
CTASection.displayName = 'CTASection'

/**
 * Main About Page Component
 */
export default function AboutPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()

  // Artificial delay so skeleton shows at least 3 seconds
  const [delayedLoading, setDelayedLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Memoize user profile for SideBarLayout
  const userProfile = useMemo(() => ({
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }), [profile, user])

  // Show skeleton during delayed loading
  if (delayedLoading || authLoading) {
    return <AboutSkeleton userProfile={userProfile} />
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
     
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              title='About Us'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto bg-neutral-950/80'>
            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              <HeroSection />
              <StatsSection />
              <StorySection />
              <MissionVisionSection />
              <ValuesSection />
              <TimelineSection />
              <CTASection />
            </div>
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(23, 23, 23, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 4px;
          transition: background 0.2s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.5);
        }
      `}</style>
    </>
  )
}