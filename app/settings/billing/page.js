'use client'

import {
  ArrowLeft,
  CreditCard,
  Download,
  Plus,
  Receipt,
  Calendar,
  DollarSign,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { memo, useMemo, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import LoadingState from '../../../components/common/loading-state'
import NavigationBar from '../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../components/providers/AuthProvider'
import SideBarLayout from '../../../components/sideBarLayout'
import NeonBackground from '../../../components/ui/background'
import Button from '../../../components/ui/button'
import Card from '../../../components/ui/card'
import { useLogout } from '../../../lib/supabase/auth'
import {
  useBillingData,
  useDeletePaymentMethod,
  useDownloadInvoice,
  useAddPaymentMethod
} from '../../../lib/hooks/useBillingData'
import BillingSettingsPageSkeleton from '../../../components/skeleton/BillingSettingsPageSkeleton'

/**
 * FULLY OPTIMIZED Billing Settings Page
 *
 * React Query Integration:
 * - Automatic billing data fetching with caching
 * - Optimistic updates for payment method deletion
 * - Mutation hooks for all actions
 *
 * Performance:
 * - Memoized components
 * - Stable handlers
 * - Optimized rendering
 */

// Utility functions - pure, outside component
const getCardIcon = (brand) => {
  return <CreditCard className='h-5 w-5' />
}

const formatCardNumber = (last4) => {
  return `•••• •••• •••• ${last4}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusColor = (status) => {
  const colors = {
    paid: 'bg-green-900/40 text-green-300 ring-green-500/50',
    pending: 'bg-yellow-900/40 text-yellow-300 ring-yellow-500/50',
    failed: 'bg-red-900/40 text-red-300 ring-red-500/50',
    refunded: 'bg-neutral-900/40 text-neutral-300 ring-neutral-500/50'
  }
  return colors[status] || colors.pending
}

/**
 * Memoized Payment Method Card Component
 */
const PaymentMethodCard = memo(({ card, onDelete }) => {
  const handleDelete = useCallback(() => {
    onDelete(card.id)
  }, [card.id, onDelete])

  return (
    <div className='flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 transition-colors hover:border-neutral-700'>
      <div className='flex items-center gap-4'>
        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-900/40'>
          {getCardIcon(card.brand)}
        </div>
        <div>
          <div className='flex items-center gap-2'>
            <p className='font-medium text-neutral-200 capitalize'>
              {card.brand} {formatCardNumber(card.last4)}
            </p>
            {card.isDefault && (
              <span className='rounded-full bg-blue-900/40 px-2 py-0.5 text-xs text-blue-300 ring-1 ring-blue-500/50'>
                Default
              </span>
            )}
          </div>
          <p className='mt-1 text-sm text-neutral-400'>
            Expires {card.expMonth}/{card.expYear}
          </p>
        </div>
      </div>
      <button
        onClick={handleDelete}
        className='text-red-400 transition-colors hover:text-red-300'
        aria-label='Delete payment method'
      >
        <Trash2 className='h-4 w-4' />
      </button>
    </div>
  )
})
PaymentMethodCard.displayName = 'PaymentMethodCard'

/**
 * Memoized Add Card Form Component
 */
const AddCardForm = memo(({ onCancel, onSubmit }) => {
  return (
    <div className='mt-6 rounded-lg border border-blue-600/30 bg-neutral-900/50 p-6'>
      <h3 className='mb-4 font-semibold text-neutral-200'>Add New Card</h3>
      <div className='space-y-4'>
        <div>
          <label className='mb-2 block text-sm font-medium text-neutral-300'>
            Card Number
          </label>
          <input
            type='text'
            placeholder='1234 5678 9012 3456'
            className='w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
          />
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Expiry Date
            </label>
            <input
              type='text'
              placeholder='MM/YY'
              className='w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
            />
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              CVC
            </label>
            <input
              type='text'
              placeholder='123'
              className='w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
            />
          </div>
        </div>
        <div className='flex gap-3'>
          <Button
            onClick={onSubmit}
            className='flex-1 bg-blue-600 hover:bg-blue-700'
          >
            Add Card
          </Button>
          <Button onClick={onCancel} variant='outline' className='flex-1'>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
})
AddCardForm.displayName = 'AddCardForm'

/**
 * Memoized Invoice Row Component
 */
const InvoiceRow = memo(({ invoice, onDownload }) => {
  const statusColor = useMemo(
    () => getStatusColor(invoice.status),
    [invoice.status]
  )

  const handleDownload = useCallback(() => {
    onDownload(invoice.id)
  }, [invoice.id, onDownload])

  return (
    <tr className='border-b border-neutral-800/50 transition-colors hover:bg-neutral-900/30'>
      <td className='py-4'>
        <div className='flex items-center gap-2 text-sm text-neutral-300'>
          <Calendar className='h-4 w-4 text-neutral-500' />
          {formatDate(invoice.date)}
        </div>
      </td>
      <td className='py-4 text-sm text-neutral-300'>{invoice.description}</td>
      <td className='py-4'>
        <div className='flex items-center gap-1 text-sm font-medium text-neutral-200'>
          <DollarSign className='h-4 w-4' />
          {invoice.amount.toFixed(2)}
        </div>
      </td>
      <td className='py-4'>
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ring-1 ${statusColor}`}
        >
          {invoice.status}
        </span>
      </td>
      <td className='py-4 text-right'>
        <button
          onClick={handleDownload}
          className='inline-flex items-center gap-2 text-sm text-blue-400 transition-colors hover:text-blue-300'
        >
          <Download className='h-4 w-4' />
          Download
        </button>
      </td>
    </tr>
  )
})
InvoiceRow.displayName = 'InvoiceRow'

/**
 * Memoized Payment Methods Section
 */
const PaymentMethodsSection = memo(
  ({ paymentMethods, onDelete, showAddCard, onToggleAddCard }) => {
    return (
      <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <div className='mb-2 flex items-center gap-3'>
              <CreditCard className='h-5 w-5 text-blue-400' />
              <h2 className='text-xl font-semibold text-neutral-100'>
                Payment Methods
              </h2>
            </div>
            <p className='text-sm text-neutral-400'>
              Manage your saved payment methods
            </p>
          </div>
          <Button
            onClick={onToggleAddCard}
            className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700'
          >
            <Plus className='h-4 w-4' />
            Add Card
          </Button>
        </div>

        {/* Payment Methods List */}
        <div className='space-y-4'>
          {paymentMethods.map((card) => (
            <PaymentMethodCard key={card.id} card={card} onDelete={onDelete} />
          ))}
        </div>

        {/* Add Card Form */}
        {showAddCard && (
          <AddCardForm onCancel={onToggleAddCard} onSubmit={onToggleAddCard} />
        )}
      </Card>
    )
  }
)
PaymentMethodsSection.displayName = 'PaymentMethodsSection'

/**
 * Memoized Billing History Section
 */
const BillingHistorySection = memo(({ billingHistory, onDownload }) => {
  return (
    <Card className='border-green-600/20 bg-gradient-to-br from-green-950/10 to-neutral-950/50'>
      <div className='mb-6'>
        <div className='mb-2 flex items-center gap-3'>
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
            {billingHistory.map((invoice) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                onDownload={onDownload}
              />
            ))}
          </tbody>
        </table>
      </div>

      {billingHistory.length === 0 && (
        <div className='py-12 text-center'>
          <Receipt className='mx-auto mb-4 h-12 w-12 text-neutral-600' />
          <p className='text-neutral-400'>No billing history yet</p>
        </div>
      )}
    </Card>
  )
})
BillingHistorySection.displayName = 'BillingHistorySection'

/**
 * Memoized Header Section
 */
const HeaderSection = memo(() => {
  return (
    <>
      <Link
        href='/settings'
        className='mb-6 inline-flex items-center gap-2 text-orange-500 transition-colors hover:text-orange-400'
      >
        <ArrowLeft className='h-4 w-4' />
        Back to Settings
      </Link>

      <div className='mb-8'>
        <div className='mb-2 flex items-center gap-3'>
          <CreditCard className='h-8 w-8 text-blue-500' />
          <h1 className='text-3xl font-bold text-neutral-100'>
            Billing Settings
          </h1>
        </div>
        <p className='text-neutral-400'>
          Manage your payment methods and view billing history
        </p>
      </div>
    </>
  )
})
HeaderSection.displayName = 'HeaderSection'

/**
 * Memoized Support Section
 */
const SupportSection = memo(() => {
  return (
    <Card className='border-neutral-800/50 bg-neutral-900/20'>
      <div className='flex items-start gap-4'>
        <DollarSign className='mt-1 h-6 w-6 text-orange-400' />
        <div>
          <h4 className='mb-2 font-semibold text-neutral-200'>
            Need help with billing?
          </h4>
          <p className='mb-3 text-sm text-neutral-400'>
            Contact our support team for billing inquiries, refunds, or account
            credits.
          </p>
          <Button variant='outline' size='sm'>
            Contact Support
          </Button>
        </div>
      </div>
    </Card>
  )
})
SupportSection.displayName = 'SupportSection'

/**
 * Main Billing Settings Page Component
 */
export default function BillingSettingsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { logout } = useLogout()
  const [showAddCard, setShowAddCard] = useState(false)

  // React Query hooks - MUST be called before any conditional returns
  const {
    data: billingData,
    isLoading: billingLoading,
    error: billingError
  } = useBillingData(user?.id)

  const { mutate: deletePaymentMethod } = useDeletePaymentMethod()
  const { mutate: downloadInvoice } = useDownloadInvoice()
  const { mutate: addPaymentMethod } = useAddPaymentMethod()

  // Memoize user profile for SideBarLayout
  const userProfile = useMemo(
    () => ({
      name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
      email: user?.email || 'guest@example.com',
      avatar: profile?.avatar_url || null
    }),
    [profile, user]
  )

  // Memoize payment methods and billing history
  const paymentMethods = useMemo(
    () => billingData?.paymentMethods || [],
    [billingData]
  )

  const billingHistory = useMemo(
    () => billingData?.billingHistory || [],
    [billingData]
  )

  // Stable handlers - MUST be declared before conditional returns
  const handleDeleteCard = useCallback(
    (cardId) => {
      if (!confirm('Are you sure you want to remove this payment method?')) {
        return
      }

      deletePaymentMethod(
        { userId: user.id, cardId },
        {
          onSuccess: () => {
            toast.success('Payment method removed')
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to remove payment method')
          }
        }
      )
    },
    [user?.id, deletePaymentMethod]
  )

  const handleDownloadInvoice = useCallback(
    (invoiceId) => {
      downloadInvoice(
        { invoiceId },
        {
          onSuccess: () => {
            toast.success('Invoice downloaded')
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to download invoice')
          }
        }
      )
    },
    [downloadInvoice]
  )
  const [delayedLoading, setDelayedLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  const handleToggleAddCard = useCallback(() => {
    setShowAddCard((prev) => !prev)
  }, [])

  // NOW we can do conditional logic - after all hooks are called
  // Loading state
  if (authLoading) {
    return (
      <LoadingState
        message={
          authLoading ? 'Authenticating...' : 'Loading billing settings...'
        }
        className='min-h-screen'
      />
    )
  }
  if (authLoading || billingLoading) {
    return <BillingSettingsPageSkeleton userProfile={userProfile} />
  }
  // Error state
  if (billingError) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-900 font-mono'>
        <Card className='max-w-md border-red-600/30 bg-gradient-to-br from-red-900/20 to-neutral-950/50'>
          <div className='p-8 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/40'>
              <CreditCard className='h-8 w-8 text-red-400' />
            </div>
            <h3 className='mb-2 text-xl font-bold text-neutral-100'>Error</h3>
            <p className='text-sm text-neutral-400'>{billingError.message}</p>
            <Button onClick={() => window.location.reload()} className='mt-6'>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              title='Billing Settings'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
              <HeaderSection />

              <div className='space-y-8'>
                <PaymentMethodsSection
                  paymentMethods={paymentMethods}
                  onDelete={handleDeleteCard}
                  showAddCard={showAddCard}
                  onToggleAddCard={handleToggleAddCard}
                />

                <BillingHistorySection
                  billingHistory={billingHistory}
                  onDownload={handleDownloadInvoice}
                />

                <SupportSection />
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
      `}</style>
    </>
  )
}
