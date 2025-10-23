export function generateWebhookKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'wh_'
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateAuthToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'sk_'
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function nanoid(length = 21) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  // Use crypto for better randomness
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const values = new Uint8Array(length)
    crypto.getRandomValues(values)

    for (let i = 0; i < length; i++) {
      result += chars[values[i] % chars.length]
    }
  } else {
    // Fallback for Node.js without crypto
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }

  return result
}

/**
 * Generate a webhook-safe token (URL-safe, no special chars)
 * @param {number} length - Length of token (default: 32)
 * @returns {string} Random token
 */
export function generateToken(length = 32) {
  return nanoid(length)
}

/**
 * Generate a short ID (good for node IDs)
 * @returns {string} Short random ID (10 chars)
 */
export function shortId() {
  return nanoid(10)
}
