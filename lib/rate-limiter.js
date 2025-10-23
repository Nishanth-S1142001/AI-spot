const rateLimitStore = new Map()

export function checkRateLimit(key, limit = 100, windowMs = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, [])
  }

  const requests = rateLimitStore.get(key)
  const validRequests = requests.filter((timestamp) => timestamp > windowStart)

  if (validRequests.length >= limit) {
    return { allowed: false, remaining: 0 }
  }

  validRequests.push(now)
  rateLimitStore.set(key, validRequests)

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitStore.entries()) {
      const cleaned = v.filter((timestamp) => timestamp > windowStart)
      if (cleaned.length === 0) {
        rateLimitStore.delete(k)
      } else {
        rateLimitStore.set(k, cleaned)
      }
    }
  }

  return { allowed: true, remaining: limit - validRequests.length }
}

class RateLimiter {
  constructor() {
    // Store: Map<key, { count, resetAt }>
    this.store = new Map()

    // Cleanup interval (every 60 seconds)
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  /**
   * Check if request is allowed
   * @param {string} key - Unique key (e.g., userId, IP)
   * @param {number} maxRequests - Max requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {object} { allowed: boolean, remaining: number, resetAt: Date }
   */
  check(key, maxRequests = 60, windowMs = 60000) {
    const now = Date.now()
    const record = this.store.get(key)

    // No existing record or expired window
    if (!record || now >= record.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + windowMs
      })

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt: new Date(now + windowMs)
      }
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(record.resetAt)
      }
    }

    // Increment count
    record.count++
    this.store.set(key, record)

    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetAt: new Date(record.resetAt)
    }
  }

  /**
   * Reset rate limit for a key
   * @param {string} key - Key to reset
   */
  reset(key) {
    this.store.delete(key)
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now()

    for (const [key, record] of this.store.entries()) {
      if (now >= record.resetAt) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Get current stats for a key
   * @param {string} key - Key to check
   * @returns {object|null} Current rate limit stats
   */
  getStats(key) {
    const record = this.store.get(key)

    if (!record) {
      return null
    }

    return {
      count: record.count,
      resetAt: new Date(record.resetAt),
      isExpired: Date.now() >= record.resetAt
    }
  }

  /**
   * Destroy rate limiter and cleanup
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.clear()
  }
}

// Singleton instance
let rateLimiterInstance = null

/**
 * Get rate limiter instance
 * @returns {RateLimiter}
 */
export function getRateLimiter() {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter()
  }
  return rateLimiterInstance
}

/**
 * Rate limit middleware factory
 * @param {number} maxRequests - Max requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Express-like middleware
 */
export function createRateLimitMiddleware(maxRequests = 60, windowMs = 60000) {
  const limiter = getRateLimiter()

  return async (req) => {
    // Use IP or user ID as key
    const key =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'anonymous'

    const result = limiter.check(key, maxRequests, windowMs)

    if (!result.allowed) {
      return {
        allowed: false,
        error: 'Rate limit exceeded',
        resetAt: result.resetAt,
        retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)
      }
    }

    return {
      allowed: true,
      remaining: result.remaining,
      resetAt: result.resetAt
    }
  }
}

// Export both class and instance getter
export { RateLimiter }
