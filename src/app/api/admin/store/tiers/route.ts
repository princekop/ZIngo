import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { name, priceInINR, priceInUSD, description, featuresJson } = await req.json();

    if (!name || !priceInINR || !priceInUSD || !description) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const tier = await prisma.membershipTier.create({
      data: {
        name,
        priceInINR,
        priceInUSD,
        description,
        featuresJson: featuresJson || '[]'
      }
    });

    return NextResponse.json(tier);
  } catch (error) {
    console.error('Error creating membership tier:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
