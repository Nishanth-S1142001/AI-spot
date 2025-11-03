import OpenAI from 'openai'
import { supabaseAdmin } from '../../app/lib/supabase/dbServer'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Configuration
const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536
const CHUNK_SIZE = 1000 // characters per chunk
const CHUNK_OVERLAP = 200 // overlap between chunks

/**
 * Vector Database Client for Knowledge Base Management
 * Handles document chunking, embedding generation, and vector similarity search
 */
export class VectorDB {
  /**
   * Split text into chunks with overlap for better context preservation
   */
  static splitIntoChunks(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const chunks = []
    let startIndex = 0

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length)
      const chunk = text.slice(startIndex, endIndex)
      
      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim())
      }

      // Move start index forward, accounting for overlap
      startIndex += chunkSize - overlap
    }

    return chunks
  }

  /**
   * Generate embeddings for text using OpenAI
   */
  static async generateEmbedding(text) {
    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
        dimensions: EMBEDDING_DIMENSIONS
      })

      return response.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw new Error(`Failed to generate embedding: ${error.message}`)
    }
  }

  /**
   * Process and store a knowledge source as vectors
   */
  static async processKnowledgeSource(agentId, sourceId, content, metadata = {}) {
    try {
      // Split content into chunks
      const chunks = this.splitIntoChunks(content)
      
      console.log(`Processing ${chunks.length} chunks for source ${sourceId}`)

      // Process chunks in batches to avoid rate limits
      const batchSize = 10
      const results = []

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize)
        
        // Generate embeddings for batch
        const embeddings = await Promise.all(
          batch.map(chunk => this.generateEmbedding(chunk))
        )

        // Store vectors in database
        const insertData = batch.map((chunk, idx) => ({
          agent_id: agentId,
          knowledge_source_id: sourceId,
          content: chunk,
          embedding: embeddings[idx],
          metadata: {
            ...metadata,
            chunk_index: i + idx,
            total_chunks: chunks.length
          }
        }))

        const { data, error } = await supabaseAdmin
          .from('knowledge_vectors')
          .insert(insertData)
          .select()

        if (error) {
          console.error('Error inserting vectors:', error)
          throw error
        }

        results.push(...(data || []))
      }

      return {
        success: true,
        vectorCount: results.length,
        chunkCount: chunks.length
      }
    } catch (error) {
      console.error('Error processing knowledge source:', error)
      throw error
    }
  }

  /**
   * Search for relevant knowledge using vector similarity
   */
  static async searchKnowledge(agentId, query, limit = 5, threshold = 0.7) {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query)

      // Perform vector similarity search using pgvector
      const { data, error } = await supabaseAdmin.rpc('search_knowledge_vectors', {
        p_agent_id: agentId,
        p_query_embedding: queryEmbedding,
        p_match_threshold: threshold,
        p_match_count: limit
      })

      if (error) {
        console.error('Error searching vectors:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in vector search:', error)
      throw error
    }
  }

  /**
   * Delete all vectors for a knowledge source
   */
  static async deleteKnowledgeSource(sourceId) {
    try {
      const { error } = await supabaseAdmin
        .from('knowledge_vectors')
        .delete()
        .eq('knowledge_source_id', sourceId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error deleting knowledge source vectors:', error)
      throw error
    }
  }

  /**
   * Update a knowledge source (delete old vectors and create new ones)
   */
  static async updateKnowledgeSource(agentId, sourceId, newContent, metadata = {}) {
    try {
      // Delete existing vectors
      await this.deleteKnowledgeSource(sourceId)

      // Process new content
      return await this.processKnowledgeSource(agentId, sourceId, newContent, metadata)
    } catch (error) {
      console.error('Error updating knowledge source:', error)
      throw error
    }
  }

  /**
   * Get statistics for an agent's knowledge base
   */
  static async getKnowledgeStats(agentId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('knowledge_vectors')
        .select('knowledge_source_id', { count: 'exact' })
        .eq('agent_id', agentId)

      if (error) throw error

      // Group by source
      const sourceStats = {}
      data?.forEach(row => {
        sourceStats[row.knowledge_source_id] = (sourceStats[row.knowledge_source_id] || 0) + 1
      })

      return {
        totalVectors: data?.length || 0,
        sourceCount: Object.keys(sourceStats).length,
        sourceStats
      }
    } catch (error) {
      console.error('Error getting knowledge stats:', error)
      throw error
    }
  }

  /**
   * Batch process multiple knowledge sources
   */
  static async batchProcessSources(agentId, sources) {
    const results = []
    
    for (const source of sources) {
      try {
        const result = await this.processKnowledgeSource(
          agentId,
          source.id,
          source.content,
          source.metadata
        )
        results.push({ sourceId: source.id, ...result })
      } catch (error) {
        results.push({ 
          sourceId: source.id, 
          success: false, 
          error: error.message 
        })
      }
    }

    return results
  }
}

export default VectorDB