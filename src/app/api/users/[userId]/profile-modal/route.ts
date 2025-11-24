import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get('serverId')

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        avatarDecoration: true,
        banner: true,
        status: true,
        description: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Add server-specific data if serverId is provided
    let serverData = null
    if (serverId) {
      const serverMember = await prisma.serverMember.findFirst({
        where: {
          userId,
          serverId
        },
        include: {
          serverRole: true,
          roles: {
            include: {
              role: true
            }
          }
        }
      })

      if (serverMember) {
        serverData = {
          role: serverMember.role,
          joinedAt: serverMember.joinedAt,
          roles: serverMember.roles.map((r: any) => ({
            name: r.role.name,
            color: r.role.color
          }))
        }
      }
    }

    // Determine badges based on user permissions and status
    const badges: string[] = []
    if (user.isAdmin) badges.push('👑')
    if (serverData?.role === 'owner') badges.push('⚡')
    if (serverData?.role === 'admin') badges.push('🛡️')
    if (badges.length === 0) badges.push('🎮')

    // Format response for modal
    const profile = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      banner: user.banner,
      status: user.status || 'online',
      customStatus: user.description || null,
      badges,
      bio: user.description,
      createdAt: user.createdAt.toISOString(),
      serverNickname: serverData?.nickname || null,
      serverRoles: serverData?.roles || [],
      avatarDecoration: user.avatarDecoration,
      connections: [],
      activity: null
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
