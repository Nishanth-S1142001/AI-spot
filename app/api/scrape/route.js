import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: "Missing URL parameter" }), {
        status: 400,
      });
    }

    // Scrape website content
    const response = await axios.get("http://api.scraperapi.com", {
      params: {
        api_key: process.env.SCRAPER_API_KEY,
        url,
        render: true,
        country_code: "us",
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);
    let content = "";
    $("p").each((i, el) => {
      content += $(el).text() + " ";
    });

    // Generate summary using OpenAI
    const summaryCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes web content for AI agents. Focus on the key points, main topics, and useful information.",
        },
        {
          role: "user",
          content: `Please summarize the following webpage content:\n\n${content}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const summary =
      summaryCompletion.choices[0]?.message?.content ||
      "Summary could not be generated.";

    return new Response(
      JSON.stringify({
        url,
        content,
        summary,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error scraping:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
