'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton 
} from '@/components/ui/sidebar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ServerHeader } from './ServerHeader'
import { ChannelPanel } from './ChannelPanel'
import { ChatPanel } from './ChatPanel'
import { MembersPanel } from './MembersPanel'
import { ServerProvider } from './ServerProvider'
import { cn } from '@/lib/utils'

interface ServerLayoutProps {
  params: Promise<{ serverId: string }>
}

export function ModernServerLayout({ params }: ServerLayoutProps) {
  const { serverId } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedChannelId, setSelectedChannelId] = useState<string>('')
  const [showMembers, setShowMembers] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [viewportWidth, setViewportWidth] = useState<number>(1440)

  // Enhanced viewport detection
  useEffect(() => {
    const updateViewport = () => {
      if (typeof window === 'undefined') return
      const width = window.innerWidth
      const height = window.innerHeight
      setViewportWidth(width)
      
      // Enhanced breakpoints for perfect responsiveness
      const mobile = width < 768
      const tablet = width >= 768 && width < 1024
      const desktop = width >= 1024 && width < 1440
      const largeDesktop = width >= 1440 && width < 1920
      const ultraWide = width >= 1920
      
      setIsMobile(mobile)
      
      // Auto-hide members panel on smaller screens for better space utilization
      if (mobile || (tablet && height < 800)) {
        setShowMembers(false)
      } else if (desktop && !showMembers) {
        setShowMembers(true)
      }
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [showMembers])

    if (status === 'loading') {
      return (
        <div className="h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] flex items-center justify-center text-white/70">
          Loading server…
        </div>
      )
    }

    if (!session) {
      return (
        <div className="h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] flex items-center justify-center text-white/70">
          Signing you in…
        </div>
      )
    }

  // Perfect responsive calculations based on viewport
  const mobile = viewportWidth < 768
  const tablet = viewportWidth >= 768 && viewportWidth < 1024
  const desktop = viewportWidth >= 1024 && viewportWidth < 1440
  const largeDesktop = viewportWidth >= 1440 && viewportWidth < 1920
  const ultraWide = viewportWidth >= 1920

  // Dynamic header height based on screen size
  const headerHeight = mobile ? 56 : tablet ? 58 : desktop ? 60 : 64

  // Simple auto-sizing - let flex handle the layout
  const showMembersPanel = showMembers && !mobile && !tablet
  return (
    <ServerProvider serverId={serverId}>
      <div className="h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-48 -right-40 w-[520px] h-[520px] rounded-full blur-[220px] bg-[#6C63FF]/15 animate-pulse"
            style={{ animationDuration: '6s' }}
          />
          <div
            className="absolute -bottom-48 -left-40 w-[520px] h-[520px] rounded-full blur-[220px] bg-[#8B5CF6]/15 animate-pulse"
            style={{ animationDuration: '7s', animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full blur-[260px] bg-gradient-to-r from-[#00D4FF]/10 to-[#6C63FF]/10 animate-pulse"
            style={{ animationDuration: '8s', animationDelay: '0.5s' }}
          />
        </div>

        <SidebarProvider defaultOpen={!isMobile}>
          <div className="flex h-screen w-full relative z-10" style={{ fontFamily: 'Inter, Roboto, sans-serif' }}>
            {/* Server Header */}
            <div
              className="absolute top-0 left-0 right-0 z-50"
              style={{ height: headerHeight }}
            >
              <ServerHeader 
                onToggleMembers={() => setShowMembers(!showMembers)}
                showMembers={showMembers}
                isMobile={isMobile}
              />
            </div>

            {/* Main Layout - Auto-sizing Flex */}
            <div className="flex h-full w-full" style={{ paddingTop: headerHeight }}>
              {/* Channels Sidebar */}
              <div
                className={cn(
                  "flex-shrink-0 transition-all duration-300",
                  isMobile
                    ? "absolute left-0 top-0 bottom-0 z-40 w-full bg-[#0A0A1F]/95 backdrop-blur-md"
                    : "w-60 sm:w-64 md:w-72 lg:w-80 bg-white/5 backdrop-blur-md border-r border-white/10"
                )}
              >
                <ChannelPanel
                  selectedChannelId={selectedChannelId}
                  onChannelSelect={setSelectedChannelId}
                  isMobile={isMobile}
                />
              </div>

              {/* Chat Area - Auto-fills remaining space */}
              <div className="flex-1 bg-white/5 backdrop-blur-md">
                <ChatPanel
                  channelId={selectedChannelId}
                  isMobile={isMobile}
                />
              </div>

              {/* Members Panel - Fixed width when shown */}
              {showMembersPanel && (
                <div className="flex-shrink-0 w-64 sm:w-72 md:w-80 bg-white/5 backdrop-blur-md border-l border-white/10">
                  <MembersPanel />
                </div>
              )}
            </div>
          </div>
        </SidebarProvider>
      </div>
    </ServerProvider>
  )
}
