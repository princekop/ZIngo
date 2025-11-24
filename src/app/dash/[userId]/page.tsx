'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import CreateServerModal from '@/components/CreateServerModal'
import ServersModal from '@/components/ServersModal'
import { SiteHeader } from '@/components/site-header'
import { AppSidebar } from '@/components/app-sidebar'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { SectionCards } from '@/components/section-cards'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Users, Compass } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Avatar from '@/components/Avatar'

export default function UserDashboard() {
  const { userId } = useParams<{ userId: string }>()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [openCreate, setOpenCreate] = useState(false)
  const [openServers, setOpenServers] = useState(false)
  const [serverName, setServerName] = useState("")
  const [ownedServers, setOwnedServers] = useState<any[]>([])
  const [ownedLoading, setOwnedLoading] = useState<boolean>(false)
  const [selectedServerId, setSelectedServerId] = useState<string>("")
  const [serverStats, setServerStats] = useState<{ members?: number; joined24h?: number; left24h?: number; activity?: number } | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [memberQuery, setMemberQuery] = useState('')
  const [roles, setRoles] = useState<any[]>([])
  const [assigning, setAssigning] = useState<string | null>(null)

  // Wire sidebar custom events to open sheets
  useEffect(() => {
    const onCreate = () => setOpenCreate(true)
    const onServers = () => router.push(`/dash/${userId}/servers`)
    window.addEventListener('openCreateServer', onCreate as EventListener)
    window.addEventListener('openServersModal', onServers as EventListener)
    return () => {
      window.removeEventListener('openCreateServer', onCreate as EventListener)
      window.removeEventListener('openServersModal', onServers as EventListener)
    }
  }, [])

  // Load owned servers for toolbar
  useEffect(() => {
    const loadOwned = async () => {
      if (!userId) return
      setOwnedLoading(true)
      try {
        const res = await fetch(`/api/servers?userId=${encodeURIComponent(userId as string)}`, { cache: 'no-store' })
        if (res.ok) {
          const list = await res.json()
          const owned = Array.isArray(list) ? list.filter((s: any) => s.ownerId === userId) : []
          setOwnedServers(owned)
          if (owned.length > 0) setSelectedServerId(owned[0].id)
        }
      } finally {
        setOwnedLoading(false)
      }
    }
    loadOwned()
  }, [userId])

  // Optionally load stats for selected owned server (placeholder endpoint)
  useEffect(() => {
    const loadStats = async () => {
      if (!selectedServerId) { setServerStats(null); return }
      try {
        const res = await fetch(`/api/servers/${selectedServerId}/stats`, { cache: 'no-store' })
        if (res.ok) {
          const s = await res.json()
          setServerStats(s)
        } else {
          // graceful fallback with mock
          setServerStats({ members: undefined, joined24h: undefined, left24h: undefined, activity: undefined })
        }
      } catch {
        setServerStats({ members: undefined, joined24h: undefined, left24h: undefined, activity: undefined })
      }
    }
    loadStats()
  }, [selectedServerId])

  // Load members of selected server
  useEffect(() => {
    const loadMembers = async () => {
      if (!selectedServerId) { setMembers([]); return }
      setMembersLoading(true)
      try {
        const res = await fetch(`/api/servers/${selectedServerId}/members`, { cache: 'no-store' })
        if (res.ok) {
          const list = await res.json()
          // API returns flattened user fields: { id, name, username, avatar, role, roles: [{id,name,...}] }
          setMembers(Array.isArray(list) ? list : [])
        }
      } finally {
        setMembersLoading(false)
      }
    }
    loadMembers()
  }, [selectedServerId])

  // Load roles of selected server for assignment UI
  useEffect(() => {
    const loadRoles = async () => {
      if (!selectedServerId) { setRoles([]); return }
      try {
        const res = await fetch(`/api/servers/${selectedServerId}/roles`, { cache: 'no-store' })
        if (res.ok) {
          const list = await res.json()
          setRoles(Array.isArray(list) ? list : [])
        }
      } catch {
        setRoles([])
      }
    }
    loadRoles()
  }, [selectedServerId])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0b0d12] via-[#0f1115] to-[#0b0d12]">
        <div className="text-sky-300 text-lg">Loading...</div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!session || session.user.id !== userId) {
    router.push('/login')
    return null
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Quick Actions */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Create Server - emerald/cyan gradient */}
                  <Card className="relative overflow-hidden rounded-2xl border p-5 transition shadow-sm hover:shadow-xl hover:ring-1 hover:ring-emerald-400/40 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Create Server</div>
                        <div className="text-sm text-muted-foreground">Spin up a new community</div>
                      </div>
                      <div className="h-10 w-10 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 flex items-center justify-center">
                        <Plus className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-900/20 transition duration-300 hover:shadow-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                        onClick={() => setOpenCreate(true)}
                      >
                        <span className="mr-1">Get Started</span>
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                      </Button>
                    </div>
                  </Card>

                  {/* Servers - indigo/fuchsia gradient */}
                  <Card className="relative overflow-hidden rounded-2xl border p-5 transition shadow-sm hover:shadow-xl hover:ring-1 hover:ring-indigo-400/40 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-indigo-500/10 blur-2xl" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Servers</div>
                        <div className="text-sm text-muted-foreground">Manage your communities</div>
                      </div>
                      <div className="h-10 w-10 rounded-xl border border-indigo-400/30 bg-indigo-400/10 text-indigo-300 flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="rounded-xl border border-indigo-400/50 bg-indigo-500/5 px-4 py-2 text-sm font-medium text-indigo-200 shadow-lg shadow-indigo-900/20 transition duration-300 hover:bg-indigo-500/10 hover:text-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                        onClick={() => router.push(`/dash/${userId}/servers`)}
                      >
                        <span className="mr-1">Open</span>
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">↗</span>
                      </Button>
                    </div>
                  </Card>

                  {/* Discover - amber/rose gradient */}
                  <Card className="relative overflow-hidden rounded-2xl border p-5 transition shadow-sm hover:shadow-xl hover:ring-1 hover:ring-amber-400/40 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10">
                    <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-amber-500/10 blur-2xl" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Discover</div>
                        <div className="text-sm text-muted-foreground">Find new communities</div>
                      </div>
                      <div className="h-10 w-10 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 flex items-center justify-center">
                        <Compass className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="rounded-xl border border-amber-400/50 bg-amber-500/5 px-4 py-2 text-sm font-medium text-amber-200 shadow-lg shadow-amber-900/20 transition duration-300 hover:bg-amber-500/10 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                        onClick={() => router.push(`/discover`)}
                      >
                        <span className="mr-1">Explore</span>
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">↗</span>
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Owned Servers Toolbar */}
              <div className="px-4 lg:px-6">
                <Card className="relative overflow-hidden rounded-2xl border bg-card/60 p-5 shadow-sm hover:shadow-md">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-base font-semibold">Your Servers</div>
                      <div className="text-sm text-muted-foreground">Quickly access stats and activity</div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <Select value={selectedServerId} onValueChange={setSelectedServerId}>
                        <SelectTrigger className="w-full md:w-72 rounded-xl border-white/15 bg-background/60">
                          <SelectValue placeholder={ownedLoading ? 'Loading...' : (ownedServers.length ? 'Select a server' : 'No owned servers')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {ownedServers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedServerId && (
                        <Button
                          size="sm"
                          className="rounded-xl bg-gradient-to-r from-primary/70 to-primary px-3 py-2 text-white shadow-lg shadow-primary/20 hover:from-primary hover:to-primary/90"
                          onClick={() => router.push(`/server/${selectedServerId}`)}
                        >
                          Open
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-white/10 bg-background/60 p-4 backdrop-blur-sm">
                      <div className="text-xs text-muted-foreground">Members</div>
                      <div className="text-xl font-semibold tracking-tight">{serverStats?.members ?? '—'}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-background/60 p-4 backdrop-blur-sm">
                      <div className="text-xs text-muted-foreground">Joined (24h)</div>
                      <div className="text-xl font-semibold tracking-tight text-emerald-400">{serverStats?.joined24h ?? '—'}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-background/60 p-4 backdrop-blur-sm">
                      <div className="text-xs text-muted-foreground">Left (24h)</div>
                      <div className="text-xl font-semibold tracking-tight text-rose-400">{serverStats?.left24h ?? '—'}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-background/60 p-4 backdrop-blur-sm">
                      <div className="text-xs text-muted-foreground">Activity</div>
                      <div className="text-xl font-semibold tracking-tight">{serverStats?.activity ?? '—'}</div>
                    </div>
                  </div>
                </Card>
              </div>
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>

              {/* Members Manager */}
              <div className="px-4 lg:px-6">
                <Card className="relative overflow-hidden rounded-2xl border bg-card/60 p-5 shadow-sm hover:shadow-md">
                  <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-fuchsia-500/5 blur-3xl" />
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-semibold">Members</div>
                      <div className="text-sm text-muted-foreground">Moderate your selected server</div>
                    </div>
                    <div className="relative w-full md:w-80">
                      <Input
                        value={memberQuery}
                        onChange={(e) => setMemberQuery(e.target.value)}
                        placeholder="Search members..."
                        className="peer w-full rounded-xl border-white/15 bg-background/60 pl-9"
                      />
                      <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground peer-focus:text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {membersLoading ? (
                      <ul className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <li key={i} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-background/50 p-3 animate-pulse">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-white/10" />
                              <div className="h-4 w-40 rounded bg-white/10" />
                            </div>
                            <div className="h-8 w-48 rounded bg-white/10" />
                          </li>
                        ))}
                      </ul>
                    ) : !selectedServerId ? (
                      <div className="text-muted-foreground">Select a server to view members.</div>
                    ) : members.length === 0 ? (
                      <div className="text-muted-foreground">No members found.</div>
                    ) : (
                      <ul className="divide-y divide-white/5">
                        {members
                          .filter((m) =>
                            ((m.name || m.username || '') as string).toLowerCase().includes(memberQuery.toLowerCase())
                          )
                          .map((m) => (
                            <li key={m.id} className="py-3 flex items-center justify-between gap-3 rounded-xl px-2 hover:bg-white/5 transition">
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar src={m.avatar} alt={m.name || m.username} />
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{m.name || m.username}</div>
                                  <div className="text-xs text-muted-foreground truncate">{m.role || 'member'}</div>
                                  {/* M2M Roles as chips */}
                                  {!!m.roles?.length && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {m.roles.map((r: any) => (
                                        <Badge key={r.id} variant="outline" className="gap-1 rounded-lg border-white/20 bg-white/5">
                                          {r.name}
                                          <button
                                            className="ml-1 text-muted-foreground hover:text-foreground"
                                            onClick={async (e) => {
                                              e.preventDefault()
                                              try {
                                                const res = await fetch(`/api/servers/${selectedServerId}/members/${m.id}/roles`, {
                                                  method: 'DELETE',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ roleId: r.id }),
                                                })
                                                if (!res.ok) throw new Error('Failed')
                                                setMembers((prev) => prev.map((x) => x.id === m.id ? { ...x, roles: x.roles.filter((rr: any) => rr.id !== r.id) } : x))
                                              } catch {
                                                toast.error('Failed to unassign role', { duration: 1200 })
                                              }
                                            }}
                                            title="Remove role"
                                          >
                                            ×
                                          </button>
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Assign role select */}
                                <Select
                                  onValueChange={async (roleId) => {
                                    try {
                                      setAssigning(`${m.id}:${roleId}`)
                                      const res = await fetch(`/api/servers/${selectedServerId}/members/${m.id}/roles`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ roleId }),
                                      })
                                      if (!res.ok) throw new Error('Failed')
                                      const role = roles.find((rr) => rr.id === roleId)
                                      if (role) setMembers((prev) => prev.map((x) => x.id === m.id ? { ...x, roles: [...(x.roles||[]), { id: role.id, name: role.name }] } : x))
                                      toast.success('Role assigned', { duration: 1200 })
                                    } catch {
                                      toast.error('Failed to assign role', { duration: 1200 })
                                    } finally {
                                      setAssigning(null)
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Assign role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles.map((r) => (
                                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/servers/${selectedServerId}/members/${m.id}/timeout`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ minutes: 60 }),
                                      })
                                      if (!res.ok) throw new Error('Failed')
                                      toast.success('Member timed out for 60m', { duration: 1200 })
                                    } catch {
                                      toast.error('Failed to timeout member', { duration: 1200 })
                                    }
                                  }}
                                >
                                  Timeout 60m
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/servers/${selectedServerId}/members/${m.id}/ban`, {
                                        method: 'POST',
                                      })
                                      if (!res.ok) throw new Error('Failed')
                                      setMembers((prev) => prev.filter((x) => x.id !== m.id))
                                      toast.success('Member banned', { duration: 1200 })
                                    } catch {
                                      toast.error('Failed to ban member', { duration: 1200 })
                                    }
                                  }}
                                >
                                  Ban
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/servers/${selectedServerId}/members/${m.id}`, {
                                        method: 'DELETE',
                                      })
                                      if (!res.ok) throw new Error('Failed')
                                      setMembers((prev) => prev.filter((x) => x.id !== m.id))
                                      toast.success('Member removed', { duration: 1200 })
                                    } catch {
                                      toast.error('Failed to remove member', { duration: 1200 })
                                    }
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
        {/* Create Server Modal (real component) */}
        {openCreate && (
          <CreateServerModal
            onClose={() => setOpenCreate(false)}
            onServerCreated={() => setOpenCreate(false)}
            userId={userId}
          />
        )}

        {/* Servers (Joined) Modal */}
        {openServers && (
          <ServersModal isOpen={openServers} onClose={() => setOpenServers(false)} userId={userId} />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}