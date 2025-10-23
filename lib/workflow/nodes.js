export class NodeExecutor {
  constructor(integrationManager) {
    this.integrationManager = integrationManager
  }

  async execute(node, context, userId) {
    const { node_type, config } = node

    switch (node_type) {
      case 'trigger':
        return this.executeTrigger(config, context)

      case 'ai_agent':
        return this.executeAIAgent(config, context, userId)

      case 'api_call':
        return this.executeAPICall(config, context)

      case 'condition':
        return this.executeCondition(config, context)

      case 'loop':
        return this.executeLoop(config, context)

      case 'delay':
        return this.executeDelay(config, context)

      case 'transform':
        return this.executeTransform(config, context)

      case 'integration':
        return this.executeIntegration(config, context)

      case 'webhook_response':
        return this.executeWebhookResponse(config, context)

      default:
        throw new Error(`Unknown node type: ${node_type}`)
    }
  }

  /**
   * Execute trigger node
   */
  async executeTrigger(config, context) {
    return context.triggerData
  }

  /**
   * Execute AI agent node
   */
  async executeAIAgent(config, context, userId) {
    const { agentId, message, sessionId } = config

    if (!agentId) throw new Error('AI agent ID is required')
    // Replace variables in message
    const processedMessage = this.replaceVariables(message, context.variables)

    // Call AI agent
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/agents/${agentId}/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: processedMessage,
          sessionId: sessionId || `workflow-${context.executionId}`,
          userId
        })
      }
    )

    if (!response.ok) {
      throw new Error('AI agent call failed')
    }

    const data = await response.json()

    return {
      response: data.response,
      tokensUsed: data.tokensUsed
    }
  }

  /**
   * Execute API call node
   */
  async executeAPICall(config, context) {
    const { method, url, headers, body, responseType } = config

    // Replace variables in URL, headers, and body
    const processedUrl = this.replaceVariables(url, context.variables)
    const processedHeaders = this.replaceVariablesInObject(
      headers,
      context.variables
    )
    const processedBody = this.replaceVariablesInObject(body, context.variables)

    const response = await fetch(processedUrl, {
      method: method || 'GET',
      headers: processedHeaders,
      body: method !== 'GET' ? JSON.stringify(processedBody) : undefined
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    if (responseType === 'json') {
      return await response.json()
    } else if (responseType === 'text') {
      return await response.text()
    } else {
      return { status: response.status, statusText: response.statusText }
    }
  }

  /**
   * Execute condition node
   */
  async executeCondition(config, context) {
    const { conditions } = config

    // Evaluate all conditions
    const results = conditions.map((condition) => {
      const { field, operator, value } = condition
      const fieldValue = this.getNestedValue(context.variables, field)

      // Evaluation logic similar to engine
      return this.evaluateCondition(fieldValue, operator, value)
    })

    return {
      result: results.every((r) => r),
      conditions: results
    }
  }

  /**
   * Execute loop node
   */
  async executeLoop(config, context) {
    const { arrayPath, itemVariable } = config

    const array = this.getNestedValue(context.variables, arrayPath)

    if (!Array.isArray(array)) {
      throw new Error('Loop target is not an array')
    }

    const results = []
    for (let i = 0; i < array.length; i++) {
      context.variables[itemVariable] = array[i]
      context.variables[`${itemVariable}_index`] = i
      results.push(array[i])
    }

    return {
      count: array.length,
      results
    }
  }

  /**
   * Execute delay node
   */
  async executeDelay(config, context) {
    const { delayMs } = config

    await new Promise((resolve) => setTimeout(resolve, delayMs))

    return {
      delayed: delayMs
    }
  }

  /**
   * Execute transform node
   */
  async executeTransform(config, context) {
    const { mappings } = config

    const result = {}

    for (const [key, sourcePath] of Object.entries(mappings)) {
      result[key] = this.getNestedValue(context.variables, sourcePath)
    }

    return result
  }

  /**
   * Execute integration node
   */
  async executeIntegration(config, context) {
    const { integrationType, action, parameters } = config

    // Process parameters with variables
    const processedParams = this.replaceVariablesInObject(
      parameters,
      context.variables
    )

    // Execute integration
    return await this.integrationManager.execute(
      integrationType,
      action,
      processedParams
    )
  }

  /**
   * Execute webhook response node
   */
  async executeWebhookResponse(config, context) {
    const { responseData } = config

    return this.replaceVariablesInObject(responseData, context.variables)
  }

  /**
   * Replace variables in string
   */
  replaceVariables(str, variables) {
    if (typeof str !== 'string') return str

    return str.replace(/\{\{(.+?)\}\}/g, (match, path) => {
      const value = this.getNestedValue(variables, path.trim())
      return value !== undefined ? value : match
    })
  }

  /**
   * Replace variables in object
   */
  replaceVariablesInObject(obj, variables) {
    if (typeof obj !== 'object' || obj === null) {
      return this.replaceVariables(obj, variables)
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.replaceVariablesInObject(item, variables))
    }

    const result = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = this.replaceVariablesInObject(value, variables)
    }
    return result
  }

  /**
   * Get nested value from object
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current?.[key]
    }, obj)
  }

  /**
   * Evaluate condition
   */
  evaluateCondition(fieldValue, operator, value) {
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
        console.warn(`Unknown operator "${operator}" in condition evaluation`)
        return false // or true, depending on how you want fallback to behave
    }
  }
}
