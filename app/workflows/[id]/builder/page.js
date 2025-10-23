'use client'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import '../../../styles/workflow-builder.css'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MarkerType,
  MiniMap,
  useEdgesState,
  useNodesState
} from 'reactflow'
import 'reactflow/dist/style.css'
import AIAgentConfig from '../../../../components/workflow/config/AIAgentConfig'
import APICallConfig from '../../../../components/workflow/config/APICallConfig'
import ConditionConfig from '../../../../components/workflow/config/ConditionConfig'
import IntegrationConfig from '../../../../components/workflow/config/IntegrationConfig'

import {
  Clock,
  X,
  Code,
  Cpu,
  Cross,
  GitBranch,
  Repeat,
  Rotate3D,
  Send,
  Trash2,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../../../components/ui/button'
import FormInput from '../../../../components/ui/formInputField'
// Custom Node Components
import LoadingState from '../../../../components/common/loading-state'
import NavigationBar from '../../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../../components/providers/AuthProvider'
import SideBarLayout from '../../../../components/sideBarLayout'
import NeonBackground from '../../../../components/ui/background'
import AIAgentNode from '../../../../components/workflows/nodes/AIAgentNode'
import APICallNode from '../../../../components/workflows/nodes/APICallNode'
import ConditionNode from '../../../../components/workflows/nodes/ConditionNode'
import IntegrationNode from '../../../../components/workflows/nodes/IntegrationNode'
import TriggerNode from '../../../../components/workflows/nodes/TriggerNode'
import { supabase } from '../../../../lib/supabase/dbClient'
import { useLogout } from '../../../../lib/supabase/auth'
import Card from '../../../../components/ui/card'

const nodeTypes = {
  trigger: TriggerNode,
  ai_agent: AIAgentNode,
  api_call: APICallNode,
  condition: ConditionNode,
  integration: IntegrationNode
}

export default function WorkflowBuilderPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [authloading, setAuthLoading] = useState(true)
  const { id } = useParams()
  const router = useRouter()
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [workflow, setWorkflow] = useState(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [showNodeConfig, setShowNodeConfig] = useState(false)
  const [saving, setSaving] = useState(false)
  const heading = 'Drag and drop nodes to build your workflow'
  const [message, setMesaage] = useState(null)
  const { logout } = useLogout()
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!id || !user) return // wait for both to be ready
    fetchWorkflow()
  }, [id, user])

  const fetchWorkflow = async () => {
    try {
      setFetching(true)
      if (!user) return

      const response = await fetch(`/api/workflows/${id}`)
      const data = await response.json()

      setWorkflow(data.workflow)

      const loadedNodes = (data.nodes || []).map((node) => ({
        id: node.node_id,
        type: node.node_type,
        position: { x: node.position_x, y: node.position_y },
        data: {
          label: node.node_name,
          config: node.config
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
                data: { label: 'Start' }
              }
            ]
      )

      const loadedEdges = (data.edges || []).map((edge) => ({
        id: edge.edge_id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        markerEnd: { type: MarkerType.ArrowClosed },
        data: edge.condition
      }))
      setEdges(loadedEdges)
    } catch (error) {
      console.error('Error fetching workflow:', error)
      toast.error('Failed to load workflow')
    } finally {
      setFetching(false)
    }
  }
  useEffect(() => {
    if (workflow) {
      setIsActive(workflow.is_active)
    }
  }, [workflow])

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed }
          },
          eds
        )
      ),
    [setEdges]
  )
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session)
        router.push('/') // redirect if not logged in
      else setFetching(false)
    })
  }, [])
  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      })

      const newNode = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: {
          label: getNodeLabel(type),
          config: {}
        }
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes]
  )

  const getNodeLabel = (type) => {
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
  }

  const saveWorkflow = async () => {
    try {
      setSaving(true)
      const aiNode = nodes.find((n) => n.type === 'ai_agent')
      const workflowPayload = {
        nodes,
        edges,
        workflow_data: workflow.workflow_data || {},
        agent_id: aiNode?.data?.config?.agentId || null
      }
      const response = await fetch(`/api/workflows/${id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowPayload)
      })

      if (!response.ok) throw new Error('Failed to save workflow')

      toast.success('Workflow saved!')
    } catch (error) {
      console.error('Error saving workflow:', error)
      toast.error('Failed to save workflow')
    } finally {
      setSaving(false)
    }
  }

  const executeWorkflow = async () => {
    if (!isActive) {
      toast.error('Activate the workflow first!')
      return
    }

    try {
      const response = await fetch(`/api/workflows/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerData: { test: true, timestamp: Date.now() }
        })
      })

      if (!response.ok) throw new Error('Execution failed')

      const data = await response.json()
      toast.success('Workflow executed successfully!')
      console.log('Execution result:', data)
    } catch (error) {
      console.error('Error executing workflow:', error)
      toast.error('Workflow execution failed')
    }
  }

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
    setShowNodeConfig(true)
  }, [])

  const updateNodeConfig = (nodeId, config) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config
            }
          }
        }
        return node
      })
    )
  }
  const toggleWorkflowActive = async () => {
    try {
      const response = await fetch(`/api/workflows/${id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          workflow_data: workflow.workflow_data || {},
          is_active: !isActive // toggle current state
        })
      })

      if (!response.ok) throw new Error('Failed to update workflow status')

      setIsActive(!isActive)
      toast.success(
        `Workflow ${!isActive ? 'activated' : 'deactivated'} successfully!`
      )
    } catch (error) {
      console.error(error)
      toast.error('Failed to update workflow status')
    }
  }

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
        )
      )
      setSelectedNode(null)
      setShowNodeConfig(false)
    }
  }
  if (authLoading) {
    return (
      <LoadingState
        message='Loading...(Refresh the window if delayed)'
        className='min-h-screen'
      />
    )
  }
  return (
    <>
      {/* 1. Neon background stays fixed behind everything */}
      <NeonBackground />

      {/* 2. Entire content inside SideBarLayout */}
      <SideBarLayout>
        {fetching && <LoadingState message='Loading data...' />}
        <div className='relative w-full flex-1 font-mono text-neutral-100'>
          {/* Header (Sticky Navigation Area) */}
          <div className='sticky top-0 z-10 flex h-16 items-center'>
            <NavigationBar
              profile={profile}
              title={workflow?.name || 'Workflow Builder'}
              onLogOutClick={logout}
              historyPath={`/workflows/${id}/executions`}
              message={message}
              testRun={executeWorkflow}
              saveWorkflow={saveWorkflow}
              saving={saving}
            />
          </div>
          <Button
            onClick={toggleWorkflowActive}
            variant={isActive ? 'destructive' : 'default'}
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </Button>

          {/* Main Content */}
          <div className='flex h-[calc(100vh-4rem)] w-full flex-1 overflow-hidden pr-6'>
            {/* Node Palette (Sidebar) */}
            <NodePalette />

            {/* Workflow Canvas */}
            <div
              className='h-[calc(100vh-10rem)] flex-1'
              ref={reactFlowWrapper}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>

            {/* Node Configuration Panel */}
            {showNodeConfig && selectedNode && (
              <NodeConfigPanel
                node={selectedNode}
                onClose={() => setShowNodeConfig(false)}
                onSave={(config) => {
                  updateNodeConfig(selectedNode.id, config)
                  setShowNodeConfig(false)
                }}
                onDelete={deleteSelectedNode}
              />
            )}
          </div>
        </div>
      </SideBarLayout>
    </>
  )
}

function NodePalette() {
  const [isOpen, setIsOpen] = useState(true)
  const [width, setWidth] = useState(256) // default width when open
  const sidebarRef = useRef(null)
  const draggingRef = useRef(false)

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  // Handle mousedown on resize handle
  const onMouseDown = (e) => {
    draggingRef.current = true
    e.preventDefault()
  }

  const onMouseMove = (e) => {
    if (!draggingRef.current) return
    const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left
    if (newWidth >= 64 && newWidth <= 500) setWidth(newWidth) // min/max width
  }

  const onMouseUp = () => {
    draggingRef.current = false
  }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const nodeTypes = [
    {
      type: 'ai_agent',
      icon: Cpu,
      label: 'AI Agent',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      type: 'api_call',
      icon: Code,
      label: 'API Call',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      type: 'condition',
      icon: GitBranch,
      label: 'Condition',
      color: 'bg-yellow-100 text-yellow-700'
    },
    {
      type: 'loop',
      icon: Repeat,
      label: 'Loop',
      color: 'bg-green-100 text-green-700'
    },
    {
      type: 'delay',
      icon: Clock,
      label: 'Delay',
      color: 'bg-gray-100 text-gray-700'
    },
    {
      type: 'integration',
      icon: Zap,
      label: 'Integration',
      color: 'bg-orange-100 text-orange-700'
    },
    {
      type: 'transform',
      icon: Rotate3D,
      label: 'Transform',
      color: 'bg-pink-100 text-pink-700'
    },
    {
      type: 'webhook_response',
      icon: Send,
      label: 'Response',
      color: 'bg-indigo-100 text-indigo-700'
    }
  ]

  return (
    <div
      ref={sidebarRef}
      className={`relative flex flex-col bg-neutral-900 font-mono transition-all`}
      style={{
        width: isOpen ? width : 64,
        height: 'calc(100vh - 4rem)', // matches the canvas height
        overflowY: 'auto' // makes the sidebar scroll instead of overflowing
      }}
    >
      {/* Toggle button */}
      <button
        className={`absolute right-0 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white shadow transition-all duration-300 ${
          isOpen ? 'top-[50%] -right-0' : 'top-[50%] -right-0'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '<' : '>'}
      </button>

      {/* Header */}
      {isOpen && (
        <h3 className='mt-2 flex h-14 items-center justify-center font-mono text-xl text-white transition-transform'>
          Node panel
        </h3>
      )}

      {/* Nodes */}
      <div className='mt-2 flex flex-1 flex-col space-y-2 overflow-y-auto p-2'>
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className={`flex h-16 w-full cursor-move items-center justify-start space-x-4 rounded-md p-2 shadow shadow-orange-300 transition-colors hover:bg-neutral-700`}
            onDragStart={(e) => onDragStart(e, node.type)}
            draggable
          >
            <node.icon className='h-6 w-6 text-orange-500' />
            {isOpen && (
              <span className='text-lg font-medium'>{node.label}</span>
            )}
          </div>
        ))}
      </div>

      {/* Resize handle */}
      {isOpen && (
        <div
          onMouseDown={onMouseDown}
          className='absolute top-0 right-0 h-full w-[1px] cursor-col-resize bg-neutral-500'
        />
      )}
    </div>
  )
}

function NodeConfigPanel({ node, onClose, onSave, onDelete }) {
  const [config, setConfig] = useState(node.data.config || {})
  useEffect(() => {
    setConfig(node.data.config || {})
  }, [node])

  return (
    <Card
      className='custom-scrollbar mt-10 max-h-[calc(100vh-4rem)] overflow-y-auto p-4'
      style={{
        width: 'max-content', // card width grows to fit content
        minWidth: '300px', // don't get too narrow
        maxWidth: '90vw' // never exceed 90% of viewport
      }}
    >
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='font-semibold text-orange-500'>Configure Node</h3>
        <div className='flex space-x-2'>
          <button onClick={onDelete}>
            <Trash2 className='h-4 w-4 cursor-pointer text-red-600' />
          </button>
          <button onClick={onClose}>
            <X className='h-4 w-4 cursor-pointer text-orange-600' />
          </button>
        </div>
      </div>

      <div className='space-y-4'>
        <div>
          <label className='mb-2 block text-sm font-medium text-neutral-200'>
            Node Type
          </label>
          <p className='text-sm text-neutral-300 capitalize'>
            {node.type.replace('_', ' ')}
          </p>
        </div>

        <NodeSpecificConfig
          nodeType={node.type}
          config={config}
          onChange={setConfig}
        />

        <div className='border-t border-orange-500 pt-4'>
          <Button onClick={() => onSave(config)} className='w-full'>
            Save Configuration
          </Button>
        </div>
      </div>
    </Card>
  )
}

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
        <div className='text-sm text-neutral-400'>
          Configuration for {nodeType} coming soon...
        </div>
      )
  }
}

function DelayConfig({ config, onSave, onClose }) {
  const [delayMs, setDelayMs] = useState(config?.delayMs || 1000)

  return (
    <div className='space-y-4'>
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-400'>
          Delay Duration (milliseconds)
        </label>
        <FormInput
          type='number'
          value={delayMs}
          onChange={(e) => setDelayMs(parseInt(e.target.value))}
          min='0'
          placeholder='1000'
        />
        <p className='mt-1 text-xs text-neutral-400'>1000ms = 1 second</p>
      </div>
      <div className='flex justify-between space-x-3 pt-4'>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onSave({ delayMs })}>Submit</Button>
      </div>
    </div>
  )
}

function LoopConfig({ config, onSave, onClose }) {
  const [arrayPath, setArrayPath] = useState(config?.arrayPath || '')
  const [itemVariable, setItemVariable] = useState(
    config?.itemVariable || 'item'
  )

  return (
    <div className='space-y-4'>
      <div>
        <label className='font-mediumtext-neutral-400 mb-2 block text-sm'>
          Array Path
        </label>
        <FormInput
          value={arrayPath}
          onChange={(e) => setArrayPath(e.target.value)}
          placeholder='trigger_1.items'
        />
        <p className='mt-1 text-xs text-neutral-400'>
          Path to the array you want to loop over
        </p>
      </div>
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-400'>
          Item Variable Name
        </label>
        <FormInput
          value={itemVariable}
          onChange={(e) => setItemVariable(e.target.value)}
          placeholder='item'
        />
        <p className='mt-1 text-xs text-neutral-400'>
          Access each item as {'{{' + itemVariable + '}}'}
        </p>
      </div>
      <div className='flex justify-between space-x-3 pt-4'>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onSave({ arrayPath, itemVariable })}>
          Submit
        </Button>
      </div>
    </div>
  )
}

function TransformConfig({ config, onSave, onClose }) {
  const [mappings, setMappings] = useState(config?.mappings || { output: '' })

  const updateMapping = (key, value) => {
    setMappings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className='space-y-4'>
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-400'>
          Field Mappings
        </label>
        <p className='mb-2 text-xs text-neutral-400'>
          Map FormInput fields to output fields
        </p>
        {Object.entries(mappings).map(([key, value]) => (
          <div key={key} className='mb-2'>
            <FormInput
              value={key}
              placeholder='Output field name'
              className='mb-1'
              disabled
            />
            <FormInput
              value={value}
              onChange={(e) => updateMapping(key, e.target.value)}
              placeholder='trigger_1.fieldName'
            />
          </div>
        ))}
      </div>
      <div className='flex justify-between space-x-3 pt-4'>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onSave({ mappings })}>Submit</Button>
      </div>
    </div>
  )
}
