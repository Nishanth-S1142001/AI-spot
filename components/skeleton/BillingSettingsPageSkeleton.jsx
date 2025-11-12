'use client'

import {
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  Receipt
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
 * Skeleton Payment Method Card
 */
function SkeletonPaymentMethodCard() {
  return (
    <div className='flex items-center justify-between p-4 rounded-lg bg-neutral-900/50 border border-neutral-800'>
      <div className='flex items-center gap-4 flex-1'>
        <SkeletonPulse className='h-12 w-12 rounded-lg' />
        <div className='flex-1 space-y-2'>
          <SkeletonPulse className='h-5 w-48 rounded' />
          <SkeletonPulse className='h-4 w-32 rounded' />
        </div>
      </div>
      <SkeletonPulse className='h-4 w-4 rounded' />
    </div>
  )
}

/**
 * Skeleton Invoice Row
 */
function SkeletonInvoiceRow() {
  return (
    <tr className='border-b border-neutral-800/50'>
      <td className='py-4'>
        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4 text-neutral-500' />
          <SkeletonPulse className='h-4 w-24 rounded' />
        </div>
      </td>
      <td className='py-4'>
        <SkeletonPulse className='h-4 w-48 rounded' />
      </td>
      <td className='py-4'>
        <div className='flex items-center gap-1'>
          <DollarSign className='h-4 w-4 text-neutral-500' />
          <SkeletonPulse className='h-4 w-16 rounded' />
        </div>
      </td>
      <td className='py-4'>
        <SkeletonPulse className='h-6 w-16 rounded-full' />
      </td>
      <td className='py-4 text-right'>
        <SkeletonPulse className='ml-auto h-4 w-24 rounded' />
      </td>
    </tr>
  )
}

/**
 * Main Billing Settings Page Skeleton Component
 */
export default function BillingSettingsPageSkeleton({ userProfile }) {
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col font-mono text-neutral-100 bg-neutral-900/10 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={userProfile}
              title='Billing Settings'
              onLogOutClick={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
              {/* Back Link */}
              <Link href='/settings' className='inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 mb-6 transition-colors'>
                <ArrowLeft className='h-4 w-4' />
                Back to Settings
              </Link>

              {/* Page Header */}
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-2'>
                  <CreditCard className='h-8 w-8 text-blue-500' />
                  <h1 className='text-3xl font-bold text-neutral-100'>
                    Billing Settings
                  </h1>
                </div>
                <p className='text-neutral-400'>
                  Manage your payment methods and view billing history
                </p>
              </div>

              <div className='space-y-8'>
                {/* Payment Methods Section */}
                <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
                  <div className='mb-6 flex items-center justify-between'>
                    <div>
                      <div className='flex items-center gap-3 mb-2'>
                        <CreditCard className='h-5 w-5 text-blue-400' />
                        <h2 className='text-xl font-semibold text-neutral-100'>
                          Payment Methods
                        </h2>
                      </div>
                      <p className='text-sm text-neutral-400'>
                        Manage your saved payment methods
                      </p>
                    </div>
                    <SkeletonPulse className='h-9 w-28 rounded-lg' />
                  </div>

                  {/* Payment Methods List */}
                  <div className='space-y-4'>
                    <SkeletonPaymentMethodCard />
                    <SkeletonPaymentMethodCard />
                  </div>
                </Card>

                {/* Billing History Section */}
                <Card className='border-green-600/20 bg-gradient-to-br from-green-950/10 to-neutral-950/50'>
                  <div className='mb-6'>
                    <div className='flex items-center gap-3 mb-2'>
                      <Receipt className='h-5 w-5 text-green-400' />
                      <h2 className='text-xl font-semibold text-neutral-100'>
                        Billing History
                      </h2>
                    </div>
                    <p className='text-sm text-neutral-400'>
                      View and download your past invoices
                    </p>
                  </div>

                  {/* Billing History Table */}
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead>
                        <tr className='border-b border-neutral-800'>
                          <th className='pb-3 text-left text-sm font-medium text-neutral-400'>
                            Date
                          </th>
                          <th className='pb-3 text-left text-sm font-medium text-neutral-400'>
                            Description
                          </th>
                          <th className='pb-3 text-left text-sm font-medium text-neutral-400'>
                            Amount
                          </th>
                          <th className='pb-3 text-left text-sm font-medium text-neutral-400'>
                            Status
                          </th>
                          <th className='pb-3 text-right text-sm font-medium text-neutral-400'>
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <SkeletonInvoiceRow key={idx} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Support Section */}
                <Card className='border-neutral-800/50 bg-neutral-900/20'>
                  <div className='flex items-start gap-4'>
                    <DollarSign className='h-6 w-6 text-orange-400 mt-1' />
                    <div className='flex-1 space-y-3'>
                      <SkeletonPulse className='h-5 w-48 rounded' />
                      <div className='space-y-2'>
                        <SkeletonPulse className='h-4 w-full rounded' />
                        <SkeletonPulse className='h-4 w-3/4 rounded' />
                      </div>
                      <SkeletonPulse className='h-9 w-36 rounded-lg' />
                    </div>
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