export class IntegrationManager {
  constructor() {
    this.integrations = {
      razorpay: new RazorpayIntegration(),
      zoho: new ZohoIntegration(),
      shopify: new ShopifyIntegration(),
      stripe: new StripeIntegration(),
      sendgrid: new SendGridIntegration(),
      custom: new CustomAPIIntegration()
    }
  }

  /**
   * Execute an integration action
   * @param {string} type - Integration type (razorpay, zoho, etc.)
   * @param {string} action - Action to perform
   * @param {object} params - Action parameters
   * @returns {Promise<object>} Integration result
   */
  async execute(type, action, params) {
    const integration = this.integrations[type]
    
    if (!integration) {
      throw new Error(`Unknown integration type: ${type}`)
    }

    if (!integration[action]) {
      throw new Error(`Unknown action '${action}' for integration '${type}'`)
    }

    return await integration[action](params)
  }

  /**
   * Get available actions for an integration
   * @param {string} type - Integration type
   * @returns {Array<string>} Available actions
   */
  getAvailableActions(type) {
    const integration = this.integrations[type]
    
    if (!integration) {
      return []
    }

    return Object.getOwnPropertyNames(Object.getPrototypeOf(integration))
      .filter(prop => prop !== 'constructor' && typeof integration[prop] === 'function')
  }
}


// ============================================
// RAZORPAY INTEGRATION
// ============================================

class RazorpayIntegration {
  constructor() {
    this.apiKey = process.env.RAZORPAY_KEY_ID
    this.apiSecret = process.env.RAZORPAY_KEY_SECRET
    this.baseUrl = 'https://api.razorpay.com/v1'
  }

  /**
   * Create a payment order
   */
  async createOrder(params) {
    const { amount, currency = 'INR', receipt, notes } = params

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency,
        receipt,
        notes
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Razorpay error: ${error.error.description}`)
    }

    return await response.json()
  }

  /**
   * Capture a payment
   */
  async capturePayment(params) {
    const { paymentId, amount, currency = 'INR' } = params

    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Razorpay error: ${error.error.description}`)
    }

    return await response.json()
  }

  /**
   * Create a refund
   */
  async createRefund(params) {
    const { paymentId, amount, notes } = params

    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: amount ? amount * 100 : undefined,
        notes
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Razorpay error: ${error.error.description}`)
    }

    return await response.json()
  }

  /**
   * Get payment details
   */
  async getPayment(params) {
    const { paymentId } = params

    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Razorpay error: ${error.error.description}`)
    }

    return await response.json()
  }
}


// ============================================
// ZOHO INTEGRATION
// ============================================

class ZohoIntegration {
  constructor() {
    this.accessToken = process.env.ZOHO_ACCESS_TOKEN
    this.orgId = process.env.ZOHO_ORG_ID
    this.crmBaseUrl = 'https://www.zohoapis.com/crm/v2'
  }

  /**
   * Create a lead in Zoho CRM
   */
  async createLead(params) {
    const { firstName, lastName, email, company, phone, notes } = params

    const response = await fetch(`${this.crmBaseUrl}/Leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Zoho-oauthtoken ${this.accessToken}`
      },
      body: JSON.stringify({
        data: [{
          First_Name: firstName,
          Last_Name: lastName,
          Email: email,
          Company: company,
          Phone: phone,
          Description: notes
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Zoho error: ${JSON.stringify(error)}`)
    }

    return await response.json()
  }

  /**
   * Create a contact in Zoho CRM
   */
  async createContact(params) {
    const { firstName, lastName, email, phone, accountId } = params

    const response = await fetch(`${this.crmBaseUrl}/Contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Zoho-oauthtoken ${this.accessToken}`
      },
      body: JSON.stringify({
        data: [{
          First_Name: firstName,
          Last_Name: lastName,
          Email: email,
          Phone: phone,
          Account_Name: accountId
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Zoho error: ${JSON.stringify(error)}`)
    }

    return await response.json()
  }

  /**
   * Send email via Zoho Mail
   */
  async sendEmail(params) {
    const { to, subject, body, fromAddress } = params

    const response = await fetch('https://mail.zoho.com/api/accounts/{accountId}/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Zoho-oauthtoken ${this.accessToken}`
      },
      body: JSON.stringify({
        fromAddress,
        toAddress: to,
        subject,
        content: body
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Zoho error: ${JSON.stringify(error)}`)
    }

    return await response.json()
  }

  /**
   * Get record from Zoho CRM
   */
  async getRecord(params) {
    const { module, recordId } = params

    const response = await fetch(`${this.crmBaseUrl}/${module}/${recordId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.accessToken}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Zoho error: ${JSON.stringify(error)}`)
    }

    return await response.json()
  }
}


// ============================================
// SHOPIFY INTEGRATION
// ============================================

class ShopifyIntegration {
  constructor() {
    this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN
    this.shopDomain = process.env.SHOPIFY_SHOP_DOMAIN
    this.baseUrl = `https://${this.shopDomain}/admin/api/2024-01`
  }

  /**
   * Get order details
   */
  async getOrder(params) {
    const { orderId } = params

    const response = await fetch(`${this.baseUrl}/orders/${orderId}.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': this.accessToken
      }
    })

    if (!response.ok) {
      throw new Error(`Shopify error: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Update order
   */
  async updateOrder(params) {
    const { orderId, updates } = params

    const response = await fetch(`${this.baseUrl}/orders/${orderId}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken
      },
      body: JSON.stringify({ order: updates })
    })

    if (!response.ok) {
      throw new Error(`Shopify error: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Get product details
   */
  async getProduct(params) {
    const { productId } = params

    const response = await fetch(`${this.baseUrl}/products/${productId}.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': this.accessToken
      }
    })

    if (!response.ok) {
      throw new Error(`Shopify error: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Update inventory
   */
  async updateInventory(params) {
    const { inventoryItemId, locationId, available } = params

    const response = await fetch(`${this.baseUrl}/inventory_levels/set.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken
      },
      body: JSON.stringify({
        inventory_item_id: inventoryItemId,
        location_id: locationId,
        available
      })
    })

    if (!response.ok) {
      throw new Error(`Shopify error: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Create customer
   */
  async createCustomer(params) {
    const { email, firstName, lastName, phone } = params

    const response = await fetch(`${this.baseUrl}/customers.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken
      },
      body: JSON.stringify({
        customer: {
          email,
          first_name: firstName,
          last_name: lastName,
          phone
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Shopify error: ${response.statusText}`)
    }

    return await response.json()
  }
}


// ============================================
// STRIPE INTEGRATION
// ============================================

class StripeIntegration {
  constructor() {
    this.apiKey = process.env.STRIPE_SECRET_KEY
    this.baseUrl = 'https://api.stripe.com/v1'
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(params) {
    const { amount, currency = 'usd', customerId, description } = params

    const body = new URLSearchParams({
      amount: Math.round(amount * 100),
      currency,
      ...(customerId && { customer: customerId }),
      ...(description && { description })
    })

    const response = await fetch(`${this.baseUrl}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Stripe error: ${error.error.message}`)
    }

    return await response.json()
  }

  /**
   * Create a customer
   */
  async createCustomer(params) {
    const { email, name, phone } = params

    const body = new URLSearchParams({
      email,
      ...(name && { name }),
      ...(phone && { phone })
    })

    const response = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Stripe error: ${error.error.message}`)
    }

    return await response.json()
  }

  /**
   * Create a refund
   */
  async createRefund(params) {
    const { paymentIntentId, amount, reason } = params

    const body = new URLSearchParams({
      payment_intent: paymentIntentId,
      ...(amount && { amount: Math.round(amount * 100) }),
      ...(reason && { reason })
    })

    const response = await fetch(`${this.baseUrl}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Stripe error: ${error.error.message}`)
    }

    return await response.json()
  }

  /**
   * Get payment intent
   */
  async getPaymentIntent(params) {
    const { paymentIntentId } = params

    const response = await fetch(`${this.baseUrl}/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Stripe error: ${error.error.message}`)
    }

    return await response.json()
  }
}


// ============================================
// SENDGRID INTEGRATION
// ============================================

class SendGridIntegration {
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY
    this.baseUrl = 'https://api.sendgrid.com/v3'
  }

  /**
   * Send email
   */
  async sendEmail(params) {
    const { to, from, subject, text, html } = params

    const response = await fetch(`${this.baseUrl}/mail/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        personalizations: [{
          to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }]
        }],
        from: { email: from },
        subject,
        content: [
          ...(text ? [{ type: 'text/plain', value: text }] : []),
          ...(html ? [{ type: 'text/html', value: html }] : [])
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`SendGrid error: ${error}`)
    }

    return { success: true, messageId: response.headers.get('x-message-id') }
  }

  /**
   * Send template email
   */
  async sendTemplateEmail(params) {
    const { to, from, templateId, dynamicData } = params

    const response = await fetch(`${this.baseUrl}/mail/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        personalizations: [{
          to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
          dynamic_template_data: dynamicData
        }],
        from: { email: from },
        template_id: templateId
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`SendGrid error: ${error}`)
    }

    return { success: true, messageId: response.headers.get('x-message-id') }
  }
}


// ============================================
// CUSTOM API INTEGRATION
// ============================================

class CustomAPIIntegration {
  /**
   * Make a custom API call
   */
  async makeRequest(params) {
    const { method = 'GET', url, headers = {}, body, auth } = params

    const requestHeaders = { ...headers }

    // Add auth if provided
    if (auth?.type === 'bearer') {
      requestHeaders['Authorization'] = `Bearer ${auth.token}`
    } else if (auth?.type === 'basic') {
      const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString('base64')
      requestHeaders['Authorization'] = `Basic ${encoded}`
    } else if (auth?.type === 'apikey') {
      requestHeaders[auth.headerName || 'X-API-Key'] = auth.apiKey
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined
    })

    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      return await response.json()
    } else {
      return await response.text()
    }
  }
}