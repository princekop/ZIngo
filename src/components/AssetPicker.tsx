"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export type AssetPickerProps = {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
  title?: string
}

export default function AssetPicker({ open, onClose, onSelect, title }: AssetPickerProps) {
  const [items, setItems] = useState<Array<{name:string;url:string;size:number;mtime:string}>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/upload", { cache: "no-store" })
        if (res.ok) {
          const list = await res.json()
          setItems(Array.isArray(list) ? list : [])
        }
      } finally { setLoading(false) }
    }
    load()
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl border border-white/12 bg-black/85 p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">{title || 'Choose from uploads'}</div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {loading ? (
            Array.from({length:8}).map((_,i)=> (
              <div key={i} className="h-28 w-full animate-pulse rounded-xl border border-white/10 bg-white/5" />
            ))
          ) : items.length === 0 ? (
            <div className="col-span-full text-center text-white/70">No uploads yet.</div>
          ) : (
            items.map((it) => (
              <button key={it.url} onClick={() => { onSelect(it.url); onClose() }} className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2 hover:bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt={it.name} className="h-28 w-full rounded-md object-cover"/>
                <div className="mt-2 truncate text-xs text-white/80" title={it.name}>{it.name}</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
