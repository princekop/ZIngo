'use client'

import { useState, useEffect } from 'react'
import { Search, Flame, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PostCard } from '@/components/bytegram/PostCard'

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [trendingPosts, setTrendingPosts] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchTrendingPosts()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const fetchTrendingPosts = async () => {
    try {
      const response = await fetch('/api/bytegram/posts?type=trending')
      if (response.ok) {
        const data = await response.json()
        setTrendingPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch trending posts:', error)
    }
  }

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/bytegram/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-4">Discover</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, users, hashtags..."
              className="pl-12 bg-gray-900/50 border-gray-800/50 text-white placeholder:text-gray-600 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {searchQuery.trim() ? (
          // Search Results
          <div>
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Search Results
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.map((post) => (
                  <PostCard
                    key={post.id}
                    {...post}
                    onLike={() => {}}
                    onComment={() => {}}
                    onShare={() => {}}
                    onBookmark={() => {}}
                  />
                ))}
              </div>
            ) : isSearching ? (
              <p className="text-center text-gray-400">Searching...</p>
            ) : (
              <p className="text-center text-gray-400">No results found</p>
            )}
          </div>
        ) : (
          // Trending Posts
          <div>
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Trending Now
            </h2>
            {trendingPosts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {trendingPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    {...post}
                    onLike={() => {}}
                    onComment={() => {}}
                    onShare={() => {}}
                    onBookmark={() => {}}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400">No trending posts yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
