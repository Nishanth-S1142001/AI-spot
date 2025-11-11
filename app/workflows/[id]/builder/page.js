'use client'
import { useParams, useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
  lazy,
  Suspense
} from 'react'
import '../../../styles/workflow-builder.css'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MarkerType,
  MiniMap,
  useEdgesState,
  useNodesState,
  Panel
} from 'reactflow'
import 'reactflow/dist/style.css'

import {
  Clock,
  X,
  Code,
  Cpu,
  GitBranch,
  Repeat,
  Rotate3D,
  Send,
  Trash2,
  Zap,
  GripVertical,
  Sparkles,
  Save,
  Play,
  Eye,
  Maximize2,
  Minimize2
} from 'lucide-react'
import Button from '../../../../components/ui/button'
import FormInput from '../../../../components/ui/formInputField'
import LoadingState from '../../../../components/common/loading-state'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../../components/providers/AuthProvider'
import SideBarLayout from '../../../../components/sideBarLayout'
import NeonBackground from '../../../../components/ui/background'
import Card from '../../../../components/ui/card'
import { useLogout } from '../../../../lib/supabase/auth'
import {
  useWorkflow,
  useSaveWorkflow,
  useExecuteWorkflow,
  useToggleWorkflowStatus
} from '../../../../lib/hooks/useWorkflowData'

/**
 * FULLY OPTIMIZED WORKFLOW BUILDER
 *
 * React Query Integration:
 * - Automatic workflow data fetching with caching
 * - Optimistic updates for better UX
 * - No manual state management for server data
 * - Consistent with Dashboard patterns
 * 
 * Performance Improvements:
 * - Lazy loading of heavy components
 * - Memoized callbacks and components
 * - Optimized re-rendering with React.memo
 * - Better state management
 * - Reduced unnecessary updates
 * - Debounced save operations
 *
 * UI Improvements:
 * - Enhanced visual feedback for execution
 * - Better node palette design
 * - Improved controls and minimap styling
 * - Fullscreen mode
 * - Better loading states
 * - Enhanced animations
 */

// ✅ Lazy load heavy components
const AIAgentConfig = lazy(
  () => import('../../../../components/workflow/config/AIAgentConfig')
)
const APICallConfig = lazy(
  () => import('../../../../components/workflow/config/APICallConfig')
)
const ConditionConfig = lazy(
  () => import('../../../../components/workflow/config/ConditionConfig')
)
const IntegrationConfig = lazy(
  () => import('../../../../components/workflow/config/IntegrationConfig')
)

// ✅ Lazy load node components
const TriggerNode = lazy(
  () => import('../../../../components/workflows/nodes/TriggerNode')
)
const AIAgentNode = lazy(
  () => import('../../../../components/workflows/nodes/AIAgentNode')
)
const APICallNode = lazy(
  () => import('../../../../components/workflows/nodes/APICallNode')
)
const ConditionNode = lazy(
  () => import('../../../../components/workflows/nodes/ConditionNode')
)
const IntegrationNode = lazy(
  () => import('../../../../components/workflows/nodes/IntegrationNode')
)
const LoopNode = lazy(
  () => import('../../../../components/workflows/nodes/LoopNode')
)
const DelayNode = lazy(
  () => import('../../../../components/workflows/nodes/DelayNode')
)
const TransformNode = lazy(
  () => import('../../../../components/workflows/nodes/TransformNode')
)
const WebhookResponseNode = lazy(
  () => import('../../../../components/workflows/nodes/WebhookResponseNode')
)

// ✅ Memoized lazy wrapper with better skeleton
const LazyNodeWrapper = memo(({ Component, ...props }) => (
  <Suspense
    fallback={
      <div className='h-20 w-48 animate-pulse rounded-lg border border-neutral-700 bg-gradient-to-br from-neutral-900/50 to-neutral-950/30' />
    }
  >
    <Component {...props} />
  </Suspense>
))
LazyNodeWrapper.displayName = 'LazyNodeWrapper'

// ✅ Node types registry
const nodeTypes = {
  trigger: (props) => <LazyNodeWrapper Component={TriggerNode} {...props} />,
  ai_agent: (props) => <LazyNodeWrapper Component={AIAgentNode} {...props} />,
  api_call: (props) => <LazyNodeWrapper Component={APICallNode} {...props} />,
  condition: (props) => (
    <LazyNodeWrapper Component={ConditionNode} {...props} />
  ),
  integration: (props) => (
    <LazyNodeWrapper Component={IntegrationNode} {...props} />
  ),
  loop: (props) => <LazyNodeWrapper Component={LoopNode} {...props} />,
  delay: (props) => <LazyNodeWrapper Component={DelayNode} {...props} />,
  transform: (props) => (
    <LazyNodeWrapper Component={TransformNode} {...props} />
  ),
  webhook_response: (props) => (
    <LazyNodeWrapper Component={WebhookResponseNode} {...props} />
  )
}

// ✅ Node definitions with enhanced styling
const NODE_DEFINITIONS = [
  {
    type: 'ai_agent',
    icon: Cpu,
    label: 'AI Agent',
    gradient: 'from-purple-900/40 to-purple-950/20',
    border: 'border-purple-600/30',
    iconColor: 'text-purple-400',
    hoverShadow: 'hover:shadow-purple-500/20',
    description: 'Execute AI agent tasks'
  },
  {
    type: 'api_call',
    icon: Code,
    label: 'API Call',
    gradient: 'from-blue-900/40 to-blue-950/20',
    border: 'border-blue-600/30',
    iconColor: 'text-blue-400',
    hoverShadow: 'hover:shadow-blue-500/20',
    description: 'Make HTTP requests'
  },
  {
    type: 'condition',
    icon: GitBranch,
    label: 'Condition',
    gradient: 'from-orange-900/40 to-orange-950/20',
    border: 'border-orange-600/30',
    iconColor: 'text-orange-400',
    hoverShadow: 'hover:shadow-orange-500/20',
    description: 'Branch workflow logic'
  },
  {
    type: 'loop',
    icon: Repeat,
    label: 'Loop',
    gradient: 'from-green-900/40 to-green-950/20',
    border: 'border-green-600/30',
    iconColor: 'text-green-400',
    hoverShadow: 'hover:shadow-green-500/20',
    description: 'Iterate over arrays'
  },
  {
    type: 'delay',
    icon: Clock,
    label: 'Delay',
    gradient: 'from-neutral-900/40 to-neutral-950/20',
    border: 'border-neutral-600/30',
    iconColor: 'text-neutral-400',
    hoverShadow: 'hover:shadow-neutral-500/20',
    description: 'Wait before continuing'
  },
  {
    type: 'integration',
    icon: Zap,
    label: 'Integration',
    gradient: 'from-yellow-900/40 to-yellow-950/20',
    border: 'border-yellow-600/30',
    iconColor: 'text-yellow-400',
    hoverShadow: 'hover:shadow-yellow-500/20',
    description: 'Connect external services'
  },
  {
    type: 'transform',
    icon: Rotate3D,
    label: 'Transform',
    gradient: 'from-pink-900/40 to-pink-950/20',
    border: 'border-pink-600/30',
    iconColor: 'text-pink-400',
    hoverShadow: 'hover:shadow-pink-500/20',
    description: 'Map and transform data'
  },
  {
    type: 'webhook_response',
    icon: Send,
    label: 'Response',
    gradient: 'from-cyan-900/40 to-cyan-950/20',
    border: 'border-cyan-600/30',
    iconColor: 'text-cyan-400',
    hoverShadow: 'hover:shadow-cyan-500/20',
    description: 'Send webhook response'
  }
]

export default function WorkflowBuilderPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { id } = useParams()
  const router = useRouter()
  const { logout } = useLogout()
const userProfile = {
  name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
  email: user?.email || 'guest@example.com',
  avatar: profile?.avatar_url || null
}
  const reactFlowWrapper = useRef(null)
  const saveTimeoutRef = useRef(null)

  // ✅ React Query hooks - fully optimized data fetching
  const {
    data: workflowData,
    isLoading: workflowLoading,
    error: workflowError
  } = useWorkflow(id)

  // Mutations
  const saveWorkflow = useSaveWorkflow(id)
  const executeWorkflow = useExecuteWorkflow(id)
  const toggleWorkflowStatus = useToggleWorkflowStatus(id)

  // ✅ State management - UI state only
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [showNodeConfig, setShowNodeConfig] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executingNodes, setExecutingNodes] = useState(new Set())
  const [executingEdges, setExecutingEdges] = useState(new Set())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [palettePosition, setPalettePosition] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`palette-position-${id}`)
      return saved ? JSON.parse(saved) : { x: 0, y: 0 }
    }
    return { x: 0, y: 0 }
  })

  // ✅ Extract workflow data from React Query
  const workflow = workflowData?.workflow
  const isActive = workflow?.is_active || false

  // ✅ OPTIMIZATION: Memoized node label getter
  const getNodeLabel = useCallback((type) => {
    const labels = {
      trigger: 'Start',
      ai_agent: 'AI Agent',
      api_call: 'API Call',
      condition: 'Condition',
      loop: 'Loop',
      delay: 'Delay',
      transform: 'Transform',
      integration: 'Integration',
      webhook_response: 'Response'
    }
    return labels[type] || type
  }, [])

  // ✅ Initialize nodes and edges from workflow data
  useEffect(() => {
    if (!workflowData) return

    const loadedNodes = (workflowData.nodes || []).map((node) => ({
      id: node.node_id,
      type: node.node_type,
      position: { x: node.position_x, y: node.position_y },
      className: node.node_type,
      data: {
        label: node.node_name,
        config: node.config,
        isExecuting: false,
        nodeType: node.node_type
      }
    }))

    setNodes(
      loadedNodes.length > 0
        ? loadedNodes
        : [
            {
              id: 'trigger_1',
              type: 'trigger',
              position: { x: 250, y: 100 },
              className: 'trigger',
              data: {
                label: 'Start',
                nodeType: 'trigger'
              }
            }
          ]
    )

    const loadedEdges = (workflowData.edges || []).map((edge) => ({
      id: edge.edge_id,
      source: edge.source_node_id,
      target: edge.target_node_id,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: edge.condition,
      animated: false,
      style: { stroke: '#f97316', strokeWidth: 2 }
    }))

    setEdges(loadedEdges)
  }, [workflowData, setNodes, setEdges])

  // ✅ Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // ✅ Track unsaved changes
  useEffect(() => {
    if (workflowData && (nodes.length > 0 || edges.length > 0)) {
      setHasUnsavedChanges(true)
    }
  }, [nodes, edges, workflowData])

  // ✅ OPTIMIZATION: Update node execution states efficiently
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const isNodeExecuting = executingNodes.has(node.id)
        if (node.data.isExecuting !== isNodeExecuting) {
          return {
            ...node,
            className: `${node.type} ${isNodeExecuting ? 'executing' : ''}`,
            data: {
              ...node.data,
              isExecuting: isNodeExecuting
            }
          }
        }
        return node
      })
    )
  }, [executingNodes, setNodes])

  // ✅ OPTIMIZATION: Update edge execution states efficiently
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => {
        const isEdgeExecuting = executingEdges.has(edge.id)
        return {
          ...edge,
          animated: isEdgeExecuting,
          style: {
            ...edge.style,
            stroke: isEdgeExecuting ? '#fb923c' : '#f97316',
            strokeWidth: isEdgeExecuting ? 3 : 2,
            filter: isEdgeExecuting
              ? 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.8))'
              : 'drop-shadow(0 0 4px rgba(249, 115, 22, 0.3))'
          },
          className: isEdgeExecuting ? 'executing-edge' : ''
        }
      })
    )
  }, [executingEdges, setEdges])

  // ✅ OPTIMIZATION: Memoized connection handler
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed },
            animated: false,
            style: { stroke: '#f97316', strokeWidth: 2 }
          },
          eds
        )
      )
      setHasUnsavedChanges(true)
    },
    [setEdges]
  )

  // ✅ Drag handlers
  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type || !reactFlowInstance) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      })

      const newNode = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        className: type,
        data: {
          label: getNodeLabel(type),
          config: {},
          nodeType: type,
          isExecuting: false
        }
      }

      setNodes((nds) => nds.concat(newNode))
      setHasUnsavedChanges(true)
    },
    [reactFlowInstance, setNodes, getNodeLabel]
  )

  // ✅ Node click handler
  const onNodeClick = useCallback((event, node) => {
    if (node.type !== 'trigger') {
      setSelectedNode(node)
      setShowNodeConfig(true)
    }
  }, [])

  // ✅ Node drag handlers
  const onNodeDragStart = useCallback((event, node) => {
    const nodeElement = document.querySelector(`[data-id="${node.id}"]`)
    if (nodeElement) nodeElement.classList.add('dragging')
  }, [])

  const onNodeDragStop = useCallback((event, node) => {
    const nodeElement = document.querySelector(`[data-id="${node.id}"]`)
    if (nodeElement) nodeElement.classList.remove('dragging')
    setHasUnsavedChanges(true)
  }, [])

  // ✅ OPTIMIZATION: Update node config
  const updateNodeConfig = useCallback(
    (nodeId, config) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  config
                }
              }
            : node
        )
      )
      setHasUnsavedChanges(true)
    },
    [setNodes]
  )

  // ✅ Delete node
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode && selectedNode.type !== 'trigger') {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
        )
      )
      setExecutingEdges(new Set())
      setSelectedNode(null)
      setShowNodeConfig(false)
      setHasUnsavedChanges(true)
    }
  }, [selectedNode, setNodes, setEdges])

  // ✅ OPTIMIZATION: Debounced auto-save
  const autoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!hasUnsavedChanges) return

      const aiNode = nodes.find((n) => n.type === 'ai_agent')
      const workflowPayload = {
        nodes,
        edges,
        workflow_data: workflow?.workflow_data || {},
        agent_id: aiNode?.data?.config?.agentId || null,
        is_active: isActive
      }

      await saveWorkflow.mutateAsync(workflowPayload)
      setHasUnsavedChanges(false)
    }, 3000) // Auto-save after 3 seconds of inactivity
  }, [nodes, edges, workflow, isActive, hasUnsavedChanges, saveWorkflow])

  // ✅ Trigger auto-save on changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      autoSave()
    }
  }, [hasUnsavedChanges, autoSave])

  // ✅ Save workflow manually - using React Query mutation
  const handleSaveWorkflow = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `palette-position-${id}`,
        JSON.stringify(palettePosition)
      )
    }

    const aiNode = nodes.find((n) => n.type === 'ai_agent')
    const workflowPayload = {
      nodes,
      edges,
      workflow_data: workflow?.workflow_data || {},
      agent_id: aiNode?.data?.config?.agentId || null,
      is_active: isActive
    }

    await saveWorkflow.mutateAsync(workflowPayload)
    setHasUnsavedChanges(false)
  }, [nodes, edges, workflow, id, palettePosition, isActive, saveWorkflow])

  // ✅ OPTIMIZATION: Execute workflow with visual feedback - using React Query mutation
  const handleExecuteWorkflow = useCallback(async () => {
    if (!isActive) return

    try {
      setIsExecuting(true)
      setExecutingNodes(new Set())
      setExecutingEdges(new Set())

      const data = await executeWorkflow.mutateAsync({
        triggerData: { test: true, timestamp: Date.now() }
      })

      if (data.execution_path && Array.isArray(data.execution_path)) {
        setExecutingNodes(new Set([data.execution_path[0]]))
        await new Promise((resolve) => setTimeout(resolve, 400))

        for (let i = 0; i < data.execution_path.length - 1; i++) {
          const currentNodeId = data.execution_path[i]
          const nextNodeId = data.execution_path[i + 1]

          const edge = edges.find(
            (e) => e.source === currentNodeId && e.target === nextNodeId
          )

          if (edge) {
            setExecutingEdges(new Set([edge.id]))
            await new Promise((resolve) => setTimeout(resolve, 400))
          }

          setExecutingNodes(new Set([nextNodeId]))
          await new Promise((resolve) => setTimeout(resolve, 400))
        }

        setTimeout(() => {
          setExecutingNodes(new Set())
          setExecutingEdges(new Set())
        }, 2000)
      }
    } catch (error) {
      setExecutingNodes(new Set())
      setExecutingEdges(new Set())
    } finally {
      setIsExecuting(false)
    }
  }, [isActive, executeWorkflow, edges])

  // ✅ Toggle workflow active - using React Query mutation
  const handleToggleWorkflowActive = useCallback(async () => {
    const aiNode = nodes.find((n) => n.type === 'ai_agent')
    await toggleWorkflowStatus.mutateAsync({
      nodes,
      edges,
      workflow_data: workflow?.workflow_data || {},
      agent_id: aiNode?.data?.config?.agentId || null
    })
  }, [nodes, edges, workflow, toggleWorkflowStatus])

  // ✅ Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  // ✅ Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault()
          handleSaveWorkflow()
        } else if (e.key === 'e') {
          e.preventDefault()
          handleExecuteWorkflow()
        }
      } else if (e.key === 'Delete' && selectedNode) {
        deleteSelectedNode()
      } else if (e.key === 'Escape') {
        setShowNodeConfig(false)
        setSelectedNode(null)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleSaveWorkflow, handleExecuteWorkflow, selectedNode, deleteSelectedNode])

  // Loading state
  if (authLoading || workflowLoading) {
    return (
      <LoadingState
        message={authLoading ? 'Authenticating...' : 'Loading workflow...'}
        className='min-h-screen'
      />
    )
  }

  // Error state
  if (workflowError) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <Card className='max-w-md border-red-600/30 bg-gradient-to-br from-red-900/20 to-neutral-950/50'>
          <div className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/40'>
              <X className='h-8 w-8 text-red-400' />
            </div>
            <h3 className='mb-2 text-xl font-bold text-neutral-100'>Error</h3>
            <p className='text-sm text-neutral-400'>{workflowError.message}</p>
            <Button
              className='mt-6'
              onClick={() => router.push('/workflows')}
            >
              Back to Workflows
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
         <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
     
          {/* Header */}
          {!isFullscreen && (
            <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
              <NavigationBar
                profile={profile}
                title={workflow?.name || 'Workflow Builder'}
                onLogOutClick={logout}
              />

              <div className='flex h-16 items-center justify-between px-6'>
                {/* Left: Title and Status */}
                <div className='flex items-center gap-4'>
                  <div className='flex items-center justify-center gap-2 bg-neutral-900/30 py-3 text-center backdrop-blur-sm'>
                    <Sparkles className='h-4 w-4 text-orange-400' />
                    <span className='text-sm text-neutral-400'>
                      Drag nodes from the palette • Connect nodes • Click to
                      configure
                    </span>
                    <Sparkles className='h-4 w-4 text-orange-400' />
                  </div>

                  {hasUnsavedChanges && (
                    <div className='flex items-center gap-2 rounded-full bg-yellow-900/20 px-3 py-1 ring-1 ring-yellow-500/50'>
                      <div className='h-2 w-2 animate-pulse rounded-full bg-yellow-400' />
                      <span className='text-xs font-medium text-yellow-300'>
                        Unsaved changes
                      </span>
                    </div>
                  )}
                  <div className='h-6 w-px bg-neutral-700' />
                  <div className='flex items-center justify-center gap-2 bg-neutral-900/30 py-3 text-center backdrop-blur-sm'>
                    <span className='text-sm text-neutral-400'>
                      Ctrl + E to execute • Ctrl + S to save
                    </span>
                  </div>
                  <div className='h-6 w-px bg-neutral-700' />
                </div>

                {/* Right: Controls */}
                <div className='flex items-center gap-3'>
                  {/* Active/Inactive Toggle */}
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={handleToggleWorkflowActive}
                      disabled={toggleWorkflowStatus.isPending}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 ${
                        isActive ? 'bg-green-600' : 'bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                          isActive ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm font-medium ${isActive ? 'text-green-400' : 'text-neutral-500'}`}
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className='h-6 w-px bg-neutral-700' />

                  {/* History Button */}
                  <Button
                    onClick={() => router.push(`/workflows/${id}/executions`)}
                    variant='outline'
                    size='sm'
                    className='flex items-center gap-2 border-neutral-700 hover:border-blue-500/50 hover:bg-blue-950/20'
                  >
                    <Eye className='h-4 w-4' />
                    <span className='hidden sm:inline'>History</span>
                  </Button>

                  {/* Execute Button */}
                  <Button
                    onClick={handleExecuteWorkflow}
                    disabled={!isActive || isExecuting || executeWorkflow.isPending}
                    size='sm'
                    className='flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/20 hover:from-green-500 hover:to-green-400 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {isExecuting || executeWorkflow.isPending ? (
                      <>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        <span className='hidden sm:inline'>Executing...</span>
                      </>
                    ) : (
                      <>
                        <Play className='h-4 w-4' />
                        <span className='hidden sm:inline'>Execute</span>
                      </>
                    )}
                  </Button>

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveWorkflow}
                    disabled={saveWorkflow.isPending || !hasUnsavedChanges}
                    size='sm'
                    className='flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg shadow-orange-500/20 hover:from-orange-500 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {saveWorkflow.isPending ? (
                      <>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        <span className='hidden sm:inline'>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className='h-4 w-4' />
                        <span className='hidden sm:inline'>Save</span>
                      </>
                    )}
                  </Button>

                  <div className='h-6 w-px bg-neutral-700' />
                </div>
              </div>
            </div>
          )}

          {/* Main Canvas */}
          <div
            className={`flex flex-col ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-4rem)]'}`}
          >
            {/* Workflow Canvas */}
            <div
              className={`relative flex-1 transition-all ${
                isExecuting
                  ? 'shadow-[0_0_40px_rgba(255,165,0,0.5)] ring-4 ring-orange-400'
                  : ''
              }`}
              ref={reactFlowWrapper}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={(instance) => {
                  setReactFlowInstance(instance)
                  requestAnimationFrame(() => {
                    instance.setViewport({ x: 400, y: 200, zoom: 0.85 })
                  })
                }}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onNodeDragStart={onNodeDragStart}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                selectNodesOnDrag={false}
                nodesDraggable={!isExecuting}
                nodesConnectable={!isExecuting}
                elementsSelectable={!isExecuting}
                defaultEdgeOptions={{
                  animated: false,
                  style: { stroke: '#f97316', strokeWidth: 2 }
                }}
                fitView
                fitViewOptions={{ padding: 0.2 }}
              >
                <Background
                  color='#404040'
                  gap={16}
                  size={1}
                  style={{ backgroundColor: '#0a0a0a' }}
                />

                <Controls
                  position='bottom-left'
                  className='!bottom-15 !left-4 rounded-lg border border-orange-600/30 bg-neutral-900/90 shadow-lg backdrop-blur-xl'
                  showInteractive={false}
                />

                <MiniMap
                  position='bottom-right'
                  className='!right-4 !bottom-15 h-30 w-50 rounded-lg border border-orange-600/30 bg-neutral-900/90 shadow-lg backdrop-blur-xl'
                  zoomable
                  pannable
                  nodeColor={(node) => {
                    const def = NODE_DEFINITIONS.find(
                      (n) => n.type === node.type
                    )
                    if (def) {
                      const colors = {
                        'text-purple-400': '#c084fc',
                        'text-blue-400': '#60a5fa',
                        'text-orange-400': '#fb923c',
                        'text-green-400': '#4ade80',
                        'text-neutral-400': '#a3a3a3',
                        'text-yellow-400': '#facc15',
                        'text-pink-400': '#f472b6',
                        'text-cyan-400': '#22d3ee'
                      }
                      return colors[def.iconColor] || '#fb923c'
                    }
                    return '#fb923c'
                  }}
                  maskColor='rgba(0, 0, 0, 0.7)'
                />

                {/* Fullscreen Toggle */}
                <Panel position='top-right' className='m-4'>
                  <Button
                    onClick={toggleFullscreen}
                    variant='ghost'
                    size='sm'
                    className='bg-neutral-900/90 backdrop-blur-xl'
                  >
                    {isFullscreen ? (
                      <Minimize2 className='h-4 w-4' />
                    ) : (
                      <Maximize2 className='h-4 w-4' />
                    )}
                  </Button>
                </Panel>
              </ReactFlow>

              {/* Floating Node Palette */}
              {!isExecuting && (
                <FloatingNodePalette
                  position={palettePosition}
                  onPositionChange={setPalettePosition}
                />
              )}

              {/* Config Panel - Floating on Right */}
              {showNodeConfig && selectedNode && (
                <div className='fixed top-20 right-6 bottom-6 z-50 flex w-96 flex-col'>
                  <NodeConfigPanel
                    node={selectedNode}
                    onClose={() => {
                      setShowNodeConfig(false)
                      setSelectedNode(null)
                    }}
                    onSave={(config) => {
                      updateNodeConfig(selectedNode.id, config)
                      setShowNodeConfig(false)
                      setSelectedNode(null)
                    }}
                    onDelete={deleteSelectedNode}
                  />
                </div>
              )}

              {/* Execution Overlay */}
              {isExecuting && (
                <div className='absolute inset-0 z-40 cursor-not-allowed' />
              )}
            </div>
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(23, 23, 23, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 4px;
          transition: background 0.2s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.5);
        }
      `}</style>
    </>
  )
}

// ✅ OPTIMIZED: Memoized Floating Node Palette (no changes needed - already optimized)
const FloatingNodePalette = memo(
  ({ position: externalPosition, onPositionChange }) => {
    const [position, setPosition] = useState(externalPosition || { x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const paletteRef = useRef(null)

    useEffect(() => {
      if (externalPosition) {
        setPosition(externalPosition)
      }
    }, [externalPosition])

    const onDragStart = useCallback((event, nodeType) => {
      event.dataTransfer.setData('application/reactflow', nodeType)
      event.dataTransfer.effectAllowed = 'move'
    }, [])

    const handleMouseDown = useCallback(
      (e) => {
        if (e.target.closest('.node-icon-item')) return
        setIsDragging(true)
        setDragOffset({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        })
      },
      [position]
    )

    const handleMouseMove = useCallback(
      (e) => {
        if (!isDragging) return
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        }
        setPosition(newPosition)
      },
      [isDragging, dragOffset]
    )

    const handleMouseUp = useCallback(() => {
      if (isDragging && onPositionChange) {
        onPositionChange(position)
      }
      setIsDragging(false)
    }, [isDragging, position, onPositionChange])

    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
          window.removeEventListener('mousemove', handleMouseMove)
          window.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging, handleMouseMove, handleMouseUp])

    return (
      <div
        ref={paletteRef}
        onMouseDown={handleMouseDown}
        className={`fixed bottom-8 left-1/2 z-50 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)`,
          touchAction: 'none'
        }}
      >
        <div className='group relative rounded-2xl border border-orange-600/40 bg-gradient-to-br from-neutral-900/98 to-neutral-950/98 p-3 shadow-2xl shadow-orange-500/10 backdrop-blur-xl transition-all hover:border-orange-500/60 hover:shadow-orange-500/20'>
          {/* Drag Handle */}
          <div className='absolute -top-4 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border border-orange-600/40 bg-neutral-900 px-4 py-1.5 shadow-lg transition-all group-hover:border-orange-500/60 group-hover:shadow-orange-500/20'>
            <GripVertical className='h-3.5 w-3.5 text-orange-400' />
            <span className='ml-2 text-xs font-semibold text-orange-400'>
              Node Palette
            </span>
          </div>

          {/* Node Icons Grid */}
          <div className='grid grid-cols-4 gap-2 px-2 pt-3'>
            {NODE_DEFINITIONS.map((node) => {
              const Icon = node.icon
              return (
                <NodeIcon
                  key={node.type}
                  node={node}
                  Icon={Icon}
                  onDragStart={onDragStart}
                />
              )
            })}
          </div>

          {/* Info Footer */}
          <div className='mt-3 border-t border-neutral-800/50 pt-2 text-center'>
            <p className='text-xs text-neutral-500'>
              Drag nodes onto the canvas
            </p>
          </div>
        </div>
      </div>
    )
  }
)
FloatingNodePalette.displayName = 'FloatingNodePalette'

// ✅ OPTIMIZED: Memoized Node Icon (no changes needed - already optimized)
const NodeIcon = memo(({ node, Icon, onDragStart }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className='relative'>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, node.type)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`node-icon-item group relative flex h-14 w-14 cursor-move items-center justify-center rounded-xl border bg-gradient-to-br transition-all ${node.gradient} ${node.border} ${node.hoverShadow} hover:scale-110 hover:shadow-lg active:scale-95`}
      >
        <Icon
          className={`h-5 w-5 transition-transform group-hover:scale-110 ${node.iconColor}`}
        />
      </div>

      {/* Enhanced Tooltip */}
      {showTooltip && (
        <div className='pointer-events-none absolute -top-16 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap'>
          <div
            className={`rounded-lg border ${node.border} bg-neutral-900/98 px-3 py-2 shadow-xl backdrop-blur-xl`}
          >
            <div className={`text-sm font-semibold ${node.iconColor}`}>
              {node.label}
            </div>
            <div className='mt-0.5 text-xs text-neutral-400'>
              {node.description}
            </div>
          </div>
          <div
            className={`absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b ${node.border} bg-neutral-900`}
          />
        </div>
      )}
    </div>
  )
})
NodeIcon.displayName = 'NodeIcon'

// ✅ OPTIMIZED: Memoized Config Panel (no changes needed - already optimized)
const NodeConfigPanel = memo(({ node, onClose, onSave, onDelete }) => {
  const [config, setConfig] = useState(node.data.config || {})

  useEffect(() => {
    setConfig(node.data.config || {})
  }, [node])

  return (
    <Card className='animate-in slide-in-from-right flex h-full w-full flex-col border-orange-600/30 bg-gradient-to-br from-neutral-900/98 to-neutral-950/98 shadow-2xl shadow-orange-500/20 backdrop-blur-xl duration-200'>
      {/* Fixed Header */}
      <div className='flex-shrink-0 border-b border-orange-600/20 p-6 pb-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-bold text-orange-400'>
              Configure Node
            </h3>
            <p className='mt-1 text-xs text-neutral-500'>{node.data.label}</p>
          </div>
          <div className='flex space-x-2'>
            {node.type !== 'trigger' && (
              <button
                onClick={onDelete}
                className='rounded-lg p-2 transition-all hover:bg-red-900/20'
                title='Delete node'
              >
                <Trash2 className='h-4 w-4 text-red-400 transition-transform hover:scale-110' />
              </button>
            )}
            <button
              onClick={onClose}
              className='rounded-lg p-2 transition-all hover:bg-orange-900/20'
              title='Close'
            >
              <X className='h-4 w-4 text-orange-400 transition-transform hover:scale-110' />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='custom-scrollbar flex-1 overflow-y-auto p-6 pt-4'>
        <div className='space-y-6'>
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Node Type
            </label>
            <div className='rounded-lg border border-neutral-700/50 bg-neutral-900/50 px-3 py-2'>
              <p className='text-sm text-neutral-200 capitalize'>
                {node.type.replace('_', ' ')}
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className='rounded-lg bg-neutral-900/30 p-4 text-center'>
                <div className='mx-auto h-6 w-6 animate-spin rounded-full border-2 border-orange-400 border-t-transparent' />
                <p className='mt-2 text-sm text-neutral-400'>
                  Loading configuration...
                </p>
              </div>
            }
          >
            <NodeSpecificConfig
              nodeType={node.type}
              config={config}
              onChange={setConfig}
              onClose={onClose}
            />
          </Suspense>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className='flex-shrink-0 border-t border-orange-600/20 bg-neutral-900/50 p-6 pt-4'>
        <Button
          onClick={() => onSave(config)}
          className='w-full bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg shadow-orange-500/20 hover:from-orange-500 hover:to-orange-400'
        >
          <Save className='mr-2 h-4 w-4' />
          Save Configuration
        </Button>
      </div>
    </Card>
  )
})
NodeConfigPanel.displayName = 'NodeConfigPanel'

// ✅ Node Specific Config Components (no changes needed)
function NodeSpecificConfig({ nodeType, config, onChange, onClose }) {
  switch (nodeType) {
    case 'ai_agent':
      return (
        <AIAgentConfig config={config} onSave={onChange} onClose={onClose} />
      )
    case 'api_call':
      return (
        <APICallConfig config={config} onSave={onChange} onClose={onClose} />
      )
    case 'condition':
      return (
        <ConditionConfig config={config} onSave={onChange} onClose={onClose} />
      )
    case 'integration':
      return (
        <IntegrationConfig
          config={config}
          onSave={onChange}
          onClose={onClose}
        />
      )
    case 'loop':
      return <LoopConfig config={config} onSave={onChange} onClose={onClose} />
    case 'delay':
      return <DelayConfig config={config} onSave={onChange} onClose={onClose} />
    case 'transform':
      return (
        <TransformConfig config={config} onSave={onChange} onClose={onClose} />
      )
    default:
      return (
        <div className='rounded-lg border border-neutral-700/50 bg-neutral-900/50 p-4 text-center text-sm text-neutral-400'>
          <Sparkles className='mx-auto mb-2 h-6 w-6 text-neutral-600' />
          Configuration for {nodeType} coming soon...
        </div>
      )
  }
}

// ✅ Memoized Config Components (no changes needed - already optimized)
const DelayConfig = memo(({ config, onSave, onClose }) => {
  const [delayMs, setDelayMs] = useState(config?.delayMs || 1000)

  return (
    <div className='space-y-4'>
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-300'>
          Delay Duration (milliseconds)
        </label>
        <FormInput
          type='number'
          value={delayMs}
          onChange={(e) => setDelayMs(parseInt(e.target.value) || 0)}
          min='0'
          step='100'
          placeholder='1000'
          className='border-neutral-700/50 bg-neutral-900/50'
        />
        <p className='mt-2 text-xs text-neutral-400'>
          1000ms = 1 second • 60000ms = 1 minute
        </p>
      </div>
      <div className='flex space-x-3 pt-4'>
        <Button variant='outline' onClick={onClose} className='flex-1'>
          Cancel
        </Button>
        <Button
          onClick={() => onSave({ delayMs })}
          className='flex-1 bg-gradient-to-r from-orange-600 to-orange-500'
        >
          Save
        </Button>
      </div>
    </div>
  )
})
DelayConfig.displayName = 'DelayConfig'

const LoopConfig = memo(({ config, onSave, onClose }) => {
  const [arrayPath, setArrayPath] = useState(config?.arrayPath || '')
  const [itemVariable, setItemVariable] = useState(
    config?.itemVariable || 'item'
  )

  return (
    <div className='space-y-4'>
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-300'>
          Array Path
        </label>
        <FormInput
          value={arrayPath}
          onChange={(e) => setArrayPath(e.target.value)}
          placeholder='trigger_1.items'
          className='border-neutral-700/50 bg-neutral-900/50'
        />
        <p className='mt-2 text-xs text-neutral-400'>
          Path to the array you want to loop over
        </p>
      </div>
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-300'>
          Item Variable Name
        </label>
        <FormInput
          value={itemVariable}
          onChange={(e) => setItemVariable(e.target.value)}
          placeholder='item'
          className='border-neutral-700/50 bg-neutral-900/50'
        />
        <p className='mt-2 text-xs text-neutral-400'>
          Access each item as {'{{' + itemVariable + '}}'}
        </p>
      </div>
      <div className='flex space-x-3 pt-4'>
        <Button variant='outline' onClick={onClose} className='flex-1'>
          Cancel
        </Button>
        <Button
          onClick={() => onSave({ arrayPath, itemVariable })}
          className='flex-1 bg-gradient-to-r from-orange-600 to-orange-500'
        >
          Save
        </Button>
      </div>
    </div>
  )
})
LoopConfig.displayName = 'LoopConfig'

const TransformConfig = memo(({ config, onSave, onClose }) => {
  const [mappings, setMappings] = useState(config?.mappings || { output: '' })

  const updateMapping = useCallback((key, value) => {
    setMappings((prev) => ({ ...prev, [key]: value }))
  }, [])

  return (
    <div className='space-y-4'>
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-300'>
          Field Mappings
        </label>
        <p className='mb-3 text-xs text-neutral-400'>
          Map input fields to output fields
        </p>
        {Object.entries(mappings).map(([key, value]) => (
          <div key={key} className='mb-3 space-y-2'>
            <FormInput
              value={key}
              placeholder='Output field name'
              className='border-neutral-700/50 bg-neutral-900/50'
              disabled
            />
            <FormInput
              value={value}
              onChange={(e) => updateMapping(key, e.target.value)}
              placeholder='trigger_1.fieldName'
              className='border-neutral-700/50 bg-neutral-900/50'
            />
          </div>
        ))}
      </div>
      <div className='flex space-x-3 pt-4'>
        <Button variant='outline' onClick={onClose} className='flex-1'>
          Cancel
        </Button>
        <Button
          onClick={() => onSave({ mappings })}
          className='flex-1 bg-gradient-to-r from-orange-600 to-orange-500'
        >
          Save
        </Button>
      </div>
    </div>
  )
})
TransformConfig.displayName = 'TransformConfig'