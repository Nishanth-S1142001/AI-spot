import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";

const instruction = ` You are a content refinement system.  
You will be given raw text scraped from a website. The text may contain menus, ads, boilerplate, duplicate sections, or formatting issues.  

Your job is to:
1. Remove irrelevant content such as navigation links, ads, disclaimers, cookie notices, or repeated text.  
2. Keep only the meaningful body content (headings, paragraphs, lists, FAQs, descriptions).  
3. Rewrite the content in clear, concise, human-friendly language while keeping the original meaning intact.  
4. Preserve important factual information, numbers, and domain-specific terms.  
5. Organize the cleaned content into a structured format:
   - Headings and subheadings
   - Bullet points where needed
   - Short paragraphs for readability  
6. Preserve the hierarchy of the content:
   - Keep headings (H1, H2, H3, etc.)
   - Keep subheadings under their respective headings
   - Keep body text under the right heading/subheading
7. Output should be well-formatted and structured, ready for chatbot training.  

Do not invent new information. Do not provide commentary or opinions.  `
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

    // 🕸️ Scrape website content via ScraperAPI
    const response = await axios.get("http://api.scraperapi.com", {
      params: {
        api_key: process.env.SCRAPER_API_KEY,
        url,
        render: false,
        country_code: "us",
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);

    // 📄 Extract readable text
    let content = "";
    $("p, h1, h2, h3, li").each((i, el) => {
      content += $(el).text() + " ";
    });

    // 🧹 Clean up text
    content = content.replace(/\s+/g, " ").trim();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No readable content found" }),
        { status: 404 }
      );
    }

    // ✂️ Limit content length (~2k tokens safe)
    const MAX_CHARS = 6000;
    if (content.length > MAX_CHARS) {
      content = content.slice(0, MAX_CHARS);
    }

    // 🤖 Generate summary with OpenAI
    const summaryCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            ` ${instruction} `
        },
        {
          role: "user",
          content: `Follow the instructions  ${instruction}  for the following content :\n\n${content}`,
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
    console.error("❌ Error scraping:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
