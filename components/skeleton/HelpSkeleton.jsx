'use client'

import {
  BookOpen,
  CreditCard,
  HelpCircle,
  Mail,
  MessageSquare,
  Shield,
  Users,
  Zap
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
 * Skeleton Tab Button
 */
function SkeletonTabButton({ icon: Icon, delay = 0 }) {
  return (
    <div
      className='flex items-center gap-2 rounded-lg border border-neutral-700/50 px-4 py-2.5'
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className='h-4 w-4 text-neutral-500' />
      <SkeletonPulse className='h-4 w-20 rounded' />
      <SkeletonPulse className='h-4 w-8 rounded' />
    </div>
  )
}

/**
 * Skeleton FAQ Item
 */
function SkeletonFAQItem() {
  return (
    <Card className='border-neutral-700/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-start gap-3 flex-1'>
          <HelpCircle className='h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5' />
          <div className='flex-1 space-y-2'>
            <SkeletonPulse className='h-5 w-full max-w-xl rounded' />
            <SkeletonPulse className='h-5 w-3/4 rounded' />
          </div>
        </div>
        <SkeletonPulse className='h-5 w-5 rounded flex-shrink-0' />
      </div>
    </Card>
  )
}

/**
 * Skeleton Quick Link Card
 */
function SkeletonQuickLinkCard({ icon: Icon }) {
  return (
    <Card className='border-neutral-700/50'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/40'>
          <Icon className='h-5 w-5 text-neutral-500' />
        </div>
        <div className='flex-1 space-y-2'>
          <SkeletonPulse className='h-4 w-32 rounded' />
          <SkeletonPulse className='h-3 w-24 rounded' />
        </div>
      </div>
    </Card>
  )
}

/**
 * Main FAQ Page Skeleton Component
 */
export default function FAQPageSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title='FAQ'
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Header Section */}
              <div className='mb-8 text-center'>
                <div className='mb-4 flex justify-center'>
                  <div className='rounded-full bg-gradient-to-br from-orange-500 to-orange-600 p-4 opacity-50'>
                    <HelpCircle className='h-8 w-8 text-white' />
                  </div>
                </div>
                <h1 className='mb-3 text-4xl font-bold text-neutral-100'>
                  Frequently Asked Questions
                </h1>
                <p className='text-lg text-neutral-400'>
                  Find answers to common questions about AI-Spot
                </p>
              </div>

              {/* Search Bar */}
              <Card className='mb-8 border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
                <SkeletonPulse className='h-12 w-full rounded-lg' />
              </Card>

              {/* Tabs Navigation */}
              <div className='mb-6'>
                <div className='custom-scrollbar flex gap-2 overflow-x-auto pb-2'>
                  <SkeletonTabButton icon={HelpCircle} delay={0} />
                  <SkeletonTabButton icon={BookOpen} delay={50} />
                  <SkeletonTabButton icon={Zap} delay={100} />
                  <SkeletonTabButton icon={CreditCard} delay={150} />
                  <SkeletonTabButton icon={Shield} delay={200} />
                  <SkeletonTabButton icon={Users} delay={250} />
                  <SkeletonTabButton icon={MessageSquare} delay={300} />
                </div>
              </div>

              {/* Results Info & Controls */}
              <div className='mb-6 flex items-center justify-between'>
                <SkeletonPulse className='h-4 w-64 rounded' />
                <div className='flex gap-2'>
                  <SkeletonPulse className='h-8 w-24 rounded-lg' />
                  <SkeletonPulse className='h-8 w-24 rounded-lg' />
                </div>
              </div>

              {/* FAQ Items List */}
              <div className='space-y-3'>
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonFAQItem key={index} />
                ))}
              </div>

              {/* Quick Links */}
              <div className='mt-12'>
                <h3 className='mb-4 text-xl font-bold text-neutral-100'>
                  Still need help?
                </h3>
                <div className='grid gap-4 sm:grid-cols-3'>
                  <SkeletonQuickLinkCard icon={Mail} />
                  <SkeletonQuickLinkCard icon={BookOpen} />
                  <SkeletonQuickLinkCard icon={Zap} />
                </div>
              </div>

              {/* CTA Section */}
              <Card className='mt-8 border-orange-600/20 bg-gradient-to-br from-orange-950/20 to-neutral-950/50 text-center'>
                <div className='space-y-4'>
                  <h3 className='text-2xl font-bold text-neutral-100'>
                    Can&apos;t find what you&apos;re looking for?
                  </h3>
                  <p className='text-neutral-400'>
                    Our support team is here to help you succeed
                  </p>
                  <SkeletonPulse className='mx-auto h-10 w-40 rounded-lg' />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
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

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
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