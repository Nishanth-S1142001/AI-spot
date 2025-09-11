'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { dbClient } from '../../lib/supabase/dbClient' // client-safe helpers
import { createSupabaseClient } from '../../lib/supabase/supabaseClient'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        // Try getUser() first
        const { data: userData, error: userError } =
          await supabase.auth.getUser()

        if (userData?.user) {
          setUser(userData.user)
           fetchProfile(userData.user.id)
        } else {
          // fallback to getSession() if no user found
          const {
            data: { session }
          } = await supabase.auth.getSession()
          if (session?.user) {
            setUser(session.user)
            await fetchProfile(session.user.id)
          }
        }
      } catch (err) {
        console.error('Error getting initial session:', err)
      } finally {
        setLoading(false) // important: always flip loading
      }
    }
    getInitialSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      if(router.pathname === '/') router.push('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      let data = await dbClient.getProfile(userId)
      if (!data) {
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email,
            full_name: user?.user_metadata?.full_name || ''
          })
          .select()
          .single()

        if (error) throw error
        data = newProfile
      }
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signUp = async (email, password, fullName, lastName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, last_name: lastName }
      }
    })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    if (error) throw error
    return data
  }

  const updateProfile = async (updates) => {
    try {
      // Use dbClient for safe reads; for updates, still can use supabase directly in client
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    supabase
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
