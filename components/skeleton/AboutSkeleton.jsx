'use client'

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
 * Skeleton Hero Section
 */
function SkeletonHero() {
  return (
    <div className='mb-16 text-center'>
      <div className='mb-6 flex justify-center'>
        <SkeletonPulse className='h-24 w-24 rounded-full' />
      </div>
      <SkeletonPulse className='mx-auto mb-4 h-12 w-96 rounded' />
      <SkeletonPulse className='mx-auto h-6 w-full max-w-3xl rounded' />
      <SkeletonPulse className='mx-auto mt-2 h-6 w-2/3 rounded' />
    </div>
  )
}

/**
 * Skeleton Stat Card
 */
function SkeletonStatCard() {
  return (
    <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50 text-center'>
      <div className='flex flex-col items-center'>
        <SkeletonPulse className='mb-4 h-8 w-8 rounded' />
        <SkeletonPulse className='mb-2 h-10 w-24 rounded' />
        <SkeletonPulse className='h-4 w-32 rounded' />
      </div>
    </Card>
  )
}

/**
 * Skeleton Story Section
 */
function SkeletonStory() {
  return (
    <div className='mb-16'>
      <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
        <div className='space-y-6'>
          <div className='flex items-center gap-3'>
            <SkeletonPulse className='h-6 w-6 rounded' />
            <SkeletonPulse className='h-8 w-48 rounded' />
          </div>
          <div className='space-y-4'>
            <SkeletonPulse className='h-4 w-full rounded' />
            <SkeletonPulse className='h-4 w-full rounded' />
            <SkeletonPulse className='h-4 w-5/6 rounded' />
            <SkeletonPulse className='h-4 w-full rounded' />
            <SkeletonPulse className='h-4 w-4/5 rounded' />
            <SkeletonPulse className='h-4 w-full rounded' />
            <SkeletonPulse className='h-4 w-full rounded' />
            <SkeletonPulse className='h-4 w-3/4 rounded' />
          </div>
        </div>
      </Card>
    </div>
  )
}

/**
 * Skeleton Mission/Vision Card
 */
function SkeletonMissionVisionCard({ color = 'purple' }) {
  const colorClasses = {
    purple: 'border-purple-600/20 from-purple-950/10 to-neutral-950/50',
    green: 'border-green-600/20 from-green-950/10 to-neutral-950/50'
  }

  const colors = colorClasses[color] || colorClasses.purple

  return (
    <Card className={`border bg-gradient-to-br ${colors}`}>
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <SkeletonPulse className='h-6 w-6 rounded' />
          <SkeletonPulse className='h-7 w-40 rounded' />
        </div>
        <SkeletonPulse className='h-4 w-full rounded' />
        <SkeletonPulse className='h-4 w-5/6 rounded' />
        <div className='space-y-3'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className='flex items-start gap-3'>
              <SkeletonPulse className='h-5 w-5 flex-shrink-0 rounded-full' />
              <SkeletonPulse className='h-4 flex-1 rounded' />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

/**
 * Skeleton Value Card
 */
function SkeletonValueCard() {
  return (
    <Card className='border border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20'>
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <SkeletonPulse className='h-12 w-12 rounded-lg' />
          <SkeletonPulse className='h-6 w-32 rounded' />
        </div>
        <SkeletonPulse className='h-4 w-full rounded' />
        <SkeletonPulse className='h-4 w-5/6 rounded' />
      </div>
    </Card>
  )
}

/**
 * Skeleton Milestone Item
 */
function SkeletonMilestoneItem() {
  return (
    <div className='relative pl-20'>
      {/* Timeline Dot */}
      <div className='absolute left-6 top-2 h-5 w-5 rounded-full bg-neutral-700' />
      
      <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <SkeletonPulse className='h-7 w-16 rounded-full' />
            <SkeletonPulse className='h-6 w-48 rounded' />
          </div>
          <SkeletonPulse className='h-4 w-full rounded' />
          <SkeletonPulse className='h-4 w-4/5 rounded' />
        </div>
      </Card>
    </div>
  )
}

/**
 * Skeleton CTA Section
 */
function SkeletonCTA() {
  return (
    <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/20 to-neutral-950/50 text-center'>
      <div className='space-y-6'>
        <SkeletonPulse className='mx-auto h-8 w-96 rounded' />
        <SkeletonPulse className='mx-auto h-5 w-full max-w-2xl rounded' />
        <SkeletonPulse className='mx-auto mt-2 h-5 w-2/3 rounded' />
        <div className='flex flex-wrap justify-center gap-4'>
          <SkeletonPulse className='h-10 w-40 rounded-lg' />
          <SkeletonPulse className='h-10 w-32 rounded-lg' />
        </div>
      </div>
    </Card>
  )
}

/**
 * Main About Skeleton Component
 */
export default function AboutSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title='About Us'
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto bg-neutral-950/80'>
            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Hero Section */}
              <SkeletonHero />

              {/* Stats Grid */}
              <div className='mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
              </div>

              {/* Story Section */}
              <SkeletonStory />

              {/* Mission & Vision Section */}
              <div className='mb-16 grid gap-6 lg:grid-cols-2'>
                <SkeletonMissionVisionCard color='purple' />
                <SkeletonMissionVisionCard color='green' />
              </div>

              {/* Values Section */}
              <div className='mb-16'>
                <div className='mb-8 text-center'>
                  <SkeletonPulse className='mx-auto mb-2 h-8 w-48 rounded' />
                  <SkeletonPulse className='mx-auto h-5 w-96 rounded' />
                </div>
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  <SkeletonValueCard />
                  <SkeletonValueCard />
                  <SkeletonValueCard />
                  <SkeletonValueCard />
                  <SkeletonValueCard />
                  <SkeletonValueCard />
                </div>
              </div>

              {/* Timeline Section */}
              <div className='mb-16'>
                <div className='mb-8 text-center'>
                  <SkeletonPulse className='mx-auto mb-2 h-8 w-48 rounded' />
                  <SkeletonPulse className='mx-auto h-5 w-96 rounded' />
                </div>
                <div className='relative'>
                  {/* Timeline Line */}
                  <div className='absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-orange-600 to-orange-700' />
                  
                  {/* Timeline Items */}
                  <div className='space-y-8'>
                    <SkeletonMilestoneItem />
                    <SkeletonMilestoneItem />
                    <SkeletonMilestoneItem />
                    <SkeletonMilestoneItem />
                    <SkeletonMilestoneItem />
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <SkeletonCTA />
            </div>
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