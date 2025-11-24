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

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

    // Fetch recent activities from various sources
    const [recentUsers, recentServers, recentBlogPosts, recentMemberships] = await Promise.all([
      prisma.user.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          displayName: true,
          username: true,
          createdAt: true
        }
      }),
      prisma.server.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          owner: {
            select: {
              displayName: true,
              username: true
            }
          }
        }
      }),
      prisma.blogPost.findMany({
        take: 3,
        orderBy: { publishedAt: 'desc' },
        where: {
          status: 'PUBLISHED'
        },
        select: {
          id: true,
          title: true,
          publishedAt: true,
          author: {
            select: {
              displayName: true,
              username: true
            }
          }
        }
      }),
      prisma.userMembership.findMany({
        take: 3,
        orderBy: { startedAt: 'desc' },
        select: {
          id: true,
          startedAt: true,
          user: {
            select: {
              displayName: true,
              username: true
            }
          },
          tier: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    // Transform data into activity format
    const activities = [];

    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        title: 'New User Registration',
        description: `${user.displayName || user.username} joined the platform`,
        timestamp: user.createdAt.toISOString(),
        status: 'success'
      });
    });

    // Add server creations
    recentServers.forEach(server => {
      activities.push({
        id: `server-${server.id}`,
        type: 'server',
        title: 'New Server Created',
        description: `${server.name} created by ${server.owner.displayName || server.owner.username}`,
        timestamp: server.createdAt.toISOString(),
        status: 'success'
      });
    });

    // Add blog posts
    recentBlogPosts.forEach(post => {
      activities.push({
        id: `blog-${post.id}`,
        type: 'blog',
        title: 'New Blog Post',
        description: `Published "${post.title}" by ${post.author.displayName || post.author.username}`,
        timestamp: post.publishedAt?.toISOString() || new Date().toISOString(),
        status: 'success'
      });
    });

    // Add membership purchases
    recentMemberships.forEach(membership => {
      activities.push({
        id: `membership-${membership.id}`,
        type: 'store',
        title: 'New Purchase',
        description: `${membership.tier.name} membership purchased by ${membership.user.displayName || membership.user.username}`,
        timestamp: membership.startedAt.toISOString(),
        status: 'success'
      });
    });

    // Sort by timestamp and limit results
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map(activity => ({
        ...activity,
        timestamp: getRelativeTime(new Date(activity.timestamp))
      }));

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}
