/**
 * Base Integration Class
 * All integrations should extend this class
 */

export class BaseIntegration {
  constructor(config = {}) {
    this.config = config
    this.credentials = null
    this.baseUrl = null
    this.rateLimit = {
      maxRequests: 100,
      windowMs: 60000, // 1 minute
      requests: []
    }
  }

  /**
   * Initialize integration with credentials
   */
  initialize(credentials) {
    this.credentials = credentials
    return this
  }

  /**
   * Test connection with provided credentials
   */
  async testConnection(credentials) {
    throw new Error('testConnection() must be implemented by subclass')
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(options) {
    const { method = 'GET', endpoint, headers = {}, body, params } = options

    // Check rate limit
    this.checkRateLimit()

    // Build URL
    let url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint
    if (params) {
      const queryString = new URLSearchParams(params).toString()
      url += `?${queryString}`
    }

    // Prepare request options
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...headers
      }
    }

    if (body && method !== 'GET') {
      requestOptions.body =
        typeof body === 'string' ? body : JSON.stringify(body)
    }

    try {
      const response = await fetch(url, requestOptions)

      // Track request for rate limiting
      this.trackRequest()

      // Handle response
      const contentType = response.headers.get('content-type')
      let data

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`
        )
      }

      return data
    } catch (error) {
      console.error('Integration request error:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Get authentication headers (override in subclass)
   */
  getAuthHeaders() {
    return {}
  }

  /**
   * Handle and transform errors
   */
  handleError(error) {
    if (error.message?.includes('rate limit')) {
      return new Error('Rate limit exceeded. Please try again later.')
    }

    if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
      return new Error('Authentication failed. Please check your credentials.')
    }

    if (error.message?.includes('404')) {
      return new Error('Resource not found.')
    }

    return error
  }

  /**
   * Check rate limiting
   */
  checkRateLimit() {
    const now = Date.now()
    const windowStart = now - this.rateLimit.windowMs

    // Remove old requests outside the window
    this.rateLimit.requests = this.rateLimit.requests.filter(
      (timestamp) => timestamp > windowStart
    )

    // Check if limit exceeded
    if (this.rateLimit.requests.length >= this.rateLimit.maxRequests) {
      throw new Error(
        `Rate limit exceeded: ${this.rateLimit.maxRequests} requests per ${this.rateLimit.windowMs / 1000} seconds`
      )
    }
  }

  /**
   * Track request for rate limiting
   */
  trackRequest() {
    this.rateLimit.requests.push(Date.now())
  }

  /**
   * Validate required fields
   */
  validateRequiredFields(data, requiredFields) {
    const missing = requiredFields.filter((field) => !data[field])

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }
  }

  /**
   * Format error response
   */
  formatErrorResponse(error) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Format success response
   */
  formatSuccessResponse(data) {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Retry failed requests with exponential backoff
   */
  async retryRequest(fn, maxRetries = 3, delay = 1000) {
    let lastError

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        if (i < maxRetries - 1) {
          await this.sleep(delay * Math.pow(2, i))
        }
      }
    }

    throw lastError
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Parse webhook payload
   */
  parseWebhookPayload(body, headers) {
    try {
      return typeof body === 'string' ? JSON.parse(body) : body
    } catch (error) {
      throw new Error('Invalid webhook payload')
    }
  }

  /**
   * Verify webhook signature (override in subclass if needed)
   */
  verifyWebhookSignature(payload, signature, secret) {
    throw new Error('verifyWebhookSignature() must be implemented by subclass')
  }
}
