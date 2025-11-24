'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Crown, Shield, Users, Palette, Settings, Eye, Move, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import StarButton from '@/components/ui/star-button'
import { toast } from 'sonner'

interface Role {
  id: string
  name: string
  color?: string
  position: number
  permissions: Record<string, boolean | null>
  memberCount: number
  isDefault?: boolean
  isManaged?: boolean
}

interface RoleManagementModalProps {
  isOpen: boolean
  onClose: () => void
  roles: Role[]
  serverId: string
  userRole: 'owner' | 'admin' | 'member'
  onSave: (roles: Role[]) => void
}

const PRESET_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', 
  '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#fb7185',
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#e11d48'
]

export default function RoleManagementModal({ 
  isOpen, 
  onClose, 
  roles: initialRoles, 
  serverId, 
  userRole, 
  onSave 
}: RoleManagementModalProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const isOwner = userRole === 'owner'
  const canManageRoles = isOwner || userRole === 'admin'

  useEffect(() => {
    if (isOpen) {
      setRoles(initialRoles)
      if (initialRoles.length > 0) {
        setSelectedRole(initialRoles[0])
      }
    }
  }, [isOpen, initialRoles])

  const createRole = () => {
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: 'New Role',
      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
      position: Math.max(...roles.map(r => r.position)) + 1,
      permissions: {},
      memberCount: 0
    }
    
    setRoles(prev => [...prev, newRole])
    setSelectedRole(newRole)
    setEditingRole(newRole)
  }

  const deleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (role?.isDefault) {
      toast.error('Cannot delete the default role')
      return
    }
    if (role?.isManaged) {
      toast.error('Cannot delete managed roles')
      return
    }

    setRoles(prev => prev.filter(r => r.id !== roleId))
    if (selectedRole?.id === roleId) {
      setSelectedRole(roles[0] || null)
    }
    toast.success('Role deleted')
  }

  const moveRole = (roleId: string, direction: 'up' | 'down') => {
    const roleIndex = roles.findIndex(r => r.id === roleId)
    if (roleIndex === -1) return

    const newRoles = [...roles]
    const targetIndex = direction === 'up' ? roleIndex - 1 : roleIndex + 1
    
    if (targetIndex < 0 || targetIndex >= newRoles.length) return

    // Swap positions
    const temp = newRoles[roleIndex].position
    newRoles[roleIndex].position = newRoles[targetIndex].position
    newRoles[targetIndex].position = temp

    // Sort by position
    newRoles.sort((a, b) => b.position - a.position)
    setRoles(newRoles)
  }

  const updateRole = (roleId: string, updates: Partial<Role>) => {
    setRoles(prev => prev.map(role => 
      role.id === roleId ? { ...role, ...updates } : role
    ))
    
    if (selectedRole?.id === roleId) {
      setSelectedRole(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const handleSave = () => {
    onSave(roles)
    toast.success('Roles updated successfully')
    onClose()
  }

  const sortedRoles = [...roles].sort((a, b) => b.position - a.position)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] rounded-2xl border border-white/20 bg-black/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Server Roles</h2>
              <p className="text-sm text-white/60">Manage roles and permissions for your server</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Roles List */}
          <div className="w-80 border-r border-white/10 flex flex-col">
            {/* Roles Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Roles ({roles.length})</h3>
                {canManageRoles && (
                  <StarButton variant="primary" size="sm" onClick={createRole}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create
                  </StarButton>
                )}
              </div>
            </div>

            {/* Roles List */}
            <div className="flex-1 overflow-y-auto p-2">
              {sortedRoles.map((role, index) => (
                <div
                  key={role.id}
                  className={`flex items-center gap-3 p-3 rounded-xl mb-1 cursor-pointer transition group ${
                    selectedRole?.id === role.id
                      ? 'bg-white/10 border border-white/20'
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  {/* Role Color */}
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: role.color || '#99aab5' }}
                  />

                  {/* Role Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm truncate">{role.name}</span>
                      {role.isDefault && <Crown className="h-3 w-3 text-yellow-400" />}
                      {role.isManaged && <Settings className="h-3 w-3 text-blue-400" />}
                    </div>
                    <div className="text-xs text-white/60">{role.memberCount} members</div>
                  </div>

                  {/* Role Actions */}
                  {canManageRoles && !role.isDefault && !role.isManaged && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveRole(role.id, 'up')
                        }}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveRole(role.id, 'down')
                        }}
                        disabled={index === sortedRoles.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteRole(role.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Role Details */}
          <div className="flex-1 flex flex-col">
            {selectedRole ? (
              <>
                {/* Role Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: selectedRole.color || '#99aab5' }}
                    >
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      {editingRole?.id === selectedRole.id ? (
                        <Input
                          value={selectedRole.name}
                          onChange={(e) => updateRole(selectedRole.id, { name: e.target.value })}
                          onBlur={() => setEditingRole(null)}
                          onKeyPress={(e) => e.key === 'Enter' && setEditingRole(null)}
                          className="text-lg font-bold bg-transparent border-none p-0 h-auto"
                          autoFocus
                        />
                      ) : (
                        <h3 
                          className="text-lg font-bold text-white cursor-pointer hover:text-white/80"
                          onClick={() => canManageRoles && setEditingRole(selectedRole)}
                        >
                          {selectedRole.name}
                        </h3>
                      )}
                      <div className="text-sm text-white/60">
                        {selectedRole.memberCount} members • Position {selectedRole.position}
                      </div>
                    </div>
                    {canManageRoles && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingRole(selectedRole)}
                        className="rounded-xl"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                {/* Role Settings */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Basic Settings */}
                    <div>
                      <h4 className="font-semibold text-white mb-4">Display</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-2">Role Name</label>
                          <Input
                            value={selectedRole.name}
                            onChange={(e) => updateRole(selectedRole.id, { name: e.target.value })}
                            className="rounded-xl border-white/15 bg-white/5"
                            disabled={!canManageRoles || selectedRole.isDefault}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-2">Role Color</label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={selectedRole.color || '#99aab5'}
                              onChange={(e) => updateRole(selectedRole.id, { color: e.target.value })}
                              className="w-12 h-10 rounded-xl border-white/15 bg-white/5 p-1"
                              disabled={!canManageRoles}
                            />
                            <Select 
                              value={selectedRole.color || '#99aab5'} 
                              onValueChange={(value) => updateRole(selectedRole.id, { color: value })}
                              disabled={!canManageRoles}
                            >
                              <SelectTrigger className="flex-1 rounded-xl border-white/15 bg-white/5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PRESET_COLORS.map(color => (
                                  <SelectItem key={color} value={color}>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-4 h-4 rounded-full" 
                                        style={{ backgroundColor: color }}
                                      />
                                      {color}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Permissions Preview */}
                    <div>
                      <h4 className="font-semibold text-white mb-4">Permissions</h4>
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {Object.values(selectedRole.permissions).filter(p => p === true).length} permissions granted
                            </div>
                            <div className="text-xs text-white/60">
                              Click to manage detailed permissions
                            </div>
                          </div>
                          <StarButton variant="secondary" size="sm">
                            <Shield className="h-4 w-4 mr-2" />
                            Manage Permissions
                          </StarButton>
                        </div>
                      </div>
                    </div>

                    {/* Members */}
                    <div>
                      <h4 className="font-semibold text-white mb-4">Members ({selectedRole.memberCount})</h4>
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-white">
                              View and manage role members
                            </div>
                            <div className="text-xs text-white/60">
                              Add or remove members from this role
                            </div>
                          </div>
                          <StarButton variant="info" size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Manage Members
                          </StarButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <div className="text-white/60">Select a role to view details</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <StarButton variant="success" onClick={handleSave} disabled={!canManageRoles}>
            Save Changes
          </StarButton>
        </div>
      </div>
    </div>
  )
}
