import { BaseIntegration } from '../BaseIntegration'

/**
 * WhatsApp Official Integration (Meta Cloud API)
 * Requires Business Account approval
 */

export default class WhatsAppOfficialIntegration extends BaseIntegration {
  constructor() {
    super()
    this.baseUrl = 'https://graph.facebook.com/v18.0'
    this.rateLimit = {
      maxRequests: 80,
      windowMs: 60000,
      requests: []
    }
  }

  async testConnection(credentials) {
    try {
      this.initialize(credentials)
      // Test with phone number ID lookup
      await this.getPhoneNumberInfo()
      return { success: true, message: 'Connection successful' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  getAuthHeaders() {
    if (!this.credentials) {
      throw new Error('Credentials not initialized')
    }

    return {
      Authorization: `Bearer ${this.credentials.accessToken}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Send text message
   */
  async sendTextMessage(params) {
    this.validateRequiredFields(params, ['to', 'text'])

    const { to, text, previewUrl = false } = params

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\D/g, ''),
      type: 'text',
      text: {
        preview_url: previewUrl,
        body: text
      }
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: `/${this.credentials.phoneNumberId}/messages`,
      body: payload
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Send template message
   */
  async sendTemplateMessage(params) {
    this.validateRequiredFields(params, ['to', 'templateName', 'language'])

    const { to, templateName, language = 'en', components = [] } = params

    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language
        },
        components: components
      }
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: `/${this.credentials.phoneNumberId}/messages`,
      body: payload
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Send media message (image, video, document, audio)
   */
  async sendMediaMessage(params) {
    this.validateRequiredFields(params, ['to', 'type', 'mediaUrl'])

    const { to, type, mediaUrl, caption = '' } = params

    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: type, // image, video, document, audio
      [type]: {
        link: mediaUrl,
        caption: caption || undefined
      }
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: `/${this.credentials.phoneNumberId}/messages`,
      body: payload
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Send interactive message (buttons, lists)
   */
  async sendInteractiveMessage(params) {
    this.validateRequiredFields(params, ['to', 'interactiveType', 'body'])

    const { to, interactiveType, header, body, footer, buttons = [], sections = [] } = params

    const interactive = {
      type: interactiveType, // button, list
      body: { text: body }
    }

    if (header) {
      interactive.header = {
        type: 'text',
        text: header
      }
    }

    if (footer) {
      interactive.footer = { text: footer }
    }

    if (interactiveType === 'button') {
      interactive.action = {
        buttons: buttons.map((btn, idx) => ({
          type: 'reply',
          reply: {
            id: btn.id || `btn_${idx}`,
            title: btn.title
          }
        }))
      }
    } else if (interactiveType === 'list') {
      interactive.action = {
        button: buttons[0]?.title || 'Select',
        sections: sections
      }
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'interactive',
      interactive: interactive
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: `/${this.credentials.phoneNumberId}/messages`,
      body: payload
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Send location message
   */
  async sendLocation(params) {
    this.validateRequiredFields(params, ['to', 'latitude', 'longitude'])

    const { to, latitude, longitude, name = '', address = '' } = params

    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'location',
      location: {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        name: name,
        address: address
      }
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: `/${this.credentials.phoneNumberId}/messages`,
      body: payload
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Mark message as read
   */
  async markAsRead(params) {
    this.validateRequiredFields(params, ['messageId'])

    const { messageId } = params

    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: `/${this.credentials.phoneNumberId}/messages`,
      body: payload
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Get phone number info
   */
  async getPhoneNumberInfo() {
    const response = await this.makeRequest({
      method: 'GET',
      endpoint: `/${this.credentials.phoneNumberId}`
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Get message template
   */
  async getMessageTemplates() {
    const response = await this.makeRequest({
      method: 'GET',
      endpoint: `/${this.credentials.businessAccountId}/message_templates`
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Create message template
   */
  async createMessageTemplate(params) {
    this.validateRequiredFields(params, ['name', 'category', 'language', 'components'])

    const { name, category, language = 'en', components } = params

    const payload = {
      name: name,
      category: category, // MARKETING, UTILITY, AUTHENTICATION
      language: language,
      components: components
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: `/${this.credentials.businessAccountId}/message_templates`,
      body: payload
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Get media URL
   */
  async getMediaUrl(params) {
    this.validateRequiredFields(params, ['mediaId'])

    const { mediaId } = params

    const response = await this.makeRequest({
      method: 'GET',
      endpoint: `/${mediaId}`
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Parse webhook event
   */
  parseWebhookPayload(body, headers) {
    const payload = super.parseWebhookPayload(body, headers)

    if (!payload.entry?.[0]?.changes?.[0]?.value) {
      return null
    }

    const value = payload.entry[0].changes[0].value

    // Handle different webhook types
    if (value.messages) {
      const message = value.messages[0]
      return {
        eventType: 'message_received',
        messageId: message.id,
        from: message.from,
        timestamp: message.timestamp,
        type: message.type,
        text: message.text?.body,
        mediaId: message.image?.id || message.video?.id || message.document?.id,
        location: message.location,
        interactive: message.interactive,
        rawPayload: payload
      }
    }

    if (value.statuses) {
      const status = value.statuses[0]
      return {
        eventType: 'message_status',
        messageId: status.id,
        status: status.status, // sent, delivered, read, failed
        timestamp: status.timestamp,
        recipientId: status.recipient_id,
        errors: status.errors,
        rawPayload: payload
      }
    }

    return { eventType: 'unknown', rawPayload: payload }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature, secret) {
    const crypto = require('crypto')
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')

    return `sha256=${expectedSignature}` === signature
  }
}
