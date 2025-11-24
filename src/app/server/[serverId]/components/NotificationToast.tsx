import React, { useEffect } from 'react'
import { X, Reply, AtSign } from 'lucide-react'

interface NotificationToastProps {
  id: string
  type: 'mention' | 'reply'
  message: {
    author: string
    content: string
    channelName?: string
  }
  onClose: (id: string) => void
  onClick?: () => void
}

export default function NotificationToast({ id, type, message, onClose, onClick }: NotificationToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 5000) // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <div 
      className="bg-[#1a1a1a] border border-[#3f4147] rounded-lg shadow-2xl p-4 flex items-start gap-3 cursor-pointer hover:bg-[#222] transition-all animate-slide-in-right min-w-[320px] max-w-[400px]"
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        {type === 'reply' ? (
          <div className="w-10 h-10 bg-[#5865f2]/20 rounded-full flex items-center justify-center">
            <Reply className="w-5 h-5 text-[#5865f2]" />
          </div>
        ) : (
          <div className="w-10 h-10 bg-[#faa61a]/20 rounded-full flex items-center justify-center">
            <AtSign className="w-5 h-5 text-[#faa61a]" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white font-semibold text-sm">
            {type === 'reply' ? 'New Reply' : 'You were mentioned'}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onClose(id)
            }}
            className="text-[#949ba4] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-[#b5bac1] text-xs mb-1">
          <span className="text-[#5865f2] font-medium">{message.author}</span>
          {message.channelName && (
            <span className="text-[#949ba4]"> in #{message.channelName}</span>
          )}
        </p>
        
        <p className="text-[#dbdee1] text-sm truncate">
          {message.content}
        </p>
      </div>
    </div>
  )
}
