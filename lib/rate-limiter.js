// ============================================================================
// OPTIMIZED RATE LIMITER
// ============================================================================
// Features:
// - Single, clean implementation
// - Memory efficient with automatic cleanup
// - Redis-ready structure for production scaling
// - Token bucket algorithm for smooth rate limiting
// ============================================================================

class RateLimiter {
  constructor(options = {}) {
    // Configuration
    this.defaultMaxRequests = options.defaultMaxRequests || 60
    this.defaultWindowMs = options.defaultWindowMs || 60000
    this.cleanupIntervalMs = options.cleanupIntervalMs || 60000
    
    // In-memory store: Map<key, { count, resetAt, timestamps }>
    // For production, replace with Redis
    this.store = new Map()
    
    // Start cleanup interval
    this.startCleanup()
  }

  /**
   * Check if request is allowed using token bucket algorithm
   * @param {string} key - Unique identifier (userId, IP, etc.)
   * @param {number} maxRequests - Max requests allowed (optional)
   * @param {number} windowMs - Time window in ms (optional)
   * @returns {Promise<object>} { allowed, remaining, resetAt, retryAfter }
   */
  async check(key, maxRequests, windowMs) {
    const limit = maxRequests || this.defaultMaxRequests
    const window = windowMs || this.defaultWindowMs
    const now = Date.now()
    
    let record = this.store.get(key)
    
    // Initialize or reset expired window
    if (!record || now >= record.resetAt) {
      record = {
        count: 0,
        resetAt: now + window,
        timestamps: []
      }
      this.store.set(key, record)
    }
    
    // Clean old timestamps (sliding window)
    record.timestamps = record.timestamps.filter(
      timestamp => timestamp > now - window
    )
    
    // Check if limit exceeded
    if (record.timestamps.length >= limit) {
      const oldestTimestamp = record.timestamps[0]
      const retryAfter = Math.ceil((oldestTimestamp + window - now) / 1000)
      
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(record.resetAt),
        retryAfter,
        limit
      }
    }
    
    // Allow request
    record.timestamps.push(now)
    record.count++
    this.store.set(key, record)
    
    return {
      allowed: true,
      remaining: limit - record.timestamps.length,
      resetAt: new Date(record.resetAt),
      retryAfter: 0,
      limit
    }
  }

  /**
   * Reset rate limit for a specific key
   * @param {string} key - Key to reset
   * @returns {boolean} Success status
   */
  reset(key) {
    return this.store.delete(key)
  }

  /**
   * Reset all rate limits
   */
  resetAll() {
    this.store.clear()
  }

  /**
   * Get current stats for a key
   * @param {string} key - Key to check
   * @returns {object|null} Current stats or null
   */
  getStats(key) {
    const record = this.store.get(key)
    
    if (!record) {
      return null
    }
    
    const now = Date.now()
    const isExpired = now >= record.resetAt
    
    return {
      count: record.count,
      remaining: this.defaultMaxRequests - record.timestamps.length,
      resetAt: new Date(record.resetAt),
      isExpired,
      window: this.defaultWindowMs
    }
  }

  /**
   * Get all active keys (for monitoring)
   * @returns {Array} Array of active keys
   */
  getActiveKeys() {
    return Array.from(this.store.keys())
  }

  /**
   * Get store size (for monitoring)
   * @returns {number} Number of tracked keys
   */
  getStoreSize() {
    return this.store.size
  }

  /**
   * Cleanup expired entries
   * @private
   */
  cleanup() {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, record] of this.store.entries()) {
      if (now >= record.resetAt) {
        this.store.delete(key)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.log(`[RateLimiter] Cleaned ${cleaned} expired entries. Store size: ${this.store.size}`)
    }
  }

  /**
   * Start automatic cleanup interval
   * @private
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, this.cleanupIntervalMs)
    
    // Prevent interval from keeping process alive
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Stop cleanup and destroy instance
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================
let globalRateLimiter = null

/**
 * Get or create singleton rate limiter instance
 * @param {object} options - Configuration options
 * @returns {RateLimiter}
 */
export function getRateLimiter(options) {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter(options)
  }
  return globalRateLimiter
}

/**
 * Reset singleton instance (for testing)
 */
export function resetRateLimiterInstance() {
  if (globalRateLimiter) {
    globalRateLimiter.destroy()
    globalRateLimiter = null
  }
}

// ============================================================================
// MIDDLEWARE FACTORY
// ============================================================================

/**
 * Create rate limit middleware for Next.js API routes
 * @param {object} options - Configuration
 * @returns {Function} Middleware function
 */
export function createRateLimitMiddleware(options = {}) {
  const {
    maxRequests = 60,
    windowMs = 60000,
    keyGenerator = defaultKeyGenerator,
    onRateLimitExceeded = defaultRateLimitHandler,
    skip = () => false
  } = options
  
  const limiter = getRateLimiter()
  
  return async (req) => {
    // Allow skipping rate limit for certain requests
    if (skip(req)) {
      return { allowed: true, skipped: true }
    }
    
    // Generate unique key for this request
    const key = keyGenerator(req)
    
    // Check rate limit
    const result = await limiter.check(key, maxRequests, windowMs)
    
    // Set rate limit headers
    const headers = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetAt.toISOString()
    }
    
    if (!result.allowed) {
      headers['Retry-After'] = result.retryAfter.toString()
      return {
        allowed: false,
        headers,
        error: onRateLimitExceeded(result)
      }
    }
    
    return {
      allowed: true,
      headers
    }
  }
}

/**
 * Default key generator - uses IP address
 * @param {Request} req - Next.js request object
 * @returns {string} Unique key
 */
function defaultKeyGenerator(req) {
  // Try multiple headers for IP
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const cfConnectingIp = req.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0].trim() || 
             realIp || 
             cfConnectingIp || 
             'unknown'
  
  return `ip:${ip}`
}

/**
 * Default rate limit exceeded handler
 * @param {object} result - Rate limit result
 * @returns {object} Error response
 */
function defaultRateLimitHandler(result) {
  return {
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
    retryAfter: result.retryAfter,
    limit: result.limit,
    resetAt: result.resetAt
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create key generator that combines multiple identifiers
 * @param {Function[]} generators - Array of key generator functions
 * @returns {Function} Combined key generator
 */
export function combineKeyGenerators(...generators) {
  return (req) => {
    const keys = generators.map(gen => gen(req))
    return keys.join(':')
  }
}

/**
 * User ID based key generator
 * @param {Request} req - Request object
 * @returns {string} User-based key
 */
export function userKeyGenerator(req) {
  // Assuming user ID is in a custom header or parsed from auth
  const userId = req.headers.get('x-user-id') || 
                 req.user?.id || 
                 'anonymous'
  return `user:${userId}`
}

/**
 * Endpoint-based key generator
 * @param {Request} req - Request object
 * @returns {string} Endpoint-based key
 */
export function endpointKeyGenerator(req) {
  const url = new URL(req.url)
  return `endpoint:${url.pathname}`
}

// ============================================================================
// REDIS ADAPTER (for production)
// ============================================================================
// Uncomment and configure when ready to use Redis

/*
import Redis from 'ioredis'

export class RedisRateLimiter extends RateLimiter {
  constructor(options = {}) {
    super(options)
    this.redis = new Redis(options.redis || {})
  }

  async check(key, maxRequests, windowMs) {
    const limit = maxRequests || this.defaultMaxRequests
    const window = windowMs || this.defaultWindowMs
    const now = Date.now()
    const windowStart = now - window
    
    // Use Redis sorted set for sliding window
    const redisKey = `ratelimit:${key}`
    
    // Remove old entries
    await this.redis.zremrangebyscore(redisKey, 0, windowStart)
    
    // Count current requests
    const count = await this.redis.zcard(redisKey)
    
    if (count >= limit) {
      const oldestTimestamp = await this.redis.zrange(redisKey, 0, 0, 'WITHSCORES')
      const resetAt = parseInt(oldestTimestamp[1]) + window
      const retryAfter = Math.ceil((resetAt - now) / 1000)
      
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(resetAt),
        retryAfter,
        limit
      }
    }
    
    // Add current request
    await this.redis.zadd(redisKey, now, `${now}:${Math.random()}`)
    await this.redis.expire(redisKey, Math.ceil(window / 1000))
    
    return {
      allowed: true,
      remaining: limit - count - 1,
      resetAt: new Date(now + window),
      retryAfter: 0,
      limit
    }
  }

  async reset(key) {
    await this.redis.del(`ratelimit:${key}`)
    return true
  }

  async destroy() {
    await this.redis.quit()
  }
}
*/

export { RateLimiter }