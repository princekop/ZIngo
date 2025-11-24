import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')

function fileFor(serverId: string) {
  return path.join(DATA_DIR, `channels.${serverId}.json`)
}

async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

async function readMap(serverId: string): Promise<Record<string, any>> {
  await ensure()
  const f = fileFor(serverId)
  try {
    const raw = await fs.readFile(f, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {}
  return {}
}

// GET all channel overrides for a server
export async function GET(_req: NextRequest, ctx: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await ctx.params
  const map = await readMap(serverId)
  return NextResponse.json(map)
}

// PATCH to upsert a specific channel's overrides, or multiple via payload
// Body can be { channelId, patch } to upsert one, or { overrides: { [channelId]: patch } }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await ctx.params
  await ensure()
  const f = fileFor(serverId)
  const current = await readMap(serverId)
  try {
    const body = await req.json()
    if (body && typeof body === 'object') {
      if (body.channelId && body.patch && typeof body.patch === 'object') {
        const cid = String(body.channelId)
        current[cid] = { ...(current[cid] || {}), ...body.patch }
      } else if (body.overrides && typeof body.overrides === 'object') {
        for (const [cid, patch] of Object.entries(body.overrides)) {
          current[cid] = { ...(current[cid] || {}), ...(patch as object) }
        }
      } else {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
      }
      await fs.writeFile(f, JSON.stringify(current, null, 2), 'utf8')
      return NextResponse.json({ ok: true, overrides: current })
    }
  } catch {}
  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
}
