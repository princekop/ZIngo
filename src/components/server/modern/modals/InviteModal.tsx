'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, UserPlus, Clock, Users, Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  serverId: string
  serverName: string
}

interface InviteLink {
  id: string
  code: string
  uses: number
  maxUses: number | null
  expiresAt: Date | null
  createdAt: Date
  createdBy: {
    username: string
    avatar?: string
  }
}

export function InviteModal({ isOpen, onClose, serverId, serverName }: InviteModalProps) {
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  
  // Invite creation settings
  const [maxAge, setMaxAge] = useState('604800') // 7 days in seconds
  const [maxUses, setMaxUses] = useState('0') // 0 = unlimited
  const [temporary, setTemporary] = useState(false)

  // Load existing invites
  const loadInvites = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/servers/${serverId}/invites`)
      if (response.ok) {
        const invites = await response.json()
        setInviteLinks(invites.map((invite: any) => ({
          ...invite,
          expiresAt: invite.expiresAt ? new Date(invite.expiresAt) : null,
          createdAt: new Date(invite.createdAt)
        })))
      }
    } catch (error) {
      console.error('Error loading invites:', error)
      toast.error('Failed to load invites')
    } finally {
      setLoading(false)
    }
  }

  // Create new invite
  const createInvite = async () => {
    setCreating(true)
    try {
      const response = await fetch(`/api/servers/${serverId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxAge: maxAge === '0' ? null : parseInt(maxAge),
          maxUses: maxUses === '0' ? null : parseInt(maxUses),
          temporary
        })
      })

      if (response.ok) {
        const newInvite = await response.json()
        toast.success('Invite created successfully')
        await loadInvites() // Refresh the list
      } else {
        toast.error('Failed to create invite')
      }
    } catch (error) {
      console.error('Error creating invite:', error)
      toast.error('Failed to create invite')
    } finally {
      setCreating(false)
    }
  }

  // Copy invite link
  const copyInvite = async (code: string) => {
    const inviteUrl = `${window.location.origin}/invite/${code}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(code)
      toast.success('Invite link copied!')
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast.error('Failed to copy invite')
    }
  }

  // Delete invite
  const deleteInvite = async (code: string) => {
    try {
      const response = await fetch(`/api/invites/${code}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Invite deleted')
        await loadInvites() // Refresh the list
      } else {
        toast.error('Failed to delete invite')
      }
    } catch (error) {
      console.error('Error deleting invite:', error)
      toast.error('Failed to delete invite')
    }
  }

  // Load invites when modal opens
  useEffect(() => {
    if (isOpen) {
      loadInvites()
    }
  }, [isOpen])

  const formatExpiryTime = (seconds: string) => {
    const time = parseInt(seconds)
    if (time === 0) return 'Never'
    if (time < 3600) return `${Math.floor(time / 60)} minutes`
    if (time < 86400) return `${Math.floor(time / 3600)} hours`
    return `${Math.floor(time / 86400)} days`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            Invite Friends to {serverName}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Share these invite links with your friends
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Invite */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-white">Create Invite Link</h4>
              <Settings className="w-4 h-4 text-slate-400" />
            </div>

            {/* Invite Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-age" className="text-slate-300">Expires after</Label>
                <Select value={maxAge} onValueChange={setMaxAge}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="1800">30 minutes</SelectItem>
                    <SelectItem value="3600">1 hour</SelectItem>
                    <SelectItem value="21600">6 hours</SelectItem>
                    <SelectItem value="43200">12 hours</SelectItem>
                    <SelectItem value="86400">1 day</SelectItem>
                    <SelectItem value="604800">7 days</SelectItem>
                    <SelectItem value="0">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-uses" className="text-slate-300">Max uses</Label>
                <Select value={maxUses} onValueChange={setMaxUses}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="1">1 use</SelectItem>
                    <SelectItem value="5">5 uses</SelectItem>
                    <SelectItem value="10">10 uses</SelectItem>
                    <SelectItem value="25">25 uses</SelectItem>
                    <SelectItem value="50">50 uses</SelectItem>
                    <SelectItem value="100">100 uses</SelectItem>
                    <SelectItem value="0">No limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="temporary"
                checked={temporary}
                onCheckedChange={setTemporary}
              />
              <Label htmlFor="temporary" className="text-slate-300">
                Grant temporary membership
              </Label>
            </div>

            <Button
              onClick={createInvite}
              disabled={creating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {creating ? 'Creating...' : 'Create Invite Link'}
            </Button>
          </div>

          <Separator className="bg-slate-700" />

          {/* Existing Invites */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Active Invites</h4>
            
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="space-y-2 flex-1">
                      <div className="w-32 h-4 bg-slate-700 rounded animate-pulse" />
                      <div className="w-24 h-3 bg-slate-700 rounded animate-pulse" />
                    </div>
                    <div className="w-16 h-8 bg-slate-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : inviteLinks.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {inviteLinks.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-white truncate">
                        {window.location.origin}/invite/{invite.code}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>
                            {invite.uses}{invite.maxUses ? `/${invite.maxUses}` : ''} uses
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {invite.expiresAt 
                              ? `Expires ${invite.expiresAt.toLocaleDateString()}` 
                              : 'Never expires'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyInvite(invite.code)}
                        className="text-slate-400 hover:text-white"
                      >
                        {copied === invite.code ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteInvite(invite.code)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No active invites</p>
                <p className="text-xs">Create an invite link above</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
