import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// POST - Pin message
export async function POST(
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
      where: { id: messageId }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Toggle pin status
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        pinned: !message.pinned,
        pinnedAt: !message.pinned ? new Date() : null
      }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error pinning message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Unpin message
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

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        pinned: false,
        pinnedAt: null
      }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error unpinning message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
