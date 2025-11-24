'use client'

import React from 'react'
import useSWR from 'swr'
import { X, MessageSquare, UserMinus, Ban, VolumeX, Calendar, Clock } from 'lucide-react'
import ProfileCard from './ProfileCard'
import { usePermissions } from '../hooks/usePermissions'
import { useModals } from '../hooks/useModals'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  serverId: string
}

interface UserProfile {
  id: string
  username: string
  displayName: string
  avatar: string | null
  banner: string | null
  status: string
  customStatus?: string
  badges: string[]
  bio?: string
  createdAt: string
  joinedAt?: string
  serverNickname?: string
  serverRoles?: { name: string; color: string }[]
  avatarDecoration?: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function UserProfileModal({ isOpen, onClose, userId, serverId }: UserProfileModalProps) {
  const { hasPermission, PERMISSIONS, isOwner } = usePermissions(serverId)
  const { openModal } = useModals()

  const { data: profile, error } = useSWR<UserProfile>(
    isOpen && userId ? `/api/users/${userId}` : null,
    fetcher
  )

  const loading = !profile && !error

  if (!isOpen) return null

  const canModerate = hasPermission(PERMISSIONS.KICK_MEMBERS) || hasPermission(PERMISSIONS.BAN_MEMBERS) || isOwner

  const formatMemberSince = (date?: string) => {
    if (!date) return 'Unknown'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden bg-[#111214]"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : profile ? (
          <>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors backdrop-blur-sm text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Card Component */}
            <ProfileCard
              avatarUrl={profile.avatar || ''}
              name={profile.displayName}
              username={profile.username}
              role={profile.serverRoles?.[0]?.name || 'Member'}
              status={profile.status}
              badges={profile.badges}
              memberSince={formatMemberSince(profile.createdAt)}
              className="profile-modal-card border-none shadow-none"
            />

            {/* Additional Info & Roles */}
            <div className="px-4 pb-4 -mt-2">
              <div className="bg-[#2b2d31] rounded-lg p-3 mb-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Roles</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.serverRoles?.map((role, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1e1f22] text-xs font-medium text-slate-200"
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></div>
                      {role.name}
                    </div>
                  )) || <span className="text-xs text-slate-400">No roles</span>}
                </div>
              </div>

              <div className="bg-[#2b2d31] rounded-lg p-3 mb-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Member Since</h4>
                <div className="flex items-center gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{formatMemberSince(profile.joinedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{formatMemberSince(profile.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  className="w-full py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                    console.log('Message user:', profile.id)
                    onClose()
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>

                {canModerate && (
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#2b2d31]">
                    {(isOwner || hasPermission(PERMISSIONS.KICK_MEMBERS)) && (
                      <button
                        className="py-2 rounded-md bg-[#2b2d31] hover:bg-red-500 hover:text-white text-red-400 font-medium text-xs transition-colors flex flex-col items-center gap-1"
                        onClick={() => {
                          openModal('kickMember', { memberId: profile.id, memberName: profile.displayName })
                          onClose()
                        }}
                      >
                        <UserMinus className="w-4 h-4" />
                        Kick
                      </button>
                    )}
                    {(isOwner || hasPermission(PERMISSIONS.BAN_MEMBERS)) && (
                      <button
                        className="py-2 rounded-md bg-[#2b2d31] hover:bg-red-500 hover:text-white text-red-400 font-medium text-xs transition-colors flex flex-col items-center gap-1"
                        onClick={() => {
                          openModal('banMember', { memberId: profile.id, memberName: profile.displayName })
                          onClose()
                        }}
                      >
                        <Ban className="w-4 h-4" />
                        Ban
                      </button>
                    )}
                    <button
                      className="py-2 rounded-md bg-[#2b2d31] hover:bg-yellow-600 hover:text-white text-yellow-500 font-medium text-xs transition-colors flex flex-col items-center gap-1"
                      onClick={() => {
                        openModal('muteMember', { memberId: profile.id, memberName: profile.displayName })
                        onClose()
                      }}
                    >
                      <VolumeX className="w-4 h-4" />
                      Mute
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-slate-400">Failed to load profile</p>
          </div>
        )}
      </div>
    </div>
  )
}
