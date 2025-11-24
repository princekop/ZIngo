"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PlayCircle, Video, User, Info, UserPlus, UserMinus } from "lucide-react"

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link href={href} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${active ? 'bg-white/10' : 'hover:bg-white/5'} transition`}>
      <span className="text-white/70">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

export default function Sidebar({ base }: { base: string }) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-gradient-to-b from-black to-zinc-900 p-3 sticky top-28 md:top-32 h-[calc(100vh-140px)] overflow-auto">
      <nav className="space-y-1">
        <NavItem href={`${base}/home`} icon={<Home className="h-4 w-4" />} label="Home" />
        <NavItem href={`${base}/reels`} icon={<PlayCircle className="h-4 w-4" />} label="Reels" />
        <NavItem href={`${base}/videos`} icon={<Video className="h-4 w-4" />} label="Videos" />
        <NavItem href={`${base}/profile`} icon={<User className="h-4 w-4" />} label="Profile" />
        <NavItem href={`${base}/about`} icon={<Info className="h-4 w-4" />} label="About" />
      </nav>
      <div className="h-px my-3 bg-white/10" />
      <div className="grid grid-cols-2 gap-2">
        <button className="rounded-xl bg-sky-500/90 hover:bg-sky-500 text-black text-sm py-2 inline-flex items-center justify-center gap-1">
          <UserPlus className="h-4 w-4" /> Follow
        </button>
        <button className="rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-sm py-2 inline-flex items-center justify-center gap-1">
          <UserMinus className="h-4 w-4" /> Unfollow
        </button>
      </div>
    </aside>
  )
}
