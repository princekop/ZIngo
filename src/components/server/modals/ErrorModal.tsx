'use client'

import { useState } from 'react'
import { X, Copy, ExternalLink, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  error: {
    type: 'build' | 'runtime' | 'syntax' | 'network'
    title: string
    message: string
    file?: string
    line?: number
    column?: number
    code?: string
    stack?: string
  }
}

export default function ErrorModal({ isOpen, onClose, error }: ErrorModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const getErrorColor = () => {
    switch (error.type) {
      case 'build': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'runtime': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      case 'syntax': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'network': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      default: return 'text-red-400 bg-red-500/10 border-red-500/20'
    }
  }

  const copyError = async () => {
    const errorText = `
${error.title}
${error.message}
${error.file ? `File: ${error.file}` : ''}
${error.line ? `Line: ${error.line}` : ''}
${error.column ? `Column: ${error.column}` : ''}
${error.code ? `\nCode:\n${error.code}` : ''}
${error.stack ? `\nStack:\n${error.stack}` : ''}
    `.trim()

    try {
      await navigator.clipboard.writeText(errorText)
      setCopied(true)
      toast.success('Error details copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy error details')
    }
  }

  const renderCodeWithLineNumbers = (code: string, errorLine?: number) => {
    const lines = code.split('\n')
    const startLine = Math.max(1, (errorLine || 1) - 5)
    const endLine = Math.min(lines.length, (errorLine || 1) + 5)
    
    return (
      <div className="relative">
        <div className="flex">
          {/* Line numbers */}
          <div className="flex flex-col text-right text-xs text-white/40 bg-white/5 px-3 py-4 font-mono border-r border-white/10">
            {lines.slice(startLine - 1, endLine).map((_, idx) => (
              <div 
                key={startLine + idx}
                className={`leading-6 ${startLine + idx === errorLine ? 'text-red-400 font-bold' : ''}`}
              >
                {startLine + idx}
              </div>
            ))}
          </div>
          
          {/* Code */}
          <div className="flex-1 overflow-x-auto">
            <pre className="text-sm font-mono p-4 text-white/90">
              {lines.slice(startLine - 1, endLine).map((line, idx) => (
                <div 
                  key={startLine + idx}
                  className={`leading-6 ${startLine + idx === errorLine ? 'bg-red-500/20 -mx-4 px-4' : ''}`}
                >
                  {line}
                  {startLine + idx === errorLine && error.column && (
                    <div className="text-red-400">
                      {' '.repeat(Math.max(0, error.column - 1))}^
                    </div>
                  )}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/20 bg-black/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-white/10 ${getErrorColor()}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <h2 className="text-lg font-bold">{error.title}</h2>
              <p className="text-sm opacity-80">{error.type.toUpperCase()} ERROR</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={copyError}
              className="rounded-lg"
            >
              {copied ? 'Copied!' : <Copy className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Error Message */}
          <div className="p-4 border-b border-white/10">
            <div className="text-sm text-white/90 leading-relaxed">
              {error.message}
            </div>
            {error.file && (
              <div className="mt-2 text-xs text-white/60">
                <span className="font-mono">{error.file}</span>
                {error.line && <span> at line {error.line}</span>}
                {error.column && <span>, column {error.column}</span>}
              </div>
            )}
          </div>

          {/* Code Preview */}
          {error.code && (
            <div className="border-b border-white/10">
              <div className="px-4 py-2 bg-white/5 text-xs font-semibold text-white/70 uppercase tracking-wide">
                Code Preview
              </div>
              {renderCodeWithLineNumbers(error.code, error.line)}
            </div>
          )}

          {/* Stack Trace */}
          {error.stack && (
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-2 bg-white/5 text-xs font-semibold text-white/70 uppercase tracking-wide border-b border-white/10">
                Stack Trace
              </div>
              <pre className="p-4 text-xs font-mono text-white/80 whitespace-pre-wrap overflow-x-auto">
                {error.stack}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-between items-center">
          <div className="text-xs text-white/60">
            {error.file && (
              <button
                onClick={() => window.open(`vscode://file/${error.file}:${error.line}:${error.column}`)}
                className="flex items-center gap-1 hover:text-white/80 transition"
              >
                <ExternalLink className="h-3 w-3" />
                Open in Editor
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyError} className="rounded-xl">
              {copied ? 'Copied!' : 'Copy Error'}
            </Button>
            <Button onClick={onClose} className="rounded-xl">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
