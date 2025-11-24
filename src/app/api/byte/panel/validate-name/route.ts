import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const name = String(searchParams.get('name') || '')
    const serverId = String(searchParams.get('serverId') || '')
    const slug = slugify(name)
    if (!slug) return NextResponse.json({ valid: false, reason: 'Invalid name' })
    if (!serverId) return NextResponse.json({ valid: false, reason: 'Missing serverId' })
    const exists = await prisma.panel.findFirst({ where: { serverId, slug } })
    if (exists) return NextResponse.json({ valid: false, reason: 'Taken' })
    return NextResponse.json({ valid: true, slug })
  } catch (e) {
    return NextResponse.json({ valid: false, reason: 'Error' }, { status: 500 })
  }
}
