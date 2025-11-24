import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// In-memory storage for blog posts (until database is ready)
let blogPosts: any[] = [
  {
    id: '1',
    title: 'Building the Future of Discord Communities',
    slug: 'building-future-discord-communities',
    excerpt: 'Discover how DarkByte is revolutionizing Discord server management with cutting-edge features and premium tools.',
    content: '<p>Full content here...</p>',
    coverImage: null,
    author: {
      id: '1',
      displayName: 'Alex Chen',
      avatar: '/api/placeholder/40/40'
    },
    category: {
      id: '1',
      name: 'Technology',
      color: '#3B82F6'
    },
    tags: [],
    media: [],
    status: 'PUBLISHED',
    featured: true,
    readTime: 5,
    views: 2340,
    likes: 124,
    publishedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    customCSS: null,
    fontFamily: null,
    textColor: null,
    backgroundColor: null,
    _count: { comments: 18 }
  }
];

interface BlogPostResponse {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  category?: {
    id: string;
    name: string;
    color?: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  media: Array<{
    id: string;
    type: string;
    url: string;
    alt?: string;
    caption?: string;
  }>;
  status: string;
  featured: boolean;
  readTime?: number;
  views: number;
  likes: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  customCSS?: string;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
}

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'PUBLISHED';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    // Build where clause
    const where: any = {};

    // Handle status filter
    if (status && status !== 'all') {
      where.status = status.toUpperCase() as any;
    }
    // If status is 'all', don't add status filter to show all posts

    if (category && category !== 'All') {
      where.category = {
        name: category
      };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          excerpt: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Fetch real blog posts from database
    console.log('Fetching posts with where clause:', JSON.stringify(where, null, 2));
    const posts = await prisma.blogPost.findMany({
      where,
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
        media: {
          select: {
            id: true,
            type: true,
            url: true,
            alt: true,
            caption: true
          },
          orderBy: {
            position: 'asc'
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Transform data to match interface
    const transformedPosts: BlogPostResponse[] = posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      coverImage: post.coverImage || undefined,
      author: {
        id: post.author.id,
        name: post.author.displayName,
        avatar: post.author.avatar || '/api/placeholder/40/40'
      },
      category: post.category ? {
        id: post.category.id,
        name: post.category.name,
        color: post.category.color || undefined
      } : undefined,
      tags: post.tags.map((postTag: any) => ({
        id: postTag.tag.id,
        name: postTag.tag.name,
        color: postTag.tag.color || undefined
      })),
      media: post.media.map((media: any) => ({
        id: media.id,
        type: media.type,
        url: media.url,
        alt: media.alt || undefined,
        caption: media.caption || undefined
      })),
      status: post.status,
      featured: post.featured,
      readTime: post.readTime || undefined,
      views: post.views,
      likes: post.likes,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      customCSS: post.customCSS || undefined,
      fontFamily: post.fontFamily || undefined,
      textColor: post.textColor || undefined,
      backgroundColor: post.backgroundColor || undefined
    }));

    console.log(`Found ${posts.length} posts, transformed ${transformedPosts.length} posts`);
    return NextResponse.json(transformedPosts, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Debug session info
    console.log('Session user:', JSON.stringify(session.user, null, 2));
    
    // Get user ID from session - check multiple possible fields
    const userId = (session.user as any).id || session.user.email;
    
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 401 }
      );
    }

    // Find or create user in database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: session.user.email || '' }
        ]
      }
    });

    console.log('Found user:', user ? user.id : 'null');

    if (!user && session.user.email) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          username: session.user.email.split('@')[0],
          displayName: session.user.name || session.user.email.split('@')[0],
          password: 'oauth-user', // Placeholder for OAuth users
          avatar: (session.user as any).image || null
        }
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found or could not be created' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const baseSlug = generateSlug(body.title);
    let slug = baseSlug;
    let counter = 1;
    
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

    // Create the blog post
    console.log('Creating blog post with authorId:', user.id);
    const newPost = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: slug,
        excerpt: body.excerpt,
        content: body.content,
        authorId: user.id,
        categoryId: categoryId,
        status: body.status || 'PUBLISHED',
        featured: body.featured || false,
        readTime: readTime,
        publishedAt: (body.status || 'PUBLISHED') === 'PUBLISHED' ? new Date() : null,
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
              postId: newPost.id,
              tagId: tag.id
            }
          });
        }
      }
    }

    return NextResponse.json({
      id: newPost.id,
      title: newPost.title,
      slug: newPost.slug,
      excerpt: newPost.excerpt,
      content: newPost.content,
      author: {
        id: newPost.author.id,
        displayName: newPost.author.displayName,
        avatar: newPost.author.avatar || '/api/placeholder/40/40'
      },
      category: newPost.category?.name || null,
      tags: body.tags || [],
      status: newPost.status,
      featured: newPost.featured,
      readTime: newPost.readTime,
      views: newPost.views,
      likes: newPost.likes,
      publishedAt: newPost.publishedAt,
      createdAt: newPost.createdAt,
      updatedAt: newPost.updatedAt
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
