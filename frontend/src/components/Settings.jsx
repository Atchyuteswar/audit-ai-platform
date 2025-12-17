import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Save, Key, Cpu, Building2, Bell, AlertOctagon, 
  Trash2, CheckCircle, AlertCircle 
} from 'lucide-react'

export default function Settings({ session }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  
  // --- FORM STATE ---
  // Identity
  const [companyName, setCompanyName] = useState('')
  
  // API Keys
  const [openaiKey, setOpenaiKey] = useState('')
  const [groqKey, setGroqKey] = useState('')
  
  // Automation & Defaults
  const [webhook, setWebhook] = useState('')
  const [model, setModel] = useState('groq/llama-3.1-8b-instant')
  const [customPrompt, setCustomPrompt] = useState('')

  // --- LOAD SETTINGS ---
  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setCompanyName(data.company_name || '')
        setOpenaiKey(data.openai_api_key || '')
        setGroqKey(data.groq_api_key || '')
        setWebhook(data.webhook_url || '')
        setModel(data.preferred_model || 'groq/llama-3.1-8b-instant')
        setCustomPrompt(data.custom_system_prompt || '')
      }
    }
    fetchProfile()
  }, [session])

  // --- SAVE SETTINGS ---
  const handleSave = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const updates = {
        id: session.user.id,
        company_name: companyName,
        openai_api_key: openaiKey,
        groq_api_key: groqKey,
        webhook_url: webhook,
        preferred_model: model,
        custom_system_prompt: customPrompt,
        updated_at: new Date()
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      
      setMessage({ type: 'success', text: 'Configuration updated successfully' })
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  // --- DANGER: PURGE LOGS ---
  const handlePurgeLogs = async () => {
    if (!confirm("⚠️ ARE YOU SURE? This will delete ALL your audit history permanently.")) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .eq('user_id', session.user.id)
      
      if (error) throw error
      setMessage({ type: 'success', text: 'All audit logs have been purged.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      <div className="border-b border-white/5 pb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Platform Configuration</h2>
        <p className="text-zinc-500 text-sm">Manage API credentials, white-labeling, and security policies.</p>
      </div>

      <div className="grid gap-8">
        
        {/* SECTION 1: IDENTITY & REPORTING */}
        <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-8">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-6">
            <Building2 className="w-4 h-4 text-blue-500" /> Organization Profile
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Company Name</label>
              <input 
                placeholder="Acme Corp AI Lab" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
              <p className="text-[10px] text-zinc-600">Appears on generated PDF compliance reports.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Alert Webhook</label>
              <div className="relative">
                <Bell className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                <input 
                  placeholder="https://hooks.slack.com/..." 
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all font-mono"
                />
              </div>
              <p className="text-[10px] text-zinc-600">Slack/Discord URL for real-time risk alerts.</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: API KEYS */}
        <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-8">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-6">
            <Key className="w-4 h-4 text-yellow-500" /> API Credentials
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Groq API Key (Recommended)</label>
              <input 
                type="password"
                placeholder="gsk_..." 
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">OpenAI API Key</label>
              <input 
                type="password"
                placeholder="sk-..." 
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: AUDIT DEFAULTS */}
        <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-8">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-6">
            <Cpu className="w-4 h-4 text-purple-500" /> Audit Logic Defaults
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Preferred Model</label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)} 
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 appearance-none"
              >
                <option value="groq/llama-3.1-8b-instant">Groq Llama 3.1 (Free)</option>
                <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                <option value="gemini/gemini-pro">Google Gemini Pro</option>
                <option value="claude-3-sonnet">Anthropic Claude 3</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Custom Judge System Prompt</label>
              <textarea 
                rows={3}
                placeholder="Override the default auditor persona. E.g., 'You are a strict EU AI Act compliance officer...'" 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all placeholder:text-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: DANGER ZONE */}
        <div className="bg-red-950/10 border border-red-500/20 rounded-3xl p-8">
          <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <AlertOctagon className="w-4 h-4" /> Danger Zone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">Purge Audit History</p>
              <p className="text-zinc-500 text-xs">Permanently delete all logs and reports. This cannot be undone.</p>
            </div>
            <button 
              onClick={handlePurgeLogs}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-lg border border-red-500/20 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" /> Purge Data
            </button>
          </div>
        </div>

        {/* SAVE BUTTON (FLOATING) */}
        <div className="fixed bottom-6 right-8">
           <AnimateMessage message={message} />
           <button 
             onClick={handleSave}
             disabled={loading}
             className="px-8 py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-3 disabled:opacity-50 hover:scale-105 active:scale-95"
           >
             {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"/> : <Save className="w-5 h-5" />}
             Save Changes
           </button>
        </div>

      </div>
    </div>
  )
}

// Helper for the toast notification
function AnimateMessage({ message }) {
  if (!message) return null
  return (
    <div className={`absolute bottom-20 right-0 mb-4 px-6 py-3 rounded-xl border flex items-center gap-3 shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300 ${
      message.type === 'success' ? 'bg-zinc-900 border-green-500/30 text-green-400' : 'bg-zinc-900 border-red-500/30 text-red-400'
    }`}>
      {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-medium text-sm">{message.text}</span>
    </div>
  )
}