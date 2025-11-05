/**
 * NLP Agent Parser
 * Extracts agent configuration from natural language input
 */

const AGENT_PATTERNS = {
  // Agent type detection
  customerSupport: /customer support|help desk|support bot|customer service|ticket/i,
  sales: /sales|lead qualification|crm|prospect|deal|revenue/i,
  contentWriter: /content writer|blog|article|copywriting|content creation/i,
  dataAnalyst: /data analyst|analytics|insights|metrics|dashboard|reporting/i,
  codeAssistant: /code|programming|developer|debug|engineer|software/i,
  
  // Features
  search: /search|find|lookup|query/i,
  email: /email|send email|notify via email/i,
  scheduling: /schedule|calendar|appointment|booking/i,
  crm: /crm|salesforce|hubspot/i,
  database: /database|sql|query database/i,
  api: /api|integrate|webhook|third-party/i,
  
  // Tone
  professional: /professional|formal|business/i,
  friendly: /friendly|casual|warm|approachable/i,
  technical: /technical|expert|detailed/i,
  concise: /concise|brief|short|quick/i,
  
  // Model preferences - UPDATED FOR OPENAI
  fast: /fast|quick|speed|real-time/i,
  smart: /smart|intelligent|advanced|complex/i,
  balanced: /balanced|moderate|standard/i,
  costEffective: /cheap|affordable|cost-effective|budget/i
}

export class AgentParser {
  constructor() {
    this.extractedData = {}
  }

  /**
   * Main parsing method
   */
  parse(input) {
    const normalized = input.toLowerCase().trim()
    
    return {
      agentType: this.detectAgentType(normalized),
      name: this.extractName(input, normalized),
      purpose: this.extractPurpose(input),
      features: this.detectFeatures(normalized),
      tone: this.detectTone(normalized),
      model: this.selectModel(normalized),
      temperature: this.selectTemperature(normalized),
      systemPrompt: this.generateSystemPrompt(input),
      tools: this.detectTools(normalized),
      knowledgeSources: this.extractKnowledgeSources(input),
      integrations: this.detectIntegrations(normalized),
      metadata: {
        confidence: this.calculateConfidence(),
        rawInput: input,
        parsedAt: new Date().toISOString()
      }
    }
  }

  detectAgentType(input) {
    const types = []
    
    if (AGENT_PATTERNS.customerSupport.test(input)) types.push('customer_support')
    if (AGENT_PATTERNS.sales.test(input)) types.push('sales')
    if (AGENT_PATTERNS.contentWriter.test(input)) types.push('content_writer')
    if (AGENT_PATTERNS.dataAnalyst.test(input)) types.push('data_analyst')
    if (AGENT_PATTERNS.codeAssistant.test(input)) types.push('code_assistant')
    
    return types.length > 0 ? types[0] : 'general_assistant'
  }

  extractName(original, normalized) {
    // Look for "called/named X" patterns
    const namedMatch = original.match(/(?:called|named|name it|call it)\s+["']?([^"'\n,]+)["']?/i)
    if (namedMatch) return namedMatch[1].trim()
    
    // Look for "a X agent" patterns
    const typeMatch = original.match(/(?:a|an)\s+([^,\.]+?)\s+(?:agent|bot|assistant)/i)
    if (typeMatch) return this.titleCase(typeMatch[1].trim())
    
    // Generate from type
    const type = this.detectAgentType(normalized)
    const typeNames = {
      customer_support: 'Support Assistant',
      sales: 'Sales Agent',
      content_writer: 'Content Writer',
      data_analyst: 'Data Analyst',
      code_assistant: 'Code Assistant',
      general_assistant: 'AI Assistant'
    }
    
    return typeNames[type] || 'My Agent'
  }

  extractPurpose(input) {
    // Look for "that/to/for" patterns
    const patterns = [
      /(?:that|to|for)\s+([^\.]+)/i,
      /(?:helps?|assists?|handles?)\s+(?:with\s+)?([^\.]+)/i,
      /(?:purpose|goal|objective)(?:\s+is)?:\s*([^\.]+)/i
    ]
    
    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) return match[1].trim()
    }
    
    return 'Assist users with their requests'
  }

  detectFeatures(input) {
    const features = []
    
    if (AGENT_PATTERNS.search.test(input)) features.push('web_search')
    if (AGENT_PATTERNS.email.test(input)) features.push('email_notifications')
    if (AGENT_PATTERNS.scheduling.test(input)) features.push('scheduling')
    if (AGENT_PATTERNS.crm.test(input)) features.push('crm_integration')
    if (AGENT_PATTERNS.database.test(input)) features.push('database_access')
    if (AGENT_PATTERNS.api.test(input)) features.push('api_integrations')
    
    return features
  }

  detectTone(input) {
    if (AGENT_PATTERNS.professional.test(input)) return 'professional'
    if (AGENT_PATTERNS.friendly.test(input)) return 'friendly'
    if (AGENT_PATTERNS.technical.test(input)) return 'technical'
    if (AGENT_PATTERNS.concise.test(input)) return 'concise'
    
    return 'balanced'
  }

  selectModel(input) {
    // UPDATED: Select OpenAI models based on requirements
    if (AGENT_PATTERNS.costEffective.test(input)) return 'gpt-4o-mini'
    if (AGENT_PATTERNS.fast.test(input)) return 'gpt-4o-mini'
    if (AGENT_PATTERNS.smart.test(input)) return 'gpt-4o'
    
    // Default to GPT-4o for best quality
    return 'gpt-4o'
  }

  selectTemperature(input) {
    const toneMap = {
      professional: 0.6,
      friendly: 0.8,
      technical: 0.5,
      concise: 0.5,
      balanced: 0.7
    }
    
    const tone = this.detectTone(input)
    return toneMap[tone] || 0.7
  }

  generateSystemPrompt(input) {
    const tone = this.detectTone(input)
    const purpose = this.extractPurpose(input)
    
    const toneDescriptions = {
      professional: 'professional and courteous',
      friendly: 'friendly and approachable',
      technical: 'technical and precise',
      concise: 'concise and to-the-point',
      balanced: 'helpful and balanced'
    }
    
    const toneDesc = toneDescriptions[tone] || 'helpful'
    
    return `You are a ${toneDesc} AI assistant. Your purpose is to ${purpose}. Provide accurate, helpful responses while maintaining this tone and focusing on your core purpose.`
  }

  detectTools(input) {
    const tools = []
    
    if (AGENT_PATTERNS.search.test(input)) tools.push('web_search')
    if (AGENT_PATTERNS.email.test(input)) tools.push('email')
    if (AGENT_PATTERNS.scheduling.test(input)) tools.push('calendar')
    if (AGENT_PATTERNS.database.test(input)) tools.push('database')
    if (AGENT_PATTERNS.codeAssistant.test(input)) tools.push('code_execution')
    
    return tools
  }

  extractKnowledgeSources(input) {
    const sources = []
    
    // Look for URL patterns
    const urlPattern = /https?:\/\/[^\s]+/gi
    const urls = input.match(urlPattern)
    if (urls) {
      urls.forEach(url => {
        sources.push({
          type: 'url',
          content: url,
          name: new URL(url).hostname
        })
      })
    }
    
    // Look for document mentions
    const docPatterns = [
      /documents?\s+(?:from|in|at)\s+([^,\.]+)/i,
      /knowledge\s+(?:from|in)\s+([^,\.]+)/i,
      /trained\s+on\s+([^,\.]+)/i
    ]
    
    for (const pattern of docPatterns) {
      const match = input.match(pattern)
      if (match) {
        sources.push({
          type: 'document',
          content: match[1].trim(),
          name: match[1].trim()
        })
      }
    }
    
    return sources
  }

  detectIntegrations(input) {
    const integrations = []
    
    const integrationMap = {
      salesforce: /salesforce/i,
      hubspot: /hubspot/i,
      slack: /slack/i,
      gmail: /gmail|google mail/i,
      calendar: /google calendar|calendar/i,
      sheets: /google sheets|spreadsheet/i,
      notion: /notion/i,
      airtable: /airtable/i,
      zapier: /zapier/i
    }
    
    for (const [name, pattern] of Object.entries(integrationMap)) {
      if (pattern.test(input)) {
        integrations.push(name)
      }
    }
    
    return integrations
  }

  calculateConfidence() {
    // Simple confidence calculation based on extracted fields
    let score = 0
    const data = this.extractedData
    
    if (data.name && data.name !== 'My Agent') score += 20
    if (data.purpose && data.purpose.length > 10) score += 30
    if (data.features && data.features.length > 0) score += 20
    if (data.tools && data.tools.length > 0) score += 15
    if (data.knowledgeSources && data.knowledgeSources.length > 0) score += 15
    
    return Math.min(score, 100) / 100
  }

  titleCase(str) {
    return str.replace(/\w\S*/g, txt => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }
}

// Helper function to use the parser
export function parseAgentDescription(description) {
  const parser = new AgentParser()
  return parser.parse(description)
}