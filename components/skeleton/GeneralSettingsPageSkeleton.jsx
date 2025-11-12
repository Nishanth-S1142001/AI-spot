'use client'

import {
  ArrowLeft,
  Bell,
  Camera,
  Lock,
  Mail,
  User
} from 'lucide-react'
import Link from 'next/link'
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
 * Skeleton Notification Toggle
 */
function SkeletonNotificationToggle() {
  return (
    <div className='flex items-center justify-between p-4 rounded-lg bg-neutral-900/50 border border-neutral-800'>
      <div className='flex-1 space-y-2'>
        <SkeletonPulse className='h-4 w-40 rounded' />
        <SkeletonPulse className='h-3 w-64 rounded' />
      </div>
      <SkeletonPulse className='h-6 w-11 rounded-full' />
    </div>
  )
}

/**
 * Main General Settings Page Skeleton Component
 */
export default function GeneralSettingsPageSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title='General Settings'
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Back Link */}
              <Link 
                href='/settings' 
                className='inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 mb-6 transition-colors'
              >
                <ArrowLeft className='h-4 w-4' />
                Back to Settings
              </Link>

              {/* Page Header */}
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-2'>
                  <User className='h-8 w-8 text-orange-500' />
                  <h1 className='text-3xl font-bold text-neutral-100'>
                    General Settings
                  </h1>
                </div>
                <p className='text-neutral-400'>
                  Manage your profile information, security, and preferences
                </p>
              </div>

              <div className='space-y-8'>
                {/* Profile Information Section */}
                <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
                  <div className='mb-6'>
                    <div className='flex items-center gap-3 mb-2'>
                      <User className='h-5 w-5 text-orange-400' />
                      <h2 className='text-xl font-semibold text-neutral-100'>
                        Profile Information
                      </h2>
                    </div>
                    <p className='text-sm text-neutral-400'>
                      Update your personal information and email address
                    </p>
                  </div>

                  <div className='space-y-6'>
                    {/* Avatar Section */}
                    <div>
                      <label className='block text-sm font-medium text-neutral-300 mb-3'>
                        Profile Picture
                      </label>
                      <div className='flex items-center gap-6'>
                        <div className='relative'>
                          <div className='h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white opacity-50'>
                            U
                          </div>
                          <div className='absolute bottom-0 right-0 rounded-full bg-orange-600 p-2'>
                            <Camera className='h-3 w-3 text-white' />
                          </div>
                        </div>
                        <div className='space-y-2'>
                          <SkeletonPulse className='h-9 w-32 rounded-lg' />
                          <SkeletonPulse className='h-3 w-40 rounded' />
                        </div>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className='block text-sm font-medium text-neutral-300 mb-2'>
                        Full Name
                      </label>
                      <SkeletonPulse className='h-10 w-full rounded-lg' />
                    </div>

                    {/* Email */}
                    <div>
                      <label className='block text-sm font-medium text-neutral-300 mb-2'>
                        Email Address
                      </label>
                      <div className='relative'>
                        <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500' />
                        <SkeletonPulse className='h-10 w-full rounded-lg' />
                      </div>
                      <SkeletonPulse className='h-3 w-80 rounded mt-1' />
                    </div>

                    {/* Submit Button */}
                    <div className='flex justify-end pt-4 border-t border-neutral-800'>
                      <SkeletonPulse className='h-10 w-36 rounded-lg' />
                    </div>
                  </div>
                </Card>

                {/* Password & Security Section */}
                <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
                  <div className='mb-6'>
                    <div className='flex items-center gap-3 mb-2'>
                      <Lock className='h-5 w-5 text-blue-400' />
                      <h2 className='text-xl font-semibold text-neutral-100'>
                        Password & Security
                      </h2>
                    </div>
                    <p className='text-sm text-neutral-400'>
                      Update your password to keep your account secure
                    </p>
                  </div>

                  <div className='space-y-6'>
                    {/* Password Fields */}
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx}>
                        <SkeletonPulse className='h-4 w-32 rounded mb-2' />
                        <div className='relative'>
                          <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500' />
                          <SkeletonPulse className='h-10 w-full rounded-lg' />
                        </div>
                      </div>
                    ))}

                    {/* Password Requirements */}
                    <div className='rounded-lg bg-blue-900/10 border border-blue-600/20 p-4'>
                      <p className='text-sm font-medium text-blue-300 mb-2'>
                        Password Requirements:
                      </p>
                      <div className='space-y-1'>
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div key={idx} className='flex items-center gap-2'>
                            <div className='h-1 w-1 rounded-full bg-neutral-500' />
                            <SkeletonPulse className='h-3 w-48 rounded' />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className='flex justify-end pt-4 border-t border-neutral-800'>
                      <SkeletonPulse className='h-10 w-40 rounded-lg' />
                    </div>
                  </div>
                </Card>

                {/* Notification Preferences Section */}
                <Card className='border-purple-600/20 bg-gradient-to-br from-purple-950/10 to-neutral-950/50'>
                  <div className='mb-6'>
                    <div className='flex items-center gap-3 mb-2'>
                      <Bell className='h-5 w-5 text-purple-400' />
                      <h2 className='text-xl font-semibold text-neutral-100'>
                        Notification Preferences
                      </h2>
                    </div>
                    <p className='text-sm text-neutral-400'>
                      Choose how you want to receive notifications
                    </p>
                  </div>

                  <div className='space-y-4'>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <SkeletonNotificationToggle key={idx} />
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className='flex justify-end pt-6 mt-6 border-t border-neutral-800'>
                    <SkeletonPulse className='h-10 w-40 rounded-lg' />
                  </div>
                </Card>
              </div>
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