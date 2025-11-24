import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params

    // TODO: Fetch comments from database
    const mockComments = [
      {
        id: '1',
        author: {
          id: 'user1',
          name: 'John Doe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
          username: 'johndoe',
        },
        content: 'This is amazing! Love it 🔥',
        likes: 45,
        timestamp: new Date(Date.now() - 3600000),
        isLiked: false,
      },
    ]

    return NextResponse.json({ comments: mockComments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = params
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      )
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Comment too long' },
        { status: 400 }
      )
    }

    // TODO: Save comment to database

    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      author: {
        id: session.user.id || 'user1',
        name: session.user.name || 'User',
        avatar: session.user.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        username: session.user.email?.split('@')[0] || 'user',
      },
      content,
      likes: 0,
      timestamp: new Date(),
      isLiked: false,
    }

    return NextResponse.json(newComment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
