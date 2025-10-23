import { Handle, Position } from 'reactflow'
import { GitBranch } from 'lucide-react'

export default function ConditionNode({ data, selected }) {
  return (
    <div
      className={`rounded-lg border-2 bg-white shadow-lg ${
        selected ? 'border-yellow-500' : 'border-yellow-400'
      } min-w-[140px] max-w-[200px] h-fit`}
    >
      <Handle type='target' position={Position.Left} className='h-2 w-2' />

      <div className='p-2'>
        <div className='mb-1 flex items-center space-x-1'>
          <div className='flex h-6 w-6 items-center justify-center rounded bg-yellow-100'>
            <GitBranch className='h-4 w-4 text-yellow-600' />
          </div>
          <div className='flex-1'>
            <div className='font-semibold text-gray-900 text-sm'>
              {data.label || 'Condition'}
            </div>
            <div className='text-xs text-gray-500'>If/Else Logic</div>
          </div>
        </div>

        {data.config?.conditions && (
          <div className='mt-1 rounded bg-gray-50 p-1 text-xs text-gray-600'>
            {data.config.conditions.length} condition(s)
          </div>
        )}
      </div>

      <Handle
        type='source'
        position={Position.Right}
        id='true'
        className='h-2 w-2'
        style={{ top: '40%' }}
      />
      <Handle
        type='source'
        position={Position.Right}
        id='false'
        className='h-2 w-2'
        style={{ top: '60%' }}
      />
    </div>
  )
}
