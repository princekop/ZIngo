import React, { useState, useMemo } from 'react'
import { 
  Crown, 
  Shield, 
  Users, 
  Search,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Ban,
  Volume1,
  VolumeX,
  Mic,
  MicOff
} from 'lucide-react'
import { Member } from '../types'

interface MembersSidebarProps {
  members: Member[]
  onMemberClick?: (member: Member) => void
  onMemberAction?: (member: Member, action: 'kick' | 'ban' | 'mute' | 'unmute') => void
  showSearch?: boolean
  showOnlineOnly?: boolean
}

export default function MembersSidebar({
  members,
  onMemberClick,
  onMemberAction,
  showSearch = true,
  showOnlineOnly = false
}: MembersSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'idle': return 'bg-yellow-500' 
      case 'dnd': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'from-yellow-400 to-orange-500'
      case 'admin': return 'from-blue-400 to-cyan-500'
      default: return 'from-slate-500 to-slate-600'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />
      case 'admin': return <Shield className="w-4 h-4 text-blue-400 animate-pulse" />
      default: return <Users className="w-4 h-4 text-slate-400" />
    }
  }

  // Filter and group members
  const filteredMembers = useMemo(() => {
    let filtered = members.filter(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (showOnlineOnly) {
      filtered = filtered.filter(member => member.status === 'online')
    }

    return filtered
  }, [members, searchQuery, showOnlineOnly])

  const groupedMembers = useMemo(() => {
    const groups = {
      owner: filteredMembers.filter(m => m.role === 'owner'),
      admin: filteredMembers.filter(m => m.role === 'admin'),
      member: filteredMembers.filter(m => m.role === 'member')
    }
    return groups
  }, [filteredMembers])

  const onlineCount = members.filter(m => m.status === 'online').length

  const MemberItem = ({ member }: { member: Member }) => (
    <div 
      key={member.id} 
      className="group relative"
      onMouseEnter={() => setSelectedMember(member.id)}
      onMouseLeave={() => setSelectedMember(null)}
    >
      <div 
        onClick={() => onMemberClick?.(member)}
        className="relative p-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
      >
        {/* Background based on role */}
        <div className={`absolute inset-0 bg-gradient-to-r from-black/60 via-gray-900/40 to-black/60 ${
          member.role === 'owner' ? 'group-hover:from-yellow-500/10 group-hover:via-gray-900/60 group-hover:to-yellow-500/10' :
          member.role === 'admin' ? 'group-hover:from-blue-500/10 group-hover:via-gray-900/60 group-hover:to-blue-500/10' :
          'group-hover:from-gray-800/60 group-hover:via-gray-700/40 group-hover:to-gray-800/60'
        } transition-all duration-300`}></div>
        
        <div className="relative flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor(member.role)} rounded-full flex items-center justify-center shadow-lg transition-all duration-300`}>
              {member.avatar ? (
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  className="w-full h-full rounded-full object-cover border-2 border-white/10" 
                />
              ) : (
                <span className="text-white font-bold text-sm drop-shadow-lg">
                  {member.name.charAt(0)}
                </span>
              )}
            </div>
            
            {/* Status Indicator */}
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-black animate-pulse`}></div>
            
            {/* Special Badges */}
            {member.badges?.includes('founder') && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
          
          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <p className={`font-medium text-sm truncate transition-colors ${
                member.role === 'owner' ? 'text-white group-hover:text-yellow-100' :
                member.role === 'admin' ? 'text-white group-hover:text-blue-100' :
                'text-white group-hover:text-slate-100'
              }`}>
                {member.name}
              </p>
              
              {member.level && (
                <div className={`px-1.5 py-0.5 ${
                  member.role === 'owner' ? 'bg-yellow-500' :
                  member.role === 'admin' ? 'bg-blue-500' :
                  'bg-slate-500'
                } bg-opacity-20 text-xs rounded font-mono`}>
                  {member.level}
                </div>
              )}
            </div>
            
            {member.activity && (
              <p className="text-slate-400 text-xs truncate group-hover:text-slate-300 transition-colors">
                {member.activity}
              </p>
            )}
          </div>
          
          {/* Voice Status */}
          {member.status === 'online' && (
            <div className="flex items-center space-x-1">
              {member.muted ? (
                <MicOff className="w-4 h-4 text-red-400" />
              ) : (
                <Mic className="w-4 h-4 text-green-400" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Member Actions (appears on hover) */}
      {selectedMember === member.id && onMemberAction && (
        <div className="absolute right-2 top-2 flex items-center space-x-1 bg-black/80 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMemberAction(member, member.muted ? 'unmute' : 'mute')
            }}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            title={member.muted ? 'Unmute' : 'Mute'}
          >
            {member.muted ? <Volume1 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMemberAction(member, 'kick')
            }}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
            title="Kick"
          >
            <UserMinus className="w-3 h-3" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMemberAction(member, 'ban')
            }}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
            title="Ban"
          >
            <Ban className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="w-64 sm:w-72 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800 to-transparent opacity-20"></div>
      
      <div className="relative h-full border-l border-slate-700 border-opacity-30 backdrop-blur-sm">
        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Members
              </h3>
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 bg-opacity-20 border border-green-400 border-opacity-30 rounded-full">
                  <span className="text-green-300 text-xs font-bold">{onlineCount}</span>
                </div>
                <div className="px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 bg-opacity-20 border border-cyan-400 border-opacity-30 rounded-full">
                  <span className="text-cyan-300 text-xs font-bold">{members.length}</span>
                </div>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"></div>
          </div>

          {/* Search */}
          {showSearch && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Members by Role */}
          <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
            {/* Owners */}
            {groupedMembers.owner.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-3">
                  <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-yellow-300 uppercase tracking-wider">
                    Owner — {groupedMembers.owner.length}
                  </h4>
                </div>
                {groupedMembers.owner.map((member) => (
                  <MemberItem key={member.id} member={member} />
                ))}
              </div>
            )}

            {/* Admins */}
            {groupedMembers.admin.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-4 h-4 text-blue-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                    Admins — {groupedMembers.admin.length}
                  </h4>
                </div>
                {groupedMembers.admin.map((member) => (
                  <MemberItem key={member.id} member={member} />
                ))}
              </div>
            )}

            {/* Members */}
            {groupedMembers.member.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-4 h-4 text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Members — {groupedMembers.member.length}
                  </h4>
                </div>
                {groupedMembers.member.map((member) => (
                  <MemberItem key={member.id} member={member} />
                ))}
              </div>
            )}

            {/* No Results */}
            {filteredMembers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  {searchQuery ? 'No members found' : 'No members online'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
