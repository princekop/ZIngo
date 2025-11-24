"use client"

import { format } from 'date-fns'

export interface GiveawayData {
  prize: string
  hostedBy?: string
  notes?: string
  // unix ms
  endsAt?: number
  winner?: string
}

export default function GiveawayCard({ data, participants, ended }: { data: GiveawayData, participants: number, ended: boolean }) {
  const endedAt = data.endsAt ? new Date(data.endsAt) : null
  return (
    <div className="rounded-xl border border-white/10 bg-[#1E1F22] text-white p-3">
      <div className="flex items-center gap-2 text-sm font-semibold mb-2">
        <span>🎁 Giveaway {ended ? 'Ended' : ''}</span>
        <span className="text-white/50">{ended ? '(edited)' : ''}</span>
      </div>
      <div className="rounded-lg border border-emerald-600/40 bg-black/30 p-3">
        <div className="text-base font-extrabold tracking-wide mb-2">🎁 {data.prize.toUpperCase()} 🎁</div>
        {data.hostedBy && (
          <div className="flex items-center gap-2 text-sm"><span className="text-emerald-400">●</span><span>Hosted by: <span className="underline text-indigo-300">{data.hostedBy}</span></span></div>
        )}
        <div className="flex items-center gap-2 text-sm mt-1"><span className="text-emerald-400">●</span><span>Total participant(s): {participants}</span></div>
        {data.winner && (
          <div className="mt-1 text-sm">Winner: <span className="underline text-indigo-300">{data.winner}</span></div>
        )}
        {data.notes && (
          <div className="mt-2 text-sm text-white/80">{data.notes}</div>
        )}
        <div className="mt-2 text-xs text-white/60">
          {ended ? (
            <>Ended · {endedAt ? format(endedAt, 'M/d/yyyy h:mm a') : ''}</>
          ) : (
            <>React with 🎉 to enter!{data.endsAt ? ` · Ends ${format(new Date(data.endsAt), 'M/d/yyyy h:mm a')}` : ''}</>
          )}
        </div>
      </div>
    </div>
  )
}
