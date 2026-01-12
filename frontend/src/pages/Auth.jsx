import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, Mail, CheckCircle, Lock, Server } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function Auth() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  // Use a reliable unsplash ID for a dark tech/security theme
  const IMAGE_URL = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop"

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
        // This automatically picks "http://localhost:5173" when local 
        // and "https://audit.webnovx.com" when live.
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) throw error
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white grid lg:grid-cols-2 overflow-hidden">

      {/* ================= LEFT COLUMN: FORM ================= */}
      <div className="relative flex items-center justify-center p-8 sm:p-12 lg:p-16 overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-black">

        {/* Background Effects (from Landing Theme) */}
        <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-gradient-to-r from-gray-800/10 via-gray-700/12 to-gray-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold mb-6 uppercase tracking-wider">
                <Shield className="w-3 h-3" /> Enterprise Portal
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-white/60">
                Sign in to access your security controls.
              </p>
            </div>

            {message ? (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-500/20 rounded-full text-green-400 border border-green-500/30">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Magic Link Sent!</h3>
                <p className="text-white/60 text-sm mb-6">
                  We sent a secure login link to <br /> <span className="text-white font-medium">{email}</span>
                </p>
                <button
                  onClick={() => setMessage('')}
                  className="text-sm text-green-400 hover:text-green-300 font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  Use a different email <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              /* Login Options */
              <div className="space-y-6">

                {/* Google Button */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full group bg-white text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Continue with Google
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider"><span className="bg-[#09090b] px-4 text-white/40 font-medium">Or via Email</span></div>
                </div>

                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">Work Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-4 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                      <input
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-12 pr-4 py-4 focus:bg-white/10 focus:border-white/30 focus:outline-none transition-all placeholder:text-white/20 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      "Sending Link..."
                    ) : (
                      <>Send Magic Link <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-white/30 text-xs">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="w-3 h-3" /> Secure SOC2 Compliant Login
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= RIGHT COLUMN: IMAGE ================= */}
      <div className="hidden lg:block relative w-full h-full overflow-hidden bg-black">
        {/* The Image */}
        <img
          src={IMAGE_URL}
          alt="Enterprise Security Infrastructure"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />

        {/* Dark Overlays for Theme Consistency */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 p-16 z-20 max-w-xl">
          <div className="h-1 w-12 bg-white/30 rounded-full mb-6"></div>
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
            Secure your AI infrastructure.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed drop-shadow-md">
            Deploy confidently with automated compliance auditing and real-time threat detection for your LLM pipelines.
          </p>
          <div className="mt-8 flex items-center gap-4 text-white/60 text-sm font-medium">
            <div className="flex items-center gap-2"><Server className="w-4 h-4" /> 99.99% Uptime</div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> End-to-End Encrypted</div>
          </div>
        </div>
      </div>

    </div>
  )
}