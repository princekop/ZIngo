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

    // Fetch blog statistics from database
    const [totalPosts, publishedPosts, draftPosts, totalViews, totalLikes] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({
        where: {
          status: 'PUBLISHED'
        }
      }),
      prisma.blogPost.count({
        where: {
          status: 'DRAFT'
        }
      }),
      prisma.blogPost.aggregate({
        _sum: {
          views: true
        }
      }),
      prisma.blogPost.aggregate({
        _sum: {
          likes: true
        }
      })
    ]);

    const stats = {
      totalPosts: totalPosts,
      published: publishedPosts,
      drafts: draftPosts,
      totalViews: totalViews._sum.views || 0,
      totalLikes: totalLikes._sum.likes || 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog statistics' },
      { status: 500 }
    );
  }
}
