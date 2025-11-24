"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Plus, Compass, Search } from "lucide-react"

export function SiteHeader() {
  const openCreate = () => {
    window.dispatchEvent(new Event('openCreateServer'))
  }

  return (
    <header className="sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center border-b bg-background/80 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-semibold tracking-tight">Dashboard</h1>

        {/* Search */}
        <div className="relative ml-2 hidden min-w-[220px] flex-1 items-center sm:flex">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            className="w-full rounded-xl border-white/15 bg-background/60 pl-9"
          />
        </div>

        {/* Quick actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            className="hidden sm:inline-flex rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/30"
            onClick={openCreate}
          >
            <Plus className="mr-1 h-4 w-4" /> Create
          </Button>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="rounded-xl border-white/20 bg-background/60 hover:bg-background/80"
          >
            <Link href="/discover"><Compass className="mr-1 h-4 w-4" /> Discover</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
