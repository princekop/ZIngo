"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function PanelCreateListener() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [panelName, setPanelName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function handlePanelCreate() {
      setIsOpen(true)
    }

    window.addEventListener('panel:create', handlePanelCreate)
    return () => {
      window.removeEventListener('panel:create', handlePanelCreate)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!panelName.trim()) {
      setError('Panel name is required')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/byte/panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: panelName.trim() })
      })
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to create panel')
      }
      
      const { panel } = await res.json()
      if (panel?.slug) {
        toast.success('Panel created successfully!')
        // Small delay to show success message before redirect
        setTimeout(() => {
          window.location.href = `/byte/panels/${panel.slug}`
        }, 500)
      }
    } catch (err: any) {
      console.error('Panel creation error:', err)
      setError(err.message || 'Failed to create panel. Please try again.')
      toast.error('Failed to create panel')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[450px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
            Create New Panel
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Give your new panel a unique name to get started.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="panel-name" className="text-sm font-medium text-gray-300">
              Panel Name
            </label>
            <Input
              id="panel-name"
              placeholder="My Awesome Panel"
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
              autoComplete="off"
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!panelName.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : 'Create Panel'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
