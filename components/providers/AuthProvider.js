'use client'
import { useRouter } from 'next/navigation'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react'
import { dbClient } from '../../lib/supabase/dbClient'
import { createSupabaseClient } from '../../lib/supabase/supabaseClient'

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

  // ✅ FIXED: Add all dependencies to useCallback
  const fetchProfile = useCallback(
    async (userId) => {
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
    },
    [supabase, user?.email, user?.user_metadata?.full_name]
  )

  // ✅ FIX: Separate auth initialization from profile fetching to avoid re-setting loading=true during profile fetch
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        const {
          data: { session }
        } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }
    initializeAuth()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setProfile(null)
        router.push('/')
      }
      // ✅ FIX: Always mark loading as complete after auth state changes
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [router, supabase.auth]) // Removed fetchProfile from deps

  // ✅ FIX: Separate useEffect to fetch profile when user changes (runs in background, doesn't affect auth loading)
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id)
    } else {
      setProfile(null)
    }
  }, [user, fetchProfile])

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