import { Handle, Position } from 'reactflow'
import { Cpu } from 'lucide-react'

export default function AIAgentNode({ data }) {

  const getExecutionColor = () => {
    if (data.executionState === 'running') {
      return 'ring-orange-400 shadow-[0_0_30px_rgba(255,165,0,0.8)]'
    }
    if (data.executionState === 'success') {
      return 'ring-green-400 shadow-[0_0_30px_rgba(34,197,94,0.8)]'
    }
    if (data.executionState === 'error') {
      return 'ring-red-400 shadow-[0_0_30px_rgba(239,68,68,0.8)]'
    }
    return ''
  }
  return (
    <div
      className={`flex flex-col items-center justify-center bg-transparent w-70 h-70 transition-transform duration-300 ${
        data.isExecuting ? 'scale-110 animate-pulse-glow' : ''
      }`} 
    >
      <div
        className={`relative flex h-32 w-32 items-center justify-center rounded-full transition-all node-visual-circle
          ${data.isExecuting
            ? `bg-purple-500 ring-4 ${getExecutionColor()}`
            : 'bg-purple-400  '
          }`} data-node-type={data.nodeType}
      >
        {/* Target (left handle) */}
        <Handle
          type='target'
          position={Position.Left}
          style={{
            width: 12,
            height: 12,
            left: -6,
            background: 'var(--color-orange-500)',
            border: '2px solid var(--color-orange-400)',
            borderRadius: '50%',
          }}
        />

        <Cpu className='h-12 w-12 text-purple-100' />

        <Handle
          type='source'
          position={Position.Right}
          style={{
            width: 12,
            height: 12,
            right: -6,
            background: 'var(--color-orange-500)',
            border: '2px solid var(--color-orange-400)',
            borderRadius: '50%',
          }}
        />
      </div>

      <div className='mt-2 text-lg font-semibold text-neutral-200'>
        {data.label || 'AI Agent'}
      </div>

      {data.config?.method && (
        <div className='absolute bottom-[-20px] rounded bg-gray-50 p-1 text-xs text-gray-600'>
          {data.config.method} {data.config.url || 'Not configured'}
        </div>
      )}
    </div>
  )
}
