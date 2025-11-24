'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Settings,
  UserPlus,
  Search,
  Zap,
  ChevronDown,
  X,
  Wifi,
  Sparkles,
  Hash
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useServer } from './ServerProvider'
import { InviteModal } from './modals/InviteModal'
import { ServerSettingsModal } from './modals/ServerSettingsModal'
import { toast } from 'sonner'

interface ServerHeaderProps {
  onToggleMembers: () => void
  showMembers: boolean
  isMobile: boolean
}

export function ServerHeader({ onToggleMembers, showMembers, isMobile }: ServerHeaderProps) {
  const router = useRouter()
  const { server, currentUser, leaveServer } = useServer()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const canManageServer = currentUser?.role === 'owner' || currentUser?.role === 'admin'
  const isOwner = currentUser?.role === 'owner'

  const handleLeaveServer = async () => {
    if (currentUser?.role === 'owner') {
      toast.error('Server owners cannot leave their own server')
      return
    }
    
    const success = await leaveServer()
    if (success) {
      router.push('/dash')
    }
  }

  const handleBoostServer = () => {
    router.push(`/server/${server?.id}/boosts`)
  }

  const handleShowAllChannels = () => {
    window.dispatchEvent(new CustomEvent('channelSidebar:showAll'))
  }

  if (!server) {
    return (
      <div className="h-full bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center px-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse" />
          <div className="w-32 h-5 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="h-full bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-3 sm:px-4 md:px-6 relative z-50">
        {/* Left Section - Fully Responsive */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0 flex-1">
          {/* Server Info / Toolbox */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 rounded-xl bg-white/5 bg-opacity-0 px-1 py-1 text-left transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/40">
                <Avatar className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 ring-2 ring-[#6C63FF]/30 border border-white/10 flex-shrink-0">
                  <AvatarImage src={server.icon || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[#6C63FF] via-[#8B5CF6] to-[#00D4FF] text-white font-bold text-sm sm:text-base">
                    {server.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <h1 className="font-semibold text-white text-sm sm:text-base md:text-lg tracking-tight truncate max-w-[120px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[280px] xl:max-w-[320px]">
                      {server.name}
                    </h1>
                    {server.boostLevel && server.boostLevel > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="secondary" className="bg-gradient-to-r from-[#FF3B6E] to-[#8B5CF6] text-white border-0 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 flex-shrink-0">
                              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                              {server.boostLevel}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Boost Level {server.boostLevel}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-[#C9C9D1]">
                    <span className="truncate">{server.memberCount || 0} member{(server.memberCount || 0) !== 1 ? 's' : ''}</span>
                    {server.onlineCount && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-[#4ADE80] truncate hidden sm:inline">{server.onlineCount} online</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={12} className="w-[320px] sm:w-[360px] bg-[#16163A]/95 border border-white/10 p-0 overflow-hidden rounded-2xl">
              <div className="relative">
                <div className="h-24 w-full overflow-hidden bg-gradient-to-r from-[#6C63FF]/40 via-[#2D8AFF]/30 to-transparent">
                  {server.banner ? (
                    <img src={server.banner} alt={`${server.name} banner`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.35),transparent_55%)]" />)
                  }
                </div>
                <div className="absolute -bottom-6 left-4 flex items-center space-x-3">
                  <Avatar className="w-14 h-14 ring-2 ring-[#6C63FF]/40 border border-white/10">
                    <AvatarImage src={server.icon || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-[#6C63FF] via-[#8B5CF6] to-[#00D4FF] text-white font-bold text-lg">
                      {server.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-base font-semibold text-white">{server.name}</div>
                    <div className="text-xs uppercase tracking-[0.22em] text-white/60">Server toolbox</div>
                  </div>
                </div>
              </div>
              <div className="pt-8 pb-3 px-4 text-sm text-white/70 space-y-4">
                {server.description && (
                  <p className="text-xs leading-relaxed text-white/60 line-clamp-2">
                    {server.description}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {[{
                    id: 'members',
                    label: 'Members',
                    value: server.memberCount ?? 0,
                    icon: Users,
                  }, {
                    id: 'online',
                    label: 'Online',
                    value: server.onlineCount ?? 0,
                    icon: Wifi,
                  }, {
                    id: 'boostLevel',
                    label: 'Boost level',
                    value: server.boostLevel ?? 0,
                    icon: Zap,
                  }, {
                    id: 'boosts',
                    label: 'Active boosts',
                    value: server.boosts ?? server.boostLevel ?? 0,
                    icon: Sparkles,
                  }].map((metric) => {
                    const Icon = metric.icon
                    return (
                      <div
                        key={metric.id}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 flex items-center gap-3 shadow-[0_12px_30px_-20px_rgba(108,99,255,0.7)]"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#6C63FF]/20 text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs uppercase tracking-[0.18em] text-white/40">{metric.label}</div>
                          <div className="text-sm font-semibold text-white truncate">{metric.value}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuLabel className="text-[11px] uppercase tracking-[0.2em] text-white/50 px-4 py-2">
                Quick actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/server/${server.id}`)}
                className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <Hash className="h-4 w-4" />
                Open server home
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleShowAllChannels}
                className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <Users className="h-4 w-4" />
                Show all channels
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleBoostServer}
                className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                Server boosts
              </DropdownMenuItem>
              {canManageServer && (
                <DropdownMenuItem
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite people
                </DropdownMenuItem>
              )}
              {canManageServer && (
                <DropdownMenuItem
                  onClick={() => setShowSettingsModal(true)}
                  className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  Server settings
                </DropdownMenuItem>
              )}
              {!isOwner && (
                <>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleLeaveServer}
                    className="flex items-center gap-2 text-[#FF3B6E] hover:text-[#FF3B6E] hover:bg-[#FF3B6E]/10 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    Leave server
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center Section - Responsive Search */}
        <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-2 sm:mx-4 lg:mx-6 hidden md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B6B7A]" />
            <Input
              placeholder="Search messages..."
              className="pl-10 pr-4 bg-white/10 border-white/10 focus:border-[#6C63FF]/40 text-white placeholder:text-[#6B6B7A] rounded-xl h-9 sm:h-10 text-sm transition-all duration-200 focus:bg-white/15 focus:shadow-lg focus:shadow-[#6C63FF]/20"
              onFocus={() => setIsSearching(true)}
              onBlur={() => setIsSearching(false)}
            />
            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#16163A]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl z-50">
                <div className="text-[#C9C9D1] text-sm">Start typing to search messages...</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Responsive Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {/* Action Buttons */}
          <TooltipProvider>
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleMembers}
                    className={`h-9 w-9 p-0 text-[#C9C9D1] hover:text-white hover:bg-[#6C63FF]/20 ${
                      showMembers ? 'bg-[#6C63FF]/20 text-white shadow-[0_0_0_1px_rgba(108,99,255,0.35)]' : ''
                    }`}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showMembers ? 'Hide' : 'Show'} Members</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-[#C9C9D1] hover:text-white hover:bg-[#6C63FF]/20 transition-all duration-200"
                >
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Invite People</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </div>
      </div>

      {/* Modals */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        serverId={server.id}
        serverName={server.name}
      />

      {(currentUser?.role === 'owner' || currentUser?.role === 'admin') && (
        <ServerSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </>
  )
}
