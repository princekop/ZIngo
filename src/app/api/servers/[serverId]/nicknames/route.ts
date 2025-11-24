import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')
const NICKS_FILE = path.join(DATA_DIR, 'nicknames.json')

async function ensureStore() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch {}
  try {
    await fs.access(NICKS_FILE)
  } catch {
    await fs.writeFile(NICKS_FILE, JSON.stringify({}), 'utf8')
  }
}

async function readAll(): Promise<Record<string, Record<string, string>>> {
  await ensureStore()
  const raw = await fs.readFile(NICKS_FILE, 'utf8')
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
    return {}
  } catch {
    return {}
  }
}

async function writeAll(data: Record<string, Record<string, string>>) {
  await ensureStore()
  await fs.writeFile(NICKS_FILE, JSON.stringify(data, null, 2), 'utf8')
}

type NicknameRouteParams = { serverId: string }

// GET /api/servers/[serverId]/nicknames -> returns map { userId: nickname }
export async function GET(
  _req: NextRequest,
  context: { params: Promise<NicknameRouteParams> }
) {
  const { serverId } = await context.params
  const all = await readAll()
  const map = all[serverId] || {}
  return NextResponse.json(map)
}

// PATCH /api/servers/[serverId]/nicknames { userId, nickname }
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<NicknameRouteParams> }
) {
  const { serverId } = await context.params
  try {
    const body = await req.json()
    const userId = String(body.userId || '').trim()
    const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : ''
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const all = await readAll()
    const serverMap = all[serverId] || {}
    if (nickname) {
      serverMap[userId] = nickname
    } else {
      delete serverMap[userId]
    }
    all[serverId] = serverMap
    await writeAll(all)

    return NextResponse.json({ ok: true, nickname: serverMap[userId] || null })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
