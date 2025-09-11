import { dbClient } from '../../../../lib/supabase/dbClient'
// import { getServerSession } from 'next-auth' // if you use auth

export async function GET(req, context) {
  const params = await context.params
  const { id } = params
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  try {
    // optional: validate user session
    // const session = await getServerSession()
    // if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const agentData = await dbClient.getAgent(id, userId)
    if (!agentData) {
      return new Response(JSON.stringify({ error: 'Agent not found' }), {
        status: 404
      })
    }

    return new Response(JSON.stringify(agentData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Failed to fetch agent' }), {
      status: 500
    })
  }
}
