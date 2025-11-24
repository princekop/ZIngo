import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return NextResponse.json({
    id: user?.id,
    displayName: user?.displayName,
    username: user?.username,
    avatar: user?.avatar,
    avatarDecoration: (user as any)?.avatarDecoration ?? null,
  })
}

export async function PATCH(request: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { avatarDecoration } = await request.json()
  if (avatarDecoration !== null && typeof avatarDecoration !== 'string') {
    return NextResponse.json({ error: 'Invalid decoration' }, { status: 400 })
  }

  const userId = (session.user as any).id as string
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarDecoration: avatarDecoration as any },
  })

  return NextResponse.json({ success: true, avatarDecoration: (updated as any).avatarDecoration ?? null })
}

export async function PUT(request: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const displayName = formData.get('displayName') as string
    const username = formData.get('username') as string
    const description = formData.get('description') as string
    const avatarFile = formData.get('avatar') as File | null

    // Validate inputs
    if (!displayName || !username) {
      return NextResponse.json({ error: 'Display name and username are required' }, { status: 400 })
    }

    const userId = (session.user as any).id as string
    
    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        id: { not: userId }
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 })
    }

    // Handle avatar upload
    let avatarUrl = undefined
    if (avatarFile && avatarFile.size > 0) {
      // In a real app, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, we'll use base64 (not recommended for production)
      const bytes = await avatarFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      avatarUrl = `data:${avatarFile.type};base64,${buffer.toString('base64')}`
    }

    // Update user profile
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName,
        username,
        description: description || null,
        ...(avatarUrl && { avatar: avatarUrl })
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        displayName: updated.displayName,
        username: updated.username,
        avatar: updated.avatar,
        description: (updated as any).description
      }
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 })
  }
}
