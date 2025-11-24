'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import InviteModal from '@/components/InviteModal'
import { toast } from 'sonner'

type ServerItem = {
  id: string
  name: string
  description?: string
  icon?: string
  banner?: string
  ownerId?: string
  members?: number
}

export default function ServersPage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()
  const { data: session, status } = useSession()

  const [servers, setServers] = useState<ServerItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteFor, setInviteFor] = useState<{ id: string; name: string } | null>(null)
  const [advertised, setAdvertised] = useState<ServerItem[] | null>(null)
  const [query, setQuery] = useState('')

  const resolveImageUrl = (val?: string) => {
    if (!val) return ''
    if (/^(https?:|data:|blob:|\/)/.test(val)) return val
    return `/uploads/${val}`
  }

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/servers?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`)
        const list = await res.json()
        setServers(Array.isArray(list) ? list : [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load servers')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  // Load advertised servers if available; silently fallback
  useEffect(() => {
    const loadAdvertised = async () => {
      try {
        const res = await fetch('/api/servers/advertised', { cache: 'no-store' })
        if (!res.ok) return
        const list = await res.json()
        if (Array.isArray(list)) setAdvertised(list)
      } catch { /* ignore */ }
    }
    loadAdvertised()
  }, [])

  // Auth guard similar to dashboard
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }
  if (!session || session.user.id !== userId) {
    router.push('/login')
    return null
  }

  return (
    <SidebarProvider
      style={{
        // Keep the same layout proportions as dashboard-01
        ['--sidebar-width' as any]: 'calc(var(--spacing) * 72)',
        ['--header-height' as any]: 'calc(var(--spacing) * 12)',
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">Your Servers</h1>
              <p className="text-sm text-muted-foreground">Owned and joined communities</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search servers..."
                className="w-[200px] md:w-[280px]"
              />
              <Button variant="outline" onClick={() => router.push(`/dash/${userId}`)}>Back to Dashboard</Button>
            </div>
          </div>

          {/* Content sections */}
          <div className="mt-6 space-y-10">
            {/* Advertised Servers (static) */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Advertised Servers</h2>
              </div>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(advertised && advertised.length > 0 ? advertised : [1,2,3]).map((item: any, idx: number) => {
                  const adv = advertised ? item as ServerItem : null
                  const banner = advertised ? resolveImageUrl(adv?.banner) : ''
                  const iconUrl = advertised ? resolveImageUrl(adv?.icon) : ''
                  const name = advertised ? (adv?.name || `Server ${idx+1}`) : `Server ${idx+1}`
                  const code = (name || 'SV').slice(0,2).toUpperCase()
                  const key = advertised ? `adv-${adv?.id || idx}` : `adv-${idx}`
                  return (
                    <li key={key} className="rounded-2xl border bg-card text-card-foreground overflow-hidden">
                      {banner ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={banner} alt="banner" className="h-36 md:h-44 w-full object-cover" />
                      ) : (
                        <div className="h-36 md:h-44 w-full bg-gradient-to-br from-primary/20 to-primary/10" />
                      )}
                      <div className="p-5">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                            {iconUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={iconUrl} alt={name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-primary">{code}</span>
                            )}
                          </div>
                          <div className="font-semibold truncate">{name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => advertised && adv ? router.push(`/server/${adv.id}`) : undefined}>Explore</Button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>

            {/* Owned Servers */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Owned Servers</h2>
              </div>
              {error ? (
                <div className="text-red-400">{error}</div>
              ) : (
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {(
                    servers
                      .filter((s) => s.ownerId && s.ownerId === userId)
                      .filter((s) =>
                        (s.name || '').toLowerCase().includes(query.toLowerCase()) ||
                        (s.description || '').toLowerCase().includes(query.toLowerCase())
                      )
                  ).map((s) => {
                    const banner = resolveImageUrl(s.banner)
                    const iconUrl = resolveImageUrl(s.icon)
                    const fallback = (s.name || 'SV').slice(0,2).toUpperCase()
                    return (
                      <li key={s.id} className="rounded-2xl border bg-card text-card-foreground overflow-hidden transition hover:shadow-md">
                        {/* Banner */}
                        {banner ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={banner} alt="banner" className="h-36 md:h-44 w-full object-cover" />
                        ) : (
                          <div className="h-36 md:h-44 w-full bg-gradient-to-br from-primary/15 to-primary/5" />)
                        }
                        {/* Body */}
                        <div className="p-5">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                              {iconUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={iconUrl} alt={s.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold text-primary">{fallback}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{s.name}</div>
                              {s.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1">{s.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => router.push(`/server/${s.id}`)}>Open</Button>
                            <Button size="sm" onClick={() => setInviteFor({ id: s.id, name: s.name })}>Invite</Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/servers/${s.id}`, { method: 'DELETE' })
                                  if (!res.ok) throw new Error('Failed to delete')
                                  setServers((prev) => prev.filter((x) => x.id !== s.id))
                                  toast.success('Server deleted', { duration: 1200 })
                                } catch (e) {
                                  toast.error('Failed to delete server', { duration: 1200 })
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            {/* Others Servers */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Others</h2>
              </div>
              {error ? (
                <div className="text-red-400">{error}</div>
              ) : (
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {(
                    servers
                      .filter((s) => !s.ownerId || s.ownerId !== userId)
                      .filter((s) =>
                        (s.name || '').toLowerCase().includes(query.toLowerCase()) ||
                        (s.description || '').toLowerCase().includes(query.toLowerCase())
                      )
                  ).map((s) => {
                    const banner = resolveImageUrl(s.banner)
                    const iconUrl = resolveImageUrl(s.icon)
                    const fallback = (s.name || 'SV').slice(0,2).toUpperCase()
                    return (
                      <li key={s.id} className="rounded-2xl border bg-card text-card-foreground overflow-hidden transition hover:shadow-md">
                        {/* Banner */}
                        {banner ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={banner} alt="banner" className="h-36 md:h-44 w-full object-cover" />
                        ) : (
                          <div className="h-36 md:h-44 w-full bg-gradient-to-br from-primary/15 to-primary/5" />)
                        }
                        {/* Body */}
                        <div className="p-5">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                              {iconUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={iconUrl} alt={s.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold text-primary">{fallback}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{s.name}</div>
                              {s.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1">{s.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => router.push(`/server/${s.id}`)}>Open</Button>
                            <Button size="sm" onClick={() => setInviteFor({ id: s.id, name: s.name })}>Invite</Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/servers/${s.id}/leave`, { method: 'POST' })
                                  if (!res.ok) throw new Error('Failed to leave')
                                  setServers((prev) => prev.filter((x) => x.id !== s.id))
                                  toast.success('Left server', { duration: 1200 })
                                } catch (e) {
                                  toast.error('Failed to leave server', { duration: 1200 })
                                }
                              }}
                            >
                              Leave
                            </Button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            {/* Skeletons while loading */}
            {loading && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border bg-card/50 overflow-hidden animate-pulse">
                    <div className="h-36 md:h-44 w-full bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-xl bg-muted" />
                        <div className="h-4 w-1/2 bg-muted rounded" />
                      </div>
                      <div className="h-8 w-1/3 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {inviteFor && (
        <InviteModal
          isOpen={true}
          onClose={() => setInviteFor(null)}
          serverId={inviteFor.id}
          serverName={inviteFor.name}
        />
      )}
    </SidebarProvider>
  )
}
