'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Home,
  Plus,
  UserPlus,
  Globe,
  Star,
  Sparkles,
  Crown,
  Users,
  Users2,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarInset
} from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'

export default function UserDashboard() {
  const { userId } = useParams<{ userId: string }>()
  const { data: session, status } = useSession()
  const router = useRouter()

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0b0d12] via-[#0f1115] to-[#0b0d12]">
        <div className="text-sky-300 text-lg">Loading...</div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!session || session.user.id !== userId) {
    router.push('/login')
    return null
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon" className="[--sidebar-width:6rem]">
        <SidebarHeader>
          <div className="px-2 py-1 text-sky-300 font-bold">Darkbyte</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sky-300">Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push(`/dash/${userId}`)} tooltip="Home">
                  <Home className="text-sky-300" />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => {}} tooltip="Create">
                  <Plus className="text-sky-300" />
                  <span>Create</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => {}} tooltip="Join">
                  <UserPlus className="text-sky-300" />
                  <span>Join</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push(`/dash/dash/${userId}`)} tooltip="Discover">
                  <Globe className="text-sky-300" />
                  <span>Discover</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0b0d12] via-[#0f1115] to-[#0b0d12] relative overflow-hidden text-[13px] sm:text-[14px] lg:text-[15px] antialiased">
          {/* Background accents */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-[36rem] h-[36rem] rounded-full bg-sky-400/10 blur-3xl" />
            <div className="absolute -bottom-32 -right-28 w-[40rem] h-[40rem] rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.08),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(6,182,212,0.08),transparent_45%)]" />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <SiteHeader />

          <div className="relative z-10 flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
              <div className="inline-block rounded-2xl px-4 py-2 bg-gradient-to-br from-[#0b0d12]/80 to-[#141821]/80 border border-purple-400/30 shadow-[0_0_24px_rgba(168,85,247,0.18)] backdrop-blur-xl">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                  Welcome back, {session.user.displayName} 🖐️
                </h1>
              </div>
              <p className="mt-2 font-semibold bg-gradient-to-r from-purple-300 via-sky-300 to-cyan-300 bg-clip-text text-transparent tracking-wide">
                Manage your servers and communities
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
              <div className="space-y-8">
                {/* Featured Communities */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <Sparkles className="h-6 w-6 text-purple-400" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                      Featured Communities
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-400/50 via-sky-300/30 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="group bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-sky-400/30 hover:border-sky-400/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_40px_rgba(56,189,248,0.15)] overflow-hidden">
                        <div className="relative h-24 md:h-28 bg-gradient-to-br from-sky-400/10 to-cyan-400/10" />
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center">
                              <Star className="h-6 w-6 text-sky-400" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            </div>
                          </div>
                          <h3 className="text-white font-bold text-lg mb-2">Featured Server {i}</h3>
                          <p className="text-gray-300 text-sm mb-4">Join this amazing community and connect with like-minded people.</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Users2 className="h-4 w-4 text-sky-400" />
                              <span className="text-white text-sm font-medium">{1000 + i * 500} members</span>
                            </div>
                            <div className="px-3 py-1 rounded-full text-xs bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
                              Featured
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Your Servers */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <Crown className="h-6 w-6 text-purple-400" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                      Your Servers
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-400/50 via-sky-300/30 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="group bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-sky-400/30 hover:border-sky-400/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_40px_rgba(56,189,248,0.15)] overflow-hidden">
                        <div className="relative h-24 md:h-28 bg-gradient-to-br from-sky-400/10 to-blue-400/10" />
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center">
                              <Crown className="h-8 w-8 text-sky-400" />
                            </div>
                          </div>
                          <h3 className="text-white font-bold text-xl mb-2">My Server {i}</h3>
                          <p className="text-gray-300 text-sm mb-4">Your own community space for discussions and collaboration.</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Users2 className="h-4 w-4 text-sky-400" />
                              <span className="text-white text-sm font-medium">{50 + i * 25} members</span>
                            </div>
                            <div className="px-3 py-1 rounded-full text-xs bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
                              Owner
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Joined Communities */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <Users className="h-6 w-6 text-purple-400" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                      Joined Communities
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-400/50 via-sky-300/30 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="group bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_40px_rgba(59,130,246,0.15)] overflow-hidden">
                        <div className="relative h-24 md:h-28 bg-gradient-to-br from-blue-400/10 to-purple-400/10" />
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-blue-400/20 border border-blue-400/30 flex items-center justify-center">
                              <Users className="h-8 w-8 text-blue-400" />
                            </div>
                          </div>
                          <h3 className="text-white font-bold text-xl mb-2">Community {i}</h3>
                          <p className="text-gray-300 text-sm mb-4">An active community you're part of with great discussions.</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Users2 className="h-4 w-4 text-blue-400" />
                              <span className="text-white text-sm font-medium">{200 + i * 100} members</span>
                            </div>
                            <div className="px-3 py-1 rounded-full text-xs bg-blue-400/20 text-blue-400 border border-blue-400/30">
                              Member
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <aside className="hidden lg:flex lg:flex-col gap-6">
                <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                  <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-br from-sky-400 to-cyan-400 text-white border border-sky-400/50 hover:shadow-sky-400/30 transition">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Server
                    </Button>
                    <Button variant="outline" className="w-full border-sky-400/40 text-sky-400 hover:bg-sky-400/10">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Server
                    </Button>
                    <Button variant="outline" className="w-full border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10">
                      <Globe className="h-4 w-4 mr-2" />
                      Discover
                    </Button>
                  </div>
                </div>

                <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                  <h3 className="text-white font-semibold mb-4">Your Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Servers Owned</span>
                      <span className="text-sky-400 font-semibold">2</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Communities Joined</span>
                      <span className="text-blue-400 font-semibold">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Total Members</span>
                      <span className="text-purple-400 font-semibold">875</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
