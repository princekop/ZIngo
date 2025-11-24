"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function UploadArea() {
  const [files, setFiles] = useState<Array<{name:string;url:string;size:number;mtime:string}>>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement|null>(null)

  const load = async () => {
    try {
      const res = await fetch("/api/upload", { cache: "no-store" })
      if (res.ok) {
        const list = await res.json()
        setFiles(Array.isArray(list) ? list : [])
      }
    } catch {}
  }

  useEffect(() => { load() }, [])

  const onDrop = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (res.ok) {
        await load()
      }
    } finally {
      setUploading(false)
    }
  }

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) await onDrop(f)
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-base font-semibold">Uploads</div>
            <div className="text-sm text-white/60">Saved under /assests</div>
          </div>
          <div className="flex items-center gap-2">
            <Input ref={fileRef} type="file" onChange={onInputChange} className="rounded-xl border-white/15 bg-black/30"/>
            <Button disabled={uploading} onClick={() => fileRef.current?.click()} className="rounded-xl bg-gradient-to-r from-teal-500 to-amber-600 text-white">{uploading?"Uploading…":"Upload"}</Button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {files.map((f) => (
            <a key={f.url} href={f.url} target="_blank" className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2 hover:bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={f.name} className="h-28 w-full rounded-md object-cover"/>
              <div className="mt-2 truncate text-xs text-white/80" title={f.name}>{f.name}</div>
              <div className="text-[11px] text-white/50">{(f.size/1024).toFixed(1)} KB</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
