import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')

function fileFor(serverId: string) {
  return path.join(DATA_DIR, `invites.${serverId}.json`)
}

async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

async function readList(serverId: string): Promise<Array<{ code: string; channelId: string; createdAt: number }>> {
  await ensure()
  const f = fileFor(serverId)
  try {
    const raw = await fs.readFile(f, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return []
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const list = await readList(serverId)
  if (code) {
    const item = list.find((x) => x.code === code)
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(item)
  }
  return NextResponse.json(list)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  await ensure()
  const f = fileFor(serverId)
  const list = await readList(serverId)
  try {
    const body = await req.json()
    const channelId = String(body.channelId || '').trim()
    if (!channelId) return NextResponse.json({ error: 'channelId required' }, { status: 400 })
    let code: string = String(body.code || '').trim()
    if (!code) {
      code = Math.random().toString(36).slice(2, 10)
      while (list.some((x) => x.code === code)) {
        code = Math.random().toString(36).slice(2, 10)
      }
    }
    const item = { code, channelId, createdAt: Date.now() }
    const next = [...list, item]
    await fs.writeFile(f, JSON.stringify(next, null, 2), 'utf8')
    return NextResponse.json(item)
  } catch {}
  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
}
