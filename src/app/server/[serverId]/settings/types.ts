export type Member = {
  id: string
  name: string
  username: string
  avatar?: string
  role: string
  status: string
  mutedUntil?: string
  timeoutUntil?: string
}

export type Role = {
  id: string
  name: string
  color: string
  permissions: string[]
  memberCount: number
}

export type Channel = {
  id: string
  name: string
  type: string
  isPrivate: boolean
  backgroundUrl?: string
  backgroundColor?: string
  backgroundType?: string
  font?: string
}

export type Category = {
  id: string
  name: string
  channels: Channel[]
}

export type BanItem = {
  id: string
  user: {
    id: string
    username: string
    displayName: string
    avatar?: string
  }
  createdAt: string
  expiresAt?: string
  reason?: string
}

export type Server = {
  id: string
  name: string
  description?: string
  icon?: string
  banner?: string
  tag?: string
  byteeLevel?: number
  advertisementEnabled?: boolean
  advertisementText?: string
  ownerId: string
}

export interface ServerSettingsPageProps {
  params: Promise<{ serverId: string }>
}

export type TabType = 'overview' | 'roles' | 'channels' | 'members' | 'bans' | 'bytee'
