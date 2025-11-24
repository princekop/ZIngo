'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Hash,
  Volume2,
  Plus,
  ChevronDown,
  ChevronRight,
  Lock,
  Settings,
  Edit,
  Trash2,
  Users,
  MoreHorizontal,
  Hash as HashIcon,
  MessageSquare,
  Megaphone,
  Wifi,
  Circle,
  ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useServer } from './ServerProvider'
import { CreateChannelModal } from './modals/CreateChannelModal'
import { EditChannelModal } from './modals/EditChannelModal'
import { ChannelSettingsModal } from './modals/ChannelSettingsModal'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

const CHANNEL_TYPE_STYLES: Record<string, {
  iconBg: string
  chipBg: string
  chipText: string
  glow: string
  ring: string
}> = {
  text: {
    iconBg: 'bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-transparent',
    chipBg: 'bg-indigo-500/15',
    chipText: 'text-indigo-100',
    glow: 'shadow-[0_20px_45px_-18px_rgba(99,102,241,0.8)]',
    ring: 'ring-indigo-400/50',
  },
  voice: {
    iconBg: 'bg-gradient-to-br from-emerald-500/25 via-cyan-500/15 to-transparent',
    chipBg: 'bg-emerald-500/15',
    chipText: 'text-emerald-100',
    glow: 'shadow-[0_20px_45px_-18px_rgba(16,185,129,0.8)]',
    ring: 'ring-emerald-400/60',
  },
  announcement: {
    iconBg: 'bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-transparent',
    chipBg: 'bg-amber-500/15',
    chipText: 'text-amber-100',
    glow: 'shadow-[0_20px_45px_-18px_rgba(251,191,36,0.75)]',
    ring: 'ring-amber-400/60',
  },
  forum: {
    iconBg: 'bg-gradient-to-br from-fuchsia-500/25 via-purple-500/15 to-transparent',
    chipBg: 'bg-fuchsia-500/15',
    chipText: 'text-fuchsia-100',
    glow: 'shadow-[0_20px_45px_-18px_rgba(217,70,239,0.75)]',
    ring: 'ring-fuchsia-400/60',
  },
  default: {
    iconBg: 'bg-gradient-to-br from-slate-500/20 via-slate-500/10 to-transparent',
    chipBg: 'bg-slate-500/15',
    chipText: 'text-slate-100',
    glow: 'shadow-[0_20px_45px_-18px_rgba(148,163,184,0.7)]',
    ring: 'ring-slate-400/40',
  },
}

interface ChannelPanelProps {
  selectedChannelId: string
  onChannelSelect: (channelId: string) => void
  isMobile: boolean
}

export function ChannelPanel({ selectedChannelId, onChannelSelect, isMobile }: ChannelPanelProps) {
  const { server, categories, currentUser, isLoadingCategories } = useServer()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [showEditChannel, setShowEditChannel] = useState(false)
  const [showChannelSettings, setShowChannelSettings] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [editingChannel, setEditingChannel] = useState<any>(null)
  const [settingsChannel, setSettingsChannel] = useState<any>(null)
  const initialSelectionDoneRef = useRef(false)
  const canManageChannels = useMemo(() => {
    return currentUser?.role === 'owner' || currentUser?.role === 'admin'
  }, [currentUser])

  const totalChannels = useMemo(
    () => categories.reduce((acc, category) => acc + category.channels.length, 0),
    [categories]
  )
  // Auto-expand categories on load and auto-select first channel
  useEffect(() => {
    if (categories.length === 0) return

    const categoryIds = categories.map((category) => category.id)
    setExpandedCategories((prev) => {
      if (prev.size === categoryIds.length && categoryIds.every((id) => prev.has(id))) {
        return prev
      }
      return new Set(categoryIds)
    })

    if (!initialSelectionDoneRef.current && !selectedChannelId) {
      const firstChannel = categories[0]?.channels[0]
      if (firstChannel) {
        onChannelSelect(firstChannel.id)
        setSelectedCategoryId(firstChannel.categoryId)
        initialSelectionDoneRef.current = true
      }
    }
  }, [categories, selectedChannelId, onChannelSelect])

  useEffect(() => {
    const handleShowAll = () => {
      setExpandedCategories(new Set(categories.map((category) => category.id)))
    }

    window.addEventListener('channelSidebar:showAll', handleShowAll)
    return () => {
      window.removeEventListener('channelSidebar:showAll', handleShowAll)
    }
  }, [categories])

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleCreateChannel = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setShowCreateChannel(true)
  }

  const handleEditChannel = (channel: any) => {
    setEditingChannel(channel)
    setShowEditChannel(true)
  }

  const handleChannelSettings = (channel: any) => {
    setSettingsChannel(channel)
    setShowChannelSettings(true)
  }

  const getChannelIcon = (type: string, isPrivate: boolean) => {
    if (isPrivate) return <Lock className="w-4 h-4 text-slate-500" />
    
    switch (type) {
      case 'voice':
        return <Volume2 className="w-4 h-4 text-green-400" />
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-yellow-400" />
      case 'forum':
        return <MessageSquare className="w-4 h-4 text-blue-400" />
      default:
        return <Hash className="w-4 h-4 text-slate-400" />
    }
  }

  if (isLoadingCategories) {
    return (
      <div className="w-full h-full bg-white/5 backdrop-blur-md flex flex-col border-r border-white/10">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0 flex-1">
            <div className="w-11 h-11 bg-white/10 rounded-2xl animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="w-24 h-3.5 bg-white/10 rounded animate-pulse" />
              <div className="w-32 h-2.5 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="w-36 h-3.5 bg-white/10 rounded animate-pulse" />
              <div className="ml-4 space-y-2">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="w-32 h-2.5 bg-white/10 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative flex h-full w-full flex-col border-r border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-white/10/40 backdrop-blur-2xl">
        {/* Server Hero */}
        <div className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF]/40 via-[#2D8AFF]/25 to-transparent" />
          <div className="absolute -top-20 -right-24 h-48 w-48 rounded-full bg-[#8B5CF6]/30 blur-[80px]" />
          <div className="relative z-10 flex flex-col gap-5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-[0_10px_40px_-15px_rgba(108,99,255,0.7)]">
                  {server?.icon ? (
                    <img src={server.icon} alt={server.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-white/80">
                      {(server?.name ?? 'S').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="absolute inset-0 rounded-2xl border border-white/10" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold tracking-tight text-white drop-shadow-sm">
                      {server?.name || 'Server'}
                    </h2>
                    {server?.boostLevel ? (
                      <Badge className="bg-white/15 px-2.5 text-[10px] uppercase tracking-[0.15em] text-white/90">
                        Level {server.boostLevel}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-emerald-300/80" />
                      {server?.memberCount ?? '—'} members
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Wifi className="h-3 w-3 text-sky-300/80" />
                      {server?.onlineCount ?? 0} online
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Hash className="h-3 w-3 text-purple-300/80" />
                      {totalChannels} channels
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Categories and Channels */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-3 p-3">
            {categories.map((category) => {
              const isExpanded = expandedCategories.has(category.id)
              const hasChannels = category.channels.length > 0

              return (
                <div
                  key={category.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_8px_30px_-20px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-white/20 hover:bg-black/20"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#6C63FF]/60 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100" />
                  <div className="relative flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="relative flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 shadow-inner transition hover:border-white/20 hover:text-white"
                      >
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70 transition-transform duration-300',
                            isExpanded ? 'rotate-180' : 'rotate-0',
                          )}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </span>
                        {category.emoji ? (
                          <span className="text-base">{category.emoji}</span>
                        ) : (
                          <Circle className="h-3 w-3 text-white/30" />
                        )}
                        <span className="truncate">
                          {category.name}
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-white/40">
                          {category.channels.length} channels
                        </span>
                      </button>

                      {canManageChannels && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCreateChannel(category.id)}
                                className="h-8 w-8 rounded-full border border-white/10 bg-white/5 p-0 text-white/70 opacity-0 shadow-sm transition duration-200 group-hover:opacity-100 hover:text-white"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Create channel in {category.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="relative flex flex-col gap-2.5 rounded-2xl border border-white/5 bg-white/[0.04] p-2 transition-all">
                        {hasChannels ? (
                          category.channels.map((channel) => {
                            const selected = selectedChannelId === channel.id
                            const isPrivate = channel.isPrivate
                            const icon = getChannelIcon(channel.type, channel.isPrivate)
                            const style = CHANNEL_TYPE_STYLES[channel.type] || CHANNEL_TYPE_STYLES.default

                            return (
                              <ContextMenu key={channel.id}>
                                <ContextMenuTrigger>
                                  <div
                                    className={cn(
                                      'group/channel relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-3xl border border-white/5 bg-black/30 px-4 py-3 transition-all duration-300 ease-out',
                                      selected
                                        ? cn('text-white ring-2', style.ring, style.glow, 'bg-gradient-to-br from-white/10 to-transparent')
                                        : 'text-white/75 hover:text-white hover:border-white/15 hover:bg-white/10'
                                    )}
                                    onClick={() => onChannelSelect(channel.id)}
                                  >
                                    <div className={cn('relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-white', style.iconBg)}>
                                      <span className="absolute inset-0 rounded-2xl bg-white/5" />
                                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-black/30 text-white/90">
                                        {icon}
                                      </span>
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="truncate text-[15px] font-semibold tracking-tight">
                                              {channel.name}
                                            </span>
                                            {isPrivate && (
                                              <Badge className="rounded-full border border-white/10 bg-white/10 px-2 text-[10px] uppercase tracking-[0.16em] text-white/70">
                                                Private
                                              </Badge>
                                            )}
                                            <Badge className={cn('rounded-full border border-white/10 px-2 text-[10px] uppercase tracking-[0.18em]', style.chipBg, style.chipText)}>
                                              {channel.type}
                                            </Badge>
                                          </div>
                                          <p className="truncate text-[11px] text-white/45">
                                            {channel.topic || 'No topic yet — share a channel purpose'}
                                          </p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-white/20 transition group-hover/channel:text-white/60" />
                                      </div>

                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                                        {channel.unread && channel.unread > 0 ? (
                                          <span className="flex items-center gap-1 text-emerald-300/80">
                                            ● {channel.unread} new
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1">
                                            ● Up to date
                                          </span>
                                        )}
                                        <span className="flex items-center gap-1 text-white/30">
                                          <ShieldCheck className="h-3 w-3" />
                                          Secure
                                        </span>
                                      </div>
                                    </div>

                                    {canManageChannels && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover/channel:opacity-100 h-9 w-9 rounded-full border border-white/10 bg-white/5 p-0 text-white/60 transition duration-200 hover:text-white"
                                            onClick={(event) => event.stopPropagation()}
                                          >
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44 border border-white/10 bg-black/90 text-white">
                                          <DropdownMenuItem
                                            onClick={() => handleEditChannel(channel)}
                                            className="cursor-pointer gap-2 text-xs tracking-wide hover:bg-white/10"
                                          >
                                            <Edit className="h-4 w-4" />
                                            Edit Channel
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => handleChannelSettings(channel)}
                                            className="cursor-pointer gap-2 text-xs tracking-wide hover:bg-white/10"
                                          >
                                            <Settings className="h-4 w-4" />
                                            Channel Settings
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator className="bg-white/10" />
                                          <DropdownMenuItem className="cursor-pointer gap-2 text-xs tracking-wide text-rose-400 hover:text-rose-300">
                                            <Trash2 className="h-4 w-4" />
                                            Delete Channel
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-44 border border-white/10 bg-black/90 text-white">
                                  <ContextMenuItem onClick={() => onChannelSelect(channel.id)}>
                                    <Hash className="h-4 w-4" />
                                    Open Channel
                                  </ContextMenuItem>
                                  {canManageChannels && (
                                    <>
                                      <ContextMenuItem onClick={() => handleEditChannel(channel)}>
                                        <Edit className="h-4 w-4" />
                                        Edit Channel
                                      </ContextMenuItem>
                                      <ContextMenuItem onClick={() => handleChannelSettings(channel)}>
                                        <Settings className="h-4 w-4" />
                                        Channel Settings
                                      </ContextMenuItem>
                                      <ContextMenuSeparator className="bg-white/10" />
                                      <ContextMenuItem destructive>
                                        <Trash2 className="h-4 w-4" />
                                        Delete Channel
                                      </ContextMenuItem>
                                    </>
                                  )}
                                </ContextMenuContent>
                              </ContextMenu>
                            )
                          })
                        ) : (
                          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 bg-black/10 py-6 text-center text-xs text-white/40">
                            <Hash className="h-8 w-8 text-white/20" />
                            <span>No channels in this category yet.</span>
                            {canManageChannels && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreateChannel(category.id)}
                                className="rounded-full border-white/20 bg-white/5 text-xs uppercase tracking-[0.18em] text-white/80 hover:text-white"
                              >
                                <Plus className="h-3 w-3" />
                                Add Channel
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

          </div>
        </ScrollArea>
      </div>

      {/* Modals */}
      <CreateChannelModal
        isOpen={showCreateChannel}
        onClose={() => {
          setShowCreateChannel(false)
          setSelectedCategoryId('')
        }}
        categoryId={selectedCategoryId}
      />

      <EditChannelModal
        isOpen={showEditChannel}
        onClose={() => {
          setShowEditChannel(false)
          setEditingChannel(null)
        }}
        channel={editingChannel}
      />

      <ChannelSettingsModal
        isOpen={showChannelSettings}
        onClose={() => {
          setShowChannelSettings(false)
          setSettingsChannel(null)
        }}
        channel={settingsChannel}
      />
    </>
  )
}
