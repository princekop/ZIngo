import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Real stats per server using Prisma
type StatsRouteParams = { serverId: string }

export async function GET(
  _req: Request,
  context: { params: Promise<StatsRouteParams> }
) {
  const { serverId } = await context.params

  const now = new Date()
  const dayAgo = new Date(now)
  dayAgo.setDate(now.getDate() - 1)

  const [members, joined24h, activity] = await Promise.all([
    prisma.serverMember.count({ where: { serverId } }),
    prisma.serverMember.count({ where: { serverId, joinedAt: { gte: dayAgo, lte: now } } }),
    prisma.message.count({ where: { createdAt: { gte: dayAgo, lte: now }, channel: { serverId } } }),
  ])

  // Leaves are not tracked in current schema; return 0 until leftAt or events are implemented
  const left24h = 0

  return NextResponse.json({ members, joined24h, left24h, activity })
}
