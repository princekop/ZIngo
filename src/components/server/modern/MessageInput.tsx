'use client'

import { useState, useRef } from 'react'
import { Send, Paperclip, Smile, Plus, Mic, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void
  placeholder: string
  disabled?: boolean
}

const commonEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕']

export function MessageInput({ onSendMessage, placeholder, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments)
      setMessage('')
      setAttachments([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).slice(0, 10 - attachments.length) // Limit to 10 files
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newMessage = message.substring(0, start) + emoji + message.substring(end)
      setMessage(newMessage)
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length
        textarea.focus()
      }, 0)
    } else {
      setMessage(prev => prev + emoji)
    }
  }

  return (
    <div className="space-y-3">
      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
            >
              <div className="flex items-center space-x-2">
                {file.type.startsWith('image/') ? (
                  <Image className="w-4 h-4 text-blue-400" />
                ) : (
                  <Paperclip className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-sm text-slate-300 truncate max-w-32">
                  {file.name}
                </span>
                <span className="text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(index)}
                className="h-5 w-5 p-0 text-slate-400 hover:text-red-400"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div
        className={cn(
          "relative bg-slate-800/50 border border-slate-700/50 rounded-xl transition-all duration-200",
          isDragOver && "border-blue-500 bg-blue-500/10",
          "focus-within:border-blue-500/50 focus-within:bg-slate-800/70"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Drag Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center z-10">
            <div className="text-center">
              <Paperclip className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <p className="text-blue-400 font-medium">Drop files to upload</p>
            </div>
          </div>
        )}

        <div className="flex items-end space-x-3 p-3">
          {/* Attachment Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload a file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Text Input */}
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? 'You do not have permission to send messages in this channel' : placeholder}
              disabled={disabled}
              className="min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 py-2 px-0"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '40px',
                maxHeight: '200px',
                overflowY: message.split('\n').length > 3 ? 'auto' : 'hidden'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {/* Emoji Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3 bg-slate-800 border-slate-700" align="end">
                <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
                  {commonEmojis.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => insertEmoji(emoji)}
                      className="h-8 w-8 p-0 text-lg hover:bg-slate-700"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Send Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSubmit}
                    disabled={disabled || (!message.trim() && attachments.length === 0)}
                    className={cn(
                      "h-8 w-8 p-0 transition-all duration-200",
                      (message.trim() || attachments.length > 0) && !disabled
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send message (Enter)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Character count (if approaching limit) */}
      {message.length > 1500 && (
        <div className="text-right">
          <span className={cn(
            "text-xs",
            message.length > 1900 ? "text-red-400" : message.length > 1700 ? "text-yellow-400" : "text-slate-500"
          )}>
            {message.length}/2000
          </span>
        </div>
      )}
    </div>
  )
}
