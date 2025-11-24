"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import InviteModal from "@/components/InviteModal"

interface ServerItem {
  id: string
  name: string
  description?: string
  icon?: string
  banner?: string
  ownerId?: string
  members?: number
}

interface ServersModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export default function ServersModal({ isOpen, onClose, userId }: ServersModalProps) {
  const [servers, setServers] = useState<ServerItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [inviteFor, setInviteFor] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/servers?userId=${encodeURIComponent(userId)}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`)
        const list = await res.json()
        setServers(Array.isArray(list) ? list : [])
      } catch (e: any) {
        setError(e?.message || "Failed to load servers")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isOpen, userId])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4">
      <div className="relative w-full sm:max-w-2xl rounded-none sm:rounded-2xl bg-gray-950/95 border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 bg-gray-950/95 backdrop-blur-xl">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white">Your Servers</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Owned and joined communities</p>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : servers.length === 0 ? (
            <div className="text-center text-gray-400">No servers yet.</div>
          ) : (
            <ul className="space-y-3">
              {servers.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="min-w-0">
                    <div className="font-medium text-white truncate">{s.name}</div>
                    {s.description && (
                      <div className="text-xs text-gray-400 truncate">{s.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => (window.location.href = `/server/${s.id}`)}>Open</Button>
                    <Button size="sm" onClick={() => setInviteFor({ id: s.id, name: s.name })}>Invite</Button>
                    {s.ownerId && s.ownerId === userId ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/servers/${s.id}`, { method: "DELETE" })
                            if (!res.ok) throw new Error("Failed to delete")
                            setServers((prev) => prev.filter((x) => x.id !== s.id))
                          } catch (e) {
                            alert("Failed to delete server")
                          }
                        }}
                      >
                        Delete
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/servers/${s.id}/leave`, { method: "POST" })
                            if (!res.ok) throw new Error("Failed to leave")
                            setServers((prev) => prev.filter((x) => x.id !== s.id))
                          } catch (e) {
                            alert("Failed to leave server")
                          }
                        }}
                      >
                        Leave
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Invite Modal wiring */}
      {inviteFor && (
        <InviteModal
          isOpen={true}
          onClose={() => setInviteFor(null)}
          serverId={inviteFor.id}
          serverName={inviteFor.name}
        />
      )}
    </div>
  )
}
