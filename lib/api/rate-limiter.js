/**
 * ========================================================================
 * UNIVERSAL RATE LIMITER (In-memory + Redis-ready)
 * ========================================================================
 * Supports:
 * - Direct check: checkRateLimit(key, { limit, windowMs })
 * - Middleware: createRateLimitMiddleware({ maxRequests, windowMs, ... })
 * ========================================================================
 */

class RateLimiter {
  constructor(options = {}) {
    this.defaultLimit = options.defaultLimit || 60
    this.defaultWindowMs = options.defaultWindowMs || 60000
    this.store = new Map()
    this.cleanupInterval = setInterval(() => this.cleanup(), options.cleanupIntervalMs || 60000)
    if (this.cleanupInterval.unref) this.cleanupInterval.unref()
  }

  check(key, { limit = this.defaultLimit, windowMs = this.defaultWindowMs } = {}) {
    const now = Date.now()
    let record = this.store.get(key)

    // Initialize / reset window
    if (!record || now >= record.resetAt) {
      record = { count: 0, resetAt: now + windowMs }
      this.store.set(key, record)
    }

    record.count++
    const remaining = Math.max(0, limit - record.count)
    const allowed = record.count <= limit

    return {
      allowed,
      remaining,
      limit,
      resetAt: record.resetAt,
      retryAfter: allowed ? 0 : Math.ceil((record.resetAt - now) / 1000)
    }
  }

  reset(key) {
    this.store.delete(key)
  }

  cleanup() {
    const now = Date.now()
    for (const [key, record] of this.store.entries()) {
      if (now >= record.resetAt) this.store.delete(key)
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

/**
 * Direct check (for quick use in routes)
 * Example:
 *   const result = checkRateLimit(`webhook:${id}:${ip}`, { limit: 10, windowMs: 60000 })
 */
export function checkRateLimit(key, options = {}) {
  return rateLimiter.check(key, options)
}

/**
 * Create middleware for use in Next.js routes
 */
export function createRateLimitMiddleware(options = {}) {
  const {
    maxRequests = 60,
    windowMs = 60000,
    keyGenerator = defaultKeyGenerator,
    skip = () => false,
    onLimitExceeded = defaultLimitHandler
  } = options

  return async (req) => {
    if (skip(req)) return { allowed: true, skipped: true }

    const key = keyGenerator(req)
    const result = rateLimiter.check(key, { limit: maxRequests, windowMs })

    const headers = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetAt).toISOString()
    }

    if (!result.allowed) {
      headers['Retry-After'] = result.retryAfter.toString()
      return {
        allowed: false,
        headers,
        error: onLimitExceeded(result)
      }
    }

    return { allowed: true, headers }
  }
}

/**
 * Default key generator: IP-based
 */
function defaultKeyGenerator(req) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  return `ip:${ip}`
}

/**
 * Default rate-limit error response
 */
function defaultLimitHandler(result) {
  return {
    error: 'Rate limit exceeded',
    message: `Too many requests. Try again in ${result.retryAfter}s.`,
    retryAfter: result.retryAfter
  }
}

export default rateLimiter
