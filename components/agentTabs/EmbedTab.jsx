'use client'
import Card from '../ui/card'
import Button from '../ui/button'
import { Copy } from 'lucide-react'

export default function EmbedTab({ id, copyEmbedCode }) {
  return (
    <div className='space-y-6'>
      <Card>
        <div className='card-header'>
          <h3 className='text-lg font-semibold text-neutral-200'>
            Website Embedding
          </h3>
          <p className='text-neutral-400'>
            Add this agent to your website with a simple iframe.
          </p>
        </div>
        <div className='card-content'>
          <div className='mb-4 rounded-lg bg-neutral-900 p-4'>
            <pre className='overflow-x-auto text-sm text-green-400'>{`<iframe
  src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${id}"
  width="350"
  height="500"
  frameborder="0">
</iframe>`}</pre>
          </div>
          <Button onClick={copyEmbedCode} variant='primary'>
            <div className='flex items-center'>
              <Copy className='mr-2 h-4 w-4' /> Copy Embed Code
            </div>
          </Button>
        </div>
      </Card>
    </div>
  )
}
