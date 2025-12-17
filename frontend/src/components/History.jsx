import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  FileText, Clock, Shield, CheckCircle, AlertTriangle, 
  Trash2, Download, RefreshCcw, Activity 
} from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

export default function History({ session }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) fetchLogs()
  }, [session])

  // --- READ (FETCH) ---
  const fetchLogs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setLogs(data)
    } catch (err) {
      console.error("Error fetching logs:", err)
    } finally {
      setLoading(false)
    }
  }

  // --- DELETE (SINGLE) ---
  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return

    const { error } = await supabase
      .from('audit_logs')
      .delete()
      .eq('id', id)

    if (!error) {
      setLogs(logs.filter(log => log.id !== id))
    }
  }

  // --- EXPORT (CSV) ---
  const handleExport = () => {
    if (logs.length === 0) return
    
    // Safety check for null values
    const safeString = (val) => val ? String(val).replace(/"/g, '""') : ''

    const headers = ["ID", "Date", "Provider", "Trap Suite", "Score", "Status", "Analysis"]
    const csvContent = [
      headers.join(","),
      ...logs.map(log => [
        log.id,
        new Date(log.created_at || new Date()).toISOString(),
        safeString(log.provider),
        safeString(log.trap_id),
        log.score || 0,
        (log.score || 0) >= 80 ? "PASS" : "FAIL",
        `"${safeString(log.analysis)}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `audit_report_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // --- FORMATTING HELPERS ---
  const formatDate = (dateString) => {
    try {
      if (!dateString) return '---'
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    } catch (e) {
      return 'Invalid Date'
    }
  }

  // --- SAFE GRAPH DATA PREP ---
  // This prevents crashes if date is missing or score is null
  const chartData = logs
    .filter(log => log.created_at && !isNaN(new Date(log.created_at).getTime())) // Remove invalid dates
    .map(log => ({
      date: new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: log.score ?? 0 // Default to 0 if null
    }))
    .reverse()

  // --- RENDER STATES ---
  if (loading && logs.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
      <div className="w-8 h-8 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-xs font-mono uppercase tracking-widest">Syncing Database...</span>
    </div>
  )

  if (logs.length === 0) return (
    <div className="flex flex-col items-center justify-center h-96 text-zinc-600 border border-dashed border-zinc-800 rounded-3xl bg-[#0c0c0e]">
      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
        <Clock className="w-8 h-8 opacity-50" />
      </div>
      <p className="text-lg font-bold text-white">No Audit Records</p>
      <p className="text-sm">Run your first compliance scan to generate logs.</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            Audit Log Archive
            <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400 font-mono border border-white/5">v2.1</span>
          </h2>
          <p className="text-zinc-500 text-sm">Immutable records of all compliance checks performed.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={fetchLogs} 
             className="p-2.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg border border-white/5 transition-colors"
             title="Refresh Data"
           >
             <RefreshCcw className="w-4 h-4" />
           </button>
           <button 
             onClick={handleExport}
             className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold rounded-lg border border-white/5 transition-colors flex items-center gap-2"
           >
             <Download className="w-4 h-4" /> Export CSV
           </button>
        </div>
      </div>

      {/* --- CHART SECTION (Recharts) --- */}
      <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> Compliance Trend
          </h3>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Score
            </div>
          </div>
        </div>
        
        <div className="h-[250px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#52525b" 
                  tick={{fill: '#52525b', fontSize: 10}} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#52525b" 
                  tick={{fill: '#52525b', fontSize: 10}} 
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
              Not enough data to generate trend graph.
            </div>
          )}
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 bg-white/[0.02] text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <div className="col-span-3">Timestamp / ID</div>
          <div className="col-span-2">Test Suite</div>
          <div className="col-span-2">Target Model</div>
          <div className="col-span-2 text-center">Score</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        <div className="divide-y divide-white/5">
          {logs.map((log) => (
            <div key={log.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group">
              
              {/* DATE & ID */}
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 rounded-lg border border-white/5 group-hover:border-blue-500/30 transition-colors">
                    <FileText className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{formatDate(log.created_at)}</div>
                    <div className="text-[10px] text-zinc-600 font-mono truncate w-24">
                       ID: {log.id || '???'}
                    </div>
                  </div>
                </div>
              </div>

              {/* TRAP */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-zinc-600" />
                  <span className="text-sm text-zinc-300 capitalize">{log.trap_id || 'Standard'}</span>
                </div>
              </div>

              {/* PROVIDER */}
              <div className="col-span-2">
                <div className="text-xs text-zinc-400 truncate font-mono bg-black/50 px-2 py-1 rounded w-fit border border-white/5">
                  {log.provider || 'Unknown'}
                </div>
              </div>

              {/* SCORE */}
              <div className="col-span-2 text-center">
                <span className={`text-sm font-bold font-mono ${ (log.score ?? 0) >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                  {log.score ?? 0}/100
                </span>
              </div>

              {/* STATUS */}
              <div className="col-span-2">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wide ${
                  (log.score ?? 0) >= 80 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {(log.score ?? 0) >= 80 ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {(log.score ?? 0) >= 80 ? 'PASSED' : 'FAILED'}
                </div>
              </div>

              {/* ACTIONS (CRUD) */}
              <div className="col-span-1 text-right flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {log.pdf_url && (
                  <button 
                    onClick={() => window.open(log.pdf_url, '_blank')}
                    className="p-1.5 hover:bg-blue-500/20 text-zinc-500 hover:text-blue-400 rounded-lg transition-colors"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(log.id)}
                  className="p-1.5 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}