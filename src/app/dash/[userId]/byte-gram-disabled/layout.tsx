"use client"

import { use } from 'react'
import CardNav from "./CardNav"
import Sidebar from "./Sidebar"
import BottomNav from "./components/BottomNav"

export default function ByteGramLayout({ children, params }: { children: React.ReactNode; params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const items = [
    { label: 'About', bgColor: '#0B1220', textColor: '#e5e7eb', links: [{ label: 'Company' }, { label: 'Careers' }] },
    { label: 'Projects', bgColor: '#0A1626', textColor: '#e5e7eb', links: [{ label: 'Featured' }, { label: 'Case Studies' }] },
    { label: 'Contact', bgColor: '#081A2C', textColor: '#e5e7eb', links: [{ label: 'Email' }, { label: 'Twitter' }] },
  ]
  const base = `/dash/${userId}/byte-gram`
  return (
    <div className="min-h-screen bg-zinc-800 text-white">
      <CardNav
        className="top-6 md:top-8"
        logo="https://i.postimg.cc/RVhGnmWS/34cb00613be09e4-file-0000000070dc61fab1b56c257da7eff8-wm.png"
        logoAlt="Darkhosting"
        items={items as any}
      />
      <main className="min-h-[100vh] pt-28 md:pt-32 bg-gradient-to-br from-black via-zinc-900 to-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          <Sidebar base={base} />
          <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm min-h-[40vh]">
            {children}
          </section>
        </div>
      </main>
      <BottomNav base={base} />
    </div>
  )
}
