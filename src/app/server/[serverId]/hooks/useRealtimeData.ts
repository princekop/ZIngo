import { useState, useEffect, useCallback, useRef } from 'react'
import { Server, Category, Member, Message, Channel } from '../components/types'

// WebSocket connection for real-time updates
class RealtimeConnection {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<Function>> = new Map()

  constructor(private serverId: string, private userId: string) {
    this.connect()
  }

  private connect() {
    try {
      // Replace with your WebSocket server URL
      this.ws = new WebSocket(`wss://api.darkbyte.com/servers/${this.serverId}/ws?userId=${this.userId}`)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.emit('connected', {})
      }

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.emit(data.type, data.payload)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.reconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      this.reconnect()
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  public send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }))
    }
  }

  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  public off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback)
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data))
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
  }
}

// API Service for HTTP requests
class APIService {
  private baseURL = 'https://api.darkbyte.com'
  
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  // Server API
  async getServer(serverId: string): Promise<Server> {
    return this.request(`/servers/${serverId}`)
  }

  async updateServer(serverId: string, data: Partial<Server>): Promise<Server> {
    return this.request(`/servers/${serverId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Categories & Channels API
  async getCategories(serverId: string): Promise<Category[]> {
    return this.request(`/servers/${serverId}/categories`)
  }

  async createCategory(serverId: string, data: { name: string, description?: string }): Promise<Category> {
    return this.request(`/servers/${serverId}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createChannel(serverId: string, categoryId: string, data: { name: string, type: string, description?: string }): Promise<Channel> {
    return this.request(`/servers/${serverId}/categories/${categoryId}/channels`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteChannel(serverId: string, channelId: string): Promise<void> {
    return this.request(`/servers/${serverId}/channels/${channelId}`, {
      method: 'DELETE',
    })
  }

  // Members API
  async getMembers(serverId: string): Promise<Member[]> {
    return this.request(`/servers/${serverId}/members`)
  }

  async kickMember(serverId: string, memberId: string, reason?: string): Promise<void> {
    return this.request(`/servers/${serverId}/members/${memberId}/kick`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async banMember(serverId: string, memberId: string, reason?: string): Promise<void> {
    return this.request(`/servers/${serverId}/members/${memberId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async muteMember(serverId: string, memberId: string, duration?: number): Promise<void> {
    return this.request(`/servers/${serverId}/members/${memberId}/mute`, {
      method: 'POST',
      body: JSON.stringify({ duration }),
    })
  }

  // Messages API
  async getMessages(channelId: string, limit = 50, before?: string): Promise<Message[]> {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (before) params.append('before', before)
    return this.request(`/channels/${channelId}/messages?${params}`)
  }

  async sendMessage(channelId: string, content: string, attachments?: File[]): Promise<Message> {
    const formData = new FormData()
    formData.append('content', content)
    
    if (attachments) {
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file)
      })
    }

    return this.request(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  }

  async editMessage(channelId: string, messageId: string, content: string): Promise<Message> {
    return this.request(`/channels/${channelId}/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    })
  }

  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    return this.request(`/channels/${channelId}/messages/${messageId}`, {
      method: 'DELETE',
    })
  }

  async addReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.request(`/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, {
      method: 'PUT',
    })
  }

  async removeReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.request(`/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, {
      method: 'DELETE',
    })
  }

  // Typing indicators
  async startTyping(channelId: string): Promise<void> {
    return this.request(`/channels/${channelId}/typing`, {
      method: 'POST',
    })
  }
}

// Custom hook for real-time server data
export function useRealtimeData(serverId: string, userId: string) {
  const [server, setServer] = useState<Server | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const connectionRef = useRef<RealtimeConnection | null>(null)
  const apiRef = useRef(new APIService())

  // Initialize connection and load initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        
        // Create WebSocket connection
        connectionRef.current = new RealtimeConnection(serverId, userId)
        
        // Load initial data
        const [serverData, categoriesData, membersData] = await Promise.all([
          apiRef.current.getServer(serverId),
          apiRef.current.getCategories(serverId),
          apiRef.current.getMembers(serverId),
        ])

        setServer(serverData)
        setCategories(categoriesData)
        setMembers(membersData)
        
        // Set up real-time listeners
        setupRealtimeListeners()
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    const setupRealtimeListeners = () => {
      if (!connectionRef.current) return

      // Server updates
      connectionRef.current.on('server:updated', (data: Server) => {
        setServer(data)
      })

      // Member updates
      connectionRef.current.on('member:joined', (member: Member) => {
        setMembers(prev => [...prev, member])
      })

      connectionRef.current.on('member:left', (memberId: string) => {
        setMembers(prev => prev.filter(m => m.id !== memberId))
      })

      connectionRef.current.on('member:updated', (member: Member) => {
        setMembers(prev => prev.map(m => m.id === member.id ? member : m))
      })

      // Message updates
      connectionRef.current.on('message:created', (data: { channelId: string, message: Message }) => {
        setMessages(prev => ({
          ...prev,
          [data.channelId]: [...(prev[data.channelId] || []), data.message]
        }))
      })

      connectionRef.current.on('message:updated', (data: { channelId: string, message: Message }) => {
        setMessages(prev => ({
          ...prev,
          [data.channelId]: (prev[data.channelId] || []).map(m => 
            m.id === data.message.id ? data.message : m
          )
        }))
      })

      connectionRef.current.on('message:deleted', (data: { channelId: string, messageId: string }) => {
        setMessages(prev => ({
          ...prev,
          [data.channelId]: (prev[data.channelId] || []).filter(m => m.id !== data.messageId)
        }))
      })

      // Typing indicators
      connectionRef.current.on('typing:start', (data: { channelId: string, userId: string, username: string }) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.channelId]: [...(prev[data.channelId] || []).filter(u => u !== data.username), data.username]
        }))
      })

      connectionRef.current.on('typing:stop', (data: { channelId: string, userId: string, username: string }) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.channelId]: (prev[data.channelId] || []).filter(u => u !== data.username)
        }))
      })
    }

    initializeData()

    return () => {
      connectionRef.current?.disconnect()
    }
  }, [serverId, userId])

  // API methods
  const api = {
    // Messages
    loadMessages: useCallback(async (channelId: string) => {
      try {
        const channelMessages = await apiRef.current.getMessages(channelId)
        setMessages(prev => ({ ...prev, [channelId]: channelMessages }))
        return channelMessages
      } catch (err) {
        console.error('Failed to load messages:', err)
        throw err
      }
    }, []),

    sendMessage: useCallback(async (channelId: string, content: string, attachments?: File[]) => {
      try {
        const message = await apiRef.current.sendMessage(channelId, content, attachments)
        // WebSocket will handle the real-time update
        return message
      } catch (err) {
        console.error('Failed to send message:', err)
        throw err
      }
    }, []),

    editMessage: useCallback(async (channelId: string, messageId: string, content: string) => {
      try {
        return await apiRef.current.editMessage(channelId, messageId, content)
      } catch (err) {
        console.error('Failed to edit message:', err)
        throw err
      }
    }, []),

    deleteMessage: useCallback(async (channelId: string, messageId: string) => {
      try {
        await apiRef.current.deleteMessage(channelId, messageId)
      } catch (err) {
        console.error('Failed to delete message:', err)
        throw err
      }
    }, []),

    toggleReaction: useCallback(async (channelId: string, messageId: string, emoji: string, add: boolean) => {
      try {
        if (add) {
          await apiRef.current.addReaction(channelId, messageId, emoji)
        } else {
          await apiRef.current.removeReaction(channelId, messageId, emoji)
        }
      } catch (err) {
        console.error('Failed to toggle reaction:', err)
        throw err
      }
    }, []),

    startTyping: useCallback(async (channelId: string) => {
      try {
        await apiRef.current.startTyping(channelId)
      } catch (err) {
        console.error('Failed to start typing:', err)
      }
    }, []),

    // Members
    kickMember: useCallback(async (memberId: string, reason?: string) => {
      try {
        await apiRef.current.kickMember(serverId, memberId, reason)
      } catch (err) {
        console.error('Failed to kick member:', err)
        throw err
      }
    }, [serverId]),

    banMember: useCallback(async (memberId: string, reason?: string) => {
      try {
        await apiRef.current.banMember(serverId, memberId, reason)
      } catch (err) {
        console.error('Failed to ban member:', err)
        throw err
      }
    }, [serverId]),

    muteMember: useCallback(async (memberId: string, duration?: number) => {
      try {
        await apiRef.current.muteMember(serverId, memberId, duration)
      } catch (err) {
        console.error('Failed to mute member:', err)
        throw err
      }
    }, [serverId]),

    // Categories & Channels
    createCategory: useCallback(async (name: string, description?: string) => {
      try {
        const category = await apiRef.current.createCategory(serverId, { name, description })
        setCategories(prev => [...prev, category])
        return category
      } catch (err) {
        console.error('Failed to create category:', err)
        throw err
      }
    }, [serverId]),

    createChannel: useCallback(async (categoryId: string, name: string, type: string, description?: string) => {
      try {
        const channel = await apiRef.current.createChannel(serverId, categoryId, { name, type, description })
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, channels: [...cat.channels, channel] }
            : cat
        ))
        return channel
      } catch (err) {
        console.error('Failed to create channel:', err)
        throw err
      }
    }, [serverId]),

    deleteChannel: useCallback(async (channelId: string) => {
      try {
        await apiRef.current.deleteChannel(serverId, channelId)
        setCategories(prev => prev.map(cat => ({
          ...cat,
          channels: cat.channels.filter(ch => ch.id !== channelId)
        })))
      } catch (err) {
        console.error('Failed to delete channel:', err)
        throw err
      }
    }, [serverId]),
  }

  return {
    // Data
    server,
    categories,
    members,
    messages,
    typingUsers,
    loading,
    error,
    
    // API methods
    api,
    
    // WebSocket connection
    connection: connectionRef.current,
  }
}
