'use client'
import { useAuth } from '../contexts/authContext'
import { doSignInWithEmailAndPassword } from '../../auth'
import { doSendEmailVerification } from '../../auth'
import { Navigate, Route , Routes, BrowserRouter } from 'react-router-dom'
import React, { useState, useRef } from 'react'
import { Mail, Lock, Eye, EyeOff, Upload, X } from 'lucide-react'
import NeonBackground from '../ui_components/primaryBackground/page'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // const fileInputRef = useRef(null);

  const { userLoggedIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const onSubmit = async (e) => {
    e.preventDefault()
    if (!isSigningIn) {
      setIsSigningIn(true)
      await doSignInWithEmailAndPassword(email, password)
      // doSendEmailVerification()
    }
  }

  return (
    <div>
      <NeonBackground />
      <div className='v-full flex h-full flex-row-reverse'>
        <BrowserRouter>
          <Routes>
            {userLoggedIn && (
              <Route
                path='/login'
                element={<Navigate to='/dashboard' replace />}
              />
            )}
          </Routes>
        </BrowserRouter>
        {/* Background Layer */}
        <div className='relative h-screen w-[40%]'>
          <div className='absolute h-full w-full rounded-l-[250px] bg-[url("/agent_mirror.jpg")] mask-l-from-90% bg-cover bg-center opacity-25'></div>
          <div className='transparent absolute flex h-full w-full flex-col items-center justify-center py-8 text-center text-[12px] font-medium tracking-[0.2rem] text-white uppercase'>
            <h1 className='mb-4 text-2xl font-bold'>Welcome Back</h1>
            <h1 className='text-[15px] font-bold'>
              Enter your personal details to use all of our features
            </h1>
            <h1 className='mt-16 text-[15px] font-bold'>
              Don't have an account? Create Account
            </h1>
            <div className='transparent mt-6 w-1/2 transform rounded-[5px] border-[1px] border-solid border-white p-2 text-center text-[20px] font-bold tracking-[0.5rem] text-white uppercase shadow-[0_0_10px_rgba(59,130,246)] transition-all duration-300 hover:scale-105 hover:cursor-pointer hover:bg-white hover:text-black hover:shadow-[0_0_50px_rgba(59,130,246)]'>
              <a href='/register'>SIGN UP</a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='z-10 flex w-[60%] items-center justify-center px-4'>
          <form className='w-[50%] rounded-2xl border-5 bg-transparent p-8 shadow-xl'     onSubmit={onSubmit}>
            {/* Decorative Header */}
            {/* Login Form */}
            <div className='space-y-6'>
              <div className='mb-10 block text-center text-3xl font-medium text-white'>
                Get exclusive access to our resources
              </div>
              {/* Username Input
           
              <div className="block text-sm font-medium text-white">Username</div> */}
              <div className='relative'>
                <div className='space-y-2'>
                  <Mail className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                  <input
                    type='text'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='border-b-primary w-full border-2 border-transparent px-4 py-3 pl-10 text-white placeholder-gray-400 transition-all duration-300 focus:border-b-blue-400 focus:ring-2 focus:ring-transparent focus:outline-none'
                    placeholder='Email'
                  />
                </div>
              </div>

              {/* Password Input
            
              <div className="block text-sm font-medium text-gray-700">Password</div> */}
              <div className='space-y-2'>
                <div className='relative'>
                  <Lock className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='border-b-primary w-full border-2 border-transparent px-4 py-3 pl-10 text-white placeholder-gray-400 transition-all duration-300 focus:border-b-blue-400 focus:ring-2 focus:ring-transparent focus:outline-none'
                    placeholder='Password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute top-1/2 right-4 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600'
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className='flex items-center justify-between'>
                <button
                  type='button'
                  className='text-sm text-blue-600 transition-colors hover:text-blue-500'
                >
                  Forgot password?
                </button>
              </div>
              {errorMessage && (
                <span className='font-bold text-red-600'>{errorMessage}</span>
              )}

              {/* Login Button */}
              <div className='flex justify-center'>
                <button
              
                  className='transparent border-primary mt-4 w-1/2 transform rounded-[5px] border-[1px] border-solid p-2 text-center text-[20px] font-bold tracking-[0.5rem] text-white uppercase shadow-[0_0_10px_rgba(59,130,246)] transition-all duration-300 hover:scale-105 hover:cursor-pointer hover:bg-white hover:text-black hover:shadow-[0_0_50px_rgba(59,130,246)]'
                >
               SIGN IN
                </button>
              </div>

              {/* Create Account */}
              <div className='text-center'>
                <button
                  type='button'
                  className='text-lg text-gray-600 transition-colors hover:text-blue-500'
                >
                  <a href='/register'>Don't have an account? Create Account</a>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
