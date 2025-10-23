'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import Button from '../../../../components/ui/button'
import Card from '../../../../components/ui/card'
import Badge from '../../../../components/ui/badge'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import NeonBackground from '../../../../components/ui/background'
import SideBarLayout from '../../../../components/sideBarLayout'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import LoadingState from '../../../../components/common/loading-state'
import { useAuth } from '../../../../components/providers/AuthProvider'

export default function WorkflowExecutionsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { profile, logout, loading: authLoading } = useAuth()
  const [workflow, setWorkflow] = useState(null)
  const [executions, setExecutions] = useState([])
  const [fetching, setFetching] = useState(false)
  const [selectedExecution, setSelectedExecution] = useState(null)
  const [executionLogs, setExecutionLogs] = useState([])

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setFetching(true)
      const workflowRes = await fetch(`/api/workflows/${id}`)
      const workflowData = await workflowRes.json()
      setWorkflow(workflowData.workflow)

      const executionsRes = await fetch(`/api/workflows/${id}/executions`)
      const executionsData = await executionsRes.json()
      setExecutions(executionsData.executions || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load execution history')
    } finally {
      setFetching(false)
    }
  }

  const viewExecutionDetails = async (execution) => {
    try {
      const response = await fetch(
        `/api/workflows/${id}/executions/${execution.id}`
      )
      const data = await response.json()
      setSelectedExecution(data.execution)
      console.log('Fetched execution logs:', data.logs)
      setExecutionLogs(data.logs || [])
    } catch (error) {
      console.error('Error fetching execution details:', error)
      toast.error('Failed to load execution details')
    }
  }

  if (authLoading) {
    return (
      <LoadingState message='Loading executions...' className='min-h-screen' />
    )
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout>
        {fetching && <LoadingState message='Loading data...' />}
        {/* Header */}
        <div className='sticky top-0 z-10 flex h-16 items-center'>
          <NavigationBar
            profile={profile}
            title={workflow?.name || 'Execution History'}
            onLogOutClick={logout}
            fetchExecutionsData={fetchData}
            message='View and analyze past workflow executions'
            refresh='Refresh'
          />
        </div>

        <div className='relative mx-auto mt-4 flex w-full flex-col px-6 text-neutral-100'>
          {/* Refresh Button */}

          {/* Main Content */}
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Executions List */}
            <Card className='shadow-lg'>
              <h2 className='mb-4 text-xl font-semibold text-orange-400'>
                Recent Executions
              </h2>

              {executions.length === 0 ? (
                <div className='py-12 text-center text-neutral-400'>
                  <Clock className='mx-auto mb-3 h-10 w-10 text-neutral-500' />
                  <p>No executions yet</p>
                </div>
              ) : (
                <div className='custom-scrollbar max-h-[70vh] space-y-3 overflow-y-auto'>
                  {executions.map((execution) => (
                    <div
                      key={execution.id}
                      onClick={() => viewExecutionDetails(execution)}
                      className={`cursor-pointer rounded-lg border border-neutral-700 p-4 transition-all hover:bg-neutral-800 ${
                        selectedExecution?.id === execution.id
                          ? 'border-orange-500 bg-neutral-800/70'
                          : ''
                      }`}
                    >
                      <div className='mb-2 flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          {execution.status === 'completed' ? (
                            <CheckCircle className='h-5 w-5 text-green-400' />
                          ) : execution.status === 'failed' ? (
                            <XCircle className='h-5 w-5 text-red-400' />
                          ) : (
                            <Clock className='h-5 w-5 animate-spin text-blue-400' />
                          )}
                          <Badge
                            variant={
                              execution.status === 'completed'
                                ? 'default'
                                : execution.status === 'failed'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {execution.status}
                          </Badge>
                        </div>
                        <span className='text-xs text-neutral-400'>
                          {execution.execution_time_ms}ms
                        </span>
                      </div>
                      <div className='text-sm text-neutral-400'>
                        {format(
                          new Date(execution.created_at),
                          'MMM d, yyyy h:mm a'
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Execution Details */}
            <Card className='shadow-lg'>
              {selectedExecution ? (
                <div>
                  <h2 className='mb-4 text-xl font-semibold text-orange-400'>
                    Execution Details
                  </h2>

                  {/* Info */}
                  <div className='mb-4 rounded-lg bg-neutral-800/60 p-4 text-sm text-neutral-300'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <span className='text-neutral-400'>Status:</span>
                        <Badge
                          className='ml-2'
                          variant={
                            selectedExecution.status === 'completed'
                              ? 'default'
                              : selectedExecution.status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {selectedExecution.status}
                        </Badge>
                      </div>
                      <div>
                        <span className='text-neutral-400'>Duration:</span>
                        <span className='ml-2 font-medium text-orange-300'>
                          {selectedExecution.execution_time_ms}ms
                        </span>
                      </div>
                      <div className='col-span-2'>
                        <span className='text-neutral-400'>Started:</span>
                        <span className='ml-2'>
                          {format(
                            new Date(selectedExecution.started_at),
                            'MMM d, yyyy h:mm:ss a'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Execution Logs */}
                  <div>
                    <h3 className='mb-3 font-semibold text-orange-300'>
                      Execution Steps
                    </h3>
                    <div className='custom-scrollbar max-h-[55vh] space-y-3 overflow-y-auto'>
                      {executionLogs.map((log, index) => (
                        <div key={log.id} className='relative pl-8'>
                          {index < executionLogs.length - 1 && (
                            <div className='absolute top-6 bottom-0 left-2 w-0.5 bg-neutral-700' />
                          )}
                          <div className='absolute top-1 left-0'>
                            {log.status === 'completed' ? (
                              <CheckCircle className='h-4 w-4 text-green-400' />
                            ) : log.status === 'failed' ? (
                              <XCircle className='h-4 w-4 text-red-400' />
                            ) : (
                              <Clock className='h-4 w-4 text-blue-400' />
                            )}
                          </div>

                          <div className='rounded-lg border border-neutral-700 bg-neutral-800/80 p-3'>
                            <div className='mb-1 flex items-center justify-between'>
                              <span className='text-sm font-medium text-neutral-200'>
                                {log.node_name}
                              </span>
                              <span className='text-xs text-neutral-500'>
                                {log.execution_time_ms}ms
                              </span>
                            </div>

                            {log.error_message && (
                              <div className='mt-2 rounded bg-red-900/30 p-2 text-xs text-red-400'>
                                {log.error_message}
                              </div>
                            )}

                            {log.output_data && (
                              <details className='mt-2'>
                                <summary className='cursor-pointer text-xs text-neutral-400 hover:text-orange-400'>
                                  View Output
                                </summary>
                                <pre className='mt-1 overflow-x-auto rounded bg-neutral-900/70 p-2 text-xs text-neutral-300'>
                                  {JSON.stringify(log.output_data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className='py-12 text-center text-neutral-400'>
                  <Clock className='mx-auto mb-3 h-10 w-10 text-neutral-500' />
                  <p>Select an execution to view details</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </SideBarLayout>
    </>
  )
}
