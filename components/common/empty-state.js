import { Inbox } from 'lucide-react'

export default function EmptyState({
  title = 'No data available',
  message = 'Try adjusting your filters or add new content.'
}) {
  return (
    <div className='flex flex-col items-center justify-center py-12 text-center text-gray-500'>
      <Inbox className='mb-3 h-10 w-10 text-gray-400' />
      <h3 className='text-lg font-medium'>{title}</h3>
      <p className='mt-1 text-sm text-gray-400'>{message}</p>
    </div>
  )
}
