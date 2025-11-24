'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, Users, Shield, Bell, Palette, Trash2, Save } from 'lucide-react'

interface ServerSettingsProps {
  serverId: string
  serverName: string
  serverIcon?: string
  onUpdate?: (data: any) => void
}

export function ServerSettings({
  serverId,
  serverName,
  serverIcon,
  onUpdate,
}: ServerSettingsProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    name: serverName,
    description: '',
    icon: serverIcon,
    defaultRole: 'member',
    verificationLevel: 'low',
    contentFilter: 'medium',
    notifications: true,
    allowInvites: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [serverId])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}/settings`)
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/servers/${serverId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        onUpdate?.(settings)
        alert('Settings saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-900/50 border border-gray-800/50 p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="members" className="rounded-lg">
            <Users className="w-4 h-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="roles" className="rounded-lg">
            <Shield className="w-4 h-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Server Information</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Server Name
              </label>
              <Input
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="bg-gray-900/50 border-gray-800/50 text-white rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                maxLength={500}
                className="w-full h-24 bg-gray-900/50 border border-gray-800/50 rounded-xl text-white placeholder:text-gray-600 p-3 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                placeholder="Describe your server..."
              />
              <p className="text-xs text-gray-500 mt-1">{settings.description.length}/500</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Default Role
              </label>
              <select
                value={settings.defaultRole}
                onChange={(e) => setSettings({ ...settings, defaultRole: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-800/50 rounded-xl text-white p-3 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="member">Member</option>
                <option value="moderator">Moderator</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Verification Level
              </label>
              <select
                value={settings.verificationLevel}
                onChange={(e) => setSettings({ ...settings, verificationLevel: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-800/50 rounded-xl text-white p-3 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="very_high">Very High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Content Filter
              </label>
              <select
                value={settings.contentFilter}
                onChange={(e) => setSettings({ ...settings, contentFilter: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-800/50 rounded-xl text-white p-3 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="disabled">Disabled</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6 mt-6">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Members</h3>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Member management coming soon...</p>
            </div>
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6 mt-6">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Roles</h3>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Role management coming soon...</p>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Notification Settings</h3>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Enable Notifications</p>
                <p className="text-gray-400 text-sm">Get notified of server activity</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Allow Invites</p>
                <p className="text-gray-400 text-sm">Allow members to invite others</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowInvites}
                onChange={(e) => setSettings({ ...settings, allowInvites: e.target.checked })}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Theme customization coming soon...</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
