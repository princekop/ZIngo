import React from 'react'
import { 
  Plus, 
  Edit3, 
  Copy, 
  Bell, 
  Lock, 
  Bookmark, 
  VolumeX, 
  Trash2, 
  Palette,
  Settings,
  Link as LinkIcon,
  Hash
} from 'lucide-react'
interface ContextMenuState {
  x: number
  y: number
  channelId?: string
  channelName?: string
  channelDescription?: string
  categoryId?: string
  categoryName?: string
}

interface ContextMenusProps {
  channelContextMenu: ContextMenuState | null
  categoryContextMenu: ContextMenuState | null
  serverId: string
  onEditChannel?: (channelId: string, name: string, description?: string) => void
  onDeleteChannel?: (channelId: string, name: string) => void
  onCreateChannel?: (categoryId: string) => void
  onEditCategory?: (categoryId: string, name: string) => void
  onDeleteCategory?: (categoryId: string, name: string) => void
  onChannelSettings?: (channelId: string) => void
}

export function ContextMenus({ 
  channelContextMenu, 
  categoryContextMenu,
  serverId,
  onEditChannel,
  onDeleteChannel,
  onCreateChannel,
  onEditCategory,
  onDeleteCategory,
  onChannelSettings
}: ContextMenusProps) {
  // Calculate position to keep menu within viewport
  const getAdjustedPosition = (x: number, y: number, menuWidth: number = 220, menuHeight: number = 300) => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    let adjustedX = x
    let adjustedY = y
    
    // Check if menu would go off right edge
    if (x + menuWidth > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - 10
    }
    
    // Check if menu would go off bottom edge
    if (y + menuHeight > viewportHeight) {
      adjustedY = viewportHeight - menuHeight - 10
    }
    
    // Ensure minimum distance from edges
    adjustedX = Math.max(10, adjustedX)
    adjustedY = Math.max(10, adjustedY)
    
    return { x: adjustedX, y: adjustedY }
  }
  
  const channelMenuPos = channelContextMenu ? getAdjustedPosition(channelContextMenu.x, channelContextMenu.y) : null
  const categoryMenuPos = categoryContextMenu ? getAdjustedPosition(categoryContextMenu.x, categoryContextMenu.y, 220, 250) : null

  return (
    <>
      {/* Channel Context Menu */}
      {channelContextMenu && channelMenuPos && (
        <div 
          className="fixed rounded-xl shadow-2xl z-50 overflow-hidden border backdrop-blur-xl"
          style={{ 
            left: `${channelMenuPos.x}px`, 
            top: `${channelMenuPos.y}px`,
            backgroundColor: '#0a0a0c',
            borderColor: 'rgba(0, 255, 255, 0.2)'
          }}
        >
          <div className="p-2 min-w-[220px]">
            {/* Quick Access Section */}
            <div className="px-2 py-1 mb-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Quick Access</span>
            </div>
            
            <button 
              onClick={() => {
                if (channelContextMenu.channelId && channelContextMenu.channelName) {
                  onEditChannel?.(channelContextMenu.channelId, channelContextMenu.channelName, channelContextMenu.channelDescription)
                }
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm font-medium">Rename Channel</span>
            </button>
            
            <button 
              onClick={() => {
                if (channelContextMenu.channelId) {
                  navigator.clipboard.writeText(`${window.location.origin}/server/${serverId}/channels/${channelContextMenu.channelId}`)
                  alert('✅ Channel link copied!')
                }
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <LinkIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Copy Channel Link</span>
            </button>
            
            <button 
              onClick={() => {
                if (channelContextMenu.channelId) {
                  navigator.clipboard.writeText(channelContextMenu.channelId)
                  alert('✅ Channel ID copied!')
                }
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <Hash className="w-4 h-4" />
              <span className="text-sm font-medium">Copy Channel ID</span>
            </button>
            
            <button 
              onClick={() => {
                if (channelContextMenu.channelId && channelContextMenu.channelName) {
                  onDeleteChannel?.(channelContextMenu.channelId, channelContextMenu.channelName)
                }
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Delete Channel</span>
            </button>
            
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-2"></div>
            
            {/* Full Controls Section */}
            <div className="px-2 py-1 mb-1">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Full Controls</span>
            </div>
            
            <button 
              onClick={() => {
                if (channelContextMenu.channelId) {
                  window.location.href = `/server/${serverId}/channels/${channelContextMenu.channelId}/settings`
                }
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-purple-500/10 rounded-lg transition-colors text-purple-300 hover:text-purple-200"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Channel Settings</span>
            </button>
            
            <div className="px-3 py-1 mt-1">
              <p className="text-xs text-slate-500">Background, Fonts, RGB, Roles & Permissions</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Context Menu */}
      {categoryContextMenu && categoryMenuPos && (
        <div
          className="fixed rounded-xl shadow-2xl z-50 overflow-hidden border backdrop-blur-xl"
          style={{
            left: `${categoryMenuPos.x}px`,
            top: `${categoryMenuPos.y}px`,
            backgroundColor: '#0a0a0c',
            borderColor: 'rgba(0, 255, 255, 0.2)'
          }}
        >
          <div className="p-2 min-w-[200px]">
            {/* Create Channel */}
            <button 
              onClick={() => {
                if (categoryContextMenu.categoryId) {
                  onCreateChannel?.(categoryContextMenu.categoryId)
                }
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors text-indigo-400 hover:text-indigo-300"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Create Channel</span>
            </button>

            <div className="h-px bg-slate-700 opacity-50 my-2"></div>

            {/* Edit Category */}
            <button 
              onClick={() => {
                if (categoryContextMenu.categoryId && categoryContextMenu.categoryName) {
                  onEditCategory?.(categoryContextMenu.categoryId, categoryContextMenu.categoryName)
                }
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm font-medium">Edit Category</span>
            </button>

            {/* Category Settings */}
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-slate-700 hover:bg-opacity-50 rounded-lg transition-colors text-slate-300 hover:text-white">
              <Palette className="w-4 h-4" />
              <span className="text-sm font-medium">Category Settings</span>
            </button>

            <div className="h-px bg-slate-700 opacity-50 my-2"></div>

            {/* Delete Category */}
            <button 
              onClick={() => {
                if (categoryContextMenu.categoryId && categoryContextMenu.categoryName) {
                  onDeleteCategory?.(categoryContextMenu.categoryId, categoryContextMenu.categoryName)
                }
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-colors text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Delete Category</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
