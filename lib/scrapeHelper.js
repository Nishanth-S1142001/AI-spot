import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import { addSummary, summaries } from "./memoryStore";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to scrape & summarize a URL
export async function scrapeAndSummarize(url) {
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
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes website content and converts it into FAQ format for a chatbot.",
        },
        {
          role: "user",
          content: `Summarize the following webpage text in FAQ format:\n\n${content}`,
        },
      ],
    });

    const summary = completion.choices[0].message.content;
    addSummary({ url, summary });
    return summary;
  } catch (err) {
    console.error("Scraping error:", err.message);
    return null;
  }
}
