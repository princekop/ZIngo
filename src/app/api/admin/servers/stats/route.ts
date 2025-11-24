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

    // Fetch server statistics from database
    const [totalServers, activeServers, newServersToday, totalMembers] = await Promise.all([
      prisma.server.count(),
      prisma.server.count({
        where: {
          status: 'active'
        }
      }),
      prisma.server.count({
        where: {
          createdAt: {
            gte: startOfDay
          }
        }
      }),
      prisma.serverMember.count()
    ]);

    const stats = {
      total: totalServers,
      active: activeServers,
      newToday: newServersToday,
      totalMembers: totalMembers
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching server stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server statistics' },
      { status: 500 }
    );
  }
}
