import React from 'react'
import { Hash, Users, PinIcon, Send, Smile, Paperclip, AtSign, Zap } from 'lucide-react'
import MessageItem from './MessageItem'
import { Channel, Message } from './types'

interface MainContentProps {
  currentChannel: Channel | null
  messages: Message[]
  messageInput: string
  setMessageInput: (input: string) => void
  handleSendMessage: () => void
  rightSidebarVisible: boolean
  setRightSidebarVisible: (visible: boolean) => void
}

export default function MainContent({
  currentChannel,
  messages,
  messageInput,
  setMessageInput,
  handleSendMessage,
  rightSidebarVisible,
  setRightSidebarVisible
}: MainContentProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Channel Header */}
      <div 
        className="h-14 sm:h-16 px-3 sm:px-4 md:px-6 flex items-center justify-between border-b"
        style={{
          backgroundColor: '#050406',
          borderColor: 'rgba(0, 255, 255, 0.1)'
        }}
      >
        <div className="flex items-center space-x-4">
          <Hash className="w-5 h-5 text-slate-400" />
          <h1 className="text-white font-semibold">{currentChannel?.name || 'Select a channel'}</h1>
          {currentChannel?.type === 'text' && (
            <div className="h-6 w-px bg-slate-600"></div>
          )}
          <p className="text-slate-400 text-sm">
            {currentChannel?.description || `Welcome to #${currentChannel?.name}`}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors">
            <PinIcon className="w-5 h-5 text-slate-400" />
          </button>
          <button 
            onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
            className="p-2 hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto relative"
        style={{ backgroundColor: '#050406' }}
      >
        {!currentChannel ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-lg mx-auto p-6">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto">
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
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Hash className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Welcome to #{currentChannel.name}</h3>
                    <p className="text-slate-400 text-sm max-w-md">
                      {currentChannel.description || "This is the beginning of your conversation in this channel."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Container */}
            <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
              {messages.map((message, index) => {
                const prevMessage = messages[index - 1]
                const isGrouped = prevMessage && 
                  prevMessage.author.id === message.author.id && 
                  (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) < 300000
                
                return (
                  <MessageItem key={message.id} message={message} isGrouped={isGrouped} />
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Message Input */}
      <div 
        className="relative border-t"
        style={{
          backgroundColor: '#050406',
          borderColor: 'rgba(0, 255, 255, 0.1)'
        }}
      >
        <div className="relative p-3 sm:p-4 md:p-6">
          <div className="relative group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 bg-opacity-10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              
              <div 
                className="relative border rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-cyan-400"
                style={{
                  backgroundColor: '#0a0a0c',
                  borderColor: 'rgba(0, 255, 255, 0.2)'
                }}
              >
                <textarea
                  placeholder={`Message #${currentChannel?.name || 'channel'}`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  rows={1}
                  className="w-full bg-transparent px-4 sm:px-6 py-3 sm:py-4 pr-24 sm:pr-32 text-white placeholder-slate-400 focus:outline-none resize-none text-sm sm:text-base leading-relaxed min-h-[48px] sm:min-h-[56px] max-h-[120px] sm:max-h-[140px]"
                />

                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button className="p-2.5 hover:bg-slate-700 hover:bg-opacity-50 rounded-xl transition-all duration-200 hover:scale-110">
                    <Paperclip className="w-5 h-5 text-slate-400 hover:text-cyan-400 transition-colors" />
                  </button>
                  <button className="p-2.5 hover:bg-slate-700 hover:bg-opacity-50 rounded-xl transition-all duration-200 hover:scale-110">
                    <Smile className="w-5 h-5 text-slate-400 hover:text-yellow-400 transition-colors" />
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      messageInput.trim()
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg hover:scale-110'
                        : 'bg-slate-600 bg-opacity-50 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Send className={`w-5 h-5 transition-colors ${
                      messageInput.trim() ? 'text-white' : 'text-slate-500'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

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
