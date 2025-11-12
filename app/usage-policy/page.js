'use client'

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Lock,
  Scale,
  Shield,
  Users,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, useEffect, useMemo } from 'react'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import UsagePolicyPageSkeleton from '../../components/skeleton/UsagePolicySkeleton'
import NeonBackground from '../../components/ui/background'
import Card from '../../components/ui/card'
import { useLogout } from '../../lib/supabase/auth'

/**
 * FULLY OPTIMIZED Usage Policy Page
 *
 * Optimizations:
 * - Memoized components for better performance
 * - Stable data structures with useMemo
 * - Pure utility functions outside component
 * - Proper hook ordering
 * - Reduced re-renders
 */

// Pure utility functions - outside component for better performance
const getColorClasses = (color) => {
  const colors = {
    green: 'border-green-600/30 text-green-400',
    blue: 'border-blue-600/30 text-blue-400',
    purple: 'border-purple-600/30 text-purple-400',
    orange: 'border-orange-600/30 text-orange-400'
  }
  return colors[color] || colors.orange
}

// Static data - defined once outside component
const QUICK_TIPS = [
  {
    icon: CheckCircle2,
    title: 'Use AI-Spot Responsibly',
    description: 'Create AI agents that provide value and comply with laws',
    color: 'green'
  },
  {
    icon: Shield,
    title: 'Protect Your Account',
    description: 'Use strong passwords and keep credentials secure',
    color: 'blue'
  },
  {
    icon: Users,
    title: 'Respect Other Users',
    description: "Don't abuse the platform or interfere with others",
    color: 'purple'
  },
  {
    icon: AlertCircle,
    title: 'Monitor Your Agents',
    description: 'Regularly review AI agent behavior and content',
    color: 'orange'
  }
]

const POLICY_SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    icon: FileText,
    content: [
      'By accessing and using AI-Spot ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.',
      'If you do not agree to these terms, please do not use the Service.',
      'We reserve the right to modify these terms at any time. Your continued use of the Service after changes are posted constitutes acceptance of the modified terms.',
      'These terms apply to all users of the Service, including free users, paid subscribers, and enterprise customers.'
    ]
  },
  {
    id: 'account',
    title: '2. Account Registration & Security',
    icon: Lock,
    content: [
      'You must be at least 18 years old to use this Service.',
      'You must provide accurate, current, and complete information during registration.',
      'You are responsible for maintaining the confidentiality of your account credentials.',
      'You are responsible for all activities that occur under your account.',
      'You must notify us immediately of any unauthorized use of your account.',
      'We reserve the right to suspend or terminate accounts that violate these terms.'
    ]
  },
  {
    id: 'acceptable-use',
    title: '3. Acceptable Use Policy',
    icon: CheckCircle2,
    content: [
      'You agree to use the Service only for lawful purposes and in accordance with these terms.',
      'You may use AI-Spot to create AI agents for legitimate business purposes, customer service, automation, and similar applications.',
      'You are responsible for all content created, transmitted, or displayed through your AI agents.',
      'You must ensure your AI agents comply with all applicable laws and regulations.',
      'You must not use the Service in any way that could harm, disable, or impair the Service or interfere with other users.'
    ]
  },
  {
    id: 'prohibited',
    title: '4. Prohibited Uses',
    icon: XCircle,
    content: [
      'Creating AI agents that generate or promote illegal content, hate speech, harassment, or discrimination.',
      'Using the Service to transmit malware, viruses, or any malicious code.',
      'Attempting to gain unauthorized access to the Service, other accounts, or systems.',
      'Scraping, data mining, or using automated systems to access the Service without permission.',
      'Creating AI agents that impersonate real persons or entities to deceive users.',
      'Using the Service to spam, phish, or send unsolicited communications.',
      'Creating content that violates intellectual property rights of others.',
      'Using the Service for any illegal activities or to facilitate illegal activities.',
      'Reverse engineering, decompiling, or attempting to extract source code from the Service.',
      'Reselling or redistributing the Service without explicit written permission.'
    ]
  },
  {
    id: 'content',
    title: '5. User Content & Data',
    icon: FileText,
    content: [
      'You retain all rights to content you create and upload to the Service.',
      'By uploading content, you grant us a license to store, process, and display that content to provide the Service.',
      'You are solely responsible for the content of your AI agents and their interactions.',
      'We reserve the right to remove content that violates these terms without prior notice.',
      'You must have all necessary rights and permissions for any content you upload.',
      'You agree not to upload content that contains personally identifiable information without proper consent.'
    ]
  },
  {
    id: 'subscription',
    title: '6. Subscription & Payments',
    icon: Scale,
    content: [
      'Some features require a paid subscription. Current pricing is available on our pricing page.',
      'Subscriptions are billed monthly or annually based on your selected plan.',
      'All fees are non-refundable except as required by law or expressly stated in our refund policy.',
      'You authorize us to charge your payment method for all fees incurred.',
      'We reserve the right to change pricing with 30 days notice to existing subscribers.',
      'Failure to pay may result in suspension or termination of your account.',
      'Enterprise customers are subject to their custom agreement terms.'
    ]
  },
  {
    id: 'api',
    title: '7. API Usage & Rate Limits',
    icon: Users,
    content: [
      'API usage is subject to rate limits based on your subscription tier.',
      'You must not exceed your allocated API credits or rate limits.',
      'Excessive API usage may result in temporary throttling or account suspension.',
      'We reserve the right to adjust rate limits to ensure fair usage across all users.',
      'API credentials must be kept secure and not shared or published publicly.',
      'You are responsible for all API calls made using your credentials.'
    ]
  },
  {
    id: 'intellectual-property',
    title: '8. Intellectual Property',
    icon: Shield,
    content: [
      'The Service, including all content, features, and functionality, is owned by AI-Spot and protected by copyright, trademark, and other intellectual property laws.',
      'You may not copy, modify, distribute, or create derivative works from the Service.',
      'Our name, logo, and branding are trademarks of AI-Spot and may not be used without permission.',
      'Any feedback or suggestions you provide may be used by us without compensation or attribution.'
    ]
  },
  {
    id: 'termination',
    title: '9. Termination',
    icon: XCircle,
    content: [
      'You may terminate your account at any time through your account settings.',
      'We may suspend or terminate your account if you violate these terms.',
      'We may terminate accounts that remain inactive for extended periods.',
      'Upon termination, your right to use the Service ceases immediately.',
      'We will retain your data for 30 days after termination, after which it may be permanently deleted.',
      'Subscription fees are non-refundable upon voluntary termination.'
    ]
  },
  {
    id: 'liability',
    title: '10. Limitation of Liability',
    icon: AlertCircle,
    content: [
      'THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.',
      'We do not guarantee that the Service will be uninterrupted, secure, or error-free.',
      'We are not responsible for content generated by AI agents or their interactions with users.',
      'To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages.',
      'Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.',
      'Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.'
    ]
  },
  {
    id: 'indemnification',
    title: '11. Indemnification',
    icon: Shield,
    content: [
      'You agree to indemnify and hold harmless AI-Spot from any claims arising from your use of the Service.',
      'This includes claims related to content created by your AI agents.',
      'You are responsible for defending against claims arising from your violation of these terms.',
      "You will reimburse us for any damages, costs, and attorneys' fees incurred."
    ]
  },
  {
    id: 'privacy',
    title: '12. Privacy & Data Protection',
    icon: Lock,
    content: [
      'Your use of the Service is also governed by our Privacy Policy.',
      'We collect and process data as described in our Privacy Policy.',
      'You are responsible for complying with privacy laws applicable to your AI agents.',
      'You must obtain necessary consents from users who interact with your AI agents.',
      'We implement security measures to protect your data but cannot guarantee absolute security.'
    ]
  },
  {
    id: 'modifications',
    title: '13. Modifications to Service',
    icon: FileText,
    content: [
      'We reserve the right to modify or discontinue the Service at any time.',
      'We may add, change, or remove features with or without notice.',
      'We will make reasonable efforts to notify users of significant changes.',
      'Continued use after modifications constitutes acceptance of changes.'
    ]
  },
  {
    id: 'governing-law',
    title: '14. Governing Law & Disputes',
    icon: Scale,
    content: [
      'These terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.',
      'Any disputes shall be resolved through binding arbitration or in the courts of [Your Jurisdiction].',
      'You agree to first attempt to resolve disputes through good faith negotiation.',
      'Each party shall bear their own costs in any dispute resolution.'
    ]
  },
  {
    id: 'general',
    title: '15. General Provisions',
    icon: FileText,
    content: [
      'These terms constitute the entire agreement between you and AI-Spot.',
      'If any provision is found unenforceable, the remaining provisions remain in effect.',
      'Our failure to enforce any right does not waive that right.',
      'These terms may not be assigned by you without our prior written consent.',
      'Notices must be sent to the contact information provided on our website.'
    ]
  }
]

/**
 * Memoized Quick Tip Card Component
 */
const QuickTipCard = memo(({ tip }) => {
  const Icon = tip.icon
  const colors = useMemo(() => getColorClasses(tip.color), [tip.color])

  return (
    <Card className={`border ${colors}`}>
      <div className='space-y-3'>
        <Icon className='h-6 w-6' />
        <h3 className='font-semibold text-neutral-100'>{tip.title}</h3>
        <p className='text-xs text-neutral-400'>{tip.description}</p>
      </div>
    </Card>
  )
})
QuickTipCard.displayName = 'QuickTipCard'

/**
 * Memoized Policy Section Component
 */
const PolicySection = memo(({ section }) => {
  const Icon = section.icon

  return (
    <Card
      id={section.id}
      className='scroll-mt-24 border-neutral-800/50 bg-neutral-900/20'
    >
      <div className='space-y-4'>
        <div className='flex items-start gap-4'>
          <div className='flex-shrink-0 rounded-lg bg-orange-900/40 p-3'>
            <Icon className='h-6 w-6 text-orange-400' />
          </div>
          <div className='flex-1'>
            <h2 className='mb-4 text-2xl font-bold text-neutral-100'>
              {section.title}
            </h2>
            <ul className='space-y-3'>
              {section.content.map((item, idx) => (
                <li key={idx} className='flex items-start gap-3'>
                  <div className='mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500' />
                  <span className='leading-relaxed text-neutral-300'>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
})
PolicySection.displayName = 'PolicySection'

/**
 * Memoized Header Section
 */
const HeaderSection = memo(() => {
  return (
    <div className='mb-12 text-center'>
      <div className='mb-6 flex justify-center'>
        <div className='rounded-full bg-gradient-to-br from-orange-500 to-orange-600 p-6'>
          <FileText className='h-12 w-12 text-white' />
        </div>
      </div>
      <h1 className='mb-4 text-4xl font-bold text-neutral-100'>
        Usage Policy & Terms of Service
      </h1>
      <p className='mx-auto max-w-2xl text-lg text-neutral-400'>
        Please read these terms carefully before using AI-Spot. By using our
        service, you agree to be bound by these terms.
      </p>
      <div className='mt-6 flex items-center justify-center gap-2 text-sm text-neutral-500'>
        <span>Last Updated: November 4, 2025</span>
        <span>•</span>
        <span>Effective Date: November 4, 2025</span>
      </div>
    </div>
  )
})
HeaderSection.displayName = 'HeaderSection'

/**
 * Memoized Contact Section
 */
const ContactSection = memo(() => {
  return (
    <Card className='mt-12 border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <AlertCircle className='h-6 w-6 text-blue-400' />
          <h2 className='text-2xl font-bold text-neutral-100'>
            Questions or Concerns?
          </h2>
        </div>
        <p className='text-neutral-300'>
          If you have any questions about these terms or need clarification on
          any policy, please don&apos;t hesitate to contact us.
        </p>
        <div className='space-y-2 text-neutral-400'>
          <p>
            <strong className='text-neutral-300'>Email:</strong>{' '}
            <a
              href='mailto:legal@ai-spot.com'
              className='text-blue-400 hover:text-blue-300'
            >
              legal@ai-spot.com
            </a>
          </p>
          <p>
            <strong className='text-neutral-300'>Support:</strong>{' '}
            <Link
              href='/feedback'
              className='text-blue-400 hover:text-blue-300'
            >
              Submit a ticket
            </Link>
          </p>
        </div>
      </div>
    </Card>
  )
})
ContactSection.displayName = 'ContactSection'

/**
 * Memoized Agreement Section
 */
const AgreementSection = memo(() => {
  return (
    <Card className='mt-8 border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
      <div className='space-y-4 text-center'>
        <CheckCircle2 className='mx-auto h-12 w-12 text-orange-400' />
        <h3 className='text-xl font-bold text-neutral-100'>
          By Using AI-Spot, You Agree to These Terms
        </h3>
        <p className='text-neutral-400'>
          Your continued use of the Service constitutes acceptance of these
          terms and any future modifications.
        </p>
      </div>
    </Card>
  )
})
AgreementSection.displayName = 'AgreementSection'

/**
 * Main Usage Policy Page Component
 */
export default function UsagePolicyPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()
  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }
  // Memoize quick tips and sections to prevent recreation
  const quickTips = useMemo(() => QUICK_TIPS, [])
  const sections = useMemo(() => POLICY_SECTIONS, [])

  // Redirect if not authenticated (optional - remove if page should be public)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])
  const [delayedLoading, setDelayedLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  // Loading state - after all hooks
  if (delayedLoading || authLoading) {
    return <UsagePolicyPageSkeleton userProfile={userProfile} />
  }

  // Don't render if not authenticated (optional - remove if page should be public)
  if (!user) {
    return null
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              title='Usage Policy'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
              <HeaderSection />

              {/* Quick Tips */}
              <div className='mb-12'>
                <h2 className='mb-6 text-2xl font-bold text-neutral-100'>
                  Quick Guidelines
                </h2>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  {quickTips.map((tip, index) => (
                    <QuickTipCard key={index} tip={tip} />
                  ))}
                </div>
              </div>

              {/* Terms Sections */}
              <div className='space-y-8'>
                {sections.map((section) => (
                  <PolicySection key={section.id} section={section} />
                ))}
              </div>

              <ContactSection />
              <AgreementSection />
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
