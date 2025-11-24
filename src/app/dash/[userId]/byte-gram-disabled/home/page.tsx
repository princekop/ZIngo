'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'

interface Post {
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
    duration?: number
  }
  likes: number
  comments: number
  timestamp: Date
  isLiked?: boolean
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [feedType, setFeedType] = useState<'trending' | 'following' | 'recent'>('trending')
  const [isLoading, setIsLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/bytegram/posts?type=${feedType}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts.map((post: any) => ({
          ...post,
          timestamp: new Date(post.timestamp),
        })))
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [feedType])

  useEffect(() => {
    fetchPosts()
    const interval = setInterval(fetchPosts, 5000)
    return () => clearInterval(interval)
  }, [feedType, fetchPosts])

  const handleLike = async (postId: string) => {
    const newLiked = new Set(likedPosts)
    const isCurrentlyLiked = newLiked.has(postId)
    
    if (isCurrentlyLiked) {
      newLiked.delete(postId)
    } else {
      newLiked.add(postId)
    }
    setLikedPosts(newLiked)

    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + (isCurrentlyLiked ? -1 : 1) }
        : post
    ))

    try {
      await fetch(`/api/bytegram/posts/${postId}/like`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Feed Type Selector */}
      <div className="flex gap-2">
        {[
          { value: 'trending' as const, label: 'Trending', svg: '🔥' },
          { value: 'following' as const, label: 'Following', svg: '✨' },
          { value: 'recent' as const, label: 'Recent', svg: '⏱' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFeedType(value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              feedType === value
                ? 'bg-white text-black'
                : 'bg-gray-900 text-gray-300 border border-gray-800 hover:border-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-gray-950 border border-gray-900 rounded-xl overflow-hidden hover:border-gray-800 transition-all">
              {/* Author */}
              <div className="p-4 flex items-center justify-between border-b border-gray-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm">{post.author.name}</p>
                    <p className="text-gray-500 text-xs">@{post.author.username}</p>
                  </div>
                </div>
                <span className="text-gray-600 text-xs">{Math.floor((Date.now() - post.timestamp.getTime()) / 60000)}m ago</span>
              </div>

              {/* Media */}
              {post.media && (
                <div className="w-full bg-black aspect-video relative">
                  {post.media.type === 'video' || post.media.type === 'reel' ? (
                    <video src={post.media.url} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={post.media.url} alt="Post" className="w-full h-full object-cover" />
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <p className="text-gray-200 text-sm mb-4">{post.content}</p>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-xs">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-purple-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors ml-auto">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No posts yet
        </div>
      )}
    </div>
  )
}
