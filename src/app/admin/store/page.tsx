'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Users, Crown, Plus, Edit, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface MembershipTier {
  id: string;
  name: string;
  priceInINR: number;
  priceInUSD: number;
  description: string;
  featuresJson: string;
  features: string[];
}

interface UserMembership {
  id: string;
  status: string;
  startedAt: string;
  expiresAt: string | null;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
  };
  tier: {
    name: string;
  };
}

export default function AdminStorePage() {
  const { data: session } = useSession();
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
  const [newTier, setNewTier] = useState({
    name: '',
    priceInINR: 0,
    priceInUSD: 0,
    description: '',
    features: ['']
  });

  useEffect(() => {
    if (session?.user && (session.user as any).isAdmin) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch tiers
      const tiersRes = await fetch('/api/admin/store/tiers');
      if (tiersRes.ok) {
        const tiersData = await tiersRes.json();
        setTiers(tiersData);
      }

      // Fetch memberships
      const membershipsRes = await fetch('/api/admin/store/memberships');
      if (membershipsRes.ok) {
        const membershipsData = await membershipsRes.json();
        setMemberships(membershipsData);
      }
    } catch (error) {
      console.error('Error fetching admin store data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTier = async () => {
    try {
      const res = await fetch('/api/admin/store/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTier,
          featuresJson: JSON.stringify(newTier.features.filter(f => f.trim()))
        })
      });

      if (res.ok) {
        toast.success('Tier created successfully');
        setNewTier({ name: '', priceInINR: 0, priceInUSD: 0, description: '', features: [''] });
        fetchData();
      } else {
        toast.error('Failed to create tier');
      }
    } catch (error) {
      toast.error('Error creating tier');
    }
  };

  const handleGrantMembership = async (userId: string, tierId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/membership`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId, months: 1 })
      });

      if (res.ok) {
        toast.success('Membership granted successfully');
        fetchData();
      } else {
        toast.error('Failed to grant membership');
      }
    } catch (error) {
      toast.error('Error granting membership');
    }
  };

  const handleRevokeMembership = async (membershipId: string) => {
    try {
      const res = await fetch(`/api/admin/store/memberships/${membershipId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Membership revoked successfully');
        fetchData();
      } else {
        toast.error('Failed to revoke membership');
      }
    } catch (error) {
      toast.error('Error revoking membership');
    }
  };

  if (!session?.user || !(session.user as any).isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-purple-600" />
            Store Management
          </h1>
          <p className="text-muted-foreground">
            Manage membership tiers and user subscriptions
          </p>
        </div>

        <Tabs defaultValue="tiers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tiers">Membership Tiers</TabsTrigger>
            <TabsTrigger value="memberships">Active Memberships</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Membership Tiers Tab */}
          <TabsContent value="tiers" className="space-y-4">
            {/* Create New Tier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Tier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Tier Name (e.g., Byte)"
                    value={newTier.name}
                    onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Price in INR"
                    value={newTier.priceInINR || ''}
                    onChange={(e) => setNewTier({ ...newTier, priceInINR: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price in USD"
                    value={newTier.priceInUSD || ''}
                    onChange={(e) => setNewTier({ ...newTier, priceInUSD: Number(e.target.value) })}
                  />
                </div>
                
                <Textarea
                  placeholder="Description"
                  value={newTier.description}
                  onChange={(e) => setNewTier({ ...newTier, description: e.target.value })}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Features</label>
                  {newTier.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Feature ${index + 1}`}
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...newTier.features];
                          newFeatures[index] = e.target.value;
                          setNewTier({ ...newTier, features: newFeatures });
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newFeatures = newTier.features.filter((_, i) => i !== index);
                          setNewTier({ ...newTier, features: newFeatures });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewTier({ ...newTier, features: [...newTier.features, ''] })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>

                <Button onClick={handleCreateTier} disabled={!newTier.name.trim()}>
                  Create Tier
                </Button>
              </CardContent>
            </Card>

            {/* Existing Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <Card key={tier.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {tier.name}
                      <Badge variant={tier.name === 'Byte' ? 'default' : 'secondary'}>
                        {tier.name === 'Byte' && <Zap className="h-3 w-3 mr-1" />}
                        ₹{tier.priceInINR}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        ${tier.priceInUSD} USD
                      </p>
                      <div className="space-y-1">
                        {tier.features.map((feature, index) => (
                          <div key={index} className="text-sm flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Active Memberships Tab */}
          <TabsContent value="memberships" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Memberships ({memberships.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberships.map((membership) => (
                    <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                          {membership.user.displayName?.charAt(0) || membership.user.username.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{membership.user.displayName || membership.user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {membership.tier.name} • {membership.status}
                          </p>
                          {membership.expiresAt && (
                            <p className="text-xs text-muted-foreground">
                              Expires: {new Date(membership.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeMembership(membership.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                  
                  {memberships.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No active memberships found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{memberships.length}</div>
                  <p className="text-xs text-muted-foreground">Active subscriptions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Byte Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {memberships.filter(m => m.tier.name === 'Byte').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Premium subscribers</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Available Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tiers.length}</div>
                  <p className="text-xs text-muted-foreground">Membership options</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
