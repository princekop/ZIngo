import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if server exists
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: { id: true, name: true, ownerId: true }
    })

    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }

    // Check if user is already a member
    const existingMember = await prisma.serverMember.findFirst({
      where: {
        serverId: serverId,
        userId: session.user.id
      }
    })

    if (existingMember) {
      return NextResponse.json({ 
        message: 'Already a member',
        member: existingMember 
      })
    }

    // Determine role - owner if they created the server, otherwise member
    const role = server.ownerId === session.user.id ? 'owner' : 'member'

    // Add user as server member
    const newMember = await prisma.serverMember.create({
      data: {
        serverId: serverId,
        userId: session.user.id,
        role: role,
        joinedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Successfully joined server',
      member: newMember
    })

  } catch (error) {
    console.error('Join server error:', error)
    return NextResponse.json(
      { error: 'Failed to join server' },
      { status: 500 }
    )
  }
}

// GET to check membership status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const member = await prisma.serverMember.findFirst({
      where: {
        serverId: serverId,
        userId: session.user.id
      },
      include: {
        server: {
          select: { id: true, name: true, ownerId: true }
        }
      }
    })

    if (!member) {
      return NextResponse.json({ 
        isMember: false,
        message: 'Not a member of this server'
      })
    }

    return NextResponse.json({
      isMember: true,
      member: {
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt,
        server: member.server
      }
    })

  } catch (error) {
    console.error('Check membership error:', error)
    return NextResponse.json(
      { error: 'Failed to check membership' },
      { status: 500 }
    )
  }
}
