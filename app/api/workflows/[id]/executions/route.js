import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getWorkflow, getWorkflowExecutions } from '../../../../actions/agents'

// GET /api/workflows/[id]/executions - Fetch workflow executions with pagination
export async function GET(request, { params }) {
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

    const { id } = await params
    const { searchParams } = new URL(request.url)
    
    // Pagination and filtering parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status') // Filter by status
    const startDate = searchParams.get('startDate') // Filter by date range
    const endDate = searchParams.get('endDate')

    // ✅ PARALLEL FETCHING
    const [workflow, executions] = await Promise.all([
      getWorkflow(id, user.id),
      getWorkflowExecutions(id, {
        limit,
        page,
        status,
        startDate,
        endDate
      })
    ])

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({
      executions,
      pagination: {
        page,
        limit,
        total: executions.length,
        hasMore: executions.length === limit
      }
    })

    // Cache for 10 seconds (executions change frequently)
    response.headers.set(
      'Cache-Control',
      'private, s-maxage=10, stale-while-revalidate=5'
    )

    return response
  } catch (error) {
    console.error('Error fetching executions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    )
  }
}