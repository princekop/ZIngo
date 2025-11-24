'use client'

import { useState, useEffect } from 'react'
import { X, Shield, Crown, Users, Hash, Volume2, Settings, Eye, EyeOff, MessageSquare, Mic, Speaker, UserPlus, UserMinus, Ban, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Switch } from '@/components/ui/switch' // TODO: Add switch component
import StarButton from '@/components/ui/star-button'
import { toast } from 'sonner'

interface Permission {
  id: string
  name: string
  description: string
  category: 'general' | 'text' | 'voice' | 'advanced'
  icon: any
  defaultValue: boolean | null // null = inherit, true = allow, false = deny
}

interface Role {
  id: string
  name: string
  color?: string
  position: number
  permissions: Record<string, boolean | null>
}

interface PermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'category' | 'channel' | 'role'
  target: {
    id: string
    name: string
    type?: 'text' | 'voice' | 'announcement'
  }
  roles: Role[]
  onSave: (permissions: Record<string, Record<string, boolean | null>>) => void
}

const PERMISSIONS: Permission[] = [
  // General Permissions
  { id: 'view_channel', name: 'View Channel', description: 'Allows members to view this channel', category: 'general', icon: Eye, defaultValue: true },
  { id: 'manage_channel', name: 'Manage Channel', description: 'Allows members to edit channel settings', category: 'general', icon: Settings, defaultValue: false },
  { id: 'manage_permissions', name: 'Manage Permissions', description: 'Allows members to manage permissions for this channel', category: 'general', icon: Shield, defaultValue: false },
  { id: 'manage_webhooks', name: 'Manage Webhooks', description: 'Allows members to create, edit, and delete webhooks', category: 'general', icon: Settings, defaultValue: false },
  { id: 'create_invite', name: 'Create Invite', description: 'Allows members to invite new people to the server', category: 'general', icon: UserPlus, defaultValue: true },

  // Text Permissions
  { id: 'send_messages', name: 'Send Messages', description: 'Allows members to send messages in text channels', category: 'text', icon: MessageSquare, defaultValue: true },
  { id: 'send_messages_in_threads', name: 'Send Messages in Threads', description: 'Allows members to send messages in threads', category: 'text', icon: MessageSquare, defaultValue: true },
  { id: 'create_public_threads', name: 'Create Public Threads', description: 'Allows members to create public threads', category: 'text', icon: Hash, defaultValue: true },
  { id: 'create_private_threads', name: 'Create Private Threads', description: 'Allows members to create private threads', category: 'text', icon: Hash, defaultValue: false },
  { id: 'embed_links', name: 'Embed Links', description: 'Allows members to post links that show embedded content', category: 'text', icon: MessageSquare, defaultValue: true },
  { id: 'attach_files', name: 'Attach Files', description: 'Allows members to upload files and media', category: 'text', icon: MessageSquare, defaultValue: true },
  { id: 'add_reactions', name: 'Add Reactions', description: 'Allows members to add new reactions to messages', category: 'text', icon: MessageSquare, defaultValue: true },
  { id: 'use_external_emojis', name: 'Use External Emojis', description: 'Allows members to use emojis from other servers', category: 'text', icon: MessageSquare, defaultValue: true },
  { id: 'use_external_stickers', name: 'Use External Stickers', description: 'Allows members to use stickers from other servers', category: 'text', icon: MessageSquare, defaultValue: true },
  { id: 'mention_everyone', name: 'Mention @everyone, @here, and All Roles', description: 'Allows members to use @everyone and @here', category: 'text', icon: MessageSquare, defaultValue: false },
  { id: 'manage_messages', name: 'Manage Messages', description: 'Allows members to delete messages from other members', category: 'text', icon: Settings, defaultValue: false },
  { id: 'manage_threads', name: 'Manage Threads', description: 'Allows members to rename, delete, and archive threads', category: 'text', icon: Settings, defaultValue: false },
  { id: 'read_message_history', name: 'Read Message History', description: 'Allows members to read previous messages', category: 'text', icon: Eye, defaultValue: true },
  { id: 'use_slash_commands', name: 'Use Application Commands', description: 'Allows members to use slash commands', category: 'text', icon: MessageSquare, defaultValue: true },

  // Voice Permissions
  { id: 'connect', name: 'Connect', description: 'Allows members to connect to voice channels', category: 'voice', icon: Volume2, defaultValue: true },
  { id: 'speak', name: 'Speak', description: 'Allows members to speak in voice channels', category: 'voice', icon: Mic, defaultValue: true },
  { id: 'video', name: 'Camera', description: 'Allows members to use their camera in voice channels', category: 'voice', icon: Volume2, defaultValue: true },
  { id: 'use_activities', name: 'Use Activities', description: 'Allows members to use activities in voice channels', category: 'voice', icon: Volume2, defaultValue: true },
  { id: 'use_soundboard', name: 'Use Soundboard', description: 'Allows members to use soundboard in voice channels', category: 'voice', icon: Speaker, defaultValue: true },
  { id: 'use_external_sounds', name: 'Use External Sounds', description: 'Allows members to use sounds from other servers', category: 'voice', icon: Speaker, defaultValue: true },
  { id: 'use_voice_activation', name: 'Use Voice Activity', description: 'Allows members to use voice activity detection', category: 'voice', icon: Mic, defaultValue: true },
  { id: 'priority_speaker', name: 'Priority Speaker', description: 'Allows members to be more easily heard when speaking', category: 'voice', icon: Mic, defaultValue: false },
  { id: 'stream', name: 'Go Live', description: 'Allows members to share their screen in voice channels', category: 'voice', icon: Volume2, defaultValue: true },
  { id: 'mute_members', name: 'Mute Members', description: 'Allows members to mute other members in voice channels', category: 'voice', icon: Mic, defaultValue: false },
  { id: 'deafen_members', name: 'Deafen Members', description: 'Allows members to deafen other members in voice channels', category: 'voice', icon: Speaker, defaultValue: false },
  { id: 'move_members', name: 'Move Members', description: 'Allows members to move other members between voice channels', category: 'voice', icon: Volume2, defaultValue: false },

  // Advanced Permissions
  { id: 'administrator', name: 'Administrator', description: 'Grants all permissions and bypasses channel-specific permissions', category: 'advanced', icon: Crown, defaultValue: false },
  { id: 'kick_members', name: 'Kick Members', description: 'Allows members to kick other members from the server', category: 'advanced', icon: UserMinus, defaultValue: false },
  { id: 'ban_members', name: 'Ban Members', description: 'Allows members to ban other members from the server', category: 'advanced', icon: Ban, defaultValue: false },
  { id: 'timeout_members', name: 'Timeout Members', description: 'Allows members to timeout other members', category: 'advanced', icon: Ban, defaultValue: false },
  { id: 'manage_nicknames', name: 'Manage Nicknames', description: 'Allows members to change other members\' nicknames', category: 'advanced', icon: Users, defaultValue: false },
  { id: 'manage_roles', name: 'Manage Roles', description: 'Allows members to create, edit, and delete roles', category: 'advanced', icon: Shield, defaultValue: false },
  { id: 'manage_server', name: 'Manage Server', description: 'Allows members to change server settings', category: 'advanced', icon: Settings, defaultValue: false },
  { id: 'view_audit_log', name: 'View Audit Log', description: 'Allows members to view the server audit log', category: 'advanced', icon: Eye, defaultValue: false },
  { id: 'view_server_insights', name: 'View Server Insights', description: 'Allows members to view server analytics', category: 'advanced', icon: Eye, defaultValue: false }
]

export default function PermissionsModal({ isOpen, onClose, type, target, roles, onSave }: PermissionsModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>('@everyone')
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean | null>>>({})
  const [searchQuery, setSearchQuery] = useState('')

  // Initialize permissions
  useEffect(() => {
    if (isOpen) {
      const initialPermissions: Record<string, Record<string, boolean | null>> = {}
      
      // Initialize @everyone and all roles
      initialPermissions['@everyone'] = {}
      roles.forEach(role => {
        initialPermissions[role.id] = {}
      })

      // Set default permissions
      PERMISSIONS.forEach(perm => {
        initialPermissions['@everyone'][perm.id] = perm.defaultValue
        roles.forEach(role => {
          initialPermissions[role.id][perm.id] = role.permissions[perm.id] || null
        })
      })

      setPermissions(initialPermissions)
    }
  }, [isOpen, roles])

  const filteredPermissions = PERMISSIONS.filter(perm => {
    // Filter by channel type
    if (type === 'channel' && target.type === 'text' && perm.category === 'voice') return false
    if (type === 'channel' && target.type === 'voice' && perm.category === 'text') return false
    
    // Filter by search query
    if (searchQuery && !perm.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !perm.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    
    return true
  })

  const groupedPermissions = filteredPermissions.reduce((groups, perm) => {
    if (!groups[perm.category]) groups[perm.category] = []
    groups[perm.category].push(perm)
    return groups
  }, {} as Record<string, Permission[]>)

  const updatePermission = (permissionId: string, value: boolean | null) => {
    setPermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [permissionId]: value
      }
    }))
  }

  const handleSave = () => {
    onSave(permissions)
    toast.success(`Permissions updated for ${target.name}`)
    onClose()
  }

  const getPermissionState = (permissionId: string): boolean | null => {
    return permissions[selectedRole]?.[permissionId] ?? null
  }

  const PermissionToggle = ({ permission }: { permission: Permission }) => {
    const state = getPermissionState(permission.id)
    const IconComponent = permission.icon

    return (
      <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-white/10">
            <IconComponent className="h-4 w-4 text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white text-sm">{permission.name}</div>
            <div className="text-xs text-white/60 mt-1">{permission.description}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => updatePermission(permission.id, false)}
            className={`p-2 rounded-lg transition ${
              state === false 
                ? 'bg-red-500 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400'
            }`}
            title="Deny"
          >
            <X className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => updatePermission(permission.id, null)}
            className={`p-2 rounded-lg transition ${
              state === null 
                ? 'bg-gray-500 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-gray-500/20 hover:text-gray-400'
            }`}
            title="Inherit"
          >
            <span className="text-sm font-bold">/</span>
          </button>
          
          <button
            onClick={() => updatePermission(permission.id, true)}
            className={`p-2 rounded-lg transition ${
              state === true 
                ? 'bg-emerald-500 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-emerald-500/20 hover:text-emerald-400'
            }`}
            title="Allow"
          >
            <Shield className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/20 bg-black/95 backdrop-blur-xl shadow-2xl overflow-hidden pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">
              {type === 'category' ? 'Category' : type === 'channel' ? 'Channel' : 'Role'} Permissions
            </h2>
            <p className="text-sm text-white/60 mt-1">
              Manage permissions for <span className="font-medium text-white">{target.name}</span>
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Roles Sidebar */}
          <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white/90 mb-3">Roles</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedRole('@everyone')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition ${
                  selectedRole === '@everyone' 
                    ? 'bg-teal-500/20 text-teal-200 border border-teal-400/30' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Users className="h-4 w-4" />
                <span className="text-sm">@everyone</span>
              </button>
              
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition ${
                    selectedRole === role.id 
                      ? 'bg-teal-500/20 text-teal-200 border border-teal-400/30' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: role.color || '#99aab5' }}
                  />
                  <span className="text-sm">{role.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions Content */}
          <div className="flex-1 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <Input
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border-white/15 bg-white/5"
              />
            </div>

            {/* Permissions List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-white/90 mb-3 uppercase tracking-wide">
                      {category.replace('_', ' ')} Permissions
                    </h4>
                    <div className="space-y-2">
                      {perms.map(permission => (
                        <PermissionToggle key={permission.id} permission={permission} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <StarButton variant="success" onClick={handleSave}>
                Save Changes
              </StarButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
