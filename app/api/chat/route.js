import OpenAI from "openai";
// import { summaries } from "../../../lib/memoryStore";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple keyword filtering function
function filterSummaries(question, allSummaries) {
  const lowerQ = question.toLowerCase();
  return allSummaries
    .filter(s => s.summary.toLowerCase().includes(lowerQ))
    .map(s => s.summary)
    .join("\n\n");
}

export async function POST(req) {
  try {
    const { userInput,  context, prompt } = await req.json();

    if (!userInput) return NextResponse.json({ error: "Missing question" }, { status: 400 });
    if (!context || context.length === 0) {
      return NextResponse.json({ error: "No summaries available" }, { status: 400 });
    }

    // const context = filterSummaries(question, clientSummaries) || "No matching content found in the FAQ.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or switch to gpt-3.5-turbo for faster responses
      messages: [
        {
          role: "system",
          content: `
You are a friendly, approachable, and helpful chatbot.
- Always respond in a conversational and polite way.
- Use a friendly tone, emojis sparingly if appropriate, and try to engage the user naturally.
- Only respond using the provided context .
- If the answer is not in the context, politely say "I couldn't find that in the data, but I'm happy to help with something else!"
` || prompt.trim(), 
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${userInput}`,
        },
      ],
    });

    const answer = completion.choices[0].message.content;
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("❌ Chat error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
