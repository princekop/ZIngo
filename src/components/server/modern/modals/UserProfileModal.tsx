'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  User, 
  Crown, 
  Shield, 
  Calendar, 
  MessageSquare, 
  Phone, 
  UserPlus,
  Ban,
  VolumeX,
  Clock,
  X,
  Sparkles,
  Star,
  Zap,
  Gift,
  Trophy,
  Heart
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useServer } from '../ServerProvider'
import { toast } from 'sonner'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  member: any
}

export function UserProfileModal({ isOpen, onClose, member }: UserProfileModalProps) {
  const { currentUser } = useServer()
  const [loading, setLoading] = useState(false)

  if (!member) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      case 'dnd':
        return 'bg-red-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-400" />
      case 'admin':
        return <Shield className="w-4 h-4 text-red-400" />
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-400" />
      default:
        return null
    }
  }

  const canModerate = currentUser?.role === 'owner' || currentUser?.role === 'admin'
  const canManageMember = canModerate && member.id !== currentUser?.id

  const handleAction = async (action: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/servers/${currentUser?.id}/members/${member.id}/${action}`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success(`Member ${action} successful`)
        onClose()
      } else {
        toast.error(`Failed to ${action} member`)
      }
    } catch (error) {
      console.error(`Error ${action} member:`, error)
      toast.error(`Failed to ${action} member`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 p-0 overflow-hidden">
        {/* Custom Gradient Banner */}
        <div className="relative h-32 bg-gradient-to-r from-[#6C63FF] via-[#8B5CF6] to-[#00D4FF]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </Button>
          
          {(member.isPremium || member.isBooster) && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0 font-bold">
                <Sparkles className="w-3 h-3 mr-1" />
                BYTE MEMBER
              </Badge>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Avatar and Basic Info */}
          <div className="relative -mt-12 mb-4">
            <div className="relative inline-block">
              <Avatar className="w-20 h-20 ring-4 ring-slate-900">
                <AvatarImage src={member.avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-slate-900 ${getStatusColor(member.status)}`} />
            </div>
          </div>

          {/* Name and Role */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">{member.name}</h2>
              {getRoleIcon(member.role)}
            </div>
            <div className="text-slate-400">@{member.username}</div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-400">
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Custom Status */}
          {member.customStatus && (
            <div className="mb-6 p-3 bg-slate-800/50 rounded-lg">
              <div className="text-sm text-slate-400">Status</div>
              <div className="text-white">{member.customStatus}</div>
            </div>
          )}

          {/* Activities */}
          {member.activities && member.activities.length > 0 && (
            <div className="mb-6 space-y-2">
              <div className="text-sm font-medium text-slate-400">Activity</div>
              {member.activities.map((activity: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">{activity.type} {activity.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Member Since */}
          <div className="mb-6 p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center space-x-2 text-slate-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Member Since</span>
            </div>
            <div className="text-white">
              {format(new Date(member.joinedAt), 'MMMM dd, yyyy')}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>

            {canManageMember && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                  <DropdownMenuItem 
                    onClick={() => handleAction('timeout')}
                    disabled={loading}
                    className="text-yellow-400 hover:text-yellow-300 hover:bg-slate-800 cursor-pointer"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Timeout
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleAction('kick')}
                    disabled={loading}
                    className="text-orange-400 hover:text-orange-300 hover:bg-slate-800 cursor-pointer"
                  >
                    <VolumeX className="w-4 h-4 mr-2" />
                    Kick
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-slate-700" />
                  
                  <DropdownMenuItem 
                    onClick={() => handleAction('ban')}
                    disabled={loading}
                    className="text-red-400 hover:text-red-300 hover:bg-slate-800 cursor-pointer"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Ban
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
