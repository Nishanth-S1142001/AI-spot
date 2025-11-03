import { createSupabaseClient } from '../../lib/supabase/supabaseClient'
 
export const useLogout = () => {
 
  const supabase = createSupabaseClient()

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // Optional: Force reload auth context quickly
      window.location.href = '/'
    } catch (err) {
      console.error('Logout error:', err.message)
    }
  }

  return { logout }
}
