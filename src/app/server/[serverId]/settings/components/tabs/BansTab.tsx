'use client'

import { BanItem } from '../../types'

interface BansTabProps {
  bans: BanItem[]
}

export function BansTab({ bans }: BansTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Banned Users</h2>
      </div>

      <div className="bg-gray-900 bg-opacity-50 rounded-xl overflow-hidden">
        {bans.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No banned users</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {bans.map((ban) => (
              <div key={ban.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                      {ban.user.avatar && (
                        <img 
                          src={ban.user.avatar} 
                          alt={ban.user.username}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{ban.user.displayName}</div>
                      <div className="text-sm text-gray-400">@{ban.user.username}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      Banned on {new Date(ban.createdAt).toLocaleDateString()}
                    </div>
                    {ban.expiresAt && (
                      <div className="text-xs text-gray-400">
                        Expires: {new Date(ban.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                {ban.reason && (
                  <div className="mt-2 p-2 bg-gray-800/50 rounded text-sm text-gray-300">
                    <span className="font-medium">Reason:</span> {ban.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
