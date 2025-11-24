import { NextRequest, NextResponse } from 'next/server'

// Tenor proxy (never expose key on client). If TENOR_KEY is missing, fall back to demo key.
// GET /api/gifs/search?q=happy&limit=30
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || ''
    const limit = Number(url.searchParams.get('limit') || '30')
    const key = process.env.TENOR_KEY || 'LIVDSRZULELA'
    const endpoint = q
      ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${encodeURIComponent(key)}&limit=${limit}&media_filter=gif,tinygif,mediumgif`
      : `https://tenor.googleapis.com/v2/featured?key=${encodeURIComponent(key)}&limit=${limit}&media_filter=gif,tinygif,mediumgif`
    const res = await fetch(endpoint, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ items: [] })
    const data = await res.json() as any
    const items = (data.results || []).map((r: any) => ({
      url: r.media_formats?.gif?.url || r.media_formats?.tinygif?.url || r.media_formats?.mediumgif?.url || '',
      title: r.content_description || '',
    })).filter((x: any) => x.url)
    return NextResponse.json({ items })
  } catch (e) {
    return NextResponse.json({ items: [] })
  }
}
