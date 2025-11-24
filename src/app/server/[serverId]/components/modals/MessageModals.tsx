import React, { useState, useEffect } from 'react'
import { X, Trash2, Edit3, Smile } from 'lucide-react'

// Edit Message Modal
interface EditMessageModalProps {
  isOpen: boolean
  onClose: () => void
  messageId: string
  currentContent: string
  onSuccess: () => void
}

export function EditMessageModal({ isOpen, onClose, messageId, currentContent, onSuccess }: EditMessageModalProps) {
  const [content, setContent] = useState(currentContent)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setContent(currentContent)
    }
  }, [isOpen, currentContent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (response.ok) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Failed to edit message:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: '#0a0a0c',
          borderColor: 'rgba(0, 255, 255, 0.2)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(0, 255, 255, 0.1)' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Edit3 className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Edit Message</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Message Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-black/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              style={{ borderColor: 'rgba(0, 255, 255, 0.2)' }}
              rows={4}
              placeholder="Enter your message..."
              maxLength={2000}
            />
            <p className="text-xs text-slate-500 mt-1">{content.length}/2000</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Message Modal
interface DeleteMessageModalProps {
  isOpen: boolean
  onClose: () => void
  messageId: string
  onSuccess: () => void
}

export function DeleteMessageModal({ isOpen, onClose, messageId, onSuccess }: DeleteMessageModalProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: '#0a0a0c',
          borderColor: 'rgba(255, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255, 0, 0, 0.2)' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Delete Message</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-300">
            Are you sure you want to delete this message? This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Delete Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Reaction Picker Modal
interface ReactionPickerModalProps {
  isOpen: boolean
  onClose: () => void
  messageId: string
  onReactionSelect: (emoji: string) => void
}

export function ReactionPickerModal({ isOpen, onClose, messageId, onReactionSelect }: ReactionPickerModalProps) {
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    'Symbols': ['✅', '❌', '⭐', '🔥', '💯', '💥', '💫', '✨', '💢', '💬', '👀', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚡']
  }

  const handleEmojiClick = async (emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      })

      if (response.ok) {
        onReactionSelect(emoji)
        onClose()
      }
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg rounded-2xl border shadow-2xl max-h-[80vh] overflow-hidden"
        style={{
          backgroundColor: '#0a0a0c',
          borderColor: 'rgba(0, 255, 255, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 z-10" style={{ backgroundColor: '#0a0a0c', borderColor: 'rgba(0, 255, 255, 0.1)' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Smile className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Pick a Reaction</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {Object.entries(emojiCategories).map(([category, emojis]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">{category}</h3>
              <div className="grid grid-cols-8 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl p-2 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
