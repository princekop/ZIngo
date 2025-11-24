import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ active: false })

    const m = await prisma.userMembership.findFirst({
      where: { userId: session.user.id, status: 'active' },
      orderBy: { startedAt: 'desc' },
    })
    if (!m) return NextResponse.json({ active: false })

    const now = Date.now()
    const exp = m.expiresAt ? new Date(m.expiresAt).getTime() : undefined
    const active = typeof exp === 'number' ? exp > now : true

    let meta: any = {}
    try { meta = m.metadataJson ? JSON.parse(m.metadataJson) : {} } catch {}
    const lastShownAt = typeof meta.lastWelcomeShownAt === 'number' ? meta.lastWelcomeShownAt : null

    return NextResponse.json({
      active,
      tier: 'Byte',
      expiresAt: m.expiresAt,
      lastShownAt,
    })
  } catch {
    return NextResponse.json({ active: false })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const m = await prisma.userMembership.findFirst({
      where: { userId: session.user.id, status: 'active' },
      orderBy: { startedAt: 'desc' },
    })
    if (!m) return NextResponse.json({ error: 'No membership' }, { status: 404 })
    let meta: any = {}
    try { meta = m.metadataJson ? JSON.parse(m.metadataJson) : {} } catch {}
    meta.lastWelcomeShownAt = Date.now()
    await prisma.userMembership.update({ where: { id: m.id }, data: { metadataJson: JSON.stringify(meta) } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
