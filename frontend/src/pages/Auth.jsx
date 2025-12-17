import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Lock, ArrowRight, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (session) navigate('/app', { replace: true })
  }, [session, navigate])

  const handleMagicLink = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: 'https://audit.webnovx.com/auth/callback' }
      })
      if (error) throw error
      setMessage('Check your email for the login link!')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'https://audit.webnovx.com/auth/callback' }
      })
      if (error) throw error
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 text-slate-300">
      <div className="w-full max-w-md bg-slate-900/60 border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-slate-900 rounded-2xl border border-white/5">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-8">Enterprise Login</h1>

        {message ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-xl text-center">
            <p className="font-medium">Magic Link Sent! ✨</p>
            <p className="text-sm opacity-80 mt-2">Check your inbox to sign in.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Sign in with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-700"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0f1522] px-2 text-slate-500">Or continue with email</span></div>
            </div>

            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                {loading ? "Sending..." : <>Send Magic Link <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}