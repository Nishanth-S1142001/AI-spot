'use client'

import { memo, useCallback, useState } from 'react'
import { Mail, Check, Sparkles, ExternalLink } from 'lucide-react'
import Button from '../components/ui/button'
import FormInput from '../components/ui/formInputField'
import { supabase } from '../lib/supabase/dbClient'

// Validation utilities
const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const AuthForms = memo(({ state, dispatch, onClose, router }) => {
  const {
    modalView,
    isLoading,
    auth,
    errors,
    successMessage
  } = state

  // Form handlers
  const handleFieldChange = useCallback(
    (field, value) => {
      dispatch({ type: 'UPDATE_FIELD', field, value })
    },
    [dispatch]
  )

  // Send Magic Link to email
  const handleSendMagicLink = useCallback(
    async (e) => {
      e.preventDefault()
      dispatch({ type: 'CLEAR_ERRORS' })

      // Validate email
      if (!validators.email(auth.email)) {
        dispatch({
          type: 'SET_ERROR',
          field: 'email',
          message: 'Please enter a valid email address'
        })
        return
      }

      dispatch({ type: 'SET_LOADING', value: true })

      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: auth.email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        })

        if (error) throw error

        dispatch({ type: 'SET_VIEW', view: 'check-email' })
        dispatch({
          type: 'SET_SUCCESS',
          message: `Magic link sent to ${auth.email}`
        })
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          field: 'email',
          message: err.message || 'Failed to send magic link'
        })
      } finally {
        dispatch({ type: 'SET_LOADING', value: false })
      }
    },
    [auth.email, dispatch]
  )

  // Resend Magic Link
  const handleResendMagicLink = useCallback(async () => {
    dispatch({ type: 'CLEAR_ERRORS' })
    dispatch({ type: 'SET_LOADING', value: true })

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: auth.email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error

      dispatch({
        type: 'SET_SUCCESS',
        message: 'New magic link sent! Check your email.'
      })
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        field: 'email',
        message: err.message || 'Failed to resend magic link'
      })
    } finally {
      dispatch({ type: 'SET_LOADING', value: false })
    }
  }, [auth.email, dispatch])

  // Google OAuth handler
  const handleGoogleSignIn = useCallback(
    async (e) => {
      e.preventDefault()
      dispatch({ type: 'CLEAR_ERRORS' })
      dispatch({ type: 'SET_LOADING', value: true })

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/dashboard` }
        })
        if (error) throw error
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          field: 'google',
          message: err.message || 'Google sign in failed'
        })
        dispatch({ type: 'SET_LOADING', value: false })
      }
    },
    [dispatch]
  )

  const goBack = useCallback(() => {
    dispatch({ type: 'SET_VIEW', view: 'email' })
    dispatch({ type: 'CLEAR_ERRORS' })
  }, [dispatch])

  return (
    <div className='w-full'>
      {/* Email Entry Form */}
      {modalView === 'email' && (
        <EmailForm
          email={auth.email}
          isLoading={isLoading}
          errors={errors}
          onEmailChange={(e) => handleFieldChange('email', e.target.value)}
          onSubmit={handleSendMagicLink}
          onGoogleSignIn={handleGoogleSignIn}
        />
      )}

      {/* Check Email Screen */}
      {modalView === 'check-email' && (
        <CheckEmailScreen
          email={auth.email}
          isLoading={isLoading}
          errors={errors}
          successMessage={successMessage}
          onResend={handleResendMagicLink}
          onGoBack={goBack}
        />
      )}
    </div>
  )
})

AuthForms.displayName = 'AuthForms'

// Email Form Component
const EmailForm = memo(
  ({
    email,
    isLoading,
    errors,
    onEmailChange,
    onSubmit,
    onGoogleSignIn
  }) => (
    <form onSubmit={onSubmit} className='space-y-6'>
      <div className='space-y-2 text-center'>
        <div className='flex items-center justify-center gap-2'>
          <Sparkles className='h-5 w-5 text-orange-400' />
          <p className='text-sm text-neutral-400'>
            Sign in with a magic link - no password needed
          </p>
        </div>
      </div>

      {errors.email && (
        <div className='rounded-lg border border-orange-600/30 bg-orange-900/20 p-3 text-sm text-orange-400'>
          {errors.email}
        </div>
      )}
      {errors.google && (
        <div className='rounded-lg border border-orange-600/30 bg-orange-900/20 p-3 text-sm text-orange-400'>
          {errors.google}
        </div>
      )}

      <div className='relative'>
        <Mail className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400' />
        <FormInput
          type='email'
          value={email}
          onChange={onEmailChange}
          placeholder='Enter your email'
          className='w-full pl-11'
          required
          disabled={isLoading}
        />
      </div>

      <Button
        type='submit'
        disabled={isLoading}
        loading={isLoading}
        text={isLoading ? 'Sending magic link...' : 'Continue with Email'}
        className='w-full'
        variant='primary'
      />

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-neutral-700' />
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='bg-neutral-900 px-4 text-neutral-400'>
            Or continue with
          </span>
        </div>
      </div>

      <button
        type='button'
        onClick={onGoogleSignIn}
        disabled={isLoading}
        className='group flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-3 text-neutral-100 transition-all hover:border-orange-600/50 hover:bg-neutral-800 disabled:opacity-50'
      >
        <svg className='h-5 w-5' viewBox='0 0 24 24'>
          <path
            fill='#4285F4'
            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
          />
          <path
            fill='#34A853'
            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
          />
          <path
            fill='#FBBC05'
            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
          />
          <path
            fill='#EA4335'
            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
          />
        </svg>
        <span>Sign in with Google</span>
      </button>

      <p className='text-center text-xs text-neutral-500'>
        By continuing, you agree to our{' '}
        <a href='#' className='text-orange-400 hover:underline'>
          Terms of Service
        </a>{' '}
        and{' '}
        <a href='/privacy-policy' className='text-orange-400 hover:underline'>
          Privacy Policy
        </a>
      </p>
    </form>
  )
)

EmailForm.displayName = 'EmailForm'

// Check Email Screen Component
const CheckEmailScreen = memo(
  ({
    email,
    isLoading,
    errors,
    successMessage,
    onResend,
    onGoBack
  }) => {
    const [countdown, setCountdown] = useState(60)
    const [canResend, setCanResend] = useState(false)

    useState(() => {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }, [])

    const handleResendClick = () => {
      onResend()
      setCountdown(60)
      setCanResend(false)
    }

    return (
      <div className='space-y-6'>
        <div className='space-y-4'>
          <div className='flex items-center justify-center'>
            <div className='rounded-full bg-orange-500/10 p-4'>
              <Mail className='h-12 w-12 text-orange-400' />
            </div>
          </div>

          <div className='space-y-2 text-center'>
            <h3 className='text-xl font-semibold text-neutral-100'>
              Check your email
            </h3>
            <p className='text-sm text-neutral-400'>
              We sent a magic link to
            </p>
            <p className='font-semibold text-neutral-200'>{email}</p>
          </div>
        </div>

        {successMessage && (
          <div className='rounded-lg border border-green-600/30 bg-green-900/20 p-3 text-sm text-green-400'>
            <div className='flex items-center gap-2'>
              <Check className='h-4 w-4' />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {errors.email && (
          <div className='rounded-lg border border-orange-600/30 bg-orange-900/20 p-3 text-sm text-orange-400'>
            {errors.email}
          </div>
        )}

        <div className='space-y-4 rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-4'>
          <div className='flex items-start gap-3'>
            <ExternalLink className='h-5 w-5 flex-shrink-0 text-orange-400' />
            <div className='space-y-1'>
              <p className='text-sm font-medium text-neutral-200'>
                Click the link in your email to sign in
              </p>
              <p className='text-xs text-neutral-400'>
                The link will automatically sign you in and redirect you to your dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className='space-y-3'>
          <div className='text-center'>
            {canResend ? (
              <button
                type='button'
                onClick={handleResendClick}
                disabled={isLoading}
                className='text-sm text-orange-400 transition-colors hover:text-orange-300 hover:underline disabled:opacity-50'
              >
                Resend magic link
              </button>
            ) : (
              <p className='text-sm text-neutral-500'>
                Resend link in {countdown}s
              </p>
            )}
          </div>

          <div className='text-center'>
            <button
              type='button'
              onClick={onGoBack}
              className='text-sm text-neutral-400 transition-colors hover:text-neutral-300 hover:underline'
            >
              Use a different email
            </button>
          </div>
        </div>

        <div className='rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-4'>
          <p className='text-xs text-neutral-400'>
            <strong className='text-neutral-300'>Tip:</strong> Check your spam
            folder if you don't see the email. The magic link expires in 1 hour.
          </p>
        </div>
      </div>
    )
  }
)

CheckEmailScreen.displayName = 'CheckEmailScreen'

export default AuthForms