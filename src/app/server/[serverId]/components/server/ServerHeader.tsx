import React, { useState } from 'react'
import { 
  ChevronDown, 
  Settings, 
  UserPlus, 
  Zap, 
  Users, 
  Crown,
  Shield,
  Bell,
  Hash,
  Plus,
  MoreHorizontal
} from 'lucide-react'
import { Server } from '../types'

interface ServerHeaderProps {
  server: Server
  isCollapsed: boolean
  dropdownOpen: boolean
  setDropdownOpen: (open: boolean) => void
  onSettings?: () => void
  onInvite?: () => void
  onBoost?: () => void
}

export default function ServerHeader({
  server,
  isCollapsed,
  dropdownOpen,
  setDropdownOpen,
  onSettings,
  onInvite,
  onBoost
}: ServerHeaderProps) {
  return (
    <div className="relative h-16 px-4 flex items-center justify-between border-b border-slate-700 border-opacity-50 bg-slate-900 bg-opacity-50">
      {!isCollapsed && (
        <>
          {/* Server Info */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              {/* Server Icon */}
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                {server.icon ? (
                  <img 
                    src={server.icon} 
                    alt={server.name}
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">{server.name.charAt(0)}</span>
                )}
              </div>
              
              {/* Status Indicators */}
              {server.verified && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-black">
                  <Crown className="w-2 h-2 text-white m-0.5" />
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-white font-semibold text-sm flex items-center space-x-2">
                <span>{server.name}</span>
                {server.premium && <Zap className="w-3 h-3 text-yellow-400" />}
              </h2>
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <Users className="w-3 h-3" />
                <span>{server.memberCount}</span>
                <Zap className="w-3 h-3 text-yellow-400 ml-2" />
                <span className="text-yellow-400">Level {server.boostLevel}</span>
              </div>
            </div>
          </div>

          {/* Dropdown Button */}
          <button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDropdownOpen(!dropdownOpen)
            }}
            className="p-2 hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors"
          >
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Server Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 mx-2 z-50 overflow-hidden">
              <div className="relative p-[2px] rounded-xl">
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-900 via-cyan-400 to-blue-900 opacity-75 animate-spin"></div>
                <div className="absolute inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-black to-transparent animate-pulse"></div>
                
                {/* Content */}
                <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-black via-gray-900 to-black">
                  {/* Server Banner */}
                  <div className="relative h-16 overflow-hidden">
                    {server.banner ? (
                      <img 
                        src={server.banner} 
                        alt="Server Banner" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-gray-900 via-black to-gray-900 opacity-80"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
                    
                    {/* Floating Particles */}
                    <div className="absolute inset-0">
                      <div className="absolute top-1 left-3 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-100"></div>
                      <div className="absolute top-3 right-6 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-300"></div>
                      <div className="absolute bottom-2 left-8 w-1 h-1 bg-cyan-300 rounded-full animate-ping delay-500"></div>
                    </div>
                  </div>
                  
                  {/* Server Logo Overlay */}
                  <div className="absolute top-12 left-4 z-20">
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-400 bg-opacity-50 rounded-full blur-lg animate-pulse"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-black border-opacity-50">
                        {server.icon ? (
                          <img 
                            src={server.icon} 
                            alt="Server Icon" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg drop-shadow-lg">{server.name.charAt(0)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Server Info */}
                  <div className="pt-10 pb-3 px-4 bg-gradient-to-b from-gray-900 to-black opacity-50">
                    <div className="relative">
                      <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">{server.name}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-300 mb-3">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{server.memberCount} members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                          <span className="text-yellow-300">Level {server.boostLevel}</span>
                        </div>
                      </div>
                      
                      {/* Menu Actions */}
                      <div className="space-y-2">
                        <button 
                          onClick={onInvite}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-left bg-gray-900 bg-opacity-30 hover:bg-gray-800 hover:bg-opacity-50 rounded-lg transition-all duration-300 text-cyan-300 hover:text-cyan-100 hover:shadow-lg group border border-gray-800 border-opacity-50"
                        >
                          <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Invite People</span>
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                          </div>
                        </button>
                        
                        <button 
                          onClick={onBoost}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-left bg-gray-900 bg-opacity-30 hover:bg-gray-800 hover:bg-opacity-50 rounded-lg transition-all duration-300 text-yellow-300 hover:text-yellow-100 hover:shadow-lg group border border-gray-800 border-opacity-50"
                        >
                          <Zap className="w-5 h-5 group-hover:scale-110 transition-transform animate-pulse" />
                          <span className="text-sm font-medium">Server Boost</span>
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          </div>
                        </button>
                        
                        <button 
                          onClick={onSettings}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-left bg-gray-900 bg-opacity-30 hover:bg-gray-800 hover:bg-opacity-50 rounded-lg transition-all duration-300 text-slate-200 hover:text-white hover:shadow-lg group border border-gray-800 border-opacity-50"
                        >
                          <Settings className="w-5 h-5 group-hover:scale-110 transition-transform group-hover:rotate-90" />
                          <span className="text-sm font-medium">Server Settings</span>
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
