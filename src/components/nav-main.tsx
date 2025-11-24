"use client"

import type { Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    target?: string
    onClick?: () => void
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.onClick ? (
                <SidebarMenuButton tooltip={item.title} onClick={item.onClick}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton tooltip={item.title} asChild>
                  <a href={item.url} target={item.target} rel={item.target === "_blank" ? "noopener noreferrer" : undefined}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
