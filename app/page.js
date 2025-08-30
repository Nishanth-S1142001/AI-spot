'use client'
import React, { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import NeonBackground from '../components/background'
import {
  Bot,
  Code,
  Cloud,
  Quote,
  Twitter,
  Linkedin,
  Github,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  LockKeyhole
} from 'lucide-react'
import Button from '../components/button'
import HyperLinks from '../components/hyperLinks'
import FormInput from '../components/formInputField'
import { useAuth } from '../contexts/authContext'
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doPasswordReset,
  doCreateUserWithEmailAndPassword
} from '../lib/firebase/firebaseUtils'
import styles from './page.module.css'
import { useRouter, useSearchParams } from 'next/navigation'
import NavigationHomeBar from '../components/navigationBar/homeBar'
import myVideo2 from '../public/robot.mp4'
import { Form } from 'react-router-dom'

export default function Home() {
  const [showPassword, setShowPassword] = useState(false)
  const { userLoggedIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [emailError, setEmailError] = useState('')
  const [rEmailError, setrEmailError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rError, setRError] = useState('')
  const [rSuccess, setRSuccess] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [isReset, setIsReset] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const videoRef = useRef(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [showRegisterPassword, setshowRegisterPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [agreeToSMS, setAgreeToSMS] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const { userSignedIn } = useAuth()
  const [showRegisterCPassword, setShowRegisterCPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    cpassword: ''
  })

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (password) =>
    password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
  const validateForm = () => {
    let valid = true
    setEmailError('')
    setPasswordError('')
    setErrorMessage('')

    // Email validation
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      valid = false
    }

    // Password validation
    if (!validatePassword(password)) {
      setPasswordError(
        'Password must be at least 6 characters and contain a number and a letter'
      )
      valid = false
    }

    return valid
  }

  const rEmailValidation = () => {
    setrEmailError('')
    let valid = true
    if (!validateEmail(rEmail)) {
      setrEmailError('Please enter a valid email address')
      valid = false
    }
    return valid
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!isSigningIn && validateForm()) {
      setIsSigningIn(true)
      try {
        await doSignInWithEmailAndPassword(email, password)
        // if successful → user is signed in  // doSendEmailVerification()
      } catch (err) {
        // handle Firebase auth errors
        if (err.code === 'auth/invalid-credential') {
          setPasswordError('Incorrect password')
        } else if (err.code === 'auth/user-not-found') {
          setEmailError('No account found with this email')
        } else {
          setErrorMessage(err.message)
        }
      } finally {
        setIsSigningIn(false)
      }
    }
  }

  const onGoogleSignIn = async (e) => {
    e.preventDefault()
    if (!isSigningIn) {
      setIsSigningIn(true)
      try {
        await doSignInWithGoogle()
        // success → likely redirect or update context
      } catch (err) {
        console.error(err)
        setIsSigningIn(false) // only reset on failure
      }
    }
  }
  const onResetSubmit = async (e) => {
    e.preventDefault()
    if (rEmailValidation()) {
      setRError('')
      setRSuccess('')

      setIsSending(true)
      console.log('yohiuhoifnldasds')
      try {
        await doPasswordReset(rEmail)
        setRSuccess('Password reset email sent! Check your inbox.')
      } catch (rError) {
        console.error('Error sending password reset email:', rError)
        // Handle errors
        if (rError.code === 'auth/user-not-found') {
          setRError('No user found with this email.')
        } else if (rError.code === 'auth/invalid-email') {
          setRError('Invalid email address.')
        } else {
          setRError(rError.message)
        }
      } finally {
        setIsSending(false)
      }
    }
  }
  const handleClose = () => {
    setIsOpen(false)
    setIsLogin(false)
    setIsReset(false)
    setIsRegister(false)
  }
  const handleLogin = () => {
    setIsOpen(true)
    setIsLogin(true)
    setIsRegister(false)
    setIsReset(false)
  }
  const handleSignup = () => {
    setIsOpen(true)
    setIsRegister(true)
    setIsLogin(false)
    setIsReset(false)
  }

  const handleReset = () => {
    setIsOpen(true)
    setIsReset(true)
    setIsLogin(false)
    setIsRegister(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const onRegisterSubmit = async (e) => {
    e.preventDefault()
    setRegisterError('')
    setRegisterSuccess('')

    // Field Validations
    if (!formData.firstName) {
      setRegisterError('Please enter your first name.')
      return
    }

    if (!formData.lastName) {
      setRegisterError('Please enter your last name.')
      return
    }

    if (!validateEmail(formData.email)) {
      setRegisterError('Please enter a valid email address.')
      return
    }

    if (!validatePassword(formData.password)) {
      setRegisterError(
        'Password must be at least 8 characters long and contain letters and numbers.'
      )
      return
    }

    if (formData.password !== formData.cpassword) {
      setRegisterError('Passwords do not match.')
      return
    }

    if (!agreeToTerms) {
      setRegisterError('You must agree to the terms and conditions.')
      return
    }

    try {
      setIsRegistering(true)
      // Firebase registration
      await doCreateUserWithEmailAndPasswordcreateUserWithEmailAndPassword(
        formData.email,
        formData.password
      )
      setRegisterSuccess(
        'Registration successful! Redirecting to login...Please login with your new credentials.'
      )
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
      console.registerError('registerError during registration:', err)
      setRegisterError(err.message)
    } finally {
      setIsRegistering(false)
    }
  }

  useEffect(() => {
    if (userSignedIn) {
      router.push('/userAuthentication/login')
    }
  }, [userSignedIn, router])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5 // Set speed to 0.5x
    }
  }, [])

  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setIsOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (userLoggedIn) {
      ;(console.log('true:' + userLoggedIn), router.push('/dashboard'))
    }
  }, [userLoggedIn, router])
  useEffect(() => {
    if (isOpen && isReset) {
      setRError('')
      setRSuccess('')
      setREmail('')
    }
  }, [isOpen, isReset])

  return (
    <>
      <NeonBackground />
      <NavigationHomeBar onLoginClick={handleLogin} />

      <div id='home' className='flex h-screen items-center justify-center p-4'>
        {/* Main Content */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'blur-sm' : ''}`}
        >
          <div>
            <NeonBackground />
            {/* 1. Header / Menu */}

            {/* Hero Section (Your original content) */}
            <div
              id='home'
              className='relative flex h-screen flex-col items-center justify-center p-6'
            >
              {/* Background video */}
              <video
                ref={videoRef}
                src={myVideo2}
                autoPlay
                muted
                loop
                className='absolute top-18 left-0 h-full w-full mask-b-from-[55%] object-cover opacity-40'
              />
              <div className='z-10 flex flex-col items-center justify-center py-8 text-center font-medium tracking-[1rem] text-white uppercase'>
                <h1 className='m-2 text-[130px]'>
                  {'build'}{' '}
                  <span className='bg-black text-[115px] text-white shadow-xl shadow-white'>
                    your
                  </span>
                </h1>
                <h1 className='m-2 text-[100px]'>
                  <span className='bg-black text-blue-400 shadow-lg shadow-[#024a70]'>
                    no code
                  </span>
                  {' AI agents'}
                </h1>
                <h1 className='mt-2 mb-5 text-[50px]'>now</h1>
                <div>
                  <Button
                    text={'BUILD NOW'}
                    onClick={() => {
                      setIsOpen(true)
                      setIsLogin(true)
                      setIsReset(false)
                    }}
                  ></Button>
                </div>
              </div>
            </div>

            {/* Main content container for all sections */}
            <main className='bg-opacity-80 relative z-10 text-white'>
              {/* 2. About Us Section */}
              <section
                id='about'
                className='px-4 py-20 shadow-2xl shadow-black'
              >
                <div className='container mx-auto max-w-4xl bg-black text-center'>
                  <h2 className='mb-6 text-4xl font-bold tracking-wider uppercase'>
                    About Us
                  </h2>
                  <p className='text-lg leading-relaxed text-gray-300'>
                    We are pioneers in the no-code AI revolution. Our mission is
                    to empower creators, entrepreneurs, and businesses of all
                    sizes to build powerful, autonomous AI agents without
                    writing a single line of code. We believe the future of
                    automation is accessible to everyone.
                  </p>
                </div>
              </section>
              <div className='flex justify-center'></div>

              {/* 3. Services Provided Section */}
              <section
                id='services'
                className='bg-opacity-20 bg-tranparent px-4 py-20 shadow-xl shadow-black'
              >
                <div className='container mx-auto max-w-6xl text-center'>
                  <h2 className='mb-12 text-4xl font-bold tracking-wider uppercase'>
                    Our Services
                  </h2>
                  <div className='grid gap-8 md:grid-cols-3'>
                    {/* Service Card 1 */}
                    <div className='transform rounded-lg border border-cyan-500/20 bg-gray-800 p-8 transition-all hover:-translate-y-2 hover:border-cyan-500'>
                      <Bot size={48} className='mx-auto mb-4 text-cyan-400' />
                      <h3 className='mb-2 text-2xl font-semibold'>
                        Custom AI Agent Builder
                      </h3>
                      <p className='text-gray-400'>
                        An intuitive drag-and-drop interface to design, train,
                        and deploy AI agents for any task.
                      </p>
                    </div>
                    {/* Service Card 2 */}
                    <div className='transform rounded-lg border border-cyan-500/20 bg-gray-800 p-8 transition-all hover:-translate-y-2 hover:border-cyan-500'>
                      <Code size={48} className='mx-auto mb-4 text-cyan-400' />
                      <h3 className='mb-2 text-2xl font-semibold'>
                        API Integration
                      </h3>
                      <p className='text-gray-400'>
                        Seamlessly connect your AI agents to thousands of
                        third-party apps and services.
                      </p>
                    </div>
                    {/* Service Card 3 */}
                    <div className='transform rounded-lg border border-cyan-500/20 bg-gray-800 p-8 transition-all hover:-translate-y-2 hover:border-cyan-500'>
                      <Cloud size={48} className='mx-auto mb-4 text-cyan-400' />
                      <h3 className='mb-2 text-2xl font-semibold'>
                        Cloud Deployment
                      </h3>
                      <p className='text-gray-400'>
                        One-click deployment to our secure and scalable cloud
                        infrastructure.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. Testimonials Section */}
              <section
                id='testimonials'
                className='px-4 py-20 shadow-2xl shadow-black'
              >
                <div className='container mx-auto max-w-4xl text-center'>
                  <h2 className='mb-12 text-4xl font-bold tracking-wider uppercase'>
                    What Our Clients Say
                  </h2>
                  <div className='space-y-8'>
                    {/* Testimonial 1 */}
                    <div className='relative rounded-lg bg-gray-800 p-6 text-left'>
                      <Quote
                        size={40}
                        className='absolute top-4 left-4 text-cyan-600 opacity-20'
                      />
                      <blockquote className='text-lg text-gray-300 italic'>
                        "This platform changed the game for our startup. We
                        automated 80% of our customer support in a week without
                        hiring a developer. Incredible!"
                      </blockquote>
                      <cite className='mt-4 block text-right font-semibold text-cyan-400 not-italic'>
                        - Jane Doe, CEO of Tech Innovators
                      </cite>
                    </div>
                    {/* Testimonial 2 */}
                    <div className='relative rounded-lg bg-gray-800 p-6 text-left'>
                      <Quote
                        size={40}
                        className='absolute top-4 left-4 text-cyan-600 opacity-20'
                      />
                      <blockquote className='text-lg text-gray-300 italic'>
                        "The flexibility of the agent builder is unmatched. I
                        was able to create a complex marketing automation agent
                        that now saves me 10 hours a week."
                      </blockquote>
                      <cite className='mt-4 block text-right font-semibold text-cyan-400 not-italic'>
                        - John Smith, Marketing Freelancer
                      </cite>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. Pricing Section */}
              <section
                id='pricing'
                className='bg-opacity-20 bg-tranparent px-4 py-20 shadow-xl shadow-[#024a70]'
              >
                <div className='container mx-auto max-w-6xl text-center'>
                  <h2 className='mb-12 text-4xl font-bold tracking-wider uppercase'>
                    Pricing Plans
                  </h2>
                  <div className='grid gap-8 md:grid-cols-3'>
                    {/* Plan 1: Starter */}
                    <div className='flex flex-col rounded-lg border border-gray-700 bg-gray-800 p-8'>
                      <h3 className='mb-2 text-2xl font-semibold'>Starter</h3>
                      <p className='mb-4 text-5xl font-bold'>
                        $49
                        <span className='text-lg font-normal text-gray-400'>
                          /mo
                        </span>
                      </p>
                      <ul className='mb-8 flex-grow space-y-2 text-left text-gray-300'>
                        <li>✔ 1 AI Agent</li>
                        <li>✔ 10,000 Operations/mo</li>
                        <li>✔ Basic API Integrations</li>
                        <li>✔ Email Support</li>
                      </ul>
                      <Button text={'Choose Plan'} />
                    </div>
                    {/* Plan 2: Pro (Highlighted) */}
                    <div className='relative flex flex-col rounded-lg border-2 border-cyan-500 bg-gray-800 p-8'>
                      <span className='absolute top-0 -translate-y-1/2 rounded-full bg-cyan-500 px-3 py-1 text-sm font-bold text-black'>
                        MOST POPULAR
                      </span>
                      <h3 className='mb-2 text-2xl font-semibold'>Pro</h3>
                      <p className='mb-4 text-5xl font-bold text-cyan-400'>
                        $99
                        <span className='text-lg font-normal text-gray-400'>
                          /mo
                        </span>
                      </p>
                      <ul className='mb-8 flex-grow space-y-2 text-left text-gray-300'>
                        <li>✔ 10 AI Agents</li>
                        <li>✔ 100,000 Operations/mo</li>
                        <li>✔ Advanced API Integrations</li>
                        <li>✔ Priority Email Support</li>
                      </ul>
                      <Button text={'Choose Plan'} />
                    </div>
                    {/* Plan 3: Enterprise */}
                    <div className='flex flex-col rounded-lg border border-gray-700 bg-gray-800 p-8'>
                      <h3 className='mb-2 text-2xl font-semibold'>
                        Enterprise
                      </h3>
                      <p className='mb-4 text-4xl font-bold'>Custom</p>
                      <ul className='mb-8 flex-grow space-y-2 text-left text-gray-300'>
                        <li>✔ Unlimited Agents</li>
                        <li>✔ Unlimited Operations</li>
                        <li>✔ Custom Integrations</li>
                        <li>✔ 24/7 Dedicated Support</li>
                      </ul>
                      <Button text={'Choose Plan'} />
                    </div>
                  </div>
                </div>
              </section>
            </main>
            {/* 6. Contact Us / Footer Section */}
            <footer
              id='contact'
              className='bg-tranparent relative z-10 px-4 py-10 text-center text-gray-400'
            >
              <div className='container mx-auto'>
                <h2 className='mb-4 text-3xl font-bold text-white'>
                  Get In Touch
                </h2>
                <p className='mb-6'>
                  Have questions? We'd love to hear from you.
                </p>
                <p className='mb-8 text-lg text-cyan-400'>
                  contact@aiagentsinc.com
                </p>
                <div className='mb-8 flex justify-center space-x-6'>
                  <a href='#' className='transition-colors hover:text-white'>
                    <Twitter size={28} />
                  </a>
                  <a href='#' className='transition-colors hover:text-white'>
                    <Linkedin size={28} />
                  </a>
                  <a href='#' className='transition-colors hover:text-white'>
                    <Github size={28} />
                  </a>
                </div>
                <p className='text-sm'>
                  &copy; {new Date().getFullYear()} AI Agents Inc. All Rights
                  Reserved.
                </p>
              </div>
            </footer>
          </div>
        </div>

        {/* Modal Backdrop and Content */}
        {isOpen && (
          <>
            {/* Backdrop */}

            <div
              className='bg-opacity-50 fixed inset-0 z-40'
              onClick={handleClose}
            />

            {/* Modal */}
            <div
              id='login'
              className='fixed z-50 mx-auto flex w-[40%] items-center justify-center'
            >
              <div className='rounded-lg border border-gray-700 bg-[url(/backgroundImage1.png)] bg-cover bg-center p-8 shadow-2xl'>
                {/* Header */}
                <div className='mb-6 flex items-center justify-end'>
                  <div
                    onClick={handleClose}
                    className='cursor-pointer p-1 text-gray-400 transition-colors hover:text-white'
                  >
                    <X size={20} />
                  </div>
                </div>
                {isLogin && !isReset && !isRegister && (
                  <form
                    className='w-[100%] rounded-2xl bg-transparent p-8 shadow-2xl'
                    onSubmit={onSubmit}
                  >
                    <div className='space-y-6'>
                      <div className='mb-10 block text-center text-3xl font-medium text-white'>
                        Get exclusive access to our resources
                      </div>

                      {/* Email */}
                      <div className='relative'>
                        <Mail className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                        <FormInput
                          type='text'
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder='Email'
                          required={true}
                        />
                        {emailError && (
                          <p className='mt-1 text-sm text-sky-500'>
                            {emailError}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div className='space-y-2'>
                        <div className='relative'>
                          <Lock className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                          <FormInput
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Password'
                            required={true}
                          />
                          <div
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute top-1/2 right-4 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600'
                          >
                            {showPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </div>
                        </div>
                        {passwordError && (
                          <p className='mt-1 text-sm text-sky-500'>
                            {passwordError}
                          </p>
                        )}
                      </div>

                      {/* Forgot Password */}
                      <div className='flex items-center justify-end'>
                        <HyperLinks
                          onClick={() => {
                            handleReset()
                          }}
                          text={'Forgot password?'}
                        >
                          Forgot password?
                        </HyperLinks>
                      </div>

                      {/* General Error */}
                      {errorMessage && (
                        <span className='font-bold text-sky-500'>
                          {errorMessage}
                        </span>
                      )}

                      {/* Login Button */}
                      <div className='flex justify-center'>
                        <Button
                          disabled={isSigningIn}
                          text={isSigningIn ? 'Signing In...' : 'SIGN IN'}
                        ></Button>
                      </div>

                      {/* Create Account */}
                      <div className='text-center'>
                        <HyperLinks
                          onClick={handleSignup}
                          text={'Have not signed up? Click here'}
                        ></HyperLinks>
                      </div>

                      {/* Divider */}
                      <div className='mb-6'>
                        <div className='relative'>
                          <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-gray-600'></div>
                          </div>
                          <div className='relative flex justify-center text-sm'>
                            <span className='bg-gray-800 px-4 text-gray-400'>
                              Or continue with
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='flex justify-center text-center'>
                        <button
                          disabled={isSigningIn}
                          onClick={(e) => {
                            onGoogleSignIn(e)
                          }}
                          className='flex w-full justify-center rounded-xl py-3 text-white shadow-2xl shadow-black transition hover:cursor-pointer hover:bg-gray-200'
                        >
                          <svg
                            className='h-5 w-5'
                            viewBox='0 0 48 48'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <g clipPath='url(#clip0_17_40)'>
                              <path
                                d='M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z'
                                fill='#4285F4'
                              />
                              <path
                                d='M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z'
                                fill='#34A853'
                              />
                              <path
                                d='M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z'
                                fill='#FBBC04'
                              />
                              <path
                                d='M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z'
                                fill='#EA4335'
                              />
                            </g>
                            <defs>
                              <clipPath id='clip0_17_40'>
                                <rect width='48' height='48' fill='white' />
                              </clipPath>
                            </defs>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {isReset && !isLogin && !isRegister && (
                  <form
                    className='w-[100%] rounded-2xl bg-transparent p-8 shadow-2xl'
                    onSubmit={onResetSubmit}
                  >
                    <div className='space-y-6'>
                      <div className='mb-10 block text-center text-3xl font-medium text-white'>
                        Enter your email to reset password
                      </div>

                      {/* Email */}
                      <div className='relative'>
                        <Mail className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                        <FormInput
                          type='text'
                          value={rEmail}
                          onChange={(e) => setREmail(e.target.value)}
                          placeholder='Email'
                          required={true}
                        />
                      </div>

                      {/* Message */}
                      {rSuccess && (
                        <p className='mt-1 text-sm text-green-500'>
                          {rSuccess}
                        </p>
                      )}
                      {rError && (
                        <p className='mt-1 text-sm text-red-500'>{rError}</p>
                      )}

                      <div className='flex justify-center'>
                        <Button
                          text={isSending ? 'Sending...' : 'Send Reset Link'}
                          disabled={!rEmail || isSending}
                        ></Button>
                      </div>
                    </div>
                  </form>
                )}
                {!isReset && !isLogin && isRegister && (
                  <>
                    {' '}
                    hi
                    <form
                      className='w-[100%] rounded-2xl bg-transparent p-8 shadow-2xl'
                      onSubmit={onRegisterSubmit}
                    >
                      <div className='space-y-6'>
                        <div className='mb-10 block text-center text-3xl font-medium text-white'>
                          Get started with your account
                        </div>

                        {/* registerError / registerSuccess Messages */}
                        {registerError && (
                          <p className='text-center text-red-500'>
                            {registerError}
                          </p>
                        )}
                        {registerSuccess && (
                          <p className='text-center text-green-500'>
                            {registerSuccess}
                          </p>
                        )}

                        {/* Name Fields */}
                        <div className='relative'>
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <User className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                              <FormInput
                                type='text'
                                id='firstName'
                                name='firstName'
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder='First Name'
                                required={true}
                              />
                            </div>
                            <div>
                              <FormInput
                                type='text'
                                id='lastName'
                                name='lastName'
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required={true}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Email Field with Mail Icon */}
                        <div className='relative'>
                          <Mail className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                          <FormInput
                            type='email'
                            id='email'
                            name='email'
                            value={formData.email}
                            onChange={handleInputChange}
                            required={true}
                            placeholder='Email'
                          />
                        </div>

                        {/* Password Field with Lock + Eye Icons */}
                        <div className='relative'>
                          <Lock className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                          <FormInput
                            type={showRegisterPassword ? 'text' : 'password'}
                            id='password'
                            name='password'
                            value={formData.password}
                            onChange={handleInputChange}
                            required={true}
                            placeholder='Password'
                          />
                          <button
                            type='button'
                            onClick={() =>
                              setshowRegisterPassword(!showRegisterPassword)
                            }
                            className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-400'
                          >
                            {showRegisterPassword ? (
                              <EyeOff className='h-5 w-5' />
                            ) : (
                              <Eye className='h-5 w-5' />
                            )}
                          </button>
                        </div>

                        {/* Confirm Password */}
                        <div className='relative'>
                          <LockKeyhole className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                          <FormInput
                            type={showRegisterCPassword ? 'text' : 'password'}
                            id='cpassword'
                            name='cpassword'
                            value={formData.cpassword}
                            onChange={handleInputChange}
                            required={true}
                            placeholder='Confirm Password'
                          />
                          <button
                            type='button'
                            onClick={() =>
                              setShowRegisterCPassword(!showRegisterCPassword)
                            }
                            className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-400'
                          >
                            {showRegisterCPassword ? (
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
                              onChange={(e) =>
                                setAgreeToTerms(e.target.checked)
                              }
                              className='mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                              required
                            />
                            <label
                              htmlFor='terms'
                              className='text-lg leading-relaxed text-white'
                            >
                              By creating an account I agree to our{' '}
                              <a
                                href='#'
                                className='text-blue-400 hover:underline'
                              >
                                Terms of Use
                              </a>{' '}
                              and{' '}
                              <a
                                href='#'
                                className='text-blue-400 hover:underline'
                              >
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
                              By creating an account I am also consenting to
                              receive SMS messages and emails, including product
                              new feature updates, events, and marketing
                              promotions.
                            </label>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className='flex justify-center'>
                          <Button
                            type='submit'
                            disabled={isRegistering}
                            text={isRegistering ? 'Signing Up...' : 'Sign Up'}
                          ></Button>
                        </div>

                        {/* Login Link */}
                        <div className='text-center'>
                          <HyperLinks
                            className='text-lg font-medium text-gray-600 hover:text-blue-600 hover:underline'
                            onClick={handleLogin}
                            text={'Already have an account? Log in'}
                          ></HyperLinks>
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
