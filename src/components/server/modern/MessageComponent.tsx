'use client'

import { useState } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { 
  Reply, 
  MoreHorizontal, 
  Smile, 
  Copy, 
  Edit,
  Edit3, 
  Trash2, 
  Flag, 
  Pin,
  Heart,
  ThumbsUp,
  Laugh
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useServer } from './ServerProvider'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

interface Message {
  id: string
  content: string
  userId: string
  username: string
  avatar?: string
  timestamp: Date
  edited?: Date
  deleted?: boolean
  attachments?: any[]
  reactions?: any[]
  replyTo?: any
}

interface MessageComponentProps {
  message: Message
  previousMessage?: Message
  isOwn: boolean
  onReply: (message: Message) => void
  onEdit: (messageId: string, content: string) => void
  onDelete: (messageId: string) => void
  onReact: (messageId: string, emoji: string) => void
}

export function MessageComponent({
  message,
  previousMessage,
  isOwn,
  onReply,
  onEdit,
  onDelete,
  onReact
}: MessageComponentProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const username = message.username?.trim() || 'Unknown User'

  // Check if this message should be grouped with the previous one
  const shouldGroup = previousMessage && 
    previousMessage.userId === message.userId && 
    (message.timestamp.getTime() - previousMessage.timestamp.getTime()) < 5 * 60 * 1000 && // Within 5 minutes
    !message.replyTo

  const formatTimestamp = (date: Date) => {
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`
    } else {
      return format(date, 'MM/dd/yyyy h:mm a')
    }
  }

  const handleEditSave = () => {
    if (editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  const handleReaction = (emoji: string) => {
    onReact(message.id, emoji)
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  if (message.deleted) {
    return (
      <div className="flex items-start space-x-3 opacity-50">
        <div className="w-10 h-10" />
        <div className="flex-1">
          <div className="text-sm text-slate-500 italic">
            [Message deleted]
          </div>
        </div>
      </div>
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            "group relative flex items-start space-x-3 px-4 py-2 rounded-lg",
            isHovered ? "bg-white/5" : "bg-transparent",
            shouldGroup ? "mt-0.5" : "mt-3"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
      {/* Avatar - Responsive */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex-shrink-0">
        {!shouldGroup && (
          <Avatar className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border border-white/10">
            <AvatarImage src={message.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-[#6C63FF] via-[#8B5CF6] to-[#00D4FF] text-white font-semibold text-xs sm:text-sm">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header - Clean (if not grouped) */}
        {!shouldGroup && (
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="font-medium text-white cursor-pointer text-sm">
              {username}
            </span>
            <span className="text-xs text-[#8B8B8B]">
              {formatTimestamp(message.timestamp)}
            </span>
            {message.edited && (
              <span className="text-xs text-[#8B8B8B]">(edited)</span>
            )}
          </div>
        )}

        {/* Reply Reference */}
        {message.replyTo && (
          <div className="flex items-center space-x-2 mb-2 text-sm text-[#C9C9D1]">
            <Reply className="w-3 h-3" />
            <span className="font-medium">{message.replyTo.username}</span>
            <span className="truncate max-w-xs">{message.replyTo.content}</span>
          </div>
        )}

        {/* Message Body - Clean */}
        <div className="text-[#DCDDDE] text-sm leading-relaxed">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 bg-[#40444B] border-0 rounded-md text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
                rows={3}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleEditSave()
                  } else if (e.key === 'Escape') {
                    handleEditCancel()
                  }
                }}
              />
              <div className="flex space-x-2">
                <Button size="sm" className="bg-[#5865F2] hover:bg-[#4752C4] text-sm h-8" onClick={handleEditSave}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" className="text-[#B9BBBE] hover:text-white text-sm h-8" onClick={handleEditCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="break-words [&_a]:text-[#00AFF4] [&_a]:no-underline [&_a]:hover:underline">
              {message.content}
            </div>
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-white/8 border border-white/10 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {attachment.filename.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {attachment.filename}
                  </div>
                  <div className="text-xs text-[#C9C9D1]">
                    {(attachment.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:border-[#6C63FF] hover:bg-[#6C63FF]/20" asChild>
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                    Download
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs bg-white/10 border border-transparent text-[#C9C9D1] hover:bg-white/20",
                  reaction.users.includes(message.userId) && "bg-[#6C63FF]/25 text-white"
                )}
                onClick={() => handleReaction(reaction.emoji)}
              >
                <span className="mr-1">{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Message Actions */}
      {isHovered && !isEditing && (
        <div className="absolute top-2 right-5 flex items-center space-x-1 bg-[#16163A]/95 border border-white/10 rounded-lg p-1.5 shadow-xl">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction('👍')}
                  className="h-7 w-7 p-0 text-[#C9C9D1] hover:text-white hover:bg-[#6C63FF]/20"
                >
                  <Smile className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Reaction</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(message)}
                  className="h-7 w-7 p-0 text-[#C9C9D1] hover:text-white hover:bg-[#6C63FF]/20"
                >
                  <Reply className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reply</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-[#C9C9D1] hover:text-white hover:bg-[#6C63FF]/20"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#16163A]/95 border border-white/10">
              <DropdownMenuItem onClick={handleCopyMessage} className="text-[#C9C9D1] hover:text-white hover:bg-white/10">
                <Copy className="w-4 h-4 mr-2" />
                Copy Message
              </DropdownMenuItem>
              
              {isOwn && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditing(true)} className="text-[#C9C9D1] hover:text-white hover:bg-white/10">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Message
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-[#FF3B6E] hover:text-[#FF3B6E] hover:bg-[#FF3B6E]/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Message
                  </DropdownMenuItem>
                </>
              )}
              
              {!isOwn && (
                <>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="text-[#FF3B6E] hover:text-[#FF3B6E] hover:bg-[#FF3B6E]/10">
                    <Flag className="w-4 h-4 mr-2" />
                    Report Message
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onReply(message)}>
          <Reply className="w-4 h-4 mr-2" />
          Reply
        </ContextMenuItem>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Message
        </ContextMenuItem>
        {isOwn && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Message
            </ContextMenuItem>
            <ContextMenuItem destructive onClick={() => onDelete(message.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Message
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
