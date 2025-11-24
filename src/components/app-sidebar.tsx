"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconUsers,
  IconWorld,
  IconBrandInstagram,
  IconBolt,
  IconShoppingBag,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Create Server",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Servers",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Discover",
      url: "/discover",
      icon: IconWorld,
    },
    {
      title: "Instagram",
      url: "https://insta.darkbyte.in",
      icon: IconBrandInstagram,
      target: "_blank" as const,
    },
  ],
  navSecondary: [
    {
      title: "Panel Link",
      url: "https://panel.darkbyte.in",
      icon: IconDashboard,
      target: "_blank" as const,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  // Modal/event handlers: dispatch custom events so pages can open their own modals
  const handleCreateServer = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent('openCreateServer'))
  }, [])
  const handleServers = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent('openServersModal'))
  }, [])

  // Inject onClick handlers into navMain for the first two items
  const navMain = React.useMemo(() => {
    const uid = (session?.user as any)?.id
    const base = data.navMain.map((item) => {
      if (item.title === 'Create Server') {
        return { ...item, onClick: handleCreateServer }
      }
      if (item.title === 'Servers') {
        return { ...item, onClick: handleServers }
      }
      // Keep Instagram as external link only
      return item
    })
    // Inject only Boosts link if we have a user id
    if (uid) {
      return [
        ...base.slice(0, 1),
        { title: 'Boosts', url: `/dash/${uid}/boosts`, icon: IconBolt },
        ...base.slice(1),
      ]
    }
    return base
  }, [handleCreateServer, handleServers, session?.user])

  const user = {
    name: (session?.user as any)?.displayName || (session?.user?.name ?? "User"),
    email: session?.user?.email || "",
    avatar: (session?.user as any)?.avatar || "/avatars/shadcn.jpg",
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-white/10 bg-background/95" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2 rounded-lg"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-[15px] font-semibold tracking-tight">Darkhosting</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain as any} />
        <NavSecondary items={data.navSecondary as any} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
