'use client'

import {
  Bot,
  Calendar,
  Check,
  FileText,
  Globe,
  Settings
} from 'lucide-react'
import NavigationBar from '../../components/navigationBar/navigationBar'
import NeonBackground from '../../components/ui/background'

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

// Ring step configuration
const RING_STEPS = [
  {
    id: 1,
    label: 'Basic Info',
    icon: Settings,
    color: 'orange',
    angle: 0
  },
  {
    id: 2,
    label: 'Services',
    icon: Calendar,
    color: 'blue',
    angle: 72
  },
  {
    id: 3,
    label: 'Interface',
    icon: Globe,
    color: 'green',
    angle: 144
  },
  {
    id: 4,
    label: 'Knowledge',
    icon: FileText,
    color: 'purple',
    angle: 216
  },
  {
    id: 5,
    label: 'Review',
    icon: Check,
    color: 'pink',
    angle: 288
  }
]

const RING_COLORS = {
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-500',
    text: 'text-orange-300'
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-500',
    text: 'text-blue-300'
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-500',
    text: 'text-green-300'
  },
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-500',
    text: 'text-purple-300'
  },
  pink: {
    border: 'border-pink-500',
    bg: 'bg-pink-500',
    text: 'text-pink-300'
  }
}

/**
 * Main Create Agent Skeleton Component
 */
export default function CreateAgentSkeleton({ userProfile }) {
  // Calculate ring positions
  const getRingPosition = (angle, radius) => {
    const radian = (angle - 90) * (Math.PI / 180)
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    }
  }

  return (
    <>
      <NeonBackground />
      <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
          <NavigationBar
            profile={userProfile}
            title='Create Agent'
            onLogOutClick={() => {}}
          />
        </div>

        {/* Main Content - Orbital Interface */}
        <div className='custom-scrollbar flex-1 overflow-y-auto'>
          <div className='flex min-h-[calc(100vh-73px)] items-center justify-center p-8'>
            <div className='relative flex h-[600px] w-[600px] items-center justify-center'>
              {/* Background blur glow */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='h-[500px] w-[500px] rounded-full bg-orange-500/20 blur-[100px]' />
              </div>

              {/* Central Agent Node */}
              <div className='relative z-10 flex flex-col items-center justify-center'>
                <div className='group relative mx-auto flex h-36 w-36 items-center justify-center'>
                  {/* Pulse rings */}
                  <div className='agent-pulse absolute h-36 w-36 rounded-full bg-orange-600/50' />
                  <div
                    className='agent-pulse absolute h-48 w-48 rounded-full bg-orange-600/20'
                    style={{ animationDelay: '0.5s' }}
                  />

                  {/* Central node */}
                  <div className='relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-orange-500 bg-gradient-to-br from-orange-600 to-orange-700 shadow-2xl shadow-orange-500/50'>
                    <Bot className='h-14 w-14 text-white opacity-50' />
                  </div>
                </div>

                {/* Agent name placeholder */}
                <div className='mt-6 flex flex-col items-center gap-2'>
                  <SkeletonPulse className='h-6 w-40 rounded' />
                  <SkeletonPulse className='h-4 w-32 rounded' />
                </div>
              </div>

              {/* Orbital Ring Steps */}
              {RING_STEPS.map((step) => {
                const pos = getRingPosition(step.angle, 220)
                const colors = RING_COLORS[step.color]
                const StepIcon = step.icon

                return (
                  <div
                    key={step.id}
                    className='absolute z-20 cursor-not-allowed opacity-60'
                    style={{
                      left: `calc(50% + ${pos.x}px)`,
                      top: `calc(50% + ${pos.y}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {/* Main ring */}
                    <div
                      className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-neutral-700 bg-neutral-900/90 backdrop-blur-sm`}
                    >
                      <StepIcon className={`h-8 w-8 ${colors.text}`} />
                    </div>

                    {/* Label */}
                    <div className='absolute top-24 left-1/2 -translate-x-1/2 whitespace-nowrap'>
                      <p className='text-sm font-semibold text-neutral-400'>
                        {step.label}
                      </p>
                    </div>

                    {/* Connection line to center - dashed */}
                    <div
                      className='absolute top-1/2 left-1/2 origin-left'
                      style={{
                        width: '220px',
                        height: '2px',
                        transform: `rotate(${step.angle + 180}deg) translateX(-50%)`,
                        borderTop: '2px dashed rgba(115, 115, 115, 0.3)'
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes agent-pulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.1;
            transform: scale(1.1);
          }
        }

        .agent-pulse {
          animation: agent-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

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