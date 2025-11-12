/**
 * Knowledge Upload Component for Agent Creation
 * Uses vector-based knowledge system for better scalability
 */

import { AlertCircle, CheckCircle, FileText, Link as LinkIcon, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import Button from './ui/button'
import FormInput from './ui/formInputField'

export function   KnowledgeUploadSection({ agentId, userId, onSourceAdded, knowledgeSources = [] }) {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isProcessingContent, setIsProcessingContent] = useState(false)
  const processingRef = useRef(false)
  const [uploadProgress, setUploadProgress] = useState({})

  // Upload file or URL to vector system
  const uploadKnowledgeSource = useCallback(async (type, fileOrUrl) => {
    if (processingRef.current) return
    processingRef.current = true
    setIsProcessingContent(true)

    const sourceId = Date.now().toString()
    setUploadProgress(prev => ({
      ...prev,
      [sourceId]: { status: 'uploading', progress: 0 }
    }))

    try {
      const formData = new FormData()
      formData.append('type', type)
      formData.append('userId', userId)

      if (type === 'file') {
        formData.append('file', fileOrUrl)
      } else {
        formData.append('url', fileOrUrl)
      }

      // Upload to vector endpoint
      const response = await fetch(`/api/agents/${agentId}/knowledge/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()

      setUploadProgress(prev => ({
        ...prev,
        [sourceId]: { status: 'completed', progress: 100 }
      }))

      // Notify parent component
      if (onSourceAdded) {
        onSourceAdded({
          id: data.knowledgeSource.id,
          name: data.knowledgeSource.name,
          type: data.knowledgeSource.type,
          vectorCount: data.knowledgeSource.vectorCount,
          chunkCount: data.knowledgeSource.chunkCount,
          status: 'completed'
        })
      }

      toast.success(
        `${type === 'file' ? 'File' : 'Website'} processed! Created ${data.knowledgeSource.vectorCount} vectors`
      )

      // Clear progress after 2 seconds
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[sourceId]
          return newProgress
        })
      }, 2000)

    } catch (err) {
      console.error('Upload error:', err)
      setUploadProgress(prev => ({
        ...prev,
        [sourceId]: { status: 'failed', progress: 0 }
      }))
      toast.error(err.message || 'Failed to process knowledge source')
      
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[sourceId]
          return newProgress
        })
      }, 3000)
    } finally {
      processingRef.current = false
      setIsProcessingContent(false)
    }
  }, [agentId, userId, onSourceAdded])

  // PDF upload handler
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return toast.error('No file selected')
    
    // Validate file type
    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      return toast.error('Only PDF and TXT files are supported')
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return toast.error('File size must be less than 10MB')
    }

    await uploadKnowledgeSource('file', file)
  }, [uploadKnowledgeSource])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: isProcessingContent
  })

  // Website URL handler
  const handleAddWebsite = useCallback(async () => {
    if (!websiteUrl.trim()) {
      return toast.error('Please enter a website URL')
    }

    // Validate URL format
    try {
      new URL(websiteUrl)
    } catch {
      return toast.error('Please enter a valid URL')
    }

    await uploadKnowledgeSource('url', websiteUrl)
    setWebsiteUrl('')
  }, [websiteUrl, uploadKnowledgeSource])

  // Remove knowledge source
  const handleRemoveSource = useCallback(async (sourceId, sourceName) => {
    try {
      const response = await fetch(
        `/api/agents/${agentId}/knowledge/upload?sourceId=${sourceId}&userId=${userId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to delete')

      toast.success('Knowledge source removed')
      
      // Notify parent to update list
      if (onSourceAdded) {
        onSourceAdded({ id: sourceId, _deleted: true })
      }
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to remove knowledge source')
    }
  }, [agentId, userId, onSourceAdded])

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-200">
          Upload Document
        </label>
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all ${
            isDragActive
              ? 'border-orange-500 bg-orange-900/20'
              : 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-900/50'
          } ${isProcessingContent ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-neutral-400" />
          <p className="mt-2 text-sm text-neutral-300">
            {isProcessingContent
              ? 'Processing document...'
              : 'Drop PDF or TXT here, or click to upload'}
          </p>
          <p className="text-xs text-neutral-500">
            Max 10MB • Automatically converted to vectors
          </p>
        </div>
      </div>

      {/* Website URL */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-200">
          Add Website URL
        </label>
        <div className="flex gap-2">
          <FormInput
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com/docs"
            disabled={isProcessingContent}
          />
          <Button
            onClick={handleAddWebsite}
            disabled={!websiteUrl.trim() || isProcessingContent}
            variant="secondary"
          >
            {isProcessingContent ? 'Adding...' : 'Add'}
          </Button>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Content will be scraped and converted to vectors
        </p>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([id, progress]) => (
            <div
              key={id}
              className="flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-900/50 p-3"
            >
              {progress.status === 'uploading' && (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                  <span className="text-sm text-neutral-300">Processing...</span>
                </>
              )}
              {progress.status === 'completed' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-400">Completed!</span>
                </>
              )}
              {progress.status === 'failed' && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-400">Failed</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Knowledge Sources List */}
      {knowledgeSources.length > 0 && (
        <div>
          <label className="mb-3 block text-sm font-medium text-neutral-200">
            Knowledge Sources ({knowledgeSources.length})
          </label>
          <div className="space-y-2">
            {knowledgeSources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900/50 p-3 transition-all hover:bg-neutral-900"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {source.type === 'pdf' || source.type === 'file' ? (
                    <FileText className="h-5 w-5 text-orange-400 flex-shrink-0" />
                  ) : (
                    <LinkIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-neutral-200">
                      {source.name}
                    </p>
                    {source.vectorCount && (
                      <p className="text-xs text-neutral-500">
                        {source.vectorCount} vectors • {source.chunkCount || 0} chunks
                      </p>
                    )}
                  </div>
                  {source.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                  {source.status === 'processing' && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent flex-shrink-0" />
                  )}
                </div>
                <button
                  onClick={() => handleRemoveSource(source.id, source.name)}
                  className="ml-2 text-neutral-400 transition-colors hover:text-red-400 flex-shrink-0"
                  disabled={source.status === 'processing'}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-lg border border-blue-600/30 bg-blue-900/10 p-4">
        <h4 className="text-sm font-medium text-blue-300 mb-2">
          🚀 Vector-Powered Knowledge Base
        </h4>
        <ul className="space-y-1 text-xs text-neutral-400">
          <li>• Documents are automatically chunked and converted to vectors</li>
          <li>• Enables semantic search (meaning-based, not just keywords)</li>
          <li>• Scales to handle large documents efficiently</li>
          <li>• Your agent retrieves only relevant context</li>
        </ul>
      </div>
    </div>
  )
}

export default KnowledgeUploadSection