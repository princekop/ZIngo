 'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, Globe, Music, Copy, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import AssetPicker from '@/components/AssetPicker'

export type UserProfileModalProps = {
  isOpen: boolean
  onClose: () => void
  displayName?: string
  username: string
  bannerUrl?: string | null
  avatarUrl?: string | null
  avatarDecoration?: string | null
  status?: string
  presenceClass?: string // tailwind color class for presence dot
  roleName?: string | null
  roleColor?: string | null
  createdAt?: string | Date | null
  description?: string | null
  badges?: Array<{ icon?: React.ReactNode; label: string; colorClass?: string }>
  connections?: Array<{ icon?: React.ReactNode; label: string; href?: string }>
  topLinkLabel?: string | null // e.g. 'discord.gg/BladeMC'
  topLinkHref?: string | null
  roles?: Array<{ id: string; name: string; color?: string | null; gradient?: string | null; animated?: boolean }>
}

export default function UserProfileModal(props: UserProfileModalProps) {
  const {
    isOpen,
    onClose,
    displayName,
    username,
    avatarUrl,
    avatarDecoration, // reserved for future decoration support
    status,
    roleName,
    createdAt,
    description,
    badges,
    connections,
    topLinkLabel,
    topLinkHref,
    roles = [],
  } = props

  if (!isOpen) return null

  const router = useRouter()

  const [statusValue, setStatusValue] = useState<'online' | 'idle' | 'dnd' | 'offline'>(
    (status as any) || 'online'
  )

  useEffect(() => {
    if (status) setStatusValue(status as any)
  }, [status])

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const presenceColor = {
    online: 'bg-emerald-500',
    idle: 'bg-amber-500',
    dnd: 'bg-rose-500',
    offline: 'bg-gray-500',
  }[statusValue || 'online']

  const copyUsername = async () => {
    try {
      await navigator.clipboard.writeText(username)
      toast.success('Username copied', { duration: 1000 })
    } catch {}
  }

  // Edit mode state
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nameField, setNameField] = useState(displayName || username)
  const [statusField, setStatusField] = useState(statusValue as string)
  const [bioField, setBioField] = useState(description || '')
  const [avatarField, setAvatarField] = useState<string | null>(avatarUrl || null)
  const [bannerField, setBannerField] = useState<string | null>(props.bannerUrl || null)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const bannerInputRef = useRef<HTMLInputElement | null>(null)
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false)

  useEffect(() => {
    if (editing) {
      setNameField(displayName || username)
      setStatusField(statusValue)
      setBioField(description || '')
      setAvatarField(avatarUrl || null)
      setBannerField(props.bannerUrl || null)
    }
  }, [editing])

  const onSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: nameField, description: bioField, status: statusField, avatar: avatarField, banner: bannerField }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Profile updated', { duration: 1200 })
      // Reflect locally and re-fetch persisted user
      setStatusValue(statusField as any)
      try {
        const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.ok ? r.json() : null)
        if (me) {
          setAvatarField(me.avatar ?? null)
          setBannerField(me.banner ?? null)
          setNameField(me.displayName || me.username || nameField)
          // Notify rest of app (sidebar/header) to refresh if they listen
          window.dispatchEvent(new CustomEvent('profileUpdated', { detail: me }))
        }
      } catch {}
      setEditing(false)
    } catch (e) {
      toast.error('Failed to update profile', { duration: 1400 })
    } finally {
      setSaving(false)
    }
  }

  // Local helpers for file -> data URL preview
  const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* Modal */}
      <div className="relative w-full overflow-hidden rounded-[20px] border border-white/12 bg-black/80 shadow-2xl sm:max-w-md md:max-w-lg lg:max-w-xl">
        {/* Banner with curved mask */}
        <div className="relative h-40 w-full overflow-visible">
          {bannerField ? (
            <img src={bannerField} alt="banner" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-teal-500/25 via-teal-400/20 to-amber-600/25" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {/* Change banner button in edit mode */}
          {editing && (
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button size="sm" variant="outline" className="rounded-lg border-white/20 bg-black/40 text-white/90 hover:bg-black/60" onClick={() => bannerInputRef.current?.click()}>
                Change banner
              </Button>
              <Button size="sm" variant="outline" className="rounded-lg border-white/20 bg-black/40 text-white/90 hover:bg-black/60" onClick={() => setBannerPickerOpen(true)}>
                Choose from uploads
              </Button>
              <input ref={bannerInputRef} type="file" accept="image/*" hidden onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f) {
                  const url = await toDataUrl(f)
                  setBannerField(url)
                }
              }} />
            </div>
          )}

          {/* Overlapping avatar & header */}
          <div className="absolute -bottom-10 left-5 right-5 z-10 flex items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={(avatarField || '')} alt={displayName || username} className="h-20 w-20 rounded-2xl border border-white/10 object-cover shadow-xl" />
                {props.avatarDecoration && (
                  <img
                    src={props.avatarDecoration}
                    alt="avatar decoration"
                    className="pointer-events-none select-none absolute -top-2 -left-2 h-24 w-24 object-contain"
                    aria-hidden
                  />
                )}
                <span className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full ring-2 ring-black ${presenceColor}`} />
                {editing && (
                  <>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                      <button className="rounded-lg border border-white/20 bg-black/60 px-2 py-0.5 text-[11px] text-white/90 hover:bg-black/70" onClick={() => avatarInputRef.current?.click()}>Change</button>
                      <button className="rounded-lg border border-white/20 bg-black/60 px-2 py-0.5 text-[11px] text-white/90 hover:bg-black/70" onClick={() => setAvatarPickerOpen(true)}>Choose</button>
                    </div>
                    <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (f) {
                        const url = await toDataUrl(f)
                        setAvatarField(url)
                      }
                    }} />
                  </>
                )}
              </div>
              <div className="pb-2">
                <div className="text-xl font-semibold leading-tight text-white">{displayName || username}</div>
                <div className="text-sm text-white/70">@{username}</div>
              </div>
            </div>
            {roleName && (
              <span className="mb-3 rounded-full border border-amber-600/30 bg-gradient-to-r from-amber-600/20 to-amber-600/10 px-3 py-1 text-xs text-white/90 shadow-sm">
                {roleName}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-16 pb-5">
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {!editing ? (
              <>
                <Button
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-teal-500 to-amber-600 text-white shadow-md shadow-teal-900/20 hover:shadow-amber-600/30"
                  onClick={() => { router.push('/profile/edit/appearance'); onClose() }}
                >
                  <Edit3 className="mr-1 h-4 w-4" /> Edit Profile
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white/90 hover:bg-white/10" onClick={copyUsername}>
                  <Copy className="mr-1 h-4 w-4" /> Copy Username
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" disabled={saving} className="rounded-xl bg-gradient-to-r from-teal-500 to-amber-600 text-white" onClick={onSave}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setEditing(false)}>Cancel</Button>
              </>
            )}
            <div className="ml-auto">
              <Button size="icon" variant="ghost" className="rounded-xl hover:bg-white/10" onClick={onClose} aria-label="Close profile">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Theme colors are applied across components; chips removed as requested */}
          {/* Cards grid */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* About */}
            <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/70">About</div>
              {!editing ? (
                <div className="text-sm text-white/90 min-h-[48px]">{bioField || 'No bio yet.'}</div>
              ) : (
                <Textarea className="min-h-[80px] rounded-xl border-white/15 bg-black/30 text-sm" value={bioField} onChange={(e) => setBioField(e.target.value)} placeholder="Tell people about yourself…" />
              )}
              {createdAt && (
                <div className="mt-3 text-xs text-white/60">Member since {new Date(createdAt as any).toLocaleDateString()}</div>
              )}
            </div>

            {/* Roles */}
            <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/70">Roles</div>
              {roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {roles.map((r) => {
                    const style = r.gradient
                      ? `bg-gradient-to-r ${r.gradient} ${r.animated ? 'animate-gradient-slow bg-[length:200%_200%]' : ''}`
                      : ''
                    return (
                      <Badge
                        key={r.id}
                        variant="outline"
                        className={`rounded-full border-white/15 bg-white/5 text-white/90 ${style || ''}`}
                        style={!r.gradient && r.color ? { backgroundColor: r.color, color: '#0b0b0b' } : undefined}
                      >
                        {r.name}
                      </Badge>
                    )
                  })}
                </div>
              ) : (
                <div className="text-sm text-white/60">No roles assigned.</div>
              )}
            </div>

            {/* Profile details editor (name/status) */}
            <div className="md:col-span-2 rounded-2xl border border-white/12 bg-white/5 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/70">Profile</div>
              {!editing ? (
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
                  <div><span className="text-white/60">Name:</span> {nameField}</div>
                  <div><span className="text-white/60">Status:</span> {statusValue}</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-white/60 mb-1">Display name</div>
                    <Input className="rounded-xl border-white/15 bg-black/30" value={nameField} onChange={(e) => setNameField(e.target.value)} />
                  </div>
                  <div>
                    <div className="text-xs text-white/60 mb-1">Status</div>
                    <Select value={statusField} onValueChange={(v) => setStatusField(v)}>
                      <SelectTrigger className="rounded-xl border-white/15 bg-black/30">
                        <SelectValue placeholder="online" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">online</SelectItem>
                        <SelectItem value="idle">idle</SelectItem>
                        <SelectItem value="dnd">dnd</SelectItem>
                        <SelectItem value="offline">offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Connections */}
            {(props.connections && props.connections.length > 0) && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/70">Connections</div>
                <div className="flex flex-wrap gap-2">
                  {props.connections!.map((c, i) => (
                    <a key={i} href={c.href || '#'} target={c.href ? '_blank' : undefined} rel={c.href ? 'noreferrer' : undefined} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-1.5 text-sm text-white/90 hover:bg-black/40">
                      {c.icon || <Globe className="h-4 w-4" />} {c.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Asset pickers */}
        <AssetPicker
          open={avatarPickerOpen}
          onClose={() => setAvatarPickerOpen(false)}
          onSelect={(url) => setAvatarField(url)}
          title="Choose avatar"
        />
        <AssetPicker
          open={bannerPickerOpen}
          onClose={() => setBannerPickerOpen(false)}
          onSelect={(url) => setBannerField(url)}
          title="Choose banner"
        />
      </div>
    </div>
  )
}
