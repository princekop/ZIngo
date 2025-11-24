'use client'

import { useState, useEffect } from 'react'
import { Search, Crown, Shield, MoreHorizontal, X, AtSign, UserPlus, UserMinus, Ban, Volume2, VolumeX, Settings, Eye, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Avatar from '@/components/Avatar'
import ResizeHandle from './ResizeHandle'
import MemberContextMenu from './MemberContextMenu'
import MemberManagementModal from './MemberManagementModal'

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

interface Role {
  id: string
  name: string
  color?: string
}

interface MembersSidebarProps {
  members: Member[]
  roles: Role[]
  width: number
  onResize: (width: number) => void
  isMobile: boolean
  isOpen: boolean
  onClose: () => void
  onMemberClick: (member: Member) => void
  userRole?: 'owner' | 'admin' | 'member'
  currentUserId?: string
  serverId?: string
}

export default function MembersSidebar({
  members,
  roles,
  width,
  onResize,
  isMobile,
  isOpen,
  onClose,
  onMemberClick,
  userRole = 'member',
  currentUserId,
  serverId,
}: MembersSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  // Local nickname overrides per member (per server UI only)
  const [nicknameOverrides, setNicknameOverrides] = useState<Record<string, string>>({})
  const [memberModal, setMemberModal] = useState<{
    isOpen: boolean
    member: Member | null
    x: number
    y: number
  }>({ isOpen: false, member: null, x: 0, y: 0 })

  // Member management modal state
  const [manageModal, setManageModal] = useState<{
    isOpen: boolean
    member: Member | null
  }>({ isOpen: false, member: null })

  // Load nickname overrides from localStorage when serverId changes
  useEffect(() => {
    try {
      const key = `db:nicks:${serverId || 'global'}`
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          setNicknameOverrides(parsed)
        }
      } else {
        setNicknameOverrides({})
      }
    } catch {
      // ignore
    }
  }, [serverId])

  // Also pull persistent nicknames from API (server-wide). API wins over local.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!serverId) return
      try {
        const res = await fetch(`/api/servers/${serverId}/nicknames`, { cache: 'no-store' })
        if (!res.ok) return
        const map = await res.json()
        if (!cancelled && map && typeof map === 'object') {
          setNicknameOverrides((prev) => ({ ...prev, ...map }))
        }
      } catch {}
    }
    load()
    return () => { cancelled = true }
  }, [serverId])

  // Persist changes
  useEffect(() => {
    try {
      const key = `db:nicks:${serverId || 'global'}`
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(nicknameOverrides))
      }
    } catch {
      // ignore
    }
  }, [nicknameOverrides, serverId])

  // Suppress native browser context menu when member modal is open
  useEffect(() => {
    const blockNativeContextMenu = (e: Event) => {
      e.preventDefault()
    }

    if (memberModal.isOpen) {
      document.addEventListener('contextmenu', blockNativeContextMenu, { capture: true })
    }

    return () => {
      document.removeEventListener('contextmenu', blockNativeContextMenu, { capture: true } as any)
    }
  }, [memberModal.isOpen])
  

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'online': return 'bg-emerald-500'
      case 'idle': return 'bg-amber-500'
      case 'dnd': return 'bg-rose-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleInfo = (member: Member) => {
    if (member.role === 'owner') {
      return { name: 'Owner', color: 'text-yellow-400', icon: Crown }
    }
    if (member.role === 'admin') {
      return { name: 'Admin', color: 'text-blue-400', icon: Shield }
    }
    
    const role = roles.find(r => r.id === member.roleId)
    return {
      name: role?.name || '@everyone',
      color: role?.color ? `text-[${role.color}]` : 'text-gray-400',
      icon: null
    }
  }

  const handleMemberContextMenu = (e: React.MouseEvent, member: Member) => {
    e.preventDefault()
    e.stopPropagation()
    
    setMemberModal({
      isOpen: true,
      member,
      x: e.clientX,
      y: e.clientY
    })
  }

  const handleContextAction = (action: string, member: Member) => {
    switch (action) {
      case 'mention':
        // Add @username to message input
        const messageInput = document.querySelector('input[placeholder*="Message"]') as HTMLInputElement
        if (messageInput) {
          const currentValue = messageInput.value
          const mention = `@${member.username} `
          messageInput.value = currentValue + mention
          messageInput.focus()
        }
        break
      case 'dm':
        console.log('Open DM with', member.username)
        break
      case 'call':
        console.log('Call', member.username)
        break
      case 'video_call':
        console.log('Video call', member.username)
        break
      case 'view_profile':
        onMemberClick(member)
        break
      case 'copy_user_id':
        navigator.clipboard.writeText(member.id)
        console.log('Copied user ID:', member.id)
        break
      case 'copy_username':
        navigator.clipboard.writeText(member.username)
        console.log('Copied username:', member.username)
        break
      case 'edit_nickname':
        try {
          const current = nicknameOverrides[member.id] ?? member.name
          const next = prompt('Enter new server nickname', current || member.username)
          if (next !== null) {
            const trimmed = next.trim()
            if (trimmed.length > 0 && trimmed !== current) {
              setNicknameOverrides(prev => ({ ...prev, [member.id]: trimmed }))
              // Persist to API if available
              if (serverId) {
                fetch(`/api/servers/${serverId}/nicknames`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: member.id, nickname: trimmed })
                }).catch(() => {})
              }
            }
          }
        } catch {}
        break
      case 'add_role':
        console.log('Add role to', member.username)
        break
      case 'remove_role':
        console.log('Remove role from', member.username)
        break
      case 'edit_roles':
        setManageModal({ isOpen: true, member })
        break
      case 'member_settings':
        setManageModal({ isOpen: true, member })
        break
      case 'voice_mute':
        console.log('Mute in voice', member.username)
        break
      case 'voice_deafen':
        console.log('Deafen in voice', member.username)
        break
      case 'move_voice':
        console.log('Move to voice channel', member.username)
        break
      case 'timeout':
        console.log('Timeout', member.username)
        break
      case 'kick':
        console.log('Kick', member.username)
        break
      case 'ban':
        console.log('Ban', member.username)
        break
      default:
        console.log(`Action ${action} not implemented`)
    }
  }

  // Group members by role
  const groupedMembers = filteredMembers.reduce((groups, member) => {
    const roleInfo = getRoleInfo(member)
    const key = member.role === 'owner' ? 'Owner' : 
                member.role === 'admin' ? 'Admin' : 
                roleInfo.name

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(member)
    return groups
  }, {} as Record<string, Member[]>)

  // Sort groups by hierarchy
  const sortedGroups = Object.entries(groupedMembers).sort(([a], [b]) => {
    const order = ['Owner', 'Admin']
    const aIndex = order.indexOf(a)
    const bIndex = order.indexOf(b)
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.localeCompare(b)
  })

  return (
    <div 
      className={`members-sidebar bg-black/40 backdrop-blur-xl border-l border-white/20 flex flex-col min-w-0 overflow-y-auto relative
      ${isMobile ? `fixed inset-y-0 right-0 z-40 w-72 max-w-[85vw] transform transition-transform duration-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}` : isOpen ? 'block' : 'hidden'}`}
      style={{ width: isMobile ? undefined : `${width}px` }}
    >
      {/* Resize Handle */}
      {!isMobile && isOpen && (
        <ResizeHandle onResize={onResize} side="left" minWidth={200} maxWidth={400} />
      )}
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Members</h3>
          {isMobile && (
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="rounded-xl border-white/15 bg-white/5 pl-10"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {sortedGroups.map(([roleName, roleMembers]) => (
          <div key={roleName} className="space-y-2">
            {/* Role Header */}
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {roleName} — {roleMembers.length}
              </span>
            </div>

            {/* Members */}
            <div className="space-y-1">
              {roleMembers.map((member) => {
                const roleInfo = getRoleInfo(member)
                const IconComponent = roleInfo.icon

                return (
                  <div
                    key={member.id}
                    className="relative w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition group border border-transparent hover:border-white/10 cursor-pointer"
                    onClick={() => onMemberClick({ ...member, name: nicknameOverrides[member.id] ?? member.name })}
                    onContextMenu={(e) => handleMemberContextMenu(e, member)}
                    onMouseDown={(e) => {
                      if (e.button === 2) { // Right mouse button
                        console.log('Right mouse button detected on:', member.name)
                        handleMemberContextMenu(e, member)
                      }
                    }}
                    onAuxClick={(e) => {
                      // Alternative right-click handler
                      console.log('Aux click detected on:', member.name)
                      handleMemberContextMenu(e, member)
                    }}
                    style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                  >
                    {/* Avatar with status */}
                    <div className="relative flex-shrink-0">
                      <Avatar src={member.avatar} alt={member.name} size={32} />
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-black ${getStatusColor(member.status)}`} />
                    </div>

                    {/* Member info */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-white truncate">
                          {nicknameOverrides[member.id] ?? member.name}
                        </span>
                        {IconComponent && (
                          <IconComponent className={`h-3 w-3 ${roleInfo.color}`} />
                        )}
                      </div>
                      <div className="text-xs text-white/60 truncate">
                        @{member.username}
                      </div>
                    </div>

                    {/* Actions */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle member actions
                      }}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No members found
          </div>
        )}
      </div>

      {/* Member Management Modal */}
      <MemberContextMenu
        isOpen={memberModal.isOpen}
        member={memberModal.member}
        x={memberModal.x}
        y={memberModal.y}
        onClose={() => setMemberModal({ isOpen: false, member: null, x: 0, y: 0 })}
        onAction={handleContextAction}
        userRole={userRole}
        currentUserId={currentUserId}
      />

      {/* Member Management Modal */}
      <MemberManagementModal
        isOpen={manageModal.isOpen}
        onClose={() => setManageModal({ isOpen: false, member: null })}
        member={manageModal.member}
        userRole={userRole}
        currentUserId={currentUserId}
        onAction={(action) => {
          if (!manageModal.member) return
          if (action === 'save_changes') {
            // No direct access to modal nickname, rely on prompt path for now
            // Could be enhanced by lifting state up later.
          }
        }}
      />
    </div>
  )
}
