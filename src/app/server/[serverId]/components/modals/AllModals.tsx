import React, { useState, useEffect } from 'react'
import { X, Plus, Edit3, Trash2, UserPlus, Users, Shield, Crown, Ban, Volume2, VolumeX, Zap, Link as LinkIcon, Settings, Hash, Upload, Image as ImageIcon } from 'lucide-react'
import { serverAPI } from '../../lib/api-service'

// ==================== BASE MODAL COMPONENT ====================
interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

function BaseModal({ isOpen, onClose, title, children }: BaseModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl border shadow-2xl"
        style={{
          backgroundColor: '#0a0a0c',
          borderColor: 'rgba(0, 255, 255, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b sticky top-0 bg-[#0a0a0c] z-10" style={{ borderColor: 'rgba(0, 255, 255, 0.1)' }}>
          <h2 className="text-base sm:text-lg font-bold text-white truncate pr-2">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// ==================== CREATE CATEGORY MODAL ====================
interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  serverId: string
  onSuccess: () => void
}

export function CreateCategoryModal({ isOpen, onClose, serverId, onSuccess }: CreateCategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await serverAPI.createCategory(serverId, { name, description })
      onSuccess()
      onClose()
      setName('')
      setDescription('')
    } catch (error) {
      console.error('Failed to create category:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Create Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="e.g., Text Channels"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none"
            rows={3}
            placeholder="Category description..."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}

// ==================== CREATE CHANNEL MODAL ====================
interface CreateChannelModalProps {
  isOpen: boolean
  onClose: () => void
  serverId: string
  categoryId: string
  onSuccess: () => void
}

export function CreateChannelModal({ isOpen, onClose, serverId, categoryId, onSuccess }: CreateChannelModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'text' | 'voice' | 'announcement'>('text')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await serverAPI.createChannel(serverId, categoryId, { name, type, description })
      onSuccess()
      onClose()
      setName('')
      setDescription('')
    } catch (error) {
      console.error('Failed to create channel:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Create Channel">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Channel Type</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType('text')}
              className={`p-3 rounded-lg border transition-colors ${type === 'text'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
            >
              <Hash className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Text</span>
            </button>
            <button
              type="button"
              onClick={() => setType('voice')}
              className={`p-3 rounded-lg border transition-colors ${type === 'voice'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
            >
              <Volume2 className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Voice</span>
            </button>
            <button
              type="button"
              onClick={() => setType('announcement')}
              className={`p-3 rounded-lg border transition-colors ${type === 'announcement'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
            >
              <Zap className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Announce</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Channel Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="e.g., general"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none"
            rows={3}
            placeholder="Channel description..."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}

// ==================== DELETE CONFIRMATION MODAL ====================
interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  onConfirm: () => Promise<void>
}

export function DeleteConfirmModal({ isOpen, onClose, title, message, onConfirm }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-slate-300">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

// ==================== INVITE MODAL ====================
interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  serverId: string
}

export function InviteModal({ isOpen, onClose, serverId }: InviteModalProps) {
  const [inviteLink, setInviteLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const generateInvite = async () => {
    setLoading(true)
    setError('')
    try {
      const invite = await serverAPI.createInvite(serverId, { channelId: 'general' })
      setInviteLink(`${window.location.origin}/invite/${invite.code}`)
    } catch (error: any) {
      console.error('Failed to create invite:', error)
      setError(error?.message || 'Failed to create invite')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  React.useEffect(() => {
    if (isOpen && !inviteLink) {
      generateInvite()
    }
  }, [isOpen])

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Invite People">
      <div className="space-y-4">
        <p className="text-sm text-slate-400">Share this link to invite people to your server</p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : inviteLink ? (
          <>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 px-3 py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-white text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <button
              onClick={generateInvite}
              className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm"
            >
              Generate New Link
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <button
              onClick={generateInvite}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-colors font-medium"
            >
              Generate Invite Link
            </button>
          </div>
        )}
      </div>
    </BaseModal>
  )
}

// ==================== MEMBER ACTION MODAL ====================
interface MemberActionModalProps {
  isOpen: boolean
  onClose: () => void
  serverId: string
  memberId: string
  memberName: string
  action: 'kick' | 'ban' | 'mute'
  onSuccess: () => void
}

export function MemberActionModal({ isOpen, onClose, serverId, memberId, memberName, action, onSuccess }: MemberActionModalProps) {
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState(60) // minutes
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (action === 'kick') {
        await serverAPI.kickMember(serverId, memberId, reason)
      } else if (action === 'ban') {
        await serverAPI.banMember(serverId, memberId, reason)
      } else if (action === 'mute') {
        await serverAPI.muteMember(serverId, memberId, duration)
      }
      onSuccess()
      onClose()
      setReason('')
    } catch (error) {
      console.error(`Failed to ${action} member:`, error)
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    switch (action) {
      case 'kick': return `Kick ${memberName}`
      case 'ban': return `Ban ${memberName}`
      case 'mute': return `Mute ${memberName}`
    }
  }

  const getIcon = () => {
    switch (action) {
      case 'kick': return <UserPlus className="w-5 h-5" />
      case 'ban': return <Ban className="w-5 h-5" />
      case 'mute': return <VolumeX className="w-5 h-5" />
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
          <div className="text-red-400">{getIcon()}</div>
          <div>
            <p className="text-white font-medium">{memberName}</p>
            <p className="text-xs text-slate-400">
              {action === 'kick' && 'Will be removed from the server'}
              {action === 'ban' && 'Will be permanently banned'}
              {action === 'mute' && 'Will be temporarily muted'}
            </p>
          </div>
        </div>

        {action === 'mute' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              min="1"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Reason (Optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none"
            rows={3}
            placeholder="Reason for this action..."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : action.charAt(0).toUpperCase() + action.slice(1)}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}

// ==================== EDIT CHANNEL MODAL ====================
interface EditChannelModalProps {
  isOpen: boolean
  onClose: () => void
  channelId: string
  currentName: string
  currentDescription?: string
  onSuccess: () => void
}

export function EditChannelModal({ isOpen, onClose, channelId, currentName, currentDescription, onSuccess }: EditChannelModalProps) {
  const [name, setName] = useState(currentName)
  const [description, setDescription] = useState(currentDescription || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(currentName)
      setDescription(currentDescription || '')
    }
  }, [isOpen, currentName, currentDescription])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await serverAPI.updateChannel(channelId, { name, description })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to update channel:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Channel">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Channel Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}

// ==================== EDIT PROFILE MODAL ====================
interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [description, setDescription] = useState('')
  const [avatar, setAvatar] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchCurrentProfile()
    }
  }, [isOpen])

  const fetchCurrentProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setDisplayName(data.displayName || '')
        setUsername(data.username || '')
        setDescription(data.description || '')
        setAvatar(data.avatar || '')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Avatar file size must be less than 5MB')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('displayName', displayName)
      formData.append('username', username)
      formData.append('description', description)
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update profile')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      setError(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Avatar</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 to-purple-500 flex-shrink-0">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-cyan-500/20 rounded-lg transition-colors">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-slate-300">Upload Image</span>
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-slate-500 mt-2">Max 5MB. JPG, PNG, GIF supported.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="Enter display name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="Enter username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">About Me</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none"
            rows={3}
            placeholder="Tell us about yourself..."
            maxLength={200}
          />
          <p className="text-xs text-slate-500 mt-1">{description.length}/200 characters</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !displayName.trim() || !username.trim()}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
