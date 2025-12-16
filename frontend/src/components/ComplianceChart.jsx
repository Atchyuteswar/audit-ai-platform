import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

export default function ComplianceChart({ logs }) {
  
  // 1. Process Data: Sort by date and format for the chart
  const chartData = [...logs]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map(log => ({
      date: format(new Date(log.created_at), 'MMM dd'),
      fullDate: format(new Date(log.created_at), 'PP p'),
      score: log.score,
      id: log.id,
      domain: log.trap_id
    }))
    // Take only the last 20 runs so the chart doesn't get squished
    .slice(-20)

  if (chartData.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/50 border-dashed text-slate-500">
        Run at least 2 audits to see trends.
      </div>
    )
  }

  // Custom Tooltip (Hover effect)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-200 font-bold mb-1">{data.fullDate}</p>
          <p className="text-xs text-slate-400 uppercase mb-2">{data.domain}</p>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Score:</span>
            <span className={`font-mono font-bold ${data.score >= 80 ? 'text-green-400' : 'text-red-400'}`}>
              {data.score}
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[300px] bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4 pl-2">Compliance Trend (Last 20 Runs)</h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorScore)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}