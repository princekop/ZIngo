'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThumbsUp, MessageCircle, Share2, Bookmark } from 'lucide-react'

interface Video {
  id: string
  title: string
  author: {
    id: string
    name: string
    avatar: string
    username: string
  }
  thumbnail: string
  url: string
  duration: number
  views: number
  likes: number
  comments: number
  timestamp: Date
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())

  const fetchVideos = useCallback(async () => {
    try {
      const response = await fetch('/api/bytegram/posts?type=trending')
      if (response.ok) {
        const data = await response.json()
        const videoData = data.posts.filter((p: any) => p.media?.type === 'video')
        setVideos(videoData)
        if (videoData.length > 0) setSelectedVideo(videoData[0])
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
    const interval = setInterval(fetchVideos, 10000)
    return () => clearInterval(interval)
  }, [fetchVideos])

  const handleLike = async (videoId: string) => {
    const newLiked = new Set(likedVideos)
    const isCurrentlyLiked = newLiked.has(videoId)
    
    if (isCurrentlyLiked) {
      newLiked.delete(videoId)
    } else {
      newLiked.add(videoId)
    }
    setLikedVideos(newLiked)

    setVideos(videos.map(v => 
      v.id === videoId 
        ? { ...v, likes: v.likes + (isCurrentlyLiked ? -1 : 1) }
        : v
    ))

    if (selectedVideo?.id === videoId) {
      setSelectedVideo({
        ...selectedVideo,
        likes: selectedVideo.likes + (isCurrentlyLiked ? -1 : 1)
      })
    }

    try {
      await fetch(`/api/bytegram/posts/${videoId}/like`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to like video:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
      ) : selectedVideo ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="w-full bg-black rounded-lg overflow-hidden aspect-video">
              <video src={selectedVideo.url} controls autoPlay className="w-full h-full" />
            </div>

            {/* Info */}
            <div className="bg-gray-950 border border-gray-900 rounded-lg p-4 space-y-4">
              <div>
                <h1 className="text-xl font-bold text-white">{selectedVideo.title}</h1>
                <p className="text-gray-500 text-sm mt-1">{selectedVideo.views} views • {new Date(selectedVideo.timestamp).toLocaleDateString()}</p>
              </div>

              {/* Author */}
              <div className="flex items-center justify-between py-4 border-y border-gray-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                  <div>
                    <p className="text-white font-semibold text-sm">{selectedVideo.author.name}</p>
                    <p className="text-gray-500 text-xs">@{selectedVideo.author.username}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                  Subscribe
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleLike(selectedVideo.id)}
                  className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <ThumbsUp className={`w-5 h-5 ${likedVideos.has(selectedVideo.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="text-sm">{selectedVideo.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{selectedVideo.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-purple-500 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-2">
            {videos.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVideo(v)}
                className={`cursor-pointer rounded-lg overflow-hidden transition-all ${
                  selectedVideo.id === v.id ? 'ring-2 ring-white' : 'hover:ring-2 hover:ring-gray-700'
                }`}
              >
                <div className="w-full bg-black aspect-video relative">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-2 bg-gray-950 border border-gray-900">
                  <p className="text-white font-semibold text-xs line-clamp-2">{v.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{v.views} views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No videos available
        </div>
      )}
    </div>
  )
}
