'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BoostManager } from '@/components/BoostManager';

export default function ServerSettingsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const serverId = params.serverId as string;

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Server Settings</h1>
          <p className="text-muted-foreground">
            Manage your server settings and boosts
          </p>
        </div>

        <Tabs defaultValue="boosts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="boosts">Boosts</TabsTrigger>
            <TabsTrigger value="settings" disabled>Settings</TabsTrigger>
            <TabsTrigger value="members" disabled>Members</TabsTrigger>
          </TabsList>
          
          <TabsContent value="boosts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Server Boosts</CardTitle>
                <CardDescription>
                  Apply your boosts to this server to unlock special perks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BoostManager 
                  serverId={serverId} 
                  onBoostChange={() => {
                    // Refresh server data when boosts change
                    window.dispatchEvent(new CustomEvent('server:refresh'));
                  }} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Server Settings</CardTitle>
                <CardDescription>
                  Configure your server settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Server Members</CardTitle>
                <CardDescription>
                  Manage your server members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
