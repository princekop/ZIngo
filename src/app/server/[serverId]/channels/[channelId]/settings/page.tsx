'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Hash, Volume2, Trash2, Save, ArrowLeft, Shield, Users, Lock, Globe } from 'lucide-react'
import { serverAPI } from '../../../lib/api-service'
import { Role } from '../../../types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ChannelSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const serverId = params.serverId as string
  const channelId = params.channelId as string

  // Fetch Channel Data
  const { data: channel, error: channelError, mutate: mutateChannel } = useSWR(
    channelId ? `/api/channels/${channelId}` : null,
    fetcher
  )

  // Fetch Roles for Permissions Tab
  const { data: roles } = useSWR<Role[]>(
    serverId ? `/api/servers/${serverId}/roles` : null,
    fetcher
  )

  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [slowmode, setSlowmode] = useState(0)
  const [nsfw, setNsfw] = useState(false)

  const [activeTab, setActiveTab] = useState('overview')
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize state when channel data loads
  useEffect(() => {
    if (channel) {
      setName(channel.name || '')
      setTopic(channel.description || '')
      setSlowmode(channel.slowmode || 0)
      setNsfw(channel.nsfw || false)
    }
  }, [channel])

  const handleSave = async () => {
    setSaving(true)
    try {
      await serverAPI.updateChannel(channelId, {
        name,
        description: topic,
        slowmode,
        nsfw
      })
      await mutateChannel() // Refresh local data
      setHasChanges(false)
      // Show success toast here if toast component exists
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this channel? This cannot be undone.')) {
      try {
        await serverAPI.deleteChannel(channelId)
        router.push(`/server/${serverId}`)
      } catch (error) {
        console.error('Failed to delete:', error)
      }
    }
  }

  if (!channel && !channelError) {
    return (
      <div className="h-screen bg-[#313338] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#313338] text-slate-200 font-sans">
      {/* Sidebar */}
      <div className="w-60 bg-[#2b2d31] flex flex-col">
        <div className="p-4 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-2">
          {channel?.type === 'voice' ? <Volume2 className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
          {channel?.name}
        </div>

        <div className="flex-1 px-2 space-y-0.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-2.5 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-[#404249] text-white' : 'text-slate-400 hover:bg-[#35373c] hover:text-slate-200'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`w-full text-left px-2.5 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'permissions' ? 'bg-[#404249] text-white' : 'text-slate-400 hover:bg-[#35373c] hover:text-slate-200'
              }`}
          >
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('invites')}
            className={`w-full text-left px-2.5 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'invites' ? 'bg-[#404249] text-white' : 'text-slate-400 hover:bg-[#35373c] hover:text-slate-200'
              }`}
          >
            Invites
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`w-full text-left px-2.5 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'integrations' ? 'bg-[#404249] text-white' : 'text-slate-400 hover:bg-[#35373c] hover:text-slate-200'
              }`}
          >
            Integrations
          </button>

          <div className="my-2 border-t border-[#1e1f22]/50 mx-2"></div>

          <button
            onClick={handleDelete}
            className="w-full text-left px-2.5 py-1.5 rounded text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-between group"
          >
            Delete Channel
            <Trash2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#313338]">
        <div className="flex-1 overflow-y-auto p-10 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'permissions' && 'Permissions'}
              {activeTab === 'invites' && 'Invites'}
              {activeTab === 'integrations' && 'Integrations'}
            </h2>
            <button
              onClick={() => router.push(`/server/${serverId}`)}
              className="p-2 rounded-full border border-slate-500 text-slate-400 hover:text-white hover:border-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Channel Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setHasChanges(true)
                  }}
                  className="w-full bg-[#1e1f22] border-none rounded p-2.5 text-white focus:ring-2 focus:ring-cyan-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Channel Topic</label>
                <textarea
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value)
                    setHasChanges(true)
                  }}
                  rows={4}
                  className="w-full bg-[#1e1f22] border-none rounded p-2.5 text-white focus:ring-2 focus:ring-cyan-400 transition-all resize-none"
                  placeholder="Let everyone know how to use this channel!"
                />
              </div>

              <div className="border-t border-[#3f4147] my-6"></div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Slowmode</label>
                <div className="bg-[#1e1f22] rounded p-4">
                  <input
                    type="range"
                    min="0"
                    max="21600"
                    step="5"
                    value={slowmode}
                    onChange={(e) => {
                      setSlowmode(parseInt(e.target.value))
                      setHasChanges(true)
                    }}
                    className="w-full accent-cyan-400"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>Off</span>
                    <span>5s</span>
                    <span>10s</span>
                    <span>30s</span>
                    <span>1m</span>
                    <span>5m</span>
                    <span>10m</span>
                    <span>15m</span>
                    <span>30m</span>
                    <span>1h</span>
                    <span>2h</span>
                    <span>6h</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Members will be restricted to sending one message and creating one thread per this interval, unless they have Manage Channel or Manage Messages permissions.
                </p>
              </div>

              <div className="border-t border-[#3f4147] my-6"></div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Age-Restricted Channel</h3>
                  <p className="text-sm text-slate-400">Users will need to confirm they are of over legal age to view the content in this channel.</p>
                </div>
                <button
                  onClick={() => {
                    setNsfw(!nsfw)
                    setHasChanges(true)
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative ${nsfw ? 'bg-green-500' : 'bg-slate-500'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${nsfw ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="bg-[#1e1f22] rounded p-4 flex items-center gap-4">
                <div className="p-3 bg-[#313338] rounded-full">
                  <Shield className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Advanced Permissions</h3>
                  <p className="text-sm text-slate-400">
                    Sync permissions with category or set custom overrides for specific roles and members.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase">Roles/Members</h3>
                  <button className="text-xs text-cyan-400 hover:underline">+ Add Role/Member</button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 rounded bg-[#404249] cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-300" />
                      <span className="text-sm font-medium text-white">@everyone</span>
                    </div>
                  </div>
                  {/* Real roles from DB */}
                  {roles?.map(role => (
                    <div key={role.id} className="flex items-center justify-between p-2 rounded hover:bg-[#35373c] cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></div>
                        <span className="text-sm font-medium text-slate-300">{role.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invites' && (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-[#1e1f22] rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Active Invites</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                There are no active invites for this channel. Create one to invite friends!
              </p>
              <button className="mt-6 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium transition-colors">
                Create Invite
              </button>
            </div>
          )}
        </div>

        {/* Save Bar */}
        {hasChanges && (
          <div className="p-4 bg-[#111214] flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300">
            <p className="text-white font-medium">Careful — you have unsaved changes!</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setHasChanges(false)
                  // Reset values
                  if (channel) {
                    setName(channel.name)
                    setTopic(channel.description || '')
                    setSlowmode(channel.slowmode || 0)
                    setNsfw(channel.nsfw || false)
                  }
                }}
                className="px-4 py-2 text-white hover:underline"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
