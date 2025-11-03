/**
 * Document Processor for Vector Knowledge Base
 * Using unpdf for modern PDF text extraction
 */

/**
 * Document Processor Class
 */
export class DocumentProcessor {
  /**
   * Validate file size and type
   */
  static validateFile(file, maxSizeMB = 10) {
    if (!file) {
      throw new Error('No file provided')
    }

    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`)
    }

    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown'
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file type. Allowed: PDF, TXT, MD')
    }

    return true
  }

  /**
   * Process uploaded file based on type
   */
  static async processFile(file, fileType) {
    try {
      if (fileType === 'application/pdf') {
        return await this.processPDF(file)
      } else if (fileType === 'text/plain' || fileType === 'text/markdown') {
        return await this.processText(file)
      } else {
        throw new Error(`Unsupported file type: ${fileType}`)
      }
    } catch (error) {
      console.error('Error processing file:', error)
      return {
        success: false,
        text: '',
        metadata: { error: error.message }
      }
    }
  }

  /**
   * Extract text from PDF using unpdf
   * ✅ Works in Next.js API routes and browser
   */
  static async processPDF(file) {
    try {
      // ✅ Dynamic import for unpdf
      const { extractText } = await import('unpdf')

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Extract text from PDF
      const { text, totalPages, metadata } = await extractText(arrayBuffer, {
        mergePages: true // Merge all pages into single text
      })

      // Clean up text
      const fullText = this.cleanText(text)

      return {
        success: true,
        text: fullText,
        metadata: {
          pageCount: totalPages,
          wordCount: fullText.split(/\s+/).length,
          characterCount: fullText.length,
          pdfMetadata: metadata // PDF metadata like title, author, etc.
        }
      }
    } catch (error) {
      console.error('PDF processing error:', error)
      throw new Error(`Failed to process PDF: ${error.message}`)
    }
  }

  /**
   * Extract text from plain text file
   */
  static async processText(file) {
    try {
      const text = await file.text()
      const cleanedText = this.cleanText(text)

      return {
        success: true,
        text: cleanedText,
        metadata: {
          wordCount: cleanedText.split(/\s+/).length,
          characterCount: cleanedText.length
        }
      }
    } catch (error) {
      console.error('Text processing error:', error)
      throw new Error(`Failed to process text: ${error.message}`)
    }
  }

  /**
   * Process website content
   */
  static async processWebsite(url) {
    try {
      // This will be called from the API route
      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error('Failed to scrape website')
      }

      const data = await response.json()
      const cleanedText = this.cleanText(data.content || '')

      return {
        success: true,
        text: cleanedText,
        metadata: {
          url,
          wordCount: cleanedText.split(/\s+/).length,
          characterCount: cleanedText.length,
          scrapedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Website processing error:', error)
      throw new Error(`Failed to process website: ${error.message}`)
    }
  }

  /**
   * Clean and normalize text
   */
  static cleanText(text) {
    if (!text) return ''

    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that cause issues
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      // Remove multiple consecutive line breaks (more than 2)
      .replace(/\n{3,}/g, '\n\n')
      // Trim
      .trim()
  }

  /**
   * Split text into chunks for vector processing
   */
  static chunkText(text, chunkSize = 1000, overlap = 200) {
    if (!text || text.length === 0) return []

    const chunks = []
    let startIndex = 0

    while (startIndex < text.length) {
      let endIndex = startIndex + chunkSize

      // If not the last chunk, try to break at a sentence or word boundary
      if (endIndex < text.length) {
        // Try to find a sentence ending
        const sentenceEnd = text.lastIndexOf('.', endIndex)
        const questionEnd = text.lastIndexOf('?', endIndex)
        const exclamationEnd = text.lastIndexOf('!', endIndex)
        const maxSentenceEnd = Math.max(sentenceEnd, questionEnd, exclamationEnd)

        if (maxSentenceEnd > startIndex + chunkSize * 0.7) {
          endIndex = maxSentenceEnd + 1
        } else {
          const spaceIndex = text.lastIndexOf(' ', endIndex)
          if (spaceIndex > startIndex) {
            endIndex = spaceIndex
          }
        }
      }

      const chunk = text.slice(startIndex, endIndex).trim()
      if (chunk.length > 0) {
        chunks.push(chunk)
      }

      startIndex = endIndex - overlap
      if (startIndex <= 0) startIndex = endIndex
    }

    return chunks
  }

  /**
   * Estimate token count (rough approximation)
   */
  static estimateTokens(text) {
    if (!text) return 0
    return Math.ceil(text.length / 4)
  }

  /**
   * Get optimal chunk size based on text length
   */
  static getChunkConfig(textLength) {
    if (textLength < 5000) {
      return { chunkSize: 1000, overlap: 100 }
    } else if (textLength < 20000) {
      return { chunkSize: 1500, overlap: 200 }
    } else {
      return { chunkSize: 2000, overlap: 300 }
    }
  }
}

export default DocumentProcessor