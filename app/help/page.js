'use client'

import {
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Zap,
  Shield,
  CreditCard,
  Users,
  MessageSquare,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import { memo, useCallback, useState, useMemo } from 'react'
import LoadingState from '../../components/common/loading-state'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Button from '../../components/ui/button'
import Card from '../../components/ui/card'
import { useLogout } from '../../lib/supabase/auth'
import {
  useFAQs,
  useSearchFAQs,
  useGroupedFAQs,
  useFAQFeedback
} from '../../lib/hooks/useFAQHooks'
import FAQPageSkeleton from '../../components/skeleton/HelpSkeleton'
/**
 * FULLY OPTIMIZED FAQ Page Component - TABBED VERSION
 *
 * Features:
 * - Tabbed category navigation
 * - Search functionality
 * - Memoized components for performance
 * - Optimistic feedback updates
 */

// Category icon and color mapping
const CATEGORY_CONFIG = {
  'Getting Started': {
    icon: BookOpen,
    colors: 'from-blue-900/40 to-blue-950/20 border-blue-600/30',
    activeColors: 'bg-blue-600/20 border-blue-600 text-blue-400',
    iconColor: 'text-blue-400'
  },
  Agents: {
    icon: Zap,
    colors: 'from-orange-900/40 to-orange-950/20 border-orange-600/30',
    activeColors: 'bg-orange-600/20 border-orange-600 text-orange-400',
    iconColor: 'text-orange-400'
  },
  Billing: {
    icon: CreditCard,
    colors: 'from-green-900/40 to-green-950/20 border-green-600/30',
    activeColors: 'bg-green-600/20 border-green-600 text-green-400',
    iconColor: 'text-green-400'
  },
  Security: {
    icon: Shield,
    colors: 'from-red-900/40 to-red-950/20 border-red-600/30',
    activeColors: 'bg-red-600/20 border-red-600 text-red-400',
    iconColor: 'text-red-400'
  },
  Team: {
    icon: Users,
    colors: 'from-purple-900/40 to-purple-950/20 border-purple-600/30',
    activeColors: 'bg-purple-600/20 border-purple-600 text-purple-400',
    iconColor: 'text-purple-400'
  },
  Support: {
    icon: MessageSquare,
    colors: 'from-cyan-900/40 to-cyan-950/20 border-cyan-600/30',
    activeColors: 'bg-cyan-600/20 border-cyan-600 text-cyan-400',
    iconColor: 'text-cyan-400'
  }
}

const DEFAULT_CONFIG = {
  icon: HelpCircle,
  colors: 'from-neutral-900/40 to-neutral-950/20 border-neutral-600/30',
  activeColors: 'bg-neutral-600/20 border-neutral-600 text-neutral-400',
  iconColor: 'text-neutral-400'
}

/**
 * Memoized FAQ Item Component
 */
const FAQItem = memo(({ faq, isOpen, onToggle, onFeedback }) => {
  const { mutate: submitFeedback } = useFAQFeedback()

  const handleFeedback = useCallback(
    (helpful) => {
      submitFeedback({ faqId: faq.id, helpful })
      onFeedback?.(faq.id, helpful)
    },
    [submitFeedback, faq.id, onFeedback]
  )

  return (
    <Card className='border-neutral-700/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20 transition-all hover:border-neutral-600/50'>
      <div className='space-y-3'>
        {/* Question */}
        <button
          onClick={onToggle}
          className='flex w-full items-start justify-between gap-4 text-left transition-colors hover:text-orange-400'
          aria-expanded={isOpen}
        >
          <div className='flex flex-1 items-start gap-3'>
            <HelpCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400' />
            <h3 className='font-semibold text-neutral-100'>{faq.question}</h3>
          </div>
          {isOpen ? (
            <ChevronUp className='h-5 w-5 flex-shrink-0 text-neutral-400' />
          ) : (
            <ChevronDown className='h-5 w-5 flex-shrink-0 text-neutral-400' />
          )}
        </button>

        {/* Answer */}
        {isOpen && (
          <div className='space-y-4 border-t border-neutral-800/50 pt-4'>
            <p className='pl-8 leading-relaxed text-neutral-300'>
              {faq.answer}
            </p>

            {/* Helpful Feedback */}
            <div className='flex items-center gap-4 border-t border-neutral-800/50 pt-3 pl-8'>
              <span className='text-sm text-neutral-500'>
                Was this helpful?
              </span>
              <div className='flex gap-2'>
                <button
                  onClick={() => handleFeedback(true)}
                  className='flex items-center gap-1.5 rounded-lg bg-neutral-800/50 px-3 py-1.5 text-sm transition-colors hover:bg-green-900/30 hover:text-green-400'
                  aria-label='Mark as helpful'
                >
                  <ThumbsUp className='h-4 w-4' />
                  Yes
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className='flex items-center gap-1.5 rounded-lg bg-neutral-800/50 px-3 py-1.5 text-sm transition-colors hover:bg-red-900/30 hover:text-red-400'
                  aria-label='Mark as not helpful'
                >
                  <ThumbsDown className='h-4 w-4' />
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
})
FAQItem.displayName = 'FAQItem'

/**
 * Memoized Tab Button Component
 */
const TabButton = memo(({ category, count, isActive, onClick }) => {
  const config = CATEGORY_CONFIG[category] || DEFAULT_CONFIG
  const Icon = config.icon

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 transition-all ${
        isActive
          ? config.activeColors
          : 'border-neutral-700/50 text-neutral-400 hover:border-neutral-600 hover:bg-neutral-800/30'
      }`}
      aria-selected={isActive}
      role='tab'
    >
      <Icon className={`h-4 w-4 ${isActive ? '' : 'text-neutral-500'}`} />
      <span className='font-medium'>{category}</span>
      <span className={`text-xs ${isActive ? 'opacity-80' : 'opacity-60'}`}>
        ({count})
      </span>
    </button>
  )
})
TabButton.displayName = 'TabButton'

/**
 * Memoized Tab Content Component
 */
const TabContent = memo(({ faqs, openItems, onToggle, onFeedback }) => {
  return (
    <div className='space-y-3'>
      {faqs.map((faq) => (
        <FAQItem
          key={faq.id}
          faq={faq}
          isOpen={openItems.has(faq.id)}
          onToggle={() => onToggle(faq.id)}
          onFeedback={onFeedback}
        />
      ))}
    </div>
  )
})
TabContent.displayName = 'TabContent'

/**
 * Memoized Quick Links Component
 */
const QuickLinks = memo(() => {
  const links = useMemo(
    () => [
      {
        href: '/feedback',
        icon: Mail,
        title: 'Contact Support',
        description: 'Get help from our team'
      },
      {
        href: '/usage-policy',
        icon: BookOpen,
        title: 'Documentation',
        description: 'Browse our guides'
      },
      {
        href: '/agents/create-nlp',
        icon: Zap,
        title: 'Get Started',
        description: 'Create your first agent'
      }
    ],
    []
  )

  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      {links.map((link) => {
        const Icon = link.icon
        return (
          <Link key={link.href} href={link.href}>
            <Card className='group cursor-pointer border-neutral-700/50 transition-all hover:border-orange-600/50 hover:bg-orange-950/10'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/40 transition-colors group-hover:bg-orange-600/40'>
                  <Icon className='h-5 w-5 text-orange-400' />
                </div>
                <div>
                  <p className='font-semibold text-neutral-200'>{link.title}</p>
                  <p className='text-xs text-neutral-400'>{link.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
})
QuickLinks.displayName = 'QuickLinks'

/**
 * Memoized Header Section
 */
const HeaderSection = memo(() => {
  return (
    <div className='mb-8 text-center'>
      <div className='mb-4 flex justify-center'>
        <div className='rounded-full bg-gradient-to-br from-orange-500 to-orange-600 p-4'>
          <HelpCircle className='h-8 w-8 text-white' />
        </div>
      </div>
      <h1 className='mb-3 text-4xl font-bold text-neutral-100'>
        Frequently Asked Questions
      </h1>
      <p className='text-lg text-neutral-400'>
        Find answers to common questions about AI-Spot
      </p>
    </div>
  )
})
HeaderSection.displayName = 'HeaderSection'

/**
 * Main FAQ Page Component
 */
export default function FAQPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState(new Set())
  const [activeTab, setActiveTab] = useState('all')

  // React Query hooks
  const {
    data: faqs = [],
    isLoading: faqsLoading,
    error: faqsError
  } = useFAQs()
  const [delayedLoading, setDelayedLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  // Memoized search results and grouping
  const filteredFAQs = useSearchFAQs(faqs, searchTerm)
  const groupedFAQs = useGroupedFAQs(filteredFAQs)

  // Get current tab's FAQs
  const currentTabFAQs = useMemo(() => {
    if (activeTab === 'all') return filteredFAQs
    const group = groupedFAQs.find((g) => g.category === activeTab)
    return group?.faqs || []
  }, [activeTab, filteredFAQs, groupedFAQs])

  // Set initial active tab when data loads
  useMemo(() => {
    if (groupedFAQs.length > 0 && activeTab === 'all' && !searchTerm) {
      // Keep 'all' as default
    }
  }, [groupedFAQs, activeTab, searchTerm])

  // Handlers
  const handleToggle = useCallback((faqId) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(faqId)) {
        next.delete(faqId)
      } else {
        next.add(faqId)
      }
      return next
    })
  }, [])

  const handleFeedback = useCallback((faqId, helpful) => {
    console.log(`FAQ ${faqId} was ${helpful ? 'helpful' : 'not helpful'}`)
  }, [])

  const handleExpandAll = useCallback(() => {
    setOpenItems(new Set(currentTabFAQs.map((faq) => faq.id)))
  }, [currentTabFAQs])

  const handleCollapseAll = useCallback(() => {
    setOpenItems(new Set())
  }, [])

  const handleTabChange = useCallback((category) => {
    setActiveTab(category)
    setOpenItems(new Set()) // Close all when switching tabs
  }, [])

  const handleSearch = useCallback(
    (e) => {
      setSearchTerm(e.target.value)
      if (e.target.value && activeTab !== 'all') {
        setActiveTab('all') // Switch to "All" when searching
      }
    },
    [activeTab]
  )

  // Loading state
  if (delayedLoading) {
    return (
      <LoadingState
        message={authLoading ? 'Loading...' : 'Loading FAQs...'}
        className='min-h-screen'
      />
    )
  }
  if (authLoading || faqsLoading) {
    return <FAQPageSkeleton userProfile={userProfile} />
  }
  // Error state
  if (faqsError) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <Card className='max-w-md border-red-600/30 bg-gradient-to-br from-red-900/20 to-neutral-950/50'>
          <div className='p-8 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/40'>
              <HelpCircle className='h-8 w-8 text-red-400' />
            </div>
            <h3 className='mb-2 text-xl font-bold text-neutral-100'>Error</h3>
            <p className='text-sm text-neutral-400'>{faqsError.message}</p>
            <Button onClick={() => window.location.reload()} className='mt-6'>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              title='FAQ'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
              <HeaderSection />

              {/* Search Bar */}
              <Card className='mb-8 border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
                <div className='relative'>
                  <Search className='absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-400' />
                  <input
                    type='text'
                    placeholder='Search FAQs...'
                    value={searchTerm}
                    onChange={handleSearch}
                    className='w-full rounded-lg border border-neutral-700/50 bg-neutral-900/50 py-3 pr-4 pl-12 text-neutral-100 placeholder-neutral-500 transition-colors outline-none focus:border-orange-600/50 focus:bg-neutral-900'
                    aria-label='Search FAQs'
                  />
                </div>
              </Card>

              {/* Tabs Navigation */}
              {!searchTerm && groupedFAQs.length > 0 && (
                <div className='mb-6'>
                  <div
                    className='custom-scrollbar flex gap-2 overflow-x-auto pb-2'
                    role='tablist'
                  >
                    {/* All Tab */}
                    <TabButton
                      category='All'
                      count={filteredFAQs.length}
                      isActive={activeTab === 'all'}
                      onClick={() => handleTabChange('all')}
                    />

                    {/* Category Tabs */}
                    {groupedFAQs.map((group) => (
                      <TabButton
                        key={group.category}
                        category={group.category}
                        count={group.count}
                        isActive={activeTab === group.category}
                        onClick={() => handleTabChange(group.category)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Results Info & Controls */}
              {currentTabFAQs.length > 0 && (
                <div className='mb-6 flex items-center justify-between'>
                  <p className='text-sm text-neutral-400'>
                    {searchTerm
                      ? `Found ${currentTabFAQs.length} result${currentTabFAQs.length !== 1 ? 's' : ''}`
                      : activeTab === 'all'
                        ? `${faqs.length} questions across ${groupedFAQs.length} categories`
                        : `${currentTabFAQs.length} question${currentTabFAQs.length !== 1 ? 's' : ''} in ${activeTab}`}
                  </p>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleExpandAll}
                      className='text-xs'
                    >
                      Expand All
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleCollapseAll}
                      className='text-xs'
                    >
                      Collapse All
                    </Button>
                  </div>
                </div>
              )}

              {/* Tab Content */}
              {currentTabFAQs.length === 0 ? (
                // Empty State
                <Card className='border-neutral-700/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20'>
                  <div className='flex flex-col items-center py-12 text-center'>
                    <Search className='mb-4 h-12 w-12 text-neutral-600' />
                    <h3 className='mb-2 text-lg font-semibold text-neutral-300'>
                      No results found
                    </h3>
                    <p className='mb-6 text-sm text-neutral-500'>
                      {searchTerm
                        ? `No FAQs match "${searchTerm}". Try different keywords.`
                        : 'No FAQs available at the moment.'}
                    </p>
                    {searchTerm && (
                      <Button
                        onClick={() => setSearchTerm('')}
                        variant='outline'
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                // FAQ List
                <div role='tabpanel'>
                  <TabContent
                    faqs={currentTabFAQs}
                    openItems={openItems}
                    onToggle={handleToggle}
                    onFeedback={handleFeedback}
                  />
                </div>
              )}

              {/* Quick Links */}
              <div className='mt-12'>
                <h3 className='mb-4 text-xl font-bold text-neutral-100'>
                  Still need help?
                </h3>
                <QuickLinks />
              </div>

              {/* CTA Section */}
              <Card className='mt-8 border-orange-600/20 bg-gradient-to-br from-orange-950/20 to-neutral-950/50 text-center'>
                <div className='space-y-4'>
                  <h3 className='text-2xl font-bold text-neutral-100'>
                    Can&apos;t find what you&apos;re looking for?
                  </h3>
                  <p className='text-neutral-400'>
                    Our support team is here to help you succeed
                  </p>
                  <Link href='/feedback'>
                    <Button className='bg-orange-600 hover:bg-orange-700'>
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
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

        /* Horizontal scrollbar styling */
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </>
  )
}
