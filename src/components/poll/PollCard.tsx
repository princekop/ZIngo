"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

export interface PollData {
  id: string
  question: string
  options: string[]
  // unix ms
  endsAt?: number
}

export default function PollCard({ data, messageId }: { data: PollData, messageId: string }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const storageKey = `db:poll:${messageId}`
  const [votes, setVotes] = useState<Record<number, number>>({})
  const [votedIndex, setVotedIndex] = useState<number | null>(null)

  // Load and persist local votes (per device)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const j = JSON.parse(raw)
        if (j && typeof j === 'object') {
          setVotes(j.votes || {})
          setVotedIndex(typeof j.votedIndex === 'number' ? j.votedIndex : null)
        }
      }
    } catch {}
  }, [storageKey])

  const totalVotes = useMemo(() => Object.values(votes).reduce((a,b)=>a + (b||0), 0), [votes])
  const timeLeft = useMemo(() => {
    if (!data.endsAt) return null
    const diff = data.endsAt - Date.now()
    if (diff <= 0) return 'Ended'
    const hours = Math.ceil(diff / (60*60*1000))
    return `${hours}h left`
  }, [data.endsAt])

  function vote() {
    if (selected == null) return
    const next = { ...votes, [selected]: (votes[selected] || 0) + 1 }
    setVotes(next)
    setVotedIndex(selected)
    try { localStorage.setItem(storageKey, JSON.stringify({ votes: next, votedIndex: selected })) } catch {}
    setShowResults(true)
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#1E1F22] text-white p-3">
      <div className="text-sm font-semibold mb-1">{data.question}</div>
      <div className="text-xs text-white/60 mb-2">Select one answer</div>
      <div className="space-y-2">
        {data.options.map((opt, i) => {
          const count = votes[i] || 0
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          return (
            <button key={i} onClick={()=> !showResults && setSelected(i)} className={`w-full text-left rounded-lg border border-white/10 bg-[#2B2D31] hover:bg-[#34363B] px-3 py-2 flex items-center justify-between ${selected===i ? 'ring-1 ring-indigo-400/40' : ''}`} disabled={showResults}>
              <span className="truncate pr-2">{opt}</span>
              {!showResults ? (
                <span className={`ml-3 inline-flex items-center justify-center w-5 h-5 rounded-full border ${selected===i ? 'border-indigo-400 bg-indigo-500/20' : 'border-white/30'}`}></span>
              ) : (
                <span className="ml-3 text-xs text-white/70">{pct}%</span>
              )}
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-white/60">
        <div>
          {totalVotes} votes · {timeLeft || '—'}
        </div>
        <div className="flex items-center gap-3">
          <button className="text-white/80 hover:text-white underline" onClick={()=> setShowResults(v => !v)}>
            {showResults ? 'Hide results' : 'Show results'}
          </button>
          <Button size="sm" onClick={vote} disabled={selected==null || showResults} className="h-7 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500">{votedIndex!=null || showResults ? 'Voted' : 'Vote'}</Button>
        </div>
      </div>
    </div>
  )
}
