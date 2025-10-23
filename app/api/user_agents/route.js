import { getUserAgents } from '../../actions/agents'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
export async function GET(request) {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (!user || authError) {
    return new Response(JSON.stringify({ error: 'Missing user id' }), {
      status: 400
    })
  }

  try {
    const userAgents = await getUserAgents(user.id)
    if (!userAgents) {
      return new Response(JSON.stringify({ error: 'No agents found' }), {
        status: 404
      })
    }
    return new Response(JSON.stringify({ agents: userAgents }), {
      status: 200
    })
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch   data' }),
      {
        status: 500
      }
    )
  }
}
