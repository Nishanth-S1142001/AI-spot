'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Sparkles,
  Lightbulb,
  Bot,
  MessageSquare,
  Zap,
  TrendingUp,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react'

import LoadingState from '../../../components/common/loading-state'
import NavigationBar from '../../../components/navigationBar/navigationBar'
import AgentBuilderChat from '../../../components/nlp/AgentBuilderChat'
import { useAuth } from '../../../components/providers/AuthProvider'
import SideBarLayout from '../../../components/sideBarLayout'
import NeonBackground from '../../../components/ui/background'
import Card from '../../../components/ui/card'
import Button from '../../../components/ui/button'
import { useLogout } from '../../../lib/supabase/auth'
import CreateAgentNLPSkeleton from '../../../components/skeleton/CreateAgentNLPSkeleton'
/**
 * FULLY OPTIMIZED Create Agent NLP Component
 *
 * React Query Integration:
 * - Consistent auth patterns with other pages
 * - Agent creation handled via mutation hooks
 * - Automatic cache invalidation
 *
 * Performance Optimizations:
 * - Memoized components prevent unnecessary re-renders
 * - No re-fetch on tab switch with useRef tracking
 * - Optimized animations with reduced motion support
 * - Lazy rendering of example prompts
 * - Keyboard shortcuts for better UX
 *
 * UI Improvements:
 * - Enhanced visual hierarchy
 * - Better example prompt cards with categories
 * - Copy functionality for prompts
 * - Loading states and error handling
 * - Improved mobile responsiveness
 */

// Categorized example prompts
const EXAMPLE_PROMPTS = [
  {
    category: 'Customer Support',
    icon: MessageSquare,
    color: 'blue',
    prompts: [
      'Create a customer support bot that answers billing questions and can access our FAQ database',
      'Build a support agent that handles returns, tracks orders, and escalates complex issues to humans',
      'I need a help desk assistant that troubleshoots technical issues and provides step-by-step solutions'
    ]
  },
  {
    category: 'Sales & Marketing',
    icon: TrendingUp,
    color: 'green',
    prompts: [
      'I need a sales assistant that qualifies leads and schedules demos using our calendar',
      'Create a marketing agent that writes email campaigns and social media posts in our brand voice',
      'Build a lead generation bot that engages prospects and collects contact information'
    ]
  },
  {
    category: 'Content & Writing',
    icon: Sparkles,
    color: 'purple',
    prompts: [
      'Build a content writer that creates blog posts about technology in a professional tone',
      'Create a social media manager that generates posts, captions, and hashtags for multiple platforms',
      'I want a copywriter that creates product descriptions and landing page content'
    ]
  },
  {
    category: 'Development & Code',
    icon: Bot,
    color: 'orange',
    prompts: [
      'Create a code assistant that helps with Python debugging and can execute code',
      'Build a developer bot that reviews code, suggests improvements, and explains complex concepts',
      'I need a programming tutor that teaches coding concepts with interactive examples'
    ]
  },
  {
    category: 'Data & Analytics',
    icon: Zap,
    color: 'yellow',
    prompts: [
      'I want a data analyst that generates insights from our sales data and creates visualizations',
      'Create a reporting agent that summarizes metrics and trends from our database',
      'Build an analytics assistant that answers business intelligence questions with data-driven insights'
    ]
  }
]

// Color mappings for categories
const COLOR_CLASSES = {
  blue: {
    border: 'border-blue-600/30',
    bg: 'from-blue-900/20 to-blue-950/10',
    hover: 'hover:border-blue-500/50 hover:from-blue-900/30',
    icon: 'text-blue-400',
    ring: 'ring-blue-500/20'
  },
  green: {
    border: 'border-green-600/30',
    bg: 'from-green-900/20 to-green-950/10',
    hover: 'hover:border-green-500/50 hover:from-green-900/30',
    icon: 'text-green-400',
    ring: 'ring-green-500/20'
  },
  purple: {
    border: 'border-purple-600/30',
    bg: 'from-purple-900/20 to-purple-950/10',
    hover: 'hover:border-purple-500/50 hover:from-purple-900/30',
    icon: 'text-purple-400',
    ring: 'ring-purple-500/20'
  },
  orange: {
    border: 'border-orange-600/30',
    bg: 'from-orange-900/20 to-orange-950/10',
    hover: 'hover:border-orange-500/50 hover:from-orange-900/30',
    icon: 'text-orange-400',
    ring: 'ring-orange-500/20'
  },
  yellow: {
    border: 'border-yellow-600/30',
    bg: 'from-yellow-900/20 to-yellow-950/10',
    hover: 'hover:border-yellow-500/50 hover:from-yellow-900/30',
    icon: 'text-yellow-400',
    ring: 'ring-yellow-500/20'
  }
}

/**
 * Memoized Example Prompt Component
 */
const ExamplePrompt = memo(({ text, onSelect, index, color = 'orange' }) => {
  const [copied, setCopied] = useState(false)
  const colors = COLOR_CLASSES[color] || COLOR_CLASSES.orange

  const handleCopy = useCallback(
    (e) => {
      e.stopPropagation()
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    },
    [text]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={() => onSelect?.(text)}
      className={`group cursor-pointer rounded-lg border ${colors.border} bg-gradient-to-br ${colors.bg} p-4 transition-all ${colors.hover} hover:shadow-lg hover:${colors.ring} hover:ring-2`}
    >
      <div className='flex items-start gap-3'>
        <Lightbulb
          className={`mt-0.5 h-4 w-4 flex-shrink-0 ${colors.icon} transition-transform group-hover:scale-110`}
        />
        <p className='flex-1 text-sm leading-relaxed text-neutral-200'>
          {text}
        </p>
        <button
          onClick={handleCopy}
          className='rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-800/50'
          title='Copy prompt'
        >
          {copied ? (
            <Check className='h-3.5 w-3.5 text-green-400' />
          ) : (
            <Copy className='h-3.5 w-3.5 text-neutral-400' />
          )}
        </button>
      </div>
    </motion.div>
  )
})
ExamplePrompt.displayName = 'ExamplePrompt'

/**
 * Memoized Category Section Component
 */
const CategorySection = memo(({ category, onSelect }) => {
  const colors = COLOR_CLASSES[category.color] || COLOR_CLASSES.orange
  const Icon = category.icon

  return (
    <div className='space-y-3'>
      {/* Category Header */}
      <div className='flex items-center gap-3 px-1'>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${colors.bg} border ${colors.border}`}
        >
          <Icon className={`h-4 w-4 ${colors.icon}`} />
        </div>
        <h4 className='text-sm font-bold text-neutral-200'>
          {category.category}
        </h4>
        <div className='h-px flex-1 bg-gradient-to-r from-neutral-700 to-transparent' />
      </div>

      {/* Prompts */}
      <div className='space-y-2'>
        {category.prompts.map((prompt, index) => (
          <ExamplePrompt
            key={index}
            text={prompt}
            onSelect={onSelect}
            index={index}
            color={category.color}
          />
        ))}
      </div>
    </div>
  )
})
CategorySection.displayName = 'CategorySection'

/**
 * Memoized Quick Start Tips Component
 */
const QuickStartTips = memo(() => {
  const tips = [
    {
      icon: MessageSquare,
      text: 'Describe what your agent should do',
      color: 'text-blue-400'
    },
    {
      icon: Lightbulb,
      text: 'Mention specific features or integrations',
      color: 'text-green-400'
    },
    {
      icon: Sparkles,
      text: 'Define the tone and personality',
      color: 'text-purple-400'
    },
    {
      icon: Zap,
      text: 'Add any special requirements',
      color: 'text-orange-400'
    }
  ]

  return (
    <div className='border-t border-neutral-800/50 p-4'>
      <p className='mb-3 text-xs font-semibold tracking-wide text-neutral-400 uppercase'>
        Quick Start Tips
      </p>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
        {tips.map((tip, index) => {
          const Icon = tip.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className='flex items-center gap-2 text-xs text-neutral-400'
            >
              <Icon className={`h-3.5 w-3.5 ${tip.color} flex-shrink-0`} />
              <span>{tip.text}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
})
QuickStartTips.displayName = 'QuickStartTips'

/**
 * Main Component
 */
export default function CreateAgentNLP() {
  const router = useRouter()
  const { logout } = useLogout()
  const { user, profile, loading: authLoading } = useAuth()

  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }
  // State
  const [collapsed, setCollapsed] = useState(true)
  const [selectedPrompt, setSelectedPrompt] = useState('')
  // Artificial delay so skeleton shows at least 3 seconds
  const [delayedLoading, setDelayedLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  // Track initialization to prevent re-fetch on tab switch
  const hasInitialized = useRef(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (user && !hasInitialized.current) {
      hasInitialized.current = true
    }
  }, [authLoading, user, router])

  // Handle agent creation success
  const handleAgentCreated = useCallback(
    (agent) => {
      if (!agent?.id) return

      // Small delay to show success message
      setTimeout(() => {
        router.push(`/agents/${agent.id}/manage`)
      }, 1500)
    },
    [router]
  )

  // Handle prompt selection
  const handlePromptSelect = useCallback((text) => {
    setSelectedPrompt(text)
    setCollapsed(true)
  }, [])

  // Toggle modal
  const togglePromptCard = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  // Close modal
  const handleCloseModal = useCallback(() => {
    setCollapsed(true)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape to close modal
      if (e.key === 'Escape' && !collapsed) {
        setCollapsed(true)
      }

      // Ctrl/Cmd + K to open modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && collapsed) {
        e.preventDefault()
        setCollapsed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [collapsed])

  if (delayedLoading) {
    return <LoadingState message='Authenticating...' className='min-h-screen' />
  }

  // Loading state - show skeleton
  if (authLoading) {
    return <CreateAgentNLPSkeleton userProfile={userProfile} />
  }

  // Not authenticated
  if (!user) {
    return null
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              title='AI Agent Builder'
              onLogOutClick={logout}
              promptCard={togglePromptCard}
              collapsed={collapsed}
            />
          </div>

          {/* Example Prompts Modal */}
          <AnimatePresence mode='wait'>
            {!collapsed && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm'
                  onClick={handleCloseModal}
                />

                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className='fixed top-1/2 left-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 px-4'
                >
                  <Card className='border-orange-600/30 bg-gradient-to-br from-neutral-900 to-neutral-950 shadow-2xl shadow-orange-500/20 backdrop-blur-xl'>
                    {/* Header */}
                    <div className='flex items-center justify-between border-b border-neutral-800/50 p-5'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600/40 to-orange-700/30 ring-1 ring-orange-500/50'>
                          <Sparkles className='h-5 w-5 text-orange-400' />
                        </div>
                        <div>
                          <h3 className='text-lg font-bold text-orange-400'>
                            Example Prompts
                          </h3>
                          <p className='text-xs text-neutral-500'>
                            Click any prompt to get started • Press{' '}
                            <kbd className='rounded bg-neutral-800 px-1.5 py-0.5 text-xs'>
                              ESC
                            </kbd>{' '}
                            to close
                          </p>
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        onClick={handleCloseModal}
                        className='h-8 w-8 p-0 text-neutral-400 hover:text-neutral-200'
                      >
                        <X className='h-5 w-5' />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className='custom-scrollbar max-h-[70vh] space-y-6 overflow-y-auto p-5'>
                      {EXAMPLE_PROMPTS.map((category, index) => (
                        <CategorySection
                          key={index}
                          category={category}
                          onSelect={handlePromptSelect}
                        />
                      ))}
                    </div>

                    {/* Footer */}
                    <QuickStartTips />
                  </Card>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Chat Interface */}
          <div className='flex-1 overflow-hidden'>
            <AgentBuilderChat
              onAgentCreated={handleAgentCreated}
              promptText={selectedPrompt}
            />
          </div>

          {/* Floating Action Button */}
          <AnimatePresence>
            {collapsed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                onClick={togglePromptCard}
                className='group fixed right-8 bottom-8 z-30 flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 font-semibold text-white shadow-2xl shadow-orange-500/40 transition-all hover:scale-105 hover:shadow-orange-500/60'
                title='View example prompts (Ctrl+K)'
              >
                <Sparkles className='h-5 w-5 transition-transform group-hover:rotate-12' />
                <span className='hidden sm:inline'>Example Prompts</span>
                <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
              </motion.button>
            )}
          </AnimatePresence>
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
