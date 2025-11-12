import { Code } from 'lucide-react'
import { Handle, Position } from 'reactflow'

export default function APICallNode({ data }) {

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
      {/* Execution highlight wrapper */}
      <div
        className={`relative flex h-32 w-32 items-center justify-center rounded-full transition-all node-visual-circle
          ${
            data.isExecuting
              ? `bg-blue-500 ring-4 ${getExecutionColor()}`
              : 'bg-blue-400  '
          }`} data-node-type={data.nodeType}
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
            borderRadius: '50%',
          }}
        />
        <Code className='h-12 w-12 text-blue-900' />
        {/* Source handle */}
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
        {data.label || 'API Call'}
      </div>

      <div className='text-xs text-gray-500'>HTTP Request</div>

      {data.config?.method && (
        <div className='mt-1 space-y-1'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-gray-500'>Method:</span>
            <span
              className={`rounded px-1 py-0.5 text-[10px] font-medium ${
                data.config.method === 'GET'
                  ? 'bg-green-100 text-green-700'
                  : data.config.method === 'POST'
                  ? 'bg-blue-100 text-blue-700'
                  : data.config.method === 'PUT'
                  ? 'bg-yellow-100 text-yellow-700'
                  : data.config.method === 'DELETE'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {data.config.method}
            </span>
          </div>

          {data.config.url && (
            <div className='truncate text-xs text-gray-600'>
              {data.config.url}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
