'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Hash, Bell, Shield, Menu, Send, Paperclip, Smile, Reply, MoreHorizontal, Users, Trash2, BarChart3, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ShinyButton from '@/components/ui/shiny-button'
import PollCard from '@/components/poll/PollCard'
import GiveawayCard from '@/components/giveaway/GiveawayCard'
import { Input } from '@/components/ui/input'
import Avatar from '@/components/Avatar'
import VoiceChannel from './VoiceChannel'
import { format } from 'date-fns'

interface Message {
  id: string
  content: string
  userId: string
  username: string
  avatar: string
  timestamp: Date
  mentions: string[]
  attachments: string[]
  reactions: { emoji: string; users: string[] }[]
  replyTo?: {
    id: string
    content: string
    username: string
  }
  deleted?: boolean
}

interface Channel {
  id: string
  name: string
  type: 'text' | 'voice' | 'announcement'
  serverId?: string
}

// Parse a simple giveaway content from our creator modal
function parseGiveawayFromText(txt: string): { prize: string, hostedBy?: string, notes?: string, endsAt?: number } | null {
  try {
    const lines = txt.split(/\r?\n/)
    if (!/^🎉\s*GIVEAWAY:\s*/.test(lines[0] || '')) return null
    const prize = (lines[0] || '').replace(/^🎉\s*GIVEAWAY:\s*/,'').trim()
    let hostedBy: string | undefined
    let notes: string | undefined
    let endsAt: number | undefined
    for (const L of lines.slice(1)) {
      const l = (L || '').trim()
      if (/^Hosted by:/i.test(l)) {
        hostedBy = l.replace(/^Hosted by:\s*/i,'').trim()
      } else if (/^Notes:/i.test(l)) {
        notes = l.replace(/^Notes:\s*/i,'').trim()
      } else if (/^Ends:/i.test(l)) {
        const when = l.replace(/^Ends:\s*/i,'').trim()
        const d = new Date(when)
        if (!isNaN(d.getTime())) endsAt = d.getTime()
      }
    }
    return { prize, hostedBy, notes, endsAt }
  } catch {}
  return null
}

// Try to parse a text message as a poll created by our modal (📊 POLL: question + enumerated options)
function parsePollFromText(txt: string): { id: string, question: string, options: string[], endsAt?: number } | null {
  try {
    const lines = txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean)
    if (lines.length < 3) return null
    if (!lines[0].startsWith('📊 POLL:')) return null
    const question = lines[0].replace(/^📊\s*POLL:\s*/,'').trim()
    const opts: string[] = []
    for (let i=1;i<lines.length;i++) {
      const m = lines[i].match(/^(\d+)\.\s*(.+)$/)
      if (m) opts.push(m[2])
    }
    if (question && opts.length >= 2) {
      return { id: 'poll-' + Math.random().toString(36).slice(2), question, options: opts }
    }
  } catch {}
  return null
}

interface ChatAreaProps {
  channel: Channel | null
  messages: Message[]
  onSendMessage: (content: string, replyToId?: string) => void
  onOpenMobileSidebar: () => void
  onToggleMembers: () => void
  currentUserId: string
  currentUser?: {
    id: string
    name: string
    username: string
    avatar: string | null
  }
  userRole?: 'owner' | 'admin' | 'member'
  userPermissions?: Record<string, boolean>
  onOpenUserProfile?: (userId: string) => void
  onDeleteMessage?: (messageId: string) => void
  onAddReaction?: (messageId: string, emoji: string) => void
  onClearReactions?: (messageId: string) => void
  viewersByMessage?: Record<string, string[]>
}

export default function ChatArea({ 
  channel, 
  messages, 
  onSendMessage, 
  onOpenMobileSidebar,
  onToggleMembers,
  currentUserId,
  currentUser,
  userRole = 'member',
  userPermissions = {},
  onOpenUserProfile,
  onDeleteMessage,
  onAddReaction,
  onClearReactions,
  viewersByMessage = {}
}: ChatAreaProps) {
  const [messageInput, setMessageInput] = useState('')
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [messageMenu, setMessageMenu] = useState<{ open: boolean; x: number; y: number; message: Message | null }>({ open: false, x: 0, y: 0, message: null })
  const [reactionPicker, setReactionPicker] = useState<{ open: boolean; x: number; y: number; messageId: string | null }>({ open: false, x: 0, y: 0, messageId: null })
  const [viewersPanel, setViewersPanel] = useState<{ open: boolean; x: number; y: number; messageId: string | null }>({ open: false, x: 0, y: 0, messageId: null })
  // Local reaction overlay to reflect UI instantly if parent does not persist
  const [localReactions, setLocalReactions] = useState<Record<string, { emoji: string; users: string[] }[]>>({})
  // Poll modal state
  const [pollModal, setPollModal] = useState<{ open: boolean; question: string; options: string[] }>({ open: false, question: '', options: ['Option 1', 'Option 2'] })
  const [giveawayModal, setGiveawayModal] = useState<{ open: boolean; prize: string; duration: string; notes: string }>({ open: false, prize: '', duration: '24h', notes: '' })
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [gifPickerOpen, setGifPickerOpen] = useState(false)
  const [gifQuery, setGifQuery] = useState('')
  const [gifs, setGifs] = useState<Array<{ url: string; title?: string }>>([])
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false)
  const [stickerQuery, setStickerQuery] = useState('')
  const [stickers, setStickers] = useState<Array<{ url: string; title?: string }>>([])
  // Link confirmation modal/trust list
  const [linkModal, setLinkModal] = useState<{ open: boolean; url: string; domain: string }>({ open: false, url: '', domain: '' })
  const [trustedDomains, setTrustedDomains] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Effective channel style pulled from server overrides
  const [channelStyle, setChannelStyle] = useState<{ backgroundColor?: string; backgroundImage?: string; backgroundVideo?: string; textColor?: string; fontFamily?: string; fontSize?: number; customCSS?: string }>({})
  // force rerender when channel-name map updates
  const [chanMapVersion, setChanMapVersion] = useState(0)
  // Client-side persisted deleted messages to prevent reappearing after refresh if backend hasn't persisted yet
  const [clientDeleted, setClientDeleted] = useState<Set<string>>(new Set())
  useEffect(() => {
    try {
      const raw = localStorage.getItem('db:deletedMsgs')
      if (raw) {
        const arr: string[] = JSON.parse(raw)
        if (Array.isArray(arr)) setClientDeleted(new Set(arr))
      }
    } catch {}
  }, [])
  function markDeleted(id: string) {
    setClientDeleted(prev => {
      const next = new Set(prev)
      next.add(id)
      try { localStorage.setItem('db:deletedMsgs', JSON.stringify(Array.from(next))) } catch {}
      return next
    })
  }

  function handleSend() {
    try {
      const text = (messageInput || '').trim()
      if (!text || !channel?.id) return
      onSendMessage(text, replyingTo?.id)
      setMessageInput('')
      setReplyingTo(null)
      inputRef.current?.focus()
    } catch {}
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Apply client-side deletions before grouping
  const effectiveMessages = useMemo(() => messages.filter(m => !clientDeleted.has(m.id)), [messages, clientDeleted])

  // Suppress native browser context menu while our message/reaction menu is open
  useEffect(() => {
    const blockNativeContextMenu = (e: Event) => {
      if (messageMenu.open || reactionPicker.open) {
        e.preventDefault()
      }
    }
    if (messageMenu.open || reactionPicker.open) {
      document.addEventListener('contextmenu', blockNativeContextMenu, { capture: true })
    }
    return () => {
      document.removeEventListener('contextmenu', blockNativeContextMenu, { capture: true } as any)
    }
  }, [messageMenu.open, reactionPicker.open])

  // Fetch channel overrides for active channel from API for immediate styling
  useEffect(() => {
    const sid = (channel as any)?.serverId
    const cid = channel?.id
    if (!sid || !cid) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/servers/${sid}/channels/overrides`, { cache: 'no-store' })
        if (!res.ok) return
        const all = await res.json()
        const o = all?.[cid] || {}
        if (!cancelled) {
          setChannelStyle({
            backgroundColor: o.backgroundColor,
            backgroundImage: o.backgroundImage,
            backgroundVideo: o.backgroundVideo,
            textColor: o.textColor,
            fontFamily: o.fontFamily,
            fontSize: o.fontSize,
            customCSS: o.customCSS,
          })
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [channel?.id, (channel as any)?.serverId])

  // Refresh styles if another component announces a style update
  useEffect(() => {
    const handler = (e: any) => {
      const sid = (channel as any)?.serverId
      const cid = channel?.id
      const detail = (e && e.detail) || {}
      if (!sid || !cid) return
      if (detail.serverId && detail.serverId !== sid) return
      if (detail.channelId && detail.channelId !== cid) return
      // re-fetch overrides for this channel
      (async () => {
        try {
          const res = await fetch(`/api/servers/${sid}/channels/overrides`, { cache: 'no-store' })
          if (!res.ok) return
          const all = await res.json()
          const o = all?.[cid] || {}
          setChannelStyle({
            backgroundColor: o.backgroundColor,
            backgroundImage: o.backgroundImage,
            backgroundVideo: o.backgroundVideo,
            textColor: o.textColor,
            fontFamily: o.fontFamily,
            fontSize: o.fontSize,
            customCSS: o.customCSS,
          })
        } catch {}
      })()
    }
    window.addEventListener('channel:styleUpdated' as any, handler)
    return () => window.removeEventListener('channel:styleUpdated' as any, handler)
  }, [channel?.id, (channel as any)?.serverId])

  // Subscribe to global channel map updates so chips refresh their labels
  useEffect(() => {
    const bump = () => setChanMapVersion(v => v + 1)
    window.addEventListener('chans:mapUpdated' as any, bump)
    return () => window.removeEventListener('chans:mapUpdated' as any, bump)
  }, [])

  // Scan messages for server links and resolve missing channel names
  useEffect(() => {
    try {
      const textList = messages.map(m => m.content)
      const linkRe = /https?:\/\/[^\s]+\/server\/([\w-]+)\/([\w-]+)/g
      const needed: Array<{ sid: string; cid: string }> = []
      const nameMap: Record<string, string> = (window as any).__db_chans || {}
      for (const t of textList) {
        let m: RegExpExecArray | null
        linkRe.lastIndex = 0
        while ((m = linkRe.exec(t)) !== null) {
          const sid = m[1]; const cid = m[2]
          if (!nameMap[cid]) needed.push({ sid, cid })
        }
      }
      const byServer: Record<string, Set<string>> = {}
      for (const { sid, cid } of needed) {
        if (!byServer[sid]) byServer[sid] = new Set()
        byServer[sid].add(cid)
      }
      Object.entries(byServer).forEach(([sid]) => {
        // Avoid duplicate fetches
        const pending: Record<string, boolean> = (window as any).__db_pending || ((window as any).__db_pending = {})
        if (pending[sid]) return
        pending[sid] = true
        fetch(`/api/servers/${sid}/categories`, { cache: 'no-store' })
          .then(r => r.ok ? r.json() : null)
          .then((cats) => {
            const map: Record<string, string> = (window as any).__db_chans || ((window as any).__db_chans = {})
            if (Array.isArray(cats)) {
              cats.forEach((c: any) => (c.channels || []).forEach((ch: any) => { map[ch.id] = ch.name }))
            }
            (window as any).__db_chans = map
            window.dispatchEvent(new CustomEvent('chans:mapUpdated'))
          })
          .finally(() => { pending[sid] = false })
          .catch(() => { pending[sid] = false })
      })
    } catch {}
  }, [messages])

  // Permission checks
  const isOwner = userRole === 'owner'
  const canSendMessages = isOwner || userPermissions.send_messages !== false
  const canViewChannel = isOwner || userPermissions.view_channel !== false
  const canReadHistory = isOwner || userPermissions.read_message_history !== false
  const canModerate = isOwner || userRole === 'admin'

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !canSendMessages || !channel?.id) return
    try {
      // parse mentions from content like @username tokens if needed later
      const mentions = (messageInput.match(/@\w+/g) || []).map(x => x.slice(1))
      await fetch(`/api/channels/${channel.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageInput, mentions, attachments: [], replyToId: replyingTo?.id || null })
      })
    } catch {}
    // Push notification on mention or reply
    try {
      const hasMention = /@\w+/.test(messageInput)
      if (hasMention || replyingTo) {
        if ("Notification" in window) {
          if (Notification.permission === 'granted') {
            new Notification(hasMention ? 'Mention sent' : 'Reply sent', { body: messageInput.slice(0, 64) })
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((perm) => {
              if (perm === 'granted') new Notification(hasMention ? 'Mention sent' : 'Reply sent', { body: messageInput.slice(0, 64) })
            })
          }
        }
        window.dispatchEvent(new CustomEvent('chat:notify', { detail: { type: hasMention ? 'mention' : 'reply', content: messageInput } }))
      }
    } catch {}
    setMessageInput('')
    setReplyingTo(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const openMessageMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault()
    setMessageMenu({ open: true, x: e.clientX, y: e.clientY, message })
  }

  const closeMessageMenus = () => {
    setMessageMenu({ open: false, x: 0, y: 0, message: null })
    setReactionPicker({ open: false, x: 0, y: 0, messageId: null })
    setViewersPanel({ open: false, x: 0, y: 0, messageId: null })
  }

  const handleAddReaction = async (messageId: string, emoji: string) => {
    // Toggle local reaction view (add/remove current user)
    setLocalReactions(prev => {
      const current = prev[messageId] || []
      const idx = current.findIndex(r => r.emoji === emoji)
      let next: { emoji: string; users: string[] }[]
      if (idx >= 0) {
        const hasUser = current[idx].users.includes(currentUserId)
        next = current.map((r, i) => i === idx ? { ...r, users: hasUser ? r.users.filter(u => u !== currentUserId) : [...r.users, currentUserId] } : r)
        // Clean empty reaction buckets
        next = next.filter(r => r.users.length > 0)
      } else {
        next = [...current, { emoji, users: [currentUserId] }]
      }
      return { ...prev, [messageId]: next }
    })
    onAddReaction?.(messageId, emoji)
    // Persist via API and sync back
    try {
      const res = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, action: 'toggle' })
      })
      if (res.ok) {
        const data = await res.json()
        const list: { emoji: string; users: string[] }[] = data.reactions || []
        setLocalReactions(prev => ({ ...prev, [messageId]: list }))
      }
    } catch {}
  }

  const clearAllReactions = (messageId: string) => {
    setLocalReactions(prev => ({ ...prev, [messageId]: [] }))
    onClearReactions?.(messageId)
  }

  // Poll creator modal (in-chat)
  const createPoll = () => {
    setPollModal({ open: true, question: '', options: ['Option 1', 'Option 2'] })
  }

  const createGiveaway = async () => {
    setGiveawayModal({ open: true, prize: '', duration: '24h', notes: '' })
  }

  // Upload handling
  const triggerFile = () => fileInputRef.current?.click()
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || [])
      if (!channel?.id || files.length === 0) return
      const uploadedUrls: string[] = []
      for (const f of files) {
        const fd = new FormData()
        fd.append('file', f)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) continue
        const data = await res.json()
        uploadedUrls.push(String(data.url))
      }
      if (uploadedUrls.length > 0) {
        // Send message with attachments via API
        await fetch(`/api/channels/${channel.id}/messages`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageInput || '', attachments: uploadedUrls, mentions: [], replyToId: replyingTo?.id || null })
        })
        setMessageInput('')
        setReplyingTo(null)
        // notify possible parent to refresh
        try { window.dispatchEvent(new CustomEvent('messages:refresh')) } catch {}
      }
      e.target.value = ''
    } catch {}
  }

  // Load GIFs from Tenor proxy when open or query changes (debounced)
  useEffect(() => {
    if (!gifPickerOpen) return
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/gifs/search?q=${encodeURIComponent(gifQuery)}&limit=30`, { cache: 'no-store', signal: ctrl.signal })
        if (!res.ok) return
        const data = await res.json()
        setGifs(Array.isArray(data.items) ? data.items : [])
      } catch {}
    }, 250)
    return () => { ctrl.abort(); clearTimeout(t) }
  }, [gifPickerOpen, gifQuery])

  // Load stickers from Stipop proxy when open or query changes
  useEffect(() => {
    if (!stickerPickerOpen) return
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stickers/search?q=${encodeURIComponent(stickerQuery)}&limit=30`, { cache: 'no-store', signal: ctrl.signal })
        if (!res.ok) return
        const data = await res.json()
        setStickers(Array.isArray(data.items) ? data.items : [])
      } catch {}
    }, 250)
    return () => { ctrl.abort(); clearTimeout(t) }
  }, [stickerPickerOpen, stickerQuery])

  // Load trusted domains
  useEffect(() => {
    try {
      const raw = localStorage.getItem('db:trustedDomains')
      if (raw) setTrustedDomains(JSON.parse(raw))
    } catch {}
  }, [])

  // Listen for link open requests from renderContentRich
  useEffect(() => {
    const handler = (e: any) => {
      const url = String(e?.detail?.url || '')
      try {
        const { hostname } = new URL(url)
        if (trustedDomains.includes(hostname)) {
          window.open(url, '_blank', 'noopener')
        } else {
          setLinkModal({ open: true, url, domain: hostname })
        }
      } catch {}
    }
    window.addEventListener('link:open' as any, handler)
    return () => window.removeEventListener('link:open' as any, handler)
  }, [trustedDomains])

  const groupMessagesByUser = (messages: Message[]) => {
    const groups: Array<{
      userId: string
      username: string
      avatar: string
      messages: Message[]
      timestamp: Date
    }> = []

    messages.forEach((message) => {
      // Ensure timestamp is Date
      const ts: Date = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp as any)
      // Fill missing username/avatar when it's the current user
      const safeUsername = message.username || (message.userId === currentUserId ? (currentUser?.username || 'You') : '') || 'User'
      const safeAvatar = message.avatar || (message.userId === currentUserId ? (currentUser?.avatar || '') : '') || ''
      const lastGroup = groups[groups.length - 1]
      const timeDiff = lastGroup ? ts.getTime() - lastGroup.timestamp.getTime() : Infinity
      
      if (lastGroup && lastGroup.userId === message.userId && timeDiff < 5 * 60 * 1000) {
        lastGroup.messages.push({ ...message, username: safeUsername, avatar: safeAvatar, timestamp: ts })
      } else {
        groups.push({
          userId: message.userId,
          username: safeUsername,
          avatar: safeAvatar,
          messages: [{ ...message, username: safeUsername, avatar: safeAvatar, timestamp: ts }],
          timestamp: ts
        })
      }
    })

    return groups
  }

  // Check if this is a voice channel
  if (channel?.type === 'voice') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Channel Header */}
        <div className="h-16 bg-black/40 backdrop-blur-xl border-b border-white/20 flex items-center px-6">
          <div className="flex items-center gap-3 flex-1">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition"
              onClick={onOpenMobileSidebar}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <Hash className="h-6 w-6 text-gray-400" />
            <h2 className="text-white font-bold text-xl">
              {channel?.name || 'voice-channel'}
            </h2>
            {/* No custom CSS injection for ChatArea backgrounds */}
    </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="rounded-lg hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Button>
            <Button size="sm" variant="ghost" className="rounded-lg hover:bg-white/10">
              <Shield className="h-5 w-5" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="rounded-lg hover:bg-white/10"
              onClick={onToggleMembers}
            >
              <Users className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Voice Channel Component */}
        <VoiceChannel
          channelId={channel.id}
          channelName={channel.name}
          onLeave={() => {
            // Handle leave voice channel
            console.log('Left voice channel')
          }}
          currentUser={currentUser || {
            id: currentUserId,
            name: 'User',
            username: 'user',
            avatar: null
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Channel Header */}
      <div className="h-16 bg-black/40 backdrop-blur-xl border-b border-white/20 flex items-center px-6">
        <div className="flex items-center gap-3 flex-1">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition"
            onClick={onOpenMobileSidebar}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Hash className="h-6 w-6 text-gray-400" />
          <h2 className="text-white font-bold text-xl">
            {channel?.name || 'general'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="rounded-lg hover:bg-white/10">
            <Bell className="h-5 w-5" />
          </Button>
          <Button size="sm" variant="ghost" className="rounded-lg hover:bg-white/10">
            <Shield className="h-5 w-5" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="rounded-lg hover:bg-white/10"
            onClick={onToggleMembers}
          >
            <Users className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative"
        style={{
          color: (channelStyle.textColor ?? (channel as any)?.textColor) ?? undefined,
          fontFamily: (channelStyle.fontFamily ?? (channel as any)?.fontFamily) && (channelStyle.fontFamily ?? (channel as any)?.fontFamily) !== 'default' ? (channelStyle.fontFamily ?? (channel as any)?.fontFamily) : undefined,
          fontSize: (channelStyle.fontSize ?? (channel as any)?.fontSize) ? `${channelStyle.fontSize ?? (channel as any)?.fontSize}px` : undefined,
        }}
      >
        <div className="relative z-10 space-y-4">
          {effectiveMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl font-bold text-white mb-2">#{channel?.name || 'channel'}</div>
              <div className="text-gray-400 mb-4">This is the beginning of the #{channel?.name || 'channel'} channel.</div>
              <ShinyButton size="lg" onClick={() => inputRef.current?.focus()}>Send a message</ShinyButton>
            </div>
          ) : (
            <div>
              {groupMessagesByUser(effectiveMessages).map((group, groupIndex) => {
                const visible = group.messages.filter(m => !m.deleted)
                if (visible.length === 0) return null
                return (
                  <div key={`${group.userId}-${groupIndex}`} className="flex gap-4 group hover:bg-white/2 -mx-4 px-4 py-2 rounded-lg transition">
                    {/* Avatar */}
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => onOpenUserProfile?.(group.userId)}>
                      <Avatar src={group.avatar} alt={group.username} size={40} />
                    </div>
                    {/* Messages */}
                    <div className="flex-1 min-w-0">
                      {/* Username and timestamp */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-semibold text-white hover:underline cursor-pointer"
                          onClick={() => onOpenUserProfile?.(group.userId)}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            const mention = `@${group.username} `
                            setMessageInput((v) => v + mention)
                            inputRef.current?.focus()
                          }}
                        >
                          {group.username}
                        </span>
                        <span className="text-xs text-gray-400">{format(group.timestamp, 'h:mm a')}</span>
                      </div>
                      {/* Message content */}
                      <div className="space-y-1">
                        {visible.map((message) => (
                          <div key={message.id} className="relative group/message" onContextMenu={(e) => openMessageMenu(e, message)}>
                            {/* Reply indicator */}
                            {message.replyTo && (
                              <div className="flex items-center gap-2 text-xs text-sky-300 mb-1 pl-4 border-l-2 border-sky-500/60 bg-sky-500/10 rounded-sm py-1">
                                <Reply className="h-3 w-3" />
                                <span>Replying to <span className="text-white font-medium">{message.replyTo.username}</span></span>
                                <span className="truncate max-w-xs">{message.replyTo.content}</span>
                              </div>
                            )}
                            {/* Message text */}
                            {(() => {
                              const poll = parsePollFromText(message.content)
                              if (poll) return <PollCard data={poll} messageId={message.id} />
                              const gw = parseGiveawayFromText(message.content)
                              if (gw) {
                                const combined = localReactions[message.id] || message.reactions
                                const party = combined.find(r => r.emoji === '🎉')
                                const participants = party ? (party.users?.length || 0) : 0
                                const ended = !!gw.endsAt && gw.endsAt < Date.now()
                                return <GiveawayCard data={{ prize: gw.prize, hostedBy: gw.hostedBy, notes: gw.notes, endsAt: gw.endsAt }} participants={participants} ended={ended} />
                              }
                              return (
                                <div className="text-gray-200 leading-relaxed break-words">
                                  {renderContentRich(message.content, { currentServerId: channel ? (channel as any).serverId : undefined })}
                                </div>
                              )
                            })()}
                            {/* Attachments */}
                            {message.attachments.length > 0 && (
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md">
                                {message.attachments.map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt="attachment"
                                    className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-80 transition"
                                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                                    onContextMenu={(e) => { e.preventDefault(); navigator.clipboard.writeText(url) }}
                                  />
                                ))}
                              </div>
                            )}
                            {/* Reactions */}
                            {(() => {
                              const combined = localReactions[message.id] || message.reactions
                              return !message.deleted && combined.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {combined.map((reaction, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleAddReaction(message.id, reaction.emoji)}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 transition ${reaction.users.includes(currentUserId) ? 'ring-1 ring-teal-400/50' : ''}`}
                                    >
                                      <span>{reaction.emoji}</span>
                                      <span>{reaction.users.length}</span>
                                    </button>
                                  ))}
                                </div>
                              ) : null
                            })()}
                            {/* Message actions */}
                            {!message.deleted && (
                              <div className="absolute -top-2 right-2 opacity-0 group-hover/message:opacity-100 transition-opacity bg-gray-800 rounded-lg border border-gray-600 shadow-lg">
                                <div className="flex items-center">
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-700" onClick={() => setReplyingTo(message)}>
                                    <Reply className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-gray-700"
                                    onClick={(e) => {
                                      const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect()
                                      setReactionPicker({ open: true, x: rect.left, y: rect.bottom + 4, messageId: message.id })
                                    }}
                                  >
                                    <Smile className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-700" onClick={(e) => openMessageMenu(e as any, message)}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      {/* Context Menus */}
      {messageMenu.open && messageMenu.message && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={closeMessageMenus} />
          <div
            className="fixed z-[9999] min-w-[180px] bg-black/95 text-white border border-white/10 rounded-lg shadow-xl p-1"
            style={{ left: messageMenu.x, top: messageMenu.y }}
          >
            <button className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded-md" onClick={() => { setReplyingTo(messageMenu.message!); closeMessageMenus() }}>
              Reply
            </button>
            <button className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded-md" onClick={() => { setReactionPicker({ open: true, x: messageMenu.x, y: messageMenu.y + 8, messageId: messageMenu.message!.id }); setMessageMenu({ open: false, x: 0, y: 0, message: null }) }}>
              Add Reaction
            </button>
            {(() => {
              const canDelete = isOwner || messageMenu.message.userId === currentUserId
              return canDelete ? (
                <ShinyButton
                  size="sm"
                  className="w-full !justify-start !uppercase text-red-200"
                  onClick={() => { markDeleted(messageMenu.message!.id); onDeleteMessage?.(messageMenu.message!.id); closeMessageMenus() }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </ShinyButton>
              ) : null
            })()}
            {(canModerate) && (
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded-md" onClick={() => { setViewersPanel({ open: true, x: messageMenu.x + 6, y: messageMenu.y + 6, messageId: messageMenu.message!.id }); setMessageMenu({ open: false, x: 0, y: 0, message: null }) }}>
                Viewers
              </button>
            )}
            {(canModerate) && (
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded-md" onClick={() => { clearAllReactions(messageMenu.message!.id); closeMessageMenus() }}>
                Clear Reactions
              </button>
            )}
          </div>
        </>
      )}

      {reactionPicker.open && reactionPicker.messageId && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={closeMessageMenus} />
          <div
            ref={chatContainerRef}
            className="fixed z-[9999] bg-black/95 text-white border border-white/10 rounded-lg shadow-xl p-2"
            style={{ left: Math.max(8, Math.min(reactionPicker.x, (typeof window!=='undefined'?window.innerWidth:1000) - 220)), top: Math.max(8, Math.min(reactionPicker.y, (typeof window!=='undefined'?window.innerHeight:800) - 80)) }}
          >
            <div className="flex gap-1">
              {['👍','❤️','😂','🔥','😮','🎉','😢','🙏'].map((e) => (
                <button key={e} className="px-2 py-1 hover:bg-white/10 rounded" onClick={() => { handleAddReaction(reactionPicker.messageId!, e); closeMessageMenus() }}>{e}</button>
              ))}
            </div>
          </div>
        </>
      )}

      {viewersPanel.open && viewersPanel.messageId && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={closeMessageMenus} />
          <div className="fixed z-[9999] bg-black/95 text-white border border-white/10 rounded-lg shadow-xl p-3 min-w-[220px]" style={{ left: viewersPanel.x, top: viewersPanel.y }}>
            <div className="text-xs text-white/70 mb-2">Viewed by</div>
            <div className="max-h-48 overflow-auto space-y-1">
              {(viewersByMessage[viewersPanel.messageId] || []).length === 0 ? (
                <div className="text-white/60 text-sm">No views yet</div>
              ) : (
                (viewersByMessage[viewersPanel.messageId] || []).map((u: string, i: number) => (
                  <div key={i} className="text-sm text-white/90">{u}</div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Poll Modal */}
      {pollModal.open && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/60" onClick={() => setPollModal({ open: false, question: '', options: ['Option 1','Option 2'] })} />
          <div className="fixed z-[9999] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md rounded-2xl border border-white/15 bg-black/95 p-4">
            <div className="text-white text-lg font-semibold mb-3">Create Poll</div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/80">Question</label>
                <Input value={pollModal.question} onChange={(e)=>setPollModal(p=>({...p, question:e.target.value}))} className="mt-1 bg-white/5 border-white/15 rounded-xl" placeholder="What do you think?" />
              </div>
              <div>
                <label className="text-sm text-white/80">Options</label>
                <div className="mt-2 space-y-2">
                  {pollModal.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input value={opt} onChange={(e)=>setPollModal(p=>({...p, options: p.options.map((o,i)=> i===idx? e.target.value : o)}))} className="flex-1 bg-white/5 border-white/15 rounded-xl" />
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10" disabled={pollModal.options.length<=2} onClick={()=>setPollModal(p=>({...p, options: p.options.filter((_,i)=>i!==idx)}))}>×</Button>
                    </div>
                  ))}
                  {pollModal.options.length < 6 && (
                    <Button size="sm" variant="outline" className="rounded-xl" onClick={()=>setPollModal(p=>({...p, options:[...p.options, `Option ${p.options.length+1}`]}))}>Add option</Button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={()=>setPollModal({ open:false, question:'', options:['Option 1','Option 2'] })}>Cancel</Button>
              <ShinyButton size="md" onClick={async ()=>{
                const q = pollModal.question.trim()
                const opts = pollModal.options.map(o=>o.trim()).filter(Boolean)
                if (!q || opts.length<2 || !channel?.id) return
                const body = `📊 POLL: ${q}\n\n` + opts.map((o,i)=>`${i+1}. ${o}`).join('\n') + '\n\nReact with the number to vote!'
                try {
                  await fetch(`/api/channels/${channel.id}/messages`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content: body, mentions: [], attachments: [], replyToId: null }) })
                } catch {}
                setPollModal({ open:false, question:'', options:['Option 1','Option 2'] })
              }}>Create</ShinyButton>
            </div>
          </div>
        </>
      )}

      {/* Emoji Picker (simple) */}
      {emojiPickerOpen && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setEmojiPickerOpen(false)} />
          <div className="fixed z-[9999] right-6 bottom-24 bg-black/95 text-white border border-white/10 rounded-xl p-2 w-64">
            <div className="grid grid-cols-8 gap-1 text-lg">
              {['😀','😁','😂','🤣','😅','😊','😍','😘','😎','🤩','🤔','🤨','😴','😢','😭','😡','👍','👎','🙏','🔥','🎉','💯','✨','❤️'].map(em => (
                <button key={em} className="hover:bg-white/10 rounded p-1" onClick={() => { setMessageInput(v => v + em); setEmojiPickerOpen(false); inputRef.current?.focus() }}>{em}</button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* GIF Picker (Tenor) */}
      {gifPickerOpen && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setGifPickerOpen(false)} />
          <div className="fixed z-[9999] right-4 bottom-24 bg-black/95 text-white border border-white/10 rounded-xl p-3 w-[480px] max-h-[70vh] overflow-auto sm:w-[420px]">
            <div className="mb-2 flex items-center gap-2">
              <div className="text-sm text-white/70">GIFs</div>
              <Input value={gifQuery} onChange={(e)=>setGifQuery(e.target.value)} placeholder="Search Tenor" className="bg-white/5 border-white/15 h-8" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              {gifs.length === 0 ? (
                <div className="col-span-3 text-white/50 text-sm">No results</div>
              ) : gifs.map((g, i) => (
                <button key={i} className="h-28 rounded-lg overflow-hidden border border-white/10 hover:border-white/30" onClick={() => { setMessageInput(v => (v ? v + ' ' : '') + g.url); setGifPickerOpen(false); inputRef.current?.focus() }}>
                  <img src={g.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Link Confirmation Modal */}
      {linkModal.open && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/60" onClick={() => setLinkModal({ open: false, url: '', domain: '' })} />
          <div className="fixed z-[9999] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md rounded-2xl border border-white/15 bg-black/95 p-4">
            <div className="text-white text-lg font-semibold mb-2">Open external link?</div>
            <div className="text-white/70 text-sm mb-4 break-all">{linkModal.url}</div>
            <div className="flex items-center gap-2 mb-4">
              <input id="trustDomain" type="checkbox" className="accent-teal-500" />
              <label htmlFor="trustDomain" className="text-white/80 text-sm">Always trust {linkModal.domain}</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setLinkModal({ open: false, url: '', domain: '' })}>Cancel</Button>
              <ShinyButton size="md" onClick={() => {
                try {
                  const cb = (document.getElementById('trustDomain') as HTMLInputElement)
                  if (cb?.checked) {
                    const next = Array.from(new Set([...trustedDomains, linkModal.domain]))
                    setTrustedDomains(next)
                    localStorage.setItem('db:trustedDomains', JSON.stringify(next))
                  }
                  window.open(linkModal.url, '_blank', 'noopener')
                  setLinkModal({ open: false, url: '', domain: '' })
                } catch {
                  setLinkModal({ open: false, url: '', domain: '' })
                }
              }}>Open</ShinyButton>
            </div>
          </div>
        </>
      )}

      {/* Giveaway Modal */}
      {giveawayModal.open && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/60" onClick={() => setGiveawayModal(g => ({ ...g, open: false }))} />
          <div className="fixed z-[9999] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md rounded-2xl border border-white/15 bg-black/95 p-4">
            <div className="text-white text-lg font-semibold mb-3">Create Giveaway</div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/80">Prize</label>
                <Input value={giveawayModal.prize} onChange={(e)=>setGiveawayModal(g=>({...g,prize:e.target.value}))} className="mt-1 bg-white/5 border-white/15 rounded-xl" placeholder="Nitro, Custom Role, ..."/>
              </div>
              <div>
                <label className="text-sm text-white/80">Duration</label>
                <Input value={giveawayModal.duration} onChange={(e)=>setGiveawayModal(g=>({...g,duration:e.target.value}))} className="mt-1 bg-white/5 border-white/15 rounded-xl" placeholder="24h, 7d, ..."/>
              </div>
              <div>
                <label className="text-sm text-white/80">Notes (optional)</label>
                <Input value={giveawayModal.notes} onChange={(e)=>setGiveawayModal(g=>({...g,notes:e.target.value}))} className="mt-1 bg-white/5 border-white/15 rounded-xl" placeholder="Any extra details"/>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={()=>setGiveawayModal(g=>({...g,open:false}))}>Cancel</Button>
              <ShinyButton size="md" onClick={()=>{
                const prize = giveawayModal.prize.trim()
                const duration = giveawayModal.duration.trim() || '24h'
                const note = giveawayModal.notes.trim()
                if (!prize) return
                const body = `🎉 GIVEAWAY: ${prize}\nDuration: ${duration}` + (note ? `\nNotes: ${note}` : '') + '\nReact with 🎉 to enter!'
                onSendMessage(body)
                setGiveawayModal({ open:false, prize:'', duration:'24h', notes:'' })
              }}>Create</ShinyButton>
            </div>
          </div>
        </>
      )}

      {/* Composer */}
      {channel && (channel.type === 'text' || channel.type === 'announcement') && (
        <div className="border-t border-white/10 bg-black/30 backdrop-blur-xl px-3 py-3">
          {replyingTo && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-sky-500/10 border border-sky-500/30 px-3 py-2 text-sm">
              <div className="truncate">
                Replying to <span className="text-sky-300">{replyingTo.username}</span>: <span className="opacity-80">{replyingTo.content}</span>
              </div>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setReplyingTo(null)}>Cancel</Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" className="hidden" multiple accept="image/*,video/*" onChange={(e)=>{
              try {
                const files = Array.from(e.target.files || [])
                if (files.length === 0) return
                // Minimal UX: append filenames to message input; uploads are handled elsewhere
                const names = files.map(f=>f.name).join(', ')
                setMessageInput(v => (v? v+ ' ': '') + names)
                inputRef.current?.focus()
                ;(e.target as HTMLInputElement).value = ''
              } catch {}
            }} />
            <Button size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white/10" onClick={()=>fileInputRef.current?.click()}>
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={messageInput}
                onChange={(e)=>setMessageInput(e.target.value)}
                placeholder={`Message #${channel?.name || 'channel'}`}
                className="h-10 rounded-xl bg-white/5 border-white/15 text-[15px]"
                onKeyDown={(e)=>{
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
            </div>
            <Button size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white/10" onClick={()=>setEmojiPickerOpen(true)} title="Emoji">
              <Smile className="h-5 w-5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white/10" onClick={()=>setGifPickerOpen(true)} title="GIF">
              <Gift className="h-5 w-5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white/10" onClick={()=>setPollModal({ open: true, question: '', options: ['Option 1','Option 2'] })} title="Poll">
              <BarChart3 className="h-5 w-5" />
            </Button>
            <ShinyButton size="md" className="min-w-[88px]" onClick={handleSend}>
              <Send className="h-4 w-4" /> Send
            </ShinyButton>
          </div>
        </div>
      )}
    </div>
  )
}

// Highlight @mentions in yellow
function renderContentRich(text: string, ctx: { currentServerId?: string }) {
  // Split by spaces while preserving punctuation
  const tokens = text.split(/(\s+)/)
  return tokens.map((tok, i) => {
    if (/^\s+$/.test(tok) || tok === '') return <span key={i}>{tok}</span>

    // @mentions
    if (/^@\w+$/.test(tok)) {
      return (
        <span key={i} className="text-amber-300 bg-amber-500/10 px-1 rounded">
          {tok}
        </span>
      )
    }

    // Channel links like https://host/server/<sid>/<cid>
    const m = tok.match(/^https?:\/\/[\w.-]+(?::\d+)?\/server\/([\w-]+)\/([\w-]+)/)
    if (m) {
      const serverId = m[1]
      const channelId = m[2]
      const nameMap = (window as any)?.__db_chans || {}
      const label = nameMap[channelId] || channelId
      return (
        <button
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 hover:bg-teal-500/20"
          onClick={() => {
            try {
              window.dispatchEvent(new CustomEvent('channel:open', { detail: { serverId, channelId } }))
            } catch {}
          }}
          title={`Open channel ${label}`}
        >
          <span>#</span>
          <span className="underline">{label}</span>
        </button>
      )
    }

    // Invite links like https://host/invite/<code>
    const inv = tok.match(/^https?:\/\/[\w.-]+(?::\d+)?\/invite\/([\w-]{4,})/)
    if (inv) {
      const code = inv[1]
      return (
        <button
          key={i}
          className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20"
          onClick={() => {
            try {
              window.dispatchEvent(new CustomEvent('invite:open', { detail: { code } }))
            } catch {}
          }}
          title={`Open invite ${code}`}
        >
          <span>Invite</span>
          <code className="opacity-80">{code}</code>
        </button>
      )
    }

    return <span key={i}>{tok}</span>
  })
}