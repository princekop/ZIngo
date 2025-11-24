'use client'

import { Member } from '../../types'

interface MembersTabProps {
  members: Member[]
}

export function MembersTab({ members }: MembersTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Server Members</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search members..."
            className="bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="bg-gray-900 bg-opacity-50 rounded-xl overflow-hidden">
        {members.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No members found</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {members.map((member) => (
              <div key={member.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                        {member.avatar && (
                          <img 
                            src={member.avatar} 
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900"
                        style={{ 
                          backgroundColor: member.status === 'online' ? '#43b581' : 
                                         member.status === 'idle' ? '#faa61a' :
                                         member.status === 'dnd' ? '#f04747' : '#747f8d'
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-400">@{member.username}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
