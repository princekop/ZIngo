import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// GET user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Fetch user with profile data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        decorations: {
          where: { isEquipped: true },
          include: {
            decoration: true
          }
        },
        _count: {
          select: {
            blogPosts: true,
            decorations: true,
            uploads: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Transform data for response
    const profileData = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatar: user.avatar,
      banner: user.banner,
      status: user.status,
      description: user.description,
      theme: user.theme,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      
      // Profile-specific data
      profile: user.profile ? {
        subdomain: user.profile.subdomain,
        pageTitle: user.profile.pageTitle,
        bio: user.profile.bio,
        bgType: user.profile.bgType,
        bgValue: user.profile.bgValue,
        audioUrl: user.profile.audioUrl,
        customAvatar: user.profile.customAvatar,
        customBanner: user.profile.customBanner,
        youtubeUrl: user.profile.youtubeUrl,
        instagramUrl: user.profile.instagramUrl,
        discordUrl: user.profile.discordUrl,
        theme: user.profile.theme,
        updatedAt: user.profile.updatedAt
      } : null,
      
      // Current decoration
      currentDecoration: user.decorations[0]?.decoration || null,
      
      // Stats
      stats: {
        blogPosts: user._count.blogPosts,
        decorations: user._count.decorations,
        uploads: user._count.uploads
      }
    };

    return NextResponse.json(profileData, { status: 200 });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession();
    const { userId } = await params;
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: (session.user as any).id },
          { email: session.user.email || '' }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Check if user can edit this profile (own profile or admin)
    if (user.id !== userId && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: body.displayName || undefined,
        avatar: body.avatar || undefined,
        banner: body.banner || undefined,
        status: body.status || undefined,
        description: body.description || undefined,
        theme: body.theme || undefined,
        avatarDecoration: body.avatarDecoration || undefined
      }
    });

    // Update or create profile
    const profileData = {
      subdomain: body.profile?.subdomain || undefined,
      pageTitle: body.profile?.pageTitle || undefined,
      bio: body.profile?.bio || undefined,
      bgType: body.profile?.bgType || undefined,
      bgValue: body.profile?.bgValue || undefined,
      audioUrl: body.profile?.audioUrl || undefined,
      customAvatar: body.profile?.customAvatar || undefined,
      customBanner: body.profile?.customBanner || undefined,
      youtubeUrl: body.profile?.youtubeUrl || undefined,
      instagramUrl: body.profile?.instagramUrl || undefined,
      discordUrl: body.profile?.discordUrl || undefined,
      theme: body.profile?.theme || undefined
    };

    // Remove undefined values
    const cleanProfileData = Object.fromEntries(
      Object.entries(profileData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanProfileData).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: userId },
        update: cleanProfileData,
        create: {
          userId: userId,
          ...cleanProfileData
        }
      });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
