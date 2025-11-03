/**
 * Migration Script: Convert Existing Knowledge to Vectors
 * 
 * This script helps migrate your existing knowledge base to the new vector system.
 * Run this script after setting up the vector database.
 * 
 * Usage:
 *   node scripts/migrate-knowledge-to-vectors.js
 * 
 * Or add to package.json:
 *   "scripts": {
 *     "migrate:knowledge": "node scripts/migrate-knowledge-to-vectors.js"
 *   }
 */

import { createClient } from '@supabase/supabase-js'
import { VectorDB } from '../lib/vector/vectordb.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Migration Statistics
 */
const stats = {
  totalAgents: 0,
  totalSources: 0,
  successfulMigrations: 0,
  failedMigrations: 0,
  totalVectorsCreated: 0,
  errors: []
}

/**
 * Migrate a single knowledge source to vectors
 */
async function migrateKnowledgeSource(agentId, source) {
  try {
    console.log(`  📄 Migrating: ${source.name} (${source.type})`)
    
    // Skip if already migrated (has vector_count > 0)
    if (source.vector_count && source.vector_count > 0) {
      console.log(`  ⏭️  Already migrated (${source.vector_count} vectors)`)
      return { skipped: true }
    }

    // Skip if no content
    if (!source.content || source.content.trim().length === 0) {
      console.log(`  ⚠️  Skipping - no content`)
      return { skipped: true, reason: 'no_content' }
    }

    // Update status to processing
    await supabase
      .from('knowledge_sources')
      .update({ status: 'processing' })
      .eq('id', source.id)

    // Process and create vectors
    const result = await VectorDB.processKnowledgeSource(
      agentId,
      source.id,
      source.content,
      source.metadata || {}
    )

    // Update knowledge source with vector count
    await supabase
      .from('knowledge_sources')
      .update({
        status: 'completed',
        vector_count: result.vectorCount,
        processed_at: new Date().toISOString()
      })
      .eq('id', source.id)

    console.log(`  ✅ Success! Created ${result.vectorCount} vectors`)
    
    stats.successfulMigrations++
    stats.totalVectorsCreated += result.vectorCount

    return { 
      success: true, 
      vectorCount: result.vectorCount 
    }

  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`)
    
    // Update status to failed
    await supabase
      .from('knowledge_sources')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', source.id)

    stats.failedMigrations++
    stats.errors.push({
      sourceId: source.id,
      sourceName: source.name,
      error: error.message
    })

    return { 
      success: false, 
      error: error.message 
    }
  }
}

/**
 * Migrate all knowledge sources for an agent
 */
async function migrateAgentKnowledge(agentId, agentName) {
  console.log(`\n🤖 Migrating Agent: ${agentName || agentId}`)
  
  // Get all knowledge sources for this agent
  const { data: sources, error } = await supabase
    .from('knowledge_sources')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error(`  ❌ Error fetching sources: ${error.message}`)
    return
  }

  if (!sources || sources.length === 0) {
    console.log(`  ℹ️  No knowledge sources found`)
    return
  }

  console.log(`  📊 Found ${sources.length} knowledge source(s)`)
  stats.totalSources += sources.length

  // Migrate each source
  for (const source of sources) {
    await migrateKnowledgeSource(agentId, source)
  }
}

/**
 * Main migration function
 */
async function migrateAllKnowledge() {
  console.log('🚀 Starting Knowledge Base Migration to Vectors\n')
  console.log('=' .repeat(60))

  try {
    // Get all agents
    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, name')
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch agents: ${error.message}`)
    }

    if (!agents || agents.length === 0) {
      console.log('ℹ️  No agents found in the database')
      return
    }

    stats.totalAgents = agents.length
    console.log(`📊 Found ${agents.length} agent(s) to process\n`)

    // Migrate each agent's knowledge
    for (const agent of agents) {
      await migrateAgentKnowledge(agent.id, agent.name)
    }

  } catch (error) {
    console.error(`\n❌ Migration failed: ${error.message}`)
    stats.errors.push({
      general: error.message
    })
  }

  // Print summary
  console.log('\n' + '=' .repeat(60))
  console.log('📊 Migration Summary')
  console.log('=' .repeat(60))
  console.log(`Total Agents Processed:     ${stats.totalAgents}`)
  console.log(`Total Sources Processed:    ${stats.totalSources}`)
  console.log(`Successful Migrations:      ${stats.successfulMigrations}`)
  console.log(`Failed Migrations:          ${stats.failedMigrations}`)
  console.log(`Total Vectors Created:      ${stats.totalVectorsCreated}`)
  console.log('=' .repeat(60))

  if (stats.errors.length > 0) {
    console.log('\n⚠️  Errors:')
    stats.errors.forEach((err, idx) => {
      console.log(`\n${idx + 1}. ${err.sourceName || 'General Error'}`)
      console.log(`   ${err.error || err.general}`)
    })
  }

  if (stats.failedMigrations === 0 && stats.successfulMigrations > 0) {
    console.log('\n✅ Migration completed successfully!')
  } else if (stats.failedMigrations > 0) {
    console.log('\n⚠️  Migration completed with some errors')
    console.log('   Check the error list above for details')
  }

  console.log('\n💡 Next Steps:')
  console.log('   1. Review migration statistics above')
  console.log('   2. Check Supabase for created vectors')
  console.log('   3. Test vector search with some queries')
  console.log('   4. Update your frontend to use the new endpoints')
  console.log('\n')
}

/**
 * Run migration with error handling
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.clear()
  
  migrateAllKnowledge()
    .then(() => {
      console.log('Migration process completed.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error)
      process.exit(1)
    })
}

export { migrateAllKnowledge, migrateAgentKnowledge, migrateKnowledgeSource }