'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react'
import Image from 'next/image'

interface PostCardProps {
  id: string
  author: {
    id: string
    name: string
    avatar: string
    username: string
  }
  content: string
  media?: {
    type: 'image' | 'video' | 'reel'
    url: string
    thumbnail?: string
    duration?: number
    aspectRatio?: string
  }
  likes: number
  comments: number
  timestamp: Date
  isLiked?: boolean
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  onBookmark?: () => void
}

export function PostCard({
  id,
  author,
  content,
  media,
  likes,
  comments,
  timestamp,
  isLiked = false,
  onLike,
  onComment,
  onShare,
  onBookmark,
}: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [localLiked, setLocalLiked] = useState(isLiked)
  const [localLikes, setLocalLikes] = useState(likes)

  const handleLike = () => {
    setLocalLiked(!localLiked)
    setLocalLikes(localLiked ? localLikes - 1 : localLikes + 1)
    onLike?.()
  }

  const getAspectRatioClass = () => {
    if (!media?.aspectRatio) return 'aspect-square'
    switch (media.aspectRatio) {
      case '16:9':
        return 'aspect-video'
      case '9:16':
        return 'aspect-[9/16]'
      case '1:1':
        return 'aspect-square'
      default:
        return 'aspect-square'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl overflow-hidden hover:border-gray-700/50 transition-all">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800/30">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500">
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{author.name}</p>
            <p className="text-gray-400 text-xs">@{author.username}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-lg z-10 min-w-[150px]">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors">
                Report
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors">
                Mute
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media */}
      {media && (
        <div className={`relative w-full bg-black overflow-hidden ${getAspectRatioClass()}`}>
          {media.type === 'video' || media.type === 'reel' ? (
            <>
              <video
                src={media.url}
                className="w-full h-full object-cover"
                controls
              />
              {media.duration && (
                <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-semibold">
                  {Math.floor(media.duration / 60)}:{String(media.duration % 60).padStart(2, '0')}
                </div>
              )}
              {media.type === 'reel' && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded-full text-xs text-white font-bold">
                  REEL
                </div>
              )}
            </>
          ) : (
            <Image
              src={media.url}
              alt="Post media"
              fill
              className="object-cover"
            />
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-300 text-sm mb-3">{content}</p>

        {/* Stats */}
        <div className="flex gap-4 text-xs text-gray-400 mb-4 pb-4 border-b border-gray-800/30">
          <span className="hover:text-gray-300 cursor-pointer">{localLikes} likes</span>
          <span className="hover:text-gray-300 cursor-pointer">{comments} comments</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              localLiked
                ? 'text-red-500 bg-red-500/10'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            <Heart className="w-5 h-5" fill={localLiked ? 'currentColor' : 'none'} />
            <span className="text-xs font-medium">{localLikes}</span>
          </button>

          <button
            onClick={onComment}
            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">{comments}</span>
          </button>

          <button
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={onBookmark}
            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-all ml-auto"
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Timestamp */}
      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-800/30">
        {formatTime(timestamp)}
      </div>
    </div>
  )
}
