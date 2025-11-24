import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { userId } = params

    // TODO: Fetch user from database
    const user = {
      id: userId,
      username: 'username',
      displayName: 'User Name',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      bio: 'A passionate developer and content creator',
      followers: 1234,
      following: 567,
      isFollowing: false,
      isOwnProfile: session?.user?.id === userId,
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
