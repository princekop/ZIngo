import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const servers = await prisma.server.findMany({
    where: { advertisementEnabled: true },
    orderBy: { updatedAt: 'desc' },
    take: 12,
    select: {
      id: true,
      name: true,
      description: true,
      icon: true,
      banner: true,
    },
  })
  return NextResponse.json(servers)
}
