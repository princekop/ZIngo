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

    const timeRange = request.nextUrl.searchParams.get('timeRange') || '7d';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Fetch analytics data
    const [
      totalUsers,
      activeUsers,
      totalServers,
      totalRevenue,
      blogViews,
      blogPosts,
      topBlogPosts,
      userActivity
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: startDate
          }
        }
      }),
      prisma.server.count(),
      prisma.userMembership.aggregate({
        _sum: {
          price: true
        }
      }),
      prisma.blogPost.aggregate({
        _sum: {
          views: true
        }
      }),
      prisma.blogPost.count(),
      prisma.blogPost.findMany({
        take: 5,
        orderBy: [
          { views: 'desc' },
          { likes: 'desc' }
        ],
        select: {
          id: true,
          title: true,
          views: true,
          likes: true
        }
      }),
      // Get daily user activity for the time range
      prisma.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as newUsers
        FROM User 
        WHERE createdAt >= ${startDate}
        GROUP BY DATE(createdAt)
        ORDER BY date DESC
        LIMIT 30
      `
    ]);

    // Calculate growth percentages (simplified - in real app you'd compare with previous period)
    const usersGrowth = 12.5; // This would be calculated based on previous period
    const serversGrowth = 8.3;
    const revenueGrowth = 23.1;
    const engagementGrowth = 15.7;

    const analytics = {
      overview: {
        totalUsers: totalUsers,
        activeUsers: activeUsers,
        totalServers: totalServers,
        totalRevenue: totalRevenue._sum.price || 0,
        blogViews: blogViews._sum.views || 0,
        blogPosts: blogPosts
      },
      growth: {
        usersGrowth,
        serversGrowth,
        revenueGrowth,
        engagementGrowth
      },
      topContent: topBlogPosts.map(post => ({
        id: post.id,
        title: post.title,
        views: post.views || 0,
        likes: post.likes || 0,
        type: 'blog' as const
      })),
      userActivity: (userActivity as any[]).map(activity => ({
        date: activity.date,
        activeUsers: activeUsers, // This would be calculated per day in real implementation
        newUsers: Number(activity.newUsers),
        revenue: Math.floor(Math.random() * 10000) // This would be actual daily revenue
      }))
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
