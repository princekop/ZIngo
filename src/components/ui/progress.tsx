"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary/20 border border-white/10",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-700 ease-out rounded-full shadow-sm md:shadow-lg boost-progress relative overflow-hidden"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      {/* Animated shine effect - reduced for mobile */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 md:via-white/40 to-transparent"
        style={{ 
          width: '30%',
          animation: 'shine 4s ease-in-out infinite',
          animationDelay: '1s'
        }}
      />
      {/* Pulse effect for active progress - reduced opacity on mobile */}
      {value && value > 0 && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10 md:from-purple-400/20 md:via-pink-400/20 md:to-blue-400/20 animate-pulse" />
      )}
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
