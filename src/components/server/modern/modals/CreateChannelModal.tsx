'use client'

import { useState } from 'react'
import { Hash, Volume2, Megaphone, MessageSquare, Lock } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useServer } from '../ServerProvider'
import { toast } from 'sonner'

interface CreateChannelModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
}

const channelTypes = [
  {
    id: 'text',
    name: 'Text Channel',
    description: 'Send messages, images, GIFs, emoji, opinions, and puns',
    icon: Hash
  },
  {
    id: 'voice',
    name: 'Voice Channel', 
    description: 'Hang out together with voice, video, and screen share',
    icon: Volume2
  },
  {
    id: 'announcement',
    name: 'Announcement Channel',
    description: 'Important updates for your community',
    icon: Megaphone
  },
  {
    id: 'forum',
    name: 'Forum Channel',
    description: 'Organized discussions with posts and threads',
    icon: MessageSquare
  }
]

export function CreateChannelModal({ isOpen, onClose, categoryId }: CreateChannelModalProps) {
  const { server, refreshCategories } = useServer()
  const [channelName, setChannelName] = useState('')
  const [channelType, setChannelType] = useState('text')
  const [channelTopic, setChannelTopic] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!channelName.trim()) {
      toast.error('Channel name is required')
      return
    }

    setCreating(true)
    try {
      const response = await fetch(`/api/servers/${server?.id}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: channelName.toLowerCase().replace(/\s+/g, '-'),
          type: channelType,
          topic: channelTopic,
          isPrivate,
          categoryId: categoryId || null
        })
      })

      if (response.ok) {
        toast.success('Channel created successfully')
        await refreshCategories()
        handleClose()
      } else {
        toast.error('Failed to create channel')
      }
    } catch (error) {
      console.error('Error creating channel:', error)
      toast.error('Failed to create channel')
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    setChannelName('')
    setChannelType('text')
    setChannelTopic('')
    setIsPrivate(false)
    onClose()
  }

  const selectedType = channelTypes.find(t => t.id === channelType)
  const Icon = selectedType?.icon || Hash

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Icon className="w-5 h-5 text-blue-400" />
            Create Channel
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Add a new channel to your server
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Channel Type Selection */}
          <div className="space-y-3">
            <Label className="text-slate-300">Channel Type</Label>
            <div className="grid gap-2">
              {channelTypes.map((type) => {
                const TypeIcon = type.icon
                return (
                  <div
                    key={type.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      channelType === type.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    }`}
                    onClick={() => setChannelType(type.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <TypeIcon className="w-5 h-5 text-slate-400" />
                      <div className="flex-1">
                        <div className="font-medium text-white">{type.name}</div>
                        <div className="text-sm text-slate-400">{type.description}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        channelType === type.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-400'
                      }`}>
                        {channelType === type.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="channel-name" className="text-slate-300">Channel Name</Label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="channel-name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="new-channel"
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                maxLength={100}
              />
            </div>
            <div className="text-xs text-slate-500">
              {channelName.length}/100
            </div>
          </div>

          {/* Channel Topic */}
          {channelType !== 'voice' && (
            <div className="space-y-2">
              <Label htmlFor="channel-topic" className="text-slate-300">Channel Topic (Optional)</Label>
              <Textarea
                id="channel-topic"
                value={channelTopic}
                onChange={(e) => setChannelTopic(e.target.value)}
                placeholder="What's this channel about?"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                rows={3}
                maxLength={1024}
              />
              <div className="text-xs text-slate-500">
                {channelTopic.length}/1024
              </div>
            </div>
          )}

          {/* Private Channel */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-slate-400" />
              <div>
                <div className="font-medium text-white">Private Channel</div>
                <div className="text-sm text-slate-400">Only selected members can view this channel</div>
              </div>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          {/* Preview */}
          <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700">
            <div className="text-sm font-medium text-slate-300 mb-2">Preview:</div>
            <div className="flex items-center space-x-2">
              <Icon className="w-4 h-4 text-slate-400" />
              {isPrivate && <Lock className="w-3 h-3 text-slate-500" />}
              <span className="text-slate-300">
                {channelName || 'new-channel'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !channelName.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {creating ? 'Creating...' : 'Create Channel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
