import { NextRequest, NextResponse } from 'next/server'

// Simple proxy to Stipop search API so we never expose the API key on the client.
// Usage: GET /api/stickers/search?q=happy&limit=30
// Returns: { items: Array<{ url: string; title?: string }> }
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || ''
    const limit = url.searchParams.get('limit') || '30'

    const apiKey = process.env.STIPOP_API_KEY || '61d15f31ca769b85e6ce49d860ebcb97'
    const endpoint = q
      ? `https://messenger.stipop.io/v1/search?limit=${encodeURIComponent(limit)}&q=${encodeURIComponent(q)}`
      : `https://messenger.stipop.io/v1/trending?limit=${encodeURIComponent(limit)}`

    const res = await fetch(endpoint, {
      headers: {
        apikey: apiKey,
      } as any,
      cache: 'no-store',
    })
    if (!res.ok) {
      return NextResponse.json({ items: [] })
    }
    const data = await res.json()
    // Normalize: expect data.body or data.data depending on Stipop version
    const stickers = (data?.body?.stickers || data?.data?.stickers || data?.stickers || []) as any[]
    const items = stickers.map((s: any) => ({ url: s?.stickerImg || s?.url || '', title: s?.keyword || s?.title || '' })).filter((x) => x.url)
    return NextResponse.json({ items })
  } catch (e) {
    return NextResponse.json({ items: [] })
  }
}
