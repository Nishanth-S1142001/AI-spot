/**
 * AI-Enhanced Agent Parser using OpenAI
 * Uses AI to extract structured agent configuration
 */

export async function parseWithAI(description, apiKey) {
  const prompt = `You are an expert at extracting structured agent configurations from natural language descriptions.

Given the following user description, extract a complete agent configuration:

USER DESCRIPTION:
"${description}"

Extract the following information and respond ONLY with valid JSON (no markdown, no explanation):

{
  "name": "Agent name (extract from description or generate appropriate name)",
  "purpose": "Clear one-sentence purpose",
  "agentType": "customer_support|sales|content_writer|data_analyst|code_assistant|general_assistant",
  "model": "gpt-4o|gpt-4o-mini|gpt-4-turbo|gpt-3.5-turbo",
  "temperature": 0.5-0.9,
  "tone": "professional|friendly|technical|concise|balanced",
  "systemPrompt": "Detailed system prompt that captures the agent's personality and purpose",
  "maxTokens": 1000-3000,
  "features": ["array of features like web_search, email, scheduling, etc"],
  "tools": ["array of tools the agent needs"],
  "knowledgeSources": [
    {
      "type": "url|document|text",
      "name": "source name",
      "content": "url or content reference"
    }
  ],
  "integrations": ["array of third-party integrations like salesforce, slack, etc"],
  "responseFormat": "text|json|markdown",
  "constraints": ["any limitations or rules mentioned"],
  "examples": [
    {
      "input": "example user query",
      "output": "expected agent response"
    }
  ],
  "metadata": {
    "category": "support|sales|content|analytics|development|general",
    "targetAudience": "who will use this agent",
    "useCases": ["primary use cases"],
    "confidence": 0.0-1.0
  }
}

Be intelligent about filling in reasonable defaults for any missing information. Make the configuration production-ready.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'system',
          content: 'You are an expert at extracting structured data from natural language. Always respond with valid JSON only.'
        }, {
          role: 'user',
          content: prompt
        }],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    
    // Parse JSON response
    const config = JSON.parse(content)
    
    return {
      success: true,
      config,
      tokensUsed: data.usage.total_tokens,
      model: data.model
    }
    
  } catch (error) {
    console.error('AI parsing error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Validate and sanitize the AI-generated config
 */
export function validateAgentConfig(config) {
  const errors = []
  
  // Required fields
  if (!config.name || config.name.trim().length < 2) {
    errors.push('Agent name is required and must be at least 2 characters')
  }
  
  if (!config.purpose || config.purpose.trim().length < 10) {
    errors.push('Agent purpose must be at least 10 characters')
  }
  
  // Validate agentType
  const validTypes = ['customer_support', 'sales', 'content_writer', 'data_analyst', 'code_assistant', 'general_assistant']
  if (!validTypes.includes(config.agentType)) {
    errors.push(`Invalid agent type. Must be one of: ${validTypes.join(', ')}`)
  }
  
  // Validate model - UPDATED FOR OPENAI
  const validModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']
  if (!validModels.includes(config.model)) {
    config.model = 'gpt-4o' // Default to GPT-4o
  }
  
  // Validate temperature
  if (config.temperature < 0 || config.temperature > 1) {
    config.temperature = 0.7 // Default
  }
  
  // Validate maxTokens
  if (!config.maxTokens || config.maxTokens < 100 || config.maxTokens > 5000) {
    config.maxTokens = 1500 // Default
  }
  
  // Ensure arrays exist
  config.features = Array.isArray(config.features) ? config.features : []
  config.tools = Array.isArray(config.tools) ? config.tools : []
  config.knowledgeSources = Array.isArray(config.knowledgeSources) ? config.knowledgeSources : []
  config.integrations = Array.isArray(config.integrations) ? config.integrations : []
  config.constraints = Array.isArray(config.constraints) ? config.constraints : []
  config.examples = Array.isArray(config.examples) ? config.examples : []
  
  return {
    valid: errors.length === 0,
    errors,
    sanitizedConfig: config
  }
}