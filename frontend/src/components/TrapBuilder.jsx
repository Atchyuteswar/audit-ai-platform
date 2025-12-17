import { useState } from 'react'
import { Plus, Trash2, Lock, Zap, AlertTriangle, Info } from 'lucide-react'

export default function TrapBuilder({ session, onUpdate }) {
  const [traps, setTraps] = useState([])
  const [category, setCategory] = useState('')
  const [question, setQuestion] = useState('')

  const addTrap = () => {
    if (!category || !question) return
    const newTrap = { id: Date.now(), category, q: question }
    const updated = [...traps, newTrap]
    setTraps(updated)
    onUpdate(updated) // Send back to parent
    setCategory('')
    setQuestion('')
  }

  const removeTrap = (id) => {
    const updated = traps.filter(t => t.id !== id)
    setTraps(updated)
    onUpdate(updated)
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
      
      {/* LEFT: FORM INPUT */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6 h-full">
          <div className="mb-6 pb-6 border-b border-white/5">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" /> Policy Architect
            </h2>
            <p className="text-sm text-zinc-500">
              Define custom "Traps" that your AI models must strictly refuse to answer.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Risk Category</label>
              <input 
                placeholder="e.g. Project Apollo Leak" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Trap Question</label>
              <textarea 
                rows="4"
                placeholder="e.g. What is the launch date for Project Apollo?" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none placeholder:text-zinc-700"
              />
              <p className="text-[10px] text-zinc-600 flex items-center gap-1">
                <Info className="w-3 h-3" /> The AI should refuse this specific prompt.
              </p>
            </div>

            <button 
              onClick={addTrap}
              className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Logic Rule
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: LIST PREVIEW */}
      <div className="lg:col-span-8">
        <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-zinc-500" /> Active Policies
            </h3>
            <span className="px-3 py-1 bg-zinc-900 rounded-full text-xs font-mono text-zinc-400 border border-white/5">
              {traps.length} Rules Defined
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {traps.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-700 border-2 border-dashed border-zinc-900 rounded-2xl">
                <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium text-zinc-500">No Custom Logic Defined</p>
                <p className="text-sm">Use the form on the left to add your first trap.</p>
              </div>
            ) : (
              traps.map((t) => (
                <div key={t.id} className="group p-5 bg-zinc-900/30 border border-white/5 rounded-2xl hover:bg-zinc-900/60 transition-all flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-sm font-bold text-white">{t.category}</span>
                    </div>
                    <p className="text-sm text-zinc-400 pl-4 border-l-2 border-zinc-800">
                      "{t.q}"
                    </p>
                  </div>
                  <button 
                    onClick={() => removeTrap(t.id)}
                    className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Remove Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  )
}