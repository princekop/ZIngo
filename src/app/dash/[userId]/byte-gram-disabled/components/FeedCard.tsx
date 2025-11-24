"use client"

import Link from "next/link"
import { useState } from "react"
import { Heart, MessageCircle, Play } from "lucide-react"

export type FeedMedia = { type: "image" | "video"; src: string; aspect?: string }
export type FeedUser = { name: string; handle: string; avatar?: string }

export default function FeedCard({ user, media, caption, href }: { user: FeedUser; media: FeedMedia; caption?: string; href?: string }) {
  const [liked, setLiked] = useState(false)
  return (
    <article className="rounded-xl border border-white/10 bg-gradient-to-b from-[#0b0b0b] to-[#0f0f0f] overflow-hidden">
      <div className="p-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-white/10" />
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{user.name}</div>
          <div className="text-xs text-white/60 truncate">{user.handle}</div>
        </div>
      </div>
      <div className="relative">
        {media.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.src} alt="post" className="w-full object-cover" style={{ aspectRatio: media.aspect || "1/1" }} />
        ) : (
          <Link href={href || "#"} className="group block relative bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.src} alt="video" className="w-full object-cover opacity-90" style={{ aspectRatio: media.aspect || "16/9" }} />
            <span className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-sky-500/90 group-hover:bg-sky-500 flex items-center justify-center transition">
              <Play className="h-7 w-7 text-black" />
            </span>
          </Link>
        )}
      </div>
      {(caption || true) && (
        <div className="p-3 space-y-2">
          {caption && <p className="text-sm whitespace-pre-wrap">{caption}</p>}
          <div className="flex items-center gap-3 text-white/70">
            <button onClick={() => setLiked(v=>!v)} className={`inline-flex items-center gap-1 hover:text-white ${liked? 'text-sky-400' : ''}`}>
              <Heart className="h-5 w-5" /> <span className="text-xs">{liked? 'Liked' : 'Like'}</span>
            </button>
            <button className="inline-flex items-center gap-1 hover:text-white">
              <MessageCircle className="h-5 w-5" /> <span className="text-xs">Comment</span>
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
