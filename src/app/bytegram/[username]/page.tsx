'use client'

import { useState, useEffect } from 'react'
import { UserProfile } from '@/components/bytegram/UserProfile'
import { PostCard } from '@/components/bytegram/PostCard'

interface UserProfilePageProps {
  params: {
    username: string
  }
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [params.username])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${params.username}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)

        // Fetch user's posts
        const postsResponse = await fetch(`/api/users/${userData.id}/posts`)
        if (postsResponse.ok) {
          const postsData = await postsResponse.json()
          setPosts(postsData.posts)
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">User not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white">@{user.username}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <UserProfile
              userId={user.id}
              username={user.username}
              displayName={user.displayName}
              avatar={user.avatar}
              bio={user.bio}
              followers={user.followers}
              following={user.following}
              posts={posts.length}
              isFollowing={user.isFollowing}
              isOwnProfile={user.isOwnProfile}
            />
          </div>

          {/* Posts Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-6">Posts</h2>
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    {...post}
                    onLike={() => {
                      // TODO: Implement like
                    }}
                    onComment={() => {
                      // TODO: Implement comment
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
                <p className="text-gray-400">No posts yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
