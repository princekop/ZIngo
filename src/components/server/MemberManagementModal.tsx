'use client'

import { useState, useEffect } from 'react'
import { X, AtSign, MessageSquare, Eye, UserPlus, UserMinus, Ban, Volume2, VolumeX, Settings, Crown, Shield, Copy, Edit, Trash2, Phone, Video, UserCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import StarButton from '@/components/ui/star-button'
import { toast } from 'sonner'

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

interface MemberManagementModalProps {
  isOpen: boolean
  onClose: () => void
  member: Member | null
  userRole: 'owner' | 'admin' | 'member'
  currentUserId?: string
  onAction: (action: string, member: Member) => void
}

export default function MemberManagementModal({ 
  isOpen, 
  onClose, 
  member, 
  userRole, 
  currentUserId,
  onAction 
}: MemberManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'roles' | 'permissions' | 'moderation'>('general')
  const [nickname, setNickname] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (isOpen && member) {
      setNickname(member.name)
      setNote('')
      setActiveTab('general')
    }
  }, [isOpen, member])

  if (!isOpen || !member) return null

  const isOwner = userRole === 'owner'
  const isAdmin = userRole === 'admin' || isOwner
  const isSelf = member.id === currentUserId
  const canManage = isAdmin && !isSelf && member.role !== 'owner'

  const handleAction = (action: string) => {
    onAction(action, member)
    if (action !== 'view_profile') {
      onClose()
    }
  }

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'online': return 'bg-emerald-500'
      case 'idle': return 'bg-amber-500'
      case 'dnd': return 'bg-rose-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleIcon = (role: Member['role']) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-400" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-400" />
      default: return <Users className="h-4 w-4 text-gray-400" />
    }
  }

  // Safe date formatting (joinedAt may be string or Date)
  const joinedDate = (() => {
    try {
      const d = new Date(member.joinedAt as any)
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString()
    } catch { return '' }
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-[9999] w-[95vw] max-w-[1400px] h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {/* Member Avatar */}
            <div className="relative">
              <img 
                src={member.avatar && member.avatar.trim() !== '' ? member.avatar : '/avatars/shadcn.jpg'} 
                alt={member.name} 
                className="h-16 w-16 rounded-xl object-cover border border-white/20"
              />
              <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-black ${getStatusColor(member.status)}`} />
            </div>
            
            {/* Member Info */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{member.name}</h2>
                {getRoleIcon(member.role)}
              </div>
              <p className="text-sm text-white/60">@{member.username}</p>
              {joinedDate && (
                <p className="text-xs text-white/40">Member since {joinedDate}</p>
              )}
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-white/10 p-4">
            <div className="space-y-1">
              {(['general', 'roles', 'permissions', 'moderation'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                    activeTab === tab
                      ? 'bg-teal-500/20 text-teal-200 border border-teal-400/30'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                  disabled={tab === 'moderation' && !canManage}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <StarButton variant="primary" onClick={() => handleAction('mention')} className="justify-start">
                        <AtSign className="h-4 w-4 mr-2" />
                        Mention
                      </StarButton>
                      <StarButton variant="secondary" onClick={() => handleAction('dm')} className="justify-start">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </StarButton>
                      <StarButton variant="info" onClick={() => handleAction('call')} className="justify-start">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </StarButton>
                      <StarButton variant="success" onClick={() => handleAction('video_call')} className="justify-start">
                        <Video className="h-4 w-4 mr-2" />
                        Video Call
                      </StarButton>
                    </div>
                  </div>

                  {/* Member Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Member Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">Display Name</label>
                        <Input
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="rounded-xl border-white/15 bg-white/5"
                          disabled={!canManage}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">Personal Note</label>
                        <Textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="rounded-xl border-white/15 bg-white/5 min-h-[100px]"
                          placeholder="Add a personal note about this member..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Copy Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Copy Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleAction('copy_user_id')}
                        className="rounded-xl justify-start"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy User ID
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAction('copy_username')}
                        className="rounded-xl justify-start"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Username
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'roles' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Role Management</h3>
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-medium text-white">Current Role: {member.role}</div>
                          <div className="text-sm text-white/60">Manage this member's roles and permissions</div>
                        </div>
                        {getRoleIcon(member.role)}
                      </div>
                      
                      {canManage && (
                        <div className="space-y-3">
                          <StarButton variant="primary" onClick={() => handleAction('add_role')} className="w-full justify-start">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Role
                          </StarButton>
                          {member.roleId && (
                            <StarButton variant="danger" onClick={() => handleAction('remove_role')} className="w-full justify-start">
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove Role
                            </StarButton>
                          )}
                          <StarButton variant="secondary" onClick={() => handleAction('edit_roles')} className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Edit All Roles
                          </StarButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Permissions Overview</h3>
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-white/40 mx-auto mb-4" />
                        <div className="text-white/60 mb-4">View and manage member permissions</div>
                        <StarButton variant="primary">
                          <Shield className="mr-2 h-4 w-4" />
                          View Permissions
                        </StarButton>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'moderation' && canManage && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Voice Controls</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <StarButton variant="warning" onClick={() => handleAction('voice_mute')} className="justify-start">
                        <VolumeX className="h-4 w-4 mr-2" />
                        Mute in Voice
                      </StarButton>
                      <StarButton variant="warning" onClick={() => handleAction('voice_deafen')} className="justify-start">
                        <Volume2 className="h-4 w-4 mr-2" />
                        Deafen in Voice
                      </StarButton>
                      <StarButton variant="info" onClick={() => handleAction('move_voice')} className="justify-start col-span-2">
                        <Volume2 className="h-4 w-4 mr-2" />
                        Move to Voice Channel
                      </StarButton>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-4">Moderation Actions</h3>
                    <div className="space-y-3">
                      <StarButton variant="warning" onClick={() => handleAction('timeout')} className="w-full justify-start">
                        <Ban className="h-4 w-4 mr-2" />
                        Timeout Member
                      </StarButton>
                      <StarButton variant="danger" onClick={() => handleAction('kick')} className="w-full justify-start">
                        <UserMinus className="h-4 w-4 mr-2" />
                        Kick Member
                      </StarButton>
                      <StarButton variant="danger" onClick={() => handleAction('ban')} className="w-full justify-start">
                        <Ban className="h-4 w-4 mr-2" />
                        Ban Member
                      </StarButton>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10">
                    <div className="flex items-start gap-3">
                      <Ban className="h-5 w-5 text-red-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-red-200 mb-1">Moderation Warning</div>
                        <div className="text-sm text-red-300/80">
                          These actions are permanent and cannot be undone. Use with caution.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} className="rounded-xl">
                Close
              </Button>
              {canManage && activeTab === 'general' && (
                <StarButton variant="success" onClick={() => handleAction('save_changes')}>
                  Save Changes
                </StarButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
