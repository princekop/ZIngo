import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import fs from 'node:fs'
import path from 'node:path'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const meId = (session.user as any).id as string
  const user = await prisma.user.findUnique({ where: { id: meId } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    banner: (user as any).banner ?? null,
    status: user.status,
    description: user.description,
    theme: (user as any).theme ?? 'default',
    chatBgUrl: (user as any).chatBgUrl ?? null,
    chatBgOpacity: (user as any).chatBgOpacity ?? 30,
    effectEnabled: (user as any).effectEnabled ?? true,
    effectOpacity: (user as any).effectOpacity ?? 60,
    nitroLevel: (user as any).nitroLevel ?? 0,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const meId = (session.user as any).id as string
  const body = await req.json().catch(() => ({}))
  const { displayName, description, status, avatar, banner, theme, chatBgUrl, chatBgOpacity, effectEnabled, effectOpacity } = body || {}

  // If avatar or banner are data URLs, persist them to disk under public/uploads/users
  const ensureDir = (dir: string) => {
    try { fs.mkdirSync(dir, { recursive: true }) } catch {}
  }
  const writeDataUrl = (dataUrl: string, filename: string) => {
    const m = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl)
    if (!m) return null
    const mime = m[1]
    const b64 = m[2]
    const ext = mime.split('/')[1] || 'png'
    const buf = Buffer.from(b64, 'base64')
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'users')
    ensureDir(uploadsDir)
    const finalName = `${filename}.${ext}`
    const filePath = path.join(uploadsDir, finalName)
    fs.writeFileSync(filePath, buf)
    return `/uploads/users/${finalName}`
  }

  let avatarUrl: string | null | undefined = undefined
  let bannerUrl: string | null | undefined = undefined

  if (typeof avatar === 'string') {
    avatarUrl = avatar.startsWith('data:image') ? writeDataUrl(avatar, `${meId}-avatar-${Date.now()}`) : avatar
  } else if (avatar === null) {
    avatarUrl = null
  }

  if (typeof banner === 'string') {
    bannerUrl = banner.startsWith('data:image') ? writeDataUrl(banner, `${meId}-banner-${Date.now()}`) : banner
  } else if (banner === null) {
    bannerUrl = null
  }

  const updated = await prisma.user.update({
    where: { id: meId },
    data: {
      ...(typeof displayName === 'string' ? { displayName } : {}),
      ...(typeof description === 'string' || description === null ? { description } : {}),
      ...(typeof status === 'string' ? { status } : {}),
      ...(avatarUrl !== undefined ? { avatar: avatarUrl } : {}),
      ...(bannerUrl !== undefined ? { banner: bannerUrl } as any : {}),
      ...(typeof theme === 'string' ? { theme } : {}),
      ...(typeof chatBgUrl === 'string' || chatBgUrl === null ? { chatBgUrl } : {}),
      ...(typeof chatBgOpacity === 'number' ? { chatBgOpacity } : {}),
      ...((typeof effectEnabled === 'boolean') ? { effectEnabled } : {}),
      ...(typeof effectOpacity === 'number' ? { effectOpacity } : {}),
    },
  })

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    username: updated.username,
    displayName: updated.displayName,
    avatar: updated.avatar,
    banner: (updated as any).banner ?? null,
    status: updated.status,
    description: updated.description,
    theme: (updated as any).theme ?? 'default',
    chatBgUrl: (updated as any).chatBgUrl ?? null,
    chatBgOpacity: (updated as any).chatBgOpacity ?? 30,
    effectEnabled: (updated as any).effectEnabled ?? true,
    effectOpacity: (updated as any).effectOpacity ?? 60,
    nitroLevel: (updated as any).nitroLevel ?? 0,
    isAdmin: updated.isAdmin,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  })
}
