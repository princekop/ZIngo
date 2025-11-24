import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { BoostService } from '@/lib/boost.service';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tierId } = await req.json();
    
    if (!tierId) {
      return new NextResponse('Missing tierId', { status: 400 });
    }

    // Fetch the tier to validate it exists
    const tier = await prisma.membershipTier.findUnique({
      where: { id: tierId }
    });

    if (!tier) {
      return new NextResponse('Invalid tier', { status: 404 });
    }

    // Check if user already has an active membership
    const existingMembership = await prisma.userMembership.findFirst({
      where: {
        userId: session.user.id,
        status: 'active'
      }
    });

    if (existingMembership) {
      return NextResponse.json(
        { message: 'You already have an active membership' },
        { status: 400 }
      );
    }

    // Create the membership
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days

    const membership = await prisma.userMembership.create({
      data: {
        userId: session.user.id,
        tierId: tier.id,
        status: 'active',
        startedAt: now,
        expiresAt: expiresAt
      }
    });

    // Grant boosts for Byte membership
    if (tier.name === 'Byte') {
      try {
        await BoostService.grantInitialBoosts(session.user.id, membership.id);
      } catch (error) {
        console.error('Failed to grant boosts:', error);
        // Don't fail the purchase if boost granting fails
      }
    }

    return NextResponse.json({
      success: true,
      membership,
      message: `${tier.name} membership activated successfully!`
    });

  } catch (error) {
    console.error('Error processing purchase:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
