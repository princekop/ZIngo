import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    // TODO: Fetch user's posts from database
    const mockPosts = [
      {
        id: '1',
        author: {
          id: userId,
          name: 'User Name',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
          username: 'username',
        },
        content: 'Amazing post!',
        media: {
          type: 'image' as const,
          url: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=800&h=600&fit=crop',
          aspectRatio: '1:1',
        },
        likes: 100,
        comments: 20,
        timestamp: new Date(),
        isLiked: false,
      },
    ]

    return NextResponse.json({ posts: mockPosts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
