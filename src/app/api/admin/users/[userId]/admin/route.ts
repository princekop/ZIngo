import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { userId } = await params
  const body = await req.json().catch(() => ({}))
  const { isAdmin } = body
  if (typeof isAdmin !== 'boolean') {
    return NextResponse.json({ error: 'isAdmin boolean required' }, { status: 400 })
  }
  await prisma.user.update({ where: { id: userId }, data: { isAdmin } })
  return NextResponse.json({ success: true, isAdmin })
}
