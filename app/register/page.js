'use client'
import { useState } from 'react'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LockKeyhole,
  ChevronDown
} from 'lucide-react'
import NeonBackground from '../ui_components/primaryBackground/page'
import { auth } from '../../firebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useAuth } from '../contexts/authContext'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [agreeToSMS, setAgreeToSMS] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const { userLoggedIn } = useAuth()
  const router = useRouter()
  const [showCPassword, setShowCPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    cpassword: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Simple field validation helpers
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email)
  const validatePassword = (password) =>
    password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Field Validations
    if (!formData.firstName) {
      setError('Please enter your first name.')
      return
    }

    if (!formData.lastName) {
      setError('Please enter your last name.')
      return
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!validatePassword(formData.password)) {
      setError(
        'Password must be at least 8 characters long and contain letters and numbers.'
      )
      return
    }

    if (formData.password !== formData.cpassword) {
      setError('Passwords do not match.')
      return
    }

    if (!agreeToTerms) {
      setError('You must agree to the terms and conditions.')
      return
    }

    try {
      setIsRegistering(true)
      // Firebase registration
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )
      setSuccess('Registration successful! Redirecting to login...')
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        cpassword: ''
      })

      // Optional: redirect after 2 seconds
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      console.error('Error during registration:', err)
      setError(err.message)
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div>
      <NeonBackground />
      <div className='v-full flex h-full flex-row'>
        {userLoggedIn && <Navigate to={'/login'} replace={true} />}
        {/* Left side UI remains unchanged */}
        <div className='relative h-screen w-[40%]'>
          <div className='absolute h-full w-full rounded-r-[250px] bg-[url("/agent.jpg")] mask-r-from-80% bg-cover bg-center opacity-25'></div>
          <div className='transparent absolute flex h-full w-full flex-col items-center justify-center py-8 text-center text-[12px] font-medium tracking-[0.2rem] text-white uppercase'>
            <h1 className='mb-4 text-2xl font-bold'>Welcome</h1>
            <h1 className='text-[15px] font-bold'>
              Enter your personal details to use all of our features
            </h1>
            <h1 className='mt-16 text-[15px] font-bold'>
              Already have an account?
            </h1>
            <div className='transparent mt-4 w-1/2 rounded-[5px] border-[1px] border-solid border-white p-2 text-center text-[20px] font-bold tracking-[0.5rem] text-white uppercase shadow-[0_0_10px_rgba(59,130,246)] shadow-sky-500 transition hover:cursor-pointer hover:bg-white hover:text-black hover:shadow-[0_0_50px_rgba(59,130,246)]'>
              <button>
                <a href='/login'>SIGN IN</a>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className='flex w-full items-center justify-center p-8 lg:w-1/2'>
          <div className='w-[70%]'>
            <form
              onSubmit={onSubmit}
              className='rounded-2xl border-5 bg-transparent p-8 shadow-xl'
            >
              <div className='space-y-6'>
                <div className='mb-10 block text-center text-3xl font-medium text-white'>
                  Get started with your account
                </div>

                {/* Error / Success Messages */}
                {error && <p className='text-center text-red-500'>{error}</p>}
                {success && (
                  <p className='text-center text-green-500'>{success}</p>
                )}

                {/* Name Fields */}
                <div className='relative'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <User className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                      <input
                        type='text'
                        id='firstName'
                        name='firstName'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className='border-b-primary w-full border-2 border-transparent px-4 py-3 pl-10 text-white placeholder-gray-400 transition-all duration-300 focus:border-b-blue-400 focus:ring-2 focus:ring-transparent focus:outline-none'
                        placeholder='First Name'
                        required
                      />
                    </div>
                    <div>
                      <input
                        type='text'
                        id='lastName'
                        name='lastName'
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className='border-b-primary w-full border-2 border-transparent px-4 py-3 text-white placeholder-gray-400 transition-all duration-300 focus:border-b-blue-400 focus:ring-2 focus:ring-transparent focus:outline-none'
                        placeholder='Last Name'
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field with Mail Icon */}
                <div className='relative'>
                  <Mail className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                  <input
                    type='email'
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className='border-b-primary w-full border-2 border-transparent px-4 py-3 pl-10 text-white placeholder-gray-400 transition-all duration-300 focus:border-b-blue-400 focus:ring-2 focus:ring-transparent focus:outline-none'
                    required
                    placeholder='Email'
                  />
                </div>

                {/* Password Field with Lock + Eye Icons */}
                <div className='relative'>
                  <Lock className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id='password'
                    name='password'
                    value={formData.password}
                    onChange={handleInputChange}
                    className='border-b-primary w-full border-2 border-transparent py-3 pr-10 pl-10 text-white placeholder-gray-400 transition-all duration-300 focus:border-b-blue-400 focus:ring-2 focus:ring-transparent focus:outline-none'
                    required
                    placeholder='Password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-400'
                  >
                    {showPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className='relative'>
                  <LockKeyhole className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                  <input
                    type={showCPassword ? 'text' : 'password'}
                    id='cpassword'
                    name='cpassword'
                    value={formData.cpassword}
                    onChange={handleInputChange}
                    className='border-b-primary w-full border-2 border-transparent py-3 pr-10 pl-10 text-white placeholder-gray-400 transition-all duration-300 focus:border-b-blue-400 focus:ring-2 focus:ring-transparent focus:outline-none'
                    required
                    placeholder='Confirm Password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowCPassword(!showCPassword)}
                    className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-400'
                  >
                    {showCPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>

                {/* Checkboxes */}
                <div className='space-y-3'>
                  <div className='flex items-start space-x-3'>
                    <input
                      type='checkbox'
                      id='terms'
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className='mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      required
                    />
                    <label
                      htmlFor='terms'
                      className='text-lg leading-relaxed text-white'
                    >
                      By creating an account I agree to our{' '}
                      <a href='#' className='text-blue-600 hover:underline'>
                        Terms of Use
                      </a>{' '}
                      and{' '}
                      <a href='#' className='text-blue-600 hover:underline'>
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <input
                      type='checkbox'
                      id='sms'
                      checked={agreeToSMS}
                      onChange={(e) => setAgreeToSMS(e.target.checked)}
                      className='mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label
                      htmlFor='sms'
                      className='text-lg leading-relaxed text-white'
                    >
                      By creating an account I am also consenting to receive SMS
                      messages and emails, including product new feature
                      updates, events, and marketing promotions.
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className='flex justify-center'>
                  <button
                    type='submit'
                    disabled={isRegistering}
                    className='transparent mt-4 w-1/2 transform rounded-[5px] border-[1px] border-solid border-white p-2 text-center text-[20px] font-bold tracking-[0.5rem] text-white uppercase shadow-[0_0_10px_rgba(59,130,246)] transition-all duration-300 hover:scale-105 hover:cursor-pointer hover:bg-white hover:text-black hover:shadow-[0_0_50px_rgba(59,130,246)]'
                  >
                    {isRegistering ? 'Signing Up...' : 'Sign Up'}
                  </button>
                </div>

                {/* Login Link */}
                <div className='text-center'>
                  <span className='text-lg text-gray-600'>
                    Already have an account?{' '}
                    <a
                      href='./login'
                      className='font-medium text-blue-600 hover:underline'
                    >
                      Log in
                    </a>
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
