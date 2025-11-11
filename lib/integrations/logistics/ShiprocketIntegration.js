import { BaseIntegration } from '../BaseIntegration'

/**
 * Shiprocket Integration
 * Shipping and logistics platform for India
 */

export default class ShiprocketIntegration extends BaseIntegration {
  constructor() {
    super()
    this.baseUrl = 'https://apiv2.shiprocket.in/v1/external'
    this.token = null
    this.tokenExpiry = null
  }

  async testConnection(credentials) {
    try {
      this.initialize(credentials)
      await this.authenticate()
      return { success: true, message: 'Connection successful' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  /**
   * Authenticate and get token
   */
  async authenticate() {
    // Check if token is still valid
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token
    }

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: this.credentials.email,
        password: this.credentials.password
      })
    })

    if (!response.ok) {
      throw new Error('Authentication failed')
    }

    const data = await response.json()
    this.token = data.token
    // Token typically expires in 10 days, set expiry to 9 days to be safe
    this.tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000

    return this.token
  }

  async getAuthHeaders() {
    await this.authenticate()
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`
    }
  }

  /**
   * Create order
   */
  async createOrder(params) {
    this.validateRequiredFields(params, [
      'orderDate',
      'pickupLocation',
      'billingCustomerName',
      'billingAddress',
      'billingCity',
      'billingPincode',
      'billingState',
      'billingCountry',
      'billingPhone',
      'orderItems',
      'paymentMethod',
      'subTotal'
    ])

    const {
      orderId,
      orderDate,
      pickupLocation,
      channelId = '',
      comment = '',
      billingCustomerName,
      billingLastName = '',
      billingAddress,
      billingAddress2 = '',
      billingCity,
      billingPincode,
      billingState,
      billingCountry,
      billingEmail = '',
      billingPhone,
      shippingIsBilling = true,
      shippingCustomerName,
      shippingLastName = '',
      shippingAddress,
      shippingAddress2 = '',
      shippingCity,
      shippingPincode,
      shippingCountry,
      shippingState,
      shippingEmail = '',
      shippingPhone,
      orderItems,
      paymentMethod,
      subTotal,
      length = 10,
      breadth = 10,
      height = 10,
      weight = 0.5
    } = params

    const payload = {
      order_id: orderId || `ORDER_${Date.now()}`,
      order_date: orderDate,
      pickup_location: pickupLocation,
      channel_id: channelId,
      comment: comment,
      billing_customer_name: billingCustomerName,
      billing_last_name: billingLastName,
      billing_address: billingAddress,
      billing_address_2: billingAddress2,
      billing_city: billingCity,
      billing_pincode: billingPincode,
      billing_state: billingState,
      billing_country: billingCountry,
      billing_email: billingEmail,
      billing_phone: billingPhone,
      shipping_is_billing: shippingIsBilling,
      shipping_customer_name: shippingCustomerName || billingCustomerName,
      shipping_last_name: shippingLastName || billingLastName,
      shipping_address: shippingAddress || billingAddress,
      shipping_address_2: shippingAddress2 || billingAddress2,
      shipping_city: shippingCity || billingCity,
      shipping_pincode: shippingPincode || billingPincode,
      shipping_country: shippingCountry || billingCountry,
      shipping_state: shippingState || billingState,
      shipping_email: shippingEmail || billingEmail,
      shipping_phone: shippingPhone || billingPhone,
      order_items: orderItems,
      payment_method: paymentMethod,
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: subTotal,
      length: length,
      breadth: breadth,
      height: height,
      weight: weight
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: '/orders/create/adhoc',
      body: payload,
      headers: await this.getAuthHeaders()
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Track shipment
   */
  async trackShipment(params) {
    this.validateRequiredFields(params, ['shipmentId'])

    const { shipmentId } = params

    const response = await this.makeRequest({
      method: 'GET',
      endpoint: `/courier/track/shipment/${shipmentId}`,
      headers: await this.getAuthHeaders()
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
      endpoint: `/orders/show/${orderId}`,
      headers: await this.getAuthHeaders()
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Generate AWB (Air Waybill)
   */
  async generateAWB(params) {
    this.validateRequiredFields(params, ['shipmentId', 'courierId'])

    const { shipmentId, courierId } = params

    const payload = {
      shipment_id: shipmentId,
      courier_id: courierId
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: '/courier/assign/awb',
      body: payload,
      headers: await this.getAuthHeaders()
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Generate pickup
   */
  async generatePickup(params) {
    this.validateRequiredFields(params, ['shipmentId'])

    const { shipmentId } = params

    const payload = {
      shipment_id: [shipmentId]
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: '/courier/generate/pickup',
      body: payload,
      headers: await this.getAuthHeaders()
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Get courier serviceability
   */
  async checkServiceability(params) {
    this.validateRequiredFields(params, [
      'pickupPincode',
      'deliveryPincode',
      'cod'
    ])

    const { pickupPincode, deliveryPincode, cod, weight = 0.5 } = params

    const response = await this.makeRequest({
      method: 'GET',
      endpoint: '/courier/serviceability',
      params: {
        pickup_postcode: pickupPincode,
        delivery_postcode: deliveryPincode,
        cod: cod ? 1 : 0,
        weight: weight
      },
      headers: await this.getAuthHeaders()
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(params) {
    this.validateRequiredFields(params, ['orderId'])

    const { orderId } = params

    const payload = {
      ids: [orderId]
    }

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: '/orders/cancel',
      body: payload,
      headers: await this.getAuthHeaders()
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Get shipping label
   */
  async getShippingLabel(params) {
    this.validateRequiredFields(params, ['shipmentId'])

    const { shipmentId } = params

    const response = await this.makeRequest({
      method: 'POST',
      endpoint: '/courier/generate/label',
      body: {
        shipment_id: [shipmentId]
      },
      headers: await this.getAuthHeaders()
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance() {
    const response = await this.makeRequest({
      method: 'GET',
      endpoint: '/settings/company/wallet/balance',
      headers: await this.getAuthHeaders()
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Get pickup locations
   */
  async getPickupLocations() {
    const response = await this.makeRequest({
      method: 'GET',
      endpoint: '/settings/company/pickup',
      headers: await this.getAuthHeaders()
    })

    return this.formatSuccessResponse(response)
  }

  /**
   * Webhook handler for tracking updates
   */
  parseWebhookPayload(body, headers) {
    const payload = super.parseWebhookPayload(body, headers)

    return {
      eventType: 'tracking_update',
      orderId: payload.order_id,
      shipmentId: payload.shipment_id,
      awb: payload.awb,
      status: payload.current_status,
      currentStatusId: payload.current_status_id,
      currentStatusType: payload.current_status_type,
      currentStatusBody: payload.current_status_body,
      courierName: payload.courier_name,
      deliveryDate: payload.delivered_date,
      timestamp: payload.scan_datetime,
      rawPayload: payload
    }
  }
}
