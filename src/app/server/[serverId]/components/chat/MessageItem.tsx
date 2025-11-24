import React, { useState } from 'react'
import { 
  Smile, 
  Link, 
  Copy, 
  Edit3, 
  Star, 
  Trash2, 
  MoreHorizontal, 
  Paperclip, 
  Plus,
  Reply
} from 'lucide-react'
import { Message } from '../types'
import { UserProfileModal } from '../modals/UserProfileModal'

interface MessageItemProps {
  message: Message
  isGrouped: boolean
  onAction?: (messageId: string, action: string) => void
  onUserProfile?: (userId: string) => void
  onReply?: () => void
  highlighted?: boolean
}

export default function MessageItem({ message, isGrouped, onAction, onReply, highlighted = false }: MessageItemProps) {
  const [showActions, setShowActions] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const handleAction = (action: string) => {
    onAction?.(message.id, action)
    setContextMenu(null)
  }
  
  // Close context menu on click outside or when another context menu opens
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-context-menu]')) {
        setContextMenu(null)
      }
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null)
      }
    }
    
    if (contextMenu) {
      // Small delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
      }, 0)
      
      return () => {
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [contextMenu])
  
  // Safety check for message structure
  if (!message || !message.author) {
    console.warn('Invalid message structure:', message)
    return null
  }

  return (
    <>
      <div 
        className={`group relative ${isGrouped ? 'py-0.5 hover:bg-[#1a1a1a]' : 'mt-3 pt-2 hover:bg-[#1a1a1a]'} px-3 transition-colors ${
          highlighted ? 'bg-[#faa61a]/10 border-l-2 border-[#faa61a] -ml-px' : ''
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onContextMenu={(e) => {
          e.preventDefault()
          setContextMenu({ x: e.clientX, y: e.clientY })
        }}
      >
      {/* Message Container */}
      <div className="flex gap-4">
        
        {/* Avatar */}
        <div className="flex-shrink-0 w-10">
          {!isGrouped ? (
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-[#5865f2] transition-all relative z-10"
                onClick={() => setShowProfileModal(true)}
              >
                {message.author?.avatar ? (
                  <img 
                    src={message.author.avatar} 
                    alt={message.author?.name || 'User'} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#5865f2] to-[#4752c4] flex items-center justify-center">
                    <span className="text-white font-bold text-base">
                      {message.author?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Avatar Decoration - Purple glow effect */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(138, 43, 226, 0.4) 0%, rgba(138, 43, 226, 0.2) 50%, transparent 70%)',
                  filter: 'blur(8px)',
                  transform: 'scale(1.3)',
                  zIndex: 0
                }}
              />
            </div>
          ) : (
            <div className="text-[11px] text-[#6d6f78] text-right pr-1 opacity-0 group-hover:opacity-100 leading-[22px] transition-opacity">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Reply Reference */}
          {message.replyTo && (
            <div className="flex items-start gap-2 mb-2 pl-3 py-1.5 rounded-l-md border-l-2 border-[#5865f2] bg-[#5865f2]/5 hover:bg-[#5865f2]/10 cursor-pointer transition-all group">
              <Reply className="w-3.5 h-3.5 text-[#5865f2] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-[#5865f2] group-hover:underline">
                    @{message.replyTo.author?.name}
                  </span>
                </div>
                <p className="text-xs text-[#b5bac1] group-hover:text-[#dbdee1] truncate transition-colors">
                  {message.replyTo.content}
                </p>
              </div>
            </div>
          )}
          
          {/* Header (non-grouped only) */}
          {!isGrouped && (
            <div className="flex items-baseline gap-2 mb-1">
              <span 
                className="text-white font-semibold text-[15px] hover:underline cursor-pointer"
                onClick={() => setShowProfileModal(true)}
              >
                {message.author.name}
              </span>
              
              {/* Role Badge */}
              <span className="px-1.5 py-0.5 bg-[#5865f2] rounded text-[10px] font-bold text-white uppercase">
                ADMIN
              </span>
              
              {/* Timestamp */}
              <span className="text-[#949ba4] text-[11px] font-medium">
                {new Date(message.timestamp).toLocaleString([], { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              
              {/* Edited Indicator */}
              {message.edited && (
                <span className="text-[#949ba4] text-[10px] italic">(edited)</span>
              )}
            </div>
          )}

          {/* Message Text */}
          <div className="text-[#dbdee1] text-[15px] leading-[1.375rem] break-words whitespace-pre-wrap message-content">
            {message.content.split(/(@\w+)/g).map((part, idx) => {
              if (part.startsWith('@')) {
                return (
                  <span 
                    key={idx}
                    className="bg-[#5865f2]/20 text-[#5865f2] hover:bg-[#5865f2]/30 px-1 rounded cursor-pointer transition-colors font-medium"
                  >
                    {part}
                  </span>
                )
              }
              // Escape HTML to prevent XSS
              const escapedPart = part
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
              return <span key={idx} dangerouslySetInnerHTML={{ __html: escapedPart }} />
            })}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex gap-2 mt-2">
              {message.attachments.map((attachment, idx) => (
                <div key={idx} className="bg-[#2b2d31] rounded p-2 hover:bg-[#35373c] transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-[#949ba4]" />
                    <div className="text-sm text-white truncate max-w-[200px]">{attachment.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(`toggle-reaction:${reaction.emoji}`)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm border transition-all hover:scale-105 ${
                    reaction.reacted 
                      ? 'bg-[#5865f2]/20 border-[#5865f2]/50 text-[#5865f2]' 
                      : 'bg-[#2b2d31]/80 border-[#3f4147] text-[#b5bac1] hover:border-[#5865f2]/50 hover:bg-[#2b2d31]'
                  }`}
                >
                  <span className="leading-none">{reaction.emoji}</span>
                  <span className="text-xs font-semibold leading-none">{reaction.count}</span>
                </button>
              ))}
              
              <button 
                onClick={() => handleAction('add-reaction')}
                className="inline-flex items-center justify-center w-7 h-7 rounded border border-[#3f4147] bg-[#2b2d31]/80 text-[#949ba4] hover:border-[#5865f2]/50 hover:bg-[#2b2d31] hover:text-white hover:scale-105 transition-all"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className={`absolute -top-2 right-3 flex items-center gap-0.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded shadow-xl p-0.5 transition-all duration-150 ${
          showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}>
          <button 
            onClick={() => handleAction('add-reaction')}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
            title="Add reaction"
          >
            <Smile className="w-4 h-4 text-[#787878] hover:text-white" />
          </button>
          <button 
            onClick={onReply}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
            title="Reply"
          >
            <Reply className="w-4 h-4 text-[#787878] hover:text-white" />
          </button>
          <button 
            onClick={() => handleAction('edit')}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
          >
            <Edit3 className="w-4 h-4 text-[#787878] hover:text-white" />
          </button>
          <button 
            onClick={() => handleAction('pin')}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
          >
            <Star className="w-4 h-4 text-[#787878] hover:text-white" />
          </button>
          <button 
            onClick={() => handleAction('delete')}
            className="p-1 hover:bg-[#f23f42]/20 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-[#787878] hover:text-[#f23f42]" />
          </button>
          <button 
            onClick={() => handleAction('more')}
            className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-[#787878] hover:text-white" />
          </button>
        </div>
      </div>
    </div>

    {/* Message Context Menu */}
    {contextMenu && (
      <div
        data-context-menu
        className="fixed rounded-xl shadow-2xl z-50 overflow-hidden border backdrop-blur-xl"
        style={{
          left: `${Math.min(contextMenu.x, window.innerWidth - 220)}px`,
          top: `${Math.min(contextMenu.y, window.innerHeight - 400)}px`,
          backgroundColor: '#0a0a0a',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 min-w-[200px] space-y-1">
          {/* Add Reaction */}
          <button
            onClick={() => handleAction('add-reaction')}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-[#1a1a1a] rounded-md transition-all text-[#c0c0c0] hover:text-white"
          >
            <Smile className="w-4 h-4" />
            <span className="text-sm font-medium">Add Reaction</span>
          </button>
          
          {/* Reply */}
          <button
            onClick={onReply}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-[#1a1a1a] rounded-md transition-all text-[#c0c0c0] hover:text-white"
          >
            <Link className="w-4 h-4" />
            <span className="text-sm font-medium">Reply</span>
          </button>
          
          {/* Copy Button - Enhanced */}
          <button
            onClick={() => handleAction('copy')}
            className="group w-full relative flex items-center justify-center h-10 bg-[#353434] hover:bg-[#464646] rounded-lg border border-[#8d8d8d] shadow-[4px_4px_0px_#8d8d8d] hover:shadow-[2px_2px_0px_#8d8d8d] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-200 overflow-hidden"
          >
            <Copy className="w-4 h-4 text-[#CCCCCC] group-hover:text-[#8bb9fe] transition-all duration-200 absolute left-3" />
            <span className="text-sm font-semibold text-[#CCCCCC] group-hover:text-transparent transition-all duration-200">Copy Message</span>
          </button>
          
          <div className="h-px bg-[#2a2a2a] my-2"></div>
          
          {/* Edit Button - Enhanced */}
          <button
            onClick={() => handleAction('edit')}
            className="group w-full relative flex items-center justify-start h-10 bg-black hover:bg-black/90 rounded-lg shadow-[5px_5px_0px_rgba(0,0,0,0.5)] hover:shadow-[3px_3px_0px_rgba(0,0,0,0.7)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_rgba(255,255,255,0.3)] transition-all duration-200 overflow-hidden px-5"
          >
            <span className="text-white font-bold text-sm group-hover:text-transparent transition-all duration-200">Edit</span>
            <svg 
              viewBox="0 0 512 512" 
              className="w-3.5 h-3.5 absolute right-5 group-hover:right-[43%] fill-white transition-all duration-300 ease-out"
            >
              <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
            </svg>
          </button>
          
          {/* Pin Message */}
          <button
            onClick={() => handleAction('pin')}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-[#1a1a1a] rounded-md transition-all text-[#c0c0c0] hover:text-white"
          >
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">Pin Message</span>
          </button>
          
          <div className="h-px bg-[#2a2a2a] my-2"></div>
          
          {/* Delete Button - Enhanced */}
          <button
            onClick={() => handleAction('delete')}
            className="group w-full relative flex items-center h-10 bg-[#323232] hover:bg-[#2a2a2a] rounded-lg border-2 border-[#dedede] shadow-[4px_4px_0px_#dedede] hover:shadow-[2px_2px_0px_#dedede] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-200 overflow-hidden"
          >
            <span className="text-[#dedede] font-semibold text-sm group-hover:text-transparent transition-all duration-300 translate-x-[33px]">Delete</span>
            <div className="absolute right-0 h-full w-[39px] group-hover:w-full bg-[#1a1a1a] flex items-center justify-center transition-all duration-300 ease-out translate-x-[109px] group-hover:translate-x-0">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 512 512" 
                className="fill-none"
              >
                <path style={{fill: 'none', stroke: '#dedede', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 32}} d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320" />
                <line y2={112} y1={112} x2={432} x1={80} style={{stroke: '#dedede', strokeLinecap: 'round', strokeMiterlimit: 10, strokeWidth: 32}} />
                <path style={{fill: 'none', stroke: '#dedede', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 32}} d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40" />
                <line y2={400} y1={176} x2={256} x1={256} style={{fill: 'none', stroke: '#dedede', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 32}} />
                <line y2={400} y1={176} x2={192} x1={184} style={{fill: 'none', stroke: '#dedede', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 32}} />
                <line y2={400} y1={176} x2={320} x1={328} style={{fill: 'none', stroke: '#dedede', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 32}} />
              </svg>
            </div>
          </button>
        </div>
      </div>
    )}

    {/* User Profile Modal */}
    <UserProfileModal
      isOpen={showProfileModal}
      onClose={() => setShowProfileModal(false)}
      user={{
        id: message.author.id,
        name: message.author.name,
        avatar: message.author.avatar,
        role: 'ADMIN', // TODO: Get from actual user data
        joinedAt: new Date(message.timestamp).toISOString(),
        status: 'online'
      }}
      serverId="server-id" // TODO: Pass from props
      onMention={() => {
        // TODO: Implement mention
        console.log('Mention user:', message.author.name)
      }}
      onMessage={() => {
        // TODO: Implement DM
        console.log('Message user:', message.author.name)
      }}
      onKick={() => {
        // TODO: Implement kick
        console.log('Kick user:', message.author.name)
      }}
      onBan={() => {
        // TODO: Implement ban
        console.log('Ban user:', message.author.name)
      }}
    />
  </>
  )
}
