import { Handle, Position } from 'reactflow'
import { Cpu } from 'lucide-react'

export default function AIAgentNode({ data, selected }) {
  return (
    <div
      className={`rounded-lg border-2 bg-white shadow-lg ${
        selected ? 'border-purple-500' : 'border-purple-200'
      } min-w-[80px] max-w-[200px] h-fit`}
    >
      <Handle type='target' position={Position.Left} className='h-10 w-10' />

      <div className='p-2'>
        <div className='mb-1 flex items-center space-x-1'>
          <div className='flex h-6 w-6 items-center justify-center rounded bg-purple-100'>
            <Cpu className='h-4 w-4 text-purple-600' />
          </div>
          <div className='flex-1'>
            <div className='font-semibold text-gray-900 text-sm'>
              {data.label || 'AI Agent'}
            </div>
            <div className='text-xs text-gray-500'>Process with AI</div>
          </div>
        </div>

        {data.config?.method && (
          <div className='mt-1 rounded bg-gray-50 p-1 text-xs text-gray-600'>
            {data.config.method} {data.config.url || 'Not configured'}
          </div>
        )}
      </div>

      <Handle type='source' position={Position.Right} className='h-2 w-2' />
    </div>
  )
}
