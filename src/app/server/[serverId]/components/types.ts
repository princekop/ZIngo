export interface Server {
  id: string
  name: string
  slug?: string
  icon?: string
  banner?: string
  memberCount: number
  boostLevel: number
  verified?: boolean
  premium?: boolean
}

export interface Channel {
  id: string
  name: string
  type: 'text' | 'voice' | 'announcement'
  categoryId: string
  slug?: string
  fullSlug?: string
  description?: string
  unread?: number
  isPrivate?: boolean
  isActive?: boolean
  premium?: boolean
  trending?: boolean
  locked?: boolean
  devChannel?: boolean
  gaming?: boolean
  connectedUsers?: number
  maxUsers?: number
  backgroundMedia?: {
    type: 'image' | 'video' | 'gif'
    url: string
    opacity?: number
  }
  permissions?: {
    canView: boolean
    canSend: boolean
    canManage: boolean
  }
}

export interface Category {
  id: string
  name: string
  slug?: string
  icon?: string
  emoji?: string
  description?: string
  channels: Channel[]
  collapsed?: boolean
  backgroundMedia?: {
    type: 'image' | 'video' | 'gif'
    url: string
    opacity?: number
  }
  permissions?: {
    canView: boolean
    canManage: boolean
    canCreateChannels: boolean
  }
}

export interface Member {
  id: string
  name: string
  username: string
  avatar?: string
  status: 'online' | 'idle' | 'dnd' | 'offline'
  role: 'owner' | 'admin' | 'moderator' | 'member'
  activity?: string
  badges?: string[]
  level?: number
}

export interface Message {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: Date
  edited?: boolean
  reactions?: {
    emoji: string
    count: number
    reacted: boolean
  }[]
  attachments?: {
    name: string
    size: string
    url: string
    type: string
  }[]
  replyTo?: {
    id: string
    content: string
    author?: {
      id: string
      name: string
      avatar?: string
    }
  }
}
