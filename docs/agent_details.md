import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAgent } from '../../../actions/agents'
import { NextResponse } from 'next/server'

export async function GET(req, {params}) {
  // ✅ Await both params and cookies
  const { id } = await params
  const cookieStore = await cookies()

  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const agentData = await getAgent(id, user.id)
    console.log(agentData)

    if (!agentData) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    return NextResponse.json(agentData, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    )
  }
}
