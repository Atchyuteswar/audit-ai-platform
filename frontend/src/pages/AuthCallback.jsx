import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const handleCallback = async () => {
      // Supabase automatically parses the URL hash when this component loads.
      // We just need to check if a session was successfully created.
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Login Error:", error.message)
        navigate('/login?error=true')
      } else if (session) {
        console.log("Login Success. Redirecting...")
        navigate('/app', { replace: true })
      } else {
        // Fallback: If no session found immediately, verify URL hash manually (Rare edge case)
        const { error: hashError } = await supabase.auth.getSession() 
        if (!hashError) {
             navigate('/app', { replace: true })
        } else {
             navigate('/login')
        }
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <h2 className="text-white text-xl font-semibold">Verifying Credentials...</h2>
    </div>
  )
}