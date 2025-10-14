'use client'

import { useState } from 'react'
import { useAuth } from '../../components/providers/AuthProvider'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
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
  ArrowLeft,
  User,
  Settings,
  File,
  Aperture
} from 'lucide-react'
import Button from '../../components/ui/button'
import FormInput from '../../components/ui/formInputField'
import Card from '../../components/ui/card'
import toast from 'react-hot-toast'
import Link from 'next/link'
import NeonBackground from '../../components/ui/background'
import LoadingState from '../../components/common/loading-state'
import SideBarLayout from '../../components/sideBarLayout'

export default function FeedbackPage() {
  const { user, profile, loading } = useAuth()
  const [selectedType, setSelectedType] = useState('general')
  const [rating, setRating] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()
  const router = useRouter()

  const feedbackTypes = [
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
  ]

  // ✅ Validate files before sending
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(
      (f) =>
        f.size <= 5 * 1024 * 1024 &&
        ['image/png', 'image/jpeg', 'image/gif', 'application/pdf'].includes(
          f.type
        )
    )
    if (validFiles.length !== files.length) {
      toast.error('Some files skipped (max 5MB, PNG/JPG/GIF/PDF only).')
    }
    setAttachments((prev) => [...prev, ...validFiles])
  }

  const removeAttachment = (index) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index))

  // ✅ Send formData to server → server uploads to Supabase Storage
  const onSubmit = async (data) => {
    try {
      setFetching(true)

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

      const res = await fetch('/api/feedback', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Submission failed')

      toast.success('Feedback submitted successfully!')
      setSubmitted(true)
      reset()
      setRating(0)
      setAttachments([])
    } catch (err) {
      console.error(err)
      toast.error('Submission failed. Please try again.')
    } finally {
      setFetching(false)
    }
  }

  if (loading) {
    return (
      <LoadingState
        message='Loading... (Refresh the window if delayed)'
        className='min-h-screen'
      />
    )
  }

  if (submitted) {
    return (
      <>
        <NeonBackground />
        <div className='flex min-h-screen items-center justify-center bg-neutral-950/90 text-center'>
          <Card className='w-full max-w-md border border-neutral-700 bg-neutral-800 p-8'>
            <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-800/30'>
              <CheckCircle className='h-8 w-8 text-green-400' />
            </div>
            <h2 className='mb-3 text-2xl font-semibold text-neutral-100'>
              Thank You!
            </h2>
            <p className='mb-6 text-neutral-400'>
              Your feedback helps us improve AgentBuilder.
            </p>
            <div className='space-y-3'>
              <Button onClick={() => setSubmitted(false)} className='w-full'>
                Submit More
              </Button>
              <Link href='/dashboard'>
                <Button variant='ghost' className='w-full'>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout>
        <div className='custom-scrollbar relative w-full flex-1 font-mono text-neutral-100'>
          <div className='mx-auto space-y-10'>
            {/* Header */}
            <div className='sticky top-0 z-20 mt-2 flex h-16 items-center justify-between px-4 backdrop-blur-sm'>
              <div className='flex items-center space-x-2'>
                <Button variant='ghost' onClick={() => router.back()}>
                  <ArrowLeft className='h-4 w-4' />
                </Button>
                <Aperture className='ml-5 h-8 w-8 text-orange-400' />
                <span className='text-xl font-bold'>Spot</span>
              </div>
              <div className='flex items-center space-x-4'>
                <div className='text-lg'>
                  Credits:{' '}
                  <span className='font-semibold text-neutral-400'>
                    {profile?.api_credits || 0}
                  </span>
                </div>
                <Link href='/settings'>
                  <Settings className='h-6 w-6 text-neutral-400 hover:text-neutral-200' />
                </Link>
                <Link href='/profile'>
                  <User className='h-6 w-6 text-neutral-400 hover:text-neutral-200' />
                </Link>
              </div>
            </div>

            {/* Feedback Section */}
            <div className='mx-auto max-w-4xl'>
              {/* Feedback Types */}
              <div className='grid gap-4 sm:grid-cols-2'>
                {feedbackTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`flex items-center space-x-4 rounded-xl border border-neutral-700 bg-neutral-800/60 p-5 transition-all hover:bg-neutral-700/70 ${
                      selectedType === t.id
                        ? 'border-orange-500 shadow-lg shadow-orange-500/20'
                        : ''
                    }`}
                  >
                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-700'>
                      <t.icon className='h-6 w-6 text-orange-400' />
                    </div>
                    <div className='text-left'>
                      <h3 className='font-medium'>{t.name}</h3>
                      <p className='text-sm text-neutral-400'>
                        {t.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Feedback Form */}
              <Card className='mt-6 border border-neutral-700 bg-neutral-800/60 p-8'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                  {/* Rating */}
                  {(selectedType === 'general' ||
                    selectedType === 'praise') && (
                    <div>
                      <label className='mb-2 block text-neutral-300'>
                        Rate your experience
                      </label>
                      <div className='flex space-x-1'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            onClick={() => setRating(star)}
                            className={`h-7 w-7 cursor-pointer transition ${
                              star <= rating
                                ? 'fill-orange-400 text-orange-400'
                                : 'text-neutral-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Name & Email (for guests) */}
                  {!user && (
                    <>
                      <FormInput
                        {...register('name', { required: true })}
                        placeholder='Your Name'
                        className='w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-2 text-neutral-100'
                      />
                      <FormInput
                        {...register('email', { required: true })}
                        placeholder='Email'
                        className='w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-2 text-neutral-100'
                      />
                    </>
                  )}

                  {/* Subject */}
                  <FormInput
                    {...register('subject', { required: true })}
                    placeholder='Subject'
                    className='w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-2 text-neutral-100'
                  />

                  {/* Message */}
                  <textarea
                    {...register('message', { required: true })}
                    rows={6}
                    placeholder='Describe your feedback...'
                    className='w-full rounded-lg border border-neutral-600 bg-neutral-700 px-4 py-2 text-neutral-100 placeholder-neutral-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                  />

                  {/* Attachments */}
                  <div className='rounded-lg border-2 border-dashed border-neutral-600 p-6 text-center'>
                    <Upload className='mx-auto mb-2 text-neutral-500' />
                    <p className='text-sm text-neutral-400'>
                      Upload images or PDFs (max 5MB)
                    </p>

                    <input
                      ref={fileInputRef}
                      type='file'
                      multiple
                      accept='image/*,application/pdf'
                      hidden
                      onChange={handleFileUpload}
                    />

                    <Button
                      variant='ghost'
                      className='mt-3 text-sm'
                      disabled={fetching}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Files
                    </Button>

                    {attachments.length > 0 && (
                      <div className='mt-2 space-y-2'>
                        {attachments.map((f, i) => (
                          <div
                            key={i}
                            className='flex items-center justify-between rounded-lg bg-neutral-700 px-3 py-2 text-sm'
                          >
                            <div className='flex items-center'>
                              <File className='mr-2 h-4 w-4 text-orange-600' />
                              <span>{f.name}</span>
                            </div>
                            <X
                              onClick={() => removeAttachment(i)}
                              className='h-4 w-4 cursor-pointer text-red-400'
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* File List */}
                  {attachments.length > 0 && (
                    <div className='space-y-2'>
                      {attachments.map((f, i) => (
                        <div
                          key={i}
                          className='flex items-center justify-between rounded-lg bg-neutral-700 px-3 py-2 text-sm'
                        >
                          <div className='flex items-center'>
                            <File className='mr-2 h-4 w-4 text-orange-600' />
                            <span>{f.name}</span>
                          </div>
                          <X
                            onClick={() => removeAttachment(i)}
                            className='h-4 w-4 cursor-pointer text-red-400'
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className='flex space-x-3'>
                    <Button
                      type='submit'
                      disabled={fetching}
                      className='w-full flex-1'
                    >
                      {fetching ? (
                        'Submitting...'
                      ) : (
                        <div className='flex items-center justify-center'>
                          <Send className='mr-2 h-4 w-4' /> Submit
                        </div>
                      )}
                    </Button>

                    <Button
                      variant='ghost'
                      className='flex-1'
                      onClick={() => router.back()}
                      disabled={fetching}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </SideBarLayout>
    </>
  )
}
