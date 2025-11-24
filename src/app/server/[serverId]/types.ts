export interface ServerPageProps {
  params: Promise<{
    serverId: string
  }>
}

export interface Server {
  id: string
  name: string
  slug: string
  icon?: string
  banner?: string
  description?: string
  memberCount: number
  boostLevel: number
  verified: boolean
  premium: boolean
  ownerId: string
}

export interface Category {
  id: string
  name: string
  slug: string
  channels: Channel[]
}

export interface Channel {
  id: string
  name: string
  slug: string
  fullSlug: string
  type: 'text' | 'voice' | 'announcement'
  description?: string
  premium?: boolean
  locked?: boolean
  unread?: number
  categoryId: string
}

export interface Member {
  id: string
  userId: string
  name: string
  username: string
  avatar?: string
  status: 'online' | 'idle' | 'dnd' | 'offline'
  role: 'owner' | 'admin' | 'moderator' | 'member'
  activity?: string
  badges: string[]
  joinedAt: string
  roles?: string[] // Role IDs
}

export interface Message {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
    role: string
    color?: string
  }
  timestamp: string
  mentions?: string[]
  attachments?: any[]
  reactions?: any[]
  replyTo?: any
}

export interface Role {
  id: string
  name: string
  color: string
  permissions: string // JSON string or comma-separated
  isDefault: boolean
}
