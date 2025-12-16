import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Trash2 } from 'lucide-react'

export default function TrapBuilder({ session, onUpdate }) {
  const [traps, setTraps] = useState([])
  const [newCat, setNewCat] = useState('')
  const [newQ, setNewQ] = useState('')

  useEffect(() => {
    fetchTraps()
  }, [])

  const fetchTraps = async () => {
    const { data, error } = await supabase.from('custom_traps').select('*').order('created_at')
    if (error) {
      console.error("Error fetching traps:", error)
    } else if (data) {
      setTraps(data)
      onUpdate(data)
    }
  }

  const addTrap = async () => {
    // 1. Validation Check
    if (!newCat || !newQ) {
      alert("Please enter both a Category and a Question.")
      return
    }

    try {
      // 2. Database Insert
      const { data, error } = await supabase.from('custom_traps').insert({
        user_id: session.user.id,
        category: newCat,
        question: newQ
      }).select()

      // 3. Error Handling (This is what we were missing!)
      if (error) {
        console.error("Supabase Error:", error)
        alert(`Failed to save: ${error.message}`)
        return
      }

      // 4. Success Update
      if (data) {
        const updated = [...traps, ...data]
        setTraps(updated)
        onUpdate(updated)
        setNewCat('')
        setNewQ('')
      }
    } catch (err) {
      alert(`System Error: ${err.message}`)
    }
  }

  const deleteTrap = async (id) => {
    const { error } = await supabase.from('custom_traps').delete().eq('id', id)
    if (error) {
      alert("Failed to delete: " + error.message)
    } else {
      const updated = traps.filter(t => t.id !== id)
      setTraps(updated)
      onUpdate(updated)
    }
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm mt-8">
      <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4" /> Custom Policy Engine
      </h3>
      <div className="flex gap-2 mb-6">
        <input
          placeholder="Category (e.g. 'Project Omega')"
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-white rounded px-3 py-2 text-sm w-1/3"
        />
        <input
          placeholder="Trap Question"
          value={newQ}
          onChange={e => setNewQ(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-white rounded px-3 py-2 text-sm flex-1"
        />
        <button onClick={addTrap} className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {traps.map(trap => (
          <div key={trap.id} className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-800/50">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase mr-2">{trap.category}</span>
              <span className="text-sm text-slate-300">{trap.question}</span>
            </div>
            <button onClick={() => deleteTrap(trap.id)} className="text-slate-600 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {traps.length === 0 && <p className="text-xs text-slate-600 text-center">No custom rules defined.</p>}
      </div>
    </div>
  )
}