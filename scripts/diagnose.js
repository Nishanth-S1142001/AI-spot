/**
 * Simple Diagnostic Script
 * Helps identify why the test script isn't showing output
 */

console.log('🔍 Starting diagnostics...\n')

// Test 1: Basic console output
console.log('✅ Test 1: Console output works')

// Test 2: Environment variables
console.log('\n📋 Test 2: Environment Variables')
try {
  const dotenv = await import('dotenv')
  dotenv.config({ path: '.env.local' })
  
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY
  
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? '✅ Set' : '❌ Missing'}`)
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${hasSupabaseKey ? '✅ Set' : '❌ Missing'}`)
  console.log(`   OPENAI_API_KEY: ${hasOpenAIKey ? '✅ Set' : '❌ Missing'}`)
} catch (error) {
  console.log(`   ❌ Error loading environment: ${error.message}`)
}

// Test 3: Import Supabase
console.log('\n📦 Test 3: Import Supabase')
try {
  const { createClient } = await import('@supabase/supabase-js')
  console.log('   ✅ @supabase/supabase-js imported successfully')
  
  // Test 4: Create Supabase client
  console.log('\n🔌 Test 4: Create Supabase Client')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  console.log('   ✅ Supabase client created')
  
  // Test 5: Simple query
  console.log('\n🗄️  Test 5: Database Connection')
  console.log('   Attempting to connect to database...')
  
  const { data, error } = await supabase
    .from('agents')
    .select('count')
    .limit(1)
  
  if (error) {
    console.log(`   ⚠️  Query error: ${error.message}`)
    console.log(`   Error code: ${error.code}`)
  } else {
    console.log('   ✅ Database connection successful!')
  }
  
  // Test 6: Check knowledge_vectors table
  console.log('\n📊 Test 6: Check knowledge_vectors Table')
  const { data: vectors, error: vectorError } = await supabase
    .from('knowledge_vectors')
    .select('count')
    .limit(1)
  
  if (vectorError) {
    if (vectorError.code === 'PGRST116') {
      console.log('   ✅ Table exists (no rows yet)')
    } else {
      console.log(`   ❌ Error: ${vectorError.message}`)
    }
  } else {
    console.log('   ✅ Table exists and accessible')
  }
  
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`)
  console.log(`   Stack: ${error.stack}`)
}

console.log('\n✅ Diagnostics complete!')
console.log('\nIf you see this message, the script is working.')
console.log('Any errors above need to be fixed.\n')

process.exit(0)