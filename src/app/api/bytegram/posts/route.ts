import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'trending'

    // Mock data - replace with database queries
    const mockPosts = [
      {
        id: '1',
        author: {
          id: 'user1',
          name: 'Alex Chen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          username: 'alexchen',
        },
        content: 'Just launched my new project! Check it out and let me know what you think 🚀',
        media: {
          type: 'video' as const,
          url: 'https://www.w3schools.com/html/mov_bbb.mp4',
          duration: 10,
          aspectRatio: '16:9',
        },
        likes: 234,
        comments: 45,
        timestamp: new Date(Date.now() - 3600000),
        isLiked: false,
      },
      {
        id: '2',
        author: {
          id: 'user2',
          name: 'Sarah Dev',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          username: 'sarahdev',
        },
        content: 'Beautiful sunset from my coding session break ✨',
        media: {
          type: 'image' as const,
          url: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=800&h=600&fit=crop',
          aspectRatio: '1:1',
        },
        likes: 567,
        comments: 89,
        timestamp: new Date(Date.now() - 7200000),
        isLiked: false,
      },
    ]

    return NextResponse.json({ posts: mockPosts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
