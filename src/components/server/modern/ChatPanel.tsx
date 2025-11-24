'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Hash, 
  Volume2, 
  Pin, 
  Search,
  MoreHorizontal,
  Reply,
  Edit3,
  Trash2,
  MessageSquare,
  Users,
  Bell,
  BellOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useServer, type Message } from './ServerProvider'
import { MessageComponent } from './MessageComponent'
import { MessageInput } from './MessageInput'
import { toast } from 'sonner'

interface ChatPanelProps {
  channelId: string
  isMobile: boolean
}

export function ChatPanel({ channelId, isMobile }: ChatPanelProps) {
  const { data: session } = useSession()
  const { getChannelById, getMemberById } = useServer()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const channel = getChannelById(channelId)
  const currentUserId = (session?.user as any)?.id

  // Fetch messages for channel
  const fetchMessages = useCallback(async () => {
    if (!channelId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/channels/${channelId}/messages`, {
        cache: 'no-store'
      })
      
      if (response.ok) {
        const messagesData = await response.json()
        setMessages(messagesData.map((msg: any) => ({
          ...msg,
          username: msg.user?.displayName || msg.user?.username || msg.username || 'Unknown User',
          avatar: msg.user?.avatar || msg.avatar,
          timestamp: new Date(msg.timestamp),
          edited: msg.edited ? new Date(msg.edited) : undefined
        })))
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [channelId])

  // Load messages when channel changes
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!channelId || !session?.user || !content.trim()) return

    try {
      // Handle file uploads first if any
      let attachmentUrls: string[] = []
      if (attachments && attachments.length > 0) {
        const formData = new FormData()
        attachments.forEach(file => formData.append('files', file))
        
        const uploadResponse = await fetch('/api/upload/media', {
          method: 'POST',
          body: formData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          attachmentUrls = uploadData.urls || []
        }
      }

      const response = await fetch(`/api/channels/${channelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: content.trim(), 
          replyToId: replyingTo?.id,
          attachments: attachmentUrls,
          userId: currentUserId 
        })
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages(prev => [...prev, {
          ...newMessage,
          timestamp: new Date(newMessage.timestamp)
        }])
        setReplyingTo(null)
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, deleted: true, content: '[Message deleted]' } : m
        ))
        toast.success('Message deleted')
      } else {
        toast.error('Failed to delete message')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    }
  }

  // Edit message
  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      })

      if (response.ok) {
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, content: newContent, edited: new Date() } : m
        ))
        toast.success('Message updated')
      } else {
        toast.error('Failed to edit message')
      }
    } catch (error) {
      console.error('Error editing message:', error)
      toast.error('Failed to edit message')
    }
  }

  // Add reaction
  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      })

      if (response.ok) {
        // Update local state optimistically
        setMessages(prev => prev.map(m => {
          if (m.id !== messageId) return m
          
          const existingReaction = m.reactions.find(r => r.emoji === emoji)
          if (existingReaction) {
            if (existingReaction.users.includes(currentUserId)) {
              // Remove reaction
              existingReaction.users = existingReaction.users.filter(u => u !== currentUserId)
              existingReaction.count -= 1
              if (existingReaction.count === 0) {
                return { ...m, reactions: m.reactions.filter(r => r.emoji !== emoji) }
              }
            } else {
              // Add reaction
              existingReaction.users.push(currentUserId)
              existingReaction.count += 1
            }
          } else {
            // New reaction
            m.reactions.push({
              emoji,
              users: [currentUserId],
              count: 1
            })
          }
          
          return { ...m, reactions: [...m.reactions] }
        }))
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
      toast.error('Failed to add reaction')
    }
  }

  const getChannelIcon = () => {
    if (!channel) return <Hash className="w-5 h-5 text-[#6B6B7A]" />

    switch (channel.type) {
      case 'voice':
        return <Volume2 className="w-5 h-5 text-[#4ADE80]" />
      case 'announcement':
        return <Pin className="w-5 h-5 text-[#FF3B6E]" />
      case 'forum':
        return <MessageSquare className="w-5 h-5 text-[#00D4FF]" />
      default:
        return <Hash className="w-5 h-5 text-[#6B6B7A]" />
    }
  }

  if (!channel) {
    return (
      <div className="h-full bg-white/5 backdrop-blur-md flex items-center justify-center border-x border-white/10">
        <div className="text-center">
          <Hash className="w-16 h-16 mx-auto mb-4 text-[#6B6B7A]" />
          <h3 className="text-lg font-semibold text-white mb-2">No Channel Selected</h3>
          <p className="text-sm text-[#C9C9D1]">Select a channel from the sidebar to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white/5 backdrop-blur-md flex flex-col border-x border-white/10">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#202225] bg-[#36393F] shadow-sm">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            {getChannelIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white text-base">{channel.name}</h2>
            {channel.topic && (
              <p className="text-sm text-[#B9BBBE] truncate">{channel.topic}</p>
            )}
          </div>
        </div>

        {/* Channel Actions */}
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#B9BBBE] hover:text-white hover:bg-[#4F545C]"
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notification Settings</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#B9BBBE] hover:text-white hover:bg-[#4F545C]"
                >
                  <Pin className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pinned Messages</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#B9BBBE] hover:text-white hover:bg-[#4F545C]"
                >
                  <Users className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Member List</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#B9BBBE] hover:text-white hover:bg-[#4F545C]"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
        <div className="py-4 space-y-1">
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-6">
                  <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-4">
                    <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
                    <div className="w-full h-4 bg-white/10 rounded animate-pulse" />
                    <div className="w-3/4 h-4 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length > 0 ? (
            messages.map((message, index) => (
              <MessageComponent
                key={message.id}
                message={message}
                previousMessage={index > 0 ? messages[index - 1] : undefined}
                isOwn={message.userId === currentUserId}
                onReply={setReplyingTo}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onReact={handleAddReaction}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-[#6B6B7A]" />
              <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
              <p className="text-sm text-[#C9C9D1]">Be the first to send a message in #{channel.name}!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Reply Preview - Responsive */}
      {replyingTo && (
        <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-white/10 border-l-4 border-[#00D4FF] flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <Reply className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D4FF] flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-[#C9C9D1]">Replying to {replyingTo.username}</div>
              <div className="text-sm text-white/80 truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-md">
                {replyingTo.content}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyingTo(null)}
            className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-[#C9C9D1] hover:text-white hover:bg-white/10 flex-shrink-0"
          >
            ×
          </Button>
        </div>
      )}

      {/* Message Input - Fully Responsive */}
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t border-white/10">
        <MessageInput
          onSendMessage={handleSendMessage}
          placeholder={`Message #${channel.name}`}
          disabled={channel.type === 'announcement' && !currentUserId}
        />
      </div>
    </div>
  )
}
