import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// Utility function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Calculate read time based on content length
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// GET individual blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch blog post from database
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatar: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: {
        id: post.author.id,
        displayName: post.author.displayName,
        avatar: post.author.avatar || '/api/placeholder/40/40'
      },
      category: post.category?.name || null,
      tags: post.tags.map((postTag: any) => postTag.tag.name),
      status: post.status,
      featured: post.featured,
      readTime: post.readTime,
      views: post.views,
      likes: post.likes,
      comments: post._count.comments,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = (session.user as any).id || session.user.email;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
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

    const { id } = await params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = generateSlug(body.title);
    
    // Calculate read time
    const readTime = calculateReadTime(body.content);

    // Find or create category
    let categoryId = null;
    if (body.category) {
      const category = await prisma.blogCategory.upsert({
        where: { name: body.category },
        update: {},
        create: {
          name: body.category,
          slug: generateSlug(body.category),
          color: '#3B82F6'
        }
      });
      categoryId = category.id;
    }

    // Update the blog post
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        slug: slug,
        excerpt: body.excerpt,
        content: body.content,
        categoryId: categoryId,
        status: body.status || 'DRAFT',
        featured: body.featured || false,
        readTime: readTime,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
        customCSS: body.cardStyle ? JSON.stringify(body.cardStyle) : null
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatar: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    // Handle tags if provided
    if (body.tags && Array.isArray(body.tags)) {
      // Remove existing tags
      await prisma.blogPostTag.deleteMany({
        where: { postId: id }
      });
      
      // Add new tags
      for (const tagName of body.tags) {
        if (tagName.trim()) {
          const tag = await prisma.blogTag.upsert({
            where: { name: tagName.trim() },
            update: {},
            create: {
              name: tagName.trim(),
              slug: generateSlug(tagName.trim()),
              color: '#6B7280'
            }
          });
          
          await prisma.blogPostTag.create({
            data: {
              postId: id,
              tagId: tag.id
            }
          });
        }
      }
    }

    return NextResponse.json({
      id: updatedPost.id,
      title: updatedPost.title,
      slug: updatedPost.slug,
      excerpt: updatedPost.excerpt,
      content: updatedPost.content,
      author: {
        id: updatedPost.author.id,
        displayName: updatedPost.author.displayName,
        avatar: updatedPost.author.avatar || '/api/placeholder/40/40'
      },
      category: updatedPost.category?.name || null,
      tags: body.tags || [],
      status: updatedPost.status,
      featured: updatedPost.featured,
      readTime: updatedPost.readTime,
      views: updatedPost.views,
      likes: updatedPost.likes,
      publishedAt: updatedPost.publishedAt,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = (session.user as any).id || session.user.email;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
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

    const { id } = await params;

    // Delete the blog post from database
    await prisma.blogPost.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: 'Blog post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
