'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Settings,
  Upload,
  Trash2,
  Users,
  Hash,
  Crown,
  Zap,
  Plus,
  Edit,
  Save,
  Palette,
  X,
  Shield
} from 'lucide-react'

type Member = {
  id: string
  name: string
  username: string
  avatar?: string
  role: string
  status: string
  mutedUntil?: string
  timeoutUntil?: string
}

type Role = {
  id: string
  name: string
  color: string
  permissions: string[]
  memberCount: number
}

type Channel = {
  id: string
  name: string
  type: string
  isPrivate: boolean
  backgroundUrl?: string
  backgroundColor?: string
  backgroundType?: string
  font?: string
}

type Category = {
  id: string
  name: string
  channels: Channel[]
}

type BanItem = {
  id: string
  user: {
    id: string
    username: string
    displayName: string
    avatar?: string
  }
  createdAt: string
  expiresAt?: string
  reason?: string
}

type Server = {
  id: string
  name: string
  description?: string
  icon?: string
  banner?: string
  tag?: string
  byteeLevel?: number
  advertisementEnabled?: boolean
  advertisementText?: string
  ownerId: string
}

interface ServerSettingsPageProps {
  params: Promise<{ serverId: string }>
}

function ServerSettingsContent({ serverId }: { serverId: string }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Core state
  const [server, setServer] = useState<Server | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [bans, setBans] = useState<BanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [moderating, setModerating] = useState<string | null>(null)
  
  // Server info state
  const [serverName, setServerName] = useState('')
  const [serverDescription, setServerDescription] = useState('')
  const [serverIcon, setServerIcon] = useState<string | null>(null)
  const [serverBanner, setServerBanner] = useState<string | null>(null)
  const [serverTag, setServerTag] = useState('')
  const [byteeLevel, setByteeLevel] = useState(0)
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Upload states
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'roles', label: 'Roles' },
    { id: 'members', label: 'Members' },
    { id: 'bans', label: 'Bans' },
  ]

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    fetchServerData()
  }, [session, status, router, serverId])

  const fetchServerData = async () => {
    try {
      setLoading(true)
      
      // Fetch server info
      const serverResponse = await fetch(`/api/servers/${serverId}`)
      if (serverResponse.ok) {
        const serverData = await serverResponse.json()
        setServer(serverData)
        setServerName(serverData.name)
        setServerDescription(serverData.description || '')
        setServerIcon(serverData.icon)
        setServerBanner(serverData.banner)
        setServerTag(serverData.tag || '')
        setByteeLevel(serverData.byteeLevel || 0)
      }

      // Fetch members
      const membersResponse = await fetch(`/api/servers/${serverId}/members`)
      if (membersResponse.ok) {
        const membersData = await membersResponse.json()
        setMembers(membersData)
      }

      // Fetch roles
      const rolesResponse = await fetch(`/api/servers/${serverId}/roles`)
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        setRoles(rolesData)
      }

      // Fetch categories
      const categoriesResponse = await fetch(`/api/servers/${serverId}/categories`)
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }

      // Fetch bans
      const bansResponse = await fetch(`/api/servers/${serverId}/bans`)
      if (bansResponse.ok) {
        const bansData = await bansResponse.json()
        setBans(bansData)
      }
    } catch (error) {
      console.error('Error fetching server data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveServer = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/servers/${serverId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serverName,
          description: serverDescription,
          icon: serverIcon,
          banner: serverBanner,
          tag: serverTag,
          byteeLevel
        })
      })

      if (response.ok) {
        setToast({ message: 'Server settings saved!', type: 'success' })
        setTimeout(() => setToast(null), 3000)
      } else {
        setToast({ message: 'Failed to save settings', type: 'error' })
        setTimeout(() => setToast(null), 3000)
      }
    } catch (error) {
      console.error('Error saving server:', error)
      setToast({ message: 'Failed to save settings', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const uploadToBlob = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    
    const data = await response.json()
    return data.url
  }

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file', type: 'error' })
      setTimeout(() => setToast(null), 3000)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'File size must be less than 5MB', type: 'error' })
      setTimeout(() => setToast(null), 3000)
      return
    }

    setUploadingIcon(true)

    try {
      const iconUrl = await uploadToBlob(file)
      setServerIcon(iconUrl)
      setToast({ message: 'Icon uploaded successfully!', type: 'success' })
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      setToast({ message: 'Failed to upload icon', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setUploadingIcon(false)
    }
  }

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file', type: 'error' })
      setTimeout(() => setToast(null), 3000)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: 'File size must be less than 10MB', type: 'error' })
      setTimeout(() => setToast(null), 3000)
      return
    }

    setUploadingBanner(true)

    try {
      const bannerUrl = await uploadToBlob(file)
      setServerBanner(bannerUrl)
      setToast({ message: 'Banner uploaded successfully!', type: 'success' })
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      setToast({ message: 'Failed to upload banner', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleRemoveIcon = () => {
    setServerIcon(null)
    setToast({ message: 'Icon removed', type: 'success' })
    setTimeout(() => setToast(null), 3000)
  }

  const handleRemoveBanner = () => {
    setServerBanner(null)
    setToast({ message: 'Banner removed', type: 'success' })
    setTimeout(() => setToast(null), 3000)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!server) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] flex items-center justify-center">
        <div className="text-white text-xl">Server not found</div>
      </div>
    )
  }

  const isOwner = server.ownerId === (session?.user as any)?.id
  const isAdmin = members.find(m => m.id === (session?.user as any)?.id)?.role === 'admin'
  const isGlobalAdmin = !!(session?.user as any)?.isAdmin

  if (!isOwner && !isAdmin && !isGlobalAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] flex items-center justify-center">
        <div className="text-white text-xl">Access denied</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] text-white">
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md border shadow-lg transition-opacity ${
            toast.type === 'success'
              ? 'bg-[#4ADE80]/20 border-[#4ADE80]/40 text-[#4ADE80]'
              : 'bg-[#FF3B6E]/20 border-[#FF3B6E]/40 text-[#FF3B6E]'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Settings className="h-6 w-6" />
                <h1 className="text-2xl font-bold tracking-tight">Server Settings</h1>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => router.push(`/dash/${(session?.user as any)?.id}`)}
                variant="outline"
                className="border-white/20 text-[#C9C9D1] hover:bg-white/10"
              >
                View Server List
              </Button>
              <Button
                onClick={handleSaveServer}
                disabled={saving}
                className="bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#6C63FF]"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 p-1 mb-8">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="data-[state=active]:bg-[#6C63FF] data-[state=active]:text-white text-[#C9C9D1]"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[#C9C9D1] text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={serverDescription}
                    onChange={(e) => setServerDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 resize-none focus:border-[#6C63FF]/40 outline-none"
                    placeholder="Describe your server..."
                  />
                </div>

                <div>
                  <label className="block text-[#C9C9D1] text-sm font-medium mb-2">
                    Server Tag
                  </label>
                  <Input
                    type="text"
                    value={serverTag}
                    onChange={(e) => setServerTag(e.target.value)}
                    className="bg-white/10 border-white/20 text-white focus:border-[#6C63FF]/40"
                    placeholder="e.g., DISCORD"
                    maxLength={5}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[#C9C9D1] text-sm font-medium mb-2">
                    Server Icon
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] rounded-xl flex items-center justify-center border border-white/20">
                      {serverIcon ? (
                        <img
                          src={serverIcon}
                          alt="Server Icon"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {serverName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconUpload}
                        className="hidden"
                        disabled={uploadingIcon}
                        id="icon-upload"
                      />
                      <Button 
                        size="sm" 
                        className="bg-[#6C63FF] hover:bg-[#8B5CF6]"
                        disabled={uploadingIcon}
                        onClick={() => document.getElementById('icon-upload')?.click()}
                      >
                        {uploadingIcon ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </>
                        )}
                      </Button>
                      {serverIcon && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleRemoveIcon}
                          disabled={uploadingIcon}
                          className="bg-[#FF3B6E] hover:bg-[#FF3B6E]/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[#C9C9D1] text-sm font-medium mb-2">
                    Server Banner
                  </label>
                  <div className="space-y-2">
                    <div className="h-24 bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] rounded-lg overflow-hidden">
                      {serverBanner && (
                        <img
                          src={serverBanner}
                          alt="Server Banner"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                        disabled={uploadingBanner}
                        id="banner-upload"
                      />
                      <Button 
                        size="sm" 
                        className="bg-[#6C63FF] hover:bg-[#8B5CF6]"
                        disabled={uploadingBanner}
                        onClick={() => document.getElementById('banner-upload')?.click()}
                      >
                        {uploadingBanner ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </>
                        )}
                      </Button>
                      {serverBanner && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleRemoveBanner}
                          disabled={uploadingBanner}
                          className="bg-[#FF3B6E] hover:bg-[#FF3B6E]/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Server Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-[#6C63FF]" />
                  <div>
                    <p className="text-2xl font-bold">{members.length}</p>
                    <p className="text-[#C9C9D1] text-sm">Members</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-3">
                  <Hash className="h-8 w-8 text-[#00D4FF]" />
                  <div>
                    <p className="text-2xl font-bold">
                      {categories.reduce((acc, cat) => acc + cat.channels.length, 0)}
                    </p>
                    <p className="text-[#C9C9D1] text-sm">Channels</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-3">
                  <Crown className="h-8 w-8 text-[#FFB020]" />
                  <div>
                    <p className="text-2xl font-bold">{categories.length}</p>
                    <p className="text-[#C9C9D1] text-sm">Categories</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-3">
                  <Zap className="h-8 w-8 text-[#4ADE80]" />
                  <div>
                    <p className="text-2xl font-bold">{byteeLevel}</p>
                    <p className="text-[#C9C9D1] text-sm">Boost Level</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Server Roles</h2>
                <Button className="bg-[#6C63FF] hover:bg-[#8B5CF6]">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </div>

              <div className="space-y-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <div>
                        <h3 className="font-medium">{role.name}</h3>
                        <p className="text-[#C9C9D1] text-sm">{role.memberCount} members</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-white/20 text-[#C9C9D1] hover:bg-white/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" className="bg-[#FF3B6E] hover:bg-[#FF3B6E]/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-6">Server Members</h2>
              
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] rounded-full flex items-center justify-center">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-white font-semibold text-sm">
                              {member.username.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#16163A] ${
                          member.status === 'online' ? 'bg-[#4ADE80]' :
                          member.status === 'idle' ? 'bg-[#FFB020]' :
                          member.status === 'dnd' ? 'bg-[#FF3B6E]' :
                          'bg-[#6B6B7A]'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-[#C9C9D1] text-sm">@{member.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.role === 'owner' && <Crown className="h-4 w-4 text-[#FFB020]" />}
                      {member.role === 'admin' && <Shield className="h-4 w-4 text-[#6C63FF]" />}
                      <span className="text-[#C9C9D1] text-sm capitalize">{member.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bans" className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Banned Users</h2>
              </div>
              {bans.length === 0 ? (
                <div className="text-[#C9C9D1]">No bans.</div>
              ) : (
                <div className="space-y-3">
                  {bans.map((ban) => (
                    <div key={ban.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#6B6B7A]">
                          {ban.user.avatar ? (
                            <img
                              src={ban.user.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-white/70">
                              {ban.user.displayName?.charAt(0) || ban.user.username?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{ban.user.displayName || ban.user.username}</div>
                          <div className="text-xs text-[#C9C9D1]">
                            Banned {new Date(ban.createdAt).toLocaleString()}
                            {ban.reason ? ` • ${ban.reason}` : ''}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Button size="sm" variant="outline" className="border-white/20 text-[#C9C9D1] hover:bg-white/10">
                          Unban
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ServerSettingsPage({ params }: ServerSettingsPageProps) {
  const { serverId } = use(params)
  return <ServerSettingsContent serverId={serverId} />
}
