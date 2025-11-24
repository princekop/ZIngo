import React from 'react'
import { X, AtSign, Calendar, Shield, Crown, MessageCircle, UserPlus, Ban, UserMinus } from 'lucide-react'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    name: string
    username?: string
    avatar?: string
    role?: string
    joinedAt?: string
    status?: string
  }
  serverId: string
  onMention?: () => void
  onMessage?: () => void
  onKick?: () => void
  onBan?: () => void
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  serverId,
  onMention,
  onMessage,
  onKick,
  onBan
}: UserProfileModalProps) {
  if (!isOpen) return null

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return 'from-yellow-500 to-orange-500'
      case 'admin':
        return 'from-red-500 to-pink-500'
      case 'moderator':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return <Crown className="w-4 h-4" />
      case 'admin':
      case 'moderator':
        return <Shield className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md rounded-xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: '#111214',
          borderColor: 'rgba(0, 255, 255, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#ff1493] to-[#ff69b4]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <div className="w-20 h-20 rounded-full border-[6px] border-[#111214] overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            {/* Status Indicator */}
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-[#111214]" />
          </div>

          {/* User Info */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span>{user.name}</span>
                {getRoleIcon(user.role)}
              </h2>
              {user.username && (
                <p className="text-slate-400 text-sm flex items-center space-x-1">
                  <AtSign className="w-3 h-3" />
                  <span>{user.username}</span>
                </p>
              )}
            </div>

            {/* Role Badge */}
            {user.role && (
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded" style={{ backgroundColor: '#f23f43' }}>
                <Shield className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-bold uppercase">{user.role}</span>
              </div>
            )}

            {/* Member Since */}
            {user.joinedAt && (
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Member since {new Date(user.joinedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-4" />

          {/* Actions */}
          <div className="space-y-1.5">
            <button
              onClick={() => {
                onMention?.()
                onClose()
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-[#1e1f22] rounded-md transition-colors"
            >
              <AtSign className="w-5 h-5 text-[#00d4ff]" />
              <span className="text-sm font-medium text-white">Mention</span>
            </button>

            <button
              onClick={() => {
                onMessage?.()
                onClose()
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-[#1e1f22] rounded-md transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-[#5b8def]" />
              <span className="text-sm font-medium text-white">Send Message</span>
            </button>

            <button
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-[#1e1f22] rounded-md transition-colors"
            >
              <UserPlus className="w-5 h-5 text-[#3ba55c]" />
              <span className="text-sm font-medium text-white">Add Friend</span>
            </button>

            {/* Moderation Actions */}
            {(user.role !== 'owner' && user.role !== 'admin') && (
              <>
                <div className="h-px bg-slate-700/30 my-2" />
                
                <button
                  onClick={() => {
                    onKick?.()
                    onClose()
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-orange-500/10 rounded-md transition-colors"
                >
                  <UserMinus className="w-5 h-5 text-[#f26522]" />
                  <span className="text-sm font-medium text-[#f26522]">Kick from Server</span>
                </button>

                <button
                  onClick={() => {
                    onBan?.()
                    onClose()
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-500/10 rounded-md transition-colors"
                >
                  <Ban className="w-5 h-5 text-[#f04747]" />
                  <span className="text-sm font-medium text-[#f04747]">Ban from Server</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
