'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Settings, Users, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import StarButton from '@/components/ui/star-button'
import Avatar from '@/components/Avatar'

interface VoiceUser {
  id: string
  name: string
  username: string
  avatar: string | null
  isMuted: boolean
  isDeafened: boolean
  isSpeaking: boolean
  role?: 'owner' | 'admin' | 'member'
}

interface VoiceChannelProps {
  channelId: string
  channelName: string
  onLeave: () => void
  currentUser: {
    id: string
    name: string
    username: string
    avatar: string | null
  }
}

export default function VoiceChannel({ channelId, channelName, onLeave, currentUser }: VoiceChannelProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [voiceUsers, setVoiceUsers] = useState<VoiceUser[]>([])
  const [isConnecting, setIsConnecting] = useState(false)

  // Mock voice users for demo
  useEffect(() => {
    if (isConnected) {
      setVoiceUsers([
        {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.username,
          avatar: currentUser.avatar,
          isMuted,
          isDeafened,
          isSpeaking: false,
          role: 'member'
        },
        {
          id: 'user2',
          name: 'John Doe',
          username: 'johndoe',
          avatar: null,
          isMuted: false,
          isDeafened: false,
          isSpeaking: true,
          role: 'admin'
        },
        {
          id: 'user3',
          name: 'Jane Smith',
          username: 'janesmith',
          avatar: null,
          isMuted: true,
          isDeafened: false,
          isSpeaking: false,
          role: 'member'
        }
      ])
    } else {
      setVoiceUsers([])
    }
  }, [isConnected, currentUser, isMuted, isDeafened])

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsConnected(true)
    setIsConnecting(false)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setIsMuted(false)
    setIsDeafened(false)
    onLeave()
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleDeafen = () => {
    setIsDeafened(!isDeafened)
    if (!isDeafened) {
      setIsMuted(true) // Deafening also mutes
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900/50 via-black/30 to-gray-900/50">
      {/* Voice Channel Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <Volume2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{channelName}</h2>
              <p className="text-sm text-white/60">
                {isConnected ? `${voiceUsers.length} connected` : 'Voice Channel'}
              </p>
            </div>
          </div>
          
          {isConnected && (
            <StarButton variant="danger" size="sm" onClick={handleDisconnect}>
              <PhoneOff className="mr-2 h-4 w-4" />
              Leave
            </StarButton>
          )}
        </div>
      </div>

      {/* Voice Channel Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!isConnected ? (
          /* Connection Screen */
          <div className="text-center space-y-6 max-w-md">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <Volume2 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Join Voice Channel</h3>
              <p className="text-white/60 mb-6">
                Connect to start talking with others in {channelName}
              </p>
              
              <StarButton 
                variant="success" 
                size="lg" 
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-5 w-5" />
                    Join Voice
                  </>
                )}
              </StarButton>
            </div>
          </div>
        ) : (
          /* Connected Screen */
          <div className="w-full max-w-4xl space-y-6">
            {/* Connected Users Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {voiceUsers.map((user) => (
                <div key={user.id} className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <div className={`p-1 rounded-2xl transition-all duration-200 ${
                      user.isSpeaking 
                        ? 'bg-emerald-500/30 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/25' 
                        : 'bg-white/5'
                    }`}>
                      <Avatar src={user.avatar} alt={user.name} size={64} />
                    </div>
                    
                    {/* Status indicators */}
                    <div className="absolute -bottom-1 -right-1 flex gap-1">
                      {user.isMuted && (
                        <div className="p-1 rounded-full bg-red-500 border-2 border-black">
                          <MicOff className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {user.isDeafened && (
                        <div className="p-1 rounded-full bg-gray-600 border-2 border-black">
                          <VolumeX className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Role indicator */}
                    {user.role === 'owner' && (
                      <div className="absolute -top-1 -left-1 p-1 rounded-full bg-yellow-500 border-2 border-black">
                        <Crown className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-white truncate max-w-[80px]">
                      {user.name}
                    </div>
                    <div className="text-xs text-white/60 truncate max-w-[80px]">
                      @{user.username}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Voice Controls */}
            <div className="flex justify-center">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20">
                <Button
                  size="lg"
                  variant={isMuted ? "destructive" : "secondary"}
                  className={`rounded-xl ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'}`}
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                
                <Button
                  size="lg"
                  variant={isDeafened ? "destructive" : "secondary"}
                  className={`rounded-xl ${isDeafened ? 'bg-gray-600 hover:bg-gray-700' : 'bg-white/10 hover:bg-white/20'}`}
                  onClick={toggleDeafen}
                >
                  {isDeafened ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-xl bg-white/10 hover:bg-white/20"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
