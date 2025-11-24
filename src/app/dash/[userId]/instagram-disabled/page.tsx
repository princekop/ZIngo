"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { Home, Info, PlayCircle, User, UserMinus, UserPlus, Video } from "lucide-react"
import CardNav, { type CardNavItem } from "./CardNav"

export default function InstagramHubPage() {
  const params = useParams()
  const userId = params?.userId as string

  // Data-fetch scaffolding (replace with real endpoints)
  useEffect(() => {
    // TODO: fetch(`/api/dash/${userId}/social/stories`).then(...)
    // TODO: fetch(`/api/dash/${userId}/social/reels`).then(...)
    // TODO: fetch(`/api/dash/${userId}/social/feed`).then(...)
  }, [userId])

  return (
    <div className="min-h-screen bg-zinc-800 text-white">
      {/* CardNav-only navigation */}
      {(() => {
        const items: CardNavItem[] = [
          {
            label: "About",
            bgColor: "#0B1220",
            textColor: "#e5e7eb",
            links: [
              { label: "Company", href: "#", ariaLabel: "About Company" },
              { label: "Careers", href: "#", ariaLabel: "About Careers" },
            ],
          },
          {
            label: "Projects",
            bgColor: "#0A1626",
            textColor: "#e5e7eb",
            links: [
              { label: "Featured", href: "#", ariaLabel: "Featured Projects" },
              { label: "Case Studies", href: "#", ariaLabel: "Project Case Studies" },
            ],
          },
          {
            label: "Contact",
            bgColor: "#081A2C",
            textColor: "#e5e7eb",
            links: [
              { label: "Email", href: "#", ariaLabel: "Email us" },
              { label: "Twitter", href: "#", ariaLabel: "Twitter" },
              { label: "LinkedIn", href: "#", ariaLabel: "LinkedIn" },
            ],
          },
        ]
        return (
          <CardNav
            className="top-6 md:top-8"
            logo="https://i.postimg.cc/RVhGnmWS/34cb00613be09e4-file-0000000070dc61fab1b56c257da7eff8-wm.png"
            logoAlt="Darkhosting"
            items={items}
            baseColor="#0b0b0b"
            menuColor="#e5e7eb"
            buttonBgColor="#0ea5e9"
            buttonTextColor="#000000"
            ease="power3.out"
          />
        )
      })()}

      {/* Full-screen gradient canvas */}
      <main className="min-h-[100vh] pt-28 md:pt-32 bg-gradient-to-br from-black via-zinc-900 to-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar (Instagram app nav) */}
          <aside className="rounded-xl border border-white/10 bg-gradient-to-b from-black to-zinc-900 p-3">
            <nav className="space-y-1">
              <SidebarLink href="#" icon={<Home className="h-4 w-4" />} label="Home" active />
              <SidebarLink href="#" icon={<PlayCircle className="h-4 w-4" />} label="Reels" />
              <SidebarLink href="#" icon={<Video className="h-4 w-4" />} label="Videos" />
              <SidebarLink href="#" icon={<User className="h-4 w-4" />} label="Profile" />
              <SidebarLink href="#" icon={<Info className="h-4 w-4" />} label="About" />
            </nav>
            <div className="h-px my-3 bg-white/10" />
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-lg bg-sky-500/90 hover:bg-sky-500 text-black text-sm py-2 inline-flex items-center justify-center gap-1">
                <UserPlus className="h-4 w-4" /> Follow
              </button>
              <button className="rounded-lg bg-white/5 hover:bg-white/10 text-white/90 text-sm py-2 inline-flex items-center justify-center gap-1">
                <UserMinus className="h-4 w-4" /> Unfollow
              </button>
            </div>
          </aside>

          {/* Canvas placeholder for main content */}
          <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm min-h-[40vh]">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to Darkhosting Social</h1>
            <p className="mt-1 text-white/70 text-sm">Start by choosing a section from the left navigation. We will add Home, Reels, Videos, and Profile views next.</p>
          </section>
        </div>
      </main>
    </div>
  )
}

function SidebarLink({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${active ? 'bg-white/10' : 'hover:bg-white/5'} transition`}>
      <span className="text-white/70">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  )
}
