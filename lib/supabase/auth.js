import { supabase } from './dbClient'
import { useRouter } from 'next/navigation'

export const useLogout = () => {
  const router = useRouter()

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/') // Redirect to homepage
    } catch (err) {
      console.error('Logout error:', err.message)
    }
  }

  return { logout }
}
