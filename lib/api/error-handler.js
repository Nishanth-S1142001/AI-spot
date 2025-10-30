// lib/api/error-handler.js
import { NextResponse } from 'next/server'

/**
 * Standard error response wrapper
 */
export function errorResponse(message, status = 500, details = null) {
  const response = {
    error: message,
    timestamp: new Date().toISOString()
  }

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details
  }

  return NextResponse.json(response, { status })
}

/**
 * Success response wrapper
 */
export function successResponse(data, status = 200, headers = {}) {
  const response = NextResponse.json(data, { status })
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

/**
 * Error handling middleware wrapper
 * Wraps route handlers with standardized error handling
 */
export function withErrorHandling(handler) {
  return async (...args) => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)

      // Handle specific error types
      if (error.name === 'AuthError' || error.message?.includes('Unauthorized')) {
        return errorResponse('Unauthorized', 401)
      }

      if (error.name === 'ValidationError' || error.message?.includes('validation')) {
        return errorResponse('Validation failed', 400, error.message)
      }

      if (error.message?.includes('not found')) {
        return errorResponse('Resource not found', 404)
      }

      if (error.message?.includes('timeout')) {
        return errorResponse('Request timeout', 504)
      }

      if (error.message?.includes('rate limit')) {
        return errorResponse('Rate limit exceeded', 429)
      }

      // Generic server error
      return errorResponse(
        'Internal server error',
        500,
        process.env.NODE_ENV === 'development' ? error.message : null
      )
    }
  }
}

/**
 * Async error boundary
 * Use with Promise.all to handle parallel operations
 */
export async function safeAsync(promise, fallbackValue = null) {
  try {
    return await promise
  } catch (error) {
    console.error('Safe async error:', error)
    return fallbackValue
  }
}

/**
 * Usage example:
 * 
 * import { withErrorHandling, errorResponse, successResponse } from '@/lib/api/error-handler'
 * 
 * export const GET = withErrorHandling(async (request, { params }) => {
 *   const { id } = await params
 *   
 *   if (!id) {
 *     return errorResponse('ID is required', 400)
 *   }
 *   
 *   const data = await fetchData(id)
 *   return successResponse({ data })
 * })
 */