'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface Comment {
  id: string
  author: {
    id: string
    name: string
    avatar: string
    username: string
  }
  content: string
  likes: number
  timestamp: Date
  isLiked?: boolean
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  onAddComment?: (content: string) => void
  onDeleteComment?: (commentId: string) => void
  onLikeComment?: (commentId: string) => void
  isLoading?: boolean
}

export function CommentSection({
  postId,
  comments,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  isLoading = false,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState('')
  const [localComments, setLocalComments] = useState(comments)

  const handleAddComment = async () => {
    if (!commentText.trim()) return

    onAddComment?.(commentText)
    setCommentText('')
  }

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <div className="flex gap-3">
        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0">
          <Image
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=current"
            alt="Your avatar"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 flex gap-2">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            maxLength={500}
            className="bg-gray-900/50 border-gray-800/50 text-white placeholder:text-gray-600 rounded-xl"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAddComment()
              }
            }}
          />
          <Button
            onClick={handleAddComment}
            disabled={isLoading || !commentText.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4"
          >
            Post
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {localComments.length > 0 ? (
          localComments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 bg-gray-800/20 rounded-lg">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0">
                <Image
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm">{comment.author.name}</p>
                  <p className="text-gray-500 text-xs">@{comment.author.username}</p>
                </div>
                <p className="text-gray-300 text-sm mt-1 break-words">{comment.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => onLikeComment?.(comment.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-3 h-3" />
                    <span>{comment.likes}</span>
                  </button>
                  <button
                    onClick={() => onDeleteComment?.(comment.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm py-4">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  )
}
