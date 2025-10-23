import { Handle, Position } from 'reactflow'
import { Zap } from 'lucide-react'

export default function IntegrationNode({ data, selected }) {
  return (
    <div
      className={`rounded-lg border-2 bg-white shadow-lg ${
        selected ? 'border-orange-500' : 'border-orange-200'
      } min-w-[140px] max-w-[200px] h-fit`}
    >
      <Handle type='target' position={Position.Left} className='h-2 w-2' />

      <div className='p-2'>
        <div className='mb-1 flex items-center space-x-1'>
          <div className='flex h-6 w-6 items-center justify-center rounded bg-orange-100'>
            <Zap className='h-4 w-4 text-orange-600' />
          </div>
          <div className='flex-1'>
            <div className='font-semibold text-gray-900 text-sm'>
              {data.label || 'Integration'}
            </div>
            <div className='text-xs text-gray-500'>External Service</div>
          </div>
        </div>

        {data.config?.integrationType && (
          <div className='mt-1 rounded bg-gray-50 p-1 text-xs text-gray-600 capitalize'>
            {data.config.integrationType.replace('_', ' ')}
          </div>
        )}
      </div>

      <Handle type='source' position={Position.Right} className='h-2 w-2' />
    </div>
  )
}
