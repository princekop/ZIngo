import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      servers: true,
      memberships: {
        where: { status: 'active' },
        include: { tier: true },
      },
    },
  })
  return NextResponse.json(users.map((u: any) => {
    const active = (u.memberships || [])[0] || null
    return {
      id: u.id,
      email: u.email,
      username: u.username,
      displayName: u.displayName,
      avatar: u.avatar,
      isAdmin: u.isAdmin,
      status: u.status,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      serversCount: Array.isArray(u.servers) ? u.servers.length : 0,
      membership: active ? {
        tier: active.tier?.name || 'Byte',
        expiresAt: active.expiresAt,
        startedAt: active.startedAt,
      } : null,
    }
  }))
}
