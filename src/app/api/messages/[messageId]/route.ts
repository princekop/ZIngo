import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - Get message details
export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = params

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error fetching message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Edit message
export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = params
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Check if user owns the message
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (message.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        edited: true,
        editedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = params

    // Check if user owns the message or is admin
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        channel: {
          include: {
            category: {
              include: {
                server: {
                  include: {
                    members: {
                      where: {
                        userId: session.user.id
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const isOwner = message.userId === session.user.id
    const isAdmin = message.channel?.category?.server?.members?.some(
      m => m.userId === session.user.id && ['OWNER', 'ADMIN'].includes(m.role)
    )

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete message
    await prisma.message.delete({
      where: { id: messageId }
    })

    return NextResponse.json({ success: true, message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
