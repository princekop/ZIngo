import React, { useState, useRef, useEffect } from 'react'
import { 
  Hash, 
  Send, 
  Smile, 
  Paperclip, 
  AtSign, 
  Zap,
  Plus,
  Users,
  PinIcon,
  Search,
  Bell,
  MoreHorizontal
} from 'lucide-react'
import MessageItem from './MessageItem'
import { Channel, Message } from '../types'

interface ChatAreaProps {
  channel: Channel | null
  messages: Message[]
  messageInput: string
  setMessageInput: (input: string) => void
  onSendMessage: () => void
  onToggleMembersList?: () => void
  memberListVisible?: boolean
  onMessageAction?: (messageId: string, action: string) => void
  isLoading?: boolean
}

export default function ChatArea({
  channel,
  messages,
  messageInput,
  setMessageInput,
  onSendMessage,
  onToggleMembersList,
  memberListVisible = true,
  onMessageAction,
  isLoading = false
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

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

  // Handle typing indicator
  useEffect(() => {
    if (messageInput.trim()) {
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 1000)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [messageInput])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  // Quick emoji list
  const quickEmojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '👀', '💯']

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Channel Header */}
      <div className="h-16 bg-slate-800 bg-opacity-60 backdrop-blur-xl border-b border-slate-700 border-opacity-50 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Hash className="w-5 h-5 text-slate-400" />
          <h1 className="text-white font-semibold">
            {channel?.name || 'Select a channel'}
          </h1>
          {channel?.type === 'text' && (
            <div className="h-6 w-px bg-slate-600"></div>
          )}
          <p className="text-slate-400 text-sm">
            {channel?.description || `Welcome to #${channel?.name}`}
          </p>
          
          {/* Channel Status Indicators */}
          {channel && (
            <div className="flex items-center space-x-2">
              {channel.locked && <PinIcon className="w-4 h-4 text-yellow-400" />}
              {channel.premium && <Zap className="w-4 h-4 text-yellow-400" />}
              {channel.unread && (
                <div className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {channel.unread} new
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors">
            <PinIcon className="w-5 h-5 text-slate-400" />
          </button>
          <button 
            onClick={onToggleMembersList}
            className={`p-2 hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors ${
              memberListVisible ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors">
            <Search className="w-5 h-5 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto relative">
        {!channel ? (
          /* No Channel Selected */
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-lg mx-auto p-6">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Hash className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-white font-bold text-2xl">Welcome to the Server</h2>
              <p className="text-slate-400 text-base leading-relaxed">
                Select a channel from the sidebar to start chatting with your community.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Loading State */}
            {isLoading && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white text-sm">Loading messages...</span>
                </div>
              </div>
            )}

            {/* Empty Channel State */}
            {messages.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Hash className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">
                      Welcome to #{channel.name}
                    </h3>
                    <p className="text-slate-400 text-sm max-w-md">
                      {channel.description || "This is the beginning of your conversation in this channel."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages List */}
            <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
              {messages.map((message, index) => {
                const prevMessage = messages[index - 1]
                const isGrouped = prevMessage && 
                  prevMessage.author.id === message.author.id && 
                  (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) < 300000

                return (
                  <MessageItem 
                    key={message.id} 
                    message={message} 
                    isGrouped={isGrouped}
                    onAction={onMessageAction}
                  />
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent opacity-20"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"></div>
        
        <div className="relative p-4 sm:p-6">
          <div className="relative group">
            {/* Typing Indicator */}
            {isTyping && (
              <div className="mb-3 h-4">
                <div className="flex items-center space-x-2 text-xs text-slate-400 opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span>Someone is typing...</span>
                </div>
              </div>
            )}

            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 bg-opacity-10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              
              {/* Input Container */}
              <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-opacity-80 border border-gray-700 border-opacity-50 rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-cyan-400 focus-within:border-opacity-50">
                <textarea
                  ref={textareaRef}
                  placeholder={`Message #${channel?.name || 'channel'}`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!channel}
                  rows={1}
                  className="w-full bg-transparent px-6 py-4 pr-32 text-white placeholder-slate-400 focus:outline-none resize-none text-base leading-relaxed min-h-[56px] max-h-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Action Buttons */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {/* File Upload */}
                  <button className="p-2.5 hover:bg-slate-700 hover:bg-opacity-50 rounded-xl transition-all duration-200 hover:scale-110 group/btn">
                    <Paperclip className="w-5 h-5 text-slate-400 group-hover/btn:text-cyan-400 transition-colors" />
                  </button>

                  {/* Emoji Picker */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2.5 hover:bg-slate-700 hover:bg-opacity-50 rounded-xl transition-all duration-200 hover:scale-110 group/btn"
                    >
                      <Smile className="w-5 h-5 text-slate-400 group-hover/btn:text-yellow-400 transition-colors" />
                    </button>
                    
                    {showEmojiPicker && (
                      <div className="absolute bottom-full right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg p-2 shadow-xl">
                        <div className="grid grid-cols-5 gap-1">
                          {quickEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => handleEmojiSelect(emoji)}
                              className="p-2 hover:bg-slate-700 rounded text-lg transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Send Button */}
                  <button 
                    onClick={onSendMessage}
                    disabled={!messageInput.trim() || !channel}
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      messageInput.trim() && channel
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg hover:scale-110'
                        : 'bg-slate-600 bg-opacity-50 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Send className={`w-5 h-5 transition-colors ${
                      messageInput.trim() && channel ? 'text-white' : 'text-slate-500'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/70 hover:to-gray-600/70 rounded-full text-sm text-slate-300 hover:text-white transition-all duration-200 hover:scale-105 border border-gray-600/30">
                  <AtSign className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline font-medium">Mention</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/70 hover:to-gray-600/70 rounded-full text-sm text-slate-300 hover:text-white transition-all duration-200 hover:scale-105 border border-gray-600/30">
                  <Hash className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline font-medium">Channel</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/70 hover:to-gray-600/70 rounded-full text-sm text-slate-300 hover:text-white transition-all duration-200 hover:scale-105 border border-gray-600/30">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="hidden sm:inline font-medium">Slash</span>
                </button>
              </div>

              {/* Character Count */}
              <div className="flex items-center space-x-3">
                <div className={`text-xs font-mono transition-colors ${
                  messageInput.length > 1800 ? 'text-red-400' : 
                  messageInput.length > 1500 ? 'text-yellow-400' : 'text-slate-500'
                }`}>
                  {messageInput.length}/2000
                </div>
                {messageInput.length > 0 && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
