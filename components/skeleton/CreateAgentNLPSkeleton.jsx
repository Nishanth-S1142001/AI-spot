'use client'

import {
  MessageSquare,
  Sparkles,
  Bot,
  Send
} from 'lucide-react'
import NavigationBar from '../../components/navigationBar/navigationBar'
import SideBarLayout from '../../components/sideBarLayout'
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

/**
 * Skeleton Chat Message
 */
function SkeletonChatMessage({ isUser = false, delay = 0 }) {
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`flex max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* Avatar */}
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
            isUser
              ? 'bg-orange-900/40 ring-1 ring-orange-500/50'
              : 'bg-neutral-800/50 ring-1 ring-neutral-700/50'
          }`}
        >
          {isUser ? (
            <div className='h-4 w-4 rounded-full bg-orange-500/50' />
          ) : (
            <Bot className='h-4 w-4 text-neutral-500' />
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-orange-600/20 to-orange-700/10 border border-orange-600/30'
              : 'bg-neutral-900/50 border border-neutral-800/50'
          }`}
        >
          <div className='space-y-2'>
            <SkeletonPulse className='h-4 w-48 rounded' />
            <SkeletonPulse className='h-4 w-64 rounded' />
            <SkeletonPulse className='h-4 w-40 rounded' />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton Welcome Section
 */
function SkeletonWelcome() {
  return (
    <div className='flex flex-col items-center justify-center py-12 px-4'>
      {/* Central Icon */}
      <div className='relative mb-8'>
        <div className='absolute inset-0 animate-ping rounded-full bg-orange-500/20' />
        <div className='relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-600/40 to-orange-700/30 ring-1 ring-orange-500/50'>
          <Bot className='h-10 w-10 text-orange-400 opacity-50' />
        </div>
      </div>

      {/* Title */}
      <div className='mb-3 flex flex-col items-center gap-2'>
        <SkeletonPulse className='h-8 w-64 rounded' />
        <SkeletonPulse className='h-5 w-96 rounded' />
      </div>

      {/* Subtitle */}
      <SkeletonPulse className='mt-2 h-4 w-80 rounded' />

      {/* Feature Cards */}
      <div className='mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-3'>
        {[
          { icon: Sparkles, color: 'orange' },
          { icon: MessageSquare, color: 'blue' },
          { icon: Bot, color: 'purple' }
        ].map((item, index) => {
          const Icon = item.icon
          const colorClass = {
            orange: 'border-orange-600/20 bg-orange-900/10',
            blue: 'border-blue-600/20 bg-blue-900/10',
            purple: 'border-purple-600/20 bg-purple-900/10'
          }[item.color]

          return (
            <div
              key={index}
              className={`flex flex-col items-center gap-2 rounded-lg border ${colorClass} p-4 backdrop-blur-sm`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Icon className='h-6 w-6 text-neutral-500' />
              <SkeletonPulse className='h-4 w-24 rounded' />
              <SkeletonPulse className='h-3 w-32 rounded' />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Skeleton Input Area
 */
function SkeletonInputArea() {
  return (
    <div className='border-t border-neutral-800/50 bg-neutral-950/80 p-4 backdrop-blur-xl'>
      <div className='mx-auto flex max-w-4xl items-center gap-3'>
        {/* Input Field Skeleton */}
        <div className='flex-1 rounded-2xl border border-neutral-700/50 bg-neutral-900/50 px-4 py-3'>
          <SkeletonPulse className='h-5 w-full max-w-md rounded' />
        </div>

        {/* Send Button Skeleton */}
        <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-800/50 opacity-50'>
          <Send className='h-5 w-5 text-neutral-600' />
        </div>
      </div>

      {/* Helper Text */}
      <div className='mx-auto mt-3 flex max-w-4xl items-center justify-center gap-2'>
        <SkeletonPulse className='h-3 w-48 rounded' />
      </div>
    </div>
  )
}

/**
 * Main Create Agent NLP Skeleton Component
 */
export default function CreateAgentNLPSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title='AI Agent Builder'
              onLogOutClick={() => {}}
              promptCard={() => {}}
              collapsed={true}
            />
          </div>

          {/* Main Chat Area */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-4xl px-4 py-6'>
              {/* Welcome Section or Messages */}
              <div className='space-y-6'>
                {/* Option 1: Show welcome skeleton */}
                <SkeletonWelcome />

                {/* Option 2: Show some skeleton messages (uncomment to use) */}
                {/* 
                <SkeletonChatMessage isUser={true} delay={0} />
                <SkeletonChatMessage isUser={false} delay={100} />
                <SkeletonChatMessage isUser={true} delay={200} />
                */}
              </div>
            </div>
          </div>

          {/* Input Area */}
          <SkeletonInputArea />

          {/* Floating Action Button Skeleton */}
          <div className='fixed bottom-8 right-8 z-30 flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-600/50 to-orange-500/50 px-6 py-4 shadow-2xl opacity-50'>
            <Sparkles className='h-5 w-5 text-white' />
            <SkeletonPulse className='hidden h-5 w-32 rounded sm:block' />
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
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