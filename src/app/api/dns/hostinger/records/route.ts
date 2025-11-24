import { NextRequest, NextResponse } from 'next/server'

const API_BASE = 'https://api.hostinger.com'

async function getZoneId(domain: string, token: string) {
  const res = await fetch(`${API_BASE}/dns/v2/zones?search=${encodeURIComponent(domain)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })
  if (!res.ok) throw new Error('Failed to list zones')
  const data: any = await res.json()
  // Expect { data: [{ id, name, ...}], ... }
  const zones = (data?.data ?? data) as any[]
  const zone = zones.find((z: any) => z.name === domain || z.domain === domain) || zones[0]
  if (!zone?.id) throw new Error('Zone not found')
  return zone.id as string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body.action || '').toLowerCase() as 'create' | 'delete'
    const subdomain = String(body.subdomain || '').toLowerCase()

    const token = process.env.HOSTINGER_API_TOKEN
    const domain = process.env.HOSTINGER_DOMAIN
    const target = process.env.SUBDOMAIN_CNAME_TARGET

    if (!token || !domain) return NextResponse.json({ error: 'Hostinger env not set' }, { status: 400 })
    if (!subdomain || !/^[a-z0-9]([a-z0-9-]{1,30})?[a-z0-9]$/.test(subdomain)) {
      return NextResponse.json({ error: 'Invalid subdomain' }, { status: 400 })
    }

    const zoneId = await getZoneId(domain, token)

    if (action === 'create') {
      if (!target) return NextResponse.json({ error: 'SUBDOMAIN_CNAME_TARGET not set' }, { status: 400 })
      const payload = {
        type: 'CNAME',
        name: subdomain,
        value: target,
        ttl: 300,
      }
      const res = await fetch(`${API_BASE}/dns/v2/zones/${zoneId}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const t = await res.text()
        return NextResponse.json({ error: 'Create failed', detail: t }, { status: 502 })
      }
      return NextResponse.json({ ok: true, created: `${subdomain}.${domain}` })
    }

    if (action === 'delete') {
      // List all records, find matching CNAME name, delete
      const listRes = await fetch(`${API_BASE}/dns/v2/zones/${zoneId}/records?type=CNAME&name=${encodeURIComponent(subdomain)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      })
      if (!listRes.ok) return NextResponse.json({ error: 'List records failed' }, { status: 502 })
      const data: any = await listRes.json()
      const records = (data?.data ?? data) as any[]
      if (!records?.length) return NextResponse.json({ ok: true, deleted: 0 })
      let deleted = 0
      for (const r of records) {
        const id = r.id || r.recordId
        if (!id) continue
        const del = await fetch(`${API_BASE}/dns/v2/zones/${zoneId}/records/${id}`, {
          method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        })
        if (del.ok) deleted++
      }
      return NextResponse.json({ ok: true, deleted })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: 'DNS proxy failed', message: e?.message }, { status: 500 })
  }
}
