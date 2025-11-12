'use client'

import {
  Aperture,
  ArrowLeft,
  MessageCircle,
  Users,
  Zap
} from 'lucide-react'
import NeonBackground from '../../components/ui/background'
import Card from '../../components/ui/card'

/**
 * Skeleton Pulse Animation Component
 */
function SkeletonPulse({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-neutral-800/50 via-neutral-700/50 to-neutral-800/50 bg-[length:200%_100%] ${className}`}
      style={{
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
    />
  )
}

/**
 * Skeleton Chat Message
 */
function SkeletonChatMessage({ isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl ${
          isUser
            ? 'bg-gradient-to-br from-orange-600 to-orange-700'
            : 'border border-neutral-800/50 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50'
        }`}
      >
        <SkeletonPulse className={`h-12 ${isUser ? 'w-48' : 'w-64'} rounded-2xl`} />
      </div>
    </div>
  )
}

/**
 * Skeleton Quick Action Button
 */
function SkeletonQuickAction() {
  return (
    <div className='flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2'>
      <SkeletonPulse className='h-4 w-4 rounded' />
      <SkeletonPulse className='h-4 w-24 rounded' />
    </div>
  )
}

/**
 * Skeleton Color Option
 */
function SkeletonColorOption() {
  return <SkeletonPulse className='h-8 w-8 rounded-full' />
}

/**
 * Main Chat Sandbox Skeleton Component
 */
export default function ChatSandboxSkeleton() {
  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
        {/* Sticky Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
          <div className='flex h-16 items-center justify-between px-6'>
            <div className='flex items-center space-x-4'>
              <button className='rounded-lg p-2'>
                <ArrowLeft className='h-5 w-5 text-neutral-400' />
              </button>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-900/40 ring-1 ring-orange-500/50'>
                  <Aperture className='h-6 w-6 text-orange-400' />
                </div>
                <div className='space-y-1'>
                  <h1 className='text-lg font-bold text-neutral-100'>
                    Agent Testing Sandbox
                  </h1>
                  <SkeletonPulse className='h-3 w-32 rounded' />
                </div>
              </div>
            </div>

            <div className='flex items-center gap-6 text-sm'>
              <div className='flex items-center gap-2'>
                <Zap className='h-4 w-4 text-purple-400' />
                <SkeletonPulse className='h-4 w-20 rounded' />
              </div>
              <div className='flex items-center gap-2'>
                <MessageCircle className='h-4 w-4 text-green-400' />
                <SkeletonPulse className='h-4 w-16 rounded' />
              </div>
              <SkeletonPulse className='h-8 w-36 rounded-lg' />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='custom-scrollbar flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-7xl px-6 py-8'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
              {/* Left Sidebar - Settings */}
              <div className='space-y-6 lg:col-span-3'>
                <Card className='border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20'>
                  <div className='space-y-6'>
                    {/* Header */}
                    <div>
                      <h3 className='text-lg font-bold text-neutral-100'>
                        <span className='text-orange-400'>Quick</span> Actions
                      </h3>
                      <p className='mt-1 text-xs text-neutral-500'>
                        Manage your test session
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className='space-y-3'>
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <SkeletonQuickAction key={idx} />
                      ))}
                    </div>

                    {/* Bot Accent Color */}
                    <div className='space-y-3 border-t border-neutral-800/50 pt-4'>
                      <label className='block text-sm font-medium text-neutral-300'>
                        Bot Accent Color
                      </label>

                      {/* Color Palette */}
                      <div className='flex flex-wrap gap-2'>
                        {Array.from({ length: 10 }).map((_, idx) => (
                          <SkeletonColorOption key={idx} />
                        ))}
                      </div>

                      {/* Mode Buttons */}
                      <div className='grid grid-cols-3 gap-2'>
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <SkeletonPulse key={idx} className='h-8 w-full rounded-lg' />
                        ))}
                      </div>

                      {/* Manual Color Input */}
                      <SkeletonPulse className='h-9 w-full rounded-lg' />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Main Chat Interface */}
              <div className='lg:col-span-9'>
                <Card className='flex h-[calc(100vh-180px)] flex-col border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20'>
                  {/* Chat Header */}
                  <div className='flex items-center justify-between border-b border-neutral-800/50 bg-neutral-900/50 p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='relative'>
                        <div className='absolute inset-0 bg-orange-500/50 opacity-50 blur-lg' />
                        <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-900/40 ring-1 ring-orange-500/50'>
                          <Aperture className='h-5 w-5 text-orange-400' />
                        </div>
                      </div>
                      <div className='space-y-1'>
                        <SkeletonPulse className='h-4 w-32 rounded' />
                        <SkeletonPulse className='h-3 w-24 rounded' />
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 w-2 animate-pulse rounded-full bg-green-400' />
                      <span className='text-sm text-neutral-400'>Online</span>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className='custom-scrollbar flex-1 space-y-4 overflow-y-auto bg-neutral-900/30 p-4'>
                    <SkeletonChatMessage isUser={false} />
                    <SkeletonChatMessage isUser={true} />
                    <SkeletonChatMessage isUser={false} />
                    <SkeletonChatMessage isUser={true} />
                    <SkeletonChatMessage isUser={false} />
                  </div>

                  {/* Input Area */}
                  <div className='border-t border-neutral-800/50 bg-neutral-900/50 p-4'>
                    <div className='flex gap-3'>
                      <SkeletonPulse className='h-11 flex-1 rounded-lg' />
                      <SkeletonPulse className='h-11 w-20 rounded-lg' />
                    </div>
                    <p className='mt-2 text-xs text-neutral-500'>
                      Press{' '}
                      <kbd className='rounded bg-neutral-800 px-1.5 py-0.5'>
                        Enter
                      </kbd>{' '}
                      to send
                    </p>
                  </div>

                  {/* Quick Test Messages */}
                  <div className='border-t border-neutral-800/50 bg-neutral-900/50 p-4'>
                    <h4 className='mb-3 text-sm font-medium text-neutral-300'>
                      Quick Tests
                    </h4>
                    <div className='grid grid-cols-2 gap-2 lg:grid-cols-3'>
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <SkeletonPulse key={idx} className='h-8 w-full rounded-lg' />
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(23, 23, 23, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 4px;
          transition: background 0.2s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.5);
        }

        @keyframes pulse {
          0%,
          100% {
            background-position: 0% 0%;
            opacity: 1;
          }
          50% {
            background-position: 100% 0%;
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  )
}