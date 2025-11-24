import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user || !(session.user as any)?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch store statistics from database
    const [totalProducts, totalOrders, revenueData, activeMembers] = await Promise.all([
      prisma.membershipTier.count(),
      prisma.userMembership.count(),
      prisma.userMembership.aggregate({
        _sum: {
          price: true
        }
      }),
      prisma.userMembership.count({
        where: {
          status: 'active'
        }
      })
    ]);

    const stats = {
      totalProducts: totalProducts,
      totalOrders: totalOrders,
      revenue: revenueData._sum.price || 0,
      activeMembers: activeMembers
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching store stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store statistics' },
      { status: 500 }
    );
  }
}
