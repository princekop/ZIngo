import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const tiers = await prisma.membershipTier.findMany({
      orderBy: {
        priceInINR: 'asc'
      }
    });

    // Transform the data to include parsed features
    const tiersWithFeatures = tiers.map(tier => ({
      ...tier,
      features: tier.featuresJson ? JSON.parse(tier.featuresJson) : []
    }));

    return NextResponse.json(tiersWithFeatures);
  } catch (error) {
    console.error('Error fetching membership tiers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
