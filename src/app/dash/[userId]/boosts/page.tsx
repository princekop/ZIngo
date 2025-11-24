'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BoostManager } from '@/components/BoostManager';
import { Zap, Server, Users, Crown } from 'lucide-react';
import Link from 'next/link';

interface UserServer {
  id: string;
  name: string;
  icon: string | null;
  boostLevel: number;
  _count: {
    members: number;
  };
}

export default function UserBoostsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [userServers, setUserServers] = useState<UserServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserServers = async () => {
      if (!session?.user?.id) return;
      
      try {
        const res = await fetch('/api/user/servers');
        if (res.ok) {
          const servers = await res.json();
          setUserServers(servers);
        }
      } catch (error) {
        console.error('Error fetching user servers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserServers();
  }, [session]);

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

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 justify-center md:justify-start">
            <Zap className="h-8 w-8 text-yellow-500" />
            Your Boosts
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage and apply your server boosts to enhance your communities
          </p>
        </div>

        {/* Boost Manager */}
        <Card className="border-0 md:border shadow-lg">
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-purple-500" />
              Available Boosts
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Your available boosts from active memberships
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <BoostManager onBoostChange={() => {
              // Refresh data when boosts change
              window.location.reload();
            }} />
          </CardContent>
        </Card>

        {/* Your Servers */}
        <Card className="border-0 md:border shadow-lg">
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <Server className="h-6 w-6 text-blue-500" />
              Your Servers
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Servers you own where you can apply boosts
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : userServers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userServers.map((server) => (
                  <Card key={server.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative h-12 w-12 flex-shrink-0">
                          {server.icon ? (
                            <img
                              src={server.icon}
                              alt={server.name}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-full w-full rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                              {server.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {server.boostLevel > 0 && (
                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-1">
                              <Zap className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate">{server.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{server._count.members} members</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {server.boostLevel > 0 ? (
                            <Badge variant="secondary" className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-600 border-pink-500/30">
                              <Zap className="h-3 w-3 mr-1" />
                              Level {server.boostLevel}
                            </Badge>
                          ) : (
                            <Badge variant="outline">No Boosts</Badge>
                          )}
                        </div>
                        <Link href={`/server/${server.id}/boosts`}>
                          <Button size="sm" variant="outline">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Crown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No servers found</p>
                <p className="text-sm text-muted-foreground">
                  Create a server to start applying boosts
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
