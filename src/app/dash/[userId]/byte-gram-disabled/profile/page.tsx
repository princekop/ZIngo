'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, Settings } from 'lucide-react'

interface Post {
  id: string
  content: string
  media?: {
    type: 'image' | 'video' | 'reel'
    url: string
  }
  likes: number
  comments: number
  timestamp: Date
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'videos' | 'reels'>('posts')
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/bytegram/posts?type=trending')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts.slice(0, 6))
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
    const interval = setInterval(fetchPosts, 10000)
    return () => clearInterval(interval)
  }, [fetchPosts])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Your Name</h1>
              <p className="text-gray-500">@yourname</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-900 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="flex gap-6 text-sm">
          <div><span className="text-white font-bold">42</span> <span className="text-gray-500">posts</span></div>
          <div><span className="text-white font-bold">12.5K</span> <span className="text-gray-500">followers</span></div>
          <div><span className="text-white font-bold">234</span> <span className="text-gray-500">following</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-900">
        {[
          { id: 'posts' as const, label: 'Posts' },
          { id: 'videos' as const, label: 'Videos' },
          { id: 'reels' as const, label: 'Reels' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`pb-3 font-semibold text-sm transition-colors ${
              activeTab === id
                ? 'text-white border-b-2 border-white'
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {posts.map((post) => (
            <div key={post.id} className="group bg-gray-950 border border-gray-900 rounded-lg overflow-hidden hover:border-gray-800 transition-all cursor-pointer">
              {post.media && (
                <div className="relative w-full bg-black aspect-square overflow-hidden">
                  {post.media.type === 'video' || post.media.type === 'reel' ? (
                    <video src={post.media.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={post.media.url} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1 text-white">
                        <Heart className="w-4 h-4" fill="white" />
                        <span className="text-xs">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs">{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
