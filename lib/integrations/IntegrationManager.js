/**
 * Integration Manager - Centralized integration handler
 * Supports both Indian and Global integrations
 */

export class IntegrationManager {
  constructor() {
    this.integrations = new Map()
    this.initializeIntegrations()
  }

  initializeIntegrations() {
    // Payment Integrations
    this.register('razorpay', () => import('./payments/RazorpayIntegration'))
    this.register('cashfree', () => import('./payments/CashfreeIntegration'))
    this.register('paytm', () => import('./payments/PaytmIntegration'))
    this.register('stripe', () => import('./payments/StripeIntegration'))
    this.register('paypal', () => import('./payments/PaypalIntegration'))

    // Communication Integrations
    this.register('whatsapp_official', () => import('./communication/WhatsAppOfficialIntegration'))
    this.register('whatsapp_unofficial', () => import('./communication/WhatsAppUnofficialIntegration'))
    this.register('telegram', () => import('./communication/TelegramIntegration'))
    this.register('twilio', () => import('./communication/TwilioIntegration'))
    this.register('gupshup', () => import('./communication/GupshupIntegration'))
    this.register('msg91', () => import('./communication/Msg91Integration'))
    this.register('discord', () => import('./communication/DiscordIntegration'))
    this.register('slack', () => import('./communication/SlackIntegration'))

    // Email Integrations
    this.register('gmail', () => import('./email/GmailIntegration'))
    this.register('outlook', () => import('./email/OutlookIntegration'))
    this.register('sendgrid', () => import('./email/SendGridIntegration'))
    this.register('mailchimp', () => import('./email/MailchimpIntegration'))

    // Business Tools
    this.register('zoho_crm', () => import('./business/ZohoCRMIntegration'))
    this.register('zoho_books', () => import('./business/ZohoBooksIntegration'))
    this.register('freshdesk', () => import('./business/FreshdeskIntegration'))
    this.register('notion', () => import('./business/NotionIntegration'))
    this.register('airtable', () => import('./business/AirtableIntegration'))
    this.register('google_sheets', () => import('./business/GoogleSheetsIntegration'))

    // Ecommerce
    this.register('shopify', () => import('./ecommerce/ShopifyIntegration'))
    this.register('woocommerce', () => import('./ecommerce/WooCommerceIntegration'))

    // Logistics (India)
    this.register('shiprocket', () => import('./logistics/ShiprocketIntegration'))
    this.register('delhivery', () => import('./logistics/DelhiveryIntegration'))

    // AI Services
    this.register('openai', () => import('./ai/OpenAIIntegration'))
    this.register('anthropic', () => import('./ai/AnthropicIntegration'))
    this.register('google_gemini', () => import('./ai/GeminiIntegration'))

    // Custom API
    this.register('custom_api', () => import('./custom/CustomAPIIntegration'))
  }

  register(type, loader) {
    this.integrations.set(type, { loader, instance: null })
  }

  async getIntegration(type) {
    const integration = this.integrations.get(type)
    if (!integration) {
      throw new Error(`Unknown integration type: ${type}`)
    }

    // Lazy load the integration class
    if (!integration.instance) {
      const module = await integration.loader()
      integration.instance = new module.default()
    }

    return integration.instance
  }

  async execute(type, action, params) {
    const integration = await this.getIntegration(type)

    if (!integration[action]) {
      throw new Error(`Unknown action '${action}' for integration '${type}'`)
    }

    return await integration[action](params)
  }

  async testConnection(type, credentials) {
    const integration = await this.getIntegration(type)
    
    if (integration.testConnection) {
      return await integration.testConnection(credentials)
    }

    throw new Error(`Integration '${type}' does not support connection testing`)
  }

  getAvailableActions(type) {
    const integration = this.integrations.get(type)
    if (!integration?.instance) return []

    return Object.getOwnPropertyNames(
      Object.getPrototypeOf(integration.instance)
    ).filter(
      (prop) =>
        prop !== 'constructor' &&
        typeof integration.instance[prop] === 'function' &&
        !prop.startsWith('_')
    )
  }

  getAvailableIntegrations() {
    return Array.from(this.integrations.keys()).map((type) => ({
      type,
      category: this.getIntegrationCategory(type),
      displayName: this.getDisplayName(type)
    }))
  }

  getIntegrationCategory(type) {
    const categories = {
      payment: ['razorpay', 'cashfree', 'paytm', 'stripe', 'paypal'],
      communication: [
        'whatsapp_official',
        'whatsapp_unofficial',
        'telegram',
        'twilio',
        'gupshup',
        'msg91',
        'discord',
        'slack'
      ],
      email: ['gmail', 'outlook', 'sendgrid', 'mailchimp'],
      business: [
        'zoho_crm',
        'zoho_books',
        'freshdesk',
        'notion',
        'airtable',
        'google_sheets'
      ],
      ecommerce: ['shopify', 'woocommerce'],
      logistics: ['shiprocket', 'delhivery'],
      ai: ['openai', 'anthropic', 'google_gemini'],
      custom: ['custom_api']
    }

    for (const [category, types] of Object.entries(categories)) {
      if (types.includes(type)) return category
    }

    return 'other'
  }

  getDisplayName(type) {
    const names = {
      razorpay: 'Razorpay',
      cashfree: 'Cashfree',
      paytm: 'Paytm',
      stripe: 'Stripe',
      paypal: 'PayPal',
      whatsapp_official: 'WhatsApp (Official)',
      whatsapp_unofficial: 'WhatsApp (Unofficial)',
      telegram: 'Telegram',
      twilio: 'Twilio',
      gupshup: 'Gupshup',
      msg91: 'MSG91',
      discord: 'Discord',
      slack: 'Slack',
      gmail: 'Gmail',
      outlook: 'Outlook',
      sendgrid: 'SendGrid',
      mailchimp: 'Mailchimp',
      zoho_crm: 'Zoho CRM',
      zoho_books: 'Zoho Books',
      freshdesk: 'Freshdesk',
      notion: 'Notion',
      airtable: 'Airtable',
      google_sheets: 'Google Sheets',
      shopify: 'Shopify',
      woocommerce: 'WooCommerce',
      shiprocket: 'Shiprocket',
      delhivery: 'Delhivery',
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google_gemini: 'Google Gemini',
      custom_api: 'Custom API'
    }

    return names[type] || type
  }
}

// Singleton instance
let integrationManager = null

export function getIntegrationManager() {
  if (!integrationManager) {
    integrationManager = new IntegrationManager()
  }
  return integrationManager
}
