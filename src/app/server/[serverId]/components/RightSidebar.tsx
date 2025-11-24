import React from 'react'
import { Member } from './types'

interface RightSidebarProps {
  members: Member[]
  onMemberClick?: (member: Member) => void
  onMemberContextMenu?: (e: React.MouseEvent, member: Member) => void
}

export default function RightSidebar({ members, onMemberClick, onMemberContextMenu }: RightSidebarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'idle': return 'bg-yellow-500' 
      case 'dnd': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const ownerMembers = members.filter(m => m.role === 'owner')
  const adminMembers = members.filter(m => m.role === 'admin')
  const regularMembers = members.filter(m => m.role === 'member')

  const renderMember = (member: Member, roleColor?: string) => (
    <div 
      key={member.id}
      className="px-2 py-1 rounded-md hover:bg-[#1a1a1a] cursor-pointer group transition-colors"
      onClick={() => onMemberClick?.(member)}
      onContextMenu={(e) => {
        e.preventDefault()
        onMemberContextMenu?.(e, member)
      }}
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {member.avatar ? (
              <img src={member.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full ${
                member.role === 'owner' 
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                  : member.role === 'admin'
                  ? 'bg-gradient-to-br from-blue-400 to-cyan-500'
                  : 'bg-gradient-to-br from-slate-600 to-slate-700'
              } flex items-center justify-center`}>
                <span className="text-white font-bold text-xs">{member.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-[#0f0f0f]`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-[13px] font-medium truncate group-hover:text-white transition-colors ${
              member.role === 'owner' ? 'text-[#e0e0e0] font-semibold' :
              member.role === 'admin' ? 'text-[#c0c0c0] font-semibold' :
              'text-[#a0a0a0]'
            }`}>
              {member.name}
            </span>
            {member.badges && member.badges.length > 0 && (
              <div className="flex items-center gap-0.5">
                {member.badges.map((badge, i) => (
                  <span key={i} className="text-xs">{badge}</span>
                ))}
              </div>
            )}
          </div>
          {member.activity && (
            <p className="text-[11px] text-[#787878] truncate mt-0.5">
              {member.activity}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div 
      className="w-60 relative h-full border-l overflow-y-auto scrollbar-thin scrollbar-thumb-[#1a1a1a] hover:scrollbar-thumb-[#252525] scrollbar-track-transparent"
      style={{
        backgroundColor: '#0f0f0f',
        borderColor: 'rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="relative h-full">
        <div className="p-3">
          {/* Members by Role */}
          <div className="space-y-4">
            {/* Owners */}
            {ownerMembers.length > 0 && (
              <div className="space-y-0.5">
                <div className="flex items-center justify-between px-2 py-1">
                  <h4 className="text-[11px] font-semibold text-[#787878] uppercase tracking-wide">
                    FOUNDER
                  </h4>
                  <span className="text-[11px] text-[#606060]">{ownerMembers.length}</span>
                </div>
                {ownerMembers.map((member) => renderMember(member, '#f0b232'))}
              </div>
            )}

            {/* Admins */}
            {adminMembers.length > 0 && (
              <div className="space-y-0.5">
                <div className="flex items-center justify-between px-2 py-1">
                  <h4 className="text-[11px] font-semibold text-[#787878] uppercase tracking-wide">
                    MODERATOR
                  </h4>
                  <span className="text-[11px] text-[#606060]">{adminMembers.length}</span>
                </div>
                {adminMembers.map((member) => renderMember(member, '#5865f2'))}
              </div>
            )}

            {/* Members */}
            {regularMembers.length > 0 && (
              <div className="space-y-0.5">
                <div className="flex items-center justify-between px-2 py-1">
                  <h4 className="text-[11px] font-semibold text-[#787878] uppercase tracking-wide">
                    MEMBERS
                  </h4>
                  <span className="text-[11px] text-[#606060]">{regularMembers.length}</span>
                </div>
                {regularMembers.map((member) => renderMember(member))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
