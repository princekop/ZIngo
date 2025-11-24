import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params
    const channel = await prisma.channel.findUnique({ where: { id: channelId } })
    if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(channel)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load channel' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { channelId } = await params
    const body = await request.json()
    const { name, type, categoryId } = body || {}

    const channel = await prisma.channel.findUnique({ where: { id: channelId }, select: { serverId: true } })
    if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const member = await prisma.serverMember.findFirst({ where: { serverId: channel.serverId, userId: session.user.id } })
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData: any = {}
    if (typeof name === 'string') updateData.name = name
    if (typeof type === 'string') updateData.type = type
    if (typeof categoryId === 'string') updateData.categoryId = categoryId
    if (body.description !== undefined) updateData.description = body.description
    if (body.backgroundColor !== undefined) updateData.backgroundColor = body.backgroundColor
    if (body.backgroundImage !== undefined) updateData.backgroundImage = body.backgroundImage
    if (body.fontFamily !== undefined) updateData.fontFamily = body.fontFamily
    if (body.fontSize !== undefined) updateData.fontSize = body.fontSize
    if (body.textColor !== undefined) updateData.textColor = body.textColor
    if (body.accentColor !== undefined) updateData.accentColor = body.accentColor
    
    const updated = await prisma.channel.update({
      where: { id: channelId },
      data: updateData,
    })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { channelId } = await params
    const body = await request.json()

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { serverId: true },
    })

    if (!channel) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const member = await prisma.serverMember.findFirst({
      where: { serverId: channel.serverId, userId: session.user.id },
    })

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const {
      name,
      topic,
      isPrivate,
      slowMode,
      customBg,
      bgOpacity,
      textColor,
      accentColor,
      gradientFrom,
      gradientTo,
      useGradient,
      backgroundType,
      backgroundUrl,
      backgroundColor,
      nameColor,
      nameGradient,
      nameAnimation,
      font,
    } = body || {}

    const updateData: Record<string, unknown> = {}

    if (typeof name === 'string' && name.trim().length > 0) {
      updateData.name = name.trim()
    }

    if (typeof topic === 'string' || topic === null) {
      updateData.topic = topic ?? null
    }

    if (typeof isPrivate === 'boolean') {
      updateData.isPrivate = isPrivate
    }

    if (typeof slowMode === 'number' && slowMode >= 0) {
      updateData.slowMode = slowMode
    }

    if (typeof customBg === 'string' || customBg === null) {
      updateData.customBg = customBg ?? null
    }

    if (typeof bgOpacity === 'number') {
      updateData.bgOpacity = Math.max(0, Math.min(100, bgOpacity))
    }

    if (typeof textColor === 'string' || textColor === null) {
      updateData.textColor = textColor ?? null
    }

    if (typeof accentColor === 'string' || accentColor === null) {
      updateData.accentColor = accentColor ?? null
    }

    if (typeof gradientFrom === 'string' || gradientFrom === null) {
      updateData.gradientFrom = gradientFrom ?? null
    }

    if (typeof gradientTo === 'string' || gradientTo === null) {
      updateData.gradientTo = gradientTo ?? null
    }

    if (typeof useGradient === 'boolean') {
      updateData.useGradient = useGradient
    }

    if (typeof backgroundType === 'string' || backgroundType === null) {
      updateData.backgroundType = backgroundType ?? null
    }

    if (typeof backgroundUrl === 'string' || backgroundUrl === null) {
      updateData.backgroundUrl = backgroundUrl ?? null
    }

    if (typeof backgroundColor === 'string' || backgroundColor === null) {
      updateData.backgroundColor = backgroundColor ?? null
    }

    if (typeof nameColor === 'string' || nameColor === null) {
      updateData.nameColor = nameColor ?? null
    }

    if (typeof nameGradient === 'string' || nameGradient === null) {
      updateData.nameGradient = nameGradient ?? null
    }

    if (typeof nameAnimation === 'string' || nameAnimation === null) {
      updateData.nameAnimation = nameAnimation ?? null
    }

    if (typeof font === 'string' || font === null) {
      updateData.font = font ?? null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
    }

    const updated = await prisma.channel.update({
      where: { id: channelId },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error('PATCH /api/channels/[channelId] error', e)
    return NextResponse.json({ error: 'Failed to update channel settings' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { channelId } = await params
    const channel = await prisma.channel.findUnique({ where: { id: channelId }, select: { serverId: true } })
    if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const member = await prisma.serverMember.findFirst({ where: { serverId: channel.serverId, userId: (session.user as any).id } })
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.channel.delete({ where: { id: channelId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 })
  }
}
