'use client'

import { useState } from 'react'
import { Server } from '../../types'
import { serverAPI } from '../../../lib/api-service'
import { Upload, Image as ImageIcon, Save, Loader2 } from 'lucide-react'
import { useSWRConfig } from 'swr'

interface OverviewTabProps {
  server: Server
}

export function OverviewTab({ server }: OverviewTabProps) {
  const { mutate } = useSWRConfig()
  const [name, setName] = useState(server.name)
  const [description, setDescription] = useState(server.description || '')
  const [icon, setIcon] = useState(server.icon || '')
  const [banner, setBanner] = useState(server.banner || '')

  // File states
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'banner') => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${type === 'icon' ? 'Icon' : 'Banner'} must be less than 5MB`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'icon') {
          setIconFile(file)
          setIcon(reader.result as string)
        } else {
          setBannerFile(file)
          setBanner(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // In a real app, you would upload files first and get URLs
      // For now, we'll assume the API handles base64 or we send metadata
      // Ideally, updateServer should handle FormData or we upload to separate endpoint

      await serverAPI.updateServer(server.id, {
        name,
        description,
        icon, // Sending base64/url for now
        banner
      })

      // Refresh server data
      await mutate(`/api/servers/${server.id}`)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Failed to update server:', err)
      setError(err.message || 'Failed to update server settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Banner & Icon Section */}
      <div className="relative group">
        <div className="h-48 w-full rounded-xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 relative border border-white/10">
          {banner ? (
            <img src={banner} alt="Server Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <ImageIcon className="w-12 h-12 opacity-50" />
            </div>
          )}

          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <div className="flex items-center gap-2 text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <Upload className="w-4 h-4" />
              Change Banner
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'banner')} className="hidden" />
          </label>
        </div>

        <div className="absolute -bottom-12 left-8">
          <div className="relative group/icon">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0a0a0a] bg-slate-800 shadow-xl">
              {icon ? (
                <img src={icon} alt="Server Icon" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600">
                  {name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/icon:opacity-100 transition-opacity rounded-2xl cursor-pointer border-4 border-transparent">
              <Upload className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'icon')} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="pt-12 space-y-6">
        {/* Status Messages */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
            Server settings updated successfully!
          </div>
        )}

        {/* Form Fields */}
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Server Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white transition-all"
              placeholder="Enter server name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white transition-all resize-none"
              placeholder="What is this server about?"
            />
            <p className="text-xs text-slate-500 text-right">
              {description.length}/200 characters
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end pt-4 border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
