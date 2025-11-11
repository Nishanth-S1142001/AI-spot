import { BaseIntegration } from '../BaseIntegration'

/**
 * MSG91 Integration
 * Supports SMS, WhatsApp, OTP, and Voice
 */

export default class Msg91Integration extends BaseIntegration {
  constructor() {
    super()
    this.baseUrl = 'https://api.msg91.com/api/v5'
    this.rateLimit = {
      maxRequests: 150,
      windowMs: 60000,
      requests: []
    }
  }

  async testConnection(credentials) {
    try {
      this.initialize(credentials)
      // Test with balance check
      const balance = await this.getBalance()
      return {
        success: true,
        message: 'Connection successful',
        balance: balance.data
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  getAuthHeaders() {
    if (!this.credentials) {
      throw new Error('Credentials not initialized')
    }

    return {
      authkey: this.credentials.authKey,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Send SMS
   */
  async sendSMS(params) {
    this.validateRequiredFields(params, ['to', 'message'])

    const {
      to, // Can be array or string
      message,
      senderId = this.credentials.senderId,
      route = 'transactional',
      unicode = false
    } = params

    const recipients = Array.isArray(to) ? to : [to]

    const payload = {
      sender: senderId,
      route: route,
      country: '91',
      sms: recipients.map((number) => ({
        message: message,
        to: [number.replace(/\D/g, '')] // Remove non-digits
      })),
      unicode: unicode ? 1 : 0
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: '/flow',
      body: payload
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Send OTP
   */
  async sendOTP(params) {
    this.validateRequiredFields(params, ['mobile', 'templateId'])

    const {
      mobile,
      templateId,
      otp,
      otpLength = 6,
      otpExpiry = 5 // minutes
    } = params

    const payload = {
      template_id: templateId,
      mobile: mobile.replace(/\D/g, ''),
      authkey: this.credentials.authKey
    }

    // If OTP is provided, include it. Otherwise MSG91 will generate
    if (otp) {
      payload.otp = otp
    } else {
      payload.otp_length = otpLength
      payload.otp_expiry = otpExpiry
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: '/otp',
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Verify OTP
   */
  async verifyOTP(params) {
    this.validateRequiredFields(params, ['mobile', 'otp'])

    const { mobile, otp } = params

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: '/otp/verify',
      body: {
        authkey: this.credentials.authKey,
        mobile: mobile.replace(/\D/g, ''),
        otp: otp
      }
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Resend OTP
   */
  async resendOTP(params) {
    this.validateRequiredFields(params, ['mobile'])

    const { mobile, retryType = 'voice' } = params

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: `/otp/retry`,
      params: {
        authkey: this.credentials.authKey,
        mobile: mobile.replace(/\D/g, ''),
        retrytype: retryType
      }
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(params) {
    this.validateRequiredFields(params, ['to', 'templateId'])

    const { to, templateId, variables = {} } = params

    const payload = {
      integrated_number: this.credentials.whatsappNumber,
      content_type: 'template',
      payload: {
        to: to.replace(/\D/g, ''),
        type: 'template',
        template: {
          name: templateId,
          language: {
            code: 'en',
            policy: 'deterministic'
          },
          components: this._buildWhatsAppComponents(variables)
        }
      }
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: '/whatsapp/whatsapp-outbound-message/',
      body: payload,
      headers: {
        authkey: this.credentials.authKey
      }
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Send WhatsApp media message
   */
  async sendWhatsAppMedia(params) {
    this.validateRequiredFields(params, ['to', 'type', 'url'])

    const { to, type, url, caption = '' } = params

    const payload = {
      integrated_number: this.credentials.whatsappNumber,
      content_type: 'media',
      payload: {
        to: to.replace(/\D/g, ''),
        type: type, // image, video, document, audio
        [type]: {
          link: url,
          caption: caption
        }
      }
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: '/whatsapp/whatsapp-outbound-message/',
      body: payload,
      headers: {
        authkey: this.credentials.authKey
      }
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Get balance
   */
  async getBalance() {
    const response = await this.makeRequest({
      method: 'GET',
      endpoint: '/balance',
      params: {
        authkey: this.credentials.authKey
      }
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Get SMS report
   */
  async getSMSReport(params) {
    const { requestId } = params

    const response = await this.makeRequest({
      method: 'GET',
      endpoint: `/report/${requestId}`,
      params: {
        authkey: this.credentials.authKey
      }
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Helper: Build WhatsApp template components
   */
  _buildWhatsAppComponents(variables) {
    const components = []

    // Header variables
    if (variables.header) {
      components.push({
        type: 'header',
        parameters: Object.values(variables.header).map((value) => ({
          type: 'text',
          text: value
        }))
      })
    }

    // Body variables
    if (variables.body) {
      components.push({
        type: 'body',
        parameters: Object.values(variables.body).map((value) => ({
          type: 'text',
          text: value
        }))
      })
    }

    // Button variables
    if (variables.buttons) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: 0,
        parameters: [
          {
            type: 'text',
            text: variables.buttons
          }
        ]
      })
    }

    return components
  }

  /**
   * Webhook handler for delivery reports
   */
  parseWebhookPayload(body, headers) {
    const payload = super.parseWebhookPayload(body, headers)

    return {
      eventType: payload.type || 'delivery_report',
      requestId: payload.request_id,
      mobile: payload.mobile,
      status: payload.status,
      deliveryTime: payload.delivery_time,
      errorCode: payload.error_code,
      errorMessage: payload.error_message,
      rawPayload: payload
    }
  }
}
