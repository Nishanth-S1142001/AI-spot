import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const uint8Array = new Uint8Array(bytes)

    const { getDocumentProxy, extractText } = await import('unpdf')

    console.log('[v0] Loading PDF document with unpdf...')
    // Load the PDF document using unpdf
    const pdf = await getDocumentProxy(uint8Array)
    console.log('[v0] PDF loaded successfully, pages:', pdf.numPages)

    console.log('[v0] Extracting text from PDF...')
    // Extract text from the entire document
    const { text } = await extractText(pdf, { mergePages: true })
    console.log('[v0] Total extracted text length:', text.length)

    const summary = await summarizeText(text)

    return NextResponse.json({
      content: text.trim(),
      summary: summary,
      pages: pdf.numPages,
      info: {
        title: pdf.info?.Title || 'Unknown',
        author: pdf.info?.Author || 'Unknown'
      }
    })
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json(
      { error: 'Failed to extract PDF content' },
      { status: 500 }
    )
  }
}
async function summarizeText(text) {
  try {
    // Load OpenAI client (Edge-friendly import)
    const OpenAI = (await import('openai')).default
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY // Make sure to set this in .env.local
    })

    // If the PDF is too long, truncate or chunk (basic safeguard here)
    // const input = text.length > 4000 ? text.slice(0, 4000) : text
    const input =   text

    // const response = await client.chat.completions.create({
    //   model: 'gpt-4o-mini',
    //   messages: [
    //     {
    //       role: 'system',
    //       content:
    //         'You are a helpful assistant that summarizes PDF documents clearly and concisely. Do not forget to consider the entire content'
    //     },
    //     {
    //       role: 'user',
    //       content: `Summarize the following document:\n\n${input}`
    //     }
    //   ],
    //   temperature: 0.7,
    //   max_tokens: 500
    // })

    // return (
    //   response.choices[0]?.message?.content?.trim() || 'No summary generated.'
    // )
    return (text.trim())
  } catch (err) {
    console.error('Error summarizing PDF:', err)
    return 'Failed to generate summary.'
  }
}
