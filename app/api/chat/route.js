import OpenAI from "openai";
import { summaries } from "../../../lib/memoryStore";
import { scrapeAndSummarize } from "../../../lib/scrapeHelper";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    // If no summaries, scrape a default URL
    if (!summaries || summaries.length === 0) {
      await scrapeAndSummarize("https://en.wikipedia.org/wiki/Web_scraping");
    }

    const context = summaries.map((s) => s.summary).join("\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
           `"You are a friendly, approachable, and helpful chatbot. 
            - Always respond in a conversational and polite way. 
            - Use a friendly tone, emojis sparingly if appropriate, and try to engage the user naturally. 
            - Only answer questions using the provided context (summaries from scraped websites). 
            - If the answer is not in the context, politely say "I couldn't find that in the data, but I'm happy to help with something else!"`,
        },
        {
          role: "user",
          content: `Question: ${question}\n\nContext:\n${context}`,
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
