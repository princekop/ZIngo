'use client'

import { Server } from '../../types'
import { Zap } from 'lucide-react'

interface ByteeTabProps {
  server: Server
}

export function ByteeTab({ server }: ByteeTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 bg-opacity-50 backdrop-blur-xl rounded-xl p-6 border border-white border-opacity-10">
        <h2 className="text-xl font-semibold mb-4">Bytee Server Boost</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Current Level</h3>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, (server.byteeLevel || 0) * 20)}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                Level {server.byteeLevel || 0}/5
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-300">
              <p>• Custom server banner</p>
              <p>• Increased audio quality</p>
              <p>• Server analytics</p>
              <p>• Custom role colors</p>
              <p>• Server analytics</p>
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-white border-opacity-10">
            <h3 className="text-lg font-medium mb-4">Boost Server</h3>
            <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center">
              <Zap className="h-4 w-4 mr-2" />
              Boost Now
            </button>
            <p className="text-gray-400 text-xs mt-2 text-center">
              Starting at $1.99 per month
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
