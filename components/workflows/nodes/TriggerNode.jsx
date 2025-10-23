import { Handle, Position } from 'reactflow'
import { Zap } from 'lucide-react'

export default function TriggerNode({ data }) {
  return (
    <div className='min-w-[140px] rounded-lg bg-green-500 px-2 py-2 text-white shadow-lg h-fit'>
      <Handle type='source' position={Position.Right} className='h-2 w-2' />

      <div className='flex items-center space-x-1'>
        <Zap className='h-4 w-4' />
        <div>
          <div className='font-semibold text-sm'>{data.label || 'Start'}</div>
          <div className='text-xs opacity-90'>Trigger</div>
        </div>
      </div>
    </div>
  )
}
