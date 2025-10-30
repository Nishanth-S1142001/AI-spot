// lib/api/cache.js

/**
 * Cache utility for API responses
 * Supports both in-memory and edge caching
 */

/**
 * Cache control configurations
 */
export const cacheConfig = {
  // No caching - always fresh
  noCache: 'no-store, no-cache, must-revalidate',

  // Private cache - 30 seconds with revalidation
  short: 'private, s-maxage=30, stale-while-revalidate=15',

  // Private cache - 60 seconds with revalidation
  medium: 'private, s-maxage=60, stale-while-revalidate=30',

  // Private cache - 5 minutes with revalidation
  long: 'private, s-maxage=300, stale-while-revalidate=150',

  // Public cache - 1 hour with revalidation
  public: 'public, s-maxage=3600, stale-while-revalidate=1800',

  // Immutable - cache forever
  immutable: 'public, max-age=31536000, immutable'
}

/**
 * Apply cache headers to response
 */
export function withCache(response, config = 'medium') {
  const cacheControl =
    typeof config === 'string' ? cacheConfig[config] || config : config

  response.headers.set('Cache-Control', cacheControl)
  return response
}

/**
 * Cache tags for revalidation
 */
export function withCacheTags(response, tags = []) {
  if (tags.length > 0) {
    response.headers.set('Cache-Tag', tags.join(','))
  }
  return response
}

/**
 * Conditional caching based on response
 */
export function conditionalCache(response, data, options = {}) {
  const {
    cacheOnSuccess = true,
    cacheOnError = false,
    successConfig = 'medium',
    errorConfig = 'noCache'
  } = options

  const isSuccess = response.status >= 200 && response.status < 300

  if (isSuccess && cacheOnSuccess) {
    return withCache(response, successConfig)
  }

  if (!isSuccess && cacheOnError) {
    return withCache(response, errorConfig)
  }

  return withCache(response, 'noCache')
}

/**
 * Dynamic cache based on data freshness
 */
export function dynamicCache(response, data, options = {}) {
  const { lastModified, status, isStatic = false } = options

  // Static data - cache longer
  if (isStatic) {
    return withCache(response, 'public')
  }

  // Dynamic based on status
  if (status === 'completed' || status === 'failed') {
    return withCache(response, 'long') // Completed items don't change
  }

  if (status === 'running' || status === 'pending') {
    return withCache(response, 'short') // Running items change frequently
  }

  // Default to medium
  return withCache(response, 'medium')
}

/**
 * ETag generation for conditional requests
 */
export function generateETag(data) {
  const crypto = require('crypto')
  const content = typeof data === 'string' ? data : JSON.stringify(data)
  return crypto.createHash('md5').update(content).digest('hex')
}

/**
 * Handle conditional requests (If-None-Match)
 */
export function handleConditionalRequest(request, data) {
  const etag = generateETag(data)
  const ifNoneMatch = request.headers.get('if-none-match')

  if (ifNoneMatch === etag) {
    // Data hasn't changed
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        'Cache-Control': cacheConfig.medium
      }
    })
  }

  return null // Data has changed, return full response
}

/**
 * Comprehensive cache wrapper
 */
export function withCacheStrategy(response, data, options = {}) {
  const {
    strategy = 'medium',
    tags = [],
    etag = false,
    conditional = false,
    dynamic = false
  } = options

  let cachedResponse = response

  // Apply cache strategy
  if (dynamic) {
    cachedResponse = dynamicCache(cachedResponse, data, options)
  } else {
    cachedResponse = withCache(cachedResponse, strategy)
  }

  // Add cache tags
  if (tags.length > 0) {
    cachedResponse = withCacheTags(cachedResponse, tags)
  }

  // Add ETag
  if (etag) {
    const etagValue = generateETag(data)
    cachedResponse.headers.set('ETag', etagValue)
  }

  return cachedResponse
}

/**
 * In-memory cache for computed results
 * Use for expensive computations
 */
class MemoryCache {
  constructor(ttl = 60000) {
    this.cache = new Map()
    this.ttl = ttl
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000)
  }

  get(key) {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  set(key, value, ttl = this.ttl) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    })
  }

  delete(key) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
export const memoryCache = new MemoryCache()

/**
 * Memoize expensive async operations
 */
export function memoize(fn, options = {}) {
  const { ttl = 60000, keyGenerator = (...args) => JSON.stringify(args) } = options
  const cache = new MemoryCache(ttl)

  return async (...args) => {
    const key = keyGenerator(...args)
    const cached = cache.get(key)

    if (cached !== null) {
      return cached
    }

    const result = await fn(...args)
    cache.set(key, result)
    return result
  }
}

/**
 * Usage examples:
 * 
 * 1. Basic caching:
 * 
 * import { withCache } from '@/lib/api/cache'
 * 
 * export async function GET(request) {
 *   const data = await fetchData()
 *   const response = NextResponse.json({ data })
 *   return withCache(response, 'medium')
 * }
 * 
 * 
 * 2. Dynamic caching based on data:
 * 
 * import { dynamicCache } from '@/lib/api/cache'
 * 
 * export async function GET(request) {
 *   const execution = await getExecution(id)
 *   const response = NextResponse.json({ execution })
 *   return dynamicCache(response, execution, { status: execution.status })
 * }
 * 
 * 
 * 3. Conditional requests with ETag:
 * 
 * import { handleConditionalRequest, generateETag } from '@/lib/api/cache'
 * 
 * export async function GET(request) {
 *   const data = await fetchData()
 *   
 *   const notModified = handleConditionalRequest(request, data)
 *   if (notModified) return notModified
 *   
 *   const response = NextResponse.json({ data })
 *   response.headers.set('ETag', generateETag(data))
 *   return response
 * }
 * 
 * 
 * 4. Memory cache for expensive operations:
 * 
 * import { memoize } from '@/lib/api/cache'
 * 
 * const getExpensiveData = memoize(
 *   async (userId) => {
 *     // Expensive computation
 *     return complexCalculation(userId)
 *   },
 *   { ttl: 300000 } // 5 minutes
 * )
 * 
 * 
 * 5. Comprehensive caching:
 * 
 * import { withCacheStrategy } from '@/lib/api/cache'
 * 
 * export async function GET(request) {
 *   const data = await fetchData()
 *   const response = NextResponse.json({ data })
 *   
 *   return withCacheStrategy(response, data, {
 *     strategy: 'medium',
 *     tags: ['workflows', `user:${userId}`],
 *     etag: true,
 *     dynamic: true,
 *     status: data.status
 *   })
 * }
 */