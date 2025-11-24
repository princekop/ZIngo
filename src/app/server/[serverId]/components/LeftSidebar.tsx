import React, { useState } from 'react'
import { Hash, Users, Zap, ChevronDown, ChevronRight, UserPlus, Settings, Plus, Calendar, Shield, Crown, Sparkles, Volume2, Mic, Headphones, Cog } from 'lucide-react'
import { Server, Category, Channel } from './types'
import { useSession } from 'next-auth/react'
import UserProfilePopover from './UserProfilePopover'

interface LeftSidebarProps {
  server: Server
  categories: Category[]
  leftSidebarCollapsed: boolean
  serverDropdownOpen: boolean
  setServerDropdownOpen: (open: boolean) => void
  selectedChannel: string
  onChannelSelect: (channel: Channel) => void
  onInviteClick?: () => void
  onBoostClick?: () => void
  onSettingsClick?: () => void
  onEditProfile?: () => void
  onChannelContextMenu?: (e: React.MouseEvent, channel: Channel) => void
  onCategoryContextMenu?: (e: React.MouseEvent, category: Category) => void
}

export default function LeftSidebar({
  server,
  categories,
  leftSidebarCollapsed,
  serverDropdownOpen,
  setServerDropdownOpen,
  selectedChannel,
  onChannelSelect,
  onInviteClick,
  onBoostClick,
  onSettingsClick,
  onEditProfile,
  onChannelContextMenu,
  onCategoryContextMenu
}: LeftSidebarProps) {
  const { data: session } = useSession()
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [showProfilePopover, setShowProfilePopover] = useState(false)

  // Fetch user profile with avatar decoration
  React.useEffect(() => {
    if (session?.user) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => setUserProfile(data))
        .catch(err => console.error('Failed to fetch user profile:', err))
    }
  }, [session])

  const handleChannelSelect = (channel: Channel) => {
    onChannelSelect(channel)
  }

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX - 72 // Subtract server list width
        if (newWidth >= 200 && newWidth <= 400) {
          setSidebarWidth(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <div className="relative h-full flex" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="flex-1 flex flex-col" style={{ width: `${sidebarWidth}px` }}>
        {/* Server Header */}
        <div
          className="relative h-11 px-3 flex items-center justify-between border-b cursor-pointer hover:bg-[#1a1a1a] transition-colors duration-200"
          style={{
            backgroundColor: '#0f0f0f',
            borderColor: 'rgba(255, 255, 255, 0.05)'
          }}
          data-dropdown="server"
          onClick={(e) => {
            e.stopPropagation()
            setServerDropdownOpen(!serverDropdownOpen)
          }}
        >
          {!leftSidebarCollapsed && (
            <>
              <div className="flex items-center space-x-3">
                {/* Server Icon */}
                <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                  {server.icon ? (
                    <img
                      src={server.icon}
                      alt={server.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{server.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-white font-semibold text-sm">{server.name}</h2>
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Users className="w-3 h-3" />
                    <span>{server.memberCount || 0}</span>
                    <Zap className="w-3 h-3 text-yellow-400 ml-2" />
                    <span className="text-yellow-400">Level {server.boostLevel || 0}</span>
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${serverDropdownOpen ? 'rotate-180' : ''}`} />

              {/* Server Dropdown Menu */}
              {serverDropdownOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 mx-2 z-50 overflow-hidden"
                  data-dropdown="server"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="rounded-lg shadow-2xl border"
                    style={{
                      backgroundColor: '#0a0a0c',
                      borderColor: 'rgba(0, 255, 255, 0.2)'
                    }}
                  >
                    <div className="p-4">
                      <h3 className="text-white font-bold text-base sm:text-lg mb-3">{server.name}</h3>
                      <div className="space-y-2">
                        <button
                          onClick={onInviteClick}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-cyan-300 hover:text-cyan-100"
                          style={{
                            backgroundColor: 'rgba(0, 255, 255, 0.05)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 255, 255, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 255, 255, 0.05)'}
                        >
                          <UserPlus className="w-4 h-4" />
                          <span className="text-sm">Invite People</span>
                        </button>
                        <button
                          onClick={onBoostClick}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-yellow-300 hover:text-yellow-100"
                          style={{
                            backgroundColor: 'rgba(255, 215, 0, 0.05)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.05)'}
                        >
                          <Zap className="w-4 h-4" />
                          <span className="text-sm">Server Boost</span>
                        </button>
                        <button
                          onClick={onSettingsClick}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-slate-200 hover:text-white"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.03)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Server Settings</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Boost Goal Section */}
        {!leftSidebarCollapsed && (
          <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#f0b232]" />
                <span className="text-slate-300 font-semibold">Boost Goal</span>
              </div>
              <div className="text-[#949ba4] font-medium">
                {server.boostLevel || 0}/28 Boosts
              </div>
            </div>
          </div>
        )}

        {/* Server Navigation */}
        {!leftSidebarCollapsed && (
          <div className="px-2 py-1.5 space-y-0.5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#1a1a1a] transition-colors text-[#787878] hover:text-[#e0e0e0]">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Events</span>
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#1a1a1a] transition-colors text-[#787878] hover:text-[#e0e0e0]">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Channels & Roles</span>
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#1a1a1a] transition-colors text-[#787878] hover:text-[#e0e0e0]">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Members</span>
            </button>
            <button
              onClick={onBoostClick}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#1a1a1a] transition-colors text-[#787878] hover:text-[#e0e0e0]"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Server Boosts</span>
            </button>
          </div>
        )}

        {/* Channels List */}
        <div
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1a1a1a] scrollbar-track-transparent hover:scrollbar-thumb-[#252525]"
          style={{ backgroundColor: '#0f0f0f' }}
        >
          {!leftSidebarCollapsed && (
            <div className="p-2 space-y-0.5">
              {categories.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center space-y-6 p-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <Hash className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-xl">Welcome to {server.name}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      This server doesn't have any channels yet. Get started by creating your first category.
                    </p>
                    <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 flex items-center space-x-2 mx-auto">
                      <Plus className="w-5 h-5" />
                      <span>Create Category</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      const createCategoryEvent = new CustomEvent('openCreateCategory')
                      window.dispatchEvent(createCategoryEvent)
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 mb-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors text-xs font-semibold uppercase tracking-wide group"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Category</span>
                  </button>
                  {categories.map((category) => {
                    const isCollapsed = collapsedCategories.has(category.id)
                    return (
                      <div key={category.id} className="space-y-0.5">
                        <div
                          className="flex items-center gap-1 px-1.5 py-1 cursor-pointer hover:bg-[#1a1a1a] rounded group"
                          onClick={() => toggleCategory(category.id)}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            onCategoryContextMenu?.(e, category)
                          }}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-3 h-3 text-[#787878] transition-transform" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-[#787878] transition-transform" />
                          )}
                          <h4 className="text-[11px] font-semibold text-[#787878] uppercase tracking-wide group-hover:text-[#e0e0e0] select-none">
                            {category.emoji && <span className="mr-1">{category.emoji}</span>}
                            {category.name}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Trigger create channel modal for this category
                              const createChannelEvent = new CustomEvent('openCreateChannel', {
                                detail: { categoryId: category.id, categoryName: category.name }
                              })
                              window.dispatchEvent(createChannelEvent)
                            }}
                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded"
                            title="Create Channel"
                          >
                            <Plus className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>

                        {!isCollapsed && (
                          <div className="space-y-0.5 pl-1">
                            {category.channels.map((channel) => (
                              <button
                                key={channel.id}
                                onClick={() => handleChannelSelect(channel)}
                                onContextMenu={(e) => {
                                  e.preventDefault()
                                  onChannelContextMenu?.(e, channel)
                                }}
                                className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left transition-all duration-150 group ${selectedChannel === channel.id
                                  ? 'text-white bg-[#1a1a1a]'
                                  : 'text-[#787878] hover:text-[#e0e0e0] hover:bg-[#161616]'
                                  }`}
                              >
                                {channel.type === 'voice' ? (
                                  <Volume2 className="w-4 h-4 flex-shrink-0" />
                                ) : (
                                  <Hash className="w-4 h-4 flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium truncate">{channel.name}</span>
                                {channel.unread && (
                                  <div className="ml-auto bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                                    {channel.unread}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Bar */}
        {!leftSidebarCollapsed && (userProfile || session?.user) && (
          <div className="relative z-[50]">
            <div
              className="px-2 py-2 border-t flex items-center gap-2 hover:bg-[#0a0a0a] transition-colors cursor-pointer"
              style={{
                backgroundColor: '#0a0a0a',
                borderColor: 'rgba(255, 255, 255, 0.05)'
              }}
              onClick={() => setShowProfilePopover(!showProfilePopover)}
            >
              {/* User Avatar with Decoration */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden relative z-10">
                  {(userProfile?.avatar || session?.user?.image) ? (
                    <img
                      src={userProfile?.avatar || session?.user?.image}
                      alt={userProfile?.displayName || session?.user?.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {(userProfile?.displayName || session?.user?.name)?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Avatar Decoration - Glow Effect */}
                {userProfile?.avatarDecoration && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle, rgba(138, 43, 226, 0.5) 0%, rgba(138, 43, 226, 0.3) 50%, transparent 70%)',
                        filter: 'blur(6px)',
                        transform: 'scale(1.4)',
                        zIndex: 0
                      }}
                    />
                    <div className="absolute -inset-1 pointer-events-none z-20">
                      <img
                        src={userProfile.avatarDecoration}
                        alt="decoration"
                        className="w-full h-full object-contain"
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(138, 43, 226, 0.8))',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Status Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3ba55c] rounded-full border-2 border-[#0a0a0a] z-30"></div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[#e0e0e0] text-sm font-semibold truncate">
                  {userProfile?.displayName || session?.user?.name || 'User'}
                </div>
                <div className="text-[#787878] text-xs truncate">
                  {userProfile?.username || `#${session?.user?.id?.slice(-4) || '0000'}`}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-0.5">
                <button
                  className="p-1.5 rounded hover:bg-[#1a1a1a] transition-colors text-[#787878] hover:text-[#e0e0e0]"
                  title="Mute"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 rounded hover:bg-[#1a1a1a] transition-colors text-[#787878] hover:text-[#e0e0e0]"
                  title="Deafen"
                >
                  <Headphones className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 rounded hover:bg-[#1a1a1a] transition-colors text-[#787878] hover:text-[#e0e0e0]"
                  title="User Settings"
                >
                  <Cog className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* User Profile Popover */}
            <UserProfilePopover
              isOpen={showProfilePopover}
              onClose={() => setShowProfilePopover(false)}
              onEditProfile={onEditProfile}
            />
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div
        className="w-1 h-full cursor-col-resize hover:bg-cyan-500/50 transition-colors relative group"
        onMouseDown={handleMouseDown}
        style={{ backgroundColor: isResizing ? 'rgba(0, 255, 255, 0.5)' : 'transparent' }}
      >
        <div className="absolute inset-0 w-3 -left-1" />
      </div>
    </div>
  )
}
