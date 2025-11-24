'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from '@/components/bytegram/PostCard'
import { VideoUpload } from '@/components/bytegram/VideoUpload'
import { Flame, Sparkles, Clock } from 'lucide-react'

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
    thumbnail?: string
    duration?: number
    aspectRatio?: string
  }
  likes: number
  comments: number
  timestamp: Date
  isLiked?: boolean
}

export default function BytegramPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState('feed')
  const [isUploading, setIsUploading] = useState(false)
  const [feedType, setFeedType] = useState<'trending' | 'following' | 'recent'>('trending')

  useEffect(() => {
    // Fetch posts based on feed type
    fetchPosts()
  }, [feedType])

  const fetchPosts = async () => {
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
    }
  }

  const handleUpload = async (file: File, type: 'video' | 'reel' | 'image', caption: string) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('caption', caption)

      const response = await fetch('/api/bytegram/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newPost = await response.json()
        setPosts([newPost, ...posts])
        setActiveTab('feed')
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      await fetch(`/api/bytegram/posts/${postId}/like`, {
        method: 'POST',
      })
      fetchPosts()
    } catch (error) {
      console.error('Like failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ByteGram
            </h1>
            <p className="text-xs text-gray-500">Share your moments</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-900/50 border border-gray-800/50 p-1 rounded-xl">
            <TabsTrigger value="feed" className="rounded-lg">
              Feed
            </TabsTrigger>
            <TabsTrigger value="upload" className="rounded-lg">
              Create
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-6 mt-6">
            {/* Feed Type Selector */}
            <div className="flex gap-2 mb-6">
              {[
                { value: 'trending' as const, label: 'Trending', icon: Flame },
                { value: 'following' as const, label: 'Following', icon: Sparkles },
                { value: 'recent' as const, label: 'Recent', icon: Clock },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setFeedType(value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    feedType === value
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-900/50 text-gray-400 hover:text-gray-300 border border-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Posts Grid */}
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    {...post}
                    onLike={() => handleLike(post.id)}
                    onComment={() => {
                      // TODO: Implement comment modal
                    }}
                    onShare={() => {
                      // TODO: Implement share
                    }}
                    onBookmark={() => {
                      // TODO: Implement bookmark
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No posts yet. Be the first to share!</p>
              </div>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-6">
            <div className="max-w-2xl">
              <VideoUpload onUpload={handleUpload} isLoading={isUploading} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
