'use client'

import { Category } from '../../types'

interface ChannelsTabProps {
  categories: Category[]
}

export function ChannelsTab({ categories }: ChannelsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Channels</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          Create Channel
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 text-center text-gray-400">
          No channels found
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-white border-opacity-10">
              <h3 className="font-medium text-gray-400 mb-3">{category.name}</h3>
              <div className="space-y-2">
                {category.channels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <span>#</span>
                      <span>{channel.name}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {channel.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
