'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { ServerPageProps } from './types'

// Existing Components
import LeftSidebar from './components/LeftSidebar'
import EnhancedChatArea from './components/chat/EnhancedChatArea'
import RightSidebar from './components/RightSidebar'
import { ContextMenus } from './components/ContextMenus'
import UserProfileModal from './components/UserProfileModal'
import NotificationToast from './components/NotificationToast'
import VoiceChannel from './components/VoiceChannel'
import { MemberContextMenu } from './components/MemberContextMenu'

// Hooks & Services
import { useServerData } from './hooks/useServerData'
import { useModals } from './hooks/useModals'
import { serverAPI } from './lib/api-service'

// Modals
import {
  CreateCategoryModal,
  CreateChannelModal,
  EditChannelModal,
  DeleteConfirmModal,
  InviteModal,
  MemberActionModal,
  EditProfileModal
} from './components/modals/AllModals'
import {
  EditMessageModal,
  DeleteMessageModal,
  ReactionPickerModal
} from './components/modals/MessageModals'

// Design System
import { COLORS, GlassPanel } from './components/theme/DesignSystem'

// Types
import { Server, Category, Member, Message, Channel } from './components/types'

export default function ServerPage({ params }: ServerPageProps) {
  const resolvedParams = use(params)
  const serverId = resolvedParams.serverId
  const { data: session } = useSession()
  const router = useRouter()

  // UI state
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarVisible, setRightSidebarVisible] = useState(true)
  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [messageInput, setMessageInput] = useState('')

  // Use existing server data hook
  const {
    server,
    categories,
    members,
    messages: initialMessages,
    loading,
    error,
    mutateMessages
  } = useServerData(serverId, selectedChannel)

  // Local state for messages per channel
  const [channelMessages, setChannelMessages] = useState<Record<string, Message[]>>({})

  // Get messages for current channel
  const messages = selectedChannel ? (channelMessages[selectedChannel] || []) : []

  // Context menu states
  const [channelContextMenu, setChannelContextMenu] = useState<any>(null)
  const [categoryContextMenu, setCategoryContextMenu] = useState<any>(null)
  const [memberContextMenu, setMemberContextMenu] = useState<any>(null)

  // Modal states from existing context
  const [serverDropdownOpen, setServerDropdownOpen] = useState(false)

  // Modal management
  const { modalState, openModal, closeModal, isOpen } = useModals()

  // Message modal states
  const [editMessageModal, setEditMessageModal] = useState<{ messageId: string; content: string } | null>(null)
  const [deleteMessageModal, setDeleteMessageModal] = useState<string | null>(null)
  const [reactionPickerModal, setReactionPickerModal] = useState<string | null>(null)

  // User profile modal
  const [userProfileModal, setUserProfileModal] = useState<{ isOpen: boolean; userId: string } | null>(null)

  // Edit profile modal
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)

  // Voice channel state
  const [voiceChannel, setVoiceChannel] = useState<{ id: string; name: string } | null>(null)

  // Notification system
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'mention' | 'reply'
    message: {
      author: string
      content: string
      channelName?: string
    }
  }>>([])

  // Refresh data after modal actions
  const refreshData = () => {
    window.location.reload() // Simple refresh, can be optimized with state updates
  }

  // Refresh messages for current channel only
  const refreshMessages = () => {
    if (currentChannel) {
      handleChannelSelect(currentChannel)
    }
  }

  // API Service functions for real interactions
  const apiService = {
    async sendMessage(channelId: string, content: string) {
      const response = await fetch(`/api/channels/${channelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      return response.json()
    },

    async deleteMessage(channelId: string, messageId: string) {
      await fetch(`/api/messages/${messageId}`, { method: 'DELETE' })
    },

    async toggleReaction(messageId: string, emoji: string) {
      await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      })
    },

    async kickMember(serverId: string, memberId: string) {
      await fetch(`/api/servers/${serverId}/members/${memberId}/kick`, { method: 'POST' })
    },

    async banMember(serverId: string, memberId: string) {
      await fetch(`/api/servers/${serverId}/members/${memberId}/ban`, { method: 'POST' })
    },

    async createCategory(serverId: string, name: string) {
      const response = await fetch(`/api/servers/${serverId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      return response.json()
    },

    async createChannel(serverId: string, categoryId: string, name: string, type: string) {
      const response = await fetch(`/api/servers/${serverId}/categories/${categoryId}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type })
      })
      return response.json()
    }
  }

  // Event handlers
  const handleChannelSelect = async (channel: Channel) => {
    console.log('🔵 Selecting channel:', channel.name, channel.id)

    // Handle voice channels differently
    if (channel.type === 'voice') {
      setVoiceChannel({ id: channel.id, name: channel.name })
      return
    }

    // If switching to text channel, ensure we leave voice view (optional: could keep voice active in background)
    // For now, we switch views to match user request "not to show chat area for vc"
    setVoiceChannel(null)
    setSelectedChannel(channel.id)
    setCurrentChannel(channel)

    // Fetch messages for the selected channel
    try {
      console.log('📡 Fetching messages for channel:', channel.id)
      const fetchedMessages = await serverAPI.getMessages(channel.id, 50)
      console.log('✅ Loaded messages:', fetchedMessages)
      console.log('📊 Message count:', fetchedMessages?.length || 0)

      // Ensure we have an array
      const messagesArray = Array.isArray(fetchedMessages) ? fetchedMessages : []

      // Transform messages to match expected structure
      const transformedMessages = messagesArray.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
        author: {
          id: msg.userId || msg.author?.id || msg.user?.id || 'unknown',
          name: msg.username || msg.author?.name || msg.user?.displayName || msg.user?.username || 'Unknown User',
          avatar: msg.avatar || msg.author?.avatar || msg.user?.avatar || null
        },
        reactions: msg.reactions || [],
        attachments: msg.attachments || [],
        replyTo: msg.replyTo ? {
          id: msg.replyTo.id,
          content: msg.replyTo.content,
          author: {
            id: msg.replyTo.userId || msg.replyTo.user?.id || 'unknown',
            name: msg.replyTo.username || msg.replyTo.user?.displayName || msg.replyTo.user?.username || 'Unknown User',
            avatar: msg.replyTo.user?.avatar || null
          }
        } : undefined
      }))

      console.log('🔄 Transformed messages:', transformedMessages)

      setChannelMessages(prev => ({
        ...prev,
        [channel.id]: transformedMessages
      }))

      console.log('💾 Stored messages for channel:', channel.id)
    } catch (error) {
      console.error('❌ Failed to load messages:', error)
      // Set empty array on error
      setChannelMessages(prev => ({
        ...prev,
        [channel.id]: []
      }))
    }
  }

  const handleSendMessage = async (content: string, replyTo?: string) => {
    if (!content.trim() || !selectedChannel) return

    try {
      // Extract mentions from content
      const mentionRegex = /@(\w+)/g
      const mentionedUsers = []
      let match
      while ((match = mentionRegex.exec(content)) !== null) {
        const mentionedUser = members.find(m => m.name === match[1] || m.username === match[1])
        if (mentionedUser) {
          mentionedUsers.push(mentionedUser.id)
        }
      }

      const response = await fetch(`/api/channels/${selectedChannel}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          replyToId: replyTo,
          mentions: mentionedUsers
        })
      })

      if (response.ok) {
        setMessageInput('')
        // Reload messages to see the new message
        if (currentChannel) {
          handleChannelSelect(currentChannel)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleMessageAction = (messageId: string, action: string) => {
    console.log('Message action:', action, 'for message:', messageId)

    // Find the message
    const message = messages.find(m => m.id === messageId)

    switch (action) {
      case 'edit':
        if (message) {
          setEditMessageModal({ messageId, content: message.content })
        }
        break
      case 'delete':
        setDeleteMessageModal(messageId)
        break
      case 'add-reaction':
        setReactionPickerModal(messageId)
        break
      case 'copy':
        if (message) {
          navigator.clipboard.writeText(message.content)
          alert('✅ Message copied to clipboard!')
        }
        break
      case 'pin':
        fetch(`/api/messages/${messageId}/pin`, { method: 'POST' })
          .then(async (response) => {
            if (response.ok) {
              const data = await response.json()
              const isPinned = data.pinned
              alert(isPinned ? '📌 Message pinned!' : '✅ Message unpinned!')
              // Reload messages for current channel
              if (currentChannel) {
                handleChannelSelect(currentChannel)
              }
            } else {
              alert('❌ Failed to pin message')
            }
          })
          .catch(err => {
            console.error('Failed to pin message:', err)
            alert('❌ Failed to pin message')
          })
        break
      default:
        if (action.startsWith('toggle-reaction:')) {
          const emoji = action.split(':')[1]
          fetch(`/api/messages/${messageId}/reactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emoji })
          }).then(() => {
            // Reload messages for current channel
            if (currentChannel) {
              handleChannelSelect(currentChannel)
            }
          })
        }
    }
  }

  // Listen for create channel/category events from sidebar
  useEffect(() => {
    const handleOpenCreateChannel = (e: any) => {
      const { categoryId, categoryName } = e.detail
      openModal('createChannel', { categoryId, categoryName })
    }

    const handleOpenCreateCategory = () => {
      openModal('createCategory')
    }

    window.addEventListener('openCreateChannel', handleOpenCreateChannel)
    window.addEventListener('openCreateCategory', handleOpenCreateCategory)

    return () => {
      window.removeEventListener('openCreateChannel', handleOpenCreateChannel)
      window.removeEventListener('openCreateCategory', handleOpenCreateCategory)
    }
  }, [openModal])

  // Apply CSS variables for the new theme - MUST BE BEFORE ANY RETURNS
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      :root {
        --color-base: ${COLORS.base};
        --color-glass: ${COLORS.glass};
        --color-neon-cyan: ${COLORS.neonCyan};
        --color-electric-violet: ${COLORS.electricViolet};
        --color-venom-red: ${COLORS.venomRed};
        --gradient-primary: ${COLORS.primary};
        --glass-panel: ${COLORS.glassPanel};
        --glass-border: ${COLORS.glassBorder};
        --text-primary: ${COLORS.textPrimary};
        --text-secondary: ${COLORS.textSecondary};
        --text-muted: ${COLORS.textMuted};
        --text-accent: ${COLORS.textAccent};
      }
      
      @keyframes gradientRing {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .gradient-ring {
        background: linear-gradient(135deg, #00ffff, #8a2be2, #ff0040);
        background-size: 200% 200%;
        animation: gradientRing 3s ease infinite;
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Set first available channel on load
  useEffect(() => {
    if (categories.length > 0 && !selectedChannel) {
      const firstChannel = categories[0]?.channels?.[0]
      if (firstChannel) {
        handleChannelSelect(firstChannel)
      }
    }
  }, [categories, selectedChannel])

  // Close dropdowns and context menus when clicking outside  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-dropdown="server"]')) {
        setServerDropdownOpen(false)
      }
      // Close context menus when clicking anywhere
      setChannelContextMenu(null)
      setCategoryContextMenu(null)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Loading state
  if (loading || !server) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading server...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-screen flex overflow-hidden relative"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-[#0a0a0a] border border-cyan-500/20 rounded-lg"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Left Sidebar (Channels) */}
      <div className={`relative z-20 ${leftSidebarCollapsed ? 'hidden md:block' : 'fixed md:relative inset-0 md:inset-auto'}`}>
        <LeftSidebar
          server={server}
          categories={categories}
          leftSidebarCollapsed={leftSidebarCollapsed}
          serverDropdownOpen={serverDropdownOpen}
          setServerDropdownOpen={setServerDropdownOpen}
          selectedChannel={selectedChannel}
          onChannelSelect={handleChannelSelect}
          onInviteClick={() => {
            openModal('invite')
            setServerDropdownOpen(false)
          }}
          onBoostClick={() => {
            router.push(`/server/${serverId}/boosts`)
          }}
          onSettingsClick={() => {
            router.push(`/server/${serverId}/settings`)
          }}
          onEditProfile={() => {
            setShowEditProfileModal(true)
          }}
          onChannelContextMenu={(e, channel) => {
            setChannelContextMenu({
              x: e.clientX,
              y: e.clientY,
              channelId: channel.id,
              channelName: channel.name,
              channelDescription: channel.description
            })
          }}
          onCategoryContextMenu={(e, category) => {
            setCategoryContextMenu({
              x: e.clientX,
              y: e.clientY,
              categoryId: category.id,
              categoryName: category.name
            })
          }}
        />
      </div>

      {/* Main Content Area */}
      {voiceChannel ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
          <VoiceChannel
            channelId={voiceChannel.id}
            channelName={voiceChannel.name}
            serverId={serverId}
            onLeave={() => setVoiceChannel(null)}
          />
        </div>
      ) : (
        <EnhancedChatArea
          currentChannel={currentChannel}
          messages={messages}
          members={members}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSendMessage={handleSendMessage}
          onToggleMembersList={() => setRightSidebarVisible(!rightSidebarVisible)}
          memberListVisible={rightSidebarVisible}
          onMessageAction={handleMessageAction}
          isLoading={loading}
          serverId={serverId}
          currentUserId={session?.user?.id || ''}
        />
      )}

      {/* Right Sidebar */}
      {rightSidebarVisible && (
        <div className="hidden lg:block">
          <RightSidebar
            members={members}
            onMemberClick={(member) => {
              setUserProfileModal({ isOpen: true, userId: member.id })
            }}
            onMemberContextMenu={(e, member) => {
              setMemberContextMenu({
                x: e.clientX,
                y: e.clientY,
                memberId: member.id,
                memberName: member.name
              })
            }}
          />
        </div>
      )}

      {/* Context Menus */}
      <ContextMenus
        channelContextMenu={channelContextMenu}
        categoryContextMenu={categoryContextMenu}
        serverId={serverId}
        onEditChannel={(channelId, name, description) => {
          openModal('editChannel', { channelId, currentName: name, currentDescription: description })
          setChannelContextMenu(null)
        }}
        onDeleteChannel={(channelId, name) => {
          openModal('deleteChannel', { channelId, channelName: name })
          setChannelContextMenu(null)
        }}
        onCreateChannel={(categoryId) => {
          openModal('createChannel', { categoryId })
          setCategoryContextMenu(null)
        }}
        onEditCategory={(categoryId, name) => {
          openModal('editCategory', { categoryId, currentName: name })
          setCategoryContextMenu(null)
        }}
        onDeleteCategory={(categoryId, name) => {
          openModal('deleteCategory', { categoryId, categoryName: name })
          setCategoryContextMenu(null)
        }}
        onChannelSettings={(channelId) => {
          router.push(`/server/${serverId}/channels/${channelId}/settings`)
        }}
      />

      {memberContextMenu && (
        <MemberContextMenu
          x={memberContextMenu.x}
          y={memberContextMenu.y}
          memberId={memberContextMenu.memberId}
          memberName={memberContextMenu.memberName}
          serverId={serverId}
          onClose={() => setMemberContextMenu(null)}
          onViewProfile={() => {
            setUserProfileModal({ isOpen: true, userId: memberContextMenu.memberId })
            setMemberContextMenu(null)
          }}
          onSendMessage={() => {
            // TODO: Implement DM logic
            console.log('Send message to:', memberContextMenu.memberName)
            setMemberContextMenu(null)
          }}
          onKick={() => {
            openModal('kickMember', { memberId: memberContextMenu.memberId, memberName: memberContextMenu.memberName })
            setMemberContextMenu(null)
          }}
          onBan={() => {
            openModal('banMember', { memberId: memberContextMenu.memberId, memberName: memberContextMenu.memberName })
            setMemberContextMenu(null)
          }}
          onMute={() => {
            openModal('muteMember', { memberId: memberContextMenu.memberId, memberName: memberContextMenu.memberName })
            setMemberContextMenu(null)
          }}
        />
      )}

      {/* ALL MODALS */}
      <CreateCategoryModal
        isOpen={isOpen('createCategory')}
        onClose={closeModal}
        serverId={serverId}
        onSuccess={refreshData}
      />

      <CreateChannelModal
        isOpen={isOpen('createChannel')}
        onClose={closeModal}
        serverId={serverId}
        categoryId={modalState.data?.categoryId || ''}
        onSuccess={refreshData}
      />

      <EditChannelModal
        isOpen={isOpen('editChannel')}
        onClose={closeModal}
        channelId={modalState.data?.channelId || ''}
        currentName={modalState.data?.currentName || ''}
        currentDescription={modalState.data?.currentDescription}
        onSuccess={refreshData}
      />

      <DeleteConfirmModal
        isOpen={isOpen('deleteChannel')}
        onClose={closeModal}
        title="Delete Channel"
        message={`Are you sure you want to delete #${modalState.data?.channelName}? This action cannot be undone.`}
        onConfirm={async () => {
          await serverAPI.deleteChannel(modalState.data?.channelId)
          refreshData()
        }}
      />

      <DeleteConfirmModal
        isOpen={isOpen('deleteCategory')}
        onClose={closeModal}
        title="Delete Category"
        message={`Are you sure you want to delete "${modalState.data?.categoryName}" and all its channels?`}
        onConfirm={async () => {
          await serverAPI.deleteCategory(serverId, modalState.data?.categoryId)
          refreshData()
        }}
      />

      <InviteModal
        isOpen={isOpen('invite')}
        onClose={closeModal}
        serverId={serverId}
      />

      <MemberActionModal
        isOpen={isOpen('kickMember')}
        onClose={closeModal}
        serverId={serverId}
        memberId={modalState.data?.memberId || ''}
        memberName={modalState.data?.memberName || ''}
        action="kick"
        onSuccess={refreshData}
      />

      <MemberActionModal
        isOpen={isOpen('banMember')}
        onClose={closeModal}
        serverId={serverId}
        memberId={modalState.data?.memberId || ''}
        memberName={modalState.data?.memberName || ''}
        action="ban"
        onSuccess={refreshData}
      />

      <MemberActionModal
        isOpen={isOpen('muteMember')}
        onClose={closeModal}
        serverId={serverId}
        memberId={modalState.data?.memberId || ''}
        memberName={modalState.data?.memberName || ''}
        action="mute"
        onSuccess={refreshData}
      />

      {/* MESSAGE MODALS */}
      <EditMessageModal
        isOpen={!!editMessageModal}
        onClose={() => setEditMessageModal(null)}
        messageId={editMessageModal?.messageId || ''}
        currentContent={editMessageModal?.content || ''}
        onSuccess={refreshMessages}
      />

      <DeleteMessageModal
        isOpen={!!deleteMessageModal}
        onClose={() => setDeleteMessageModal(null)}
        messageId={deleteMessageModal || ''}
        onSuccess={refreshMessages}
      />

      <ReactionPickerModal
        isOpen={!!reactionPickerModal}
        onClose={() => setReactionPickerModal(null)}
        messageId={reactionPickerModal || ''}
        onReactionSelect={(emoji) => {
          console.log('Reaction selected:', emoji)
          refreshMessages()
        }}
      />

      {/* User Profile Modal */}
      {userProfileModal && (
        <UserProfileModal
          isOpen={userProfileModal.isOpen}
          onClose={() => setUserProfileModal(null)}
          userId={userProfileModal.userId}
          serverId={serverId}
        />
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        onSuccess={() => {
          setShowEditProfileModal(false)
          window.location.reload() // Refresh to show new profile data
        }}
      />

      {/* Notification Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            id={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            onClick={() => {
              // Scroll to the message or navigate to it
              console.log('Notification clicked:', notification)
              setNotifications(prev => prev.filter(n => n.id !== notification.id))
            }}
          />
        ))}
      </div>


    </div>
  )
}
