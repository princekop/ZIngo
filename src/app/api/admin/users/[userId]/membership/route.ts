import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { BoostService } from '@/lib/boost.service'

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { userId } = await params
  const { tierId, months = 1 } = await req.json().catch(() => ({ months: 1 }))

  // If no tierId provided, default to Byte tier
  let tier;
  if (tierId) {
    tier = await prisma.membershipTier.findUnique({
      where: { id: tierId }
    });
    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier ID' }, { status: 400 });
    }
  } else {
    // Create or find Byte tier for backward compatibility
    tier = await prisma.membershipTier.upsert({
      where: { name: 'Byte' },
      update: {},
      create: {
        name: 'Byte', 
        priceInINR: 100, 
        priceInUSD: 1.18,
        description: 'Premium membership with server boosts', 
        featuresJson: JSON.stringify([
          'Private Panel Access',
          'Pterodactyl Integration', 
          'Plugin Installer',
          'Version Manager',
          '2 Server Boosts (₹20 value)',
          'Priority Support'
        ])
      }
    });
  }

  const now = new Date()
  const expires = new Date(now.getTime())
  expires.setMonth(expires.getMonth() + Number(months || 1))

  // Check if user already has active membership
  const existingMembership = await prisma.userMembership.findFirst({
    where: { userId, status: 'active' }
  });

  if (existingMembership) {
    return NextResponse.json({ error: 'User already has an active membership' }, { status: 400 });
  }

  const membership = await prisma.userMembership.create({
    data: { userId, tierId: tier.id, status: 'active', startedAt: now, expiresAt: expires }
  })

  // Grant initial boosts for Byte membership
  if (tier.name === 'Byte') {
    try {
      await BoostService.grantInitialBoosts(userId, membership.id)
    } catch (error) {
      console.error('Failed to grant initial boosts:', error)
    }
  }

  return NextResponse.json({ success: true, membership, tier })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { userId } = await params
  await prisma.userMembership.updateMany({ where: { userId, status: 'active' }, data: { status: 'canceled' } })
  return NextResponse.json({ success: true })
}
