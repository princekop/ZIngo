'use client'

import { useState, useEffect } from 'react'
import { Hash, Volume2, Megaphone, MessageSquare, Lock, Save } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { useServer } from '../ServerProvider'
import { toast } from 'sonner'

interface EditChannelModalProps {
  isOpen: boolean
  onClose: () => void
  channel: any
}

export function EditChannelModal({ isOpen, onClose, channel }: EditChannelModalProps) {
  const { server, refreshCategories } = useServer()
  const [channelName, setChannelName] = useState('')
  const [channelTopic, setChannelTopic] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [saving, setSaving] = useState(false)

  // Initialize form when channel changes
  useEffect(() => {
    if (channel) {
      setChannelName(channel.name || '')
      setChannelTopic(channel.topic || '')
      setIsPrivate(channel.isPrivate || false)
    }
  }, [channel])

  const handleSave = async () => {
    if (!channelName.trim()) {
      toast.error('Channel name is required')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/channels/${channel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: channelName.toLowerCase().replace(/\s+/g, '-'),
          topic: channelTopic,
          isPrivate
        })
      })

      if (response.ok) {
        toast.success('Channel updated successfully')
        await refreshCategories()
        onClose()
      } else {
        toast.error('Failed to update channel')
      }
    } catch (error) {
      console.error('Error updating channel:', error)
      toast.error('Failed to update channel')
    } finally {
      setSaving(false)
    }
  }

  const getChannelIcon = () => {
    switch (channel?.type) {
      case 'voice':
        return Volume2
      case 'announcement':
        return Megaphone
      case 'forum':
        return MessageSquare
      default:
        return Hash
    }
  }

  const Icon = getChannelIcon()

  if (!channel) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Icon className="w-5 h-5 text-blue-400" />
            Edit Channel
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Update channel settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Channel Type Display */}
          <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700">
            <div className="flex items-center space-x-3">
              <Icon className="w-5 h-5 text-slate-400" />
              <div>
                <div className="font-medium text-white capitalize">{channel.type} Channel</div>
                <div className="text-sm text-slate-400">Channel type cannot be changed</div>
              </div>
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
                placeholder="channel-name"
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                maxLength={100}
              />
            </div>
            <div className="text-xs text-slate-500">
              {channelName.length}/100
            </div>
          </div>

          {/* Channel Topic */}
          {channel.type !== 'voice' && (
            <div className="space-y-2">
              <Label htmlFor="channel-topic" className="text-slate-300">Channel Topic</Label>
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
                {channelName || 'channel-name'}
              </span>
            </div>
            {channelTopic && channel.type !== 'voice' && (
              <div className="mt-2 text-sm text-slate-400">
                {channelTopic}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !channelName.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
