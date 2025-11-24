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

    const membership = await prisma.userMembership.findFirst({
      where: {
        userId: session.user.id,
        status: 'active'
      },
      include: {
        tier: {
          select: {
            name: true,
            description: true,
            priceInINR: true,
            priceInUSD: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    });

    if (!membership) {
      return NextResponse.json(null);
    }

    return NextResponse.json(membership);
  } catch (error) {
    console.error('Error fetching user membership:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
