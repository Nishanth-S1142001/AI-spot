import { Handle, Position } from 'reactflow'
import { GitBranch } from 'lucide-react'

export default function ConditionNode({ data }) {
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
      className={`flex h-70 w-70 flex-col items-center justify-center bg-transparent transition-transform duration-300 ${
        data.isExecuting ? 'animate-pulse-glow scale-110' : ''
      }`}
    >
      <div
        className={`node-visual-circle relative flex h-32 w-32 items-center justify-center rounded-full transition-all ${
          data.isExecuting
            ? `bg-yellow-500 ring-4 ${getExecutionColor()}`
            : 'bg-yellow-400'
        }`}
        data-node-type={data.nodeType}
      >
        {/* Target handle */}
        <Handle
          type='target'
          position={Position.Left}
          style={{
            width: 12,
            height: 12,
            left: -6,
            background: 'var(--color-orange-500)',
            border: '2px solid var(--color-orange-400)',
            borderRadius: '50%'
          }}
        />

        <GitBranch className='h-12 w-12 text-yellow-700' />

        {/* True Handle */}
        {/* True Handle (Green) */}
        <Handle
          type='source'
          position={Position.Right}
          id='true'
          className='handle-green'
          style={{
            top: '30%',
            width: 12,
            height: 12,
            right: -6,
            borderRadius: '50%'
          }}
        />

        {/* False Handle (Red) */}
        <Handle
          type='source'
          position={Position.Right}
          id='false'
          className='handle-red'
          style={{
            top: '70%',
            width: 12,
            height: 12,
            right: -6,
            borderRadius: '50%'
          }}
        />
      </div>

      <div className='mt-2 text-lg font-semibold text-neutral-200'>
        {data.label || 'Condition'}
      </div>

      <div className='text-xs text-neutral-500'>If/Else Logic</div>

      {data.config?.conditions && (
        <div className='mt-1 rounded bg-gray-50 p-1 text-xs text-gray-600'>
          {data.config.conditions.length} condition(s)
        </div>
      )}
    </div>
  )
}
