// ============================================
// scripts/start-task-queue.js
// Script to start the task queue processor
// ===========================================

// Run this with: node scripts/start-task-queue.js

import 'dotenv/config'
import { TaskQueueProcessor } from '../lib/workflow/task-queue.js'


const processor = new TaskQueueProcessor()

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down task queue processor...')
  processor.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\nShutting down task queue processor...')
  processor.stop()
  process.exit(0)
})

// Start the processor
processor.start()

console.log('Task queue processor is running. Press Ctrl+C to stop.')
