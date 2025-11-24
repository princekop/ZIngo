'use client'

import { useState, useMemo } from 'react'
import { 
  Crown, 
  Shield, 
  Users, 
  Search, 
  MoreHorizontal,
  UserX,
  Settings,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Eye
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { cn } from '@/lib/utils'
import { useServer } from './ServerProvider'
import { UserProfileModal } from './modals/UserProfileModal'
import { toast } from 'sonner'

export function MembersPanel() {
  const { members, roles, currentUser } = useServer()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [showProfile, setShowProfile] = useState(false)

  // Group and filter members
  const groupedMembers = useMemo(() => {
    const filteredMembers = members.filter(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Group by status and role
    const groups: Record<string, typeof members> = {
      online: [],
      idle: [],
      dnd: [],
      offline: []
    }

    filteredMembers.forEach(member => {
      groups[member.status].push(member)
    })

    // Sort each group by role hierarchy
    Object.keys(groups).forEach(status => {
      groups[status].sort((a, b) => {
        const roleOrder = { owner: 0, admin: 1, moderator: 2, member: 3 }
        const aOrder = roleOrder[a.role as keyof typeof roleOrder] ?? 3
        const bOrder = roleOrder[b.role as keyof typeof roleOrder] ?? 3
        return aOrder - bOrder
      })
    })

    return groups
  }, [members, searchQuery])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-[#4ADE80]'
      case 'idle':
        return 'bg-[#FFB020]'
      case 'dnd':
        return 'bg-[#FF3B6E]'
      default:
        return 'bg-[#6B6B7A]'
    }
  }

  const getStatusIcon = (status: string) => {
    return (
      <div className={cn('w-3 h-3 rounded-full border-2 border-slate-900', getStatusColor(status))} />
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3 text-yellow-400" />
      case 'admin':
        return <Shield className="w-3 h-3 text-red-400" />
      case 'moderator':
        return <Shield className="w-3 h-3 text-blue-400" />
      default:
        return null
    }
  }

  const getRoleColor = (member: any) => {
    const memberRole = roles.find(r => r.id === member.roleId)
    return memberRole?.color || undefined
  }

  const handleMemberClick = (member: any) => {
    setSelectedMember(member)
    setShowProfile(true)
  }

  const handleMemberAction = async (memberId: string, action: string) => {
    try {
      const response = await fetch(`/api/servers/${currentUser?.id}/members/${memberId}/${action}`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success(`Member ${action} successful`)
      } else {
        toast.error(`Failed to ${action} member`)
      }
    } catch (error) {
      console.error(`Error ${action} member:`, error)
      toast.error(`Failed to ${action} member`)
    }
  }

  const canManageMembers = currentUser?.role === 'owner' || currentUser?.role === 'admin'

  const getTotalCount = (status: string) => groupedMembers[status]?.length || 0
  const totalOnline = getTotalCount('online') + getTotalCount('idle') + getTotalCount('dnd')

  return (
    <>
      <div className="w-full h-full bg-white/5 backdrop-blur-md flex flex-col border-l border-white/10">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white tracking-tight">Members</h3>
            <Badge variant="secondary" className="bg-white/10 border border-white/10 text-[#C9C9D1]">
              {members.length}
            </Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B6B7A]" />
            <Input
              placeholder="Search members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/10 focus:border-[#6C63FF]/40 text-white placeholder:text-[#6B6B7A]"
            />
          </div>
        </div>

        {/* Members List */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-6">
            {/* Online Members */}
            {totalOnline > 0 && (
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#4ADE80] rounded-full" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B6B7A]">
                      Online — {totalOnline}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {['online', 'idle', 'dnd'].map(status => 
                    groupedMembers[status]?.map(member => (
                      <MemberItem
                        key={member.id}
                        member={member}
                        currentUser={currentUser}
                        canManageMembers={canManageMembers}
                        roleColor={getRoleColor(member)}
                        roleIcon={getRoleIcon(member.role)}
                        statusIcon={getStatusIcon(member.status)}
                        onClick={() => handleMemberClick(member)}
                        onAction={handleMemberAction}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Offline Members */}
            {getTotalCount('offline') > 0 && (
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#6B6B7A] rounded-full" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B6B7A]">
                      Offline — {getTotalCount('offline')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {groupedMembers.offline?.map(member => (
                    <MemberItem
                      key={member.id}
                      member={member}
                      currentUser={currentUser}
                      canManageMembers={canManageMembers}
                      roleColor={getRoleColor(member)}
                      roleIcon={getRoleIcon(member.role)}
                      statusIcon={getStatusIcon(member.status)}
                      onClick={() => handleMemberClick(member)}
                      onAction={handleMemberAction}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {searchQuery && members.filter(m => 
              m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.username.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-[#6B6B7A]" />
                <p className="text-sm text-[#6B6B7A]">No members found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfile}
        onClose={() => {
          setShowProfile(false)
          setSelectedMember(null)
        }}
        member={selectedMember}
      />
    </>
  )
}

interface MemberItemProps {
  member: any
  currentUser: any
  canManageMembers: boolean
  roleColor?: string
  roleIcon?: React.ReactNode
  statusIcon: React.ReactNode
  onClick: () => void
  onAction: (memberId: string, action: string) => void
}

function MemberItem({ 
  member, 
  currentUser, 
  canManageMembers, 
  roleColor, 
  roleIcon, 
  statusIcon, 
  onClick, 
  onAction 
}: MemberItemProps) {
  return (
    <div className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
      <div className="flex items-center space-x-3 flex-1 min-w-0" onClick={onClick}>
        {/* Avatar with Status */}
        <div className="relative">
          <Avatar className="w-9 h-9 border border-white/10">
            <AvatarImage src={member.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] text-white text-sm font-semibold">
              {member.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5">
            {statusIcon}
          </div>
        </div>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <span 
              className="font-medium text-white truncate"
              style={{ color: roleColor }}
            >
              {member.name}
            </span>
            {roleIcon}
          </div>
          {member.customStatus && (
            <div className="text-xs text-[#C9C9D1] truncate">
              {member.customStatus}
            </div>
          )}
          {member.activities && member.activities.length > 0 && (
            <div className="text-xs text-[#C9C9D1] truncate">
              {member.activities[0].type === 'playing' && 'Playing '}
              {member.activities[0].type === 'listening' && 'Listening to '}
              {member.activities[0].type === 'watching' && 'Watching '}
              {member.activities[0].name}
            </div>
          )}
        </div>
      </div>

      {/* Member Actions */}
      {canManageMembers && member.id !== currentUser?.id && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 text-[#C9C9D1] hover:text-white h-7 w-7 p-0 transition-opacity hover:bg-[#6C63FF]/20"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#16163A]/95 border border-white/10">
            <DropdownMenuLabel className="text-[#C9C9D1]">Member Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            
            <DropdownMenuItem 
              onClick={() => onClick()}
              className="text-[#C9C9D1] hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onAction(member.id, 'timeout')}
              className="text-[#FFB020] hover:text-[#FFB020] hover:bg-[#FFB020]/10 cursor-pointer"
            >
              <VolumeX className="w-4 h-4 mr-2" />
              Timeout
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onAction(member.id, 'kick')}
              className="text-[#FF7E36] hover:text-[#FF7E36] hover:bg-[#FF7E36]/10 cursor-pointer"
            >
              <UserX className="w-4 h-4 mr-2" />
              Kick
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-white/10" />
            
            <DropdownMenuItem 
              onClick={() => onAction(member.id, 'ban')}
              className="text-[#FF3B6E] hover:text-[#FF3B6E] hover:bg-[#FF3B6E]/10 cursor-pointer"
            >
              <UserX className="w-4 h-4 mr-2" />
              Ban
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
