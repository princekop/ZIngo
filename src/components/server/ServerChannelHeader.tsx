'use client'

import { useState } from 'react'
import { Settings, UserPlus, LogOut, Crown, Zap, Shield, MoreHorizontal, ChevronDown, Bell, Hash, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import StarButton from '@/components/ui/star-button'

interface ServerChannelHeaderProps {
  server: {
    id: string
    name: string
    icon?: string
    banner?: string
    tag?: string
    boostLevel?: number
  } | null
  userRole: 'owner' | 'admin' | 'member'
  onInvite: () => void
  onSettings: () => void
  onLeave: () => void
  onBoost: () => void
}

export default function ServerChannelHeader({ 
  server, 
  userRole, 
  onInvite, 
  onSettings, 
  onLeave, 
  onBoost 
}: ServerChannelHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const isOwner = userRole === 'owner'
  const isAdmin = userRole === 'admin' || isOwner

  return (
    <div className="relative">
      {/* Server Header */}
      <div 
        className="h-12 border-b border-white/10 cursor-pointer hover:bg-white/5 transition relative overflow-hidden"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {/* Banner Background */}
        <div className="absolute inset-0">
          {server?.banner && server.banner.trim() !== '' ? (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-60"
              style={{ backgroundImage: `url(${server.banner})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-teal-600/20" />
          )}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Content */}
        <div className="relative flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Server Icon */}
            <div className="relative flex-shrink-0">
              <img 
                src={server?.icon && server.icon.trim() !== '' ? server.icon : '/avatars/shadcn.jpg'} 
                alt={server?.name || 'Server'} 
                className="h-8 w-8 rounded-lg object-cover border border-white/20 shadow-md" 
              />
              {server?.boostLevel && server.boostLevel > 0 && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Zap className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>

            {/* Server Info */}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-white text-sm truncate">
                {server?.name || 'Server'}
              </div>
              {server?.tag && (
                <div className="text-xs text-white/70 truncate">{server.tag}</div>
              )}
            </div>
          </div>

          {/* Dropdown Arrow */}
          <ChevronDown className={`h-4 w-4 text-white/70 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[90]" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border border-white/20 rounded-b-xl shadow-2xl z-[100] overflow-hidden">
            {/* Server Info Section */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={server?.icon && server.icon.trim() !== '' ? server.icon : '/avatars/shadcn.jpg'} 
                  alt={server?.name || 'Server'} 
                  className="h-12 w-12 rounded-xl object-cover border border-white/20" 
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{server?.name}</div>
                  <div className="text-xs text-white/60">{server?.tag || 'Community Server'}</div>
                  {server?.boostLevel && (
                    <div className="flex items-center gap-1 mt-1">
                      <Zap className="h-3 w-3 text-pink-400" />
                      <span className="text-xs text-pink-400">Level {server.boostLevel}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Server Banner Preview */}
              {server?.banner && server.banner.trim() !== '' && (
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <img 
                    src={server.banner} 
                    alt="Server Banner" 
                    className="w-full h-16 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-2">
              {/* Universal Actions */}
              <button 
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 rounded-xl transition"
                onClick={() => {
                  onInvite()
                  setShowDropdown(false)
                }}
              >
                <UserPlus className="h-4 w-4 text-teal-400" />
                <span>Invite People</span>
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 rounded-xl transition">
                <Bell className="h-4 w-4 text-amber-400" />
                <span>Notification Settings</span>
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 rounded-xl transition">
                <Hash className="h-4 w-4 text-blue-400" />
                <span>Hide Muted Channels</span>
              </button>

              {/* Boost Action (for non-owners) */}
              {!isOwner && (
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 rounded-xl transition"
                  onClick={() => {
                    onBoost()
                    setShowDropdown(false)
                  }}
                >
                  <Zap className="h-4 w-4 text-pink-400" />
                  <span>Boost This Server</span>
                </button>
              )}

              {/* Admin/Owner Actions */}
              {isAdmin && (
                <>
                  <div className="border-t border-white/10 mt-2 pt-2">
                    <button 
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 rounded-xl transition"
                      onClick={() => {
                        onSettings()
                        setShowDropdown(false)
                      }}
                    >
                      <Settings className="h-4 w-4 text-purple-400" />
                      <span>Server Settings</span>
                    </button>
                    
                    <div className="py-1">
                      <a
                        href={`/server/${server?.id}/boosts`}
                        className="block w-full"
                        onClick={(e) => {
                          e.preventDefault()
                          onBoost()
                          setShowDropdown(false)
                          // Use Next.js router to navigate to the boosts page
                          window.location.href = `/server/${server?.id}/boosts`
                        }}
                      >
                        <div className="flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-white/10 text-white/90">
                          <Rocket className="h-4 w-4 text-pink-500" />
                          <span>Server Boosts</span>
                          {server?.boostLevel && server.boostLevel > 0 && (
                            <span className="ml-auto px-1.5 py-0.5 text-xs rounded-full bg-pink-500/20 text-pink-400">
                              Level {server.boostLevel}
                            </span>
                          )}
                        </div>
                      </a>
                    </div>

                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 rounded-xl transition">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span>Manage Members</span>
                    </button>

                    {isOwner && (
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 rounded-xl transition">
                        <Crown className="h-4 w-4 text-yellow-400" />
                        <span>Transfer Ownership</span>
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Leave Server (not for owners) */}
              {!isOwner && (
                <div className="border-t border-white/10 mt-2 pt-2">
                  <button 
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition"
                    onClick={() => {
                      onLeave()
                      setShowDropdown(false)
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Leave Server</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
