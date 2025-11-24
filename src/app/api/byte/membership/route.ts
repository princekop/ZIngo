import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/byte/membership  -> Admin-only helper to grant Byte to current user
// body: { months?: number }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!(session.user as any)?.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { months = 1 } = await req.json().catch(() => ({ months: 1 }))

    // Upsert Byte tier
    const tier = await prisma.membershipTier.upsert({
      where: { name: 'Byte' },
      update: {},
      create: {
        name: 'Byte',
        priceInINR: 100,
        priceInUSD: 1.18,
        description: 'Nitro-like membership: private panel, Pterodactyl integration, plugins, versions',
        featuresJson: JSON.stringify(['Private Panel','Pterodactyl Integration','Plugins Installer','Version Manager'])
      }
    })

    const now = new Date()
    const expires = new Date(now.getTime())
    expires.setMonth(expires.getMonth() + Number(months || 1))

    const membership = await prisma.userMembership.create({
      data: {
        userId: session.user.id,
        tierId: tier.id,
        status: 'active',
        startedAt: now,
        expiresAt: expires,
      }
    })

    return NextResponse.json({ success: true, membership })
  } catch (e) {
    console.error('Grant membership error:', e)
    return NextResponse.json({ error: 'Failed to grant membership' }, { status: 500 })
  }
}
