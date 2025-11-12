'use client'

import {
  Shield,
  Lock,
  Eye,
  Database,
  Cookie,
  Share2,
  UserCheck,
  Globe,
  FileText,
  AlertTriangle,
  Mail,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { memo, useMemo } from 'react'
import LoadingState from '../../components/common/loading-state'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useAuth } from '../../components/providers/AuthProvider'
import SideBarLayout from '../../components/sideBarLayout'
import NeonBackground from '../../components/ui/background'
import Card from '../../components/ui/card'
import { useLogout } from '../../lib/supabase/auth'
import PrivacyPolicyPageSkeleton from '../../components/skeleton/PrivacyPolicyPageSkeleton'

/**
 * FULLY OPTIMIZED Privacy Policy Page
 *
 * Optimizations:
 * - All static data extracted outside component
 * - Heavy component memoization (10+ memoized components)
 * - Zero unnecessary re-renders
 * - Consistent with About page pattern
 * - Maximum performance for static content
 */

// Static data - defined outside component to prevent recreation
const HIGHLIGHTS_DATA = [
  {
    icon: Shield,
    title: 'We Never Sell Your Data',
    description: 'Your data is yours. We will never sell it to third parties.',
    color: 'green'
  },
  {
    icon: Lock,
    title: 'Enterprise-Grade Security',
    description:
      'Bank-level encryption and security measures protect your data.',
    color: 'blue'
  },
  {
    icon: UserCheck,
    title: 'You Have Control',
    description: 'Access, modify, or delete your data at any time.',
    color: 'purple'
  },
  {
    icon: CheckCircle2,
    title: 'GDPR & CCPA Compliant',
    description: 'Full compliance with major privacy regulations worldwide.',
    color: 'orange'
  }
]

const SECTIONS_DATA = [
  {
    id: 'introduction',
    title: '1. Introduction',
    icon: FileText,
    content: [
      'AI-Spot ("we", "our", or "us") is committed to protecting your privacy and personal data.',
      'This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI agent platform and services ("the Service").',
      'Please read this privacy policy carefully. If you do not agree with the terms, please discontinue use of the Service.',
      'We reserve the right to make changes to this Privacy Policy at any time. We will notify you of any changes by updating the "Last Updated" date.',
      'Your continued use of the Service after changes are posted constitutes acceptance of the updated Privacy Policy.'
    ]
  },
  {
    id: 'information-collected',
    title: '2. Information We Collect',
    icon: Database,
    subsections: [
      {
        subtitle: '2.1 Information You Provide',
        items: [
          'Account Information: Name, email address, password, profile picture',
          'Payment Information: Billing address, payment method details (processed securely by third-party payment processors)',
          'Profile Data: Company name, phone number, preferences, and other information you choose to provide',
          'Content Data: AI agent configurations, knowledge base content, conversation data, and uploaded files',
          'Communications: Messages you send us through support channels, feedback forms, or email'
        ]
      },
      {
        subtitle: '2.2 Automatically Collected Information',
        items: [
          'Usage Data: Pages viewed, features used, time spent, clicks, and navigation patterns',
          'Device Information: IP address, browser type, operating system, device identifiers',
          'Location Data: General geographic location based on IP address',
          'Log Data: Server logs, error reports, and system activity',
          'Analytics Data: User behavior, feature usage statistics, and performance metrics'
        ]
      },
      {
        subtitle: '2.3 Cookies and Tracking Technologies',
        items: [
          'Essential Cookies: Required for authentication and core functionality',
          'Analytics Cookies: Help us understand how users interact with the Service',
          'Preference Cookies: Remember your settings and preferences',
          'Third-Party Cookies: Used by analytics and advertising partners (with your consent)',
          'You can control cookies through your browser settings, but this may limit functionality'
        ]
      }
    ]
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    icon: Eye,
    content: [
      'To provide, maintain, and improve the Service',
      'To process your transactions and manage your subscription',
      'To create and manage your account',
      'To respond to your inquiries and provide customer support',
      'To send you technical notices, updates, security alerts, and administrative messages',
      'To personalize your experience and provide relevant content',
      'To analyze usage patterns and improve our Service',
      'To detect, prevent, and address technical issues and security threats',
      'To comply with legal obligations and enforce our terms',
      'To send marketing communications (with your consent, where required)',
      'To conduct research and development for new features and services'
    ]
  },
  {
    id: 'data-processing',
    title: '4. AI & Data Processing',
    icon: UserCheck,
    content: [
      'Your AI agents process data you provide, including conversation content and knowledge base materials.',
      'We use third-party AI models (including OpenAI) to power AI agent functionality.',
      'Conversation data may be used to improve AI model performance (you can opt out in settings).',
      'We implement measures to prevent unauthorized access to your AI agent data.',
      'You retain ownership of content created by your AI agents.',
      'We may use anonymized, aggregated data for analytics and service improvement.',
      'Data processing complies with applicable data protection laws including GDPR and CCPA.'
    ]
  },
  {
    id: 'data-sharing',
    title: '5. How We Share Your Information',
    icon: Share2,
    subsections: [
      {
        subtitle: '5.1 Service Providers',
        items: [
          'Cloud Hosting: We use Supabase and other cloud services to store and process data',
          'Payment Processing: Payment processors like Stripe or Razorpay handle transaction data',
          'Analytics: Services like Google Analytics help us understand usage patterns',
          'Email Services: For sending transactional and marketing emails',
          'AI Models: OpenAI and other AI providers process data to power AI agents'
        ]
      },
      {
        subtitle: '5.2 Legal Requirements',
        items: [
          'To comply with applicable laws, regulations, or legal processes',
          'To respond to lawful requests from public authorities',
          'To protect our rights, privacy, safety, or property',
          'To enforce our terms and conditions',
          'In connection with fraud prevention and security matters'
        ]
      },
      {
        subtitle: '5.3 Business Transfers',
        items: [
          'In the event of a merger, acquisition, or sale of assets',
          'During bankruptcy or similar proceedings',
          'With your consent or at your direction',
          'You will be notified of any such transfer'
        ]
      },
      {
        subtitle: '5.4 Third-Party Integrations',
        items: [
          'When you connect third-party services (e.g., Slack, Google Sheets)',
          "Data sharing is governed by those third parties' privacy policies",
          'You can disconnect integrations at any time'
        ]
      }
    ]
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
    icon: Database,
    content: [
      'We retain your data for as long as your account is active or as needed to provide services.',
      'Account data is retained for 30 days after account deletion, then permanently deleted.',
      'Conversation data may be retained for analytics and service improvement (anonymized after account deletion).',
      'Billing records are retained as required by law (typically 7 years).',
      'Backup data is retained for 90 days for disaster recovery purposes.',
      'You can request data deletion at any time (subject to legal retention requirements).',
      'Anonymized and aggregated data may be retained indefinitely for analytics.'
    ]
  },
  {
    id: 'data-security',
    title: '7. Data Security',
    icon: Lock,
    content: [
      'We implement industry-standard security measures to protect your data:',
      'Encryption: Data is encrypted in transit (TLS/SSL) and at rest',
      'Access Controls: Strict access controls and authentication requirements',
      'Regular Audits: Security assessments and vulnerability testing',
      'Secure Infrastructure: Hosted on secure, compliant cloud platforms',
      'Employee Training: Staff trained on data protection and security practices',
      'Incident Response: Procedures in place to respond to security incidents',
      'However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.',
      'You are responsible for maintaining the security of your account credentials.'
    ]
  },
  {
    id: 'your-rights',
    title: '8. Your Privacy Rights',
    icon: UserCheck,
    subsections: [
      {
        subtitle: '8.1 General Rights',
        items: [
          'Access: Request access to your personal data',
          'Correction: Request correction of inaccurate data',
          'Deletion: Request deletion of your data ("right to be forgotten")',
          'Portability: Request a copy of your data in a portable format',
          'Object: Object to processing of your data for certain purposes',
          'Restrict: Request restriction of data processing',
          'Withdraw Consent: Withdraw consent for data processing (where applicable)'
        ]
      },
      {
        subtitle: '8.2 GDPR Rights (EU/EEA Users)',
        items: [
          'All rights listed above apply',
          'Right to lodge a complaint with a supervisory authority',
          'Right to data portability in a structured, commonly used format',
          'Right to not be subject to automated decision-making',
          'Legal basis for processing: Contract performance, legitimate interests, or consent'
        ]
      },
      {
        subtitle: '8.3 CCPA Rights (California Residents)',
        items: [
          'Right to know what personal information is collected',
          'Right to know if personal information is sold or disclosed',
          'Right to opt-out of the sale of personal information (we do not sell data)',
          'Right to deletion of personal information',
          'Right to non-discrimination for exercising privacy rights',
          'We do not sell personal information'
        ]
      },
      {
        subtitle: '8.4 Exercising Your Rights',
        items: [
          'Contact us at privacy@ai-spot.com to exercise any of these rights',
          'We will respond to requests within 30 days (or as required by law)',
          'We may need to verify your identity before fulfilling requests',
          'Some data may be retained as required by law or legitimate business purposes'
        ]
      }
    ]
  },
  {
    id: 'cookies',
    title: '9. Cookies & Tracking',
    icon: Cookie,
    content: [
      'We use cookies and similar technologies to provide and improve the Service.',
      'Essential cookies are necessary for the Service to function (e.g., authentication).',
      'Analytics cookies help us understand how users interact with the Service.',
      'Marketing cookies may be used for advertising (with your consent).',
      'You can control cookies through your browser settings:',
      '  - Chrome: Settings > Privacy and Security > Cookies',
      '  - Firefox: Settings > Privacy & Security > Cookies',
      '  - Safari: Preferences > Privacy > Cookies',
      'Disabling cookies may limit functionality of the Service.',
      'We respect "Do Not Track" signals where technically feasible.'
    ]
  },
  {
    id: 'international',
    title: '10. International Data Transfers',
    icon: Globe,
    content: [
      'We are based in [Your Country] and process data in various locations worldwide.',
      'Your data may be transferred to and processed in countries outside your country of residence.',
      'These countries may have different data protection laws than your country.',
      'We ensure adequate safeguards are in place for international transfers:',
      '  - Standard Contractual Clauses (SCCs) approved by the European Commission',
      '  - Privacy Shield certification (where applicable)',
      '  - Adequacy decisions by relevant authorities',
      'By using the Service, you consent to the transfer of your data internationally.'
    ]
  },
  {
    id: 'children',
    title: "11. Children's Privacy",
    icon: AlertTriangle,
    content: [
      'The Service is not intended for children under 18 years of age.',
      'We do not knowingly collect personal information from children under 18.',
      'If you believe we have collected information from a child, please contact us immediately.',
      'We will take steps to delete such information promptly.',
      "Parents and guardians should monitor their children's online activities."
    ]
  },
  {
    id: 'third-party',
    title: '12. Third-Party Services',
    icon: Share2,
    content: [
      'The Service may contain links to third-party websites and services.',
      'We are not responsible for the privacy practices of these third parties.',
      'Third-party integrations are governed by their own privacy policies.',
      'We encourage you to read the privacy policies of any third-party services you use.',
      'Integrations include: OpenAI, Stripe, Razorpay, SendGrid, Twilio, and others.',
      'You can disconnect third-party integrations at any time from your account settings.'
    ]
  },
  {
    id: 'changes',
    title: '13. Changes to Privacy Policy',
    icon: FileText,
    content: [
      'We may update this Privacy Policy from time to time.',
      'Material changes will be notified via email or prominent notice on the Service.',
      'The "Last Updated" date at the top will always reflect the most recent version.',
      'Your continued use after changes constitutes acceptance.',
      'We encourage you to review this policy periodically.',
      'Previous versions are available upon request.'
    ]
  },
  {
    id: 'contact',
    title: '14. Contact Us',
    icon: Mail,
    content: [
      'If you have questions or concerns about this Privacy Policy or our data practices:',
      'Email: privacy@ai-spot.com',
      'Support: Submit a ticket through our feedback form',
      'Mail: [Your Company Address]',
      'Data Protection Officer: dpo@ai-spot.com',
      'We will respond to inquiries within 30 days.',
      'For GDPR requests, contact our EU representative at eu-privacy@ai-spot.com'
    ]
  }
]

// Utility function for color classes
const getColorClasses = (color) => {
  const colors = {
    green: 'border-green-600/30 text-green-400',
    blue: 'border-blue-600/30 text-blue-400',
    purple: 'border-purple-600/30 text-purple-400',
    orange: 'border-orange-600/30 text-orange-400'
  }
  return colors[color] || colors.orange
}

/**
 * Memoized Highlight Card Component
 */
const HighlightCard = memo(({ highlight }) => {
  const Icon = highlight.icon
  const colors = useMemo(
    () => getColorClasses(highlight.color),
    [highlight.color]
  )

  return (
    <Card className={`border ${colors}`}>
      <div className='space-y-3'>
        <Icon className='h-6 w-6' />
        <h3 className='font-semibold text-neutral-100'>{highlight.title}</h3>
        <p className='text-xs text-neutral-400'>{highlight.description}</p>
      </div>
    </Card>
  )
})
HighlightCard.displayName = 'HighlightCard'

/**
 * Memoized Content Item Component
 */
const ContentItem = memo(({ text }) => {
  return (
    <li className='flex items-start gap-3'>
      <div className='mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500' />
      <span className='leading-relaxed text-neutral-300'>{text}</span>
    </li>
  )
})
ContentItem.displayName = 'ContentItem'

/**
 * Memoized Subsection Item Component
 */
const SubsectionItem = memo(({ text }) => {
  return (
    <li className='flex items-start gap-3'>
      <div className='mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400' />
      <span className='text-sm leading-relaxed text-neutral-400'>{text}</span>
    </li>
  )
})
SubsectionItem.displayName = 'SubsectionItem'

/**
 * Memoized Subsection Component
 */
const Subsection = memo(({ subsection }) => {
  return (
    <div className='border-l-2 border-blue-600/30 pl-4'>
      <h3 className='mb-3 text-lg font-semibold text-neutral-200'>
        {subsection.subtitle}
      </h3>
      <ul className='space-y-2'>
        {subsection.items.map((item, itemIdx) => (
          <SubsectionItem key={itemIdx} text={item} />
        ))}
      </ul>
    </div>
  )
})
Subsection.displayName = 'Subsection'

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
          <div className='flex-shrink-0 rounded-lg bg-blue-900/40 p-3'>
            <Icon className='h-6 w-6 text-blue-400' />
          </div>
          <div className='flex-1'>
            <h2 className='mb-4 text-2xl font-bold text-neutral-100'>
              {section.title}
            </h2>

            {section.content && (
              <ul className='space-y-3'>
                {section.content.map((item, idx) => (
                  <ContentItem key={idx} text={item} />
                ))}
              </ul>
            )}

            {section.subsections && (
              <div className='space-y-6'>
                {section.subsections.map((subsection, subIdx) => (
                  <Subsection key={subIdx} subsection={subsection} />
                ))}
              </div>
            )}
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
        <div className='rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-6'>
          <Shield className='h-12 w-12 text-white' />
        </div>
      </div>
      <h1 className='mb-4 text-4xl font-bold text-neutral-100'>
        Privacy Policy
      </h1>
      <p className='mx-auto max-w-2xl text-lg text-neutral-400'>
        Your privacy is important to us. This policy explains how we collect,
        use, and protect your personal information.
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
 * Memoized Highlights Section
 */
const HighlightsSection = memo(() => {
  return (
    <div className='mb-12'>
      <h2 className='mb-6 text-2xl font-bold text-neutral-100'>
        Our Commitment to You
      </h2>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {HIGHLIGHTS_DATA.map((highlight, index) => (
          <HighlightCard key={index} highlight={highlight} />
        ))}
      </div>
    </div>
  )
})
HighlightsSection.displayName = 'HighlightsSection'

/**
 * Memoized Sections Container
 */
const SectionsContainer = memo(() => {
  return (
    <div className='space-y-8'>
      {SECTIONS_DATA.map((section) => (
        <PolicySection key={section.id} section={section} />
      ))}
    </div>
  )
})
SectionsContainer.displayName = 'SectionsContainer'

/**
 * Memoized Contact Section
 */
const ContactSection = memo(() => {
  return (
    <Card className='mt-12 border-green-600/20 bg-gradient-to-br from-green-950/10 to-neutral-950/50'>
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <Mail className='h-6 w-6 text-green-400' />
          <h2 className='text-2xl font-bold text-neutral-100'>
            Privacy Questions?
          </h2>
        </div>
        <p className='text-neutral-300'>
          We&apos;re committed to transparency and protecting your privacy. If
          you have questions or concerns about how we handle your data, please
          reach out.
        </p>
        <div className='space-y-2 text-neutral-400'>
          <p>
            <strong className='text-neutral-300'>Privacy Team:</strong>{' '}
            <a
              href='mailto:privacy@ai-spot.com'
              className='text-green-400 hover:text-green-300'
            >
              privacy@ai-spot.com
            </a>
          </p>
          <p>
            <strong className='text-neutral-300'>
              Data Protection Officer:
            </strong>{' '}
            <a
              href='mailto:dpo@ai-spot.com'
              className='text-green-400 hover:text-green-300'
            >
              dpo@ai-spot.com
            </a>
          </p>
          <p>
            <strong className='text-neutral-300'>Support:</strong>{' '}
            <Link
              href='/feedback'
              className='text-green-400 hover:text-green-300'
            >
              Submit a privacy request
            </Link>
          </p>
        </div>
      </div>
    </Card>
  )
})
ContactSection.displayName = 'ContactSection'

/**
 * Memoized CTA Section
 */
const CTASection = memo(() => {
  return (
    <Card className='mt-8 border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
      <div className='space-y-4 text-center'>
        <UserCheck className='mx-auto h-12 w-12 text-blue-400' />
        <h3 className='text-xl font-bold text-neutral-100'>
          Exercise Your Privacy Rights
        </h3>
        <p className='text-neutral-400'>
          You have the right to access, correct, or delete your personal data at
          any time.
        </p>
        <div className='flex flex-wrap justify-center gap-4'>
          <Link href='/settings/general'>
            <button className='rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700'>
              Manage Your Data
            </button>
          </Link>
          <a href='mailto:privacy@ai-spot.com'>
            <button className='rounded-lg border border-blue-600/30 px-6 py-2 font-medium text-blue-400 transition-colors hover:bg-blue-900/20'>
              Contact Privacy Team
            </button>
          </a>
        </div>
      </div>
    </Card>
  )
})
CTASection.displayName = 'CTASection'

/**
 * Main Privacy Policy Page Component
 */
export default function PrivacyPolicyPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()

  // Memoize user profile for SideBarLayout
  const userProfile = useMemo(
    () => ({
      name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
      email: user?.email || 'guest@example.com',
      avatar: profile?.avatar_url || null
    }),
    [profile, user]
  )
  const [delayedLoading, setDelayedLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  // Loading state
  if (delayedLoading || authLoading) {
    return <YourSkeleton userProfile={userProfile} />
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
              title='Privacy Policy'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
              <HeaderSection />
              <HighlightsSection />
              <SectionsContainer />
              <ContactSection />
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
