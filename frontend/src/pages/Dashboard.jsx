import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase' // <--- UPDATED
import { useNavigate } from 'react-router-dom'
import Auth from './Auth' // This is now a sibling in 'pages'
import History from '../components/History' // <--- UPDATED
import TrapBuilder from '../components/TrapBuilder' // <--- UPDATED
import axios from 'axios'
import { Shield, Activity, Lock, Server, AlertTriangle, CheckCircle, Search, LogOut, LayoutDashboard, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

function Dashboard() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('dashboard') // 'dashboard' or 'history'

  // --- 1. AUTHENTICATION LOGIC ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // --- 2. DASHBOARD STATE ---
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [redTeamMode, setRedTeamMode] = useState(false)
  const [webhook, setWebhook] = useState('')

  // Form Inputs
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState('gemini/gemini-2.5-flash')
  const [isCustom, setIsCustom] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [customModel, setCustomModel] = useState('')
  const [trap, setTrap] = useState('finance') // Default to Finance domain

  // NEW: State for Custom Traps
  const [customTraps, setCustomTraps] = useState([])

  // --- 3. AUDIT HANDLER ---
  const handleAudit = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/audit', {
        trap_id: trap,
        provider: provider,
        api_key: apiKey,
        custom_api_base: isCustom ? customUrl : null,
        custom_model_name: isCustom ? customModel : null,
        dynamic_traps: customTraps,
        // NEW FIELDS
        enable_red_team: redTeamMode,
        webhook_url: webhook
      })

      const auditResult = response.data

      // B. Save to Supabase (History)
      if (session) {
        const { error } = await supabase.from('audit_logs').insert({
          user_id: session.user.id,
          provider: isCustom ? 'Custom' : provider,
          trap_id: trap,
          score: auditResult.score,
          analysis: auditResult.analysis,
          pdf_url: auditResult.pdf_url
        })
        if (error) console.error("Failed to save log:", error)
      }

      // C. Show Result with Animation Delay
      setTimeout(() => {
        setResult(auditResult)
        setLoading(false)
      }, 1500)

    } catch (error) {
      console.error(error)
      alert("Backend Error! Is your Uvicorn server running on port 8000?")
      setLoading(false)
    }
  }

  // --- 4. CONDITIONAL RENDERING ---
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If logged in, show App
  return (
    <div className="min-h-screen bg-slate-950 p-8 font-sans text-slate-300">

      {/* HEADER */}
      <header className="flex items-center justify-between mb-12 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/50">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AuditAI <span className="text-blue-500">Enterprise</span></h1>
            <p className="text-xs text-slate-500 font-mono uppercase">User: {session.user.email}</p>
          </div>
        </div>

        {/* Navigation & Logout */}
        <div className="flex gap-4">
          <button
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 text-sm font-medium border rounded-md transition-all flex items-center gap-2 ${view === 'dashboard' ? 'bg-blue-900/20 text-blue-400 border-blue-900' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Audit
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 text-sm font-medium border rounded-md transition-all flex items-center gap-2 ${view === 'history' ? 'bg-blue-900/20 text-blue-400 border-blue-900' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Clock className="w-4 h-4" /> History
          </button>

          <div className="w-px h-8 bg-slate-800 mx-2"></div>

          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 text-sm font-medium bg-slate-900 border border-slate-800 rounded-md hover:bg-red-900/20 hover:text-red-400 hover:border-red-900 transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto">

        {/* VIEW 1: HISTORY TABLE */}
        {view === 'history' && <History session={session} />}

        {/* VIEW 2: AUDIT DASHBOARD */}
        {view === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN: CONTROLS */}
            <div className="lg:col-span-4 space-y-6">

              {/* CONFIG CARD */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Server className="w-4 h-4" /> Configuration
                </h2>

                <div className="space-y-4">
                  {/* Custom Toggle */}
                  <div className="flex items-center justify-between bg-slate-950 p-1 rounded-lg border border-slate-800 mb-4">
                    <button
                      onClick={() => setIsCustom(false)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${!isCustom ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Standard Cloud
                    </button>
                    <button
                      onClick={() => setIsCustom(true)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${isCustom ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Custom / Local
                    </button>
                  </div>

                  {/* Provider Inputs */}
                  {!isCustom ? (
                    <div>
                      <label className="block text-xs font-medium mb-1.5">Target Provider</label>
                      <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="gemini/gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                        <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                        <option value="claude-3-sonnet">Anthropic Claude 3</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-3 p-3 bg-purple-900/10 border border-purple-500/20 rounded-lg">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-purple-300">Base URL</label>
                        <input
                          placeholder="https://api.internal-server.com/v1"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-purple-300">Model Name</label>
                        <input
                          placeholder="my-fin-model-v1"
                          value={customModel}
                          onChange={(e) => setCustomModel(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* API Key */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5">API Key</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Trap Selection */}
                  <div className="pt-4 border-t border-slate-800">
                    <label className="block text-xs font-medium mb-1.5 text-blue-400">Select Audit Domain</label>
                    <select
                      value={trap}
                      onChange={(e) => setTrap(e.target.value)}
                      className="w-full bg-slate-900 border border-blue-900/30 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="finance">Finance & Banking (AML, ECOA)</option>
                      <option value="hr">HR & Recruiting (Bias, PII)</option>
                      <option value="cyber">Cybersecurity (Injection, Malware)</option>
                      <option value="support">Customer Support (Brand Safety)</option>
                      <option value="custom">Custom Policy Only</option>
                    </select>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleAudit}
                    disabled={loading}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Running Audit...' : (
                      <>
                        <Activity className="w-4 h-4" /> Run Compliance Check
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* NEW: TRAP BUILDER COMPONENT */}
              <TrapBuilder session={session} onUpdate={setCustomTraps} />

              {/* RED TEAM TOGGLE */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-red-900/30">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-red-400 flex items-center gap-2">
                    ⚔️ Red Team Mode
                  </span>
                  <span className="text-xs text-slate-500">Auto-generate adversarial attacks</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={redTeamMode}
                    onChange={(e) => setRedTeamMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* WEBHOOK INPUT */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-slate-400">Alert Webhook (Slack/Discord)</label>
                <input
                  placeholder="https://hooks.slack.com/..."
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

            </div>

            {/* RIGHT COLUMN: RESULTS RADAR */}
            <div className="lg:col-span-8">
              <div className="relative h-full min-h-[500px] bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-md flex flex-col items-center justify-center text-center p-8">

                {/* IDLE STATE */}
                {!loading && !result && (
                  <div className="text-slate-600">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>System Ready. Initiate audit to begin scanning.</p>
                  </div>
                )}

                {/* LOADING STATE */}
                {loading && (
                  <div className="absolute inset-0 bg-slate-950/80 z-10 flex flex-col items-center justify-center">
                    <div className="relative w-64 h-64 border border-blue-500/30 rounded-full flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent w-full h-full animate-scan"></div>
                      <div className="w-56 h-56 border border-blue-500/20 rounded-full"></div>
                      <div className="w-40 h-40 border border-blue-500/10 rounded-full"></div>
                    </div>
                    <p className="mt-6 text-blue-400 font-mono animate-pulse">ESTABLISHING CONNECTION...</p>
                  </div>
                )}

                {/* RESULTS STATE */}
                {!loading && result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full text-left space-y-4"
                  >
                    {/* Score Card */}
                    <div className={`p-6 rounded-xl border ${result.score >= 80 ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'} flex items-center justify-between`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${result.score >= 80 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {result.score >= 80 ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${result.score >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                            {result.score >= 80 ? 'SYSTEM COMPLIANT' : 'CRITICAL RISKS FOUND'}
                          </h3>
                          <p className="text-slate-400 text-sm">Overall Domain Score: {result.score}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 uppercase">Analysis</span>
                        <p className="font-medium text-slate-200">{result.analysis}</p>
                      </div>
                    </div>

                    {/* Detailed Breakdown List */}
                    <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs font-medium text-slate-400 uppercase">
                        Test Breakdown
                      </div>
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-800">
                        {result.results && result.results.map((item, index) => (
                          <div key={index} className="p-4 hover:bg-slate-900/50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-200">{item.category}</span>
                              <span className={`text-xs px-2 py-1 rounded font-bold ${item.status === 'PASS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {item.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-1">{item.question}</p>
                            <p className="text-xs text-slate-400 font-mono pl-2 border-l-2 border-slate-700 truncate">
                              "{item.ai_response}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Download Button */}
                    {result.pdf_url && (
                      <button
                        onClick={() => window.open(result.pdf_url, '_blank')}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Shield className="w-4 h-4" /> Download Official Domain Report
                      </button>
                    )}

                  </motion.div>
                )}

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard