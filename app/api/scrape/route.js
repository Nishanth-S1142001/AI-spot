import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import { summaries, addSummary } from "../../../lib/memoryStore";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing URL parameter" }), {
      status: 400,
    });
  }

  try {
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes website content and converts it into the form FAQ.",
        },
        {
          role: "user",
          content: `Summarize the following webpage text and make it into a form of FAQ for a chat bot feed:\n\n${content}`,
        },
      ],
    });

    const summary = completion.choices[0].message.content;
    addSummary({ url, summary });

    return new Response(JSON.stringify({ summaries }), { status: 200 });
  } catch (error) {
    console.error("❌ Error scraping:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
