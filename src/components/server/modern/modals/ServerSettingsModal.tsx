'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  Users, 
  Shield, 
  Hash, 
  Zap,
  Palette,
  Bell,
  Lock,
  Crown,
  ExternalLink
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useServer } from '../ServerProvider'

interface ServerSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const settingsCategories = [
  {
    id: 'overview',
    name: 'Overview',
    icon: Settings,
    description: 'Basic server information and settings'
  },
  {
    id: 'roles',
    name: 'Roles & Permissions',
    icon: Shield,
    description: 'Manage server roles and permissions'
  },
  {
    id: 'channels',
    name: 'Channels & Categories',
    icon: Hash,
    description: 'Organize your server channels'
  },
  {
    id: 'members',
    name: 'Members',
    icon: Users,
    description: 'Manage server members'
  },
  {
    id: 'moderation',
    name: 'Moderation',
    icon: Lock,
    description: 'Safety and moderation tools'
  },
  {
    id: 'boosts',
    name: 'Server Boosts',
    icon: Zap,
    description: 'Boost perks and benefits'
  }
]

export function ServerSettingsModal({ isOpen, onClose }: ServerSettingsModalProps) {
  const router = useRouter()
  const { server } = useServer()
  const [activeTab, setActiveTab] = useState('overview')

  const handleOpenFullSettings = () => {
    router.push(`/server/${server?.id}/settings`)
    onClose()
  }

  const handleOpenBoosts = () => {
    router.push(`/server/${server?.id}/boosts`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] bg-slate-900 border-slate-700 p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Server Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Settings Categories */}
          <div className="w-64 border-r border-slate-800 p-4">
            <div className="space-y-1">
              {settingsCategories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === category.id
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium">{category.name}</div>
                    </div>
                  </button>
                )
              })}

              <div className="pt-4 mt-4 border-t border-slate-800">
                <Button
                  onClick={handleOpenFullSettings}
                  variant="outline"
                  className="w-full justify-start text-slate-400 border-slate-700 hover:bg-slate-800"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Full Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Server Overview</h3>
                  <p className="text-slate-400 mb-4">
                    Basic information about your server
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {server?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{server?.name}</h4>
                          <p className="text-slate-400">Server ID: {server?.id}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                      <p className="text-slate-500">Detailed server settings coming soon...</p>
                      <Button
                        onClick={handleOpenFullSettings}
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                      >
                        Open Full Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="boosts" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Server Boosts</h3>
                  <p className="text-slate-400 mb-4">
                    Boost your server to unlock premium features
                  </p>
                  
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-500">Server boost management coming soon...</p>
                    <Button
                      onClick={handleOpenBoosts}
                      className="mt-4 bg-purple-600 hover:bg-purple-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Open Boost Panel
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Other tabs */}
              {settingsCategories.filter(c => c.id !== 'overview' && c.id !== 'boosts').map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
                    <p className="text-slate-400 mb-4">{category.description}</p>
                    
                    <div className="text-center py-8">
                      <category.icon className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                      <p className="text-slate-500">This feature is coming soon...</p>
                      <Button
                        onClick={handleOpenFullSettings}
                        variant="outline"
                        className="mt-4 border-slate-700 text-slate-400 hover:bg-slate-800"
                      >
                        Open Full Settings
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
