import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req) {
  try {
    const { instructions, content } = await req.json()

    const joinedInstructions = Array.isArray(instructions)
      ? instructions.join('\n')
      : instructions
    const joinedContent = Array.isArray(content) ? content.join('\n') : content

    if (!joinedInstructions.trim() || !joinedContent.trim()) {
      return new Response(
        JSON.stringify({
          error: 'Missing instructions or content to make changes to the bot'
        }),
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that makes changes to the content provided to you by applying the instructions provided by the user. Follow the instructions completely and make changes accordingly.'
        },
        {
          role: 'user',
          content: `Please make changes to the content:\n\n${joinedContent.trim()}\n\nFollowing these instructions:\n\n${joinedInstructions.trim()}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    })

    const data =
      completion.choices[0]?.message?.content ||
      'Content could not be generated.'

    return new Response(JSON.stringify({ content: data }), { status: 200 })
  } catch (error) {
    console.error('❌ Error processing content:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    })
  }
}
