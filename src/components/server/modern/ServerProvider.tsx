'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

// Types
export interface Server {
  id: string
  name: string
  description?: string
  icon?: string
  banner?: string
  tag?: string
  boostLevel?: number
  boosts?: number
  memberCount?: number
  onlineCount?: number
  members?: number // API response field
  onlineMembers?: number // API response field
}
export interface Channel {
  id: string
  name: string
  type: 'text' | 'voice' | 'announcement' | 'forum'
  categoryId: string
  serverId: string
  isPrivate: boolean
  topic?: string | null
  unread?: number
  customBg?: string | null
  bgOpacity?: number | null
  textColor?: string | null
  accentColor?: string | null
  gradientFrom?: string | null
  gradientTo?: string | null
  useGradient?: boolean | null
  slowMode?: number | null
  backgroundType?: string | null
  backgroundColor?: string | null
  backgroundUrl?: string | null
  nameColor?: string | null
  nameGradient?: string | null
  nameAnimation?: string | null
  font?: string | null
}

export interface Category {
  id: string
  name: string
  emoji?: string
  position: number
  channels: Channel[]
}

export interface Member {
  id: string
  name: string
  username: string
  avatar: string | null
  status: 'online' | 'idle' | 'dnd' | 'offline'
  role: 'owner' | 'admin' | 'moderator' | 'member'
  roleId?: string
  joinedAt: string | Date
  isAdmin: boolean
  avatarDecoration?: string | null
  customStatus?: string
  activities?: Array<{
    name: string
    type: 'playing' | 'streaming' | 'listening' | 'watching'
  }>
}

export interface Role {
  id: string
  name: string
  color?: string
  position: number
  permissions: Record<string, boolean | null>
  memberCount: number
}

export interface Message {
  id: string
  content: string
  userId: string
  username: string
  avatar: string
  timestamp: Date
  mentions: string[]
  attachments: Array<{
    id: string
    filename: string
    url: string
    size: number
    contentType: string
  }>
  reactions: Array<{
    emoji: string
    users: string[]
    count: number
  }>
  replyTo?: {
    id: string
    content: string
    username: string
  }
  edited?: Date
  deleted?: boolean
  type: 'default' | 'system' | 'call'
}

// Context types
interface ServerContextType {
  // Data
  server: Server | null
  categories: Category[]
  members: Member[]
  roles: Role[]
  currentUser: Member | null
  
  // Loading states
  isLoading: boolean
  isLoadingMembers: boolean
  isLoadingCategories: boolean
  
  // Actions
  refreshServer: () => Promise<void>
  refreshMembers: () => Promise<void>
  refreshCategories: () => Promise<void>
  refreshChannel: (channelId: string) => Promise<void>
  setChannelSlowMode: (channelId: string, slowMode: number) => void
  joinServer: () => Promise<boolean>
  leaveServer: () => Promise<boolean>
  
  // Utilities
  getMemberById: (id: string) => Member | undefined
  getRoleById: (id: string) => Role | undefined
  getChannelById: (id: string) => Channel | undefined
}

const ServerContext = createContext<ServerContextType | undefined>(undefined)

export function useServer() {
  const context = useContext(ServerContext)
  if (!context) {
    throw new Error('useServer must be used within a ServerProvider')
  }
  return context
}

interface ServerProviderProps {
  children: ReactNode
  serverId: string
}

export function ServerProvider({ children, serverId }: ServerProviderProps) {
  const { data: session } = useSession()
  
  // State
  const [server, setServer] = useState<Server | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [currentUser, setCurrentUser] = useState<Member | null>(null)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  // Utility functions
  const getMemberById = (id: string) => members.find(m => m.id === id)
  const getRoleById = (id: string) => roles.find(r => r.id === id)
  const getChannelById = (id: string) => {
    for (const category of categories) {
      const channel = category.channels.find(c => c.id === id)
      if (channel) return channel
    }
    return undefined
  }

  // API functions
  const refreshServer = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const serverData = await response.json()
        setServer({
          ...serverData,
          memberCount: serverData.members || 0,
          onlineCount: serverData.onlineMembers || 0,
          boostLevel: serverData.boostLevel ?? serverData.byteeLevel ?? 0,
          boosts: serverData.boosts ?? serverData.boostLevel ?? 0,
        })
      } else if (response.status === 404) {
        toast.error('Server not found')
      } else if (response.status === 403) {
        toast.error('Access denied to this server')
      }
    } catch (error) {
      console.error('Error fetching server:', error)
      toast.error('Failed to load server data')
    }
  }

  const refreshCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const response = await fetch(`/api/servers/${serverId}/categories`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const categoriesData = await response.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load channels')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const refreshMembers = async () => {
    setIsLoadingMembers(true)
    try {
      const response = await fetch(`/api/servers/${serverId}/members`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const membersData = await response.json()
        setMembers(membersData)
        
        // Find current user
        const currentUserId = (session?.user as any)?.id
        if (currentUserId) {
          const currentMember = membersData.find((m: Member) => m.id === currentUserId)
          setCurrentUser(currentMember || null)
        }
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to load members')
    } finally {
      setIsLoadingMembers(false)
    }
  }

  const refreshRoles = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}/roles`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const rolesData = await response.json()
        setRoles(rolesData)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const refreshChannel = async (channelId: string) => {
    if (!channelId) return

    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        return
      }

      const updatedChannel = (await response.json()) as Channel

      setCategories((prevCategories: Category[]) =>
        prevCategories.map((category) => {
          if (!category.channels.some((ch) => ch.id === channelId)) {
            return category
          }

          return {
            ...category,
            channels: category.channels.map((ch) =>
              ch.id === channelId
                ? {
                    ...ch,
                    ...updatedChannel,
                  }
                : ch
            ),
          }
        })
      )
    } catch (error) {
      console.error('Error refreshing channel:', error)
    }
  }

  const setChannelSlowMode = (channelId: string, slowModeValue: number) => {
    setCategories((prevCategories: Category[]) =>
      prevCategories.map((category) => {
        if (!category.channels.some((ch) => ch.id === channelId)) {
          return category
        }

        return {
          ...category,
          channels: category.channels.map((ch) =>
            ch.id === channelId
              ? {
                  ...ch,
                  slowMode: slowModeValue,
                }
              : ch
          ),
        }
      })
    )
  }

  const joinServer = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/servers/${serverId}/join`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Joined server successfully')
        await Promise.all([refreshServer(), refreshMembers()])
        return true
      } else {
        toast.error('Failed to join server')
        return false
      }
    } catch (error) {
      console.error('Error joining server:', error)
      toast.error('Failed to join server')
      return false
    }
  }

  const leaveServer = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/servers/${serverId}/leave`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Left server successfully')
        return true
      } else {
        toast.error('Failed to leave server')
        return false
      }
    } catch (error) {
      console.error('Error leaving server:', error)
      toast.error('Failed to leave server')
      return false
    }
  }

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        // Try to join server first (in case user isn't a member)
        await fetch(`/api/servers/${serverId}/join`, { method: 'POST' })
        
        // Load all data in parallel
        await Promise.all([
          refreshServer(),
          refreshCategories(),
          refreshMembers(),
          refreshRoles()
        ])
      } catch (error) {
        console.error('Error loading initial server data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (serverId && session) {
      loadInitialData()
    }
  }, [serverId, session])

  const value: ServerContextType = {
    // Data
    server,
    categories,
    members,
    roles,
    currentUser,
    
    // Loading states
    isLoading,
    isLoadingMembers,
    isLoadingCategories,
    
    // Actions
    refreshServer,
    refreshMembers,
    refreshCategories,
    refreshChannel,
    setChannelSlowMode,
    joinServer,
    leaveServer,
    
    // Utilities
    getMemberById,
    getRoleById,
    getChannelById,
  }

  return (
    <ServerContext.Provider value={value}>
      {children}
    </ServerContext.Provider>
  )
}
