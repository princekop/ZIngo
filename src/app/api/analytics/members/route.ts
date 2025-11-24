import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Real analytics using Prisma (SQLite)
// - Joins are derived from ServerMember.joinedAt
// - Leaves are not tracked in the current schema; returned as 0 with TODO
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const range = searchParams.get('range') || '90d'

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const end = new Date()
  const start = new Date(end)
  start.setDate(end.getDate() - (days - 1))

  // Fetch all joins within range
  const members = await prisma.serverMember.findMany({
    where: {
      joinedAt: {
        gte: start,
        lte: end,
      },
    },
    select: { joinedAt: true },
  })

  // Aggregate by YYYY-MM-DD
  const map = new Map<string, number>()
  for (const m of members) {
    const key = m.joinedAt.toISOString().slice(0, 10)
    map.set(key, (map.get(key) ?? 0) + 1)
  }

  const series: Array<{ date: string; joins: number; leaves: number }> = []
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    const joins = map.get(key) ?? 0
    const leaves = 0 // TODO: implement when a leave/removedAt event is tracked
    series.push({ date: key, joins, leaves })
  }

  // Summary metrics
  const now = new Date()
  const dayAgo = new Date(now)
  dayAgo.setDate(now.getDate() - 1)

  const joins24h = await prisma.serverMember.count({
    where: { joinedAt: { gte: dayAgo, lte: now } },
  })

  const totalMembers = await prisma.serverMember.count()

  const distinctServers = await prisma.serverMember.findMany({
    select: { serverId: true },
    distinct: ['serverId'],
  })
  const activeServers = distinctServers.length

  // Simple trend vs previous day
  const twoDaysAgo = new Date(dayAgo)
  twoDaysAgo.setDate(dayAgo.getDate() - 1)
  const prevJoins = await prisma.serverMember.count({
    where: { joinedAt: { gte: twoDaysAgo, lte: dayAgo } },
  })
  const trendJoinsPct = prevJoins ? ((joins24h - prevJoins) / prevJoins) * 100 : 0
  const trendLeavesPct = 0

  return NextResponse.json({
    series,
    summary: {
      joins24h,
      leaves24h: 0,
      totalMembers,
      activeServers,
      trendJoinsPct,
      trendLeavesPct,
    },
  })
}
