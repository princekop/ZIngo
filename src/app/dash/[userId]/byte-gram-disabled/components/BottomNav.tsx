"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Plus, PlayCircle, User } from "lucide-react"

export default function BottomNav({ base }: { base: string }) {
  const pathname = usePathname()
  const Item = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => {
    const active = pathname === href
    return (
      <Link href={href} className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md ${active ? 'text-sky-400' : 'text-white/70'}`}>
        {icon}
        <span className="text-[11px]">{label}</span>
      </Link>
    )
  }
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] border-t border-white/10 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/50 md:hidden">
      <div className="mx-auto max-w-7xl px-4 py-2 grid grid-cols-5">
        <Item href={`${base}/home`} icon={<Home className="h-5 w-5" />} label="Home" />
        <Item href={`${base}/reels`} icon={<PlayCircle className="h-5 w-5" />} label="Reels" />
        <Link href="#" className="-mt-6 h-12 w-12 rounded-full bg-sky-500 text-black flex items-center justify-center shadow-xl mx-auto"><Plus className="h-6 w-6" /></Link>
        <Item href={`${base}/videos`} icon={<Search className="h-5 w-5" />} label="Explore" />
        <Item href={`${base}/profile`} icon={<User className="h-5 w-5" />} label="Profile" />
      </div>
    </nav>
  )
}
