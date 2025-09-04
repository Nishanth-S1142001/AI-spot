import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { content } = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: "Missing content to summarize" }), { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text content for AI agents. Focus on key points and useful details."
        },
        {
          role: "user",
          content: `Please summarize this content:\n\n${content}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const summary = completion.choices[0]?.message?.content || "Summary could not be generated.";

    return new Response(JSON.stringify({ summary }), { status: 200 });
  } catch (error) {
    console.error("❌ Error summarizing content:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
