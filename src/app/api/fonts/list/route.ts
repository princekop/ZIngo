import { NextRequest, NextResponse } from 'next/server'

// GET /api/fonts/list
// Proxies Google Web Fonts directory and returns a trimmed list of families.
// Set GOOGLE_FONTS_API_KEY in your environment. Do NOT hardcode keys in code.
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const sort = url.searchParams.get('sort') || 'popularity' // or alpha, date, style, trending
    const key = process.env.GOOGLE_FONTS_API_KEY
    if (!key) {
      return NextResponse.json({ error: 'Server missing GOOGLE_FONTS_API_KEY' }, { status: 500 })
    }

    const api = `https://www.googleapis.com/webfonts/v1/webfonts?key=${encodeURIComponent(key)}&sort=${encodeURIComponent(sort)}`
    const res = await fetch(api, { cache: 'no-store' })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({ error: 'Failed to fetch fonts', detail: text }, { status: 502 })
    }
    const data = await res.json().catch(() => ({}))
    const items = Array.isArray(data.items) ? data.items : []
    // Trim to a lightweight payload
    const families = items.map((it: any) => ({
      family: it.family,
      category: it.category,
      variants: it.variants,
      files: it.files,
    }))
    return NextResponse.json({ families })
  } catch (e: any) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
