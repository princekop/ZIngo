"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type AdvItem = {
  id: string
  name: string
  description?: string
  icon?: string
  banner?: string
}

const resolveImageUrl = (val?: string) => {
  if (!val) return ''
  if (/^(https?:|data:|blob:|\/)/.test(val)) return val
  return `/uploads/${val}`
}

export default function DiscoverPage() {
  const router = useRouter()
  const [items, setItems] = useState<AdvItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/servers/advertised', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`)
        const list = await res.json()
        setItems(Array.isArray(list) ? list : [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load advertised servers')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = items.filter((s) =>
    (s.name || '').toLowerCase().includes(query.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height,0px))] flex-col p-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Discover</h1>
            <p className="mt-1 text-muted-foreground">Explore public communities and featured servers</p>
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search communities..."
            className="w-[220px] md:w-[320px]"
          />
        </div>

        <div className="mt-6">
          {error ? (
            <div className="text-red-400">{error}</div>
          ) : loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card/50 overflow-hidden animate-pulse">
                  <div className="h-36 md:h-44 w-full bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-muted" />
                      <div className="h-4 w-1/2 bg-muted rounded" />
                    </div>
                    <div className="h-8 w-1/3 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-muted-foreground">No communities found.</div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => {
                const banner = resolveImageUrl(s.banner)
                const iconUrl = resolveImageUrl(s.icon)
                const fallback = (s.name || 'SV').slice(0,2).toUpperCase()
                return (
                  <li key={s.id} className="rounded-2xl border bg-card text-card-foreground overflow-hidden transition hover:shadow-md">
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
                        <Button size="sm" onClick={() => router.push(`/server/${s.id}`)}>Explore</Button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
