'use client'

import {
  Sparkles,
  Save,
  Play,
  Eye,
  GripVertical,
  Cpu,
  Code,
  GitBranch,
  Repeat,
  Clock,
  Zap,
  Rotate3D,
  Send
} from 'lucide-react'
import NavigationBar from '../../../components/navigationBar/navigationBar'
import SideBarLayout from '../../../components/sideBarLayout'
import NeonBackground from '../../../components/ui/background'
import Button from '../../../components/ui/button'

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
 * Skeleton Node Component
 */
function SkeletonNode({ className = '', size = 'normal' }) {
  const sizeClasses = {
    small: 'h-16 w-32',
    normal: 'h-20 w-40',
    large: 'h-24 w-48'
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg border border-neutral-700 bg-gradient-to-br from-neutral-900/50 to-neutral-950/30 ${className}`}
    >
      <div className='flex h-full flex-col items-center justify-center gap-2 p-3'>
        <SkeletonPulse className='h-6 w-6 rounded' />
        <SkeletonPulse className='h-3 w-16 rounded' />
      </div>
    </div>
  )
}

/**
 * Skeleton Edge/Connection Component
 */
function SkeletonEdge({ className = '' }) {
  return (
    <div className={`h-0.5 bg-gradient-to-r from-orange-600/30 to-orange-600/10 ${className}`} />
  )
}

/**
 * Skeleton Node Palette Icon
 */
function SkeletonNodeIcon({ icon: Icon, gradient, border, iconColor }) {
  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-xl border bg-gradient-to-br ${gradient} ${border}`}
    >
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>
  )
}

/**
 * Main Workflow Builder Page Skeleton Component
 */
export default function WorkflowBuilderPageSkeleton({ userProfile }) {
  const nodeDefinitions = [
    { icon: Cpu, gradient: 'from-purple-900/40 to-purple-950/20', border: 'border-purple-600/30', iconColor: 'text-purple-400' },
    { icon: Code, gradient: 'from-blue-900/40 to-blue-950/20', border: 'border-blue-600/30', iconColor: 'text-blue-400' },
    { icon: GitBranch, gradient: 'from-orange-900/40 to-orange-950/20', border: 'border-orange-600/30', iconColor: 'text-orange-400' },
    { icon: Repeat, gradient: 'from-green-900/40 to-green-950/20', border: 'border-green-600/30', iconColor: 'text-green-400' },
    { icon: Clock, gradient: 'from-neutral-900/40 to-neutral-950/20', border: 'border-neutral-600/30', iconColor: 'text-neutral-400' },
    { icon: Zap, gradient: 'from-yellow-900/40 to-yellow-950/20', border: 'border-yellow-600/30', iconColor: 'text-yellow-400' },
    { icon: Rotate3D, gradient: 'from-pink-900/40 to-pink-950/20', border: 'border-pink-600/30', iconColor: 'text-pink-400' },
    { icon: Send, gradient: 'from-cyan-900/40 to-cyan-950/20', border: 'border-cyan-600/30', iconColor: 'text-cyan-400' }
  ]

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title='Workflow Builder'
              onLogOutClick={() => {}}
            />

            <div className='flex h-16 items-center justify-between px-6'>
              {/* Left: Instructions and Status */}
              <div className='flex items-center gap-4'>
                <div className='flex items-center justify-center gap-2 bg-neutral-900/30 py-3 backdrop-blur-sm'>
                  <Sparkles className='h-4 w-4 text-orange-400' />
                  <span className='text-sm text-neutral-400'>
                    Drag nodes from the palette • Connect nodes • Click to configure
                  </span>
                  <Sparkles className='h-4 w-4 text-orange-400' />
                </div>

                <div className='h-6 w-px bg-neutral-700' />
                
                <div className='flex items-center justify-center gap-2 bg-neutral-900/30 py-3 backdrop-blur-sm'>
                  <span className='text-sm text-neutral-400'>
                    Ctrl + E to execute • Ctrl + S to save
                  </span>
                </div>

                <div className='h-6 w-px bg-neutral-700' />
              </div>

              {/* Right: Controls */}
              <div className='flex items-center gap-3'>
                {/* Status Toggle */}
                <div className='flex items-center gap-2'>
                  <SkeletonPulse className='h-8 w-14 rounded-full' />
                  <SkeletonPulse className='h-4 w-16 rounded' />
                </div>

                <div className='h-6 w-px bg-neutral-700' />

                {/* Action Buttons */}
                <Button
                  variant='outline'
                  size='sm'
                  disabled
                  className='flex items-center gap-2 border-neutral-700 opacity-50'
                >
                  <Eye className='h-4 w-4' />
                  <span className='hidden sm:inline'>History</span>
                </Button>

                <Button
                  size='sm'
                  disabled
                  className='flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 opacity-50'
                >
                  <Play className='h-4 w-4' />
                  <span className='hidden sm:inline'>Execute</span>
                </Button>

                <Button
                  size='sm'
                  disabled
                  className='flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 opacity-50'
                >
                  <Save className='h-4 w-4' />
                  <span className='hidden sm:inline'>Save</span>
                </Button>

                <div className='h-6 w-px bg-neutral-700' />
              </div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className='relative flex-1'>
            {/* Canvas Background with Grid Pattern */}
            <div className='absolute inset-0 bg-[#0a0a0a]'>
              <div 
                className='absolute inset-0 opacity-20'
                style={{
                  backgroundImage: 'linear-gradient(#404040 1px, transparent 1px), linear-gradient(90deg, #404040 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              />
              
              {/* Sample Workflow Layout */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='relative'>
                  {/* Trigger Node (Top) */}
                  <div className='absolute top-0 left-1/2 -translate-x-1/2'>
                    <SkeletonNode size='normal' />
                  </div>

                  {/* Vertical Connection */}
                  <div className='absolute top-24 left-1/2 h-16 w-0.5 -translate-x-1/2'>
                    <SkeletonEdge className='h-full w-full' />
                  </div>

                  {/* Middle Node */}
                  <div className='absolute top-40 left-1/2 -translate-x-1/2'>
                    <SkeletonNode size='large' />
                  </div>

                  {/* Branching Connections */}
                  <div className='absolute top-64 left-1/2 flex w-80 -translate-x-1/2 justify-between'>
                    <div className='flex flex-col items-center'>
                      <SkeletonEdge className='mb-4 h-12 w-0.5' />
                      <SkeletonNode size='normal' />
                    </div>
                    <div className='flex flex-col items-center'>
                      <SkeletonEdge className='mb-4 h-12 w-0.5' />
                      <SkeletonNode size='normal' />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Overlay (Bottom Left) */}
            <div className='absolute bottom-6 left-6 z-10'>
              <div className='rounded-lg border border-orange-600/30 bg-neutral-900/90 p-3 shadow-lg backdrop-blur-xl'>
                <div className='space-y-2'>
                  <SkeletonPulse className='h-8 w-8 rounded' />
                  <SkeletonPulse className='h-8 w-8 rounded' />
                  <SkeletonPulse className='h-8 w-8 rounded' />
                </div>
              </div>
            </div>

            {/* MiniMap Overlay (Bottom Right) */}
            <div className='absolute bottom-6 right-6 z-10'>
              <div className='h-32 w-48 rounded-lg border border-orange-600/30 bg-neutral-900/90 p-2 shadow-lg backdrop-blur-xl'>
                <div className='h-full w-full rounded bg-neutral-800/50'>
                  <div className='relative h-full w-full'>
                    {/* Mini nodes representation */}
                    <div className='absolute top-2 left-1/2 h-4 w-6 -translate-x-1/2 rounded-sm bg-orange-500/50' />
                    <div className='absolute top-8 left-1/2 h-4 w-6 -translate-x-1/2 rounded-sm bg-purple-500/50' />
                    <div className='absolute bottom-8 left-6 h-4 w-6 rounded-sm bg-blue-500/50' />
                    <div className='absolute bottom-8 right-6 h-4 w-6 rounded-sm bg-green-500/50' />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Node Palette */}
            <div className='absolute bottom-8 left-1/2 z-20 -translate-x-1/2'>
              <div className='group relative rounded-2xl border border-orange-600/40 bg-gradient-to-br from-neutral-900/98 to-neutral-950/98 p-3 shadow-2xl shadow-orange-500/10 backdrop-blur-xl'>
                {/* Drag Handle */}
                <div className='absolute -top-4 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border border-orange-600/40 bg-neutral-900 px-4 py-1.5 shadow-lg'>
                  <GripVertical className='h-3.5 w-3.5 text-orange-400' />
                  <span className='ml-2 text-xs font-semibold text-orange-400'>
                    Node Palette
                  </span>
                </div>

                {/* Node Icons Grid */}
                <div className='grid grid-cols-4 gap-2 px-2 pt-3'>
                  {nodeDefinitions.map((node, idx) => (
                    <SkeletonNodeIcon key={idx} {...node} />
                  ))}
                </div>

                {/* Info Footer */}
                <div className='mt-3 border-t border-neutral-800/50 pt-2 text-center'>
                  <p className='text-xs text-neutral-500'>
                    Drag nodes onto the canvas
                  </p>
                </div>
              </div>
            </div>

            {/* Loading Overlay */}
            <div className='absolute inset-0 flex items-center justify-center bg-neutral-950/50 backdrop-blur-sm'>
              <div className='text-center'>
                <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-500/20 border-t-orange-500' />
                <p className='text-lg font-semibold text-neutral-200'>
                  Loading Workflow Builder...
                </p>
                <p className='mt-2 text-sm text-neutral-400'>
                  Preparing your visual workflow editor
                </p>
              </div>
            </div>
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
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