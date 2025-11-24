'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Server, Member, Role, Category, BanItem, TabType } from '../types'
import { SettingsTabs } from './SettingsTabs'
import { ArrowLeft } from 'lucide-react'
import { serverAPI } from '../../lib/api-service'

interface ServerSettingsContentProps {
  serverId: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ServerSettingsContent({ serverId }: ServerSettingsContentProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Fetch all required data using SWR
  const { data: server, error: serverError, mutate: mutateServer } = useSWR<Server>(
    `/api/servers/${serverId}`,
    fetcher
  )

  const { data: members, mutate: mutateMembers } = useSWR<Member[]>(
    `/api/servers/${serverId}/members`,
    fetcher
  )

  const { data: roles, mutate: mutateRoles } = useSWR<Role[]>(
    `/api/servers/${serverId}/roles`,
    fetcher
  )

  const { data: categories, mutate: mutateCategories } = useSWR<Category[]>(
    `/api/servers/${serverId}/categories`,
    fetcher
  )

  const { data: bans, mutate: mutateBans } = useSWR<BanItem[]>(
    `/api/servers/${serverId}/bans`,
    fetcher
  )

  const loading = !server && !serverError

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (serverError || !server) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-center p-8">
        <h2 className="text-2xl font-bold mb-2 text-white">Server not found</h2>
        <p className="text-gray-400 mb-4">The server you're looking for doesn't exist or you don't have permission to view it.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.push(`/server/${serverId}`)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Server Settings</h1>
            <p className="text-sm text-slate-400">Manage settings for {server.name}</p>
          </div>
        </div>

        <SettingsTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          server={server}
          members={members || []}
          roles={roles || []}
          categories={categories || []}
          bans={bans || []}
        />
      </div>
    </div>
  )
}
