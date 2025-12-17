import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import { 
  Shield, Activity, Lock, Server, AlertTriangle, CheckCircle, 
  Search, LogOut, LayoutDashboard, Clock, Play, Zap, FileText, 
  Settings as SettingsIcon, Swords, XCircle, Trophy, Globe, AlertOctagon 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import History from '../components/History'
import TrapBuilder from '../components/TrapBuilder'
import Settings from '../components/Settings'

export default function Dashboard() {
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  
  // --- STATE FOR AUDIT FORM ---
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState('groq/llama-3.1-8b-instant')
  
  // Battle Mode State
  const [battleMode, setBattleMode] = useState(false) 
  const [provider2, setProvider2] = useState('gpt-3.5-turbo') 

  const [trap, setTrap] = useState('finance')
  const [redTeamMode, setRedTeamMode] = useState(false)
  
  // Custom Endpoint State
  const [isCustom, setIsCustom] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [customModel, setCustomModel] = useState('')
  
  const [customTraps, setCustomTraps] = useState([]) 
  const [webhook, setWebhook] = useState('')

  // --- STATE FOR RESULTS ---
  const [result, setResult] = useState(null)          
  const [battleResult, setBattleResult] = useState(null)
  const [stats, setStats] = useState({ score: 100, scans: 0, risks: 0 })

  // 1. AUTH & PREFS
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchStats(session.user.id)
        loadPrefs(session.user.id)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadPrefs = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      if (data.openai_api_key) setApiKey(data.openai_api_key)
      if (data.groq_api_key && data.preferred_model?.includes('groq')) setApiKey(data.groq_api_key)
      if (data.preferred_model) setProvider(data.preferred_model)
      if (data.webhook_url) setWebhook(data.webhook_url)
    }
  }

  const fetchStats = async (userId) => {
    const { count } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    setStats(prev => ({ ...prev, scans: count || 0 }))
  }

  // 2. AUDIT HANDLER
  const handleAudit = async () => {
    setLoading(true)
    setResult(null)
    setBattleResult(null)

    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
    const basePayload = {
      trap_id: trap,
      api_key: apiKey,
      custom_api_base: isCustom ? customUrl : null,
      custom_model_name: isCustom ? customModel : null,
      dynamic_traps: customTraps,
      enable_red_team: redTeamMode,
      webhook_url: webhook
    }

    try {
      if (battleMode) {
        // --- BATTLE MODE EXECUTION ---
        const [res1, res2] = await Promise.all([
          axios.post(`${API_URL}/api/v1/audit`, { ...basePayload, provider: provider }),
          axios.post(`${API_URL}/api/v1/audit`, { ...basePayload, provider: provider2 })
        ])

        const data1 = res1.data
        const data2 = res2.data

        setBattleResult({ 
          modelA: { name: provider, data: data1 },
          modelB: { name: provider2, data: data2 }
        })
        
        if (session) {
          await Promise.all([
             supabase.from('audit_logs').insert({ user_id: session.user.id, provider: provider, trap_id: trap, score: data1.score, analysis: "Battle Mode (A)", pdf_url: data1.pdf_url }),
             supabase.from('audit_logs').insert({ user_id: session.user.id, provider: provider2, trap_id: trap, score: data2.score, analysis: "Battle Mode (B)", pdf_url: data2.pdf_url })
          ])
        }
        setStats(prev => ({ ...prev, scans: prev.scans + 2 }))

      } else {
        // --- STANDARD MODE EXECUTION ---
        const response = await axios.post(`${API_URL}/api/v1/audit`, { ...basePayload, provider: provider })
        const auditResult = response.data
        setResult(auditResult)
        
        if (session) {
          await supabase.from('audit_logs').insert({
            user_id: session.user.id, provider: isCustom ? 'Custom' : provider, trap_id: trap,
            score: auditResult.score, analysis: auditResult.analysis, pdf_url: auditResult.pdf_url
          })
        }
        setStats(prev => ({ ...prev, scans: prev.scans + 1, score: auditResult.score, risks: auditResult.score < 80 ? prev.risks + 1 : prev.risks }))
      }
    } catch (error) {
      console.error(error)
      alert("Audit Failed. Ensure Backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!session) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div></div>

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-400 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
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
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Audit Console' },
            { id: 'history', icon: Clock, label: 'Audit Logs' },
            { id: 'traps', icon: Lock, label: 'Policy Builder' },
            { id: 'settings', icon: SettingsIcon, label: 'Settings' }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-800/50'}`}>
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-blue-400' : 'text-zinc-600'}`} /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider group w-full"><LogOut className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Sign Out</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-y-auto bg-[#09090b] p-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto min-h-screen">
        
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 pb-20">
              
              {/* HEADER & STATS */}
              <div className="flex flex-col gap-8">
                  <div className="flex justify-between items-end border-b border-white/5 pb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">Security Control Center</h1>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        System Operational • v2.4.0-stable
                      </div>
                    </div>
                  </div>

                  {/* KPI CARDS */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/5 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Compliance Score</div>
                          <div className="text-4xl font-mono font-bold text-white tracking-tight">{stats.score}<span className="text-lg text-zinc-600">%</span></div>
                        </div>
                        <div className={`p-2 rounded-lg ${stats.score >= 80 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          <Activity className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${stats.score}%` }} transition={{ duration: 1 }} className={`h-full ${stats.score >= 80 ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Audits</div>
                          <div className="text-4xl font-mono font-bold text-white tracking-tight">{stats.scans}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                          <Server className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">Lifetime system scans</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-white/5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Active Threats</div>
                          <div className="text-4xl font-mono font-bold text-white tracking-tight">{stats.risks}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                          <AlertOctagon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">Requiring immediate mitigation</div>
                    </div>
                  </div>
              </div>

              {/* MAIN DASHBOARD GRID */}
              <div className="grid lg:grid-cols-12 gap-8">
                
                {/* --- LEFT: CONFIGURATION --- */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="rounded-3xl bg-[#0c0c0e] border border-white/5 overflow-hidden sticky top-6">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-zinc-500" /> Audit Configuration
                      </h2>
                    </div>

                    <div className="p-6 space-y-5">
                      
                      {/* TOGGLE: PUBLIC vs CUSTOM */}
                      <div className="flex bg-black rounded-lg p-1 border border-zinc-800">
                        <button 
                          onClick={() => setIsCustom(false)} 
                          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${!isCustom ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          Public Cloud
                        </button>
                        <button 
                          onClick={() => setIsCustom(true)} 
                          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${isCustom ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          Custom Endpoint
                        </button>
                      </div>

                      {/* PRIMARY MODEL SELECTION */}
                      {!isCustom ? (
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                {battleMode ? 'Target Model (A)' : 'Target Model'}
                             </label>
                             <div className="relative">
                                <Globe className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                                <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-blue-500 appearance-none">
                                  <option value="groq/llama-3.1-8b-instant">Groq Llama 3.1 (Free)</option>
                                  <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                                  <option value="gemini/gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                                  <option value="claude-3-sonnet">Anthropic Claude 3</option>
                                </select>
                             </div>
                          </div>
                        ) : (
                          <div className="space-y-4 p-4 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Endpoint URL</label>
                                <input placeholder="e.g. http://localhost:11434" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Model Name</label>
                                <input placeholder="e.g. llama3" value={customModel} onChange={(e) => setCustomModel(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm" />
                             </div>
                          </div>
                        )}

                      {/* BATTLE MODE CHECKBOX */}
                      <div className="flex items-center gap-3 py-1">
                        <button 
                          onClick={() => setBattleMode(!battleMode)}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${battleMode ? 'bg-purple-600 border-purple-500 text-white' : 'bg-transparent border-zinc-700'}`}
                        >
                          {battleMode && <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                        <span className={`text-xs font-medium cursor-pointer select-none ${battleMode ? 'text-purple-400' : 'text-zinc-500'}`} onClick={() => setBattleMode(!battleMode)}>
                           Compare with another model (Battle Mode)
                        </span>
                      </div>

                      {/* CHALLENGER MODEL (Appears only if checked) */}
                      <AnimatePresence>
                        {battleMode && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden pl-4 border-l-2 border-purple-500/30">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Challenger Model</label>
                            <select value={provider2} onChange={(e) => setProvider2(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 appearance-none shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                              <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                              <option value="groq/llama-3.1-8b-instant">Groq Llama 3.1</option>
                              <option value="gemini/gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                            </select>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* API KEY */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">API Key</label>
                        <input type="password" placeholder="sk-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 font-mono" />
                      </div>

                      {/* TEST SUITE */}
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Test Suite</label>
                          <select value={trap} onChange={(e) => setTrap(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-2 py-3 text-white text-sm outline-none">
                             <option value="finance">Finance (AML & Fraud)</option>
                             <option value="hr">HR (Bias & Ethics)</option>
                             <option value="cyber">Cybersecurity (Injection)</option>
                             <option value="custom">Custom Policy</option>
                          </select>
                      </div>

                      {/* RED TEAM TOGGLE */}
                      <div className="pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between mb-4">
                           <div>
                              <div className="text-sm text-white font-medium flex items-center gap-2">Red Team Mode</div>
                              <div className="text-xs text-zinc-500">Inject adversarial prompts</div>
                           </div>
                           <button onClick={() => setRedTeamMode(!redTeamMode)} className={`w-12 h-6 rounded-full p-1 transition-colors ${redTeamMode ? 'bg-red-600' : 'bg-zinc-800'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${redTeamMode ? 'translate-x-6' : ''}`} />
                           </button>
                        </div>

                        {/* START BUTTON */}
                        <button onClick={handleAudit} disabled={loading} className={`w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${battleMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}>
                           {loading ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"/> : (battleMode ? <><Swords className="w-4 h-4" /> Start Comparison</> : <><Play className="w-4 h-4" /> Run Scan</>)}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- RIGHT: RESULTS AREA --- */}
                <div className="lg:col-span-8">
                  <div className="h-full min-h-[600px] bg-[#0c0c0e] border border-white/5 rounded-3xl overflow-hidden flex flex-col relative">
                    
                    {/* IDLE STATE */}
                    {!loading && !result && !battleResult && (
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
                         <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 shadow-xl rotate-3">
                            {battleMode ? <Swords className="w-8 h-8 opacity-40" /> : <Search className="w-8 h-8 opacity-40" />}
                         </div>
                         <h3 className="text-xl font-bold text-white mb-2">{battleMode ? 'Ready to Compare' : 'Awaiting Commands'}</h3>
                         <p className="text-sm max-w-sm">
                           {battleMode ? 'Select two models to compare their safety responses side-by-side.' : 'Select a model and test suite to begin the audit.'}
                         </p>
                      </div>
                    )}

                    {/* LOADING STATE */}
                    <AnimatePresence>
                      {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0c0c0e]/95 backdrop-blur-sm">
                           <div className="relative w-24 h-24 mb-6">
                              <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                              <div className={`absolute inset-0 border-t-4 rounded-full animate-spin ${battleMode ? 'border-purple-500' : 'border-blue-500'}`}></div>
                           </div>
                           <p className={`${battleMode ? 'text-purple-400' : 'text-blue-400'} font-mono tracking-[0.2em] text-xs animate-pulse`}>
                             {battleMode ? 'RUNNING DUAL SIMULATION...' : 'EXECUTING ATTACK VECTORS...'}
                           </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* --- BATTLE RESULTS --- */}
                    {!loading && battleResult && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex border-b border-white/5 bg-zinc-900/30">
                           {/* MODEL A */}
                           <div className={`flex-1 p-6 border-r border-white/5 flex flex-col items-center justify-center relative overflow-hidden ${battleResult.modelA.data.score > battleResult.modelB.data.score ? 'bg-green-500/5' : ''}`}>
                              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Target Model</div>
                              <div className="text-lg font-bold text-white truncate max-w-[150px]">{battleResult.modelA.name.split('/')[1] || battleResult.modelA.name}</div>
                              <div className={`mt-2 text-3xl font-mono font-bold ${battleResult.modelA.data.score >= 80 ? 'text-green-500' : 'text-red-500'}`}>
                                 {battleResult.modelA.data.score}%
                              </div>
                              {battleResult.modelA.data.score > battleResult.modelB.data.score && <Trophy className="absolute top-4 right-4 w-6 h-6 text-yellow-500" />}
                           </div>

                           <div className="w-12 flex items-center justify-center bg-[#0c0c0e] border-x border-white/5 z-10">
                              <span className="text-zinc-600 font-black italic text-xl">VS</span>
                           </div>

                           {/* MODEL B */}
                           <div className={`flex-1 p-6 border-l border-white/5 flex flex-col items-center justify-center relative overflow-hidden ${battleResult.modelB.data.score > battleResult.modelA.data.score ? 'bg-green-500/5' : ''}`}>
                              <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Challenger</div>
                              <div className="text-lg font-bold text-white truncate max-w-[150px]">{battleResult.modelB.name.split('/')[1] || battleResult.modelB.name}</div>
                              <div className={`mt-2 text-3xl font-mono font-bold ${battleResult.modelB.data.score >= 80 ? 'text-green-500' : 'text-red-500'}`}>
                                 {battleResult.modelB.data.score}%
                              </div>
                              {battleResult.modelB.data.score > battleResult.modelA.data.score && <Trophy className="absolute top-4 right-4 w-6 h-6 text-yellow-500" />}
                           </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                           <div className="grid grid-cols-2 divide-x divide-white/5">
                              <div className="divide-y divide-white/5">
                                 {battleResult.modelA.data.results.map((item, i) => <BattleLogItem key={i} item={item} />)}
                              </div>
                              <div className="divide-y divide-white/5">
                                 {battleResult.modelB.data.results.map((item, i) => <BattleLogItem key={i} item={item} />)}
                              </div>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* --- STANDARD RESULTS --- */}
                    {!loading && result && !battleMode && (
                       <div className="flex flex-col h-full">
                          <div className={`p-8 border-b ${result.score >= 80 ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${result.score >= 80 ? 'bg-green-500 text-black border-green-400' : 'bg-red-500 text-white border-red-400'}`}>
                                      {result.score >= 80 ? <CheckCircle className="w-8 h-8"/> : <AlertTriangle className="w-8 h-8"/>}
                                   </div>
                                   <div>
                                      <h3 className="text-2xl font-bold text-white tracking-tight">{result.score >= 80 ? 'System Compliant' : 'Security Critical'}</h3>
                                      <p className="text-zinc-400 font-mono text-sm mt-1">{result.score}/100 Score • {result.analysis.split('.')[0]}</p>
                                   </div>
                                </div>
                                {result.pdf_url && (
                                  <button onClick={() => window.open(result.pdf_url, '_blank')} className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/5">
                                     <FileText className="w-4 h-4" /> Export PDF
                                  </button>
                                )}
                             </div>
                          </div>
                          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                             {result.results.map((item, i) => (
                               <div key={i} className="p-6 hover:bg-white/[0.02] transition-colors">
                                  <div className="flex justify-between items-start mb-3">
                                     <div className="flex items-center gap-3">
                                        <span className={`w-2 h-2 rounded-full ${item.status === 'PASS' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
                                        <span className="text-sm font-bold text-white">{item.category}</span>
                                     </div>
                                     <span className={`text-[10px] font-bold px-2 py-1 rounded border ${item.status === 'PASS' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{item.status}</span>
                                  </div>
                                  <div className="space-y-3 pl-5 border-l-2 border-zinc-800 ml-1">
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Prompt</p>
                                      <p className="text-sm text-zinc-300">{item.question}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Response</p>
                                      <div className="bg-black/50 p-3 rounded-lg border border-white/5 text-xs text-zinc-400 font-mono leading-relaxed">{item.ai_response}</div>
                                    </div>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    )}

                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'history' && <History session={session} />}
          {activeTab === 'traps' && <TrapBuilder session={session} onUpdate={setCustomTraps} />}
          {activeTab === 'settings' && <Settings session={session} />}

        </div>
      </main>
    </div>
  )
}

function BattleLogItem({ item }) {
  return (
    <div className={`p-4 border-b border-white/5 ${item.status === 'PASS' ? 'bg-green-500/[0.02]' : 'bg-red-500/[0.02]'}`}>
       <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-zinc-500 truncate max-w-[120px]" title={item.category}>{item.category}</span>
          {item.status === 'PASS' ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
       </div>
       <div className="text-[10px] text-zinc-400 font-mono line-clamp-3 bg-black/30 p-2 rounded">{item.ai_response}</div>
    </div>
  )
}