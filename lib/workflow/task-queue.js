import {
  getNextPendingTask,
  markTaskProcessing,
  markTaskCompleted,
  markTaskFailed,
  getDueSchedules,
  updateWorkflowSchedule
} from '../../app/actions/agents.js'
import { WorkflowEngine } from './engine.js'
import cronParser from 'cron-parser'

export class TaskQueueProcessor {
  constructor() {
    this.isRunning = false
    this.workflowEngine = new WorkflowEngine()
    this.pollInterval = 5000 // 5 seconds
  }

  /**
   * Start the task queue processor
   */
  start() {
    if (this.isRunning) {
      console.log('Task queue processor already running')
      return
    }

    this.isRunning = true
    console.log('Task queue processor started')

    // Start polling for tasks
    this.processTasks()

    // Start polling for scheduled workflows
    this.processScheduledWorkflows()
  }

  /**
   * Stop the task queue processor
   */
  stop() {
    this.isRunning = false
    console.log('Task queue processor stopped')
  }

  /**
   * Process pending tasks
   */
  async processTasks() {
    while (this.isRunning) {
      try {
        const task = await getNextPendingTask()

        if (task) {
          await this.processTask(task)
        } else {
          // No tasks, wait before checking again
          await this.sleep(this.pollInterval)
        }
      } catch (error) {
        console.error('Error processing tasks:', error)
        await this.sleep(this.pollInterval)
      }
    }
  }

  /**
   * Process a single task
   */
  async processTask(task) {
    console.log(`Processing task ${task.id} (${task.task_type})`)

    try {
      // Mark task as processing
      await markTaskProcessing(task.id)

      // Execute task based on type
      switch (task.task_type) {
        case 'execute_workflow':
          await this.executeWorkflowTask(task)
          break

        case 'send_webhook':
          await this.sendWebhookTask(task)
          break

        case 'cleanup_logs':
          await this.cleanupLogsTask(task)
          break

        default:
          throw new Error(`Unknown task type: ${task.task_type}`)
      }

      // Mark task as completed
      await markTaskCompleted(task.id)
      console.log(`Task ${task.id} completed`)
    } catch (error) {
      console.error(`Task ${task.id} failed:`, error)
      await markTaskFailed(task.id, error.message)
    }
  }

  /**
   * Execute workflow task
   */
  async executeWorkflowTask(task) {
    const { workflowId, triggerData } = task.payload

    await this.workflowEngine.executeWorkflow(workflowId, triggerData)
  }

  /**
   * Send webhook task
   */
  async sendWebhookTask(task) {
    const { url, method, headers, body } = task.payload

    const response = await fetch(url, {
      method: method || 'POST',
      headers: headers || { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`)
    }
  }

  /**
   * Cleanup old logs task
   */
  async cleanupLogsTask(task) {
    const { daysOld } = task.payload
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    // Cleanup old execution logs (implement based on your needs)
    console.log(`Cleaning up logs older than ${daysOld} days`)
  }

  /**
   * Process scheduled workflows
   */
  async processScheduledWorkflows() {
    while (this.isRunning) {
      try {
        const dueSchedules = await getDueSchedules()

        for (const schedule of dueSchedules) {
          await this.processSchedule(schedule)
        }

        // Check every minute
        await this.sleep(60000)
      } catch (error) {
        console.error('Error processing scheduled workflows:', error)
        await this.sleep(60000)
      }
    }
  }

  /**
   * Process a single schedule
   */
  async processSchedule(schedule) {
    const { parseExpression } = cronParser
    try {
      console.log(`Executing scheduled workflow ${schedule.workflow_id}`)

      // Create task to execute workflow
      await createTask({
        task_type: 'execute_workflow',
        payload: {
          workflowId: schedule.workflow_id,
          triggerData: {
            trigger_type: 'schedule',
            scheduled_at: schedule.next_run_at
          }
        },
        priority: 5
      })

      // Calculate next run time
      const interval = parseExpression(schedule.cron_expression, {
        currentDate: new Date(),
        tz: schedule.timezone
      })
      const nextRun = interval.next().toDate()

      // Update schedule
      await updateWorkflowSchedule(schedule.id, {
        last_run_at: new Date().toISOString(),
        next_run_at: nextRun.toISOString()
      })
    } catch (error) {
      console.error(`Error processing schedule ${schedule.id}:`, error)
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
