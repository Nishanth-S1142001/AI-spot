import { BaseIntegration } from '../BaseIntegration'
import crypto from 'crypto'

/**
 * Cashfree Payment Integration
 * Supports UPI, Cards, Netbanking, Wallets
 */

export default class CashfreeIntegration extends BaseIntegration {
  constructor() {
    super()
    this.baseUrl = 'https://api.cashfree.com/pg'
    this.sandboxUrl = 'https://sandbox.cashfree.com/pg'
    this.rateLimit = {
      maxRequests: 100,
      windowMs: 60000,
      requests: []
    }
  }

  async testConnection(credentials) {
    try {
      this.initialize(credentials)
      // Test with a simple API call
      await this.getOrderDetails({ orderId: 'test' })
      return { success: true, message: 'Connection successful' }
    } catch (error) {
      if (error.message.includes('404')) {
        // 404 means auth worked, order just doesn't exist
        return { success: true, message: 'Connection successful' }
      }
      return { success: false, message: error.message }
    }
  }

  getAuthHeaders() {
    if (!this.credentials) {
      throw new Error('Credentials not initialized')
    }

    const { appId, secretKey, environment = 'sandbox' } = this.credentials

    // Set base URL based on environment
    this.baseUrl =
      environment === 'production' ? this.baseUrl : this.sandboxUrl

    return {
      'x-client-id': appId,
      'x-client-secret': secretKey,
      'x-api-version': '2023-08-01'
    }
  }

  /**
   * Create a payment order
   */
  async createOrder(params) {
    this.validateRequiredFields(params, [
      'orderId',
      'orderAmount',
      'customerPhone'
    ])

    const {
      orderId,
      orderAmount,
      orderCurrency = 'INR',
      customerName = '',
      customerEmail = '',
      customerPhone,
      returnUrl,
      notifyUrl,
      orderNote = ''
    } = params

    const payload = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: orderCurrency,
      customer_details: {
        customer_id: customerPhone,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl,
        payment_methods: 'upi,cc,dc,nb,wallet'
      },
      order_note: orderNote
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: '/orders',
      body: payload
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Get order details
   */
  async getOrderDetails(params) {
    this.validateRequiredFields(params, ['orderId'])

    const { orderId } = params

    const response = await this.makeRequest({
      method: 'GET',
      endpoint: `/orders/${orderId}`
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(params) {
    this.validateRequiredFields(params, ['orderId', 'cfPaymentId'])

    const { orderId, cfPaymentId } = params

    const response = await this.makeRequest({
      method: 'GET',
      endpoint: `/orders/${orderId}/payments/${cfPaymentId}`
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Create refund
   */
  async createRefund(params) {
    this.validateRequiredFields(params, ['orderId', 'refundAmount'])

    const { orderId, refundAmount, refundId, refundNote = '' } = params

    const payload = {
      refund_amount: refundAmount,
      refund_id: refundId || `refund_${Date.now()}`,
      refund_note: refundNote
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: `/orders/${orderId}/refunds`,
      body: payload
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Get refund details
   */
  async getRefundDetails(params) {
    this.validateRequiredFields(params, ['orderId', 'refundId'])

    const { orderId, refundId } = params

    const response = await this.makeRequest({
      method: 'GET',
      endpoint: `/orders/${orderId}/refunds/${refundId}`
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Create settlement reconciliation
   */
  async getSettlements(params) {
    const { startDate, endDate } = params

    const queryParams = {}
    if (startDate) queryParams.start_date = startDate
    if (endDate) queryParams.end_date = endDate

    const response = await this.makeRequest({
      method: 'GET',
      endpoint: '/settlements',
      params: queryParams
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature, secret) {
    const timestamp = payload.event_time
    const orderId = payload.data?.order?.order_id || ''
    const orderAmount = payload.data?.order?.order_amount || ''

    const signatureData = `${orderId}${orderAmount}${timestamp}`
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureData)
      .digest('base64')

    return computedSignature === signature
  }

  /**
   * Parse webhook event
   */
  parseWebhookPayload(body, headers) {
    const payload = super.parseWebhookPayload(body, headers)

    return {
      eventType: payload.type,
      orderId: payload.data?.order?.order_id,
      orderAmount: payload.data?.order?.order_amount,
      orderStatus: payload.data?.order?.order_status,
      paymentStatus: payload.data?.payment?.payment_status,
      paymentMethod: payload.data?.payment?.payment_group,
      cfPaymentId: payload.data?.payment?.cf_payment_id,
      timestamp: payload.event_time,
      rawPayload: payload
    }
  }

  /**
   * Create UPI payment link
   */
  async createUPILink(params) {
    this.validateRequiredFields(params, [
      'orderId',
      'orderAmount',
      'customerPhone'
    ])

    const {
      orderId,
      orderAmount,
      customerName = '',
      customerEmail = '',
      customerPhone,
      linkPurpose = '',
      linkExpiry = 24 // hours
    } = params

    const expiryTime = new Date()
    expiryTime.setHours(expiryTime.getHours() + linkExpiry)

    const payload = {
      link_id: `link_${orderId}`,
      link_amount: orderAmount,
      link_currency: 'INR',
      link_purpose: linkPurpose || `Payment for order ${orderId}`,
      customer_details: {
        customer_phone: customerPhone,
        customer_email: customerEmail,
        customer_name: customerName
      },
      link_expiry_time: expiryTime.toISOString(),
      link_meta: {
        return_url: params.returnUrl,
        notify_url: params.notifyUrl
      }
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: '/links',
      body: payload
    })

    return this.formatSuccessResponse(response)
  }
}
