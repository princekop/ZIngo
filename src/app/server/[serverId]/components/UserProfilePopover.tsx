'use client'

import React, { useState, useEffect } from 'react'
import { Edit, Copy, BellOff, Circle, Moon, AlertCircle, Crown, Zap, Shield, Award } from 'lucide-react'
import ProfileCard from './ProfileCard'

interface UserProfilePopoverProps {
  isOpen: boolean
  onClose: () => void
  onEditProfile?: () => void
}

interface UserData {
  id: string
  username: string
  displayName: string
  avatar: string | null
  status: string
  description?: string
  avatarDecoration?: string
  badges: Array<{ icon: string; name: string }>
}

export default function UserProfilePopover({ isOpen, onClose, onEditProfile }: UserProfilePopoverProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchUserData()
    }
  }, [isOpen])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserData({
          id: data.id,
          username: data.username,
          displayName: data.displayName,
          avatar: data.avatar,
          status: 'online',
          description: data.description,
          avatarDecoration: data.avatarDecoration,
          badges: [
            { icon: 'crown', name: 'Server Owner' },
            { icon: 'zap', name: 'Booster' }
          ]
        })
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'crown': return <Crown className="w-4 h-4" />
      case 'zap': return <Zap className="w-4 h-4" />
      case 'shield': return <Shield className="w-4 h-4" />
      case 'award': return <Award className="w-4 h-4" />
      default: return <Award className="w-4 h-4" />
    }
  }

  const updateStatus = async (status: string) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch('/api/user/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserData(prev => prev ? { ...prev, status: data.status } : null)
        // Refresh page to update status everywhere
        setTimeout(() => window.location.reload(), 500)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const copyUserId = () => {
    if (userData?.id) {
      navigator.clipboard.writeText(userData.id)
      alert('✅ User ID copied to clipboard!')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[60]"
        onClick={onClose}
      />

      {/* Popover */}
      <div 
        className="absolute bottom-full left-0 mb-2 w-80 rounded-xl shadow-2xl overflow-hidden z-[70]"
        style={{ 
          backgroundColor: 'transparent'
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-32 bg-[#111214] rounded-xl">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : userData ? (
          <div className="bg-[#0f0f0f] rounded-xl border border-[#2a2a2a] p-3">
            {/* Compact Profile Card */}
            <div className="mb-3">
              <ProfileCard
                avatarUrl={userData.avatar || ''}
                name={userData.displayName}
                username={userData.username}
                status={userData.status}
                badges={userData.badges.map(b => b.name)}
                className="profile-popover-card scale-90"
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-[#2a2a2a] mb-2"></div>

            {/* Quick Actions */}
            <div className="space-y-1">
              {/* Edit Profile Button */}
              <button 
                onClick={() => {
                  onEditProfile?.()
                  onClose()
                }}
                className="w-full py-2 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: '#4e5058', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5d5f67'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4e5058'}
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>

              {/* Status Options */}
              <div className="text-xs font-semibold text-[#787878] uppercase px-2 py-1">Set Status</div>
              
              {/* Online */}
              <button 
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#1a1a1a] transition-colors text-sm disabled:opacity-50"
                onClick={() => updateStatus('online')}
                disabled={updatingStatus}
              >
                <div className="w-4 h-4 rounded-full bg-[#3ba55c] flex items-center justify-center">
                  <Circle className="w-2 h-2 fill-current text-white" />
                </div>
                <span className="text-[#e0e0e0]">Online</span>
                {userData?.status === 'online' && <span className="ml-auto text-xs text-green-400">✓</span>}
              </button>

              {/* Idle */}
              <button 
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#1a1a1a] transition-colors text-sm disabled:opacity-50"
                onClick={() => updateStatus('idle')}
                disabled={updatingStatus}
              >
                <div className="w-4 h-4 rounded-full bg-[#faa61a] flex items-center justify-center">
                  <Moon className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[#e0e0e0]">Idle</span>
                {userData?.status === 'idle' && <span className="ml-auto text-xs text-yellow-400">✓</span>}
              </button>

              {/* Do Not Disturb */}
              <button 
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#1a1a1a] transition-colors text-sm disabled:opacity-50"
                onClick={() => updateStatus('dnd')}
                disabled={updatingStatus}
              >
                <div className="w-4 h-4 rounded-full bg-[#f23f42] flex items-center justify-center">
                  <BellOff className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[#e0e0e0]">Do Not Disturb</span>
                {userData?.status === 'dnd' && <span className="ml-auto text-xs text-red-400">✓</span>}
              </button>

              {/* Invisible */}
              <button 
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#1a1a1a] transition-colors text-sm disabled:opacity-50"
                onClick={() => updateStatus('invisible')}
                disabled={updatingStatus}
              >
                <div className="w-4 h-4 rounded-full bg-[#747f8d] flex items-center justify-center">
                  <AlertCircle className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[#e0e0e0]">Invisible</span>
                {userData?.status === 'invisible' && <span className="ml-auto text-xs text-gray-400">✓</span>}
              </button>

              {/* Divider */}
              <div className="h-px bg-[#2a2a2a] my-2"></div>

              {/* Copy User ID */}
              <button 
                onClick={copyUserId}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#1a1a1a] transition-colors text-sm"
              >
                <Copy className="w-5 h-5 text-[#787878]" />
                <span className="text-[#e0e0e0]">Copy User ID</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-slate-400 bg-[#111214] rounded-xl">
            Failed to load profile
          </div>
        )}
      </div>
    </>
  )
}
