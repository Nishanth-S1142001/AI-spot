'use client'

import { useState, useRef, useCallback, useMemo, memo } from 'react'
import { useAuth } from '../../components/providers/AuthProvider'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import {
  MessageSquare,
  Star,
  Bug,
  Lightbulb,
  ThumbsUp,
  Send,
  CheckCircle,
  Upload,
  X,
  File,
  Loader2,
  Sparkles
} from 'lucide-react'
import { useEffect } from 'react'
import Button from '../../components/ui/button'
import FormInput from '../../components/ui/formInputField'
import Card from '../../components/ui/card'
import Link from 'next/link'
import NeonBackground from '../../components/ui/background'
import LoadingState from '../../components/common/loading-state'
import SideBarLayout from '../../components/sideBarLayout'
import { useLogout } from '../../lib/supabase/auth'
import NavigationBar from '../../components/navigationBar/navigationBar'
import { useSubmitFeedback } from '../../lib/hooks/useAgentData'
import FeedbackPageSkeleton from '../../components/skeleton/FeedbackSkeleton'
/**
 * FULLY OPTIMIZED Feedback Page
 *
 * React Query Integration:
 * - Mutation for form submission
 * - Automatic success/error handling
 * - Consistent with other pages
 *
 * Performance:
 * - Memoized components (already good)
 * - Optimized form validation
 * - Better state management
 */

// Memoized Feedback Type Card Component
const FeedbackTypeCard = memo(({ type, isSelected, onSelect }) => {
  const Icon = type.icon

  return (
    <button
      type='button'
      onClick={() => onSelect(type.id)}
      className={`group relative flex items-center space-x-4 rounded-xl border p-5 transition-all duration-200 ${
        isSelected
          ? 'border-orange-500 bg-gradient-to-br from-orange-900/20 to-orange-950/10 shadow-lg shadow-orange-500/20'
          : 'border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20 hover:border-neutral-700 hover:from-neutral-900/60'
      }`}
    >
      <div
        className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
          isSelected
            ? 'bg-orange-600/20 ring-1 ring-orange-500/50'
            : 'bg-neutral-800 group-hover:bg-neutral-700'
        }`}
      >
        {isSelected && (
          <div className='absolute inset-0 animate-pulse rounded-lg bg-orange-500/20 blur-sm' />
        )}
        <Icon
          className={`relative h-6 w-6 ${
            isSelected
              ? 'text-orange-400'
              : 'text-neutral-400 group-hover:text-orange-400'
          }`}
        />
      </div>

      <div className='flex-1 text-left'>
        <h3
          className={`font-semibold transition-colors ${
            isSelected ? 'text-orange-300' : 'text-neutral-100'
          }`}
        >
          {type.name}
        </h3>
        <p className='text-sm text-neutral-400'>{type.description}</p>
      </div>

      {isSelected && (
        <div className='absolute top-4 right-4'>
          <div className='flex h-5 w-5 items-center justify-center rounded-full bg-orange-500'>
            <CheckCircle className='h-3.5 w-3.5 text-white' />
          </div>
        </div>
      )}
    </button>
  )
})
FeedbackTypeCard.displayName = 'FeedbackTypeCard'

// Memoized Star Rating Component
const StarRating = memo(({ rating, onRatingChange, disabled }) => {
  return (
    <div className='flex items-center space-x-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type='button'
          onClick={() => !disabled && onRatingChange(star)}
          disabled={disabled}
          className='group transition-transform hover:scale-110 disabled:cursor-not-allowed'
        >
          <Star
            className={`h-8 w-8 transition-all ${
              star <= rating
                ? 'fill-orange-400 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]'
                : 'fill-neutral-800 text-neutral-600 group-hover:text-neutral-500'
            }`}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className='ml-3 text-sm font-medium text-orange-400'>
          {rating} / 5
        </span>
      )}
    </div>
  )
})
StarRating.displayName = 'StarRating'

// Memoized Attachment Item Component
const AttachmentItem = memo(({ file, index, onRemove }) => {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className='group flex items-center justify-between rounded-lg border border-neutral-800/50 bg-gradient-to-r from-neutral-900/40 to-neutral-950/20 px-4 py-3 transition-all hover:border-neutral-700'>
      <div className='flex items-center space-x-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/20 ring-1 ring-orange-500/30'>
          <File className='h-5 w-5 text-orange-400' />
        </div>
        <div>
          <p className='text-sm font-medium text-neutral-200'>{file.name}</p>
          <p className='text-xs text-neutral-500'>
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      <button
        type='button'
        onClick={() => onRemove(index)}
        className='rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-red-900/20 hover:text-red-400'
      >
        <X className='h-4 w-4' />
      </button>
    </div>
  )
})
AttachmentItem.displayName = 'AttachmentItem'

// Main Feedback Page Component
export default function FeedbackPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const { logout } = useLogout()
  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }
  // React Query mutation
  const submitFeedbackMutation = useSubmitFeedback()

  // State
  const [selectedType, setSelectedType] = useState('general')
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [delayedLoading, setDelayedLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      subject: '',
      message: '',
      name: '',
      email: ''
    }
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Memoized feedback types
  const feedbackTypes = useMemo(
    () => [
      {
        id: 'general',
        name: 'General Feedback',
        icon: MessageSquare,
        description: 'Share your thoughts'
      },
      {
        id: 'bug',
        name: 'Bug Report',
        icon: Bug,
        description: 'Report a technical issue'
      },
      {
        id: 'feature',
        name: 'Feature Request',
        icon: Lightbulb,
        description: 'Suggest a new feature'
      },
      {
        id: 'praise',
        name: 'Praise',
        icon: ThumbsUp,
        description: 'Tell us what you love'
      }
    ],
    []
  )

  // Memoized file upload handler
  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files)
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/gif',
      'application/pdf'
    ]

    const validFiles = files.filter(
      (file) => file.size <= maxSize && allowedTypes.includes(file.type)
    )

    if (validFiles.length !== files.length) {
      // Some files were invalid
      const invalidCount = files.length - validFiles.length
      console.warn(
        `${invalidCount} file(s) skipped (max 5MB, PNG/JPG/GIF/PDF only)`
      )
    }

    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles])
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Memoized remove attachment handler
  const removeAttachment = useCallback((index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Memoized submit handler
  const onSubmit = useCallback(
    async (data) => {
      const formData = new FormData()
      formData.append('type', selectedType)
      formData.append('subject', data.subject)
      formData.append('message', data.message)
      formData.append('rating', rating)
      formData.append('email', data.email || user?.email || '')
      formData.append('userId', user?.id || '')
      formData.append('userName', profile?.full_name || data.name || '')

      attachments.forEach((file, i) => {
        formData.append(`file_${i}`, file)
      })

      try {
        await submitFeedbackMutation.mutateAsync(formData)
        setSubmitted(true)
        reset()
        setRating(0)
        setAttachments([])
        setSelectedType('general')
      } catch (error) {
        // Error already handled by mutation
      }
    },
    [
      selectedType,
      rating,
      attachments,
      user,
      profile,
      reset,
      submitFeedbackMutation
    ]
  )

  // Show rating section only for relevant types
  const showRating = useMemo(
    () => selectedType === 'general' || selectedType === 'praise',
    [selectedType]
  )

  // Loading state
  if (delayedLoading) {
    return (
      <LoadingState
        message='Loading feedback form...'
        className='min-h-screen'
      />
    )
  }
  if (authLoading) {
    return <FeedbackPageSkeleton userProfile={userProfile} />
  }
  // Not authenticated
  if (!user) {
    return null
  }

  // Success state
  if (submitted) {
    return (
      <>
        <NeonBackground />
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          <Card className='w-full max-w-md border-green-600/30 bg-gradient-to-br from-green-900/10 to-neutral-950/50 p-8'>
            <div className='relative mx-auto mb-6 flex h-20 w-20 items-center justify-center'>
              <div className='absolute inset-0 animate-ping rounded-full bg-green-500/20' />
              <div className='relative flex h-16 w-16 items-center justify-center rounded-full bg-green-900/40 ring-2 ring-green-500/50'>
                <CheckCircle className='h-10 w-10 text-green-400' />
              </div>
            </div>

            <h2 className='mb-3 text-center text-2xl font-bold text-neutral-100'>
              Thank You! 🎉
            </h2>
            <p className='mb-6 text-center text-neutral-400'>
              Your feedback is invaluable. We&apos;ll review it carefully and
              use it to make AgentBuilder even better.
            </p>

            <div className='space-y-3'>
              <Button onClick={() => setSubmitted(false)} className='w-full'>
                <Sparkles className='mr-2 h-4 w-4' />
                Submit More Feedback
              </Button>
              <Link href='/dashboard'>
                <Button variant='outline' className='w-full'>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </>
    )
  }

  // Main form
  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='custom-scrollbar relative w-full flex-1 font-mono text-neutral-100'>
          {/* Header */}
          <div className='sticky top-0 z-10 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <div className='flex h-16 items-center px-6'>
              <NavigationBar
                profile={profile}
                message='Feedback'
                title='Help Us Improve'
                onLogOutClick={logout}
              />
            </div>
          </div>

          {/* Content */}
          <div className='mx-auto max-w-4xl space-y-8 p-6'>
            {/* Page Header */}
            <div className='text-center'>
              <h1 className='mb-3 text-3xl font-bold text-neutral-100'>
                We&apos;d Love Your{' '}
                <span className='text-orange-400'>Feedback</span>
              </h1>
              <p className='text-neutral-400'>
                Help us improve AgentBuilder by sharing your thoughts, reporting
                bugs, or suggesting new features.
              </p>
            </div>

            {/* Feedback Type Selection */}
            <div>
              <h2 className='mb-4 text-lg font-semibold text-neutral-200'>
                What type of feedback do you have?
              </h2>
              <div className='grid gap-4 sm:grid-cols-2'>
                {feedbackTypes.map((type) => (
                  <FeedbackTypeCard
                    key={type.id}
                    type={type}
                    isSelected={selectedType === type.id}
                    onSelect={setSelectedType}
                  />
                ))}
              </div>
            </div>

            {/* Feedback Form */}
            <Card className='border-neutral-800/50 bg-gradient-to-br from-neutral-900/40 to-neutral-950/20 p-6 shadow-xl shadow-neutral-950/50'>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Rating Section */}
                {showRating && (
                  <div>
                    <label className='mb-3 block text-sm font-medium text-neutral-300'>
                      How would you rate your experience?
                    </label>
                    <StarRating
                      rating={rating}
                      onRatingChange={setRating}
                      disabled={submitFeedbackMutation.isPending}
                    />
                  </div>
                )}

                {/* Guest Info */}
                {!user && (
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div>
                      <label className='mb-2 block text-sm font-medium text-neutral-300'>
                        Your Name *
                      </label>
                      <FormInput
                        {...register('name', {
                          required: 'Name is required',
                          minLength: { value: 2, message: 'Name too short' }
                        })}
                        placeholder='John Doe'
                        disabled={submitFeedbackMutation.isPending}
                      />
                      {errors.name && (
                        <p className='mt-1 text-xs text-red-400'>
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium text-neutral-300'>
                        Email Address *
                      </label>
                      <FormInput
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        placeholder='john@example.com'
                        type='email'
                        disabled={submitFeedbackMutation.isPending}
                      />
                      {errors.email && (
                        <p className='mt-1 text-xs text-red-400'>
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Subject */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-neutral-300'>
                    Subject *
                  </label>
                  <FormInput
                    {...register('subject', {
                      required: 'Subject is required',
                      minLength: {
                        value: 5,
                        message: 'Subject too short (min 5 characters)'
                      },
                      maxLength: {
                        value: 100,
                        message: 'Subject too long (max 100 characters)'
                      }
                    })}
                    placeholder='Brief summary of your feedback'
                    disabled={submitFeedbackMutation.isPending}
                  />
                  {errors.subject && (
                    <p className='mt-1 text-xs text-red-400'>
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-neutral-300'>
                    Message *
                  </label>
                  <textarea
                    {...register('message', {
                      required: 'Message is required',
                      minLength: {
                        value: 10,
                        message: 'Message too short (min 10 characters)'
                      },
                      maxLength: {
                        value: 2000,
                        message: 'Message too long (max 2000 characters)'
                      }
                    })}
                    rows={6}
                    placeholder='Describe your feedback in detail...'
                    className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50'
                    disabled={submitFeedbackMutation.isPending}
                  />
                  {errors.message && (
                    <p className='mt-1 text-xs text-red-400'>
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-neutral-300'>
                    Attachments (Optional)
                  </label>
                  <div className='rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-900/20 p-6 transition-colors hover:border-neutral-600'>
                    <Upload className='mx-auto mb-2 h-8 w-8 text-neutral-500' />
                    <p className='mb-1 text-center text-sm text-neutral-400'>
                      Upload screenshots or documents
                    </p>
                    <p className='mb-3 text-center text-xs text-neutral-500'>
                      PNG, JPG, GIF, or PDF • Max 5MB per file
                    </p>

                    <input
                      ref={fileInputRef}
                      type='file'
                      multiple
                      accept='image/png,image/jpeg,image/gif,application/pdf'
                      className='hidden'
                      onChange={handleFileUpload}
                      disabled={submitFeedbackMutation.isPending}
                    />

                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='mx-auto'
                      disabled={submitFeedbackMutation.isPending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className='mr-2 h-4 w-4' />
                      Choose Files
                    </Button>
                  </div>

                  {/* Attachments List */}
                  {attachments.length > 0 && (
                    <div className='mt-4 space-y-2'>
                      {attachments.map((file, index) => (
                        <AttachmentItem
                          key={`${file.name}-${index}`}
                          file={file}
                          index={index}
                          onRemove={removeAttachment}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className='flex gap-3 pt-4'>
                  <Button
                    type='submit'
                    disabled={submitFeedbackMutation.isPending}
                    className='flex-1'
                  >
                    {submitFeedbackMutation.isPending ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className='mr-2 h-4 w-4' />
                        Submit Feedback
                      </>
                    )}
                  </Button>

                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => router.back()}
                    disabled={submitFeedbackMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
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
      `}</style>
    </>
  )
}
