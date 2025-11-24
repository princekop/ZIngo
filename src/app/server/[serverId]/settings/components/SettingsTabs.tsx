'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TabType } from '../types'
import { 
  OverviewTab, 
  RolesTab, 
  ChannelsTab, 
  MembersTab, 
  BansTab, 
  ByteeTab 
} from './tabs'

interface SettingsTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  server: any // Replace with proper Server type
  members: any[]
  roles: any[]
  categories: any[]
  bans: any[]
}

export function SettingsTabs({
  activeTab,
  onTabChange,
  server,
  members,
  roles,
  categories,
  bans,
}: SettingsTabsProps) {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={onTabChange as (value: string) => void}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-6 mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="channels">Channels</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="bans">Bans</TabsTrigger>
        <TabsTrigger value="bytee">Bytee</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab server={server} />
      </TabsContent>
      
      <TabsContent value="roles">
        <RolesTab roles={roles} />
      </TabsContent>
      
      <TabsContent value="channels">
        <ChannelsTab categories={categories} />
      </TabsContent>
      
      <TabsContent value="members">
        <MembersTab members={members} />
      </TabsContent>
      
      <TabsContent value="bans">
        <BansTab bans={bans} />
      </TabsContent>
      
      <TabsContent value="bytee">
        <ByteeTab server={server} />
      </TabsContent>
    </Tabs>
  )
}
