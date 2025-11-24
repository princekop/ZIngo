'use client'

import { Role } from '../../types'

interface RolesTabProps {
  roles: Role[]
}

export function RolesTab({ roles }: RolesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Server Roles</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          Create Role
        </button>
      </div>
      
      <div className="bg-gray-900 bg-opacity-50 rounded-xl overflow-hidden">
        {roles.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No roles found</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {roles.map((role) => (
              <div key={role.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: role.color }}
                    />
                    <span>{role.name}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {role.memberCount} members
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
