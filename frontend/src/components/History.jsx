import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase' // <--- UPDATED
import { CheckCircle, AlertTriangle, FileText, Calendar, TrendingUp } from 'lucide-react'
import ComplianceChart from './ComplianceChart' // Sibling, so ./ is correct

export default function History({ session }) {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setLogs(data)
        } catch (error) {
            console.error('Error fetching history:', error.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-center p-12 text-slate-500 animate-pulse">Loading Analytics...</div>

    // Calculate Average Score
    const averageScore = logs.length > 0
        ? Math.round(logs.reduce((acc, curr) => acc + curr.score, 0) / logs.length)
        : 0

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* 1. Header & Quick Stats */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-blue-500" /> Analytics Suite
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Real-time monitoring of AI compliance posture.</p>
                </div>

                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase">Total Audits</p>
                        <p className="text-2xl font-bold text-white">{logs.length}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-800"></div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase">Avg Score</p>
                        <p className={`text-2xl font-bold ${averageScore >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {averageScore}%
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. THE NEW CHART */}
            <ComplianceChart logs={logs} />

            {/* 3. The Data Table */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase pl-2">Detailed Logs</h3>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-200 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Domain</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Report</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {log.score >= 80 ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className={log.score >= 80 ? "text-green-400" : "text-red-400"}>
                                                {log.score >= 80 ? "Pass" : "Fail"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-300 uppercase">{log.trap_id}</td>
                                    <td className="px-6 py-4">
                                        <div className="w-24 bg-slate-800 rounded-full h-1.5 mt-1 relative">
                                            <div
                                                className={`absolute top-0 left-0 h-1.5 rounded-full ${log.score >= 80 ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ width: `${log.score}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <Calendar className="w-3 h-3 opacity-50" />
                                        {new Date(log.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {log.pdf_url && (
                                            <button
                                                onClick={() => window.open(log.pdf_url, '_blank')}
                                                className="text-blue-400 hover:text-blue-300 hover:underline flex items-center justify-end gap-1 w-full"
                                            >
                                                <FileText className="w-3 h-3" /> PDF
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-600">
                                        No audit records found. Run a compliance check to begin.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}