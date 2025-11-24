'use client'

import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  type PanelGroupProps,
  type PanelProps,
  type PanelResizeHandleProps,
} from 'react-resizable-panels'

import { cn } from '@/lib/utils'

const ResizablePanelGroup = ({ className, ...props }: PanelGroupProps) => (
  <PanelGroup className={cn('flex h-full w-full', className)} {...props} />
)

const ResizablePanel = ({ className, ...props }: PanelProps) => (
  <Panel className={cn('relative flex h-full w-full', className)} {...props} />
)

type ResizableHandleProps = PanelResizeHandleProps & {
  withHandle?: boolean
}

const ResizableHandle = ({ className, withHandle, ...props }: ResizableHandleProps) => (
  <PanelResizeHandle
    className={cn(
        'relative flex items-center justify-center bg-slate-800/70 transition-colors hover:bg-slate-700/80',
        'data-[direction=horizontal]:h-full data-[direction=horizontal]:w-1',
        'data-[direction=vertical]:w-full data-[direction=vertical]:h-1',
        className
      )}
    {...props}
  >
    {withHandle && (
      <div
        className={cn(
          'pointer-events-none z-10 rounded-full bg-slate-600/70',
          'data-[direction=horizontal]:h-8 data-[direction=horizontal]:w-1',
          'data-[direction=vertical]:w-8 data-[direction=vertical]:h-1'
        )}
      />
    )}
  </PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
