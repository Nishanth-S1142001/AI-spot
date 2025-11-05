'use client'

import { memo, useCallback } from 'react'
import {
  Eye,
  EyeOff,
  Github,
  Lock,
  LockKeyhole,
  Mail,
  User
} from 'lucide-react'
import Button from '../components/ui/button'
import FormInput from '../components/ui/formInputField'
import HyperLinks from '../components/ui/hyperLinks'
import { supabase } from '../lib/supabase/dbClient'

// Validation utilities
const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  password: (password) =>
    password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password)
}

const AuthForms = memo(({ state, dispatch, onClose, router }) => {
  const {
    modalView,
    isLoading,
    login,
    register,
    reset,
    errors,
    successMessage
  } = state

  // Form handlers
  const handleFieldChange = useCallback(
    (form, field, value) => {
      dispatch({ type: 'UPDATE_FIELD', form, field, value })
    },
    [dispatch]
  )

  const togglePassword = useCallback(
    (form, field) => {
      dispatch({ type: 'TOGGLE_PASSWORD', form, field })
    },
    [dispatch]
  )

  // Login handler
  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault()
      dispatch({ type: 'CLEAR_ERRORS' })

      // Validate
      if (!validators.email(login.email)) {
        dispatch({
          type: 'SET_ERROR',
          field: 'login_email',
          message: 'Invalid email address'
        })
        return
      }
      if (!validators.password(login.password)) {
        dispatch({
          type: 'SET_ERROR',
          field: 'login_password',
          message: 'Password must be 6+ characters with a letter and number'
        })
        return
      }

      dispatch({ type: 'SET_LOADING', value: true })

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: login.email,
          password: login.password
        })
        if (error) throw error
        router.push('/dashboard')
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          field: 'login_general',
          message: err.message || 'Login failed'
        })
      } finally {
        dispatch({ type: 'SET_LOADING', value: false })
      }
    },
    [login, dispatch, router]
  )

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
          message: err.message || 'Google login failed'
        })
        dispatch({ type: 'SET_LOADING', value: false })
      }
    },
    [dispatch]
  )

  // Register handler
  const handleRegister = useCallback(
    async (e) => {
      e.preventDefault()
      dispatch({ type: 'CLEAR_ERRORS' })

      // Validate
      if (!register.fullName.trim()) {
        dispatch({
          type: 'SET_ERROR',
          field: 'register_name',
          message: 'Name is required'
        })
        return
      }
      if (!validators.email(register.email)) {
        dispatch({
          type: 'SET_ERROR',
          field: 'register_email',
          message: 'Invalid email address'
        })
        return
      }
      if (!validators.password(register.password)) {
        dispatch({
          type: 'SET_ERROR',
          field: 'register_password',
          message: 'Password must be 6+ characters with a letter and number'
        })
        return
      }
      if (register.password !== register.cpassword) {
        dispatch({
          type: 'SET_ERROR',
          field: 'register_cpassword',
          message: 'Passwords do not match'
        })
        return
      }
      if (!register.agreeToTerms) {
        dispatch({
          type: 'SET_ERROR',
          field: 'register_terms',
          message: 'You must agree to the terms'
        })
        return
      }

      dispatch({ type: 'SET_LOADING', value: true })

      try {
        const { error } = await supabase.auth.signUp({
          email: register.email,
          password: register.password,
          options: {
            data: { full_name: register.fullName }
          }
        })
        if (error) throw error
        dispatch({
          type: 'SET_SUCCESS',
          message: 'Account created! Check your email to verify.'
        })
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          field: 'register_general',
          message: err.message || 'Registration failed'
        })
      } finally {
        dispatch({ type: 'SET_LOADING', value: false })
      }
    },
    [register, dispatch]
  )

  // Reset password handler
  const handleReset = useCallback(
    async (e) => {
      e.preventDefault()
      dispatch({ type: 'CLEAR_ERRORS' })

      if (!validators.email(reset.email)) {
        dispatch({
          type: 'SET_ERROR',
          field: 'reset_email',
          message: 'Invalid email address'
        })
        return
      }

      dispatch({ type: 'SET_LOADING', value: true })

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(
          reset.email,
          {
            redirectTo: `${window.location.origin}/auth/update-password`
          }
        )
        if (error) throw error
        dispatch({
          type: 'SET_SUCCESS',
          message: 'Password reset email sent! Check your inbox.'
        })
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          field: 'reset_general',
          message: err.message || 'Failed to send reset email'
        })
      } finally {
        dispatch({ type: 'SET_LOADING', value: false })
      }
    },
    [reset, dispatch]
  )

  const switchView = useCallback(
    (view) => {
      dispatch({ type: 'OPEN_MODAL', view })
    },
    [dispatch]
  )

  return (
    <div className='w-full max-w-md'>
      {/* Login Form */}
      {modalView === 'login' && (
        <LoginForm
          email={login.email}
          password={login.password}
          showPassword={login.showPassword}
          isLoading={isLoading}
          errors={errors}
          onEmailChange={(e) =>
            handleFieldChange('login', 'email', e.target.value)
          }
          onPasswordChange={(e) =>
            handleFieldChange('login', 'password', e.target.value)
          }
          onTogglePassword={() => togglePassword('login', 'showPassword')}
          onSubmit={handleLogin}
          onGoogleSignIn={handleGoogleSignIn}
          onSwitchToRegister={() => switchView('register')}
          onSwitchToReset={() => switchView('reset')}
        />
      )}

      {/* Register Form */}
      {modalView === 'register' && (
        <RegisterForm
          formData={register}
          isLoading={isLoading}
          errors={errors}
          successMessage={successMessage}
          onFieldChange={handleFieldChange}
          onTogglePassword={togglePassword}
          onSubmit={handleRegister}
          onSwitchToLogin={() => switchView('login')}
        />
      )}

      {/* Reset Form */}
      {modalView === 'reset' && (
        <ResetForm
          email={reset.email}
          isLoading={isLoading}
          errors={errors}
          successMessage={successMessage}
          onEmailChange={(e) =>
            handleFieldChange('reset', 'email', e.target.value)
          }
          onSubmit={handleReset}
          onSwitchToLogin={() => switchView('login')}
        />
      )}
    </div>
  )
})

AuthForms.displayName = 'AuthForms'

// Login Form Component
const LoginForm = memo(
  ({
    email,
    password,
    showPassword,
    isLoading,
    errors,
    onEmailChange,
    onPasswordChange,
    onTogglePassword,
    onSubmit,
    onGoogleSignIn,
    onSwitchToRegister,
    onSwitchToReset
  }) => (
    <form
      onSubmit={onSubmit}
      className='space-y-6 rounded-2xl bg-transparent p-8'
    >
      <h2 className='text-center text-3xl font-semibold text-neutral-100'>
        Welcome Back
      </h2>

      {errors.login_general && (
        <div className='rounded-lg border border-orange-600/30 bg-orange-900/20 p-3 text-sm text-orange-400'>
          {errors.login_general}
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
          placeholder='Email'
          className='w-full pl-11'
          required
        />
        {errors.login_email && (
          <p className='mt-1 text-sm text-orange-400'>{errors.login_email}</p>
        )}
      </div>

      <div className='relative'>
        <Lock className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400' />
        <FormInput
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={onPasswordChange}
          placeholder='Password'
          className='w-full pr-11 pl-11'
          required
        />
        <button
          type='button'
          onClick={onTogglePassword}
          className='absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-200'
        >
          {showPassword ? (
            <EyeOff className='h-5 w-5' />
          ) : (
            <Eye className='h-5 w-5' />
          )}
        </button>
        {errors.login_password && (
          <p className='mt-1 text-sm text-orange-400'>
            {errors.login_password}
          </p>
        )}
      </div>

      <div className='flex justify-end'>
        <HyperLinks
          onClick={onSwitchToReset}
          text='Forgot Password?'
          className='text-sm text-neutral-400 transition-colors hover:text-orange-400'
        />
      </div>

      <Button
        type='submit'
        disabled={isLoading}
        text={isLoading ? 'Signing In...' : 'Sign In'}
        className='w-full'
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
        <span>Sign in with Google</span>
      </button>

      <div className='text-center'>
        <HyperLinks
          onClick={onSwitchToRegister}
          text="Don't have an account? Sign up"
          className='text-sm text-neutral-400 transition-colors hover:text-orange-400'
        />
      </div>
    </form>
  )
)

LoginForm.displayName = 'LoginForm'

// Register Form Component
const RegisterForm = memo(
  ({
    formData,
    isLoading,
    errors,
    successMessage,
    onFieldChange,
    onTogglePassword,
    onSubmit,
    onSwitchToLogin
  }) => (
    <form
      onSubmit={onSubmit}
      className='space-y-6 rounded-2xl bg-transparent p-8'
    >
      <h2 className='text-center text-3xl font-semibold text-neutral-100'>
        Get Started
      </h2>

      {successMessage && (
        <div className='rounded-lg border border-green-600/30 bg-green-900/20 p-3 text-sm text-green-400'>
          {successMessage}
        </div>
      )}
      {errors.register_general && (
        <div className='rounded-lg border border-orange-600/30 bg-orange-900/20 p-3 text-sm text-orange-400'>
          {errors.register_general}
        </div>
      )}

      <div className='relative'>
        <User className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400' />
        <FormInput
          type='text'
          value={formData.fullName}
          onChange={(e) =>
            onFieldChange('register', 'fullName', e.target.value)
          }
          placeholder='Full Name'
          className='w-full pl-11'
          required
        />
        {errors.register_name && (
          <p className='mt-1 text-sm text-orange-400'>{errors.register_name}</p>
        )}
      </div>

      <div className='relative'>
        <Mail className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400' />
        <FormInput
          type='email'
          value={formData.email}
          onChange={(e) => onFieldChange('register', 'email', e.target.value)}
          placeholder='Email'
          className='w-full pl-11'
          required
        />
        {errors.register_email && (
          <p className='mt-1 text-sm text-orange-400'>
            {errors.register_email}
          </p>
        )}
      </div>

      <div className='relative'>
        <Lock className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400' />
        <FormInput
          type={formData.showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={(e) =>
            onFieldChange('register', 'password', e.target.value)
          }
          placeholder='Password'
          className='w-full pr-11 pl-11'
          required
        />
        <button
          type='button'
          onClick={() => onTogglePassword('register', 'showPassword')}
          className='absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-200'
        >
          {formData.showPassword ? (
            <EyeOff className='h-5 w-5' />
          ) : (
            <Eye className='h-5 w-5' />
          )}
        </button>
        {errors.register_password && (
          <p className='mt-1 text-sm text-orange-400'>
            {errors.register_password}
          </p>
        )}
      </div>

      <div className='relative'>
        <LockKeyhole className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400' />
        <FormInput
          type={formData.showCPassword ? 'text' : 'password'}
          value={formData.cpassword}
          onChange={(e) =>
            onFieldChange('register', 'cpassword', e.target.value)
          }
          placeholder='Confirm Password'
          className='w-full pr-11 pl-11'
          required
        />
        <button
          type='button'
          onClick={() => onTogglePassword('register', 'showCPassword')}
          className='absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-200'
        >
          {formData.showCPassword ? (
            <EyeOff className='h-5 w-5' />
          ) : (
            <Eye className='h-5 w-5' />
          )}
        </button>
        {errors.register_cpassword && (
          <p className='mt-1 text-sm text-orange-400'>
            {errors.register_cpassword}
          </p>
        )}
      </div>

      <div className='space-y-3'>
        <label className='group flex cursor-pointer items-start gap-3'>
          <input
            type='checkbox'
            checked={formData.agreeToTerms}
            onChange={(e) =>
              onFieldChange('register', 'agreeToTerms', e.target.checked)
            }
            className='mt-1 h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-orange-500 transition-colors focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-0'
            required
          />
          <span className='text-sm text-neutral-300 transition-colors group-hover:text-neutral-100'>
            I agree to the{' '}
            <a
              href='#'
              className='text-orange-400 hover:text-orange-300 hover:underline'
            >
              Terms of Use
            </a>{' '}
            and{' '}
            <a
              href='#'
              className='text-orange-400 hover:text-orange-300 hover:underline'
            >
              Privacy Policy
            </a>
          </span>
        </label>

        <label className='group flex cursor-pointer items-start gap-3'>
          <input
            type='checkbox'
            checked={formData.agreeToSMS}
            onChange={(e) =>
              onFieldChange('register', 'agreeToSMS', e.target.checked)
            }
            className='mt-1 h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-orange-500 transition-colors focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-0'
          />
          <span className='text-sm text-neutral-400 transition-colors group-hover:text-neutral-300'>
            I consent to receive SMS and email updates
          </span>
        </label>
        {errors.register_terms && (
          <p className='text-sm text-orange-400'>{errors.register_terms}</p>
        )}
      </div>

      <Button
        type='submit'
        disabled={isLoading}
        text={isLoading ? 'Signing Up...' : 'Sign Up'}
        className='w-full'
      />

      <div className='text-center'>
        <HyperLinks
          onClick={onSwitchToLogin}
          text='Already have an account? Log in'
          className='text-sm text-neutral-400 transition-colors hover:text-orange-400'
        />
      </div>
    </form>
  )
)

RegisterForm.displayName = 'RegisterForm'

// Reset Form Component
const ResetForm = memo(
  ({
    email,
    isLoading,
    errors,
    successMessage,
    onEmailChange,
    onSubmit,
    onSwitchToLogin
  }) => (
    <form
      onSubmit={onSubmit}
      className='space-y-6 rounded-2xl bg-transparent p-8'
    >
      <h2 className='text-center text-3xl font-semibold text-neutral-100'>
        Reset Password
      </h2>
      <p className='text-center text-sm text-neutral-400'>
        Enter your email to receive a password reset link
      </p>

      {successMessage && (
        <div className='rounded-lg border border-green-600/30 bg-green-900/20 p-3 text-sm text-green-400'>
          {successMessage}
        </div>
      )}
      {errors.reset_general && (
        <div className='rounded-lg border border-orange-600/30 bg-orange-900/20 p-3 text-sm text-orange-400'>
          {errors.reset_general}
        </div>
      )}

      <div className='relative'>
        <Mail className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400' />
        <FormInput
          type='email'
          value={email}
          onChange={onEmailChange}
          placeholder='Email'
          className='w-full pl-11'
          required
        />
        {errors.reset_email && (
          <p className='mt-1 text-sm text-orange-400'>{errors.reset_email}</p>
        )}
      </div>

      <Button
        type='submit'
        disabled={isLoading}
        text={isLoading ? 'Sending...' : 'Send Reset Link'}
        className='w-full'
      />

      <div className='text-center'>
        <HyperLinks
          onClick={onSwitchToLogin}
          text='Back to login'
          className='text-sm text-neutral-400 transition-colors hover:text-orange-400'
        />
      </div>
    </form>
  )
)

ResetForm.displayName = 'ResetForm'

export default AuthForms
