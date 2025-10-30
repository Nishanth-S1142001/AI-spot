// lib/api/validation-schemas.js
import { z } from 'zod'

/**
 * Workflow validation schemas
 */
export const workflowSchemas = {
  // Create workflow
  create: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    trigger_type: z.enum(['manual', 'webhook', 'schedule']),
    trigger_config: z.record(z.any()).optional(),
    workflow_data: z.record(z.any()).optional(),
    settings: z.record(z.any()).optional()
  }),

  // Update workflow
  update: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    trigger_type: z.enum(['manual', 'webhook', 'schedule']).optional(),
    trigger_config: z.record(z.any()).optional(),
    workflow_data: z.record(z.any()).optional(),
    settings: z.record(z.any()).optional(),
    is_active: z.boolean().optional(),
    status: z.enum(['draft', 'active', 'paused']).optional()
  }),

  // Save workflow (nodes and edges)
  save: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        type: z.string(),
        position: z.object({
          x: z.number(),
          y: z.number()
        }),
        data: z.object({
          label: z.string().optional(),
          config: z.any().optional()
        })
      })
    ),
    edges: z.array(
      z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
        data: z
          .object({
            condition: z.string().optional()
          })
          .optional()
      })
    ),
    workflow_data: z.any().optional(),
    is_active: z.boolean().optional(),
    agent_id: z.string().optional()
  }),

  // Schedule workflow
  schedule: z.object({
    cron_expression: z.string().min(1, 'Cron expression is required'),
    timezone: z.string().default('UTC'),
    is_active: z.boolean().default(true)
  }),

  // Execute workflow
  execute: z.object({
    triggerData: z.record(z.any()).optional()
  })
}

/**
 * Query parameter validation schemas
 */
export const querySchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50)
  }),

  // Workflow list filters
  workflowFilters: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
    status: z.enum(['active', 'draft', 'paused']).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['created_at', 'updated_at', 'name']).default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),

  // Execution filters
  executionFilters: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
    status: z.enum(['queued', 'running', 'completed', 'failed']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  })
}

/**
 * Validate request body
 */
export async function validateBody(request, schema) {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      )
    }
    throw error
  }
}

/**
 * Validate query parameters
 */
export function validateQuery(url, schema) {
  try {
    const { searchParams } = new URL(url)
    const params = Object.fromEntries(searchParams.entries())
    return schema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid query parameters: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      )
    }
    throw error
  }
}

/**
 * Usage example:
 * 
 * import { workflowSchemas, validateBody } from '@/lib/api/validation-schemas'
 * 
 * export async function POST(request) {
 *   try {
 *     const data = await validateBody(request, workflowSchemas.create)
 *     // data is now validated and typed
 *     return NextResponse.json({ success: true })
 *   } catch (error) {
 *     return NextResponse.json({ error: error.message }, { status: 400 })
 *   }
 * }
 */