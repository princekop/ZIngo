'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import Image from 'next/image'

interface UserProfileProps {
  userId: string
  username: string
  displayName: string
  avatar: string
  bio: string
  followers: number
  following: number
  posts: number
  isFollowing?: boolean
  isOwnProfile?: boolean
  onFollow?: () => void
  onUnfollow?: () => void
}

export function UserProfile({
  userId,
  username,
  displayName,
  avatar,
  bio,
  followers,
  following,
  posts,
  isFollowing = false,
  isOwnProfile = false,
  onFollow,
  onUnfollow,
}: UserProfileProps) {
  const [localFollowing, setLocalFollowing] = useState(isFollowing)
  const [localFollowers, setLocalFollowers] = useState(followers)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollowClick = async () => {
    setIsLoading(true)
    try {
      if (localFollowing) {
        await fetch(`/api/users/${userId}/follow`, { method: 'DELETE' })
        setLocalFollowing(false)
        setLocalFollowers(localFollowers - 1)
        onUnfollow?.()
      } else {
        await fetch(`/api/users/${userId}/follow`, { method: 'POST' })
        setLocalFollowing(true)
        setLocalFollowers(localFollowers + 1)
        onFollow?.()
      }
    } catch (error) {
      console.error('Follow action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500">
            <Image
              src={avatar}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-gray-400">@{username}</p>
            <p className="text-gray-300 text-sm mt-2 max-w-sm">{bio}</p>
          </div>
        </div>

        {!isOwnProfile && (
          <Button
            onClick={handleFollowClick}
            disabled={isLoading}
            className={`${
              localFollowing
                ? 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
            }`}
          >
            {isLoading ? '...' : localFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Posts', value: posts },
          { label: 'Followers', value: localFollowers },
          { label: 'Following', value: following },
        ].map(({ label, value }) => (
          <div key={label} className="text-center p-3 bg-gray-800/30 rounded-lg">
            <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {isOwnProfile && (
        <div className="flex gap-2">
          <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
            Edit Profile
          </Button>
          <Button variant="outline" className="flex-1 bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50">
            Share Profile
          </Button>
        </div>
      )}
    </div>
  )
}
