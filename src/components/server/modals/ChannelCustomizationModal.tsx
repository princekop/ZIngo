'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Palette, Image, Type, Eye, EyeOff, Lock, Unlock, Hash, Volume2, Settings, Upload, Trash2, RefreshCw, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import StarButton from '@/components/ui/star-button'
import { toast } from 'sonner'

interface ChannelCustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  channel: {
    id: string
    name: string
    type: 'text' | 'voice' | 'announcement'
    description?: string
    isPrivate: boolean
    slowMode?: number
    backgroundColor?: string
    backgroundImage?: string
    backgroundVideo?: string
    textColor?: string
    fontFamily?: string
    fontSize?: number
    customCSS?: string
  }
  userRole: 'owner' | 'admin' | 'member'
  onSave: (channelData: any) => void
}

const FONT_FAMILIES = [
  { value: 'default', label: 'Default (Whitney)' },
  { value: 'mono', label: 'Monospace' },
  { value: 'serif', label: 'Serif' },
  { value: 'comic', label: 'Comic Sans MS' },
  { value: 'impact', label: 'Impact' },
  { value: 'arial', label: 'Arial' },
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'times', label: 'Times New Roman' }
]

const PRESET_THEMES = [
  { name: 'Dark Ocean', bg: 'linear-gradient(135deg, #0c4a6e 0%, #1e293b 100%)', text: '#e2e8f0' },
  { name: 'Sunset', bg: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #facc15 100%)', text: '#ffffff' },
  { name: 'Forest', bg: 'linear-gradient(135deg, #166534 0%, #365314 100%)', text: '#dcfce7' },
  { name: 'Purple Haze', bg: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)', text: '#f3e8ff' },
  { name: 'Cyber', bg: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #10b981 100%)', text: '#ecfeff' },
  { name: 'Rose Gold', bg: 'linear-gradient(135deg, #be185d 0%, #ec4899 50%, #f97316 100%)', text: '#fdf2f8' }
]

export default function ChannelCustomizationModal({ 
  isOpen, 
  onClose, 
  channel, 
  userRole, 
  onSave 
}: ChannelCustomizationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    slowMode: 0,
    backgroundColor: '',
    backgroundImage: '',
    backgroundVideo: '',
    textColor: '#ffffff',
    fontFamily: 'default',
    fontSize: 14,
    customCSS: ''
  })

  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'permissions' | 'advanced'>('general')
  const [backgroundPreview, setBackgroundPreview] = useState('')

  const isOwner = userRole === 'owner'
  const isAdmin = userRole === 'admin' || isOwner

  useEffect(() => {
    if (isOpen && channel) {
      setFormData({
        name: channel.name || '',
        description: channel.description || '',
        isPrivate: channel.isPrivate || false,
        slowMode: channel.slowMode || 0,
        backgroundColor: channel.backgroundColor || '',
        backgroundImage: channel.backgroundImage || '',
        backgroundVideo: (channel as any).backgroundVideo || '',
        textColor: channel.textColor || '#ffffff',
        fontFamily: channel.fontFamily || 'default',
        fontSize: channel.fontSize || 14,
        customCSS: channel.customCSS || ''
      })
      setBackgroundPreview(channel.backgroundImage || channel.backgroundColor || '')
    }
  }, [isOpen, channel])

  const handleSave = () => {
    onSave({
      ...channel,
      ...formData
    })
    toast.success(`${channel.name} updated successfully`)
    onClose()
  }

  const handlePresetTheme = (theme: typeof PRESET_THEMES[0]) => {
    setFormData(prev => ({
      ...prev,
      backgroundColor: theme.bg,
      textColor: theme.text,
      backgroundImage: ''
    }))
    setBackgroundPreview(theme.bg)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFormData(prev => ({
          ...prev,
          backgroundImage: result,
          backgroundColor: ''
        }))
        setBackgroundPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isOpen) return null

  const modal = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/20 bg-black/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {channel.type === 'voice' ? (
              <Volume2 className="h-6 w-6 text-emerald-400" />
            ) : (
              <Hash className="h-6 w-6 text-gray-400" />
            )}
            <div>
              <h2 className="text-xl font-bold text-white">Customize Channel</h2>
              <p className="text-sm text-white/60">#{channel.name}</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-white/10 p-4">
            <div className="space-y-1">
              {(['general', 'appearance', 'permissions', 'advanced'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                    activeTab === tab
                      ? 'bg-teal-500/20 text-teal-200 border border-teal-400/30'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Channel Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="rounded-xl border-white/15 bg-white/5"
                      disabled={!isAdmin}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="rounded-xl border-white/15 bg-white/5 min-h-[100px]"
                      placeholder="What's this channel about?"
                      disabled={!isAdmin}
                    />
                  </div>

                  {isAdmin && (
                    <>
                      <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                          {formData.isPrivate ? (
                            <Lock className="h-5 w-5 text-red-400" />
                          ) : (
                            <Unlock className="h-5 w-5 text-emerald-400" />
                          )}
                          <div>
                            <div className="font-medium text-white">Private Channel</div>
                            <div className="text-sm text-white/60">Only selected members can view this channel</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            formData.isPrivate ? 'bg-red-500' : 'bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            formData.isPrivate ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      {channel.type === 'text' && (
                        <div>
                          <label className="block text-sm font-medium text-white/90 mb-2">Slow Mode</label>
                          <Select 
                            value={formData.slowMode.toString()} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, slowMode: parseInt(value) }))}
                          >
                            <SelectTrigger className="rounded-xl border-white/15 bg-white/5">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Off</SelectItem>
                              <SelectItem value="5">5 seconds</SelectItem>
                              <SelectItem value="10">10 seconds</SelectItem>
                              <SelectItem value="15">15 seconds</SelectItem>
                              <SelectItem value="30">30 seconds</SelectItem>
                              <SelectItem value="60">1 minute</SelectItem>
                              <SelectItem value="120">2 minutes</SelectItem>
                              <SelectItem value="300">5 minutes</SelectItem>
                              <SelectItem value="600">10 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  {/* Preview */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Preview</label>
                    <div 
                      className="h-32 rounded-xl border border-white/20 p-4 flex items-end"
                      style={{
                        background: backgroundPreview.startsWith('data:') || backgroundPreview.startsWith('http') 
                          ? `url(${backgroundPreview})` 
                          : backgroundPreview || 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div 
                        className="text-sm font-medium"
                        style={{ 
                          color: formData.textColor,
                          fontFamily: formData.fontFamily === 'default' ? 'inherit' : formData.fontFamily,
                          fontSize: `${formData.fontSize}px`
                        }}
                      >
                        Sample message text
                      </div>
                    </div>
                  </div>

                  {/* Preset Themes */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Preset Themes</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_THEMES.map((theme) => (
                        <button
                          key={theme.name}
                          onClick={() => handlePresetTheme(theme)}
                          className="h-16 rounded-xl border border-white/20 p-2 hover:border-white/40 transition group"
                          style={{ background: theme.bg }}
                        >
                          <div className="text-xs font-medium text-white group-hover:scale-105 transition">
                            {theme.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">Background Color/Gradient</label>
                      <Input
                        value={formData.backgroundColor}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, backgroundColor: e.target.value, backgroundImage: '' }))
                          setBackgroundPreview(e.target.value)
                        }}
                        className="rounded-xl border-white/15 bg-white/5"
                        placeholder="e.g., #1f2937 or linear-gradient(...)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">Background Image</label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="rounded-xl border-white/15 bg-white/5 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-white/10 file:text-white/90"
                        />
                        {formData.backgroundImage && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, backgroundImage: '' }))
                              setBackgroundPreview(formData.backgroundColor)
                            }}
                            className="rounded-xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-1">GIFs supported via image upload. For video, use the field below.</p>
                    </div>
                  </div>

                  {/* Background Video */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Background Video URL (optional)</label>
                    <Input
                      value={formData.backgroundVideo}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundVideo: e.target.value }))}
                      className="rounded-xl border-white/15 bg-white/5"
                      placeholder="https://... (mp4/webm recommended)"
                    />
                    <p className="text-xs text-white/50 mt-1">Video will loop, autoplay, and be muted. Prefer short MP4/WebM.</p>
                  </div>

                  {/* Text Styling */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">Text Color</label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.textColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-12 h-10 rounded-xl border-white/15 bg-white/5 p-1"
                        />
                        <Input
                          value={formData.textColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                          className="flex-1 rounded-xl border-white/15 bg-white/5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">Font Family</label>
                      <Select 
                        value={formData.fontFamily} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, fontFamily: value }))}
                      >
                        <SelectTrigger className="rounded-xl border-white/15 bg-white/5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_FAMILIES.map(font => (
                            <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">Font Size</label>
                      <Input
                        type="number"
                        min="10"
                        max="24"
                        value={formData.fontSize}
                        onChange={(e) => setFormData(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 14 }))}
                        className="rounded-xl border-white/15 bg-white/5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-white/40 mx-auto mb-4" />
                    <div className="text-white/60 mb-4">Channel permissions are managed separately</div>
                    <StarButton variant="primary" onClick={() => {/* Open permissions modal */}}>
                      <Shield className="mr-2 h-4 w-4" />
                      Manage Permissions
                    </StarButton>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && isOwner && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Custom CSS</label>
                    <Textarea
                      value={formData.customCSS}
                      onChange={(e) => setFormData(prev => ({ ...prev, customCSS: e.target.value }))}
                      className="rounded-xl border-white/15 bg-white/5 font-mono text-sm min-h-[200px]"
                      placeholder="/* Custom CSS for this channel */
.message-content {
  /* Your styles here */
}"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10">
                    <div className="flex items-start gap-3">
                      <Settings className="h-5 w-5 text-amber-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-amber-200 mb-1">Advanced Customization</div>
                        <div className="text-sm text-amber-300/80">
                          Custom CSS allows you to completely customize the appearance of this channel. 
                          Use with caution as invalid CSS may break the channel's appearance.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <StarButton variant="success" onClick={handleSave} disabled={!isAdmin}>
                Save Changes
              </StarButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (typeof window === 'undefined') return null
  return createPortal(modal, document.body)
}
