import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as 'video' | 'reel' | 'image'
    const caption = formData.get('caption') as string

    if (!file || !type || !caption) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file size (5GB max)
    const maxSize = 5 * 1024 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 400 }
      )
    }

    // TODO: Upload to cloud storage (S3, Cloudinary, etc.)
    // For now, create a mock URL
    const fileUrl = URL.createObjectURL(file)

    // Mock post creation
    const newPost = {
      id: Math.random().toString(36).substr(2, 9),
      author: {
        id: session.user.id || 'user1',
        name: session.user.name || 'User',
        avatar: session.user.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        username: session.user.email?.split('@')[0] || 'user',
      },
      content: caption,
      media: {
        type,
        url: fileUrl,
        duration: type !== 'image' ? 30 : undefined,
        aspectRatio: type === 'reel' ? '9:16' : '16:9',
      },
      likes: 0,
      comments: 0,
      timestamp: new Date(),
      isLiked: false,
    }

    // TODO: Save to database

    return NextResponse.json(newPost)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
