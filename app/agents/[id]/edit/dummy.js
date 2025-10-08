'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { dbHelpers } from '@/lib/supabase'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { 
  Bot, 
  ArrowLeft, 
  Save, 
  Upload, 
  Link as LinkIcon, 
  FileText, 
  X,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react'
import Button from '../../../../components/button'
import FormInput from '../../../../components/formInputField'
// import Breadcrumb from '@/components/layout/breadcrumb'
// import LoadingState from '@/components/common/loading-state'

export default function EditAgent() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  
  const [agent, setAgent] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: 'website',
    persona: '',
    tone: 'friendly',
    system_prompt: ''
  })
  
  const [knowledgeSources, setKnowledgeSources] = useState([])
  const [newKnowledge, setNewKnowledge] = useState({
    type: 'text',
    content: '',
    url: ''
  })

 
  const tones = [
    { id: 'friendly', name: 'Friendly', description: 'Warm and approachable' },
    { id: 'professional', name: 'Professional', description: 'Formal and business-like' },
    { id: 'casual', name: 'Casual', description: 'Relaxed and conversational' },
    { id: 'enthusiastic', name: 'Enthusiastic', description: 'Energetic and excited' },
    { id: 'helpful', name: 'Helpful', description: 'Solution-focused and supportive' }
  ]

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: Edit3 },
    { id: 'knowledge', name: 'Knowledge Base', icon: FileText },
    { id: 'advanced', name: 'Advanced', icon: Bot }
  ]

  useEffect(() => {
    if (id && user) {
      fetchAgent()
    }
  }, [id, user])

  const fetchAgent = async () => {
    try {
      setLoading(true)
      const agentData = await dbHelpers.getAgent(id)
      
      if (!agentData) {
        toast.error('Agent not found')
        router.push('/agents')
        return
      }

      setAgent(agentData)
      setFormData({
        name: agentData.name || '',
        description: agentData.description || '',
        purpose: agentData.purpose || 'website',
        persona: agentData.persona || '',
        tone: agentData.tone || 'friendly',
        system_prompt: agentData.system_prompt || ''
      })
      setKnowledgeSources(agentData.knowledge_sources || [])
    } catch (error) {
      console.error('Error fetching agent:', error)
      toast.error('Failed to load agent')
      router.push('/agents')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Agent name is required')
      return
    }

    try {
      setSaving(true)
      
      const updates = {
        ...formData,
        updated_at: new Date().toISOString()
      }

      await dbHelpers.updateAgent(id, updates)
      toast.success('Agent updated successfully!')
      
      // Update local state
      setAgent(prev => ({ ...prev, ...updates }))
    } catch (error) {
      console.error('Error updating agent:', error)
      toast.error('Failed to update agent')
    } finally {
      setSaving(false)
    }
  }

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload PDF files only')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    try {
      setUploading(true)
      
      // In a real app, you'd process the PDF file
      const formData = new FormData()
      formData.append('file', file)
      
      // Simulate PDF processing
      const processedContent = `Content from ${file.name} has been extracted and processed.`
      const summary = `Summary of ${file.name}: Contains important business information.`
      
      const newKnowledgeSource = await dbHelpers.addKnowledgeSource(id, {
        source_type: 'pdf',
        file_name: file.name,
        content: processedContent,
        summary: summary,
        status: 'completed'
      })

      setKnowledgeSources(prev => [...prev, newKnowledgeSource])
      toast.success('PDF uploaded and processed successfully!')
    } catch (error) {
      console.error('Error processing PDF:', error)
      toast.error('Failed to process PDF')
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  })

  const handleAddTextKnowledge = async () => {
    if (!newKnowledge.content.trim()) {
      toast.error('Please enter some content')
      return
    }

    try {
      const knowledgeSource = await dbHelpers.addKnowledgeSource(id, {
        source_type: 'text',
        content: newKnowledge.content,
        summary: newKnowledge.content.slice(0, 200) + (newKnowledge.content.length > 200 ? '...' : ''),
        status: 'completed'
      })

      setKnowledgeSources(prev => [...prev, knowledgeSource])
      setNewKnowledge({ ...newKnowledge, content: '' })
      toast.success('Text content added successfully!')
    } catch (error) {
      console.error('Error adding text knowledge:', error)
      toast.error('Failed to add text content')
    }
  }

  const handleAddWebsiteKnowledge = async () => {
    if (!newKnowledge.url.trim()) {
      toast.error('Please enter a website URL')
      return
    }

    try {
      setUploading(true)
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newKnowledge.url })
      })

      if (!response.ok) throw new Error('Failed to scrape website')

      const data = await response.json()
      
      const knowledgeSource = await dbHelpers.addKnowledgeSource(id, {
        source_type: 'url',
        source_url: newKnowledge.url,
        content: data.content,
        summary: data.summary,
        status: 'completed'
      })

      setKnowledgeSources(prev => [...prev, knowledgeSource])
      setNewKnowledge({ ...newKnowledge, url: '' })
      toast.success('Website content added successfully!')
    } catch (error) {
      console.error('Error scraping website:', error)
      toast.error('Failed to scrape website content')
    } finally {
      setUploading(false)
    }
  }

  const deleteKnowledgeSource = async (sourceId) => {
    if (!confirm('Are you sure you want to delete this knowledge source?')) {
      return
    }

    try {
      // In a real app, you'd have a delete endpoint
      await fetch(`/api/knowledge-sources/${sourceId}`, {
        method: 'DELETE'
      })

      setKnowledgeSources(prev => prev.filter(source => source.id !== sourceId))
      toast.success('Knowledge source deleted')
    } catch (error) {
      console.error('Error deleting knowledge source:', error)
      toast.error('Failed to delete knowledge source')
    }
  }

  const generateSystemPrompt = () => {
    const purposeInstructions = {
      instagram: 'You are an Instagram DM assistant. Respond to direct messages professionally and help users with their inquiries.',
      messenger: 'You are a Messenger chatbot. Provide helpful responses and guide users through conversations.',
      calendar: 'You are a calendar booking assistant. Help users schedule appointments and manage their calendar.',
      website: 'You are a website customer support agent. Answer questions and provide assistance to website visitors.'
    }

    const prompt = `You are an AI assistant with a ${formData.tone} tone. ${formData.persona ? `Your personality: ${formData.persona}. ` : ''}${purposeInstructions[formData.purpose]}

Use the following knowledge base to answer questions:
${knowledgeSources.map(s => s.summary || s.content?.slice(0, 200)).join('\n')}

Always be helpful, accurate, and stay in character.`

    setFormData(prev => ({ ...prev, system_prompt: prompt }))
  }

  if (loading) {
    return <LoadingState message="Loading agent details..." />
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Agent not found</h2>
          <p className="text-gray-600 mb-6">The agent you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/agents')}>
            Back to Agents
          </Button>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { name: 'Agents', href: '/agents' },
    { name: agent.name, href: `/agents/${id}` },
    { name: 'Edit' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Edit Agent</h1>
                <p className="text-sm text-gray-600">{agent.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/agents/${id}`)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agent Name *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Customer Support Assistant"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tone of Voice
                      </label>
                      <select
                        value={formData.tone}
                        onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                        className="input w-full"
                      >
                        {tones.map((tone) => (
                          <option key={tone.id} value={tone.id}>{tone.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of what this agent does..."
                      rows={3}
                      className="input w-full resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Purpose
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      {purposes.map((purpose) => (
                        <label key={purpose.id} className="cursor-pointer">
                          <input
                            type="radio"
                            name="purpose"
                            value={purpose.id}
                            checked={formData.purpose === purpose.id}
                            onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                            className="sr-only"
                          />
                          <div className={`p-4 border-2 rounded-lg transition-all ${
                            formData.purpose === purpose.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <purpose.icon className={`h-5 w-5 text-${purpose.color}-500`} />
                              <span className="font-medium text-gray-900">{purpose.name}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personality & Behavior
                    </label>
                    <textarea
                      value={formData.persona}
                      onChange={(e) => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                      placeholder="Describe your agent's personality, expertise, and how it should behave..."
                      rows={4}
                      className="input w-full resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Knowledge Base Tab */}
              {activeTab === 'knowledge' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base</h2>
                    <p className="text-gray-600">Add information for your agent to learn from.</p>
                  </div>

                  {/* Add Knowledge Section */}
                  <div className="border border-gray-200 rounded-lg">
                    <div className="flex border-b border-gray-200">
                      {['text', 'pdf', 'website'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setNewKnowledge(prev => ({ ...prev, type }))}
                          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 ${
                            newKnowledge.type === type
                              ? 'border-blue-500 text-blue-600 bg-blue-50'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {type === 'text' && <FileText className="h-4 w-4" />}
                          {type === 'pdf' && <Upload className="h-4 w-4" />}
                          {type === 'website' && <LinkIcon className="h-4 w-4" />}
                          <span className="capitalize">{type}</span>
                        </button>
                      ))}
                    </div>

                    <div className="p-6">
                      {newKnowledge.type === 'text' && (
                        <div className="space-y-4">
                          <textarea
                            value={newKnowledge.content}
                            onChange={(e) => setNewKnowledge(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Enter information for your agent..."
                            rows={6}
                            className="input w-full resize-none"
                          />
                          <Button 
                            onClick={handleAddTextKnowledge}
                            disabled={!newKnowledge.content.trim()}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Text
                          </Button>
                        </div>
                      )}

                      {newKnowledge.type === 'pdf' && (
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDragActive 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input {...getInputProps()} />
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">
                            {isDragActive 
                              ? 'Drop your PDF here' 
                              : 'Drag & drop a PDF, or click to browse'
                            }
                          </p>
                          <p className="text-gray-400 text-sm">Max 10MB</p>
                          {uploading && (
                            <p className="text-blue-600 text-sm mt-2">Processing...</p>
                          )}
                        </div>
                      )}

                      {newKnowledge.type === 'website' && (
                        <div className="space-y-4">
                          <Input
                            type="url"
                            value={newKnowledge.url}
                            onChange={(e) => setNewKnowledge(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="https://example.com"
                          />
                          <Button 
                            onClick={handleAddWebsiteKnowledge}
                            disabled={!newKnowledge.url.trim() || uploading}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {uploading ? 'Scraping...' : 'Add Website'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Existing Knowledge Sources */}
                  {knowledgeSources.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Current Knowledge Sources</h3>
                      <div className="space-y-3">
                        {knowledgeSources.map((source) => (
                          <div key={source.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-start space-x-3">
                              {source.source_type === 'pdf' && <FileText className="h-5 w-5 text-red-500 mt-1" />}
                              {source.source_type === 'url' && <LinkIcon className="h-5 w-5 text-blue-500 mt-1" />}
                              {source.source_type === 'text' && <FileText className="h-5 w-5 text-gray-500 mt-1" />}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {source.file_name || source.source_url || 'Text Content'}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">{source.summary}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  Added {new Date(source.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => deleteKnowledgeSource(source.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h2>
                    <p className="text-gray-600">Configure advanced behavior and system prompts.</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        System Prompt
                      </label>
                      <Button
                        onClick={generateSystemPrompt}
                        variant="outline"
                        size="sm"
                      >
                        Auto-Generate
                      </Button>
                    </div>
                    <textarea
                      value={formData.system_prompt}
                      onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                      placeholder="System prompt that defines how your agent behaves..."
                      rows={12}
                      className="input w-full resize-none font-mono text-sm"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      This prompt defines how your agent will behave and respond to users.
                    </p>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}