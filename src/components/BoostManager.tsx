'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Icons } from './Icons';

interface Boost {
  id: string;
  value: number;
  isActive: boolean;
  serverId: string | null;
  server?: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
  membership: {
    tier: {
      name: string;
    };
  };
}

export function BoostManager({ serverId, onBoostChange }: { serverId?: string, onBoostChange?: () => void }) {
  const { data: session } = useSession();
  const [boosts, setBoosts] = useState<Boost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  const fetchBoosts = async () => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch('/api/boosts');
      if (!res.ok) throw new Error('Failed to fetch boosts');
      
      const data = await res.json();
      setBoosts(data);
    } catch (error) {
      console.error('Error fetching boosts:', error);
      toast.error('Failed to load boosts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoosts();
  }, [session]);

  const handleApplyBoost = async (boostId: string) => {
    if (!serverId) return;
    
    setIsApplying(true);
    try {
      const res = await fetch('/api/boosts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boostId, serverId })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to apply boost');
      }

      // Force refresh data
      await fetchBoosts();
      onBoostChange?.();
      
      // Add a small delay to ensure UI updates
      setTimeout(() => {
        toast.success('Boost applied successfully! Progress updated.');
      }, 100);
    } catch (error: any) {
      console.error('Error applying boost:', error);
      toast.error(error.message || 'Failed to apply boost');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveBoost = async (boostId: string) => {
    try {
      const res = await fetch(`/api/boosts/${boostId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to remove boost');
      }

      await fetchBoosts();
      onBoostChange?.();
      toast.success('Boost removed successfully');
    } catch (error) {
      console.error('Error removing boost:', error);
      toast.error('Failed to remove boost');
    }
  };

  const availableBoosts = boosts.filter(boost => !boost.serverId);
  const activeBoosts = boosts.filter(boost => boost.serverId === serverId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4 md:p-8">
        <Icons.spinner className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Active Boosts */}
      {serverId && activeBoosts.length > 0 && (
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Active Boosts</CardTitle>
            <CardDescription className="text-sm md:text-base">
              These boosts are currently active on this server
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeBoosts.map((boost) => (
                <div 
                  key={boost.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex-shrink-0">
                      <Icons.bolt className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm md:text-base">{boost.value}× Server Boost</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        From {boost.membership.tier.name} membership
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveBoost(boost.id)}
                    disabled={isApplying}
                    className="self-start sm:self-center"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Boosts */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Your Boosts</CardTitle>
          <CardDescription className="text-sm md:text-base">
            {availableBoosts.length > 0 
              ? `You have ${availableBoosts.length} boost${availableBoosts.length !== 1 ? 's' : ''} available`
              : 'You have no available boosts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableBoosts.length > 0 ? (
            <div className="space-y-3">
              {availableBoosts.map((boost) => (
                <div 
                  key={boost.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-muted flex-shrink-0">
                      <Icons.bolt className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm md:text-base">{boost.value}× Server Boost</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        From {boost.membership.tier.name} membership
                      </p>
                    </div>
                  </div>
                  {serverId && (
                    <Button 
                      onClick={() => handleApplyBoost(boost.id)}
                      disabled={isApplying}
                      className="self-start sm:self-center w-full sm:w-auto"
                      size="sm"
                    >
                      {isApplying ? 'Applying...' : 'Apply to Server'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12">
              <Icons.bolt className="mx-auto h-8 w-8 md:h-10 md:w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm md:text-base">No available boosts</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-2">
                Upgrade to a higher membership tier to get more boosts
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
