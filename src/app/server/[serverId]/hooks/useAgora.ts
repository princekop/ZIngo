import { useState, useEffect, useRef } from 'react'
import type {
    IAgoraRTCClient,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    IRemoteAudioTrack,
    IRemoteVideoTrack,
    UID
} from 'agora-rtc-sdk-ng'

export interface AgoraUser {
    uid: UID
    audioTrack?: IRemoteAudioTrack
    videoTrack?: IRemoteVideoTrack
    hasAudio: boolean
    hasVideo: boolean
    isScreenShare?: boolean
}

export function useAgora(appId: string, channelName: string, uid: string) {
    const [client, setClient] = useState<IAgoraRTCClient | null>(null)
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null)
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null)
    const [localScreenTrack, setLocalScreenTrack] = useState<ICameraVideoTrack | null>(null)

    const [remoteUsers, setRemoteUsers] = useState<AgoraUser[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [isJoining, setIsJoining] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [isMuted, setIsMuted] = useState(false)
    const [isDeafened, setIsDeafened] = useState(false)
    const [isVideoEnabled, setIsVideoEnabled] = useState(false)
    const [isScreenSharing, setIsScreenSharing] = useState(false)

    // Initialize client
    useEffect(() => {
        if (!appId) return

        let mounted = true
        let agoraClient: IAgoraRTCClient | null = null

        const initAgora = async () => {
            try {
                const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
                if (!mounted) return

                agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
                setClient(agoraClient)
            } catch (err) {
                console.error("Failed to load Agora SDK", err)
            }
        }

        initAgora()

        return () => {
            mounted = false
            localAudioTrack?.close()
            localVideoTrack?.close()
            localScreenTrack?.close()
            if (agoraClient) {
                agoraClient.leave()
            }
        }
    }, [appId])

    // Handle remote users
    useEffect(() => {
        if (!client) return

        const handleUserPublished = async (user: any, mediaType: 'audio' | 'video') => {
            await client.subscribe(user, mediaType)

            setRemoteUsers(prev => {
                const existingUser = prev.find(u => u.uid === user.uid)
                if (existingUser) {
                    return prev.map(u => u.uid === user.uid ? {
                        ...u,
                        audioTrack: mediaType === 'audio' ? user.audioTrack : u.audioTrack,
                        videoTrack: mediaType === 'video' ? user.videoTrack : u.videoTrack,
                        hasAudio: mediaType === 'audio' ? true : u.hasAudio,
                        hasVideo: mediaType === 'video' ? true : u.hasVideo
                    } : u)
                }
                return [...prev, {
                    uid: user.uid,
                    audioTrack: mediaType === 'audio' ? user.audioTrack : undefined,
                    videoTrack: mediaType === 'video' ? user.videoTrack : undefined,
                    hasAudio: mediaType === 'audio',
                    hasVideo: mediaType === 'video'
                }]
            })

            if (mediaType === 'audio' && !isDeafened) {
                user.audioTrack?.play()
            }
        }

        const handleUserUnpublished = (user: any, mediaType: 'audio' | 'video') => {
            setRemoteUsers(prev => prev.map(u => u.uid === user.uid ? {
                ...u,
                hasAudio: mediaType === 'audio' ? false : u.hasAudio,
                hasVideo: mediaType === 'video' ? false : u.hasVideo
            } : u))
        }

        const handleUserLeft = (user: any) => {
            setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid))
        }

        client.on('user-published', handleUserPublished)
        client.on('user-unpublished', handleUserUnpublished)
        client.on('user-left', handleUserLeft)

        return () => {
            client.off('user-published', handleUserPublished)
            client.off('user-unpublished', handleUserUnpublished)
            client.off('user-left', handleUserLeft)
        }
    }, [client, isDeafened])

    // Join channel
    const joinChannel = async () => {
        if (!client || isJoining || isConnected) return

        setIsJoining(true)
        setError(null)

        try {
            // Get token from API
            const res = await fetch(`/api/agora/token?channel=${channelName}&uid=${uid}`)
            const data = await res.json()

            if (data.error) throw new Error(data.error)

            await client.join(appId, channelName, data.token, uid)

            // Create and publish audio track
            const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
            setLocalAudioTrack(audioTrack)
            await client.publish(audioTrack)

            setIsConnected(true)
        } catch (err: any) {
            console.error('Failed to join channel:', err)
            setError(err.message || 'Failed to join voice channel')
        } finally {
            setIsJoining(false)
        }
    }

    // Leave channel
    const leaveChannel = async () => {
        if (!client) return

        localAudioTrack?.close()
        localVideoTrack?.close()
        localScreenTrack?.close()

        setLocalAudioTrack(null)
        setLocalVideoTrack(null)
        setLocalScreenTrack(null)

        await client.leave()
        setIsConnected(false)
        setRemoteUsers([])
    }

    // Toggle Mute
    const toggleMute = async () => {
        if (localAudioTrack) {
            await localAudioTrack.setEnabled(isMuted) // If muted, enable. If not, disable.
            setIsMuted(!isMuted)
        }
    }

    // Toggle Deafen
    const toggleDeafen = () => {
        const newDeafenState = !isDeafened
        setIsDeafened(newDeafenState)

        remoteUsers.forEach(user => {
            if (user.audioTrack) {
                if (newDeafenState) {
                    user.audioTrack.stop()
                } else {
                    user.audioTrack.play()
                }
            }
        })
    }

    // Toggle Video
    const toggleVideo = async () => {
        if (isVideoEnabled) {
            // Disable video
            if (localVideoTrack) {
                await client?.unpublish(localVideoTrack)
                localVideoTrack.close()
                setLocalVideoTrack(null)
            }
            setIsVideoEnabled(false)
        } else {
            // Enable video
            try {
                const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
                const videoTrack = await AgoraRTC.createCameraVideoTrack()
                setLocalVideoTrack(videoTrack)
                await client?.publish(videoTrack)
                setIsVideoEnabled(true)
            } catch (err) {
                console.error('Failed to enable video:', err)
            }
        }
    }

    // Toggle Screen Share
    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            // Stop screen share
            if (localScreenTrack) {
                await client?.unpublish(localScreenTrack)
                localScreenTrack.close()
                setLocalScreenTrack(null)
            }
            setIsScreenSharing(false)
        } else {
            // Start screen share
            try {
                const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
                const screenTrack = await AgoraRTC.createScreenVideoTrack({}, "auto")
                if (Array.isArray(screenTrack)) {
                    // Handle case where audio is also returned
                    setLocalScreenTrack(screenTrack[0] as ICameraVideoTrack)
                    await client?.publish(screenTrack[0] as ICameraVideoTrack)
                } else {
                    setLocalScreenTrack(screenTrack as ICameraVideoTrack)
                    await client?.publish(screenTrack as ICameraVideoTrack)
                }
                setIsScreenSharing(true)
            } catch (err) {
                console.error('Failed to share screen:', err)
            }
        }
    }

    return {
        client,
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
    }
}
