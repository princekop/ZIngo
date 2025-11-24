import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Get category details
export async function GET(
  request: NextRequest,
  { params }: { params: { serverId: string; categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serverId, categoryId } = params

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        channels: {
          orderBy: { position: 'asc' }
        }
      }
    })

    if (!category || category.serverId !== serverId) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { serverId: string; categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serverId, categoryId } = params
    const body = await request.json()
    const { name, description } = body

    // Verify user has permission
    const member = await prisma.member.findFirst({
      where: {
        serverId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name || undefined,
        description: description || undefined
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { serverId: string; categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serverId, categoryId } = params

    // Verify user has permission
    const member = await prisma.member.findFirst({
      where: {
        serverId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Delete all channels in the category first
    await prisma.channel.deleteMany({
      where: { categoryId }
    })

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
