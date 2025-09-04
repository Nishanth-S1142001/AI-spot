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
  LockKeyhole,
  Zap,
  Users,
  Activity,
  MessageSquare,
  TrendingUp
} from 'lucide-react'
import Button from '../components/button'
import HyperLinks from '../components/hyperLinks'
import FormInput from '../components/formInputField'

// import {
//   doSignInWithEmailAndPassword,
//   doSignInWithGoogle,
//   doPasswordReset,
//   doCreateUserWithEmailAndPassword
// } from '../lib/firebase/firebaseUtils'

import { useRouter, useSearchParams } from 'next/navigation'
import NavigationHomeBar from '../components/navigationBar/homeBar'
import myVideo2 from '../public/robot.mp4'

import Card from '../components/card'
import { supabase } from '../lib/supabase/dbClient'

export default function Home() {
  const [showPassword, setShowPassword] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [emailError, setEmailError] = useState('')
  const [rEmailError, setrEmailError] = useState('')
  const [googleError, setGoogleError] = useState('')
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
    password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password)
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
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        console.log('Success')

        router.push('/dashboard') // redirect after login
        // error
        // if successful → user is signed in   -> verification()
      } catch (err) {
        setErrorMessage(err.message || 'Login failed. Please try again.')
      } finally {
        setIsSigningIn(false)
      }
    }
  }

  const onGoogleSignIn = async (e) => {
    setGoogleError('')
    e.preventDefault()
    if (!isSigningIn) {
      setIsSigningIn(true)
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`
          }
        })

        if (error) throw error
      } catch (err) {
        setGoogleError(err.message || 'Google login failed. Please try again.')
      }
    }
  }
  const onResetSubmit = async (e) => {
    e.preventDefault()
    if (rEmailValidation()) {
      setRError('')
      setRSuccess('')
      console.log('Reset function')
      try {
        setIsSending(true)

        const { data, error } = await supabase.auth.resetPasswordForEmail(
          rEmail,
          {
            redirectTo: window.location.origin + '/auth/update-password'
          }
        )

        if (error) {
          setRError(error.message)
          throw error
        }
        setRSuccess('Password reset email sent! Check your inbox.')
      } catch (rError) {
        console.error('Error sending password reset email:', rError)
        // Handle errors
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
      //  Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      })
      if (signUpError) {
        setRegisterError(signUpError.message)
      } else {
        setRegisterSuccess(
          'Registration successful! Redirecting to login...Please login with your new credentials.'
        )
      }

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        cpassword: ''
      })

      // Optional: redirect after 2 seconds
      setTimeout(() => handleLogin(), 2000)
    } catch (err) {
      console.error('registerError during registration:', err)
      setRegisterError(err.message)
    } finally {
      setIsRegistering(false)
    }
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5 // Set speed to 0.5x
    }
  }, [])

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
              className='relative flex h-screen flex-col items-center justify-center bg-transparent p-6'
            >
              {/* Background video */}

              <div className='z-10 flex flex-col items-center justify-center bg-transparent py-8 text-center font-medium tracking-[1rem] text-white uppercase'>
                <h1 className='m-2 text-[130px]'>
                  {'build'}{' '}
                  <span className='text-[145px] font-bold text-neutral-500 text-shadow-gray-800 text-shadow-lg'>
                    your
                  </span>
                </h1>
                <h1 className='m-2 text-[100px]'>
                  <span className='text-[125px] font-bold text-neutral-500 text-shadow-gray-800 text-shadow-lg'>
                    no code
                  </span>
                  {' AI agents'}
                </h1>
                
                <div>
                  <button
                    className='transparant h-[20vh] w-[80vh] border border-white text-[100px] font-bold text-white uppercase hover:cursor-pointer hover:text-neutral-500 hover:shadow-lg hover:shadow-neutral-500'
                    text={'BUILD NOW'}
                    onClick={() => {
                      setIsOpen(true)
                      setIsLogin(true)
                      setIsReset(false)
                    }}
                  >
                    buid now
                  </button>
                </div>
              </div>
            </div>

            {/* Main content container for all sections */}
            <main className='bg-opacity-80 relative z-10 text-white'>
              {/* 2. About Us Section */}
              {/* About Section */}
              <section id='about' className='bg-neutral-900 px-4 py-20'>
                <div className='container mx-auto max-w-5xl'>
                  <h2 className='mb-6 text-4xl font-bold tracking-wider text-neutral-100 uppercase'>
                    About Us
                  </h2>
                  <p className='text-lg leading-relaxed text-neutral-400'>
                    We are pioneers in the no-code AI revolution, empowering
                    businesses and individuals to harness the power of
                    artificial intelligence without technical barriers. Our
                    platform enables anyone to create intelligent AI agents that
                    can transform the way they work, communicate, and innovate.
                  </p>
                </div>
              </section>
              <div className='flex justify-center'></div>

              {/* 3. Services Provided Section */}
              <section id='services' className='bg-neutral-950 px-4 py-20'>
                <div className='container mx-auto max-w-6xl'>
                  <h2 className='mb-16 text-center text-5xl font-extrabold text-neutral-100'>
                    Our Services
                  </h2>
                  <div className='grid gap-10 sm:grid-cols-2 lg:grid-cols-3'>
                    {[
                      {
                        icon: (
                          <Bot
                            size={48}
                            className='mx-auto mb-4 text-neutral-400'
                          />
                        ),
                        title: 'Custom AI Agent Builder',
                        desc: 'An intuitive drag-and-drop interface to create bespoke AI agents tailored to your unique needs.'
                      },
                      {
                        icon: (
                          <MessageSquare
                            size={48}
                            className='mx-auto mb-4 text-neutral-400'
                          />
                        ),
                        title: 'Conversational AI',
                        desc: 'Engage your audience with intelligent, natural language chatbots that understand context and intent.'
                      },
                      {
                        icon: (
                          <Zap
                            size={48}
                            className='mx-auto mb-4 text-neutral-400'
                          />
                        ),
                        title: 'Automation Workflows',
                        desc: 'Automate complex processes by chaining AI agents together to perform sophisticated tasks.'
                      },
                      {
                        icon: (
                          <Users
                            size={48}
                            className='mx-auto mb-4 text-neutral-400'
                          />
                        ),
                        title: 'Collaboration Tools',
                        desc: 'Empower your team with AI-enhanced collaboration and productivity tools.'
                      },
                      {
                        icon: (
                          <TrendingUp
                            size={48}
                            className='mx-auto mb-4 text-neutral-400'
                          />
                        ),
                        title: 'Analytics & Insights',
                        desc: 'Gain deep insights into your data through AI-powered analytics and reporting.'
                      },
                      {
                        icon: (
                          <Activity
                            size={48}
                            className='mx-auto mb-4 text-neutral-400'
                          />
                        ),
                        title: 'Continuous Learning',
                        desc: 'Our AI agents improve over time, adapting to new data and evolving business needs.'
                      }
                    ].map((service, index) => (
                      <Card
                        key={index}
                        className='border border-neutral-800 bg-neutral-900 shadow-lg'
                      >
                        {service.icon}
                        <h3 className='mb-2 text-2xl font-semibold text-neutral-200'>
                          {service.title}
                        </h3>
                        <p className='text-neutral-400'>{service.desc}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
              {/* 4. Testimonials Section */}
              <section id='testimonials' className='bg-neutral-900 px-4 py-20'>
                <div className='container mx-auto max-w-6xl'>
                  <h2 className='mb-16 text-center text-5xl font-extrabold text-neutral-100'>
                    Testimonials
                  </h2>
                  <div className='grid gap-10 sm:grid-cols-2'>
                    {[
                      {
                        quote:
                          'This platform changed the game for our startup. We built an AI customer support agent in hours.',
                        author: 'Jane Doe, CEO of Tech Innovators'
                      },
                      {
                        quote:
                          'The no-code interface is incredibly intuitive. Our productivity has skyrocketed since adopting it.',
                        author: 'John Smith, Operations Manager'
                      }
                    ].map((testimonial, index) => (
                      <Card
                        key={index}
                        className='relative border border-neutral-800 bg-neutral-900'
                      >
                        <blockquote className='text-lg text-neutral-300 italic'>
                          "{testimonial.quote}"
                        </blockquote>
                        <cite className='mt-4 block text-right font-semibold text-neutral-400 not-italic'>
                          - {testimonial.author}
                        </cite>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>

              {/* 5. Pricing Section */}
              <section id='pricing' className='bg-neutral-950 px-4 py-20'>
                <div className='container mx-auto max-w-6xl'>
                  <h2 className='mb-16 text-center text-5xl font-extrabold text-neutral-100'>
                    Pricing
                  </h2>
                  <div className='grid gap-10 sm:grid-cols-2 lg:grid-cols-3'>
                    {[
                      {
                        name: 'Starter',
                        price: 'Free',
                        features: [
                          '✔ 1 AI Agent',
                          '✔ 1,000 Operations/mo',
                          '✔ Basic Templates',
                          '✔ Community Support'
                        ]
                      },
                      {
                        name: 'Pro',
                        price: '$99',
                        features: [
                          '✔ 10 AI Agents',
                          '✔ 100,000 Operations/mo',
                          '✔ Advanced API Integrations',
                          '✔ Priority Support'
                        ]
                      },
                      {
                        name: 'Enterprise',
                        price: 'Custom',
                        features: [
                          '✔ Unlimited AI Agents',
                          '✔ Unlimited Operations',
                          '✔ Dedicated Account Manager',
                          '✔ 24/7 Support'
                        ]
                      }
                    ].map((plan, index) => (
                      <Card
                        key={index}
                        className='relative flex flex-col border border-neutral-800 bg-neutral-900'
                      >
                        <div className='flex flex-grow flex-col p-8'>
                          <h3 className='mb-2 text-2xl font-semibold text-neutral-100'>
                            {plan.name}
                          </h3>
                          <p className='mb-4 text-5xl font-bold text-neutral-200'>
                            {plan.price}
                            {plan.price !== 'Custom' && (
                              <span className='text-lg font-normal text-neutral-500'>
                                /mo
                              </span>
                            )}
                          </p>
                          <ul className='mb-8 flex-grow space-y-2 text-left text-neutral-400'>
                            {plan.features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                          <Button className='bg-neutral-800 text-neutral-100 hover:bg-neutral-700'>
                            Choose Plan
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            </main>
            {/* Footer Section */}
            <footer
              id='contact'
              className='relative z-10 bg-neutral-900 px-4 py-10 text-center text-neutral-400'
            >
              <div className='container mx-auto'>
                <h2 className='mb-4 text-3xl font-bold text-neutral-100'>
                  Get In Touch
                </h2>
                <p className='mb-6 text-neutral-400'>
                  Have questions? We'd love to hear from you.
                </p>
                <p className='mb-8 text-lg text-neutral-300'>
                  contact@aiagentsinc.com
                </p>
                <div className='mb-8 flex justify-center space-x-6'>
                  <a
                    href='#'
                    className='transition-colors hover:text-neutral-200'
                  >
                    <Twitter size={28} />
                  </a>
                  <a
                    href='#'
                    className='transition-colors hover:text-neutral-200'
                  >
                    <Linkedin size={28} />
                  </a>
                  <a
                    href='#'
                    className='transition-colors hover:text-neutral-200'
                  >
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

            {/* Login */}

            <div
              id='login'
              className='fixed z-50 mx-auto flex w-[40%] items-center justify-center'
            >
              <div className='rounded-lg border border-neutral-500     inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-800 bg-cover bg-center p-8 shadow-2xl'>
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
                          className='w-full'
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
                            className='w-full'
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
                          className='w-full'
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
                        <Button
                          disabled={isSigningIn}
                          onClick={(e) => {
                            onGoogleSignIn(e)
                          }}
                          className='flex h-[50px] w-full place-items-center justify-center'
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
                        </Button>
                      </div>
                      {googleError && (
                        <p className='mt-2 text-center text-sm text-red-500'>
                          {googleError}
                        </p>
                      )}
                    </div>
                  </form>
                )}

                {/* Reset Password */}

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
                          className='w-full'
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

                {/* {Register} */}

                {!isReset && !isLogin && isRegister && (
                  <>
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
                                className='w-full'
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
                              <User className='absolute h-5 w-5 translate-x-2 translate-y-4 text-gray-400' />
                              <FormInput
                                className='w-full'
                                type='text'
                                id='lastName'
                                name='lastName'
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder='Last Name'
                                required={true}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Email Field with Mail Icon */}
                        <div className='relative'>
                          <Mail className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                          <FormInput
                            className='w-full'
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
                            className='w-full'
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
                            className='w-full'
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
                            className='w-full'
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
