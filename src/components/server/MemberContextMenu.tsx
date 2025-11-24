'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AtSign, Eye, UserPlus, UserMinus, Ban, Volume2, VolumeX, Settings, Crown, Shield, Copy, Edit, X, MoreHorizontal, UserCheck } from 'lucide-react'

interface Member {
  id: string
  name: string
  username: string
  avatar: string | null
  status: 'online' | 'idle' | 'dnd' | 'offline'
  role: 'owner' | 'admin' | 'member'
  roleId?: string
  joinedAt: string | Date
  isAdmin: boolean
  avatarDecoration?: string | null
}

interface MemberContextMenuProps {
  isOpen: boolean
  onClose: () => void
  member: Member | null
  onAction: (action: string, member: Member) => void
  userRole?: 'owner' | 'admin' | 'member'
  currentUserId?: string
  x?: number
  y?: number
  isInVoice?: boolean
}

export default function MemberContextMenu({ 
  isOpen, 
  onClose, 
  member, 
  onAction, 
  userRole = 'member',
  currentUserId,
  x = 0,
  y = 0,
  isInVoice = false,
}: MemberContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    // Suppress native browser context menu while our menu is open
    const blockNativeContextMenu = (e: Event) => {
      e.preventDefault()
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('contextmenu', blockNativeContextMenu, { capture: true })
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('contextmenu', blockNativeContextMenu, { capture: true } as any)
    }
  }, [isOpen, onClose])

  const handleAction = (action: string) => {
    if (member) {
      onAction(action, member)
    }
    onClose()
  }

  if (!isOpen || !member) return null

  const isOwner = userRole === 'owner'
  const isAdmin = userRole === 'admin' || isOwner

  // Do not compute anything else if closed or missing member
  if (!isOpen || !member) return null

  const isSelf = currentUserId && member && currentUserId === member.id
  const canManage = isAdmin && !isSelf && member.role !== 'owner'

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'online': return 'bg-emerald-500'
      case 'idle': return 'bg-amber-500'
      case 'dnd': return 'bg-rose-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleInfo = (role: Member['role']) => {
    switch (role) {
      case 'owner': return { name: 'Server Owner', color: 'text-yellow-400', icon: Crown }
      case 'admin': return { name: 'Administrator', color: 'text-blue-400', icon: Shield }
      default: return { name: 'Member', color: 'text-gray-400', icon: null }
    }
  }

  const roleInfo = getRoleInfo(member.role)

  // Quick Actions (Always visible)
  const quickActions = [
    { icon: AtSign, label: 'Mention', action: 'mention', color: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300' },
    { icon: Eye, label: 'Profile', action: 'view_profile', color: 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300' }
  ]

  // User Actions
  const userActions = [
    { icon: Copy, label: 'Copy ID', action: 'copy_user_id', show: true },
    { icon: Copy, label: 'Copy Username', action: 'copy_username', show: true }
  ].filter(item => item.show)

  // Admin Actions
  const adminActions = canManage ? [
    { icon: Edit, label: 'Change Nickname', action: 'edit_nickname' },
    { icon: UserPlus, label: 'Manage Roles', action: 'edit_roles' },
    { icon: Settings, label: 'Member Settings', action: 'member_settings' }
  ] : []

  // Voice Actions (only if target is actually in a voice channel)
  const voiceActions = (canManage && isInVoice) ? [
    { icon: VolumeX, label: 'Mute in Voice', action: 'voice_mute' },
    { icon: Volume2, label: 'Deafen in Voice', action: 'voice_deafen' },
    { icon: MoreHorizontal, label: 'Move to Channel', action: 'move_voice' }
  ] : []

  // Moderation Actions
  const moderationActions = canManage ? [
    { icon: Ban, label: 'Timeout', action: 'timeout', danger: true },
    { icon: UserMinus, label: 'Kick', action: 'kick', danger: true },
    { icon: Ban, label: 'Ban', action: 'ban', danger: true }
  ] : []

  const compact = (
    <>
      {/* Backdrop to capture outside clicks */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        ref={menuRef}
        className="fixed z-[9999] bg-black/95 backdrop-blur-xl border border-white/15 rounded-lg shadow-2xl min-w-[220px] max-w-[90vw] p-1"
        style={{ left: Math.max(8, Math.min(x, (typeof window!=='undefined'?window.innerWidth:1000) - 240)), top: Math.max(8, Math.min(y, (typeof window!=='undefined'?window.innerHeight:800) - 300)) }}
      >
        {/* Header (compact) */}
        <div className="px-2 py-2 flex items-center gap-2 border-b border-white/10">
          {member.avatar && member.avatar.trim() !== '' ? (
            <img src={member.avatar} alt={member.name} className="h-7 w-7 rounded-md object-cover" />
          ) : (
            <div className="h-7 w-7 rounded-md bg-white/10 text-white/80 flex items-center justify-center text-xs font-medium">
              {member.name?.trim()?.slice(0,1)?.toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm text-white truncate flex items-center gap-1">
              <span className="font-medium truncate">{member.name}</span>
              {roleInfo.icon && <roleInfo.icon className={`h-3 w-3 ${roleInfo.color}`} />}
            </div>
            <div className="text-[11px] text-white/60 truncate">@{member.username}</div>
          </div>
        </div>

        {/* Sections */}
        <div className="py-1">
          {/* Quick */}
          {[
            ...quickActions,
          ].map((item, i) => (
            <button key={`q-${i}`} onClick={() => handleAction(item.action)} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-white/90 hover:bg-white/10 rounded-md">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}

          {userActions.length>0 && <div className="h-px bg-white/10 my-1" />}
          {userActions.map((item, i) => (
            <button key={`u-${i}`} onClick={() => handleAction(item.action)} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-white/90 hover:bg-white/10 rounded-md">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}

          {adminActions.length>0 && <div className="h-px bg-white/10 my-1" />}
          {adminActions.map((item, i) => (
            <button key={`a-${i}`} onClick={() => handleAction(item.action)} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-blue-300 hover:bg-blue-500/10 rounded-md">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}

          {voiceActions.length>0 && <div className="h-px bg-white/10 my-1" />}
          {voiceActions.map((item, i) => (
            <button key={`v-${i}`} onClick={() => handleAction(item.action)} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-purple-300 hover:bg-purple-500/10 rounded-md">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}

          {moderationActions.length>0 && <div className="h-px bg-white/10 my-1" />}
          {moderationActions.map((item, i) => (
            <button key={`m-${i}`} onClick={() => handleAction(item.action)} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-300 hover:bg-red-500/10 rounded-md">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )

  if (typeof window === 'undefined') return null
  return createPortal(compact, document.body)
}
