import { IntegrationManager } from './integrations.js'
import { NodeExecutor } from './nodes.js'
import {
  getWorkflow,
  createWorkflowExecution,
  getWorkflowNodes,
  getWorkflowEdges,
  updateWorkflowExecution,
  incrementWorkflowExecutionCount,
  createWorkflowExecutionLog,
  updateWorkflowExecutionLog
} from '../../app/actions/agents.js'

export class WorkflowEngine {
  constructor() {
    this.integrationManager = new IntegrationManager()
    this.nodeExecutor = new NodeExecutor(this.integrationManager)
  }

  /**
   * Execute a workflow
   * @param {string} workflowId - Workflow ID
   * @param {object} triggerData - Data from trigger
   * @returns {Promise<object>} Execution result
   *
   *
   */

  async executeWorkflow(userId, workflowId, triggerData = {}) {
    const startTime = Date.now()
    let execution = null

    try {
      // Get workflow definition

      const workflow = await getWorkflow(workflowId, userId)

      if (!workflow) {
        throw new Error('Workflow not found')
      }

      if (!workflow.is_active) {
        throw new Error('Workflow is not active')
      }

      const agentId = workflow.agent_id

      if (!agentId) {
        throw new Error('Workflow has no agent assigned')
      }

      // Create execution record

      execution = await createWorkflowExecution({
        workflow_id: workflowId,
        trigger_data: triggerData,

        status: 'running'
      })

      // Get workflow nodes and edges
      const nodes = await getWorkflowNodes(workflowId)
      const edges = await getWorkflowEdges(workflowId)

      // Build execution graph
      const graph = this.buildGraph(nodes, edges)

      // Find trigger node
      const triggerNode = nodes.find((n) => n.node_type === 'trigger')
      if (!triggerNode) {
        throw new Error('No trigger node found in workflow')
      }

      // Execute workflow starting from trigger
      const context = {
        workflowId,
        executionId: execution.id,
        triggerData,
        variables: {}
      }

      const result = await this.executeNode(triggerNode, graph, context, userId)

      // Update execution record
      const executionTime = Date.now() - startTime
      await updateWorkflowExecution(execution.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        execution_time_ms: executionTime
      })

      // Update workflow stats
      await incrementWorkflowExecutionCount(workflowId)

      return {
        success: true,
        executionId: execution.id,
        result,
        executionTime
      }
    } catch (error) {
      console.error('Workflow execution error:', error)

      // Log error
      const executionTime = Date.now() - startTime

      try {
        if (execution?.id) {
          await updateWorkflowExecution(execution.id, {
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString(),
            execution_time_ms: executionTime
          })
        }
      } catch (logError) {
        console.error('Error logging workflow failure:', logError)
      }

      throw error
    }
  }

  /**
   * Build execution graph from nodes and edges
   */
  buildGraph(nodes, edges) {
    const graph = new Map()

    // Initialize all nodes
    nodes.forEach((node) => {
      graph.set(node.node_id, {
        node,
        next: []
      })
    })

    // Connect nodes based on edges
    edges.forEach((edge) => {
      const sourceNode = graph.get(edge.source_node_id)
      if (sourceNode) {
        sourceNode.next.push({
          targetNodeId: edge.target_node_id,
          condition: edge.condition
        })
      }
    })

    return graph
  }

  /**
   * Execute a single node
   */
  async executeNode(node, graph, context, userId) {
    const startTime = Date.now()
    let log = null
    try {
      // Log node execution start
      log = await createWorkflowExecutionLog({
        execution_id: context.executionId,
        node_id: node.node_id,
        node_name: node.node_name,
        status: 'running',
        input_data: context.variables
      })

      // Execute node based on type

      const output = await this.nodeExecutor.execute(node, context, userId)

      // Update context with node output
      context.variables[node.node_id] = output

      // Log node execution completion
      const executionTime = Date.now() - startTime
      await updateWorkflowExecutionLog(log.id, {
        status: 'completed',
        output_data: output,
        completed_at: new Date().toISOString(),
        execution_time_ms: executionTime
      })

      // Get next nodes
      const graphNode = graph.get(node.node_id)
      if (!graphNode || graphNode.next.length === 0) {
        return output
      }

      // Execute next nodes
      const nextResults = []
      for (const next of graphNode.next) {
        // Check condition if exists
        if (next.condition) {
          const conditionMet = this.evaluateCondition(
            next.condition,
            context.variables
          )
          if (!conditionMet) continue
        }

        const nextNode = graph.get(next.targetNodeId)?.node
        if (nextNode) {
          const result = await this.executeNode(
            nextNode,
            graph,
            context,
            userId
          )
          nextResults.push(result)
        }
      }

      return nextResults.length === 1 ? nextResults[0] : nextResults
    } catch (error) {
      const executionTime = Date.now() - startTime

      if (log?.id) {
        await updateWorkflowExecutionLog(log.id, {
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
          execution_time_ms: executionTime
        })
      } else {
        console.error('Node log not created, cannot update log:', error)
      }

      throw error
    }
  }

  /**
   * Evaluate condition for conditional branches
   */
  evaluateCondition(condition, variables) {
    try {
      const { field, operator, value } = condition

      const fieldValue = this.getNestedValue(variables, field)

      switch (operator) {
        case 'equals':
          return fieldValue === value
        case 'not_equals':
          return fieldValue !== value
        case 'contains':
          return String(fieldValue).includes(value)
        case 'greater_than':
          return Number(fieldValue) > Number(value)
        case 'less_than':
          return Number(fieldValue) < Number(value)
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null
        case 'not_exists':
          return fieldValue === undefined || fieldValue === null
        default:
          return true
      }
    } catch (error) {
      console.error('Condition evaluation error:', error)
      return false
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current?.[key]
    }, obj)
  }
}
