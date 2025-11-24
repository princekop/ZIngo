import React, { useState, useRef, useEffect } from 'react'
import { 
  Hash, 
  Send, 
  Smile, 
  Paperclip, 
  Users,
  PinIcon,
  Search,
  Bell,
  X,
  Reply,
  AtSign
} from 'lucide-react'
import MessageItem from './MessageItem'
import DateSeparator from './DateSeparator'
import EmojiPicker from '../EmojiPicker'
import { Channel, Message, Member } from '../types'

interface EnhancedChatAreaProps {
  currentChannel: Channel | null
  messages: Message[]
  members: Member[]
  messageInput: string
  setMessageInput: (input: string) => void
  onSendMessage: (content: string, replyTo?: string) => void
  onToggleMembersList?: () => void
  memberListVisible?: boolean
  onMessageAction?: (messageId: string, action: string) => void
  isLoading?: boolean
  serverId: string
  currentUserId: string
}

interface MentionSuggestion {
  id: string
  name: string
  avatar?: string
}

export default function EnhancedChatArea({
  currentChannel,
  messages,
  members,
  messageInput,
  setMessageInput,
  onSendMessage,
  onToggleMembersList,
  memberListVisible = true,
  onMessageAction,
  isLoading = false,
  serverId,
  currentUserId
}: EnhancedChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([])
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const [notifications, setNotifications] = useState<number>(0)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`
    }
  }, [messageInput])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Debug log for messages
  useEffect(() => {
    console.log('📬 EnhancedChatArea received messages:', messages)
    console.log('📊 Message count:', messages?.length || 0)
    console.log('🔍 Current channel:', currentChannel?.name)
  }, [messages, currentChannel])

  // Check for mentions and notifications (including replies)
  useEffect(() => {
    const unreadMentions = messages.filter(msg => {
      // Check if message content mentions current user
      const contentMention = msg.content.includes(`@${currentUserId}`)
      // Check if message is a reply to current user's message
      const isReplyToUser = msg.replyTo?.author?.id === currentUserId
      return contentMention || isReplyToUser
    }).length
    setNotifications(unreadMentions)
  }, [messages, currentUserId])

  // Handle @ mentions
  useEffect(() => {
    const lastAtIndex = messageInput.lastIndexOf('@')
    if (lastAtIndex !== -1 && lastAtIndex === messageInput.length - 1) {
      // Just typed @
      setShowMentions(true)
      setMentionSearch('')
      setMentionSuggestions(members.filter(m => m.status === 'online').map(m => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar
      })))
    } else if (lastAtIndex !== -1) {
      const searchText = messageInput.slice(lastAtIndex + 1)
      if (!searchText.includes(' ')) {
        setShowMentions(true)
        setMentionSearch(searchText)
        setMentionSuggestions(
          members
            .filter(m => m.name.toLowerCase().includes(searchText.toLowerCase()))
            .map(m => ({ id: m.id, name: m.name, avatar: m.avatar }))
        )
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }, [messageInput, members])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedMentionIndex(prev => 
          prev < mentionSuggestions.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : mentionSuggestions.length - 1
        )
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        if (mentionSuggestions[selectedMentionIndex]) {
          insertMention(mentionSuggestions[selectedMentionIndex])
        }
      } else if (e.key === 'Escape') {
        setShowMentions(false)
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const insertMention = (user: MentionSuggestion) => {
    const lastAtIndex = messageInput.lastIndexOf('@')
    const newMessage = messageInput.slice(0, lastAtIndex) + `@${user.name} `
    setMessageInput(newMessage)
    setShowMentions(false)
    setSelectedMentionIndex(0)
    textareaRef.current?.focus()
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentChannel) return
    
    try {
      await onSendMessage(messageInput, replyingTo?.id)
      setMessageInput('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleReply = (message: Message) => {
    setReplyingTo(message)
    textareaRef.current?.focus()
  }

  const quickEmojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '👀', '💯']

  // Disable browser right-click context menu globally
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      // Only prevent if not on input/textarea
      const target = e.target as HTMLElement
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault()
      }
    }
    document.addEventListener('contextmenu', preventContextMenu)
    return () => document.removeEventListener('contextmenu', preventContextMenu)
  }, [])

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Channel Header */}
      <div 
        className="h-11 px-2 sm:px-3 flex items-center justify-between border-b"
        style={{
          backgroundColor: '#0f0f0f',
          borderColor: 'rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
          <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
          <h1 className="text-white font-semibold text-sm sm:text-base truncate">
            {currentChannel?.name || 'Select a channel'}
          </h1>
          {currentChannel?.description && (
            <>
              <div className="hidden sm:block h-5 w-px bg-slate-700/50"></div>
              <p className="hidden md:block text-slate-400 text-sm truncate">
                {currentChannel.description}
              </p>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notifications Bell */}
          <button 
            className="relative p-1.5 hover:bg-white/5 rounded transition-colors"
            onClick={() => setNotifications(0)}
          >
            <Bell className="w-5 h-5 text-slate-400 hover:text-slate-300" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {notifications}
              </span>
            )}
          </button>
          
          <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
            <PinIcon className="w-5 h-5 text-slate-400 hover:text-slate-300" />
          </button>
          
          <button 
            onClick={onToggleMembersList}
            className={`p-1.5 hover:bg-white/5 rounded transition-colors ${
              memberListVisible ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Users className="w-5 h-5" />
          </button>
          
          <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
            <Search className="w-5 h-5 text-slate-400 hover:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-[#1a1a1a] scrollbar-track-transparent hover:scrollbar-thumb-[#252525]"
        style={{ backgroundColor: '#141414' }}
      >
        {!currentChannel ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-lg mx-auto p-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Hash className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h2 className="text-white font-bold text-xl sm:text-2xl">Welcome to the Server</h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Select a channel from the sidebar to start chatting with your community.
              </p>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white text-sm">Loading messages...</span>
                </div>
              </div>
            )}

            {messages.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Hash className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base sm:text-lg mb-2">
                      Welcome to #{currentChannel.name}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-md px-4">
                      {currentChannel.description || "This is the beginning of your conversation in this channel."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages List */}
            <div className="flex flex-col">
              {messages && messages.length > 0 ? (
                messages.map((message, index) => {
                  if (!message || !message.id) return null
                  
                  const prevMessage = messages[index - 1]
                  
                  // Check if we need a date separator
                  const showDateSeparator = !prevMessage || 
                    new Date(message.timestamp).toDateString() !== new Date(prevMessage.timestamp).toDateString()
                  
                  // Check if message should be grouped (same user within 5 minutes)
                  const isGrouped = prevMessage && 
                    prevMessage.author?.id === message.author?.id && 
                    (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) < 300000 &&
                    !showDateSeparator // Don't group across date boundaries
                  
                  // Check if user is mentioned (in content or via reply)
                  const isMentionedInContent = message.content?.includes(`@${currentUserId}`)
                  const isRepliedTo = message.replyTo?.author?.id === currentUserId
                  const isMentioned = isMentionedInContent || isRepliedTo
                  
                  return (
                    <React.Fragment key={message.id}>
                      {showDateSeparator && (
                        <DateSeparator date={new Date(message.timestamp)} />
                      )}
                      <div 
                        className={isMentioned ? 'bg-yellow-500/10 border-l-4 border-yellow-500' : ''}
                      >
                        <MessageItem 
                          message={message} 
                          isGrouped={isGrouped}
                          onAction={onMessageAction}
                          onReply={() => handleReply(message)}
                          highlighted={isMentioned}
                        />
                      </div>
                    </React.Fragment>
                  )
                })
              ) : null}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </>
        )}
      </div>

      {/* Message Input */}
      <div 
        className="relative"
        style={{
          backgroundColor: '#141414'
        }}
      >
        <div className="relative p-4">
          {/* Reply Preview */}
          {replyingTo && (
            <div 
              className="mb-2 p-2 rounded-lg border flex items-center justify-between"
              style={{
                backgroundColor: '#0a0a0c',
                borderColor: 'rgba(0, 255, 255, 0.2)'
              }}
            >
              <div className="flex items-center space-x-2">
                <Reply className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">
                  Replying to <span className="text-white font-medium">{replyingTo.author.name}</span>
                </span>
              </div>
              <button onClick={() => setReplyingTo(null)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>
          )}

          {/* Mention Suggestions */}
          {showMentions && mentionSuggestions.length > 0 && (
            <div 
              className="absolute bottom-full left-2 right-2 mb-2 rounded-lg border shadow-2xl max-h-48 overflow-y-auto"
              style={{
                backgroundColor: '#0a0a0c',
                borderColor: 'rgba(0, 255, 255, 0.2)'
              }}
            >
              {mentionSuggestions.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => insertMention(user)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left transition-colors ${
                    index === selectedMentionIndex 
                      ? 'bg-cyan-500/20 text-white' 
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm">{user.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="relative group">
            <div className="relative">
              <div 
                className="relative rounded-lg overflow-hidden transition-all duration-200"
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <textarea
                  ref={textareaRef}
                  placeholder={`Message #${currentChannel?.name || 'channel'}`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!currentChannel}
                  rows={1}
                  className="w-full bg-transparent px-4 py-2.5 pr-28 text-white placeholder-[#6d6f78] focus:outline-none resize-none text-[15px] leading-[1.375] min-h-[44px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <button 
                    className="p-1.5 hover:bg-white/10 rounded transition-all"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5 text-slate-400 hover:text-slate-300" />
                  </button>
                  
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 hover:bg-white/10 rounded transition-all"
                    title="Add emoji"
                  >
                    <Smile className="w-5 h-5 text-slate-400 hover:text-yellow-400" />
                  </button>
                  
                  <button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !currentChannel}
                    className={`p-1.5 rounded transition-all ${
                      messageInput.trim() && currentChannel
                        ? 'bg-cyan-500 hover:bg-cyan-600'
                        : 'bg-slate-700 cursor-not-allowed opacity-50'
                    }`}
                    title="Send message"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <EmojiPicker
                  onEmojiSelect={(emoji) => {
                    setMessageInput(messageInput + emoji)
                    setShowEmojiPicker(false)
                    textareaRef.current?.focus()
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </div>

            {/* Character Count */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="text-slate-500">
                {messageInput.length > 0 && (
                  <span className={messageInput.length > 1800 ? 'text-red-400' : messageInput.length > 1500 ? 'text-yellow-400' : ''}>
                    {messageInput.length}/2000
                  </span>
                )}
              </div>
              <div className="text-slate-500">
                Type <span className="text-cyan-400">@</span> to mention someone
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
