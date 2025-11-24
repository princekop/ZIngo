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

    const memberships = await prisma.userMembership.findMany({
      where: {
        status: 'active'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        tier: {
          select: {
            name: true,
            priceInINR: true,
            priceInUSD: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    });

    return NextResponse.json(memberships);
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
