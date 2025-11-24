import React from 'react'
import { 
  Hash, 
  Smile,
  Paperclip,
  Plus,
  MoreHorizontal
} from 'lucide-react'

interface Message {
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
}

interface MessageItemProps {
  message: Message
  isGrouped: boolean
}

export default function MessageItem({ message, isGrouped }: MessageItemProps) {
  return (
    <div className={`group relative ${isGrouped ? 'mt-1' : 'mt-4 sm:mt-6'}`}>
      {/* Message Container */}
      <div className={`flex space-x-3 sm:space-x-4 hover:bg-slate-800 hover:bg-opacity-20 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 ${
        isGrouped ? 'hover:bg-slate-800 hover:bg-opacity-10' : ''
      }`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isGrouped ? 'w-10 sm:w-12' : 'w-10 sm:w-12'}`}>
          {!isGrouped && (
            <div className="relative group/avatar">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer">
                {message.author.avatar ? (
                  <img 
                    src={message.author.avatar} 
                    alt={message.author.name} 
                    className="w-full h-full rounded-full object-cover border-2 border-white border-opacity-10" 
                  />
                ) : (
                  <span className="text-white font-bold text-sm sm:text-base drop-shadow-lg">
                    {message.author.name.charAt(0)}
                  </span>
                )}
              </div>
              
              {/* Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
              
              {/* Hover Card */}
              <div className="absolute left-full ml-2 top-0 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-slate-800 bg-opacity-95 backdrop-blur-xl border border-slate-700 border-opacity-50 rounded-xl p-4 shadow-2xl min-w-[280px]">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">{message.author.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">{message.author.name}</h4>
                      <p className="text-cyan-400 text-sm">@{message.author.name.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status</span>
                      <span className="text-green-400">Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Joined</span>
                      <span className="text-slate-300">2 months ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Grouped Message Timestamp */}
          {isGrouped && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-500 text-right pr-2 leading-6">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header (only for non-grouped messages) */}
          {!isGrouped && (
            <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
              <span className="text-white font-bold text-sm sm:text-base hover:underline cursor-pointer">
                {message.author.name}
              </span>
              
              {/* Role Badge */}
              <div className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-20 border border-purple-500 border-opacity-30 rounded-full">
                <span className="text-purple-300 text-xs font-medium">ADMIN</span>
              </div>
              
              {/* Timestamp */}
              <span className="text-slate-400 text-xs sm:text-sm hover:text-slate-300 transition-colors">
                {new Date(message.timestamp).toLocaleString([], { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              
              {/* Edited Indicator */}
              {message.edited && (
                <span className="text-slate-500 text-xs italic">(edited)</span>
              )}
            </div>
          )}

          {/* Message Text */}
          <div className="text-slate-200 text-sm sm:text-base leading-relaxed break-words">
            {message.content}
          </div>

          {/* Message Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {message.attachments.map((attachment, idx) => (
                <div key={idx} className="bg-slate-800 bg-opacity-50 border border-slate-700 border-opacity-50 rounded-lg p-3 hover:bg-slate-800 hover:bg-opacity-70 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Paperclip className="w-5 h-5 text-cyan-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-slate-400 text-xs">{attachment.size}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
              {message.reactions.map((reaction, idx) => (
                <button
                  key={idx}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 hover:scale-105 ${
                    reaction.reacted 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 bg-opacity-20 border border-cyan-400 border-opacity-50 text-cyan-300 shadow-lg' 
                      : 'bg-slate-700 bg-opacity-50 hover:bg-slate-700 hover:bg-opacity-70 text-slate-300 border border-slate-600 border-opacity-30'
                  }`}
                >
                  <span className="text-base">{reaction.emoji}</span>
                  <span className="font-medium">{reaction.count}</span>
                </button>
              ))}
              
              {/* Add Reaction Button */}
              <button className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-700 bg-opacity-30 hover:bg-slate-700 hover:bg-opacity-50 border border-slate-600 border-opacity-30 text-slate-400 hover:text-slate-300 transition-all duration-200 hover:scale-105">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-start space-x-1 pt-1">
          <button className="p-1.5 sm:p-2 hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors">
            <Smile className="w-4 h-4 text-slate-400 hover:text-slate-300" />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4 text-slate-400 hover:text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  )
}
