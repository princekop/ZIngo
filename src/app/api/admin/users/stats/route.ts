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

    // Get current date for filtering
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Fetch user statistics from database
    const [totalUsers, activeUsers, newUsersToday, adminUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          status: 'active'
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay
          }
        }
      }),
      prisma.user.count({
        where: {
          isAdmin: true
        }
      })
    ]);

    const stats = {
      total: totalUsers,
      active: activeUsers,
      newToday: newUsersToday,
      admins: adminUsers
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}
