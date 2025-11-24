'use client'

import { useCallback, useEffect, useState } from 'react'

interface ResizeHandleProps {
  onResize: (width: number) => void
  side?: 'left' | 'right'
  minWidth?: number
  maxWidth?: number
}

export default function ResizeHandle({ 
  onResize, 
  side = 'right', 
  minWidth = 200, 
  maxWidth = 400 
}: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return

    const containerRect = document.querySelector('.server-container')?.getBoundingClientRect()
    if (!containerRect) return

    let newWidth: number
    if (side === 'left') {
      newWidth = containerRect.right - e.clientX
    } else {
      newWidth = e.clientX - containerRect.left
    }

    // Clamp width between min and max
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
    onResize(newWidth)
  }, [isResizing, onResize, side, minWidth, maxWidth])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <div
      className={`absolute top-0 bottom-0 w-2 cursor-col-resize group z-20 ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
      onMouseDown={handleMouseDown}
    >
      {/* Invisible hit area */}
      <div className="absolute inset-y-0 -left-2 -right-2" />
      
      {/* Visual indicator */}
      <div className={`absolute top-0 bottom-0 w-0.5 transition-all duration-200 ${
        side === 'left' ? 'left-0' : 'right-0'
      } ${
        isResizing 
          ? 'bg-teal-400 w-1' 
          : 'bg-transparent group-hover:bg-teal-400/50 group-hover:w-1'
      }`} />
      
      {/* Drag dots indicator */}
      <div className={`absolute top-1/2 -translate-y-1/2 w-1 h-8 opacity-0 group-hover:opacity-100 transition-opacity ${
        side === 'left' ? 'left-0.5' : 'right-0.5'
      } ${isResizing ? 'opacity-100' : ''}`}>
        <div className="flex flex-col gap-0.5 items-center justify-center h-full">
          <div className="w-0.5 h-0.5 bg-teal-400 rounded-full" />
          <div className="w-0.5 h-0.5 bg-teal-400 rounded-full" />
          <div className="w-0.5 h-0.5 bg-teal-400 rounded-full" />
        </div>
      </div>
    </div>
  )
}
