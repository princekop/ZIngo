import React, { useState } from 'react'
import { 
  Hash, 
  Volume2, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Settings,
  Lock,
  Bell,
  Star,
  Zap
} from 'lucide-react'
import { Category, Channel } from '../types'

interface ChannelSidebarProps {
  categories: Category[]
  selectedChannel: string
  onChannelSelect: (channel: Channel) => void
  onCategoryCollapse?: (categoryId: string) => void
  onChannelCreate?: (categoryId: string) => void
  onCategoryCreate?: () => void
  onChannelSettings?: (channelId: string) => void
  onCategorySettings?: (categoryId: string) => void
  isCollapsed?: boolean
}

export default function ChannelSidebar({
  categories,
  selectedChannel,
  onChannelSelect,
  onCategoryCollapse,
  onChannelCreate,
  onCategoryCreate,
  onChannelSettings,
  onCategorySettings,
  isCollapsed = false
}: ChannelSidebarProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
    onCategoryCollapse?.(categoryId)
  }

  const getChannelIcon = (channel: Channel) => {
    switch (channel.type) {
      case 'voice':
        return <Volume2 className="w-4 h-4 text-slate-400" />
      case 'announcement':
        return <Bell className="w-4 h-4 text-yellow-400" />
      default:
        return <Hash className="w-4 h-4 text-slate-400" />
    }
  }

  const getChannelBadges = (channel: Channel) => {
    const badges = []
    
    if (channel.locked) badges.push(<Lock key="lock" className="w-3 h-3 text-slate-500" />)
    if (channel.premium) badges.push(<Zap key="premium" className="w-3 h-3 text-yellow-400" />)
    if (channel.trending) badges.push(<Star key="trending" className="w-3 h-3 text-orange-400" />)
    
    return badges
  }

  if (isCollapsed) {
    return (
      <div className="w-16 space-y-2 p-2">
        {categories.flatMap(category => 
          category.channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel)}
              className={`w-full h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                selectedChannel === channel.id
                  ? 'bg-slate-700 bg-opacity-60 text-white'
                  : 'text-slate-400 hover:bg-slate-700 hover:bg-opacity-40 hover:text-white'
              }`}
              title={`#${channel.name}`}
            >
              {getChannelIcon(channel)}
            </button>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-thumb-opacity-30 scrollbar-track-transparent">
      <div className="p-3 space-y-4">
        {/* Empty State */}
        {categories.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center space-y-6 p-6">
              <div className="relative p-[2px] rounded-2xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-900 via-cyan-400 to-blue-900 opacity-75 animate-spin"></div>
                <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-black to-transparent animate-pulse"></div>
                
                <div className="relative rounded-2xl bg-gradient-to-br from-black via-gray-900 to-black p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Hash className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-white font-bold text-xl mb-3">No Channels Yet</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Get started by creating your first category to organize your conversations.
                  </p>
                  
                  <button 
                    onClick={onCategoryCreate}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Category</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Categories List */
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                {/* Category Header */}
                <div className="flex items-center justify-between group px-2 py-1 hover:bg-slate-800 hover:bg-opacity-40 rounded-lg transition-colors">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center space-x-2 flex-1"
                  >
                    {collapsedCategories[category.id] ? (
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    )}
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      {category.name}
                    </h4>
                    <div className="flex-1 h-px bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onChannelCreate?.(category.id)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                      title="Create Channel"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onCategorySettings?.(category.id)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                      title="Category Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Channels List */}
                {!collapsedCategories[category.id] && (
                  <div className="space-y-1 ml-2">
                    {category.channels.map((channel) => (
                      <div key={channel.id} className="group relative">
                        <button
                          onClick={() => onChannelSelect(channel)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 group/channel ${
                            selectedChannel === channel.id
                              ? 'bg-slate-700 bg-opacity-60 text-white'
                              : 'text-slate-300 hover:bg-slate-700 hover:bg-opacity-40 hover:text-white'
                          }`}
                        >
                          {getChannelIcon(channel)}
                          <span className="text-sm font-medium flex-1 truncate">{channel.name}</span>
                          
                          {/* Channel Badges */}
                          <div className="flex items-center space-x-1">
                            {...getChannelBadges(channel)}
                            {channel.unread && (
                              <div className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                {channel.unread}
                              </div>
                            )}
                          </div>
                        </button>
                        
                        {/* Channel Settings Button */}
                        <button
                          onClick={() => onChannelSettings?.(channel.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-600 text-slate-400 hover:text-white transition-all"
                          title="Channel Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Create Category Button */}
            <button
              onClick={onCategoryCreate}
              className="w-full flex items-center space-x-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 hover:bg-opacity-40 rounded-lg transition-all duration-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
