import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Fetch notifications from database
    const mockNotifications = [
      {
        id: '1',
        type: 'like' as const,
        actor: {
          id: 'user1',
          name: 'Alex Chen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          username: 'alexchen',
        },
        content: 'liked your post',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        actionUrl: '/bytegram/post/123',
      },
      {
        id: '2',
        type: 'follow' as const,
        actor: {
          id: 'user2',
          name: 'Sarah Dev',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          username: 'sarahdev',
        },
        content: 'started following you',
        timestamp: new Date(Date.now() - 7200000),
        read: true,
        actionUrl: '/bytegram/sarahdev',
      },
    ]

    return NextResponse.json({ notifications: mockNotifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
