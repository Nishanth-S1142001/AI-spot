'use client'

import {
  Bug,
  Lightbulb,
  MessageSquare,
  ThumbsUp
} from 'lucide-react'
import NavigationBar from '../../components/navigationBar/navigationBar'
import SideBarLayout from '../../components/sideBarLayout'
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
 * Skeleton Feedback Type Card
 */
function SkeletonFeedbackTypeCard({ icon: Icon }) {
  return (
    <div className='flex items-center space-x-4 rounded-xl border border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20 p-5'>
      <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-800'>
        <Icon className='h-6 w-6 text-neutral-500' />
      </div>

      <div className='flex-1 space-y-2'>
        <SkeletonPulse className='h-5 w-32 rounded' />
        <SkeletonPulse className='h-4 w-40 rounded' />
      </div>
    </div>
  )
}

/**
 * Main Feedback Page Skeleton Component
 */
export default function FeedbackPageSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='custom-scrollbar relative w-full flex-1 font-mono text-neutral-100'>
          {/* Header */}
          <div className='sticky top-0 z-10 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <div className='flex h-16 items-center px-6'>
              <NavigationBar
                profile={userProfile}
                message='Feedback'
                title='Help Us Improve'
                onLogOutClick={() => {}}
              />
            </div>
          </div>

          {/* Content */}
          <div className='mx-auto max-w-4xl space-y-8 p-6'>
            {/* Page Header */}
            <div className='text-center space-y-3'>
              <div className='flex justify-center'>
                <SkeletonPulse className='h-10 w-96 rounded' />
              </div>
              <div className='flex justify-center'>
                <SkeletonPulse className='h-5 w-[500px] rounded' />
              </div>
            </div>

            {/* Feedback Type Selection */}
            <div>
              <h2 className='mb-4 text-lg font-semibold text-neutral-200'>
                What type of feedback do you have?
              </h2>
              <div className='grid gap-4 sm:grid-cols-2'>
                <SkeletonFeedbackTypeCard icon={MessageSquare} />
                <SkeletonFeedbackTypeCard icon={Bug} />
                <SkeletonFeedbackTypeCard icon={Lightbulb} />
                <SkeletonFeedbackTypeCard icon={ThumbsUp} />
              </div>
            </div>

            {/* Feedback Form */}
            <Card className='border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20 p-6 shadow-xl shadow-neutral-950/50'>
              <div className='space-y-6'>
                {/* Rating Section */}
                <div>
                  <label className='mb-3 block text-sm font-medium text-neutral-300'>
                    How would you rate your experience?
                  </label>
                  <div className='flex items-center space-x-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <SkeletonPulse
                        key={star}
                        className='h-8 w-8 rounded'
                        style={{ animationDelay: `${star * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-neutral-300'>
                    Subject *
                  </label>
                  <SkeletonPulse className='h-11 w-full rounded-lg' />
                </div>

                {/* Message Field */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-neutral-300'>
                    Message *
                  </label>
                  <SkeletonPulse className='h-36 w-full rounded-lg' />
                </div>

                {/* File Upload Area */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-neutral-300'>
                    Attachments (Optional)
                  </label>
                  <div className='rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-900/20 p-6'>
                    <div className='flex flex-col items-center space-y-3'>
                      <SkeletonPulse className='h-8 w-8 rounded' />
                      <SkeletonPulse className='h-4 w-48 rounded' />
                      <SkeletonPulse className='h-3 w-56 rounded' />
                      <SkeletonPulse className='h-9 w-32 rounded-lg' />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className='flex gap-3 pt-4'>
                  <SkeletonPulse className='h-11 flex-1 rounded-lg' />
                  <SkeletonPulse className='h-11 w-24 rounded-lg' />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </SideBarLayout>

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