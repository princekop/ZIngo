import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/byte/panel
// body: { serverId: string, name: string, roleIds?: string[] }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { serverId, name, roleIds = [] } = await req.json()

    if (!serverId || !name) {
      return NextResponse.json({ error: 'serverId and name required' }, { status: 400 })
    }

    // Must be server owner
    const server = await prisma.server.findUnique({ where: { id: serverId } })
    if (!server || server.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Only the server owner can create a panel' }, { status: 403 })
    }

    // Ensure owner has an active membership
    const active = await prisma.userMembership.findFirst({ where: { userId: session.user.id, status: 'active' } })
    if (!active) {
      return NextResponse.json({ error: 'Byte membership required' }, { status: 402 })
    }

    const slug = slugify(String(name))
    if (!slug) return NextResponse.json({ error: 'Invalid name' }, { status: 400 })

    const exists = await prisma.panel.findFirst({ where: { serverId, slug } })
    if (exists) return NextResponse.json({ error: 'Name already in use' }, { status: 409 })

    // Choose a category (prefer existing "General")
    let category = await prisma.category.findFirst({ where: { serverId, name: 'General' } })
    if (!category) {
      category = await prisma.category.create({ data: { serverId, name: 'General', emoji: '📂' } })
    }

    // Create a private channel for the panel
    const channel = await prisma.channel.create({
      data: { name: `${slug}-panel`, type: 'text', categoryId: category.id, serverId, isPrivate: true },
    })

    // Lock everyone by default
    await prisma.channelPermission.create({
      data: { channelId: channel.id, userId: null, roleId: null, permission: 'deny:canRead', canRead: false, canView: false }
    })

    // Allow specified roles to view/read
    if (Array.isArray(roleIds) && roleIds.length > 0) {
      const roleRows = roleIds.map((rid: string) => ({ channelId: channel.id, roleId: rid, userId: null, permission: 'allow:canRead', canRead: true, canView: true }))
      for (const r of roleRows) {
        await prisma.channelPermission.create({ data: r })
      }
    }

    // Create panel row
    const panel = await prisma.panel.create({
      data: {
        ownerId: session.user.id,
        serverId,
        channelId: channel.id,
        name,
        slug,
      },
    })

    // Record access mapping for roles
    if (Array.isArray(roleIds) && roleIds.length > 0) {
      for (const roleId of roleIds) {
        await prisma.panelRoleAccess.create({ data: { panelId: panel.id, roleId, canView: true, canManage: false } })
      }
    }

    return NextResponse.json({ panel, channel })
  } catch (e) {
    console.error('Create panel error:', e)
    return NextResponse.json({ error: 'Failed to create panel' }, { status: 500 })
  }
}
