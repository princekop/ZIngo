import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

function CodeFrame({ parts }: { parts: { html?: string, css?: string, js?: string } }) {
  const html = parts?.html || ''
  const css = parts?.css || ''
  const js = parts?.js || ''
  const srcDoc = `<!doctype html><html><head><meta charset=\"utf-8\"/><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`
  return (
    <iframe
      className="w-full h-[380px] rounded-xl border border-white/10 bg-black"
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-same-origin"
    />
  )
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  try {
    const user = await prisma.user.findUnique({ where: { username }, select: { id: true, displayName: true, description: true, avatar: true } })
    const client: any = prisma as any
    const profile = user && client.userProfile ? await client.userProfile.findUnique({ where: { userId: user.id } }) : null
    const title = profile?.pageTitle || user?.displayName || username
    const desc = profile?.bio || user?.description || `Profile of ${username}`
    const image = profile?.customBanner || user?.avatar || undefined
    return { title, description: desc, openGraph: { title, description: desc, images: image ? [image] : [] } }
  } catch {
    return { title: username }
  }
}

export default async function PublicUserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, displayName: true, avatar: true } })
  if (!user) return (<div className="min-h-screen flex items-center justify-center text-white/70">User not found</div>)
  const client: any = prisma as any
  const profile = client.userProfile ? await client.userProfile.findUnique({ where: { userId: user.id } }) : null
  const theme = String(profile?.theme || 'emerald-500')
  const [fam, shadeStr] = theme.split('-')
  const shade = shadeStr || '500'
  const chip = `border-${fam}-${shade}/30 bg-${fam}-${shade}/10 text-${fam}-300 hover:bg-${fam}-500/15`

  return (
    <div className="min-h-screen text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {profile?.bgType === 'gradient' && (
          <div className="w-full h-full" style={{ background: profile.bgValue || '' }} />
        )}
        {profile?.bgType === 'image' && (
          <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: `url(${profile.bgValue})` }} />
        )}
        {profile?.bgType === 'color' && (
          <div className="w-full h-full" style={{ backgroundColor: profile.bgValue || '#0b0d12' }} />
        )}
        {profile?.bgType === 'video' && profile.bgValue && (
          <video className="w-full h-full object-cover" src={profile.bgValue} autoPlay loop muted playsInline />
        )}
        {!profile?.bgType && (
          <div className="w-full h-full bg-gradient-to-br from-black via-zinc-900 to-zinc-800" />
        )}
      </div>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="w-full h-40 rounded-2xl bg-black/30 border border-white/10 overflow-hidden" style={{ backgroundImage: profile?.customBanner ? `url(${profile.customBanner})` : undefined, backgroundSize:'cover', backgroundPosition:'center' }} />
        <div className="-mt-10 w-24 h-24 rounded-full border-2 border-white/30 bg-black/40 overflow-hidden" style={{ backgroundImage: (profile?.customAvatar || user.avatar) ? `url(${profile?.customAvatar || user.avatar})` : undefined, backgroundSize:'cover', backgroundPosition:'center' }} />
        <h1 className="mt-3 text-2xl font-semibold">{profile?.pageTitle || user.displayName || username}</h1>
        {profile?.bio && <p className="text-white/70 max-w-2xl mt-1 whitespace-pre-wrap">{profile.bio}</p>}
        <div className="flex gap-3 mt-3 text-sm">
          {profile?.youtubeUrl && <a className={`px-3 py-1 rounded-full border ${chip}`} href={profile.youtubeUrl} target="_blank">YouTube</a>}
          {profile?.instagramUrl && <a className={`px-3 py-1 rounded-full border ${chip}`} href={profile.instagramUrl} target="_blank">Instagram</a>}
          {profile?.discordUrl && <a className={`px-3 py-1 rounded-full border ${chip}`} href={profile.discordUrl} target="_blank">Discord</a>}
        </div>
        {profile?.audioUrl && (
          <audio src={profile.audioUrl} controls className="mt-3 max-w-[90%]" />
        )}

        {/* Sections */}
        <div className="mt-8 space-y-6">
          {(Array.isArray(profile?.sections) ? profile!.sections as any[] : []).map((s, i) => (
            <section key={i} className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
              <div className="text-sm text-white/60 mb-1">{String(s?.kind || 'section').toUpperCase()}</div>
              {s?.title && <h2 className="text-xl font-semibold mb-1">{s.title}</h2>}
              {s?.subtitle && <div className="text-white/70 mb-2">{s.subtitle}</div>}
              {s?.text && <p className="text-white/80 whitespace-pre-wrap">{s.text}</p>}
              {s?.kind === 'code' && s?.parts && (
                <div className="mt-2">
                  <CodeFrame parts={s.parts} />
                </div>
              )}
              {Array.isArray(s?.images) && s.images.length > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {s.images.map((img: any, j: number) => (
                    <img key={j} src={img.url} alt={img.caption || ''} className="rounded-xl border border-white/10 w-full h-44 object-cover" />
                  ))}
                </div>
              )}
              {Array.isArray(s?.links) && s.links.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.links.map((lnk: any, j: number) => (
                    <a key={j} href={lnk.url} target="_blank" className={`px-3 py-1 rounded-full border ${chip}`}>{lnk.label || lnk.url}</a>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </main>

      {/* safelist for dynamic classes */}
      <div className="hidden">
        {['neutral','stone','zinc','slate','gray','red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose'].map(f => (
          <div key={f}>
            {[50,100,200,300,400,500,600,700,800,900,950].map(s => (
              <div key={s} className={`text-${f}-${s} bg-${f}-${s}/10 border-${f}-${s}/30`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
