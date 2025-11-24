'use client'

import { useEffect, useRef } from 'react'
import { Settings, Shield, Plus, Trash2, Edit, Copy, Eye, EyeOff, Hash, Volume2, Crown, Users, Palette, Lock, Unlock, Bell, BellOff } from 'lucide-react'

interface ContextMenuProps {
  isOpen: boolean
  x: number
  y: number
  onClose: () => void
  type: 'category' | 'channel' | 'role'
  target: any
  onAction: (action: string, target: any) => void
  userRole?: 'owner' | 'admin' | 'member'
}

export default function ContextMenu({ 
  isOpen, 
  x, 
  y, 
  onClose, 
  type, 
  target, 
  onAction, 
  userRole = 'member' 
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    // Suppress native browser context menu while our menu is open
    const blockNativeContextMenu = (e: Event) => {
      e.preventDefault()
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('contextmenu', blockNativeContextMenu, { capture: true })
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('contextmenu', blockNativeContextMenu, { capture: true } as any)
    }
  }, [isOpen, onClose])

  const handleAction = (action: string) => {
    onAction(action, target)
    onClose()
  }

  const canManage = userRole === 'owner' || userRole === 'admin'

  if (!isOpen) return null

  const getMenuItems = () => {
    switch (type) {
      case 'category':
        return [
          { icon: Plus, label: 'Create Channel', action: 'create_channel', adminOnly: false },
          { icon: Edit, label: 'Edit Category', action: 'edit_category', adminOnly: canManage },
          { icon: Shield, label: 'Edit Permissions', action: 'edit_permissions', adminOnly: canManage },
          { icon: Copy, label: 'Copy Category ID', action: 'copy_id', adminOnly: false },
          { type: 'separator' },
          { icon: Trash2, label: 'Delete Category', action: 'delete_category', adminOnly: canManage, danger: true }
        ]

      case 'channel':
        const isVoice = target?.type === 'voice'
        return [
          { icon: Edit, label: 'Edit Channel', action: 'edit_channel', adminOnly: canManage },
          { icon: Palette, label: 'Customize Appearance', action: 'customize_channel', adminOnly: canManage },
          { icon: Shield, label: 'Edit Permissions', action: 'edit_permissions', adminOnly: canManage },
          { type: 'separator' },
          { icon: Copy, label: 'Copy Channel Link', action: 'copy_link', adminOnly: false },
          { icon: Copy, label: 'Copy Channel ID', action: 'copy_id', adminOnly: false },
          { icon: Plus, label: 'Create Invite', action: 'create_invite', adminOnly: false },
          { type: 'separator' },
          ...(isVoice ? [
            { icon: Volume2, label: 'Join Voice Channel', action: 'join_voice', adminOnly: false }
          ] : [
            { icon: Hash, label: 'Mark as Read', action: 'mark_read', adminOnly: false }
          ]),
          { icon: target?.isMuted ? Bell : BellOff, label: target?.isMuted ? 'Unmute Channel' : 'Mute Channel', action: 'mute_channel', adminOnly: false },
          ...(canManage ? [
            { type: 'separator' },
            { icon: target?.isPrivate ? Unlock : Lock, label: target?.isPrivate ? 'Make Public' : 'Make Private', action: 'toggle_private', adminOnly: true },
            { icon: Settings, label: 'Channel Settings', action: 'channel_settings', adminOnly: true }
          ] : []),
          { type: 'separator' },
          { icon: Trash2, label: 'Delete Channel', action: 'delete_channel', adminOnly: canManage, danger: true }
        ]

      case 'role':
        return [
          { icon: Edit, label: 'Edit Role', action: 'edit_role', adminOnly: canManage },
          { icon: Shield, label: 'Edit Permissions', action: 'edit_permissions', adminOnly: canManage },
          { icon: Users, label: 'View Members', action: 'view_members', adminOnly: false },
          { icon: Copy, label: 'Copy Role ID', action: 'copy_id', adminOnly: false },
          { type: 'separator' },
          { icon: Plus, label: 'Create Role Above', action: 'create_role_above', adminOnly: canManage },
          { icon: Plus, label: 'Create Role Below', action: 'create_role_below', adminOnly: canManage },
          { type: 'separator' },
          { icon: Trash2, label: 'Delete Role', action: 'delete_role', adminOnly: canManage, danger: true }
        ]

      default:
        return []
    }
  }

  const menuItems = getMenuItems().filter(item => 
    item.type === 'separator' || !item.adminOnly || canManage
  )

  return (
    <>
      {/* Backdrop to emphasize menu and capture outside clicks */}
      <div
        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div 
        ref={menuRef}
        className="fixed bg-black/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 z-[9999] min-w-[260px] max-w-[90vw] max-h-[80vh] overflow-auto py-2"
        style={{ 
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'fadeIn 0.1s ease-out',
          pointerEvents: 'auto'
        }}
      >
      {menuItems.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={index} className="h-px bg-white/10 my-1 mx-2" />
        }

        const IconComponent = item.icon
        return (
          <button
            key={index}
            onClick={() => handleAction(item.action || '')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition hover:bg-white/10 ${
              item.danger 
                ? 'text-red-400 hover:bg-red-500/10' 
                : 'text-white/90 hover:text-white'
            }`}
          >
            <IconComponent className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        )
      })}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      </div>
    </>
  )
}
