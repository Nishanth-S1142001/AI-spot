'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Calendar,
  Activity,
  Zap,
  TrendingUp,
  Filter
} from 'lucide-react'
import Button from '../../../../components/ui/button'
import Card from '../../../../components/ui/card'
import Badge from '../../../../components/ui/badge'
import SearchBar from '../../../../components/common/search-bar'
import Pagination from '../../../../components/common/pagination'
import { format } from 'date-fns'
import NeonBackground from '../../../../components/ui/background'
import SideBarLayout from '../../../../components/sideBarLayout'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import LoadingState from '../../../../components/common/loading-state'
import { useAuth } from '../../../../components/providers/AuthProvider'
import {
  useWorkflow,
  useWorkflowExecutions,
  useWorkflowExecutionDetails
} from '../../../../lib/hooks/useWorkflowData'

/**
 * FULLY OPTIMIZED Workflow Executions Page
 * 
 * React Query Integration:
 * - Automatic data fetching with caching
 * - Consistent with other optimized pages
 */

// Highlight text utility
const highlightText = (text, searchQuery) => {
  if (!searchQuery || !text) return text
  const searchLower = searchQuery.toLowerCase()
  const textLower = text.toLowerCase()
  const matches = []
  let searchIndex = 0
  
  for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
    if (textLower[i] === searchLower[searchIndex]) {
      matches.push(i)
      searchIndex++
    }
  }
  
  if (searchIndex < searchLower.length) return text
  
  const parts = []
  let lastIndex = 0
  
  matches.forEach((matchIndex) => {
    if (matchIndex > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, matchIndex)}</span>)
    }
    parts.push(
      <span key={`highlight-${matchIndex}`} className="bg-blue-500/30 text-blue-300 font-bold rounded px-0.5">
        {text[matchIndex]}
      </span>
    )
    lastIndex = matchIndex + 1
  })
  
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }
  
  return <>{parts}</>
}

// Memoized components
const ExecutionCard = memo(({ execution, isSelected, onClick, searchQuery }) => {
  const StatusIcon = execution.status === 'completed' ? CheckCircle : execution.status === 'failed' ? XCircle : Clock
  const statusColor = execution.status === 'completed' ? 'text-green-400' : execution.status === 'failed' ? 'text-red-400' : 'text-blue-400'
  const badgeVariant = execution.status === 'completed' ? 'default' : execution.status === 'failed' ? 'destructive' : 'secondary'

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-lg border p-4 transition-all hover:scale-[1.01] ${
        isSelected
          ? 'border-blue-500/50 bg-gradient-to-br from-blue-900/30 to-blue-950/10 shadow-lg shadow-blue-500/20'
          : 'border-neutral-700/50 bg-gradient-to-br from-neutral-800/30 to-neutral-900/20 hover:border-blue-600/30 hover:shadow-md'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-5 w-5 ${statusColor} ${execution.status === 'running' ? 'animate-spin' : ''}`} />
          <Badge variant={badgeVariant} className="font-medium text-xs">{execution.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-orange-400" />
          <span className="text-xs font-bold text-orange-300">{execution.execution_time_ms}ms</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-neutral-300">
          <Calendar className="h-3.5 w-3.5 text-neutral-500" />
          <span>{format(new Date(execution.created_at), 'MMM d, yyyy')}</span>
          <span className="text-neutral-600">•</span>
          <Clock className="h-3.5 w-3.5 text-neutral-500" />
          <span>{format(new Date(execution.created_at), 'h:mm a')}</span>
        </div>
        {execution.id && (
          <div className="text-xs text-neutral-500 font-mono">
            ID: {highlightText(execution.id.slice(0, 12), searchQuery)}...
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-neutral-700/50 pt-3">
        <div className="flex items-center gap-1 text-xs text-neutral-400">
          <Activity className="h-3 w-3" />
          <span>{execution.logs_count || 0} steps</span>
        </div>
      </div>
    </div>
  )
})
ExecutionCard.displayName = 'ExecutionCard'

const LogEntry = memo(({ log, isLast }) => {
  const StatusIcon = log.status === 'completed' ? CheckCircle : log.status === 'failed' ? XCircle : Clock
  const statusColor = log.status === 'completed' ? 'text-green-400 bg-green-900/20' : log.status === 'failed' ? 'text-red-400 bg-red-900/20' : 'text-blue-400 bg-blue-900/20'

  return (
    <div className="relative pl-8">
      {!isLast && <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gradient-to-b from-blue-600/40 to-transparent" />}
      <div className={`absolute left-0 top-1 rounded-full p-0.5 ${statusColor}`}>
        <StatusIcon className="h-4 w-4" />
      </div>
      <div className="group rounded-lg border border-neutral-700/50 bg-gradient-to-br from-neutral-800/50 to-neutral-900/30 p-4 transition-all hover:border-blue-600/30 hover:shadow-md hover:shadow-blue-500/10">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-100">{log.node_name}</span>
            <Badge variant="outline" className="text-xs">{log.node_type}</Badge>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-orange-900/30 px-2 py-1">
            <Zap className="h-3 w-3 text-orange-400" />
            <span className="text-xs font-medium text-orange-300">{log.execution_time_ms}ms</span>
          </div>
        </div>
        {log.error_message && (
          <div className="mt-3 rounded-md border border-red-600/30 bg-red-900/20 p-3 text-xs text-red-300">
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold mb-1">Error</div>
                {log.error_message}
              </div>
            </div>
          </div>
        )}
        {log.output_data && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-neutral-400 hover:text-blue-400 flex items-center gap-2">
              <span className="font-medium">View Output</span>
              <span className="text-neutral-600">▼</span>
            </summary>
            <pre className="custom-scrollbar mt-2 max-h-48 overflow-auto rounded-md bg-neutral-950/70 p-3 text-xs text-neutral-300 border border-neutral-800/50">
              {JSON.stringify(log.output_data, null, 2)}
            </pre>
          </details>
        )}
        {log.started_at && (
          <div className="mt-3 pt-3 border-t border-neutral-800/50 text-xs text-neutral-500">
            Started: {format(new Date(log.started_at), 'h:mm:ss a')}
          </div>
        )}
      </div>
    </div>
  )
})
LogEntry.displayName = 'LogEntry'

const StatCard = memo(({ icon: Icon, label, value, subValue, colorClass, bgClass }) => (
  <Card className={`border-opacity-20 ${bgClass}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-400">{label}</p>
        <p className={`mt-2 text-3xl font-bold ${colorClass}`}>{value}</p>
        {subValue && (
          <div className="mt-2 flex items-center text-xs text-neutral-500">
            <TrendingUp className="mr-1 h-3 w-3" />
            {subValue}
          </div>
        )}
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bgClass.replace('to-neutral-950/50', 'opacity-40')}`}>
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
    </div>
  </Card>
))
StatCard.displayName = 'StatCard'

export default function WorkflowExecutionsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  
  // Local state - MUST be declared before any conditional returns
  const [selectedExecutionId, setSelectedExecutionId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const itemsPerPage = 8
  
  // React Query hooks - MUST be called before any conditional returns
  const { data: workflowData } = useWorkflow(id)
  const { data: executions = [], isLoading: executionsLoading, refetch } = useWorkflowExecutions(id)
  
  // Fetch execution details when selected
  const { data: executionDetails, isLoading: logsLoading } = useWorkflowExecutionDetails(
    id,
    selectedExecutionId
  )

  const workflow = useMemo(() => workflowData?.workflow, [workflowData])
  const executionLogs = useMemo(() => executionDetails?.logs || [], [executionDetails])
  const selectedExecution = useMemo(
    () => executions.find(e => e.id === selectedExecutionId),
    [executions, selectedExecutionId]
  )

  // Calculate statistics - MUST be before conditional returns
  const statistics = useMemo(() => {
    const total = executions.length
    const completed = executions.filter(e => e.status === 'completed').length
    const failed = executions.filter(e => e.status === 'failed').length
    const running = executions.filter(e => e.status === 'running').length
    const avgExecutionTime = total > 0
      ? Math.round(executions.reduce((sum, e) => sum + (e.execution_time_ms || 0), 0) / total)
      : 0
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, failed, running, avgExecutionTime, successRate }
  }, [executions])

  // Filter and paginate - MUST be before conditional returns
  const filteredExecutions = useMemo(() => {
    let filtered = executions
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter(execution => {
        const idLower = (execution.id || '').toLowerCase()
        let searchIndex = 0
        for (let i = 0; i < idLower.length && searchIndex < searchLower.length; i++) {
          if (idLower[i] === searchLower[searchIndex]) searchIndex++
        }
        return searchIndex === searchLower.length
      })
    }
    return filtered
  }, [executions, searchQuery, statusFilter])

  const paginatedExecutions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredExecutions.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredExecutions, currentPage, itemsPerPage])

  const totalPages = useMemo(
    () => Math.ceil(filteredExecutions.length / itemsPerPage),
    [filteredExecutions.length, itemsPerPage]
  )

  // Handlers - MUST be before conditional returns
  const viewExecutionDetails = useCallback((execution) => {
    setSelectedExecutionId(execution.id)
  }, [])

  // NOW we can do conditional logic - after all hooks are called
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  // Loading state
  if (authLoading || executionsLoading) {
    return <LoadingState message="Loading executions..." className="min-h-screen" />
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout>
        <div className="sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl">
          <NavigationBar profile={profile} title={workflow?.name || 'Execution History'} />
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Statistics */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Activity} label="Total Executions" value={statistics.total} colorClass="text-blue-400" bgClass="border-blue-600/20 bg-gradient-to-br from-blue-900/20 to-neutral-950/50" />
              <StatCard icon={CheckCircle} label="Completed" value={statistics.completed} subValue={`${statistics.successRate}% success rate`} colorClass="text-green-400" bgClass="border-green-600/20 bg-gradient-to-br from-green-900/20 to-neutral-950/50" />
              <StatCard icon={XCircle} label="Failed" value={statistics.failed} colorClass="text-red-400" bgClass="border-red-600/20 bg-gradient-to-br from-red-900/20 to-neutral-950/50" />
              <StatCard icon={Zap} label="Avg Duration" value={`${statistics.avgExecutionTime}ms`} colorClass="text-orange-400" bgClass="border-orange-600/20 bg-gradient-to-br from-orange-900/20 to-neutral-950/50" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Executions List */}
              <div id="executions-section">
                <Card className="border-blue-600/20 bg-gradient-to-br from-blue-900/20 to-blue-950/10 shadow-xl">
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-blue-400">Execution History</h2>
                      <Button size="sm" variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="h-3 w-3" />
                        Refresh
                      </Button>
                    </div>

                    <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by ID..." variant="blue" debounceMs={300} />

                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-neutral-400" />
                      <div className="flex flex-wrap gap-2">
                        {['all', 'completed', 'failed', 'running'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                              statusFilter === status
                                ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/50'
                                : 'bg-neutral-800/30 text-neutral-400 hover:bg-neutral-800/50'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)} ({status === 'all' ? statistics.total : statistics[status]})
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-neutral-400">
                      Showing {paginatedExecutions.length} of {filteredExecutions.length} executions
                    </p>
                  </div>

                  {filteredExecutions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Clock className="h-16 w-16 text-blue-400 mb-4" />
                      <p className="text-neutral-400">No executions found</p>
                    </div>
                  ) : (
                    <>
                      <div className="custom-scrollbar max-h-[50vh] space-y-3 overflow-y-auto pr-2">
                        {paginatedExecutions.map((execution) => (
                          <ExecutionCard
                            key={execution.id}
                            execution={execution}
                            isSelected={selectedExecutionId === execution.id}
                            onClick={() => viewExecutionDetails(execution)}
                            searchQuery={searchQuery}
                          />
                        ))}
                      </div>
                      {totalPages > 1 && (
                        <div className="mt-6 pt-6 border-t border-neutral-800/50">
                          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} maxVisible={5} variant="blue" />
                        </div>
                      )}
                    </>
                  )}
                </Card>
              </div>

              {/* Execution Details */}
              <Card className="border-orange-600/20 bg-gradient-to-br from-orange-900/20 to-orange-950/10 shadow-xl lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)]">
                {selectedExecution ? (
                  <div className="flex flex-col h-full">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-orange-400">Execution Details</h2>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedExecutionId(null)}>✕</Button>
                      </div>
                      <div className="mb-6 rounded-lg border border-orange-600/30 bg-gradient-to-br from-orange-900/30 to-orange-950/20 p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="block text-xs font-medium text-neutral-400 mb-2">Status</span>
                            <Badge variant={selectedExecution.status === 'completed' ? 'default' : selectedExecution.status === 'failed' ? 'destructive' : 'secondary'}>
                              {selectedExecution.status}
                            </Badge>
                          </div>
                          <div>
                            <span className="block text-xs font-medium text-neutral-400 mb-2">Duration</span>
                            <div className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-orange-400" />
                              <span className="font-semibold text-orange-300">{selectedExecution.execution_time_ms}ms</span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className="block text-xs font-medium text-neutral-400 mb-2">Started At</span>
                            <div className="flex items-center gap-2 text-neutral-200">
                              <Calendar className="h-4 w-4 text-neutral-500" />
                              <span>{format(new Date(selectedExecution.started_at), 'MMM d, yyyy h:mm:ss a')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="mb-4 font-semibold text-orange-300 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Execution Steps
                        <span className="text-xs text-neutral-500">({executionLogs.length} steps)</span>
                      </h3>
                      {logsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin text-orange-400" />
                        </div>
                      ) : (
                        <div className="custom-scrollbar max-h-[calc(100vh-32rem)] space-y-3 overflow-y-auto pr-2">
                          {executionLogs.map((log, index) => (
                            <LogEntry key={log.id} log={log} isLast={index === executionLogs.length - 1} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-16">
                    <Activity className="h-20 w-20 text-orange-400 mb-4" />
                    <p className="text-neutral-400 font-semibold">Select an execution</p>
                    <p className="mt-2 text-sm text-neutral-500 text-center max-w-xs">
                      Click on any execution to view detailed logs
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </SideBarLayout>
    </>
  )
}