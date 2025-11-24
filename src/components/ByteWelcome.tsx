"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function ByteWelcome() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/byte/status", { cache: "no-store" })
        const j = await res.json()
        if (!mounted) return
        if (j?.active) {
          setExpiresAt(j.expiresAt || null)
          const last = typeof j.lastShownAt === 'number' ? j.lastShownAt : 0
          const oneDay = 24 * 60 * 60 * 1000
          if (Date.now() - last > oneDay) {
            setOpen(true)
          }
        }
      } catch {}
      finally { setLoading(false) }
    })()
    return () => { mounted = false }
  }, [])

  async function dismiss() {
    try { await fetch("/api/byte/status", { method: "PATCH" }) } catch {}
    setOpen(false)
  }

  async function handleCreatePanel() {
    setIsCreating(true)
    try {
      // Dispatch panel:create event to trigger the listener in the main layout
      const createEvent = new CustomEvent('panel:create')
      window.dispatchEvent(createEvent)
      
      // Close the welcome modal after a short delay
      setTimeout(() => {
        setOpen(false)
      }, 300)
    } catch (err: any) {
      console.error('Panel creation error:', err)
      alert('Failed to start panel creation. Please try again.')
      setIsCreating(false)
    }
  }

  if (loading || !open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden shadow-2xl transform transition-all scale-95 hover:scale-100 duration-300">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="grid md:grid-cols-2">
          {/* Left side - GIF */}
          <div className="relative h-80 md:h-auto bg-black">
            <img 
              src="https://i.postimg.cc/qvmJZQFz/byte-welcome-darkhosting.gif" 
              alt="Byte welcome animation" 
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
          </div>
          
          {/* Right side - Content */}
          <div className="p-8 flex flex-col">
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent mb-2">
                Welcome to Byte! 🎉
              </h2>
              <p className="text-gray-300 mb-6">
                Thanks for supporting Darkhosting. Your membership is now active!
              </p>
              
              <div className="space-y-4 mb-8 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 mt-0.5">
                    <svg className="h-3.5 w-3.5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Private Panel</h4>
                    <p className="text-sm text-gray-400">Your own management dashboard</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 mt-0.5">
                    <svg className="h-3.5 w-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Pterodactyl Integration</h4>
                    <p className="text-sm text-gray-400">Full server control panel access</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3 mt-0.5">
                    <svg className="h-3.5 w-3.5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Plugin Installer</h4>
                    <p className="text-sm text-gray-400">One-click installs for PaperMC, Modrinth</p>
                  </div>
                </div>
              </div>
              
              {expiresAt && (
                <div className="text-sm text-gray-400 mb-6">
                  Membership valid until: <span className="text-purple-300">{new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
              <Button 
                onClick={dismiss}
                variant="outline"
                className="bg-transparent hover:bg-white/5 border-white/10 text-white flex-1 transition-all hover:scale-105"
              >
                Explore Features
              </Button>
              <Button 
                onClick={handleCreatePanel}
                disabled={isCreating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 flex-1 transition-all hover:scale-105 transform hover:shadow-purple-500/40"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create Your Panel
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
