'use client'

import React, { useEffect, useRef, useState } from 'react'
import { X, Volume2, Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Headphones, User, Maximize2, Minimize2 } from 'lucide-react'
import { useAgora, AgoraUser } from '../hooks/useAgora'
import { useSession } from 'next-auth/react'

interface VoiceChannelProps {
  channelId: string
  channelName: string
  serverId: string
  onLeave: () => void
}

export default function VoiceChannel({ channelId, channelName, serverId, onLeave }: VoiceChannelProps) {
  const { data: session } = useSession()
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || ''
  const uid = session?.user?.id || `user-${Math.floor(Math.random() * 10000)}`

  const {
    localAudioTrack,
    localVideoTrack,
    localScreenTrack,
    remoteUsers,
    isConnected,
    isJoining,
    error,
    isMuted,
    isDeafened,
    isVideoEnabled,
    isScreenSharing,
    joinChannel,
    leaveChannel,
    toggleMute,
    toggleDeafen,
    toggleVideo,
    toggleScreenShare
  } = useAgora(appId, channelId, uid)

  const [isExpanded, setIsExpanded] = useState(false)
  const localVideoRef = useRef<HTMLDivElement>(null)
  const localScreenRef = useRef<HTMLDivElement>(null)

  // Auto-join on mount
  useEffect(() => {
    joinChannel()
    return () => {
      leaveChannel()
    }
  }, [channelId])

  // Play local video track
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current)
    }
  }, [localVideoTrack])

  // Play local screen track
  useEffect(() => {
    if (localScreenTrack && localScreenRef.current) {
      localScreenTrack.play(localScreenRef.current)
    }
  }, [localScreenTrack])

  const handleLeave = async () => {
    await leaveChannel()
    onLeave()
  }

  // Helper to render remote user video
  const RemoteVideo = ({ user }: { user: AgoraUser }) => {
    const videoRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (user.videoTrack && videoRef.current) {
        user.videoTrack.play(videoRef.current)
      }
    }, [user.videoTrack])

    return (
      <div className="relative w-full h-full bg-black/50 rounded-xl overflow-hidden">
        <div ref={videoRef} className="w-full h-full object-cover" />
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
          User {user.uid}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full w-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={onLeave} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isConnected ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
            <span className="text-xs font-medium">{isConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
          <div className="flex flex-col">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              {channelName}
            </h3>
            <span className="text-xs text-slate-400">Voice Channel • {remoteUsers.length + 1} connected</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLeave}
            className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-4">
        {/* Grid Layout */}
        <div className={`grid gap-4 h-full ${(isVideoEnabled || isScreenSharing || remoteUsers.some(u => u.hasVideo))
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-min'
          }`}>

          {/* Local User */}
          <div className={`relative bg-black/40 rounded-2xl overflow-hidden border border-white/5 group ${(!isVideoEnabled && !isScreenSharing) ? 'aspect-video' : 'h-full'
            }`}>
            {isScreenSharing ? (
              <div ref={localScreenRef} className="w-full h-full object-contain bg-black" />
            ) : isVideoEnabled ? (
              <div ref={localVideoRef} className="w-full h-full object-cover transform scale-x-[-1]" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isMuted ? 'bg-slate-700' : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                  }`}>
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Me" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {session?.user?.name?.charAt(0) || 'Me'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Status Indicators */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white flex items-center gap-2">
                {isMuted ? <MicOff className="w-3 h-3 text-red-400" /> : <Mic className="w-3 h-3 text-green-400" />}
                You
              </div>
            </div>
          </div>

          {/* Remote Users */}
          {remoteUsers.map(user => (
            <div key={user.uid} className={`relative bg-black/40 rounded-2xl overflow-hidden border border-white/5 ${!user.hasVideo ? 'aspect-video' : 'h-full'
              }`}>
              {user.hasVideo ? (
                <RemoteVideo user={user} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center ${user.hasAudio ? 'ring-2 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : ''
                    }`}>
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white">
                User {user.uid}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-4 bg-[#0a0a0a] border-t border-white/5">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all duration-200 ${isMuted
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleDeafen}
            className={`p-4 rounded-full transition-all duration-200 ${isDeafened
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            title={isDeafened ? "Undeafen" : "Deafen"}
          >
            <Headphones className="w-6 h-6" />
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all duration-200 ${isVideoEnabled
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
              }`}
            title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all duration-200 ${isScreenSharing
              ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
          >
            <MonitorUp className="w-6 h-6" />
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <button
            onClick={handleLeave}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg shadow-red-500/20"
            title="Disconnect"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
