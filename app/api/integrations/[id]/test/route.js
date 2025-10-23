import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { updateIntegration } from '../../../../actions/agents'
import { IntegrationManager } from '../../../../../lib/workflow/integrations'
import { cookies } from 'next/headers'
export async function POST(request, { params }) {
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

    const { id } = params
    const body = await request.json()

    const integration = await dbServer.getIntegration(id)

    if (!integration || integration.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      )
    }

    // Test integration
    const integrationManager = new IntegrationManager()
    const result = await integrationManager.execute(
      integration.integration_type,
      body.testAction || 'test_connection',
      {
        credentials: integration.credentials,
        ...body.parameters
      }
    )

    // Update last tested timestamp
    await  updateIntegration(id, {
      last_tested_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      result
    })
  } catch (error) {
    console.error('Integration test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
