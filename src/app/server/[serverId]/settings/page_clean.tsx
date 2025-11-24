'use client'

import { use } from 'react'
import { ServerSettingsContent } from './components/ServerSettingsContent'

interface ServerSettingsPageProps {
  params: Promise<{ serverId: string }>
}

export default function ServerSettingsPage({ params }: ServerSettingsPageProps) {
  const resolvedParams = use(params)
  return <ServerSettingsContent serverId={resolvedParams.serverId} />
}
