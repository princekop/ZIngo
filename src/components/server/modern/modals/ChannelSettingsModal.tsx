'use client'

import { useEffect, useState } from 'react'
import { X, Hash, Volume2, Lock, Palette, Type, Image, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { useServer } from '../ServerProvider'

interface ChannelSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  channel: any
}

export function ChannelSettingsModal({ isOpen, onClose, channel }: ChannelSettingsModalProps) {
  const { refreshChannel, refreshCategories, setChannelSlowMode } = useServer()
  const [name, setName] = useState(channel?.name || '')
  const [topic, setTopic] = useState(channel?.topic || '')
  const [isPrivate, setIsPrivate] = useState(channel?.isPrivate || false)
  const [slowMode, setSlowMode] = useState(channel?.slowMode ?? 0)
  const [isSaving, setIsSaving] = useState(false)
  
  // Custom styling states
  const [customBg, setCustomBg] = useState(channel?.customBg || '')
  const [bgOpacity, setBgOpacity] = useState(channel?.bgOpacity ?? 100)
  const [textColor, setTextColor] = useState(channel?.textColor || '#FFFFFF')
  const [accentColor, setAccentColor] = useState(channel?.accentColor || '#6C63FF')
  const [gradientFrom, setGradientFrom] = useState(channel?.gradientFrom || '#6C63FF')
  const [gradientTo, setGradientTo] = useState(channel?.gradientTo || '#8B5CF6')
  const [useGradient, setUseGradient] = useState(channel?.useGradient || false)

  useEffect(() => {
    if (!isOpen || !channel) return

    setName(channel.name || '')
    setTopic(channel.topic || '')
    setIsPrivate(channel.isPrivate || false)
    setSlowMode(channel.slowMode ?? 0)
    setCustomBg(channel.customBg || '')
    setBgOpacity(channel.bgOpacity ?? 100)
    setTextColor(channel.textColor || '#FFFFFF')
    setAccentColor(channel.accentColor || '#6C63FF')
    setGradientFrom(channel.gradientFrom || '#6C63FF')
    setGradientTo(channel.gradientTo || '#8B5CF6')
    setUseGradient(channel.useGradient || false)
  }, [channel, isOpen])

  const handleSave = async () => {
    if (!channel) return

    if (!name.trim()) {
      toast.error('Channel name is required')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/channels/${channel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          topic,
          isPrivate,
          slowMode,
          customBg,
          bgOpacity,
          textColor,
          accentColor,
          gradientFrom,
          gradientTo,
          useGradient
        })
      })

      if (response.ok) {
        toast.success('Channel settings updated!')
        setChannelSlowMode(channel.id, slowMode)
        await Promise.all([
          refreshChannel(channel.id),
          refreshCategories(),
        ])
        onClose()
      } else {
        toast.error('Failed to update channel')
      }
    } catch (error) {
      toast.error('Error updating channel')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#16163A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            {channel?.type === 'voice' ? (
              <Volume2 className="w-6 h-6 text-[#4ADE80]" />
            ) : (
              <Hash className="w-6 h-6 text-[#6C63FF]" />
            )}
            <div>
              <h2 className="text-xl font-bold text-white">Channel Settings</h2>
              <p className="text-sm text-[#C9C9D1]">#{channel?.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-[#C9C9D1] hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/5">
              <TabsTrigger value="general" className="data-[state=active]:bg-[#6C63FF]/20">
                General
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-[#6C63FF]/20">
                Appearance
              </TabsTrigger>
              <TabsTrigger value="permissions" className="data-[state=active]:bg-[#6C63FF]/20">
                Permissions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Basic Settings</CardTitle>
                  <CardDescription className="text-[#C9C9D1]">
                    Configure the basic properties of this channel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Channel Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/10 border-white/10 text-white"
                      placeholder="channel-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-white">Channel Topic</Label>
                    <Textarea
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="bg-white/10 border-white/10 text-white resize-none"
                      placeholder="What's this channel about?"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Private Channel</Label>
                      <p className="text-sm text-[#C9C9D1]">Only selected members can see this channel</p>
                    </div>
                    <Switch
                      checked={isPrivate}
                      onCheckedChange={setIsPrivate}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Slow Mode</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[slowMode]}
                        onValueChange={(value) => setSlowMode(value[0])}
                        max={120}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-sm text-[#C9C9D1]">
                        {slowMode === 0 ? 'Off' : `${slowMode} seconds between messages`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Custom Styling
                  </CardTitle>
                  <CardDescription className="text-[#C9C9D1]">
                    Customize the look and feel of this channel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Background */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      <Label className="text-white">Background Image</Label>
                    </div>
                    <Input
                      value={customBg}
                      onChange={(e) => setCustomBg(e.target.value)}
                      className="bg-white/10 border-white/10 text-white"
                      placeholder="https://example.com/background.jpg"
                    />
                    
                    <div className="space-y-2">
                      <Label className="text-white">Background Opacity</Label>
                      <Slider
                        value={[bgOpacity]}
                        onValueChange={(value) => setBgOpacity(value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-sm text-[#C9C9D1]">{bgOpacity}%</p>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-12 h-10 p-1 bg-white/10 border-white/10"
                        />
                        <Input
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1 bg-white/10 border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-12 h-10 p-1 bg-white/10 border-white/10"
                        />
                        <Input
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="flex-1 bg-white/10 border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gradient */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <Label className="text-white">Use Gradient Background</Label>
                      </div>
                      <Switch
                        checked={useGradient}
                        onCheckedChange={setUseGradient}
                      />
                    </div>

                    {useGradient && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Gradient From</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={gradientFrom}
                              onChange={(e) => setGradientFrom(e.target.value)}
                              className="w-12 h-10 p-1 bg-white/10 border-white/10"
                            />
                            <Input
                              value={gradientFrom}
                              onChange={(e) => setGradientFrom(e.target.value)}
                              className="flex-1 bg-white/10 border-white/10 text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Gradient To</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={gradientTo}
                              onChange={(e) => setGradientTo(e.target.value)}
                              className="w-12 h-10 p-1 bg-white/10 border-white/10"
                            />
                            <Input
                              value={gradientTo}
                              onChange={(e) => setGradientTo(e.target.value)}
                              className="flex-1 bg-white/10 border-white/10 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label className="text-white">Preview</Label>
                    <div 
                      className="p-4 rounded-lg border border-white/10 min-h-[100px]"
                      style={{
                        background: useGradient 
                          ? `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
                          : customBg 
                            ? `url(${customBg})`
                            : 'rgba(255,255,255,0.05)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: textColor,
                        opacity: bgOpacity / 100
                      }}
                    >
                      <p style={{ color: textColor }}>Sample message text</p>
                      <p style={{ color: accentColor }}>Accent colored text</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Channel Permissions
                  </CardTitle>
                  <CardDescription className="text-[#C9C9D1]">
                    Control who can access and interact with this channel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-[#6B6B7A]" />
                    <h3 className="text-lg font-semibold text-white mb-2">Permissions System</h3>
                    <p className="text-[#C9C9D1]">Advanced permission management coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[#C9C9D1] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#6C63FF] hover:bg-[#8B5CF6] text-white disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
