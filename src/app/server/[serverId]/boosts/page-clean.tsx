'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { use } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Zap, 
  TrendingUp, 
  Sparkles, 
  Star, 
  Award, 
  Crown, 
  Users, 
  Gift 
} from 'lucide-react'

interface ServerBoostsPageProps {
  params: Promise<{ serverId: string }>
}

function ServerBoostsContent({ serverId }: { serverId: string }) {
  const { data: session } = useSession()
  const [serverInfo, setServerInfo] = useState<any>(null)
  const [serverBoosts, setServerBoosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        setIsLoading(true)
        // Fetch server info
        const serverRes = await fetch(`/api/servers/${serverId}`)
        if (serverRes.ok) {
          const serverData = await serverRes.json()
          const normalizedServerData = {
            ...serverData,
            boostLevel: serverData.boostLevel || 0,
            _count: {
              members: serverData._count?.members || serverData.members || 0,
              boosts: serverData._count?.boosts || 0
            }
          }
          setServerInfo(normalizedServerData)
        } else {
          setServerInfo({
            id: serverId,
            name: 'Unknown Server',
            icon: null,
            boostLevel: 0,
            _count: { members: 0, boosts: 0 }
          })
        }

        // Mock server boosts for demonstration
        setServerBoosts([])
      } catch (error) {
        console.error('Error fetching server data:', error)
        setServerInfo({
          id: serverId,
          name: 'Server',
          icon: null,
          boostLevel: 0,
          _count: { members: 0, boosts: 0 }
        })
        setServerBoosts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchServerData()
  }, [serverId])

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#8B5CF6] rounded-full animate-spin"></div>
          </div>
          <div className="text-white/80 font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#8B5CF6] rounded-full animate-spin"></div>
          </div>
          <div className="text-white/80 font-medium">Loading server boosts...</div>
        </div>
      </div>
    )
  }

  const boostLevel = serverInfo?.boostLevel || 0
  const nextLevelProgress = (boostLevel % 10) * 10
  const totalBoosts = serverBoosts.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] text-white">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-48 -right-40 w-[520px] h-[520px] rounded-full blur-[220px] bg-[#6C63FF]/15 animate-pulse"
          style={{ animationDuration: '6s' }}
        />
        <div
          className="absolute -bottom-48 -left-40 w-[520px] h-[520px] rounded-full blur-[220px] bg-[#8B5CF6]/15 animate-pulse"
          style={{ animationDuration: '7s', animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 max-w-7xl">
          <div className="space-y-6 md:space-y-8">
            {/* Header Section */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  {serverInfo?.icon ? (
                    <img 
                      src={serverInfo.icon} 
                      alt={serverInfo.name}
                      className="h-20 w-20 md:h-24 md:w-24 rounded-2xl border-4 border-[#6C63FF] shadow-2xl shadow-[#6C63FF]/25"
                    />
                  ) : (
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-3xl border-4 border-[#6C63FF] shadow-2xl shadow-[#6C63FF]/25">
                      {serverInfo?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {boostLevel > 0 && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#FF3B6E] to-[#8B5CF6] rounded-full p-3 shadow-2xl">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                {serverInfo?.name} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6]">Boosts</span>
              </h1>
              <p className="text-[#C9C9D1] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Help this server unlock amazing perks and features with powerful boosts
              </p>
            </div>

            {/* Boost Status Card */}
            <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/20">
              <CardHeader className="pb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl text-white flex items-center gap-3 mb-2">
                      <TrendingUp className="h-7 w-7 text-[#6C63FF]" />
                      Boost Level {boostLevel}
                    </CardTitle>
                    <CardDescription className="text-[#C9C9D1] text-base">
                      {totalBoosts} boost{totalBoosts !== 1 ? 's' : ''} active • {serverInfo?._count?.members || 0} members
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-center lg:items-end gap-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white border-0 text-lg px-6 py-3 shadow-lg"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Level {boostLevel}
                    </Badge>
                    <div className="text-sm text-[#C9C9D1]">
                      {Math.floor(boostLevel / 10)} tier{Math.floor(boostLevel / 10) !== 1 ? 's' : ''} unlocked
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm text-[#C9C9D1] mb-3">
                      <span>Progress to Level {Math.floor(boostLevel / 10 + 1) * 10}</span>
                      <span>{boostLevel % 10}/10 boosts</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] rounded-full transition-all duration-500 ease-out shadow-lg"
                        style={{ width: `${nextLevelProgress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Boost Perks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
                    <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${boostLevel >= 10 ? 'border-[#4ADE80] bg-[#4ADE80]/10 shadow-lg shadow-[#4ADE80]/20' : 'border-white/20 bg-white/5'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <Star className={`h-6 w-6 ${boostLevel >= 10 ? 'text-[#4ADE80]' : 'text-[#6B6B7A]'}`} />
                        <span className={`font-bold text-lg ${boostLevel >= 10 ? 'text-[#4ADE80]' : 'text-[#6B6B7A]'}`}>
                          Tier 1 Perks
                        </span>
                      </div>
                      <ul className={`space-y-2 ${boostLevel >= 10 ? 'text-[#4ADE80]/90' : 'text-[#6B6B7A]'}`}>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          Animated server icon
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          Custom server banner
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          Higher quality voice
                        </li>
                      </ul>
                    </div>
                    
                    <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${boostLevel >= 20 ? 'border-[#00D4FF] bg-[#00D4FF]/10 shadow-lg shadow-[#00D4FF]/20' : 'border-white/20 bg-white/5'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <Award className={`h-6 w-6 ${boostLevel >= 20 ? 'text-[#00D4FF]' : 'text-[#6B6B7A]'}`} />
                        <span className={`font-bold text-lg ${boostLevel >= 20 ? 'text-[#00D4FF]' : 'text-[#6B6B7A]'}`}>
                          Tier 2 Perks
                        </span>
                      </div>
                      <ul className={`space-y-2 ${boostLevel >= 20 ? 'text-[#00D4FF]/90' : 'text-[#6B6B7A]'}`}>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          Custom role colors
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          Animated role gradients
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          Priority support
                        </li>
                      </ul>
                    </div>
                    
                    <div className={`p-6 rounded-xl border-2 transition-all duration-300 md:col-span-2 xl:col-span-1 ${boostLevel >= 30 ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 shadow-lg shadow-[#8B5CF6]/20' : 'border-white/20 bg-white/5'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <Crown className={`h-6 w-6 ${boostLevel >= 30 ? 'text-[#8B5CF6]' : 'text-[#6B6B7A]'}`} />
                        <span className={`font-bold text-lg ${boostLevel >= 30 ? 'text-[#8B5CF6]' : 'text-[#6B6B7A]'}`}>
                          Tier 3 Perks
                        </span>
                      </div>
                      <ul className={`space-y-2 ${boostLevel >= 30 ? 'text-[#8B5CF6]/90' : 'text-[#6B6B7A]'}`}>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          Custom channel themes
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          Advanced moderation
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          Exclusive features
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Boosts Placeholder */}
            <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/20">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-xl md:text-2xl text-white flex items-center gap-2">
                  <Gift className="h-6 w-6 text-[#6C63FF]" />
                  Your Boosts
                </CardTitle>
                <CardDescription className="text-[#C9C9D1] text-sm md:text-base">
                  Apply your available boosts to help this server grow
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 md:px-6">
                <div className="text-center py-12">
                  <Gift className="h-16 w-16 mx-auto mb-6 text-[#6B6B7A]" />
                  <h3 className="text-xl font-semibold text-[#C9C9D1] mb-3">Boost System Coming Soon</h3>
                  <p className="text-[#6B6B7A] max-w-md mx-auto">
                    We're working on an amazing boost system that will allow you to support your favorite servers with special perks and features.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ServerBoostsPage({ params }: ServerBoostsPageProps) {
  const { serverId } = use(params)
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#8B5CF6] rounded-full animate-spin"></div>
          </div>
          <div className="text-white/80 font-medium">Loading server boosts...</div>
        </div>
      </div>
    }>
      <ServerBoostsContent serverId={serverId} />
    </Suspense>
  )
}
