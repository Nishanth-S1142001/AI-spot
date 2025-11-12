import { Zap } from 'lucide-react'
import { Handle, Position } from 'reactflow'

export default function IntegrationNode({ data, selected }) {
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
      {/* Node Visual */}
      <div
        className={`relative flex h-32 w-32 items-center justify-center rounded-full transition-all node-visual-circle ${
          data.isExecuting
            ? `bg-neutral-500 ring-4 ${getExecutionColor()}`
            : 'bg-neutral-400  '
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

        <Zap className='h-12 w-12 text-neutral-700' />

        {/* Source (right handle) */}
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
        {data.label || 'Integration'}
      </div>

      <div className='text-xs text-gray-500'>External Service</div>

      {data.config?.integrationType && (
        <div className='mt-1 rounded bg-gray-50 p-1 text-xs text-neutral-600 capitalize'>
          {data.config.integrationType.replace('_', ' ')}
        </div>
      )}
    </div>
  )
}
