import React from 'react'

interface DateSeparatorProps {
  date: Date
}

export default function DateSeparator({ date }: DateSeparatorProps) {
  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const messageDate = new Date(date)
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0)
    yesterday.setHours(0, 0, 0, 0)
    messageDate.setHours(0, 0, 0, 0)
    
    if (messageDate.getTime() === today.getTime()) {
      return 'Today'
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday'
    } else {
      return new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div className="flex items-center my-4 px-4">
      <div className="flex-1 h-px bg-[#3f4147]"></div>
      <div className="px-4">
        <span className="text-[#949ba4] text-xs font-semibold">
          {formatDate(date)}
        </span>
      </div>
      <div className="flex-1 h-px bg-[#3f4147]"></div>
    </div>
  )
}
