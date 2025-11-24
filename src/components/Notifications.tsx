'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Heart, MessageCircle, Users } from 'lucide-react'
import Image from 'next/image'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'mention'
  actor: {
    id: string
    name: string
    avatar: string
    username: string
  }
  content: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'follow':
        return <Users className="w-4 h-4 text-purple-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-400 hover:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-800/50 rounded-2xl shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800/30">
            <h3 className="font-semibold text-white">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-800/20 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-gray-800/20' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0">
                      <Image
                        src={notification.actor.avatar}
                        alt={notification.actor.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {notification.actor.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            @{notification.actor.username}
                          </p>
                        </div>
                        {getIcon(notification.type)}
                      </div>
                      <p className="text-gray-300 text-sm mt-1">{notification.content}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(notification.id)
                      }}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-800/30 text-center">
              <a href="/notifications" className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
                View All Notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
