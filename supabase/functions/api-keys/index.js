import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================
// ENCRYPTION UTILITIES (AES-256-GCM)
// ============================================

const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_SECRET_KEY')

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_SECRET_KEY environment variable is required')
}

async function getEncryptionKey() {
  const keyData = new TextEncoder().encode(
    ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)
  )
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  )
}

async function encrypt(plaintext) {
  const key = await getEncryptionKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = new TextEncoder().encode(plaintext)

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...combined))
}

async function decrypt(ciphertext) {
  const key = await getEncryptionKey()
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0))

  const iv = combined.slice(0, 12)
  const data = combined.slice(12)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  return new TextDecoder().decode(decrypted)
}

// ============================================
// EDGE FUNCTION HANDLER
// ============================================

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, DELETE',
        'Access-Control-Allow-Headers':
          'authorization, x-client-info, apikey, content-type'
      }
    })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' }
        }
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { method } = req
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // ============================================
    // SAVE API KEY (Encrypted)
    // ============================================
    if (method === 'POST' && action === 'save') {
      const body = await req.json()
      const { provider, apiKey, keyName } = body

      if (!provider || !apiKey) {
        return new Response(
          JSON.stringify({ error: 'Missing provider or apiKey' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Encrypt the API key
      const encryptedKey = await encrypt(apiKey)

      // Deactivate any existing active keys for this provider
      await supabaseClient
        .from('user_api_keys')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('provider', provider)
        .eq('is_active', true)

      // Insert new key
      const { data, error } = await supabaseClient
        .from('user_api_keys')
        .insert({
          user_id: user.id,
          provider: provider,
          encrypted_key: encryptedKey,
          key_name: keyName || `${provider} key`,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving API key:', error)
        throw error
      }

      return new Response(
        JSON.stringify({
          success: true,
          keyId: data.id,
          message: 'API key saved securely'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // ============================================
    // GET DECRYPTED KEY (Backend only)
    // ============================================
    if (method === 'GET' && action === 'decrypt') {
      const keyId = url.searchParams.get('keyId')
      const provider = url.searchParams.get('provider')

      if (!keyId && !provider) {
        return new Response(
          JSON.stringify({ error: 'Missing keyId or provider' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      let query = supabaseClient
        .from('user_api_keys')
        .select('*')
        .eq('user_id', user.id)

      if (keyId) {
        query = query.eq('id', keyId)
      } else {
        query = query.eq('provider', provider).eq('is_active', true)
      }

      const { data, error } = await query.maybeSingle()

      if (error) {
        console.error('Error fetching API key:', error)
        throw error
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: 'API key not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Decrypt and return
      const decryptedKey = await decrypt(data.encrypted_key)

      // Update last_used_at
      await supabaseClient
        .from('user_api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id)

      return new Response(
        JSON.stringify({
          success: true,
          apiKey: decryptedKey,
          provider: data.provider
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // ============================================
    // DELETE API KEY
    // ============================================
    if (method === 'DELETE') {
      const keyId = url.searchParams.get('keyId')

      if (!keyId) {
        return new Response(JSON.stringify({ error: 'Missing keyId' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const { error } = await supabaseClient
        .from('user_api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting API key:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, message: 'API key deleted' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Invalid action
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})