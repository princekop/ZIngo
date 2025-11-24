'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Smile, Heart, Star, Coffee, Globe, Clock } from 'lucide-react'

interface Emoji {
  slug: string
  character: string
  unicodeName: string
  codePoint: string
  group: string
  subGroup: string
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose?: () => void
}

const EMOJI_API_KEY = 'd1a60b51fcbc4098261653a21db1be3e1c6988d9'
const EMOJI_API_BASE = 'https://emoji-api.com'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'smileys-emotion': <Smile className="w-4 h-4" />,
  'people-body': <span className="text-base">👤</span>,
  'animals-nature': <span className="text-base">🐾</span>,
  'food-drink': <Coffee className="w-4 h-4" />,
  'travel-places': <Globe className="w-4 h-4" />,
  'activities': <Star className="w-4 h-4" />,
  'objects': <span className="text-base">💡</span>,
  'symbols': <Heart className="w-4 h-4" />,
  'flags': <span className="text-base">🚩</span>,
}

const RECENT_EMOJIS_KEY = 'recent-emojis'

export default function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('smileys-emotion')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [recentEmojis, setRecentEmojis] = useState<string[]>([])
  const pickerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load recent emojis from localStorage
    const stored = localStorage.getItem(RECENT_EMOJIS_KEY)
    if (stored) {
      setRecentEmojis(JSON.parse(stored))
    }
    
    // Fetch categories and initial emojis
    fetchCategories()
    fetchEmojis()
    
    // Handle click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose?.()
      }
    }
    
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${EMOJI_API_BASE}/categories?access_key=${EMOJI_API_KEY}`)
      const data = await response.json()
      setCategories(data.map((cat: any) => cat.slug))
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchEmojis = async (category?: string, search?: string) => {
    setLoading(true)
    try {
      let url = `${EMOJI_API_BASE}/emojis?access_key=${EMOJI_API_KEY}`
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }
      
      const response = await fetch(url)
      let data: Emoji[] = await response.json()
      
      // Filter by category if specified
      if (category && !search) {
        data = data.filter(emoji => emoji.group === category)
      }
      
      setEmojis(data)
    } catch (error) {
      console.error('Failed to fetch emojis:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery) {
      const debounce = setTimeout(() => {
        fetchEmojis(undefined, searchQuery)
      }, 300)
      return () => clearTimeout(debounce)
    } else {
      fetchEmojis(selectedCategory)
    }
  }, [selectedCategory, searchQuery])

  const handleEmojiClick = (emoji: string) => {
    // Save to recent emojis
    const updated = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 24)
    setRecentEmojis(updated)
    localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(updated))
    
    onEmojiSelect(emoji)
  }

  const displayedEmojis = useMemo(() => {
    return searchQuery ? emojis : emojis.slice(0, 100) // Limit to 100 for performance
  }, [emojis, searchQuery])

  return (
    <div 
      ref={pickerRef}
      className="absolute bottom-full right-0 mb-2 w-80 rounded-xl shadow-2xl border overflow-hidden"
      style={{
        backgroundColor: '#0f0f0f',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        maxHeight: '400px'
      }}
    >
      {/* Search Bar */}
      <div className="p-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787878]" />
          <input
            type="text"
            placeholder="Search emojis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg text-sm text-white placeholder-[#787878] focus:outline-none focus:ring-1 focus:ring-[#5865f2] transition-all"
            style={{ backgroundColor: '#1a1a1a' }}
            autoFocus
          />
        </div>
      </div>

      {/* Categories */}
      <div 
        className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#1a1a1a] scrollbar-track-transparent border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
      >
        {/* Recent */}
        {recentEmojis.length > 0 && (
          <button
            onClick={() => {
              setSelectedCategory('recent')
              setSearchQuery('')
            }}
            className={`flex-shrink-0 p-2 rounded-md transition-all ${
              selectedCategory === 'recent'
                ? 'bg-[#5865f2] text-white'
                : 'text-[#787878] hover:bg-[#1a1a1a] hover:text-white'
            }`}
            title="Recent"
          >
            <Clock className="w-4 h-4" />
          </button>
        )}
        
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category)
              setSearchQuery('')
            }}
            className={`flex-shrink-0 p-2 rounded-md transition-all ${
              selectedCategory === category
                ? 'bg-[#5865f2] text-white'
                : 'text-[#787878] hover:bg-[#1a1a1a] hover:text-white'
            }`}
            title={category.replace('-', ' ')}
          >
            {CATEGORY_ICONS[category] || <span className="text-base">😀</span>}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div 
        className="p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1a1a1a] scrollbar-track-transparent"
        style={{ maxHeight: '280px' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-[#5865f2] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : selectedCategory === 'recent' && recentEmojis.length > 0 ? (
          <div className="grid grid-cols-8 gap-1">
            {recentEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="w-9 h-9 flex items-center justify-center text-xl hover:bg-[#1a1a1a] rounded-md transition-all hover:scale-110"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : displayedEmojis.length > 0 ? (
          <div className="grid grid-cols-8 gap-1">
            {displayedEmojis.map((emoji) => (
              <button
                key={emoji.slug}
                onClick={() => handleEmojiClick(emoji.character)}
                className="w-9 h-9 flex items-center justify-center text-xl hover:bg-[#1a1a1a] rounded-md transition-all hover:scale-110"
                title={emoji.unicodeName}
              >
                {emoji.character}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-[#787878] text-sm">
            <span className="text-3xl mb-2">🔍</span>
            <p>No emojis found</p>
          </div>
        )}
      </div>
    </div>
  )
}
