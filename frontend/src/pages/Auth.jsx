import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase' // <--- UPDATED
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // 1. Safety Check: If supabase client failed to load, stop here.
    if (!supabase) {
      console.error("CRITICAL: Supabase client not found.")
      return
    }

    // 2. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/app')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate('/app')
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + '/app' }
      })

      if (error) throw error
      setMessage('Check your email for the login link!')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 relative overflow-hidden text-slate-300 font-sans">

      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -z-10" />

      <nav className="absolute top-6 left-6">
        <Link to="/" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
          ← Back to Home
        </Link>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative"
      >
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 shadow-inner">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-2">Welcome Back</h1>
        <p className="text-slate-400 text-center text-sm mb-10">Enter your enterprise email to access the suite.</p>

        {message ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-xl text-center">
            <p className="font-medium mb-2">Magic Link Sent! ✨</p>
            <p className="text-sm opacity-80">Check your inbox to sign in.</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Work Email</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                /* CSS Spinner instead of Icon to prevent crashes */
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Send Magic Link <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        )}

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-600">Protected by AuditAI Security Systems • v2.0</p>
        </div>
      </motion.div>
    </div>
  )
}