'use client'

import {
  AlertCircle,
  CheckCircle,
  Database,
  FileText,
  Link as LinkIcon,
  Wrench,
  Zap
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import KnowledgeUploadSection from '../KnowledgeUploadSection'
import Button from '../ui/button'
import Card from '../ui/card'

export default function KnowledgeTab({ agent, agentId, userId }) {
  const [knowledgeSources, setKnowledgeSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch knowledge sources
  const fetchKnowledgeSources = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/agents/${agentId}/knowledge/upload?userId=${userId}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch knowledge sources')
      }

      const data = await response.json()

      if (data.success && data.sources) {
        setKnowledgeSources(data.sources)
      }
    } catch (err) {
      console.error('Error fetching knowledge sources:', err)
      setError(err.message)
      toast.error('Failed to load knowledge sources')
    } finally {
      setLoading(false)
    }
  }, [agentId, userId])

  useEffect(() => {
    if (agentId && userId) {
      fetchKnowledgeSources()
    }
  }, [agentId, userId, fetchKnowledgeSources])

  // Handle source changes
  const handleSourceAdded = useCallback((source) => {
    if (source._deleted) {
      // Remove from list
      setKnowledgeSources((prev) => prev.filter((s) => s.id !== source.id))
      toast.success('Knowledge source removed')
    } else {
      // Add or update
      setKnowledgeSources((prev) => {
        const exists = prev.find((s) => s.id === source.id)
        if (exists) {
          return prev.map((s) => (s.id === source.id ? { ...s, ...source } : s))
        }
        return [...prev, source]
      })
    }
  }, [])

  // Calculate stats
  const totalVectors = knowledgeSources.reduce(
    (sum, s) => sum + (s.vectorCount || 0),
    0
  )
  const fileCount = knowledgeSources.filter(
    (s) => s.type === 'file' || s.type === 'pdf'
  ).length
  const urlCount = knowledgeSources.filter((s) => s.type === 'url').length
  const textCount = knowledgeSources.filter((s) => s.type === 'text').length
  const instructionsCount = knowledgeSources.filter(
    (s) => s.type === 'instruction'
  ).length

  // if (loading) {
  //   return (
  //     <div className='flex items-center justify-center py-16'>
  //       <div className='text-center'>
  //         <Database className='mx-auto h-12 w-12 animate-pulse text-purple-400' />
  //         <p className='mt-4 text-sm text-neutral-400'>
  //           Loading knowledge base...
  //         </p>
  //       </div>
  //     </div>
  //   )
  // }

  if (error) {
    return (
      <Card className='border-red-600/20 bg-gradient-to-br from-red-950/10 to-neutral-950/50'>
        <div className='p-8 text-center'>
          <AlertCircle className='mx-auto h-12 w-12 text-red-400' />
          <h3 className='mt-4 text-lg font-semibold text-red-400'>
            Error Loading Knowledge Base
          </h3>
          <p className='mt-2 text-sm text-neutral-400'>{error}</p>
          <Button
            onClick={fetchKnowledgeSources}
            className='mt-4'
            variant='outline'
          >
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h2 className='text-2xl font-bold text-neutral-100'>Knowledge Base</h2>
        <p className='mt-1 text-sm text-neutral-400'>
          Manage your agent&apos;s knowledge sources and vectorized content
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Total Sources */}
        <Card className='border-purple-600/20 bg-gradient-to-br from-purple-950/10 to-neutral-950/50'>
          <div className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-900/40 ring-2 ring-purple-600/20'>
                <Database className='h-5 w-5 text-purple-400' />
              </div>
              <div>
                <p className='text-2xl font-bold text-neutral-100'>
                  {knowledgeSources.length}
                </p>
                <p className='text-xs text-neutral-400'>Total Sources</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Files */}
        <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
          <div className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-900/40 ring-2 ring-orange-600/20'>
                <FileText className='h-5 w-5 text-orange-400' />
              </div>
              <div>
                <p className='text-2xl font-bold text-neutral-100'>
                  {fileCount}
                </p>
                <p className='text-xs text-neutral-400'>Files</p>
              </div>
            </div>
          </div>
        </Card>

        {/* URLs */}
        <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
          <div className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-900/40 ring-2 ring-blue-600/20'>
                <LinkIcon className='h-5 w-5 text-blue-400' />
              </div>
              <div>
                <p className='text-2xl font-bold text-neutral-100'>
                  {urlCount}
                </p>
                <p className='text-xs text-neutral-400'>URLs</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
          <div className='p-4'>
            <div className='flex items-center gap-3'>
              <Wrench className='h-8 w-8 text-red-400' />
              <div>
                <p className='text-2xl font-bold text-neutral-100'>
                  {instructionsCount}
                </p>
                <p className='text-xs text-neutral-400'>Instructions</p>
              </div>
            </div>
          </div>
        </Card>
        {/* Vectors */}
        <Card className='border-green-600/20 bg-gradient-to-br from-green-950/10 to-neutral-950/50'>
          <div className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-900/40 ring-2 ring-green-600/20'>
                <Zap className='h-5 w-5 text-green-400' />
              </div>
              <div>
                <p className='text-2xl font-bold text-neutral-100'>
                  {totalVectors.toLocaleString()}
                </p>
                <p className='text-xs text-neutral-400'>Vectors</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Knowledge Sources Section */}
      <Card className='border-purple-600/20'>
        <div className='p-6'>
          <KnowledgeUploadSection
            agentId={agentId}
            userId={userId}
            onSourceAdded={handleSourceAdded}
            knowledgeSources={knowledgeSources}
          />
        </div>
      </Card>

      {/* Info Card */}
      {knowledgeSources.length > 0 && (
        <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
          <div className='p-4'>
            <div className='flex items-start gap-3'>
              <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400' />
              <div>
                <h4 className='text-sm font-semibold text-neutral-100'>
                  Knowledge Base Active
                </h4>
                <p className='mt-1 text-xs text-neutral-400'>
                  Your agent has access to {knowledgeSources.length} vectorized
                  knowledge source
                  {knowledgeSources.length !== 1 ? 's' : ''} with{' '}
                  {totalVectors.toLocaleString()}
                  semantic vectors. The agent will automatically search this
                  knowledge when answering questions.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
