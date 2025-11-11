import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getIntegrationManager } from '../../../../lib/integrations/IntegrationManager'

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { integrationType, credentials } = body

    if (!integrationType || !credentials) {
      return NextResponse.json(
        { error: 'Missing integration type or credentials' },
        { status: 400 }
      )
    }

    // Get integration manager
    const integrationManager = getIntegrationManager()

    // Test the connection
    const result = await integrationManager.testConnection(
      integrationType,
      credentials
    )

    return NextResponse.json({
      success: result.success,
      message: result.message || (result.success ? 'Connection successful' : 'Connection failed')
    })
  } catch (error) {
    console.error('Integration test failed:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Test failed'
      },
      { status: 500 }
    )
  }
}
