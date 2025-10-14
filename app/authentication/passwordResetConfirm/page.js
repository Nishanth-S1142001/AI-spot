'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { auth } from '../../../lib/firebase/firebaseConfig'
import { doPasswordReset } from '../../../lib/firebase/firebaseUtils'

export default function ResetPasswordConfirmPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const oobCode = searchParams.get('oobCode')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const handleReset = async (e) => {
    e.preventDefault()
    try {
      await doPasswordReset(auth, oobCode, password)
      setSuccess('✅ Password has been reset!')
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      setError(err.message)
    }
  }
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md rounded-2xl bg-white p-6 shadow-lg'>
        <h2 className='mb-4 text-center text-2xl font-bold'>
          Set New Password
        </h2>
        <form onSubmit={handleReset} className='space-y-4'>
          <input
            type='password'
            placeholder='Enter new password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='w-full rounded-xl border p-3 focus:ring-2 focus:ring-blue-500'
          />
          {error && <p className='text-sm text-red-500'>{error}</p>}
          {success && <p className='text-sm text-green-600'>{success}</p>}
          <button
            type='submit'
            className='w-full rounded-xl bg-blue-600 py-3 text-white transition hover:bg-blue-700'
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  )
}
