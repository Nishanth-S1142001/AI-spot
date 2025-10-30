import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getUserWorkflows, createWorkflow } from '../../actions/agents'

// GET /api/workflows - Fetch user workflows with pagination and filtering
export async function GET(request) {
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

    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100
    const status = searchParams.get('status') // 'active' | 'draft'
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Fetch workflows with filters
    const workflows = await getUserWorkflows(user.id, {
      page,
      limit,
      status,
      search,
      sortBy,
      sortOrder
    })

    const response = NextResponse.json({
      workflows,
      pagination: {
        page,
        limit,
        total: workflows.length,
        hasMore: workflows.length === limit
      }
    })

    // Cache for 30 seconds with revalidation
    response.headers.set(
      'Cache-Control',
      'private, s-maxage=30, stale-while-revalidate=15'
    )

    return response
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    )
  }
}

// POST /api/workflows - Create new workflow
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

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Workflow name is required' },
        { status: 400 }
      )
    }

    if (body.name.length > 100) {
      return NextResponse.json(
        { error: 'Workflow name must be less than 100 characters' },
        { status: 400 }
      )
    }

    const workflow = await createWorkflow(user.id, {
      name: body.name.trim(),
      description: body.description?.trim() || '',
      trigger_type: body.trigger_type || 'manual',
      trigger_config: body.trigger_config || {},
      workflow_data: body.workflow_data || {},
      settings: body.settings || {},
      status: 'draft',
      is_active: false
    })

    const response = NextResponse.json({ workflow }, { status: 201 })

    // Invalidate cache
    response.headers.set('Cache-Control', 'no-cache')

    return response
  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    )
  }
}