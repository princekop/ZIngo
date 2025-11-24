'use client'

import React from 'react'
import StarBorder from '@/components/StarBorder'
import { cn } from '@/lib/utils'

interface StarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const colorSchemes = {
  primary: {
    color: '#06b6d4', // cyan-500
    gradient: 'from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-500/25'
  },
  secondary: {
    color: '#64748b', // slate-500
    gradient: 'from-slate-500 to-slate-700',
    shadow: 'shadow-slate-500/25'
  },
  success: {
    color: '#10b981', // emerald-500
    gradient: 'from-emerald-500 to-green-600',
    shadow: 'shadow-emerald-500/25'
  },
  warning: {
    color: '#f59e0b', // amber-500
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/25'
  },
  danger: {
    color: '#ef4444', // red-500
    gradient: 'from-red-500 to-rose-600',
    shadow: 'shadow-red-500/25'
  },
  info: {
    color: '#3b82f6', // blue-500
    gradient: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/25'
  },
  purple: {
    color: '#8b5cf6', // violet-500
    gradient: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/25'
  }
}

const sizeClasses = {
  sm: 'text-xs py-1.5 px-3',
  md: 'text-sm py-2 px-4',
  lg: 'text-base py-3 px-6'
}

export default function StarButton({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: StarButtonProps) {
  const scheme = colorSchemes[variant]
  
  return (
    <StarBorder
      as="button"
      color={scheme.color}
      speed="4s"
      thickness={2}
      className={cn(
        'transition-all duration-200 hover:scale-105 active:scale-95',
        scheme.shadow,
        'hover:shadow-lg',
        className
      )}
      {...props}
    >
      <div className={cn(
        'relative z-10 bg-gradient-to-r text-white font-medium rounded-[18px] transition-all duration-200 flex items-center justify-center',
        scheme.gradient,
        sizeClasses[size],
        'hover:brightness-110'
      )}>
        {children}
      </div>
    </StarBorder>
  )
}
