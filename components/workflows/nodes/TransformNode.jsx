import { Rotate3D } from 'lucide-react'
import { Handle, Position } from 'reactflow'

export default function TransformNode({ data }) {
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
      className={`flex flex-col items-center justify-center w-70 h-70 transition-transform duration-300 ${
        data.isExecuting ? 'scale-110 animate-pulse-glow' : ''
      }`}
    >
      <div
        className={`relative flex h-32 w-32 items-center justify-center rounded-full transition-all node-visual-circle ${
          data.isExecuting
            ? `bg-pink-600 ring-4 ${getExecutionColor()}`
            : 'bg-pink-500  '
        }`} data-node-type={data.nodeType}
      >
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

        <Rotate3D className='h-12 w-12 text-white' />

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
        {data.label || 'Transform'}
      </div>
    </div>
  )
}
