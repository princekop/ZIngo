'use client'

import { Edit2, Link as LinkIcon } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Channel</h2>
        <button className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors">
          <Edit2 className="w-4 h-4 inline mr-2" />
          Edit
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-950 border border-gray-900 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Description</h3>
          <p className="text-gray-400 text-sm">Welcome to my channel! I'm a passionate developer and content creator sharing tutorials, tips, and insights about web development, React, and modern JavaScript.</p>
        </div>

        <div className="bg-gray-950 border border-gray-900 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Views</span> <span className="text-white font-semibold">1.2M</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Posts</span> <span className="text-white font-semibold">342</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Followers</span> <span className="text-white font-semibold">45.8K</span></div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="bg-gray-950 border border-gray-900 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Links</h3>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'Website' },
            { label: 'Twitter' },
            { label: 'GitHub' },
          ].map(({ label }) => (
            <button key={label} className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm rounded transition-colors">
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
