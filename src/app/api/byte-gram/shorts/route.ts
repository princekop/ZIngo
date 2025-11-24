import { NextResponse } from 'next/server'

const YT_SEARCH = 'https://www.googleapis.com/youtube/v3/search'
const YT_VIDEOS = 'https://www.googleapis.com/youtube/v3/videos'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor') || ''
    const q = searchParams.get('q') || 'shorts'
    const regionCode = searchParams.get('regionCode') || 'US'
    const limitParam = parseInt(searchParams.get('limit') || '0', 10)
    const limit = Math.min(20, Math.max(5, isNaN(limitParam) ? 0 : limitParam)) || 12

    const key = process.env.YT_API_KEY
    if (!key) {
      return NextResponse.json({ error: 'Server missing YT_API_KEY. Set it in env.' }, { status: 500 })
    }

    const searchUrl = new URL(YT_SEARCH)
    searchUrl.searchParams.set('part', 'snippet')
    searchUrl.searchParams.set('maxResults', String(limit))
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('videoDuration', 'short')
    searchUrl.searchParams.set('order', 'relevance')
    searchUrl.searchParams.set('q', q)
    searchUrl.searchParams.set('regionCode', regionCode)
    if (cursor) searchUrl.searchParams.set('pageToken', cursor)
    searchUrl.searchParams.set('key', key)

    const res = await fetch(searchUrl.toString())
    if (!res.ok) {
      const t = await res.text()
      return NextResponse.json({ error: 'YouTube search failed', details: t }, { status: 502 })
    }
    const data = await res.json()
    const ids = (data.items || []).map((it: any) => it.id?.videoId).filter(Boolean)

    let meta: any = { items: [] }
    if (ids.length) {
      const videosUrl = new URL(YT_VIDEOS)
      videosUrl.searchParams.set('part', 'snippet,statistics,contentDetails')
      videosUrl.searchParams.set('id', ids.join(','))
      videosUrl.searchParams.set('key', key)
      const r2 = await fetch(videosUrl.toString())
      meta = await r2.json()
    }

    const items = (meta.items || []).map((v: any) => ({
      id: v.id,
      title: v.snippet?.title,
      channelTitle: v.snippet?.channelTitle,
      publishedAt: v.snippet?.publishedAt,
      thumbnails: v.snippet?.thumbnails,
      stats: v.statistics,
      duration: v.contentDetails?.duration,
    }))

    return NextResponse.json({ items, nextCursor: data.nextPageToken || null })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
