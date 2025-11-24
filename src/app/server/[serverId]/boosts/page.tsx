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
// import { BoostManager } from '@/components/server/BoostManager'

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
        // Fetch server info
        const serverRes = await fetch(`/api/servers/${serverId}`);
        if (serverRes.ok) {
          const serverData = await serverRes.json();
          // Ensure _count exists with default values
          const normalizedServerData = {
            ...serverData,
            boostLevel: serverData.boostLevel || 0,
            boosts: typeof serverData.boosts === 'number' ? serverData.boosts : serverData._count?.boosts || 0,
            _count: {
              members: serverData._count?.members || 0,
              boosts: serverData._count?.boosts || serverData.boosts || 0
            }
          };
          setServerInfo(normalizedServerData);
        } else {
          // Set default server info if fetch fails
          setServerInfo({
            id: serverId,
            name: 'Unknown Server',
            icon: null,
            boostLevel: 0,
            _count: { members: 0, boosts: 0 }
          });
        }

        // Fetch server boosts
        const boostsRes = await fetch(`/api/servers/${serverId}/boosts`);
        if (boostsRes.ok) {
          const boostsData = await boostsRes.json();
          setServerBoosts(boostsData || []);
        } else {
          setServerBoosts([]);
        }
      } catch (error) {
        console.error('Error fetching server data:', error);
        // Set fallback data on error
        setServerInfo({
          id: serverId,
          name: 'Server',
          icon: null,
          boostLevel: 0,
          boosts: 0,
          _count: { members: 0, boosts: 0 }
        });
        setServerBoosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServerData();
  }, [serverId]);

  const handleBoostChange = async () => {
    // Refresh data when boosts change - avoid full page reload
    try {
      // Fetch server info
      const serverRes = await fetch(`/api/servers/${serverId}`);
      if (serverRes.ok) {
        const serverData = await serverRes.json();
        const normalizedServerData = {
          ...serverData,
          boostLevel: serverData.boostLevel || 0,
          _count: {
            members: serverData._count?.members || 0,
            boosts: serverData._count?.boosts || 0
          }
        };
        setServerInfo(normalizedServerData);
      }

      // Fetch server boosts
      const boostsRes = await fetch(`/api/servers/${serverId}/boosts`);
      if (boostsRes.ok) {
        const boostsData = await boostsRes.json();
        setServerBoosts(boostsData || []);
      }
    } catch (error) {
      console.error('Error refreshing server data:', error);
      // Fallback to page reload if API fails
      window.location.reload();
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
      </div>
    );
  }

  const boostLevel = serverInfo?.boostLevel || 0;
  const nextLevelProgress = (boostLevel % 10) * 10; // Progress to next level
  const totalBoosts = serverInfo?.boosts ?? serverBoosts.length;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-5 text-white/80">
            <div className="relative h-16 w-16">
              <div className="h-16 w-16 rounded-full border-4 border-[#6C63FF]/30 border-t-[#6C63FF] animate-spin" />
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-[#8B5CF6] animate-spin" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-semibold">Loading Boosts</h1>
              <p className="text-sm text-white/60">Summoning Bytee boost data...</p>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A1F] via-[#16163A] to-[#2B0F3A] py-14 px-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 text-white">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-[0_30px_120px_-60px_rgba(108,99,255,0.6)] sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_60%)]" />
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <div className="relative h-16 w-16">
                <div className="h-16 w-16 rounded-full border-4 border-[#6C63FF]/30 border-t-[#6C63FF] animate-spin" />
                <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-[#8B5CF6] animate-spin" />
              </div>
            </div>
            <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
              {serverInfo?.name} Boosts
            </h1>
            <p className="mt-3 text-base text-white/70 sm:text-lg">
              Help this server unlock amazing perks and features
            </p>
          </div>

          {/* Boost Status Card */}
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                    Boost Level {boostLevel}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {totalBoosts} boost{totalBoosts !== 1 ? 's' : ''} active • {serverInfo?._count?.members || 0} members
                  </CardDescription>
                </div>
                <div className="flex flex-col items-center md:items-end gap-2">
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-lg px-4 py-2"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Level {boostLevel}
                  </Badge>
                  <div className="text-sm text-gray-400">
                    {Math.floor(boostLevel / 10)} tier{Math.floor(boostLevel / 10) !== 1 ? 's' : ''} unlocked
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Progress to Level {Math.floor(boostLevel / 10 + 1) * 10}</span>
                    <span>{boostLevel % 10}/10 boosts</span>
                  </div>
                  <Progress value={nextLevelProgress} className="h-4 bg-gray-800/50 boost-progress" />
                </div>
                
                {/* Boost Perks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className={`p-4 rounded-lg border-2 ${boostLevel >= 10 ? 'border-green-500 bg-green-500/10' : 'border-gray-600 bg-gray-800/50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className={`h-5 w-5 ${boostLevel >= 10 ? 'text-green-400' : 'text-gray-400'}`} />
                      <span className={`font-semibold ${boostLevel >= 10 ? 'text-green-400' : 'text-gray-400'}`}>
                        Tier 1 Perks
                      </span>
                    </div>
                    <ul className={`text-sm space-y-1 ${boostLevel >= 10 ? 'text-green-300' : 'text-gray-500'}`}>
                      <li>• Animated server icon</li>
                      <li>• Custom server banner</li>
                      <li>• Higher quality voice</li>
                    </ul>
                  </div>
                  
                  <div className={`p-4 rounded-lg border-2 ${boostLevel >= 20 ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 bg-gray-800/50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className={`h-5 w-5 ${boostLevel >= 20 ? 'text-blue-400' : 'text-gray-400'}`} />
                      <span className={`font-semibold ${boostLevel >= 20 ? 'text-blue-400' : 'text-gray-400'}`}>
                        Tier 2 Perks
                      </span>
                    </div>
                    <ul className={`text-sm space-y-1 ${boostLevel >= 20 ? 'text-blue-300' : 'text-gray-500'}`}>
                      <li>• Custom role colors</li>
                      <li>• Animated role gradients</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                  
                  <div className={`p-4 rounded-lg border-2 ${boostLevel >= 30 ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 bg-gray-800/50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className={`h-5 w-5 ${boostLevel >= 30 ? 'text-purple-400' : 'text-gray-400'}`} />
                      <span className={`font-semibold ${boostLevel >= 30 ? 'text-purple-400' : 'text-gray-400'}`}>
                        Tier 3 Perks
                      </span>
                    </div>
                    <ul className={`text-sm space-y-1 ${boostLevel >= 30 ? 'text-purple-300' : 'text-gray-500'}`}>
                      <li>• Custom channel themes</li>
                      <li>• Advanced moderation</li>
                      <li>• Exclusive features</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Boosters */}
          {serverBoosts.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Server Boosters ({totalBoosts})
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Amazing members who are boosting this server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serverBoosts.map((boost) => (
                    <div key={boost.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <div className="relative">
                        {boost.user.avatar ? (
                          <img 
                            src={boost.user.avatar} 
                            alt={boost.user.username}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                            {boost.user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-1">
                          <Zap className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{boost.user.username}</p>
                        <p className="text-sm text-gray-400">
                          {boost.value}× boost • {new Date(boost.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Boost Manager */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-xl md:text-2xl text-white flex items-center gap-2">
                <Gift className="h-6 w-6 text-purple-400" />
                Your Boosts
              </CardTitle>
              <CardDescription className="text-gray-300 text-sm md:text-base">
                Apply your available boosts to help this server grow
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div className="text-center py-8">
                <Gift className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Boost Manager</h3>
                <p className="text-gray-500">Boost functionality will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Suspense>
  );
}

export default function ServerBoostsPage({ params }: ServerBoostsPageProps) {
  const { serverId } = use(params)
  return <ServerBoostsContent serverId={serverId} />
}
