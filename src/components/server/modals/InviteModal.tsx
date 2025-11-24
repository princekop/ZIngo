'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Users, Clock, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ShinyButton from '@/components/ui/shiny-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  serverId: string
  serverName: string
}

export default function InviteModal({ isOpen, onClose, serverId, serverName }: InviteModalProps) {
  const [inviteUrl, setInviteUrl] = useState('')
  const [expiresAfter, setExpiresAfter] = useState('7d')
  const [maxUses, setMaxUses] = useState('0')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen && !inviteUrl) {
      generateInvite()
    }
  }, [isOpen])

  const toSeconds = (v: string): number | null => {
    switch (v) {
      case '30m': return 30 * 60
      case '1h': return 60 * 60
      case '6h': return 6 * 60 * 60
      case '12h': return 12 * 60 * 60
      case '1d': return 24 * 60 * 60
      case '7d': return 7 * 24 * 60 * 60
      case 'never': return null
      default: return 24 * 60 * 60
    }
  }

  const generateInvite = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId,
          expiresIn: toSeconds(expiresAfter),
          maxUses: maxUses === '0' ? null : parseInt(maxUses)
        })
      })

      if (response.ok) {
        const data = await response.json()
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        setInviteUrl(`${origin}/invite/${data.code}`)
      } else {
        toast.error('Failed to generate invite')
      }
    } catch (error) {
      toast.error('Failed to generate invite')
    } finally {
      setLoading(false)
    }
  }

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success('Invite copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy invite')
    }
  }

  const handleSettingsChange = () => {
    setInviteUrl('')
    generateInvite()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-black/90 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Invite Friends</h2>
            <p className="text-sm text-white/60">to {serverName}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Invite Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">Invite Link</label>
            <div className="flex gap-2">
              <Input
                value={inviteUrl}
                readOnly
                className="rounded-xl border-white/15 bg-white/5 font-mono text-sm"
                placeholder={loading ? 'Generating...' : 'Invite link will appear here'}
              />
              <ShinyButton size="sm" onClick={copyInvite} disabled={!inviteUrl || loading}>
                {copied ? 'Copied!' : <Copy className="h-4 w-4" />}
              </ShinyButton>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/90">Invite Settings</h3>
            
            {/* Expires After */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Expires After
              </label>
              <Select value={expiresAfter} onValueChange={(value) => {
                setExpiresAfter(value)
                handleSettingsChange()
              }}>
                <SelectTrigger className="rounded-xl border-white/15 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30m">30 minutes</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="6h">6 hours</SelectItem>
                  <SelectItem value="12h">12 hours</SelectItem>
                  <SelectItem value="1d">1 day</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Uses */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Max Number of Uses
              </label>
              <Select value={maxUses} onValueChange={(value) => {
                setMaxUses(value)
                handleSettingsChange()
              }}>
                <SelectTrigger className="rounded-xl border-white/15 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No limit</SelectItem>
                  <SelectItem value="1">1 use</SelectItem>
                  <SelectItem value="5">5 uses</SelectItem>
                  <SelectItem value="10">10 uses</SelectItem>
                  <SelectItem value="25">25 uses</SelectItem>
                  <SelectItem value="50">50 uses</SelectItem>
                  <SelectItem value="100">100 uses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <ShinyButton
              size="sm"
              onClick={() => {
                // Share via system share if available
                if (navigator.share) {
                  navigator.share({
                    title: `Join ${serverName}`,
                    url: inviteUrl
                  })
                }
              }}
            >
              Share
            </ShinyButton>
            <ShinyButton
              size="sm"
              onClick={() => {
                setInviteUrl('')
                generateInvite()
              }}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'New Link'}
            </ShinyButton>
          </div>
        </div>
      </div>
    </div>
  )
}
