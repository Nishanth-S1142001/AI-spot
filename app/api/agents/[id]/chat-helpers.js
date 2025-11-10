import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '../../../lib/supabase/dbServer'


/**
 * Get the API key to use for this agent
 * Returns either user's decrypted key or platform key
 */
export async function getApiKeyForAgent(agentId, userId) {
  try {
    // 1. Get agent configuration
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('api_key_id, use_platform_key, model, user_id')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      console.error('Agent fetch error:', agentError)
      throw new Error('Agent not found')
    }

    // 2. If agent is set to use platform key OR no user key configured
    if (agent.use_platform_key || !agent.api_key_id) {
      const platformKey = process.env.OPENAI_API_KEY
      
      if (!platformKey) {
        throw new Error('Platform API key not configured. Please contact support.')
      }

      console.log('✅ Using platform API key')
      return {
        apiKey: platformKey,
        source: 'platform',
        provider: 'openai',
      }
    }

    // 3. Fetch user's encrypted API key
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('user_api_keys')
      .select('id, provider, encrypted_key, is_active')
      .eq('id', agent.api_key_id)
      .eq('user_id', agent.user_id)
      .eq('is_active', true)
      .single()

    if (keyError || !keyData) {
      console.error('User API key fetch error:', keyError)
      // Fallback to platform key
      const platformKey = process.env.OPENAI_API_KEY
      if (!platformKey) {
        throw new Error('No valid API key available')
      }
      
      console.log('⚠️ User key not found, falling back to platform key')
      return {
        apiKey: platformKey,
        source: 'platform',
        provider: 'openai',
      }
    }

    // 4. Decrypt the user's API key using Edge Function
    console.log('🔓 Decrypting user API key...')
    
    const decryptResponse = await fetch(
      `${supabaseUrl}/functions/v1/api-keys?action=decrypt&keyId=${keyData.id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!decryptResponse.ok) {
      const error = await decryptResponse.json()
      console.error('Decryption failed:', error)
      
      // Fallback to platform key
      const platformKey = process.env.OPENAI_API_KEY
      if (!platformKey) {
        throw new Error('Failed to retrieve API key')
      }
      
      console.log('⚠️ Decryption failed, falling back to platform key')
      return {
        apiKey: platformKey,
        source: 'platform',
        provider: 'openai',
      }
    }

    const { apiKey } = await decryptResponse.json()

    console.log('✅ Using user API key')
    return {
      apiKey,
      source: 'user',
      provider: keyData.provider,
    }
  } catch (error) {
    console.error('❌ getApiKeyForAgent error:', error)
    
    // Last resort: try platform key
    const platformKey = process.env.OPENAI_API_KEY
    if (platformKey) {
      console.log('⚠️ Error occurred, falling back to platform key')
      return {
        apiKey: platformKey,
        source: 'platform',
        provider: 'openai',
      }
    }
    
    throw new Error('No API key available. Please configure your API key in settings.')
  }
}

/**
 * Get OpenAI client instance with appropriate API key
 */
export async function getOpenAIClient(agentId, userId) {
  const { apiKey, source, provider } = await getApiKeyForAgent(agentId, userId)
  
  if (provider !== 'openai') {
    throw new Error(`Provider ${provider} not yet supported. Please use OpenAI.`)
  }

  const OpenAI = (await import('openai')).default
  
  return {
    client: new OpenAI({
      apiKey,
      timeout: 30000,
      maxRetries: 2,
    }),
    source, // 'user' or 'platform'
    provider,
  }
}

/**
 * Get Anthropic client instance (for future support)
 */
export async function getAnthropicClient(agentId, userId) {
  const { apiKey, source, provider } = await getApiKeyForAgent(agentId, userId)
  
  if (provider !== 'anthropic') {
    throw new Error(`Expected Anthropic key but got ${provider}`)
  }

  const Anthropic = (await import('@anthropic-ai/sdk')).default
  
  return {
    client: new Anthropic({
      apiKey,
      timeout: 30000,
      maxRetries: 2,
    }),
    source,
    provider,
  }
}
const decryptResponse = await fetch(
  `${supabaseUrl}/functions/v1/api-keys?action=decrypt&keyId=${keyData.id}`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
    },
  }
)
