"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { IconDotsVertical } from "@tabler/icons-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import UserProfileModal from "@/components/UserProfileModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  const displayName = (session?.user as any)?.displayName || user.name
  const email = session?.user?.email || user.email
  const avatar = (session?.user as any)?.avatar || user.avatar

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="rounded-xl border border-white/12 bg-background/70 px-2 py-1.5 pr-10 hover:bg-white/5"
            onClick={() => {
              setOpen(true)
            }}
          >
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage src={avatar} alt={displayName} />
              <AvatarFallback className="rounded-lg">U</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate text-[15px] font-semibold tracking-tight">{displayName}</span>
              <span className="text-muted-foreground truncate text-xs">{email}</span>
            </div>
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="absolute right-2 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="User menu"
              >
                <IconDotsVertical className="size-4 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6} className="min-w-[160px]">
              <DropdownMenuItem onClick={() => setOpen(true)}>
                Open Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Optional: add a confirmation later
                  signOut({ callbackUrl: "/" })
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Real profile modal */}
      <UserProfileModal
        isOpen={open}
        onClose={() => setOpen(false)}
        displayName={displayName}
        username={(session?.user as any)?.username || displayName}
        avatarUrl={avatar}
        description={(session?.user as any)?.description || undefined}
        roleName={undefined}
        createdAt={(session?.user as any)?.createdAt || undefined}
        badges={[]}
        roles={[]}
      />
    </>
  )
}
