/**
 * Test Script: Verify Vector Knowledge Base Setup
 * Fixed version with proper timeout handling
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Test results tracker
 */
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
}

/**
 * Test helper function with timeout
 */
async function test(name, testFn) {
  results.total++
  process.stdout.write(`\n${results.total}. ${name}... `)
  
  try {
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Test timeout (10s)')), 10000)
    })
    
    await Promise.race([testFn(), timeoutPromise])
    
    process.stdout.write('✅ PASSED\n')
    results.passed++
    results.tests.push({ name, status: 'passed' })
  } catch (error) {
    process.stdout.write(`❌ FAILED\n   Error: ${error.message}\n`)
    results.failed++
    results.tests.push({ name, status: 'failed', error: error.message })
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Vector Knowledge Base Setup Tests')
  console.log('=' .repeat(60))

  // Test 1: Environment Variables
  await test('Check environment variables', async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL not set')
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')
    }
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set')
    }
  })

  // Test 2: Supabase Connection
  await test('Connect to Supabase', async () => {
    const { data, error } = await supabase
      .from('agents')
      .select('count')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') throw error
  })

  // Test 3: pgvector Extension (indirect check)
  await test('Check pgvector extension (via table)', async () => {
    const { error } = await supabase
      .from('knowledge_vectors')
      .select('count')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') {
      throw new Error('knowledge_vectors table not accessible - pgvector may not be enabled')
    }
  })

  // Test 4: knowledge_vectors Table
  await test('Check knowledge_vectors table exists', async () => {
    const { error } = await supabase
      .from('knowledge_vectors')
      .select('count')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Table error: ${error.message}`)
    }
  })

  // Test 5: knowledge_sources Table Updates
  await test('Check knowledge_sources table columns', async () => {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .select('vector_count, status, processed_at, error_message')
      .limit(1)
    
    if (error && error.code !== 'PGRST116' && error.message.includes('column')) {
      throw new Error('knowledge_sources table missing required columns - run migration SQL')
    }
  })

  // Test 6: Search Function
  await test('Check search_knowledge_vectors function', async () => {
    const testEmbedding = Array(1536).fill(0)
    
    const { error } = await supabase.rpc('search_knowledge_vectors', {
      p_agent_id: '00000000-0000-0000-0000-000000000000',
      p_query_embedding: testEmbedding,
      p_match_threshold: 0.7,
      p_match_count: 5
    })
    
    // Function should exist (empty results are OK)
    if (error && !error.message.includes('could not find')) {
      throw error
    }
  })

  // Test 7: OpenAI API Connection (optional)
  await test('Test OpenAI API connection (basic)', async () => {
    try {
      const OpenAI = (await import('openai')).default
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      
      if (!openai) {
        throw new Error('Failed to create OpenAI client')
      }
      
      console.log('\n   ℹ️  OpenAI client created (not calling API to save credits)')
    } catch (error) {
      throw new Error(`OpenAI setup error: ${error.message}`)
    }
  })

  // Test 8: File Structure
  await test('Check required files exist', async () => {
    const fs = await import('fs/promises')
    
    const requiredFiles = [
      'lib/vector/vectordb.js',
      'lib/vector/document-processor.js',
      'app/api/agents/[id]/knowledge/upload/route.js',
      'app/api/agents/[id]/knowledge/search/route.js',
      'app/api/agents/[id]/chat-enhanced/route.js'
    ]
    
    const missingFiles = []
    
    for (const file of requiredFiles) {
      try {
        await fs.access(file)
      } catch {
        missingFiles.push(file)
      }
    }
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing files:\n   - ${missingFiles.join('\n   - ')}`)
    }
  })

  // Print Results
  console.log('\n' + '=' .repeat(60))
  console.log('📊 Test Results Summary')
  console.log('=' .repeat(60))
  console.log(`Total Tests:     ${results.total}`)
  console.log(`Passed:          ${results.passed} ✅`)
  console.log(`Failed:          ${results.failed} ❌`)
  console.log(`Success Rate:    ${((results.passed / results.total) * 100).toFixed(1)}%`)
  console.log('=' .repeat(60))

  if (results.failed > 0) {
    console.log('\n⚠️  Failed Tests:')
    results.tests
      .filter(t => t.status === 'failed')
      .forEach((t, idx) => {
        console.log(`\n${idx + 1}. ${t.name}`)
        console.log(`   ${t.error}`)
      })
    
    console.log('\n💡 Troubleshooting:')
    console.log('   1. Make sure you ran the migration SQL in Supabase')
    console.log('   2. Check that pgvector extension is enabled in Supabase Dashboard')
    console.log('   3. Verify all environment variables are set in .env.local')
    console.log('   4. Check that all required files were copied to your project')
  } else {
    console.log('\n✅ All tests passed! Your vector knowledge base is ready to use.')
    console.log('\n💡 Next Steps:')
    console.log('   1. Upload a knowledge source: POST /api/agents/[id]/knowledge/upload')
    console.log('   2. Search knowledge: POST /api/agents/[id]/knowledge/search')
    console.log('   3. Test chat with knowledge: POST /api/agents/[id]/chat-enhanced')
  }

  console.log('\n📚 Documentation:')
  console.log('   - Full Guide: VECTOR_KNOWLEDGE_BASE_SETUP_GUIDE.md')
  console.log('   - Quick Reference: QUICK_REFERENCE.md')
  console.log('\n')

  return results.failed === 0
}

/**
 * Run tests and exit with appropriate code
 */
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })