'use client'

import { useState, useRef } from 'react'
import { Upload, X, Play, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoUploadProps {
  onUpload?: (file: File, type: 'video' | 'reel' | 'image', caption: string) => void
  isLoading?: boolean
}

export function VideoUpload({ onUpload, isLoading = false }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [caption, setCaption] = useState('')
  const [uploadType, setUploadType] = useState<'video' | 'reel' | 'image'>('video')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  const processFile = (selectedFile: File) => {
    const validTypes = ['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please upload a valid video or image file')
      return
    }

    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const handleSubmit = () => {
    if (file && caption.trim()) {
      onUpload?.(file, uploadType, caption)
      setFile(null)
      setPreview('')
      setCaption('')
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreview('')
    setCaption('')
  }

  if (file && preview) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6">
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative w-full bg-black rounded-xl overflow-hidden aspect-video">
            {uploadType === 'image' ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <video src={preview} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-16 h-16 text-white/50" fill="currentColor" />
                </div>
              </>
            )}
            {uploadType === 'reel' && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-full text-xs text-white font-bold">
                REEL
              </div>
            )}
          </div>

          {/* Type selector */}
          <div className="flex gap-2">
            {(['video', 'reel', 'image'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setUploadType(type)}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  uploadType === type
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-gray-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Caption */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            maxLength={2200}
            className="w-full h-24 bg-gray-900/50 border border-gray-800/50 rounded-xl text-white placeholder:text-gray-600 p-3 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
          />
          <p className="text-xs text-gray-500">{caption.length}/2200</p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleClear}
              variant="outline"
              className="flex-1 bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !caption.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isLoading ? 'Uploading...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
        dragActive
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-gray-800/50 bg-gray-900/30 hover:border-gray-700/50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept="video/*,image/*"
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
          <Upload className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <p className="text-white font-semibold">Drag and drop your video or image</p>
          <p className="text-gray-400 text-sm mt-1">or</p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          Browse Files
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          MP4, WebM, JPEG, PNG, WebP up to 5GB
        </p>
      </div>
    </div>
  )
}
