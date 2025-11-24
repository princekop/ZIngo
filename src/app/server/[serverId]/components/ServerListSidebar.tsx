'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Compass } from 'lucide-react'

interface ServerData {
  id: string
  name: string
  icon: string | null
  boostLevel: number
  memberCount: number
  isOwner: boolean
}

interface ServerListSidebarProps {
  currentServerId: string
}

export default function ServerListSidebar({ currentServerId }: ServerListSidebarProps) {
  const router = useRouter()
  const [servers, setServers] = useState<ServerData[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredServer, setHoveredServer] = useState<string | null>(null)

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/user/joined-servers')
      if (response.ok) {
        const data = await response.json()
        setServers(data)
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleServerClick = (serverId: string) => {
    router.push(`/server/${serverId}`)
  }

  const handleHomeClick = () => {
    router.push('/dash')
  }

  const handleDiscoverClick = () => {
    router.push('/discover')
  }

  return (
    <div 
      className="w-[72px] h-full flex flex-col items-center py-3 gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent hover:scrollbar-thumb-cyan-500/50"
      style={{
        backgroundColor: '#0a0a0c',
        borderRight: '1px solid rgba(0, 255, 255, 0.15)'
      }}
    >
      {/* Home Button */}
      <div className="relative group">
        <button
          onClick={handleHomeClick}
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:rounded-xl"
          style={{
            backgroundColor: '#1a1a1f',
            border: '1px solid rgba(0, 255, 255, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2a2a3f'
            e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1a1a1f'
            e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.2)'
          }}
        >
          <Home className="w-6 h-6 text-cyan-400" />
        </button>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50"
          style={{
            backgroundColor: '#0a0a0c',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
          }}
        >
          <span className="text-sm font-medium text-white">Home</span>
        </div>
      </div>

      {/* Separator */}
      <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

      {/* Server List */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {servers.map((server) => {
            const isActive = server.id === currentServerId
            
            return (
              <div key={server.id} className="relative group">
                {/* Active Indicator */}
                {isActive && (
                  <div 
                    className="absolute -left-3 top-0 w-1 h-full rounded-r-full"
                    style={{
                      background: 'linear-gradient(180deg, #00ffff, #8a2be2)'
                    }}
                  />
                )}

                <button
                  onClick={() => handleServerClick(server.id)}
                  onMouseEnter={() => setHoveredServer(server.id)}
                  onMouseLeave={() => setHoveredServer(null)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 relative overflow-hidden ${
                    isActive 
                      ? 'rounded-xl' 
                      : 'hover:rounded-xl'
                  }`}
                  style={{
                    border: isActive 
                      ? '2px solid rgba(0, 255, 255, 0.5)' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: isActive 
                      ? '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)' 
                      : 'none'
                  }}
                >
                  {server.icon ? (
                    <img 
                      src={server.icon} 
                      alt={server.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center font-bold text-white text-sm"
                      style={{
                        background: isActive 
                          ? 'linear-gradient(135deg, #00ffff, #8a2be2)' 
                          : 'linear-gradient(135deg, #4a5568, #2d3748)'
                      }}
                    >
                      {getInitials(server.name)}
                    </div>
                  )}

                  {/* Boost Level Indicator */}
                  {server.boostLevel > 0 && (
                    <div 
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #ff0080, #7928ca)',
                        border: '2px solid #0a0a0c',
                        color: 'white'
                      }}
                    >
                      {server.boostLevel}
                    </div>
                  )}
                </button>

                {/* Tooltip */}
                <div 
                  className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg transition-opacity duration-200 whitespace-nowrap z-50 ${
                    hoveredServer === server.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  style={{
                    backgroundColor: '#0a0a0c',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">{server.name}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{server.memberCount} members</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* Separator */}
      <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

      {/* Discover Servers */}
      <div className="relative group">
        <button
          onClick={handleDiscoverClick}
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:rounded-xl"
          style={{
            backgroundColor: '#1a1a1f',
            border: '1px solid rgba(0, 255, 255, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2a2a3f'
            e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1a1a1f'
            e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.2)'
          }}
        >
          <Compass className="w-6 h-6 text-green-400" />
        </button>
        
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50"
          style={{
            backgroundColor: '#0a0a0c',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
          }}
        >
          <span className="text-sm font-medium text-white">Discover Servers</span>
        </div>
      </div>
    </div>
  )
}
