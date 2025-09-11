import { dbClient } from "../../../lib/supabase/dbClient"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("user")

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing user id" }), { status: 400 })
  }

  try {
    const userAgents = await dbClient.getUserAgents(userId)

    let totalConversations = 0
    let totalCreditsUsed = 0
    let successfulInteractions = 0
    let totalInteractions = 0

    for (const agent of userAgents) {
      const agentAnalytics = await dbClient.getAnalytics(agent.id)
      agentAnalytics.forEach((record) => {
        if (record.event_type === "conversation") {
          totalConversations++
          totalInteractions++
          if (record.success) successfulInteractions++
        }
        totalCreditsUsed += record.tokens_used || 0
      })
    }

    const analytics = {
      totalConversations,
      totalAgents: userAgents.length,
      creditsUsed: totalCreditsUsed,
      successRate:
        totalInteractions > 0 ? (successfulInteractions / totalInteractions) * 100 : 0,
    }

    return new Response(JSON.stringify({ agents: userAgents, analytics }), {
      status: 200,
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: "Failed to fetch dashboard data" }), {
      status: 500,
    })
  }
}
