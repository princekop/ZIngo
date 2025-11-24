import { useState } from 'react'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { Server, Category, Member, Message } from '../types'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('API Error')
  return res.json()
})

export function useServerData(serverId: string, selectedChannelId?: string) {
  const { data: session } = useSession()

  // Fetch Server Details
  const { data: server, error: serverError } = useSWR<Server>(
    serverId ? `/api/servers/${serverId}` : null,
    fetcher
  )

  // Fetch Categories & Channels
  const { data: categories, error: categoriesError } = useSWR<Category[]>(
    serverId ? `/api/servers/${serverId}/categories` : null,
    fetcher
  )

  // Fetch Members
  const { data: members, error: membersError } = useSWR<Member[]>(
    serverId ? `/api/servers/${serverId}/members` : null,
    fetcher
  )

  // Fetch Messages (Real-time polling)
  const { data: messages, mutate: mutateMessages } = useSWR<Message[]>(
    selectedChannelId ? `/api/channels/${selectedChannelId}/messages` : null,
    fetcher,
    {
      refreshInterval: 2000, // Poll every 2 seconds for real-time feel
      revalidateOnFocus: true
    }
  )

  // Derived state
  const loading = !server && !serverError
  const error = serverError || categoriesError || membersError ? 'Failed to load server data' : null

  return {
    server: server || null,
    categories: categories || [],
    members: members || [],
    messages: messages || [],
    loading,
    error,
    mutateMessages
  }
}
