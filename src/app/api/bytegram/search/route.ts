import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query.trim()) {
      return NextResponse.json({ results: [] })
    }

    // TODO: Implement full-text search in database
    // Search for:
    // - Posts by content
    // - Users by username/displayName
    // - Hashtags

    const mockResults = [
      {
        id: '1',
        author: {
          id: 'user1',
          name: 'Alex Chen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          username: 'alexchen',
        },
        content: `Post about ${query}`,
        media: {
          type: 'image' as const,
          url: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=800&h=600&fit=crop',
          aspectRatio: '1:1',
        },
        likes: 234,
        comments: 45,
        timestamp: new Date(),
        isLiked: false,
      },
    ]

    return NextResponse.json({ results: mockResults })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
