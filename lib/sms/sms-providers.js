/**
 * SMS PROVIDERS INTEGRATION
 * Handles SMS sending through different providers:
 * - Twilio (Global)
 * - MSG91 (India)
 * - TextLocal (India)
 * - Gupshup (India)
 */

import axios from 'axios'

// =====================================================
// TWILIO
// =====================================================

async function sendTwilioSms(config, toNumber, message) {
  try {
    const accountSid = config.twilio_account_sid
    const authToken = config.twilio_auth_token
    const fromNumber = config.twilio_phone_number
    
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Missing Twilio configuration')
    }
    
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    
    const params = new URLSearchParams()
    params.append('From', fromNumber)
    params.append('To', toNumber)
    params.append('Body', message)
    
    const response = await axios.post(url, params, {
      auth: {
        username: accountSid,
        password: authToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    return {
      success: true,
      messageSid: response.data.sid,
      status: response.data.status
    }
  } catch (error) {
    console.error('Twilio SMS error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

async function testTwilioConnection(config) {
  try {
    const accountSid = config.twilio_account_sid
    const authToken = config.twilio_auth_token
    
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`
    
    const response = await axios.get(url, {
      auth: {
        username: accountSid,
        password: authToken
      }
    })
    
    return {
      success: true,
      details: {
        accountStatus: response.data.status,
        friendlyName: response.data.friendly_name
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

// =====================================================
// MSG91 (Popular in India)
// =====================================================

async function sendMsg91Sms(config, toNumber, message) {
  try {
    const authKey = config.msg91_auth_key
    const senderId = config.msg91_sender_id
    const route = config.msg91_route || 'transactional'
    
    if (!authKey || !senderId) {
      throw new Error('Missing MSG91 configuration')
    }
    
    // Clean phone number (remove + and spaces)
    const cleanNumber = toNumber.replace(/[^0-9]/g, '')
    
    const url = 'https://api.msg91.com/api/v5/flow/'
    
    const payload = {
      sender: senderId,
      route: route,
      recipients: [{
        mobiles: cleanNumber,
        var: message
      }]
    }
    
    const response = await axios.post(url, payload, {
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json'
      }
    })
    
    return {
      success: true,
      messageSid: response.data.request_id || response.data.message_id,
      status: response.data.type
    }
  } catch (error) {
    console.error('MSG91 SMS error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

async function testMsg91Connection(config) {
  try {
    const authKey = config.msg91_auth_key
    
    // Test by getting account balance
    const url = 'https://api.msg91.com/api/balance.php'
    
    const response = await axios.post(url, {
      authkey: authKey
    })
    
    return {
      success: true,
      details: {
        balance: response.data
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    }
  }
}

// =====================================================
// TEXTLOCAL (India)
// =====================================================

async function sendTextLocalSms(config, toNumber, message) {
  try {
    const apiKey = config.textlocal_api_key
    const sender = config.textlocal_sender
    
    if (!apiKey || !sender) {
      throw new Error('Missing TextLocal configuration')
    }
    
    // Clean phone number
    const cleanNumber = toNumber.replace(/[^0-9]/g, '')
    
    const url = 'https://api.textlocal.in/send/'
    
    const params = new URLSearchParams()
    params.append('apikey', apiKey)
    params.append('sender', sender)
    params.append('numbers', cleanNumber)
    params.append('message', message)
    
    const response = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    if (response.data.status === 'success') {
      return {
        success: true,
        messageSid: response.data.messages?.[0]?.id,
        status: 'sent'
      }
    } else {
      return {
        success: false,
        error: response.data.errors?.[0]?.message || 'Unknown error'
      }
    }
  } catch (error) {
    console.error('TextLocal SMS error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.errors?.[0]?.message || error.message
    }
  }
}

async function testTextLocalConnection(config) {
  try {
    const apiKey = config.textlocal_api_key
    
    // Test by getting account balance
    const url = 'https://api.textlocal.in/balance/'
    
    const params = new URLSearchParams()
    params.append('apikey', apiKey)
    
    const response = await axios.post(url, params)
    
    if (response.data.status === 'success') {
      return {
        success: true,
        details: {
          balance: response.data.balance
        }
      }
    } else {
      return {
        success: false,
        error: response.data.errors?.[0]?.message || 'Connection failed'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.errors?.[0]?.message || error.message
    }
  }
}

// =====================================================
// GUPSHUP (India)
// =====================================================

async function sendGupshupSms(config, toNumber, message) {
  try {
    const apiKey = config.gupshup_api_key
    const appId = config.gupshup_app_id
    
    if (!apiKey || !appId) {
      throw new Error('Missing Gupshup configuration')
    }
    
    // Clean phone number
    const cleanNumber = toNumber.replace(/[^0-9]/g, '')
    
    const url = 'https://enterprise.smsgupshup.com/GatewayAPI/rest'
    
    const params = new URLSearchParams()
    params.append('method', 'SendMessage')
    params.append('send_to', cleanNumber)
    params.append('msg', message)
    params.append('msg_type', 'TEXT')
    params.append('userid', appId)
    params.append('auth_scheme', 'plain')
    params.append('password', apiKey)
    params.append('v', '1.1')
    params.append('format', 'json')
    
    const response = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    if (response.data.response?.status === 'success') {
      return {
        success: true,
        messageSid: response.data.response?.id,
        status: 'sent'
      }
    } else {
      return {
        success: false,
        error: response.data.response?.details || 'Unknown error'
      }
    }
  } catch (error) {
    console.error('Gupshup SMS error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.response?.details || error.message
    }
  }
}

async function testGupshupConnection(config) {
  try {
    // Gupshup doesn't have a direct balance API
    // We'll just validate credentials format
    const apiKey = config.gupshup_api_key
    const appId = config.gupshup_app_id
    
    if (!apiKey || !appId) {
      return {
        success: false,
        error: 'Missing credentials'
      }
    }
    
    return {
      success: true,
      details: {
        message: 'Credentials format valid. Send a test SMS to fully verify.'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// =====================================================
// MAIN FUNCTIONS
// =====================================================

/**
 * Send SMS through configured provider
 */
export async function sendSms(config, toNumber, message) {
  const provider = config.provider
  
  try {
    switch (provider) {
      case 'twilio':
        return await sendTwilioSms(config, toNumber, message)
      case 'msg91':
        return await sendMsg91Sms(config, toNumber, message)
      case 'textlocal':
        return await sendTextLocalSms(config, toNumber, message)
      case 'gupshup':
        return await sendGupshupSms(config, toNumber, message)
      default:
        return {
          success: false,
          error: `Unsupported provider: ${provider}`
        }
    }
  } catch (error) {
    console.error('SMS send error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Test provider connection
 */
export async function testProviderConnection(config) {
  const provider = config.provider
  
  try {
    switch (provider) {
      case 'twilio':
        return await testTwilioConnection(config)
      case 'msg91':
        return await testMsg91Connection(config)
      case 'textlocal':
        return await testTextLocalConnection(config)
      case 'gupshup':
        return await testGupshupConnection(config)
      default:
        return {
          success: false,
          error: `Unsupported provider: ${provider}`
        }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Format phone number for provider
 */
export function formatPhoneNumber(phoneNumber, provider) {
  // Remove all non-numeric characters
  let cleaned = phoneNumber.replace(/[^0-9+]/g, '')
  
  // Ensure it starts with + for international format
  if (!cleaned.startsWith('+')) {
    // For Indian numbers, add +91 if not present
    if (provider === 'msg91' || provider === 'textlocal' || provider === 'gupshup') {
      if (cleaned.length === 10) {
        cleaned = '+91' + cleaned
      }
    }
  }
  
  return cleaned
}
