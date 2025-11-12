'use client'

import { Check, Code, Copy, ExternalLink, Sparkles } from 'lucide-react'
import { useState } from 'react'

import Button from '../ui/button'
import Card from '../ui/card'

/**
 * OPTIMIZED Embed Tab Component
 * 
 * Improvements:
 * - Better copy feedback
 * - Enhanced code display
 * - Multiple embed options
 * - Improved UI matching reference
 */

export default function EmbedTab({ id, copyEmbedCode }) {
  const [copied, setCopied] = useState(false)
  const [selectedSize, setSelectedSize] = useState('default')

  const embedSizes = {
    default: { width: 350, height: 500, label: 'Default' },
    compact: { width: 300, height: 400, label: 'Compact' },
    large: { width: 450, height: 650, label: 'Large' }
  }

  const currentSize = embedSizes[selectedSize]
  const embedCode = `<iframe
  src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${id}"
  width="${currentSize.width}"
  height="${currentSize.height}"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
</iframe>`

  const handleCopy = () => {
    copyEmbedCode(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='mb-6'>
        <h3 className='text-2xl font-bold text-neutral-100'>Website Embedding</h3>
        <p className='mt-1 text-sm text-neutral-400'>
          Add your AI agent to any website with a simple embed code
        </p>
      </div>

      {/* Main Embed Card */}
      <Card className='border-purple-600/20 bg-gradient-to-br from-purple-950/10 to-neutral-950/50'>
        <div className='space-y-6'>
          {/* Size Selector */}
          <div>
            <label className='mb-3 block text-sm font-medium text-neutral-300'>
              Embed Size
            </label>
            <div className='flex gap-2'>
              {Object.entries(embedSizes).map(([key, size]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSize(key)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    selectedSize === key
                      ? 'border-purple-500/50 bg-purple-900/40 text-purple-300'
                      : 'border-neutral-700 bg-neutral-900/50 text-neutral-400 hover:border-neutral-600'
                  }`}
                >
                  {size.label}
                  <span className='ml-2 text-xs text-neutral-500'>
                    {size.width}×{size.height}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Display */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <label className='text-sm font-medium text-neutral-300'>
                Embed Code
              </label>
              <Button
                onClick={handleCopy}
                variant='ghost'
                size='sm'
                className='gap-2'
              >
                {copied ? (
                  <>
                    <Check className='h-4 w-4 text-green-400' />
                    <span className='text-green-400'>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className='h-4 w-4' />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            <div className='relative rounded-lg border border-neutral-700 bg-neutral-950/80 p-4'>
              <pre className='custom-scrollbar overflow-x-auto text-xs text-green-400'>
                {embedCode}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-3'>
            <Button onClick={handleCopy} className='flex-1'>
              {copied ? (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className='mr-2 h-4 w-4' />
                  Copy Embed Code
                </>
              )}
            </Button>
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL}/embed/${id}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Button variant='outline' className='flex items-center gap-2'>
                <ExternalLink className='h-4 w-4' />
                Preview
              </Button>
            </a>
          </div>
        </div>
      </Card>

      {/* Features Grid */}
      <div className='grid gap-4 sm:grid-cols-2'>
        <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900/40'>
              <Code className='h-5 w-5 text-blue-400' />
            </div>
            <div>
              <h4 className='font-semibold text-neutral-200'>Easy Integration</h4>
              <p className='mt-1 text-sm text-neutral-400'>
                Just copy and paste the code into your website
              </p>
            </div>
          </div>
        </Card>

        <Card className='border-green-600/20 bg-gradient-to-br from-green-950/10 to-neutral-950/50'>
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-900/40'>
              <Sparkles className='h-5 w-5 text-green-400' />
            </div>
            <div>
              <h4 className='font-semibold text-neutral-200'>Responsive Design</h4>
              <p className='mt-1 text-sm text-neutral-400'>
                Works perfectly on all devices and screen sizes
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Instructions */}
      <Card className='border-orange-600/20'>
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-900/40'>
              <Code className='h-4 w-4 text-orange-400' />
            </div>
            <h4 className='text-lg font-semibold text-neutral-100'>
              How to Embed
            </h4>
          </div>

          <ol className='space-y-3 text-sm text-neutral-300'>
            <li className='flex gap-3'>
              <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-900/40 text-xs font-bold text-orange-400'>
                1
              </span>
              <span>Copy the embed code above</span>
            </li>
            <li className='flex gap-3'>
              <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-900/40 text-xs font-bold text-orange-400'>
                2
              </span>
              <span>Paste it into your website's HTML where you want the chat to appear</span>
            </li>
            <li className='flex gap-3'>
              <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-900/40 text-xs font-bold text-orange-400'>
                3
              </span>
              <span>Customize the width and height values if needed</span>
            </li>
            <li className='flex gap-3'>
              <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-900/40 text-xs font-bold text-orange-400'>
                4
              </span>
              <span>Save and publish your website - your agent is now live!</span>
            </li>
          </ol>
        </div>
      </Card>
    </div>
  )
}