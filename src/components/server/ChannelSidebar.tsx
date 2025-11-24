'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Hash, Volume2, Plus, Settings, ChevronDown, ChevronRight, Lock, Mic, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ContextMenu from './ContextMenu'
import PermissionsModal from './modals/PermissionsModal'
import ChannelCustomizationModal from './modals/ChannelCustomizationModal'
import ServerChannelHeader from './ServerChannelHeader'

interface Channel {
  id: string
  name: string
  type: 'text' | 'voice' | 'announcement'
  categoryId: string
  unread: number
  isPrivate: boolean
  isMuted?: boolean
  serverId?: string
}

interface Category {
  id: string
  name: string
  emoji?: string
  channels: Channel[]
}

interface ChannelSidebarProps {
  categories: Category[]
  selectedChannel: string
  onChannelSelect: (channelId: string) => void
  onCreateChannel: (categoryId: string) => void
  width: number
  onResize: (width: number) => void
  isMobile: boolean
  isOpen: boolean
  onClose: () => void
  userRole?: 'owner' | 'admin' | 'member'
  roles?: Array<{
    id: string
    name: string
    color?: string
    position: number
    permissions: Record<string, boolean | null>
  }>
  server?: {
    id: string
    name: string
    icon?: string
    banner?: string
    tag?: string
    boostLevel?: number
  }
  onInvite?: () => void
  onSettings?: () => void
  onLeave?: () => void
  onBoost?: () => void
}

export default function ChannelSidebar({
  categories,
  selectedChannel,
  onChannelSelect,
  onCreateChannel,
  width,
  isMobile,
  isOpen,
  onClose,
  userRole = 'member',
  roles = [],
  server,
  onInvite = () => {},
  onSettings = () => {},
  onLeave = () => {},
  onBoost = () => {}
}: ChannelSidebarProps) {
  const { data: session } = useSession()
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  // Local per-channel UI overrides without mutating props
  const [channelOverrides, setChannelOverrides] = useState<Record<string, {
    isMuted?: boolean
    isPrivate?: boolean
    unread?: number
    name?: string
    deleted?: boolean
    description?: string
    slowMode?: number
    backgroundColor?: string
    backgroundImage?: string
    backgroundVideo?: string
    textColor?: string
    fontFamily?: string
    fontSize?: number
    customCSS?: string
  }>>({})
  // Local per-category overrides (rename, delete)
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, { name?: string; deleted?: boolean }>>({})
  const serverId = server?.id || ''

  // Load overrides from API per server (fallback to localStorage if API fails)
  useEffect(() => {
    try {
      if (!serverId) return
      ;(async () => {
        try {
          const [chRes, catRes] = await Promise.all([
            fetch(`/api/servers/${serverId}/channels/overrides`, { cache: 'no-store' }),
            fetch(`/api/servers/${serverId}/categories/overrides`, { cache: 'no-store' }),
          ])
          if (chRes.ok) setChannelOverrides(await chRes.json())
          if (catRes.ok) setCategoryOverrides(await catRes.json())
        } catch {
          // Fallback to localStorage if offline
          const raw = localStorage.getItem(`db:chan:${serverId}`)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed && typeof parsed === 'object') setChannelOverrides(parsed)
          } else {
            setChannelOverrides({})
          }
          const catRaw = localStorage.getItem(`db:cat:${serverId}`)
          if (catRaw) {
            const parsed = JSON.parse(catRaw)
            if (parsed && typeof parsed === 'object') setCategoryOverrides(parsed)
          } else {
            setCategoryOverrides({})
          }
        }
      })()
    } catch {}
  }, [serverId])

  // Persist overrides locally as cache (non-authoritative)
  useEffect(() => {
    try {
      if (!serverId) return
      localStorage.setItem(`db:chan:${serverId}`, JSON.stringify(channelOverrides))
      localStorage.setItem(`db:cat:${serverId}`, JSON.stringify(categoryOverrides))
    } catch {}
  }, [channelOverrides, categoryOverrides, serverId])

  // Merge base channel with overrides for accurate UI/menus
  const withOverrides = (channel: Channel): Channel => {
    const o = channelOverrides[channel.id] || {}
    return {
      ...channel,
      isPrivate: o.isPrivate ?? channel.isPrivate,
      isMuted: o.isMuted ?? channel.isMuted,
      unread: o.unread ?? channel.unread,
      name: o.name ?? channel.name,
      // pass through extended customization fields for downstream consumers
      ...(o.description !== undefined ? { description: o.description as any } : {}),
      ...(o.slowMode !== undefined ? { slowMode: o.slowMode as any } : {}),
      ...(o.backgroundColor !== undefined ? { backgroundColor: o.backgroundColor as any } : {}),
      ...(o.backgroundImage !== undefined ? { backgroundImage: o.backgroundImage as any } : {}),
      ...(o.textColor !== undefined ? { textColor: o.textColor as any } : {}),
      ...(o.fontFamily !== undefined ? { fontFamily: o.fontFamily as any } : {}),
      ...(o.fontSize !== undefined ? { fontSize: o.fontSize as any } : {}),
      ...(o.customCSS !== undefined ? { customCSS: o.customCSS as any } : {}),
    }
  }

  // Compute inline style for a channel tile (avoid background shorthand to prevent React warnings)
  const channelTileStyle = (ch: any): React.CSSProperties => {
    const bgColor = ch?.backgroundColor
    const bgImg = ch?.backgroundImage
    const style: React.CSSProperties = {}
    // gradients must go to backgroundImage; solid colors to backgroundColor
    if (typeof bgColor === 'string' && /^\s*linear-gradient\(/i.test(bgColor)) {
      style.backgroundImage = bgColor
    } else if (!bgImg && bgColor) {
      style.backgroundColor = bgColor
    }
    if (bgImg) {
      style.backgroundImage = `url(${bgImg})`
      style.backgroundSize = 'cover'
      style.backgroundPosition = 'center'
    }
    if (ch?.textColor) {
      style.color = ch.textColor
    }
    return style
  }

  // Filter out deleted channels in UI
  const filteredCategories: Category[] = useMemo(() => {
    const hidePrivateAdminOnly = (ch: Channel) => {
      // Hide special fallback channel for non-admins
      if (ch.isPrivate && (ch.name === 'welcome-prince') && (userRole !== 'owner' && userRole !== 'admin')) return true
      return false
    }
    return categories
      .filter(cat => !(categoryOverrides[cat.id]?.deleted))
      .map(cat => ({
        ...cat,
        name: categoryOverrides[cat.id]?.name ?? cat.name,
        channels: cat.channels.filter(ch => !(channelOverrides[ch.id]?.deleted) && !hidePrivateAdminOnly(ch))
      }))
  }, [categories, channelOverrides, categoryOverrides, userRole])
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean
    x: number
    y: number
    type: 'category' | 'channel'
    target: any
  }>({ isOpen: false, x: 0, y: 0, type: 'category', target: null })
  const [permissionsModal, setPermissionsModal] = useState<{
    isOpen: boolean
    type: 'category' | 'channel'
    target: any
  }>({ isOpen: false, type: 'category', target: null })
  const [customizationModal, setCustomizationModal] = useState<{
    isOpen: boolean
    channel: any
  }>({ isOpen: false, channel: null })
  const [renameModal, setRenameModal] = useState<{
    isOpen: boolean
    type: 'category' | 'channel'
    target: any
    name: string
  }>({ isOpen: false, type: 'category', target: null, name: '' })
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: 'category' | 'channel'
    target: any
  }>({ isOpen: false, type: 'category', target: null })

  const toggleCategory = (categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories)
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId)
    } else {
      newCollapsed.add(categoryId)
    }
    setCollapsedCategories(newCollapsed)
  }

  const getChannelIcon = (channel: Channel) => {
    switch (channel.type) {
      case 'voice':
        return <Volume2 className="h-4 w-4" />
      case 'announcement':
        return <Hash className="h-4 w-4 text-amber-400" />
      default:
        return <Hash className="h-4 w-4" />
    }
  }

  const handleContextMenu = (e: React.MouseEvent, type: 'category' | 'channel', target: any) => {
    e.preventDefault()
    const effectiveTarget = type === 'channel' ? withOverrides(target as Channel) : target
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type,
      target: effectiveTarget
    })
  }

  const handleContextAction = (action: string, target: any) => {
    switch (action) {
      case 'edit_category': {
        const initial = categoryOverrides[target.id]?.name ?? target.name ?? ''
        setRenameModal({ isOpen: true, type: 'category', target, name: initial })
        break
      }
      case 'delete_category': {
        setConfirmModal({ isOpen: true, type: 'category', target })
        break
      }
      case 'edit_permissions':
        setPermissionsModal({
          isOpen: true,
          type: contextMenu.type,
          target
        })
        break
      case 'edit_channel':
        setRenameModal({
          isOpen: true,
          type: 'channel',
          target,
          name: (channelOverrides[target.id]?.name ?? target.name ?? '')
        })
        break
      case 'customize_channel':
        setCustomizationModal({
          isOpen: true,
          channel: target
        })
        break
      case 'create_channel':
        onCreateChannel(target.id)
        break
      case 'copy_id':
        navigator.clipboard.writeText(target.id)
        break
      case 'copy_link': {
        const srv = server?.id || target.serverId || 'server'
        const url = `${window.location.origin}/server/${srv}/${target.id}`
        navigator.clipboard.writeText(url)
        break
      }
      case 'join_voice':
        if (target.type === 'voice') {
          onChannelSelect(target.id)
        }
        break
      case 'mark_read':
        setChannelOverrides(prev => ({
          ...prev,
          [target.id]: { ...(prev[target.id] || {}), unread: 0 }
        }))
        fetch(`/api/servers/${serverId}/channels/overrides`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId: target.id, patch: { unread: 0 } })
        }).catch(()=>{})
        break
      case 'mute_channel':
        setChannelOverrides(prev => ({
          ...prev,
          [target.id]: { ...(prev[target.id] || {}), isMuted: !(prev[target.id]?.isMuted ?? target.isMuted ?? false) }
        }))
        fetch(`/api/servers/${serverId}/channels/overrides`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId: target.id, patch: { isMuted: !(channelOverrides[target.id]?.isMuted ?? target.isMuted ?? false) } })
        }).catch(()=>{})
        break
      case 'toggle_private':
        setChannelOverrides(prev => ({
          ...prev,
          [target.id]: { ...(prev[target.id] || {}), isPrivate: !(prev[target.id]?.isPrivate ?? target.isPrivate ?? false) }
        }))
        fetch(`/api/servers/${serverId}/channels/overrides`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId: target.id, patch: { isPrivate: !(channelOverrides[target.id]?.isPrivate ?? target.isPrivate ?? false) } })
        }).catch(()=>{})
        break
      case 'channel_settings':
        setCustomizationModal({ isOpen: true, channel: target })
        break
      case 'create_invite': {
        // Create via API and copy returned URL
        (async () => {
          try {
            const res = await fetch(`/api/servers/${serverId}/invites`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ channelId: target.id })
            })
            if (!res.ok) return
            const data = await res.json()
            const url = `${window.location.origin}/invite/${data.code}`
            await navigator.clipboard.writeText(url)
          } catch {}
        })()
        break
      }
      case 'delete_channel': {
        // Soft-delete (hide in UI), preserve in overrides
        if (target?.name === 'welcome-prince') {
          alert('This channel cannot be deleted.')
          break
        }
        setConfirmModal({ isOpen: true, type: 'channel', target })
        break
      }
      case 'create_category': {
        const next = prompt('New category name', 'General')?.trim()
        if (next) {
          ;(async () => {
            try {
              const res = await fetch(`/api/servers/${serverId}/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: next }) })
              if (res.ok) {
                try { window.dispatchEvent(new CustomEvent('server:categoriesUpdated', { detail: { serverId } })) } catch {}
              }
            } catch {}
          })()
        }
        break
      }
      default:
        console.log(`Action ${action} not implemented yet`)
    }
  }

  const handleRenameSubmit = () => {
    if (!renameModal.target) {
      setRenameModal(prev => ({ ...prev, isOpen: false, target: null, name: '' }))
      return
    }

    const trimmed = renameModal.name.trim()
    if (!trimmed) {
      setRenameModal(prev => ({ ...prev, isOpen: false, target: null, name: '' }))
      return
    }

    if (renameModal.type === 'category') {
      setCategoryOverrides(prev => ({
        ...prev,
        [renameModal.target.id]: { ...(prev[renameModal.target.id] || {}), name: trimmed }
      }))
      fetch(`/api/servers/${serverId}/categories/overrides`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: renameModal.target.id, patch: { name: trimmed } })
      }).catch(() => {})
    } else {
      setChannelOverrides(prev => ({
        ...prev,
        [renameModal.target.id]: { ...(prev[renameModal.target.id] || {}), name: trimmed }
      }))
      fetch(`/api/servers/${serverId}/channels/overrides`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: renameModal.target.id, patch: { name: trimmed } })
      }).catch(() => {})
    }

    setRenameModal(prev => ({ ...prev, isOpen: false, target: null, name: '' }))
  }

  const handleConfirmDelete = () => {
    if (!confirmModal.target) {
      setConfirmModal(prev => ({ ...prev, isOpen: false, target: null }))
      return
    }

    if (confirmModal.type === 'category') {
      setCategoryOverrides(prev => ({
        ...prev,
        [confirmModal.target.id]: { ...(prev[confirmModal.target.id] || {}), deleted: true }
      }))
      fetch(`/api/servers/${serverId}/categories/overrides`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: confirmModal.target.id, patch: { deleted: true } })
      }).catch(() => {})
    } else {
      setChannelOverrides(prev => ({
        ...prev,
        [confirmModal.target.id]: { ...(prev[confirmModal.target.id] || {}), unread: 0, isMuted: true, deleted: true }
      }))
      fetch(`/api/servers/${serverId}/channels/overrides`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: confirmModal.target.id, patch: { deleted: true, unread: 0, isMuted: true } })
      }).catch(() => {})
    }

    setConfirmModal(prev => ({ ...prev, isOpen: false, target: null }))
  }

  const handlePermissionsSave = (permissions: Record<string, Record<string, boolean | null>>) => {
    try {
      if (!serverId) return
      const key = `db:perms:${serverId}`
      localStorage.setItem(key, JSON.stringify(permissions))
    } catch {}
  }

  return (
    <div 
      className={`channel-sidebar bg-black/40 backdrop-blur-xl border-r border-white/20 flex flex-col min-w-0 overflow-y-auto 
      ${isMobile ? `fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] transform transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'}` : 'relative'}`}
      style={{ width: isMobile ? undefined : `${width}px` }}
    >
      {/* Server Header */}
      <ServerChannelHeader
        server={server || null}
        userRole={userRole}
        onInvite={onInvite}
        onSettings={onSettings}
        onLeave={onLeave}
        onBoost={onBoost}
      />

      {/* Mobile close button */}
      {isMobile && (
        <div className="flex justify-end p-4">
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Categories and Channels */}
      <div
        className="flex-1 p-3 space-y-4"
        onContextMenu={(e) => {
          // Right-click blank area -> create category quick action
          // Ignore if clicking on a category/channel tile (they have their own handlers)
          const target = e.target as HTMLElement
          if (target.closest('[data-category-row]') || target.closest('[data-channel-row]')) return
          e.preventDefault()
          handleContextAction('create_category', { serverId })
        }}
      >
        {filteredCategories.map((category) => {
          const isCollapsed = collapsedCategories.has(category.id)
          
          return (
            <div key={category.id} className="space-y-1">
              {/* Category Header */}
              <div 
                className="group flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded-lg transition"
                onContextMenu={(e) => handleContextMenu(e, 'category', category)}
                data-category-row
              >
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70 hover:text-white/90 transition"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {category.emoji && <span>{category.emoji}</span>}
                  <span>{category.name}</span>
                </button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-white/10"
                  onClick={() => onCreateChannel(category.id)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Channels */}
              {!isCollapsed && (
                <div className="space-y-0.5 ml-4">
                  {category.channels.map((rawChannel) => {
                    const channel = withOverrides(rawChannel)
                    return (
                    <div
                      key={channel.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onChannelSelect(channel.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChannelSelect(channel.id) }}
                      onContextMenu={(e) => handleContextMenu(e, 'channel', channel)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition group border ${
                        selectedChannel === channel.id
                          ? 'border-teal-400/30'
                          : 'border-transparent'
                      }`}
                      style={channelTileStyle(channel)}
                      data-channel-row
                    >
                      {getChannelIcon(channel)}
                      <span className="truncate flex-1 text-left" style={{ color: (channel as any)?.textColor || undefined }}>{channel.name}</span>
                      
                      {channel.isPrivate && (
                        <Lock className="h-3 w-3 text-white/40" />
                      )}
                      
                      {channel.unread > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {channel.unread > 99 ? '99+' : channel.unread}
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-white/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCustomizationModal({ isOpen: true, channel })
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* User Panel (real session, banner + decoration + status menu) */}
      <div className="p-3 border-t border-white/10 bg-black/30">
        {(() => {
          const u: any = session?.user || {}
          const displayName = u.displayName || u.name || 'User'
          const avatar = u.avatar || '/avatars/shadcn.jpg'
          const banner = u.banner || ''
          const deco = u.avatarDecoration || ''
          const [status, setStatus] = ((): [string, (s: string) => void] => {
            const [s, setS] = useState<string>('online')
            useEffect(() => {
              let cancel = false
              ;(async () => {
                try {
                  const res = await fetch('/api/user/status', { cache: 'no-store' })
                  const j = await res.json()
                  if (!cancel && typeof j?.status === 'string') setS(j.status)
                } catch {}
              })()
              return () => { cancel = true }
            }, [])
            return [s, setS]
          })()

          const statusColor: Record<string, string> = {
            online: 'bg-emerald-500',
            idle: 'bg-amber-400',
            dnd: 'bg-red-500',
            invisible: 'bg-gray-400',
          }

          const setRemoteStatus = async (next: string) => {
            try {
              setStatus(next)
              await fetch('/api/user/status', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
            } catch {}
          }

          return (
            <div className="relative rounded-xl overflow-hidden border border-white/10">
              {banner && (
                <div className="absolute inset-0 opacity-20">
                  <img src={banner} alt="banner" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="relative z-10 flex items-center gap-3 p-2">
                <div className="relative">
                  <img src={avatar} alt={displayName} className="h-9 w-9 rounded-lg object-cover" />
                  {deco && (
                    <img src={deco} alt="deco" className="absolute -inset-1 pointer-events-none" />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-black/80 flex items-center justify-center overflow-hidden">
                        <span className={`h-2.5 w-2.5 rounded-full ${statusColor[status] || 'bg-emerald-500'}`} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[160px]">
                      <DropdownMenuItem onClick={() => setRemoteStatus('online')}>Online</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRemoteStatus('idle')}>Idle</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRemoteStatus('dnd')}>Do Not Disturb</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRemoteStatus('invisible')}>Invisible</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{displayName}</div>
                  <div className="text-[11px] text-white/70 capitalize truncate">{status}</div>
                </div>

                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10" title="Toggle Mute">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10" title="Output">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10" title="User Settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        type={contextMenu.type}
        target={contextMenu.target}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        onAction={handleContextAction}
        userRole={userRole}
      />

      {/* Permissions Modal */}
      <PermissionsModal
        isOpen={permissionsModal.isOpen}
        onClose={() => setPermissionsModal(prev => ({ ...prev, isOpen: false }))}
        type={permissionsModal.type}
        target={permissionsModal.target || { id: '', name: '' }}
        roles={roles}
        onSave={handlePermissionsSave}
      />

      {/* Channel Customization Modal */}
      <ChannelCustomizationModal
        isOpen={customizationModal.isOpen}
        onClose={() => setCustomizationModal(prev => ({ ...prev, isOpen: false }))}
        channel={customizationModal.channel || { id: '', name: '', type: 'text', isPrivate: false }}
        userRole={userRole}
        onSave={(channelData) => {
          // Persist all customization fields to overrides
          setChannelOverrides(prev => ({
            ...prev,
            [channelData.id]: {
              ...(prev[channelData.id] || {}),
              name: channelData.name ?? prev[channelData.id]?.name,
              isPrivate: channelData.isPrivate ?? prev[channelData.id]?.isPrivate,
              description: channelData.description ?? prev[channelData.id]?.description,
              slowMode: channelData.slowMode ?? prev[channelData.id]?.slowMode,
              backgroundColor: channelData.backgroundColor ?? prev[channelData.id]?.backgroundColor,
              backgroundImage: channelData.backgroundImage ?? prev[channelData.id]?.backgroundImage,
              backgroundVideo: channelData.backgroundVideo ?? prev[channelData.id]?.backgroundVideo,
              textColor: channelData.textColor ?? prev[channelData.id]?.textColor,
              fontFamily: channelData.fontFamily ?? prev[channelData.id]?.fontFamily,
              fontSize: channelData.fontSize ?? prev[channelData.id]?.fontSize,
              customCSS: channelData.customCSS ?? prev[channelData.id]?.customCSS,
            }
          }))
          // Persist to API for DB-like storage
          try {
            fetch(`/api/servers/${serverId}/channels/overrides`, {
              method: 'PATCH', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ channelId: channelData.id, patch: {
                name: channelData.name,
                isPrivate: channelData.isPrivate,
                description: channelData.description,
                slowMode: channelData.slowMode,
                backgroundColor: channelData.backgroundColor,
                backgroundImage: channelData.backgroundImage,
                backgroundVideo: channelData.backgroundVideo,
                textColor: channelData.textColor,
                fontFamily: channelData.fontFamily,
                fontSize: channelData.fontSize,
                customCSS: channelData.customCSS,
              }})
            }).catch(()=>{})
            // announce to refresh active chat styles immediately
            try {
              window.dispatchEvent(new CustomEvent('channel:styleUpdated', { detail: { serverId, channelId: channelData.id } }))
            } catch {}
          } catch {}
          setCustomizationModal(prev => ({ ...prev, isOpen: false }))
        }}
      />

      <Dialog
        open={renameModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRenameModal(prev => ({ ...prev, isOpen: false, target: null, name: '' }))
          } else {
            setRenameModal(prev => ({ ...prev, isOpen: true }))
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {renameModal.type === 'category' ? 'Rename Category' : 'Rename Channel'}
            </DialogTitle>
            <DialogDescription>
              Give it a fresh name that matches your server style.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="rename-input">Name</Label>
              <Input
                id="rename-input"
                value={renameModal.name}
                autoFocus
                onChange={(event) => setRenameModal(prev => ({ ...prev, name: event.target.value }))}
                placeholder={renameModal.type === 'category' ? 'Category name' : 'Channel name'}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleRenameSubmit()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setRenameModal(prev => ({ ...prev, isOpen: false, target: null, name: '' }))}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmModal(prev => ({ ...prev, isOpen: false, target: null }))
          } else {
            setConfirmModal(prev => ({ ...prev, isOpen: true }))
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmModal.type === 'category' ? 'Delete Category' : 'Delete Channel'}
            </DialogTitle>
            <DialogDescription>
              {confirmModal.type === 'category'
                ? 'This will hide the category and all of its channels locally. You can restore it later from overrides.'
                : 'This hides the channel locally and mutes it. Restore from overrides to bring it back.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false, target: null }))}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
