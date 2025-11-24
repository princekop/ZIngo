"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Heart, MessageCircle, MoreVertical, Bookmark, Share2, ChevronUp, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type Reel = {
  id: string
  title?: string
  channelTitle?: string
  thumbnails?: any
  stats?: any
  duration?: string
}

export default function ReelsViewer() {
  const [items, setItems] = useState<Reel[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likes, setLikes] = useState<Record<string, boolean>>({})
  const [muted, setMuted] = useState(true)
  const [showHints, setShowHints] = useState(true)
  const viewportRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const videosRef = useRef<Record<string, HTMLVideoElement | null>>({})

  const scrollToIndex = useCallback((idx: number) => {
    const root = viewportRef.current
    if (!root) return
    const clamped = Math.max(0, Math.min(idx, items.length - 1))
    const target = root.querySelector<HTMLElement>(`[data-index="${clamped}"]`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [items.length])

  const fetchChunk = useCallback(async (limit?: number) => {
    if (loading) return
    setLoading(true)
    try {
      const url = new URL("/api/byte-gram/shorts", window.location.origin)
      if (cursor) url.searchParams.set("cursor", cursor)
      if (limit) url.searchParams.set('limit', String(limit))
      const res = await fetch(url.toString())
      const data = await res.json()
      if (Array.isArray(data.items)) setItems(prev => [...prev, ...data.items])
      setCursor(data.nextCursor || null)
      if (!initialLoaded) setInitialLoaded(true)
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [cursor, loading, initialLoaded])

  useEffect(() => {
    fetchChunk(10)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-focus viewport so keyboard works without click
  useEffect(() => {
    viewportRef.current?.focus()
    const t = setTimeout(() => setShowHints(false), 3000)
    return () => clearTimeout(t)
  }, [])

  // Global keydown to handle when iframe steals focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = (target?.tagName || '').toLowerCase()
      const editable = (target as any)?.isContentEditable
      if (tag === 'input' || tag === 'textarea' || editable) return

      const nextKeys = (e.key === 'Enter' && !e.shiftKey) || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' '
      const prevKeys = (e.key === 'Enter' && e.shiftKey) || e.key === 'ArrowUp' || e.key === 'PageUp'
      if (nextKeys) {
        e.preventDefault()
        scrollToIndex(currentIndex + 1)
        // return focus to viewport to keep capturing keys
        setTimeout(() => viewportRef.current?.focus(), 0)
      } else if (prevKeys) {
        e.preventDefault()
        scrollToIndex(currentIndex - 1)
        setTimeout(() => viewportRef.current?.focus(), 0)
      }
    }
    window.addEventListener('keydown', handler, { passive: false })
    return () => window.removeEventListener('keydown', handler as any)
  }, [currentIndex, scrollToIndex])

  // Infinite scroll with intersection observer (loads next chunk near end)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !loading) fetchChunk()
      })
    }, { root: viewportRef.current, rootMargin: "600px 0px 600px 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [fetchChunk, loading])

  // Autoplay/pause based on visibility within the reels viewport
  useEffect(() => {
    const root = viewportRef.current
    if (!root) return
    const onScroll = () => {
      const rootRect = root.getBoundingClientRect()
      let bestEl: HTMLElement | null = null
      let bestRatio = -1
      const reelEls = Array.from(root.querySelectorAll<HTMLElement>('[data-reel-id]'))
      for (const el of reelEls) {
        const r = el.getBoundingClientRect()
        const visible = Math.min(r.bottom, rootRect.bottom) - Math.max(r.top, rootRect.top)
        const ratio = Math.max(0, visible) / rootRect.height
        if (ratio > bestRatio) { bestRatio = ratio; bestEl = el }
      }
      // Pause all
      Object.values(videosRef.current).forEach((vid) => vid?.pause())
      const id = bestEl?.getAttribute('data-reel-id')
      if (id) videosRef.current[id]?.play().catch(() => {})
      if (bestEl) {
        const idxAttr = bestEl.getAttribute('data-index')
        const idx = idxAttr ? parseInt(idxAttr, 10) : 0
        setCurrentIndex(idx)
      }
    }
    onScroll()
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [items])

  // Prefetch when user reaches last 2-3 items
  useEffect(() => {
    if (!initialLoaded) return
    if (loading) return
    if (!cursor) return
    if (currentIndex >= items.length - 3) {
      fetchChunk(5)
    }
  }, [currentIndex, items.length, loading, cursor, initialLoaded, fetchChunk])

  return (
    <div
      ref={viewportRef}
      className="relative mx-auto w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[580px] h-[min(90vh,820px)] overflow-y-auto snap-y snap-mandatory rounded-3xl border border-white/10 bg-black/30 backdrop-blur outline-none"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === 'ArrowDown') && !e.shiftKey) {
          e.preventDefault()
          scrollToIndex(currentIndex + 1)
        } else if ((e.key === 'Enter' && e.shiftKey) || e.key === 'ArrowUp') {
          e.preventDefault()
          scrollToIndex(currentIndex - 1)
        }
      }}
    >
      {/* Outside navigation buttons */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between p-2">
        <button
          aria-label="Previous reel"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollToIndex(currentIndex - 1) }}
          className="pointer-events-auto flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <ChevronUp className="h-5 w-5 rotate-90" />
        </button>
        <button
          aria-label="Next reel"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollToIndex(currentIndex + 1) }}
          className="pointer-events-auto flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <ChevronDown className="h-5 w-5 -rotate-90" />
        </button>
      </div>
      {/* Hints overlay */}
      {showHints && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-20 rounded-full bg-black/60 text-white text-[12px] md:text-sm px-3 py-1.5 border border-white/10 shadow">
          Enter/Space/↓ Next • Shift+Enter/↑ Prev • Click ◀ ▶
        </div>
      )}
      <div className="flex flex-col p-0">
        {items.map((it, i) => (
          <ReelCard
            key={it.id}
            reel={it}
            liked={!!likes[it.id]}
            onToggleLike={() => setLikes((prev) => ({ ...prev, [it.id]: !prev[it.id] }))}
            registerVideo={(id, el) => (videosRef.current[id] = el)}
            index={i}
            active={i === currentIndex}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
          />
        ))}
        {/* Skeletons while loading */}
        {loading && (
          <>
            {Array.from({ length: 3 }).map((_, k) => (
              <div key={`sk-${k}`} className="rounded-3xl border border-white/10 overflow-hidden animate-pulse">
                <div className="w-full bg-white/[0.06]" style={{ aspectRatio: '9/16' }} />
              </div>
            ))}
          </>
        )}
        <div ref={sentinelRef} />
      </div>
    </div>
  )
}

function ReelCard({ reel, liked, onToggleLike, registerVideo, index, active, muted, onToggleMute }: { reel: Reel; liked: boolean; onToggleLike: () => void; registerVideo: (id: string, el: HTMLVideoElement | null) => void; index: number; active: boolean; muted: boolean; onToggleMute: () => void }) {
  const poster = useMemo(() => reel.thumbnails?.maxres?.url || reel.thumbnails?.standard?.url || reel.thumbnails?.high?.url || reel.thumbnails?.medium?.url || reel.thumbnails?.default?.url, [reel])
  // Use YouTube embed when active (watermark acceptable per user)
  const embedSrc = useMemo(() => {
    const id = reel.id
    const params = new URLSearchParams({
      autoplay: '1',
      mute: muted ? '1' : '0',
      playsinline: '1',
      controls: '0',
      loop: '1',
      playlist: id,
      modestbranding: '1',
      rel: '0',
      enablejsapi: '1',
    })
    return `https://www.youtube.com/embed/${id}?${params.toString()}`
  }, [reel.id, muted])
  const id = reel.id
  const onClickToggle = (e: React.MouseEvent) => {
    const el = (e.currentTarget as HTMLElement).querySelector('video') as HTMLVideoElement | null
    if (!el) return
    if (el.paused) el.play().catch(() => {})
    else el.pause()
  }
  return (
    <article data-reel-id={id} data-index={index} className="relative h-[min(90vh,820px)] rounded-[28px] overflow-hidden border border-white/10 bg-black snap-center shadow-[20px_20px_60px_#0a0a0a,-20px_-20px_60px_#121212]">
      {/* Active => YouTube iframe, Inactive => Poster card */}
      {active ? (
        <div className="relative w-full h-full">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedSrc}
            title={reel.title || 'Reel player'}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={reel.title || 'reel'} className="w-full h-full object-cover" />
      )}

      {/* Overlay HUD */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-black/0 to-black/60" />

      {/* Right actions */}
      <div className="absolute right-3 bottom-4 flex flex-col items-center gap-3 pointer-events-auto">
        <button onClick={onToggleLike} className={`h-11 w-11 rounded-full flex items-center justify-center ${liked ? 'bg-sky-500 text-black' : 'bg-white/10 text-white'} hover:bg-white/20 transition`}>
          <Heart className="h-5 w-5" />
        </button>
        <CommentsDrawer reel={reel} />
        <button className="h-11 w-11 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition">
          <Bookmark className="h-5 w-5" />
        </button>
        <button className="h-11 w-11 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition">
          <Share2 className="h-5 w-5" />
        </button>
        <button className="h-11 w-11 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition">
          <MoreVertical className="h-5 w-5" />
        </button>
        {active && (
          <button onClick={(e) => { e.stopPropagation(); onToggleMute() }} className="h-11 w-11 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition">
            {muted ? '🔇' : '🔊'}
          </button>
        )}
      </div>

      {/* Meta */}
      <div className="absolute left-3 bottom-4 pointer-events-none">
        <div className="text-white font-medium drop-shadow-md max-w-[70%] line-clamp-2">{reel.title}</div>
        <div className="text-white/70 text-sm">{reel.channelTitle}</div>
      </div>
    </article>
  )
}

function CommentsDrawer({ reel }: { reel: Reel }) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string }>>([
    { id: '1', user: 'alpha', text: 'Fire 🔥' },
    { id: '2', user: 'beta', text: 'Love this' },
  ])
  const [text, setText] = useState("")
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="h-11 w-11 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition pointer-events-auto">
          <MessageCircle className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-black/80 backdrop-blur border-t border-white/10 text-white">
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>
        <div className="mt-3 space-y-2 max-h-[40vh] overflow-y-auto pr-2">
          {comments.map((c) => (
            <div key={c.id} className="text-sm">
              <span className="text-white/70 mr-2">@{c.user}</span>
              <span>{c.text}</span>
            </div>
          ))}
        </div>
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!text.trim()) return
            setComments((prev) => [{ id: String(Date.now()), user: 'you', text }, ...prev])
            setText("")
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment" className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none" />
          <button className="px-3 py-2 rounded-md bg-sky-500 text-black font-medium">Post</button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
