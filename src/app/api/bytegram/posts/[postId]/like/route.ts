import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

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

    // TODO: Update database with like
    // - Check if user already liked
    // - If yes, remove like
    // - If no, add like
    // - Update post like count

    return NextResponse.json({ success: true, liked: true })
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    )
  }
}
