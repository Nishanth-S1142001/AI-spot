'use client'

import {
  Activity,
  Blocks,
  Briefcase,
  Check,
  CreditCard,
  Mail,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Truck,
  Zap,
  Bot
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
 * Skeleton Stats Card
 */
function SkeletonStatsCard({ icon: Icon, color }) {
  const colorClasses = {
    orange: 'border-orange-600/20 from-orange-900/20 text-orange-400',
    blue: 'border-blue-600/20 from-blue-900/20 text-blue-400',
    green: 'border-green-600/20 from-green-900/20 text-green-400',
    purple: 'border-purple-600/20 from-purple-900/20 text-purple-400'
  }

  const iconBgClasses = {
    orange: 'bg-orange-900/40',
    blue: 'bg-blue-900/40',
    green: 'bg-green-900/40',
    purple: 'bg-purple-900/40'
  }

  return (
    <div
      className={`rounded-xl border ${colorClasses[color]} bg-gradient-to-br to-neutral-950/50 p-6`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1 space-y-2'>
          <SkeletonPulse className='h-4 w-24 rounded' />
          <SkeletonPulse className='h-8 w-16 rounded' />
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgClasses[color]}`}
        >
          <Icon className='h-6 w-6 text-neutral-500' />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton Category Button
 */
function SkeletonCategoryButton({ icon }) {
  return (
    <div className='flex items-center gap-2 whitespace-nowrap rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2'>
      {icon}
      <SkeletonPulse className='h-4 w-20 rounded' />
    </div>
  )
}

/**
 * Skeleton Integration Card
 */
function SkeletonIntegrationCard() {
  return (
    <div className='overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 p-6'>
      {/* Icon */}
      <div className='mb-4'>
        <SkeletonPulse className='h-12 w-12 rounded-lg' />
      </div>

      {/* Title */}
      <SkeletonPulse className='mb-2 h-6 w-32 rounded' />

      {/* Description */}
      <div className='mb-4 space-y-2'>
        <SkeletonPulse className='h-4 w-full rounded' />
        <SkeletonPulse className='h-4 w-3/4 rounded' />
      </div>

      {/* Metadata */}
      <div className='mb-4 flex items-center gap-3'>
        <SkeletonPulse className='h-5 w-16 rounded-full' />
        <SkeletonPulse className='h-5 w-12 rounded-full' />
      </div>

      {/* Action Button */}
      <SkeletonPulse className='h-9 w-full rounded-lg' />
    </div>
  )
}

/**
 * Main Integrations Page Skeleton Component
 */
export default function IntegrationsPageSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-xl'>
          <NavigationBar
            profile={userProfile}
            title='Integration Manager'
            onLogOutClick={() => {}}
          />
        </div>

        {/* Main Content */}
        <div className='custom-scrollbar min-h-screen overflow-y-auto font-mono'>
          <div className='mx-auto max-w-7xl px-6 py-8'>
            {/* Stats Grid */}
            <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <SkeletonStatsCard icon={Blocks} color='orange' />
              <SkeletonStatsCard icon={Check} color='green' />
              <SkeletonStatsCard icon={Activity} color='blue' />
              <SkeletonStatsCard icon={TrendingUp} color='purple' />
            </div>

            {/* Search and Filter */}
            <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              {/* Search */}
              <div className='w-full lg:w-96'>
                <SkeletonPulse className='h-10 w-full rounded-lg' />
              </div>

              {/* Category Filter */}
              <div className='flex gap-2 overflow-x-auto pb-2 lg:pb-0'>
                <SkeletonCategoryButton icon={<Blocks size={18} className='text-neutral-500' />} />
                <SkeletonCategoryButton icon={<CreditCard size={18} className='text-neutral-500' />} />
                <SkeletonCategoryButton icon={<MessageSquare size={18} className='text-neutral-500' />} />
                <SkeletonCategoryButton icon={<Mail size={18} className='text-neutral-500' />} />
                <SkeletonCategoryButton icon={<Briefcase size={18} className='text-neutral-500' />} />
                <SkeletonCategoryButton icon={<ShoppingCart size={18} className='text-neutral-500' />} />
                <SkeletonCategoryButton icon={<Truck size={18} className='text-neutral-500' />} />
                <SkeletonCategoryButton icon={<Bot size={18} className='text-neutral-500' />} />
                <SkeletonCategoryButton icon={<Zap size={18} className='text-neutral-500' />} />
              </div>
            </div>

            {/* Integrations Grid */}
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {Array.from({ length: 12 }).map((_, index) => (
                <SkeletonIntegrationCard key={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Custom Scrollbar */}
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

          .overflow-x-auto::-webkit-scrollbar {
            height: 2px;
          }

          .overflow-x-auto::-webkit-scrollbar-track {
            background: rgba(23, 23, 23, 0.3);
            border-radius: 3px;
          }

          .overflow-x-auto::-webkit-scrollbar-thumb {
            background: rgba(245, 158, 11, 0.3);
            border-radius: 3px;
            transition: background 0.2s;
          }

          .overflow-x-auto::-webkit-scrollbar-thumb:hover {
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
      </SideBarLayout>
    </>
  )
}