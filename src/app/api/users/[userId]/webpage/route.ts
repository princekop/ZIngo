import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET: public profile settings (no auth required for reading)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const client: any = prisma as any
    if (!client.userProfile) {
      return NextResponse.json({ error: 'Profile model not migrated. Run prisma migrate & generate.' }, { status: 503 })
    }
    const profile = await client.userProfile.findUnique({ where: { userId } })
    return NextResponse.json(profile || null)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// PUT: update full profile settings (auth: same user)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { userId } = await params
    if (session.user.id !== userId && !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await req.json()
    const {
      subdomain,
      pageTitle,
      bio,
      bgType,
      bgValue,
      audioUrl,
      customAvatar,
      customBanner,
      youtubeUrl,
      instagramUrl,
      discordUrl,
      theme,
    } = body || {}

    if (subdomain) {
      const ok = /^[a-z0-9]([a-z0-9-]{1,30})?[a-z0-9]$/.test(subdomain)
      if (!ok) return NextResponse.json({ error: 'Invalid subdomain' }, { status: 400 })
      const client: any = prisma as any
      if (!client.userProfile) {
        return NextResponse.json({ error: 'Profile model not migrated. Run prisma migrate & generate.' }, { status: 503 })
      }
      const taken = await client.userProfile.findFirst({ where: { subdomain, NOT: { userId } } })
      if (taken) return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 })
    }

    const client2: any = prisma as any
    if (!client2.userProfile) {
      return NextResponse.json({ error: 'Profile model not migrated. Run prisma migrate & generate.' }, { status: 503 })
    }
    // fetch existing to know old subdomain
    const existing = await client2.userProfile.findUnique({ where: { userId } })
    const oldSub = existing?.subdomain || null
    const profile = await client2.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        subdomain: subdomain || null,
        pageTitle: pageTitle || undefined,
        bio: bio || undefined,
        bgType: bgType || undefined,
        bgValue: bgValue || undefined,
        audioUrl: audioUrl || undefined,
        customAvatar: customAvatar || undefined,
        customBanner: customBanner || undefined,
        youtubeUrl: youtubeUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        discordUrl: discordUrl || undefined,
        theme: theme || undefined,
      },
      update: {
        subdomain: subdomain ?? undefined,
        pageTitle: pageTitle ?? undefined,
        bio: bio ?? undefined,
        bgType: bgType ?? undefined,
        bgValue: bgValue ?? undefined,
        audioUrl: audioUrl ?? undefined,
        customAvatar: customAvatar ?? undefined,
        customBanner: customBanner ?? undefined,
        youtubeUrl: youtubeUrl ?? undefined,
        instagramUrl: instagramUrl ?? undefined,
        discordUrl: discordUrl ?? undefined,
        theme: theme ?? undefined,
      },
    })

    // Orchestrate DNS changes if subdomain changed
    try {
      const targetSub = subdomain ?? null
      if (oldSub && oldSub !== targetSub) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/dns/hostinger/records`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', subdomain: oldSub })
        }).catch(()=>{})
      }
      if (targetSub && oldSub !== targetSub) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/dns/hostinger/records`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', subdomain: targetSub })
        }).catch(()=>{})
      }
    } catch {}

    return NextResponse.json(profile)
  } catch (e) {
    console.error('profile update failed', e)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
