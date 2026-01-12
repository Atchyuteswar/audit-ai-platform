import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom' // Added Link
import { 
  Shield, Calendar, Plus, Trash2, Clock, 
  CheckCircle, AlertCircle, LayoutDashboard, 
  LogOut, Lock, Settings as SettingsIcon, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Schedules() {
  const { session, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  // Form State
  const [provider, setProvider] = useState('groq/llama-3.1-8b-instant')
  const [frequency, setFrequency] = useState('daily')
  const [suite, setSuite] = useState('General Security')

  // Load Schedules
  useEffect(() => {
    if (session) fetchSchedules()
  }, [session])

  const fetchSchedules = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
      
      const res = await fetch(`${API_URL}/api/v1/schedules`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const data = await res.json()
      setSchedules(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

      const res = await fetch(`${API_URL}/api/v1/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          provider,
          test_suite: suite,
          frequency
        })
      })

      if (res.ok) {
        setIsCreating(false)
        fetchSchedules()
      } else {
        alert("Failed to create schedule")
      }
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if(!confirm("Stop this scheduled audit?")) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
      
      await fetch(`${API_URL}/api/v1/schedules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      
      setSchedules(schedules.filter(s => s.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (authLoading) return <div className="min-h-screen bg-[#09090b]" />

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-400 font-sans overflow-hidden">
      
      {/* SIDEBAR (Identical to Dashboard for consistency) */}
      <aside className="w-72 border-r border-white/5 bg-[#0c0c0e] flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <Shield className="w-5 h-5 text-black fill-black" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight block leading-none">AuditAI</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Enterprise</span>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <Link to="/app" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-800/50 transition-all">
            <LayoutDashboard className="w-4 h-4 text-zinc-600" /> Audit Console
          </Link>
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-zinc-800 text-white transition-all">
            <Calendar className="w-4 h-4 text-blue-400" /> Scheduled Jobs
          </div>
          <Link to="/app" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-800/50 transition-all">
            <Clock className="w-4 h-4 text-zinc-600" /> Audit Logs
          </Link>
        </nav>
        
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider group w-full">
            <LogOut className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-y-auto bg-[#09090b] p-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Scheduled Audits</h1>
              <p className="text-zinc-500 text-sm">Manage automated compliance checks and recurring red-team attacks.</p>
            </div>
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
            >
              <Plus className="w-4 h-4" /> New Schedule
            </button>
          </div>

          {/* GRID OF SCHEDULES */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Create New Card (Visual shortcut) */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsCreating(true)}
              className="border border-dashed border-zinc-800 bg-white/[0.02] rounded-2xl flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:bg-white/[0.05] transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <p className="mt-4 text-sm font-medium text-zinc-500">Add Automated Scan</p>
            </motion.div>

            {/* Existing Schedules */}
            {schedules.map((job) => (
              <div key={job.id} className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(job.id)} className="p-2 hover:bg-red-500/10 text-zinc-600 hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{job.provider}</div>
                    <div className="text-zinc-600 text-xs font-mono uppercase">{job.test_suite}</div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-white/5 pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Frequency</span>
                    <span className="text-white capitalize bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{job.frequency}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Next Run</span>
                    <span className="text-zinc-300 font-mono">
                      {new Date(job.next_run_at).toLocaleDateString()} <span className="opacity-50">{new Date(job.next_run_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Status</span>
                    <span className="flex items-center gap-1.5 text-green-500">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111113] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">New Scheduled Scan</h3>
                <button onClick={() => setIsCreating(false)}><span className="text-zinc-500 hover:text-white">✕</span></button>
              </div>
              
              <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Target Model</label>
                  <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500">
                    <option value="groq/llama-3.1-8b-instant">Groq Llama 3.1 (Free)</option>
                    <option value="gpt-4o">OpenAI GPT-4o</option>
                    <option value="gemini/gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Policy Suite</label>
                  <select value={suite} onChange={(e) => setSuite(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500">
                    <option>General Security</option>
                    <option>Finance (GLBA/AML)</option>
                    <option>Healthcare (HIPAA)</option>
                    <option>Prompt Injection Hardening</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Frequency</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setFrequency('daily')} className={`py-2 rounded-lg text-sm border ${frequency === 'daily' ? 'bg-blue-600 border-blue-500 text-white' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-900'}`}>Daily</button>
                    <button type="button" onClick={() => setFrequency('weekly')} className={`py-2 rounded-lg text-sm border ${frequency === 'weekly' ? 'bg-blue-600 border-blue-500 text-white' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-900'}`}>Weekly</button>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50">
                    {loading ? "Scheduling..." : "Create Schedule"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}