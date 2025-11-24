'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import StarButton from '@/components/ui/star-button'
import { UserPlus, Settings, MoreHorizontal, X, Bell, Shield, Crown, LogOut } from 'lucide-react'

interface ServerHeaderProps {
  server: {
    id: string
    name: string
    description?: string
    icon?: string
    banner?: string
    tag?: string
    boostLevel?: number
  } | null
  onInvite: () => void
  onSettings: () => void
}

export default function ServerHeader({ server, onInvite, onSettings }: ServerHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="sticky top-0 z-20 h-20 bg-black/60 backdrop-blur-xl border-b border-white/15 flex flex-col justify-center px-4 relative overflow-hidden">
      {/* Banner background */}
      <div className="absolute inset-0 -z-10 opacity-60">
        {server?.banner ? (
          <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${server.banner})` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-teal-400/15 to-amber-600/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      <div className="flex items-center gap-3">
        {/* Server avatar */}
        <div className="relative">
          <img 
            src={server?.icon || '/avatars/shadcn.jpg'} 
            alt={server?.name || 'Server'} 
            className="h-10 w-10 rounded-xl border border-white/15 object-cover shadow" 
          />
        </div>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold tracking-tight text-white">
            {server?.name || 'Server'}
          </div>
          {server?.tag && (
            <div className="text-[11px] text-white/70">{server.tag}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <StarButton 
            variant="primary" 
            size="sm"
            onClick={onInvite}
            className="text-sm"
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Invite
          </StarButton>
          
          <StarButton 
            variant="secondary" 
            size="sm"
            onClick={onSettings}
            className="text-sm"
          >
            <Settings className="mr-1.5 h-3.5 w-3.5" /> Settings
          </StarButton>

          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl hover:bg-white/10"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>

            {showMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-[90]" 
                  onClick={() => setShowMenu(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/20 bg-black/95 backdrop-blur-xl shadow-2xl z-[100] overflow-hidden">
                {/* Server Info Section */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={server?.icon || '/avatars/shadcn.jpg'} 
                      alt={server?.name} 
                      className="h-12 w-12 rounded-xl object-cover border border-white/20" 
                    />
                    <div>
                      <div className="font-semibold text-white text-sm">{server?.name}</div>
                      <div className="text-xs text-white/60">{server?.tag || 'Community Server'}</div>
                    </div>
                  </div>
                  
                  {/* Server Banner */}
                  {server?.banner && (
                    <div className="rounded-xl overflow-hidden border border-white/10">
                      <img 
                        src={server.banner} 
                        alt="Server Banner" 
                        className="w-full h-20 object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button 
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 rounded-xl transition"
                    onClick={() => {
                      onInvite()
                      setShowMenu(false)
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
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span>Privacy Settings</span>
                  </button>

                  {/* Admin Only Section */}
                  {/* TODO: Add admin check here */}
                  <div className="border-t border-white/10 mt-2 pt-2">
                    <button 
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 rounded-xl transition"
                      onClick={() => {
                        onSettings()
                        setShowMenu(false)
                      }}
                    >
                      <Settings className="h-4 w-4 text-purple-400" />
                      <span>Server Settings</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 rounded-xl transition">
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span>Manage Server</span>
                    </button>
                  </div>

                  <div className="border-t border-white/10 mt-2 pt-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition">
                      <LogOut className="h-4 w-4" />
                      <span>Leave Server</span>
                    </button>
                  </div>
                </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
