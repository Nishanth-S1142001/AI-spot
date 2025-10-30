# NLP-Based Agent Creation System - Complete Implementation

## 🎯 Overview
This system allows users to create AI agents using natural language descriptions. The system parses the description, extracts agent configurations, and automatically creates the agent with appropriate settings.

---

## 📦 STEP 1: Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- ============================================
-- NLP AGENT CREATION SYSTEM - Database Schema
-- ============================================

-- Table: nlp_agent_requests
-- Stores all natural language requests for agent creation
CREATE TABLE IF NOT EXISTS public.nlp_agent_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Request data
  raw_input TEXT NOT NULL,
  parsed_intent JSONB,
  extracted_config JSONB,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Created agent reference
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  -- Metadata
  processing_time_ms INTEGER,
  model_used TEXT DEFAULT 'claude-sonnet-4-5'
);

-- Table: nlp_parsing_history
-- Stores the parsing history and refinements
CREATE TABLE IF NOT EXISTS public.nlp_parsing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.nlp_agent_requests(id) ON DELETE CASCADE,
  
  -- Parsing stages
  stage TEXT NOT NULL CHECK (stage IN ('intent_extraction', 'config_generation', 'validation', 'refinement')),
  input_text TEXT NOT NULL,
  output_data JSONB,
  
  -- Model details
  model_used TEXT,
  tokens_used INTEGER,
  confidence_score DECIMAL(3,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: agent_templates
-- Pre-defined templates for common agent types
CREATE TABLE IF NOT EXISTS public.agent_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Template info
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  
  -- Template configuration
  default_config JSONB NOT NULL,
  required_fields TEXT[],
  optional_fields TEXT[],
  
  -- NLP matching
  keywords TEXT[],
  example_prompts TEXT[],
  
  -- Usage stats
  usage_count INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: nlp_feedback
-- User feedback on generated agents
CREATE TABLE IF NOT EXISTS public.nlp_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.nlp_agent_requests(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  
  -- Feedback data
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  accuracy_score INTEGER CHECK (accuracy_score >= 1 AND accuracy_score <= 5),
  feedback_text TEXT,
  
  -- What was wrong/right
  correctly_extracted TEXT[],
  incorrectly_extracted TEXT[],
  missing_features TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_nlp_requests_user ON public.nlp_agent_requests(user_id);
CREATE INDEX idx_nlp_requests_status ON public.nlp_agent_requests(status);
CREATE INDEX idx_nlp_requests_created ON public.nlp_agent_requests(created_at DESC);
CREATE INDEX idx_nlp_parsing_history_request ON public.nlp_parsing_history(request_id);
CREATE INDEX idx_agent_templates_category ON public.agent_templates(category);
CREATE INDEX idx_nlp_feedback_request ON public.nlp_feedback(request_id);

-- RLS Policies
ALTER TABLE public.nlp_agent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nlp_parsing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nlp_feedback ENABLE ROW LEVEL SECURITY;

-- NLP Requests Policies
CREATE POLICY "Users can view own NLP requests"
  ON public.nlp_agent_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create NLP requests"
  ON public.nlp_agent_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own NLP requests"
  ON public.nlp_agent_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Parsing History Policies
CREATE POLICY "Users can view own parsing history"
  ON public.nlp_parsing_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nlp_agent_requests
      WHERE id = nlp_parsing_history.request_id
      AND user_id = auth.uid()
    )
  );

-- Templates Policies (Public read, admin write)
CREATE POLICY "Anyone can view active templates"
  ON public.agent_templates FOR SELECT
  USING (is_active = true);

-- Feedback Policies
CREATE POLICY "Users can view own feedback"
  ON public.nlp_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback"
  ON public.nlp_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert default templates
INSERT INTO public.agent_templates (name, description, category, default_config, required_fields, optional_fields, keywords, example_prompts) VALUES
(
  'Customer Support Bot',
  'Handles customer inquiries and support tickets',
  'customer_service',
  '{
    "model": "claude-sonnet-4",
    "temperature": 0.7,
    "system_prompt": "You are a helpful customer support assistant.",
    "max_tokens": 1000,
    "tools": ["search", "email"]
  }'::jsonb,
  ARRAY['name', 'purpose'],
  ARRAY['knowledge_sources', 'integrations', 'tone'],
  ARRAY['customer', 'support', 'help', 'service', 'ticket', 'inquiry'],
  ARRAY[
    'Create a customer support bot that handles inquiries',
    'I need an agent to help customers with their questions',
    'Build a support assistant for my website'
  ]
),
(
  'Sales Assistant',
  'Helps with sales inquiries and lead qualification',
  'sales',
  '{
    "model": "claude-sonnet-4",
    "temperature": 0.8,
    "system_prompt": "You are a friendly sales assistant.",
    "max_tokens": 1200,
    "tools": ["crm", "calendar"]
  }'::jsonb,
  ARRAY['name', 'purpose'],
  ARRAY['knowledge_sources', 'crm_integration', 'tone'],
  ARRAY['sales', 'leads', 'qualify', 'prospect', 'deal', 'revenue'],
  ARRAY[
    'Create a sales bot that qualifies leads',
    'I need an agent to help with sales inquiries',
    'Build a sales assistant that books demos'
  ]
),
(
  'Content Writer',
  'Generates blog posts, articles, and marketing content',
  'content_creation',
  '{
    "model": "claude-sonnet-4",
    "temperature": 0.9,
    "system_prompt": "You are a creative content writer.",
    "max_tokens": 2000,
    "tools": ["web_search", "research"]
  }'::jsonb,
  ARRAY['name', 'content_type'],
  ARRAY['tone', 'style', 'target_audience', 'topics'],
  ARRAY['content', 'writer', 'blog', 'article', 'write', 'create'],
  ARRAY[
    'Create a content writer that generates blog posts',
    'I need an agent to write articles about tech',
    'Build a creative writer for marketing content'
  ]
),
(
  'Data Analyst',
  'Analyzes data and generates insights',
  'analytics',
  '{
    "model": "claude-sonnet-4",
    "temperature": 0.5,
    "system_prompt": "You are a data analyst expert.",
    "max_tokens": 1500,
    "tools": ["python", "data_analysis", "visualization"]
  }'::jsonb,
  ARRAY['name', 'data_type'],
  ARRAY['analysis_type', 'visualizations', 'reporting_frequency'],
  ARRAY['data', 'analyst', 'analyze', 'insights', 'metrics', 'dashboard'],
  ARRAY[
    'Create a data analyst that generates insights',
    'I need an agent to analyze sales data',
    'Build an analyst that creates reports'
  ]
),
(
  'Code Assistant',
  'Helps with coding tasks and debugging',
  'development',
  '{
    "model": "claude-sonnet-4-5",
    "temperature": 0.6,
    "system_prompt": "You are an expert software engineer.",
    "max_tokens": 2500,
    "tools": ["code_execution", "github"]
  }'::jsonb,
  ARRAY['name', 'programming_languages'],
  ARRAY['frameworks', 'expertise_areas', 'code_style'],
  ARRAY['code', 'programming', 'developer', 'debug', 'engineer', 'software'],
  ARRAY[
    'Create a coding assistant for Python development',
    'I need an agent to help debug JavaScript',
    'Build a developer assistant for React projects'
  ]
);

-- Function to update template usage count
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.extracted_config->>'template_id' IS NOT NULL THEN
    UPDATE public.agent_templates
    SET usage_count = usage_count + 1
    WHERE id = (NEW.extracted_config->>'template_id')::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_usage
  AFTER INSERT ON public.nlp_agent_requests
  FOR EACH ROW
  WHEN (NEW.extracted_config IS NOT NULL)
  EXECUTE FUNCTION increment_template_usage();
```

---

## 📦 STEP 2: Add to dbServer.js

Add these methods to your `lib/supabase/dbServer.js`:

```javascript
// ─────────────────────────────
// NLP AGENT REQUESTS
// ─────────────────────────────
async createNlpRequest(userId, requestData) {
  const { data, error } = await supabaseAdmin
    .from('nlp_agent_requests')
    .insert({
      user_id: userId,
      ...requestData
    })
    .select()
    .single()
  if (error) throw error
  return data
},

async getNlpRequest(requestId, userId) {
  const { data, error } = await supabaseAdmin
    .from('nlp_agent_requests')
    .select('*')
    .eq('id', requestId)
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
},

async getUserNlpRequests(userId, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('nlp_agent_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
},

async updateNlpRequest(requestId, updates) {
  const { data, error } = await supabaseAdmin
    .from('nlp_agent_requests')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single()
  if (error) throw error
  return data
},

// ─────────────────────────────
// NLP PARSING HISTORY
// ─────────────────────────────
async createParsingHistory(historyData) {
  const { data, error } = await supabaseAdmin
    .from('nlp_parsing_history')
    .insert(historyData)
    .select()
    .single()
  if (error) throw error
  return data
},

async getParsingHistory(requestId) {
  const { data, error } = await supabaseAdmin
    .from('nlp_parsing_history')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
},

// ─────────────────────────────
// AGENT TEMPLATES
// ─────────────────────────────
async getAgentTemplates(category = null) {
  let query = supabaseAdmin
    .from('agent_templates')
    .select('*')
    .eq('is_active', true)
    .order('usage_count', { ascending: false })
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
},

async getAgentTemplate(templateId) {
  const { data, error } = await supabaseAdmin
    .from('agent_templates')
    .select('*')
    .eq('id', templateId)
    .single()
  if (error) throw error
  return data
},

async findTemplateByKeywords(keywords) {
  const { data, error } = await supabaseAdmin
    .from('agent_templates')
    .select('*')
    .eq('is_active', true)
  
  if (error) throw error
  
  // Score templates based on keyword matches
  const scored = data.map(template => {
    const matches = keywords.filter(kw => 
      template.keywords?.some(tk => 
        tk.toLowerCase().includes(kw.toLowerCase()) ||
        kw.toLowerCase().includes(tk.toLowerCase())
      )
    )
    return {
      ...template,
      matchScore: matches.length
    }
  })
  
  // Return top matches
  return scored
    .filter(t => t.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
},

// ─────────────────────────────
// NLP FEEDBACK
// ─────────────────────────────
async createNlpFeedback(userId, feedbackData) {
  const { data, error } = await supabaseAdmin
    .from('nlp_feedback')
    .insert({
      user_id: userId,
      ...feedbackData
    })
    .select()
    .single()
  if (error) throw error
  return data
},

async getNlpFeedback(requestId) {
  const { data, error } = await supabaseAdmin
    .from('nlp_feedback')
    .select('*')
    .eq('request_id', requestId)
  if (error) throw error
  return data
}
```

---

## 📦 STEP 3: Add to dbClient.js

Add these methods to your `lib/supabase/dbClient.js`:

```javascript
// NLP Agent Requests
async getUserNlpRequests(userId, limit = 50) {
  const { data, error } = await supabase
    .from('nlp_agent_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
},

async getNlpRequest(requestId) {
  const { data, error } = await supabase
    .from('nlp_agent_requests')
    .select('*')
    .eq('id', requestId)
    .single()
  if (error) throw error
  return data
},

// Agent Templates
async getAgentTemplates(category = null) {
  let query = supabase
    .from('agent_templates')
    .select('*')
    .eq('is_active', true)
    .order('usage_count', { ascending: false })
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
},

// Parsing History
async getParsingHistory(requestId) {
  const { data, error } = await supabase
    .from('nlp_parsing_history')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}
```

---

## 📦 STEP 4: Add Server Actions

Add these to your `actions/index.js`:

```javascript
// ─────────────────────────────
// NLP AGENT CREATION
// ─────────────────────────────
export async function createNlpRequest(userId, rawInput) {
  return await dbServer.createNlpRequest(userId, {
    raw_input: rawInput,
    status: 'pending'
  })
}

export async function getNlpRequest(requestId, userId) {
  return await dbServer.getNlpRequest(requestId, userId)
}

export async function getUserNlpRequests(userId, limit = 50) {
  return await dbServer.getUserNlpRequests(userId, limit)
}

export async function updateNlpRequest(requestId, updates) {
  return await dbServer.updateNlpRequest(requestId, updates)
}

export async function createParsingHistory(historyData) {
  return await dbServer.createParsingHistory(historyData)
}

export async function getParsingHistory(requestId) {
  return await dbServer.getParsingHistory(requestId)
}

export async function getAgentTemplates(category = null) {
  return await dbServer.getAgentTemplates(category)
}

export async function getAgentTemplate(templateId) {
  return await dbServer.getAgentTemplate(templateId)
}

export async function findTemplateByKeywords(keywords) {
  return await dbServer.findTemplateByKeywords(keywords)
}

export async function createNlpFeedback(userId, feedbackData) {
  return await dbServer.createNlpFeedback(userId, feedbackData)
}

export async function getNlpFeedback(requestId) {
  return await dbServer.getNlpFeedback(requestId)
}
```

---

## 📦 STEP 5: NLP Parser Utility

Create `lib/nlp/agent-parser.js`:

```javascript
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
  
  // Model preferences
  fast: /fast|quick|speed|real-time/i,
  smart: /smart|intelligent|advanced|complex/i,
  balanced: /balanced|moderate|standard/i
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
    if (AGENT_PATTERNS.fast.test(input)) return 'claude-sonnet-4'
    if (AGENT_PATTERNS.smart.test(input)) return 'claude-sonnet-4-5'
    
    return 'claude-sonnet-4'
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
```

---

## 📦 STEP 6: AI-Enhanced NLP Parser

Create `lib/nlp/ai-agent-parser.js`:

```javascript
/**
 * AI-Enhanced Agent Parser using Claude
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
  "model": "claude-sonnet-4-5|claude-sonnet-4",
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.content[0].text
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response')
    }
    
    const config = JSON.parse(jsonMatch[0])
    
    return {
      success: true,
      config,
      tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
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
  
  // Validate model
  const validModels = ['claude-sonnet-4-5', 'claude-sonnet-4', 'claude-opus-4']
  if (!validModels.includes(config.model)) {
    config.model = 'claude-sonnet-4' // Default
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
```

---

## 📦 STEP 7: Create API Route - Parse NLP

Create `app/api/nlp/parse/route.js`:

```javascript
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { parseWithAI, validateAgentConfig } from '@/lib/nlp/ai-agent-parser'
import { parseAgentDescription } from '@/lib/nlp/agent-parser'
import {
  createNlpRequest,
  updateNlpRequest,
  createParsingHistory,
  findTemplateByKeywords
} from '@/actions'

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { description, useAI = true } = await request.json()
    
    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters' },
        { status: 400 }
      )
    }
    
    // Create NLP request record
    const nlpRequest = await createNlpRequest(session.user.id, description)
    
    let parsedConfig
    let parsingMethod = 'rule-based'
    let tokensUsed = 0
    
    // Try AI parsing first if enabled and API key available
    if (useAI && process.env.ANTHROPIC_API_KEY) {
      await updateNlpRequest(nlpRequest.id, { status: 'processing' })
      
      const aiResult = await parseWithAI(description, process.env.ANTHROPIC_API_KEY)
      
      if (aiResult.success) {
        parsedConfig = aiResult.config
        parsingMethod = 'ai'
        tokensUsed = aiResult.tokensUsed
        
        // Log AI parsing
        await createParsingHistory({
          request_id: nlpRequest.id,
          stage: 'intent_extraction',
          input_text: description,
          output_data: parsedConfig,
          model_used: aiResult.model,
          tokens_used: tokensUsed,
          confidence_score: parsedConfig.metadata?.confidence || 0.85
        })
      } else {
        // Fallback to rule-based
        parsedConfig = parseAgentDescription(description)
        parsingMethod = 'rule-based-fallback'
      }
    } else {
      // Use rule-based parser
      parsedConfig = parseAgentDescription(description)
    }
    
    // Find matching template
    const keywords = description.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const templates = await findTemplateByKeywords(keywords)
    const matchedTemplate = templates[0] || null
    
    // Validate configuration
    const validation = validateAgentConfig(parsedConfig)
    
    if (!validation.valid) {
      await updateNlpRequest(nlpRequest.id, {
        status: 'failed',
        error_message: validation.errors.join('; ')
      })
      
      return NextResponse.json({
        error: 'Configuration validation failed',
        details: validation.errors
      }, { status: 400 })
    }
    
    // Update request with results
    await updateNlpRequest(nlpRequest.id, {
      status: 'completed',
      parsed_intent: {
        agentType: parsedConfig.agentType,
        category: parsedConfig.metadata?.category,
        confidence: parsedConfig.metadata?.confidence
      },
      extracted_config: validation.sanitizedConfig,
      processed_at: new Date().toISOString(),
      model_used: parsingMethod === 'ai' ? 'claude-sonnet-4-5' : 'rule-based'
    })
    
    return NextResponse.json({
      success: true,
      requestId: nlpRequest.id,
      config: validation.sanitizedConfig,
      matchedTemplate,
      parsingMethod,
      tokensUsed,
      confidence: parsedConfig.metadata?.confidence || 0.75
    })
    
  } catch (error) {
    console.error('NLP parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse agent description', details: error.message },
      { status: 500 }
    )
  }
}
```

---

## 📦 STEP 8: Create API Route - Create Agent from NLP

Create `app/api/nlp/create-agent/route.js`:

```javascript
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  getNlpRequest,
  updateNlpRequest,
  createAgent,
  addKnowledgeSource,
  createWebhook,
  logAnalytics
} from '@/actions'

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { requestId, customizations = {} } = await request.json()
    
    // Get the NLP request
    const nlpRequest = await getNlpRequest(requestId, session.user.id)
    
    if (!nlpRequest || !nlpRequest.extracted_config) {
      return NextResponse.json(
        { error: 'Invalid or incomplete NLP request' },
        { status: 400 }
      )
    }
    
    const config = { ...nlpRequest.extracted_config, ...customizations }
    
    // Create the agent
    const agentData = {
      name: config.name,
      description: config.purpose,
      model: config.model || 'claude-sonnet-4',
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 1500,
      system_prompt: config.systemPrompt,
      response_format: config.responseFormat || 'text',
      tools: config.tools || [],
      metadata: {
        createdVia: 'nlp',
        nlpRequestId: requestId,
        agentType: config.agentType,
        tone: config.tone,
        features: config.features,
        integrations: config.integrations,
        constraints: config.constraints,
        examples: config.examples
      }
    }
    
    const agent = await createAgent(session.user.id, agentData)
    
    // Add knowledge sources if any
    if (config.knowledgeSources && config.knowledgeSources.length > 0) {
      for (const source of config.knowledgeSources) {
        await addKnowledgeSource(agent.id, {
          type: source.type,
          name: source.name,
          content: source.content,
          metadata: {}
        })
      }
    }
    
    // Create webhook if requested
    if (config.features?.includes('webhook') || customizations.createWebhook) {
      await createWebhook(agent.id, {
        webhook_key: `wh_${Math.random().toString(36).substr(2, 16)}`,
        is_active: true,
        rate_limit: 100,
        allowed_origins: ['*']
      })
    }
    
    // Update NLP request with agent reference
    await updateNlpRequest(requestId, {
      agent_id: agent.id,
      status: 'completed'
    })
    
    // Log analytics
    await logAnalytics(agent.id, 'agent_created', {
      createdVia: 'nlp',
      parsingMethod: nlpRequest.model_used
    })
    
    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        config: agentData
      }
    })
    
  } catch (error) {
    console.error('Agent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create agent', details: error.message },
      { status: 500 }
    )
  }
}
```

---

## 📦 STEP 9: Frontend Component - NLP Agent Builder

Create `components/nlp/AgentBuilderChat.jsx`:

```javascript
'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function AgentBuilderChat({ onAgentCreated }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm here to help you create an AI agent. Just describe what you want your agent to do in natural language, and I'll build it for you!\n\nFor example: \"Create a customer support bot that helps users with billing questions and can search our knowledge base\""
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [parsedConfig, setParsedConfig] = useState(null)
  const [requestId, setRequestId] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // Parse the description
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🤔 Analyzing your description...',
        isTyping: true
      }])

      const parseResponse = await fetch('/api/nlp/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: userMessage, useAI: true })
      })

      if (!parseResponse.ok) {
        throw new Error('Failed to parse description')
      }

      const parseData = await parseResponse.json()
      setParsedConfig(parseData.config)
      setRequestId(parseData.requestId)

      // Remove typing message
      setMessages(prev => prev.filter(m => !m.isTyping))

      // Show parsed configuration
      const configMessage = `✅ Great! I've analyzed your description. Here's what I understood:

**Agent Name:** ${parseData.config.name}
**Purpose:** ${parseData.config.purpose}
**Type:** ${parseData.config.agentType.replace('_', ' ')}
**Model:** ${parseData.config.model}
**Tone:** ${parseData.config.tone}

${parseData.config.features.length > 0 ? `**Features:** ${parseData.config.features.join(', ')}` : ''}
${parseData.config.tools.length > 0 ? `**Tools:** ${parseData.config.tools.join(', ')}` : ''}
${parseData.config.integrations.length > 0 ? `**Integrations:** ${parseData.config.integrations.join(', ')}` : ''}

**Confidence:** ${Math.round((parseData.confidence || 0.75) * 100)}%

Would you like me to create this agent, or would you like to make any changes?`

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: configMessage,
        config: parseData.config
      }])

    } catch (error) {
      console.error('Parse error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I had trouble understanding that. Could you please rephrase your description? Try to be more specific about what you want the agent to do.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAgent = async () => {
    if (!requestId || !parsedConfig) return

    setIsLoading(true)
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '⚙️ Creating your agent...',
      isTyping: true
    }])

    try {
      const response = await fetch('/api/nlp/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })

      if (!response.ok) {
        throw new Error('Failed to create agent')
      }

      const data = await response.json()

      // Remove typing message
      setMessages(prev => prev.filter(m => !m.isTyping))

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🎉 Success! Your agent "${data.agent.name}" has been created and is ready to use!`
      }])

      // Notify parent
      if (onAgentCreated) {
        onAgentCreated(data.agent)
      }

    } catch (error) {
      console.error('Creation error:', error)
      setMessages(prev => prev.filter(m => !m.isTyping))
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, there was an error creating your agent. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Create Agent with Natural Language
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {message.config && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <button
                    onClick={handleCreateAgent}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Create This Agent
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the agent you want to create..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 📦 STEP 10: Frontend Page - NLP Agent Builder

Create `app/agents/create-nlp/page.jsx`:

```javascript
'use client'

import { useRouter } from 'next/navigation'
import AgentBuilderChat from '@/components/nlp/AgentBuilderChat'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CreateAgentNLP() {
  const router = useRouter()

  const handleAgentCreated = (agent) => {
    // Redirect to the agent page
    setTimeout(() => {
      router.push(`/agents/${agent.id}`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back button */}
        <Link
          href="/agents"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </Link>

        {/* Chat interface */}
        <AgentBuilderChat onAgentCreated={handleAgentCreated} />

        {/* Examples */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Example Prompts
          </h3>
          <div className="space-y-2">
            <ExamplePrompt
              text="Create a customer support bot that answers billing questions and can access our FAQ database"
            />
            <ExamplePrompt
              text="I need a sales assistant that qualifies leads and schedules demos using our calendar"
            />
            <ExamplePrompt
              text="Build a content writer that creates blog posts about technology in a professional tone"
            />
            <ExamplePrompt
              text="Create a code assistant that helps with Python debugging and can execute code"
            />
            <ExamplePrompt
              text="I want a data analyst that generates insights from our sales data and creates visualizations"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ExamplePrompt({ text }) {
  return (
    <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
      {text}
    </div>
  )
}
```

---

## ✅ COMPLETE SETUP CHECKLIST

### Step 1: Database (5 min)
- [ ] Run SQL schema in Supabase SQL Editor
- [ ] Verify tables created: `nlp_agent_requests`, `nlp_parsing_history`, `agent_templates`, `nlp_feedback`
- [ ] Verify default templates inserted

### Step 2: Update Backend Files (10 min)
- [ ] Add NLP methods to `lib/supabase/dbServer.js`
- [ ] Add NLP methods to `lib/supabase/dbClient.js`
- [ ] Add server actions to `actions/index.js`

### Step 3: Create Utility Files (5 min)
- [ ] Create `lib/nlp/agent-parser.js`
- [ ] Create `lib/nlp/ai-agent-parser.js`

### Step 4: Create API Routes (5 min)
- [ ] Create `app/api/nlp/parse/route.js`
- [ ] Create `app/api/nlp/create-agent/route.js`

### Step 5: Create Frontend (10 min)
- [ ] Create `components/nlp/AgentBuilderChat.jsx`
- [ ] Create `app/agents/create-nlp/page.jsx`

### Step 6: Environment Variables (2 min)
- [ ] Add `ANTHROPIC_API_KEY` to `.env.local` (optional, for AI parsing)

### Step 7: Test (5 min)
- [ ] Navigate to `/agents/create-nlp`
- [ ] Try example prompt
- [ ] Verify agent creation
- [ ] Check database records

---

## 🧪 TEST COMMANDS

```bash
# Test NLP parsing
curl -X POST http://localhost:3000/api/nlp/parse \
  -H "Content-Type: application/json" \
  -d '{"description": "Create a customer support bot that helps with billing questions"}'

# Test agent creation
curl -X POST http://localhost:3000/api/nlp/create-agent \
  -H "Content-Type: application/json" \
  -d '{"requestId": "YOUR_REQUEST_ID"}'
```

---

## 🎯 FEATURES INCLUDED

✅ Natural language agent creation
✅ AI-powered parsing with Claude
✅ Rule-based fallback parser
✅ Pre-defined agent templates
✅ Confidence scoring
✅ Configuration validation
✅ Chat-like interface
✅ Real-time parsing
✅ Automatic agent creation
✅ Knowledge source extraction
✅ Integration detection
✅ Tone and personality detection
✅ Parsing history tracking
✅ User feedback system

---

## 📊 TOTAL TIME: ~42 MINUTES

Ready to build agents with natural language! 🚀
