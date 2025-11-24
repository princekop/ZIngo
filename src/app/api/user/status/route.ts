import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { status: true } })
    return NextResponse.json({ status: user?.status ?? 'online' })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { status } = await request.json()
    const allowed = new Set(['online','idle','dnd','invisible'])
    const next = typeof status === 'string' && allowed.has(status) ? status : 'online'
    await prisma.user.update({ where: { id: session.user.id }, data: { status: next } })
    return NextResponse.json({ success: true, status: next })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
