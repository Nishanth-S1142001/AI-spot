/**
 * Mock FAQ Data
 * This file contains FAQ data that can be used directly without an API endpoint
 * Replace with real API calls when backend is ready
 */

export const mockFAQData = [
  // Getting Started
  {
    id: 'faq-1',
    question: 'What is AI-Spot?',
    answer: 'AI-Spot is a powerful platform that allows you to create, deploy, and manage AI agents for various use cases. Whether you need customer service automation, lead generation, or intelligent chatbots, AI-Spot provides the tools to build sophisticated AI solutions without coding.',
    category: 'Getting Started',
    tags: ['basics', 'platform', 'overview'],
    helpful_count: 45,
    not_helpful_count: 2,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'faq-2',
    question: 'How do I create my first AI agent?',
    answer: 'Creating your first AI agent is easy! Navigate to the "Create Agent" page, choose your agent type (conversational, task-based, or analytical), configure its behavior and knowledge base, and deploy it. You can also use our AI-assisted creation wizard for guided setup.',
    category: 'Getting Started',
    tags: ['creation', 'tutorial', 'agents'],
    helpful_count: 38,
    not_helpful_count: 3,
    created_at: '2024-01-16T10:00:00Z'
  },
  {
    id: 'faq-3',
    question: 'Do I need coding knowledge to use AI-Spot?',
    answer: 'No coding knowledge is required! AI-Spot provides an intuitive interface for creating and managing AI agents. However, if you want advanced customization, we also offer API access and webhook integrations for developers.',
    category: 'Getting Started',
    tags: ['coding', 'requirements', 'technical'],
    helpful_count: 52,
    not_helpful_count: 1,
    created_at: '2024-01-17T10:00:00Z'
  },

  // Agents
  {
    id: 'faq-4',
    question: 'What types of AI agents can I create?',
    answer: 'You can create various types of agents including: conversational chatbots for customer service, task automation agents for workflows, analytical agents for data insights, booking agents for appointments, and custom agents tailored to your specific needs.',
    category: 'Agents',
    tags: ['agent types', 'capabilities', 'features'],
    helpful_count: 41,
    not_helpful_count: 4,
    created_at: '2024-01-18T10:00:00Z'
  },
  {
    id: 'faq-5',
    question: 'How do I add knowledge to my AI agent?',
    answer: 'You can add knowledge to your agent through multiple methods: upload documents (PDF, TXT, DOCX), connect to external data sources, manually input information, or use our web scraping feature to gather data from URLs. The agent will use this knowledge to provide accurate responses.',
    category: 'Agents',
    tags: ['knowledge base', 'training', 'documents'],
    helpful_count: 36,
    not_helpful_count: 5,
    created_at: '2024-01-19T10:00:00Z'
  },
  {
    id: 'faq-6',
    question: 'Can I customize my agent\'s personality and tone?',
    answer: 'Yes! You can fully customize your agent\'s personality, tone, and communication style. Set parameters like formality level, friendliness, verbosity, and even add custom phrases or greetings to match your brand voice.',
    category: 'Agents',
    tags: ['customization', 'personality', 'branding'],
    helpful_count: 29,
    not_helpful_count: 2,
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'faq-7',
    question: 'How many agents can I create?',
    answer: 'The number of agents you can create depends on your subscription plan. Free tier allows 1 agent, Starter allows 3 agents, Professional allows 10 agents, and Enterprise has unlimited agents. Check our pricing page for details.',
    category: 'Agents',
    tags: ['limits', 'plans', 'subscription'],
    helpful_count: 33,
    not_helpful_count: 3,
    created_at: '2024-01-21T10:00:00Z'
  },

  // Billing
  {
    id: 'faq-8',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and bank transfers for enterprise accounts. All payments are processed securely through Stripe.',
    category: 'Billing',
    tags: ['payment', 'methods', 'stripe'],
    helpful_count: 27,
    not_helpful_count: 1,
    created_at: '2024-01-22T10:00:00Z'
  },
  {
    id: 'faq-9',
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time from your account settings. Upgrades take effect immediately, while downgrades take effect at the start of your next billing cycle. You\'ll be prorated for any changes.',
    category: 'Billing',
    tags: ['upgrade', 'downgrade', 'plans'],
    helpful_count: 31,
    not_helpful_count: 2,
    created_at: '2024-01-23T10:00:00Z'
  },
  {
    id: 'faq-10',
    question: 'What is your refund policy?',
    answer: 'We offer a 14-day money-back guarantee for annual subscriptions. Monthly subscriptions can be cancelled anytime, and you won\'t be charged for the next month. Unused credits and features are prorated for refunds.',
    category: 'Billing',
    tags: ['refund', 'policy', 'cancellation'],
    helpful_count: 24,
    not_helpful_count: 3,
    created_at: '2024-01-24T10:00:00Z'
  },
  {
    id: 'faq-11',
    question: 'How does credit usage work?',
    answer: 'Credits are consumed based on AI interactions, message volume, and API calls. Each plan includes a monthly credit allowance. You can monitor usage in your dashboard and purchase additional credits if needed. Unused credits roll over for annual plans.',
    category: 'Billing',
    tags: ['credits', 'usage', 'consumption'],
    helpful_count: 28,
    not_helpful_count: 4,
    created_at: '2024-01-25T10:00:00Z'
  },

  // Security
  {
    id: 'faq-12',
    question: 'How secure is my data on AI-Spot?',
    answer: 'We take security very seriously. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We\'re SOC 2 Type II certified, GDPR compliant, and conduct regular security audits. Your data is never shared with third parties without explicit consent.',
    category: 'Security',
    tags: ['encryption', 'compliance', 'data protection'],
    helpful_count: 42,
    not_helpful_count: 1,
    created_at: '2024-01-26T10:00:00Z'
  },
  {
    id: 'faq-13',
    question: 'Where is my data stored?',
    answer: 'Your data is stored in secure, redundant data centers across multiple regions. You can choose your preferred data region during setup. We use industry-leading cloud providers with 99.99% uptime SLA and automatic backups.',
    category: 'Security',
    tags: ['storage', 'data centers', 'regions'],
    helpful_count: 19,
    not_helpful_count: 2,
    created_at: '2024-01-27T10:00:00Z'
  },
  {
    id: 'faq-14',
    question: 'Do you support two-factor authentication (2FA)?',
    answer: 'Yes! We strongly recommend enabling 2FA for your account. We support authenticator apps (Google Authenticator, Authy), SMS verification, and hardware security keys (YubiKey, FIDO2).',
    category: 'Security',
    tags: ['2FA', 'authentication', 'account security'],
    helpful_count: 35,
    not_helpful_count: 1,
    created_at: '2024-01-28T10:00:00Z'
  },

  // Team
  {
    id: 'faq-15',
    question: 'Can I collaborate with team members?',
    answer: 'Absolutely! Professional and Enterprise plans include team collaboration features. Invite team members, assign roles (admin, editor, viewer), manage permissions, and track team activity. Real-time collaboration is supported.',
    category: 'Team',
    tags: ['collaboration', 'team', 'roles'],
    helpful_count: 26,
    not_helpful_count: 3,
    created_at: '2024-01-29T10:00:00Z'
  },
  {
    id: 'faq-16',
    question: 'What are the different user roles?',
    answer: 'We offer four roles: Owner (full access), Admin (manage agents and team), Editor (create and modify agents), and Viewer (read-only access). Each role has specific permissions that can be customized for enterprise accounts.',
    category: 'Team',
    tags: ['roles', 'permissions', 'access control'],
    helpful_count: 22,
    not_helpful_count: 2,
    created_at: '2024-01-30T10:00:00Z'
  },

  // Support
  {
    id: 'faq-17',
    question: 'What support options are available?',
    answer: 'We offer multiple support channels: email support (24-48h response), live chat for Professional+ plans, priority support for Enterprise, comprehensive documentation, video tutorials, and community forums. Enterprise customers get dedicated account managers.',
    category: 'Support',
    tags: ['help', 'contact', 'assistance'],
    helpful_count: 30,
    not_helpful_count: 4,
    created_at: '2024-01-31T10:00:00Z'
  },
  {
    id: 'faq-18',
    question: 'Is there a free trial?',
    answer: 'Yes! We offer a 14-day free trial with full access to Professional features. No credit card required to start. You can explore all features, create agents, and test integrations before committing to a paid plan.',
    category: 'Support',
    tags: ['trial', 'free', 'demo'],
    helpful_count: 48,
    not_helpful_count: 2,
    created_at: '2024-02-01T10:00:00Z'
  },
  {
    id: 'faq-19',
    question: 'Do you offer training or onboarding?',
    answer: 'Yes! All new customers receive access to our onboarding video series and documentation. Professional plans include email onboarding support, and Enterprise customers get personalized training sessions with our team.',
    category: 'Support',
    tags: ['training', 'onboarding', 'education'],
    helpful_count: 25,
    not_helpful_count: 3,
    created_at: '2024-02-02T10:00:00Z'
  },
  {
    id: 'faq-20',
    question: 'Can I request new features?',
    answer: 'Definitely! We love hearing from our users. Submit feature requests through our feedback portal, and our product team reviews all suggestions. Popular requests are prioritized in our roadmap. Enterprise customers can request custom features.',
    category: 'Support',
    tags: ['features', 'requests', 'roadmap'],
    helpful_count: 21,
    not_helpful_count: 1,
    created_at: '2024-02-03T10:00:00Z'
  }
]

/**
 * Simulate API delay for realistic behavior
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Get all FAQs (simulates API call)
 */
export async function getFAQs() {
  await delay(300) // Simulate network delay
  return mockFAQData
}

/**
 * Get FAQ by ID
 */
export async function getFAQById(id) {
  await delay(200)
  const faq = mockFAQData.find((f) => f.id === id)
  if (!faq) {
    throw new Error('FAQ not found')
  }
  return faq
}

/**
 * Submit FAQ feedback (simulates API call)
 */
export async function submitFAQFeedback(faqId, helpful) {
  await delay(300)
  
  // In a real app, this would update the database
  const faq = mockFAQData.find((f) => f.id === faqId)
  if (faq) {
    if (helpful) {
      faq.helpful_count++
    } else {
      faq.not_helpful_count++
    }
  }
  
  return { success: true, faq }
}

/**
 * Search FAQs
 */
export function searchFAQs(faqs, searchTerm) {
  if (!searchTerm.trim()) return faqs

  const term = searchTerm.toLowerCase()
  return faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(term) ||
      faq.answer.toLowerCase().includes(term) ||
      (faq.category && faq.category.toLowerCase().includes(term)) ||
      (faq.tags && faq.tags.some((tag) => tag.toLowerCase().includes(term)))
  )
}

/**
 * Group FAQs by category
 */
export function groupFAQsByCategory(faqs) {
  const grouped = faqs.reduce((acc, faq) => {
    const category = faq.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(faq)
    return acc
  }, {})

  return Object.entries(grouped)
    .map(([category, items]) => ({
      category,
      faqs: items,
      count: items.length
    }))
    .sort((a, b) => a.category.localeCompare(b.category))
}

/**
 * Get FAQ statistics
 */
export function getFAQStats(faqs) {
  const categories = new Set(faqs.map((faq) => faq.category))
  const totalQuestions = faqs.length
  const avgQuestionsPerCategory = totalQuestions / (categories.size || 1)

  return {
    totalQuestions,
    totalCategories: categories.size,
    avgQuestionsPerCategory: Math.round(avgQuestionsPerCategory)
  }
}

/**
 * Get popular FAQs (sorted by helpful count)
 */
export function getPopularFAQs(faqs, limit = 5) {
  return [...faqs]
    .sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0))
    .slice(0, limit)
}

/**
 * Get recent FAQs (sorted by creation date)
 */
export function getRecentFAQs(faqs, limit = 5) {
  return [...faqs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit)
}