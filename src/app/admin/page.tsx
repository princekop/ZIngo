'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Server, 
  FileText, 
  ShoppingBag,
  TrendingUp,
  Activity,
  DollarSign,
  Eye,
  MessageSquare,
  Heart,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    admins: number;
  };
  servers: {
    total: number;
    active: number;
    newToday: number;
    totalMembers: number;
  };
  blog: {
    totalPosts: number;
    published: number;
    drafts: number;
    totalViews: number;
    totalLikes: number;
  };
  store: {
    totalProducts: number;
    totalOrders: number;
    revenue: number;
    activeMembers: number;
  };
  system: {
    uptime: string;
    version: string;
    lastBackup: string;
    alerts: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user' | 'server' | 'blog' | 'store' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch real-time data from multiple APIs
        const [usersRes, serversRes, blogRes, storeRes, activityRes] = await Promise.all([
          fetch('/api/admin/users/stats'),
          fetch('/api/admin/servers/stats'),
          fetch('/api/admin/blog/stats'),
          fetch('/api/admin/store/stats'),
          fetch('/api/admin/activity/recent')
        ]);

        const [usersData, serversData, blogData, storeData, activityData] = await Promise.all([
          usersRes.ok ? usersRes.json() : { total: 0, active: 0, newToday: 0, admins: 0 },
          serversRes.ok ? serversRes.json() : { total: 0, active: 0, newToday: 0, totalMembers: 0 },
          blogRes.ok ? blogRes.json() : { totalPosts: 0, published: 0, drafts: 0, totalViews: 0, totalLikes: 0 },
          storeRes.ok ? storeRes.json() : { totalProducts: 0, totalOrders: 0, revenue: 0, activeMembers: 0 },
          activityRes.ok ? activityRes.json() : []
        ]);

        // Calculate growth percentages (would come from API in real implementation)
        const stats: DashboardStats = {
          users: usersData,
          servers: serversData,
          blog: blogData,
          store: storeData,
          system: {
            uptime: '99.9%', // Would come from system monitoring API
            version: '2.1.4', // Would come from version API
            lastBackup: '2 hours ago', // Would come from backup API
            alerts: 3 // Would come from alerts API
          }
        };

        setStats(stats);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty data on error
        setStats({
          users: { total: 0, active: 0, newToday: 0, admins: 0 },
          servers: { total: 0, active: 0, newToday: 0, totalMembers: 0 },
          blog: { totalPosts: 0, published: 0, drafts: 0, totalViews: 0, totalLikes: 0 },
          store: { totalProducts: 0, totalOrders: 0, revenue: 0, activeMembers: 0 },
          system: { uptime: 'N/A', version: 'N/A', lastBackup: 'N/A', alerts: 0 }
        });
        setRecentActivity([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'server': return Server;
      case 'blog': return FileText;
      case 'store': return ShoppingBag;
      case 'system': return Activity;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's what's happening with DarkByte.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Stats */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.users.total.toLocaleString()}</p>
                <p className="text-green-400 text-sm">+{stats.users.newToday} today</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Servers Stats */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Servers</p>
                <p className="text-2xl font-bold text-white">{stats.servers.total.toLocaleString()}</p>
                <p className="text-green-400 text-sm">+{stats.servers.newToday} today</p>
              </div>
              <Server className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        {/* Blog Stats */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Blog Posts</p>
                <p className="text-2xl font-bold text-white">{stats.blog.totalPosts}</p>
                <p className="text-blue-400 text-sm">{stats.blog.drafts} drafts</p>
              </div>
              <FileText className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        {/* Revenue Stats */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-white">₹{stats.store.revenue.toLocaleString()}</p>
                <p className="text-green-400 text-sm">{stats.store.totalOrders} orders</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Uptime</span>
              <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                {stats.system.uptime}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Version</span>
              <span className="text-white">{stats.system.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Last Backup</span>
              <span className="text-white">{stats.system.lastBackup}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Active Alerts</span>
              <Badge className={`${stats.system.alerts > 0 ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30' : 'bg-green-600/20 text-green-400 border-green-500/30'}`}>
                {stats.system.alerts}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/blog">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                Manage Blog Posts
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/store">
              <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Manage Store
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription>Latest events and actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-700/30">
                  <Icon className={`h-5 w-5 mt-0.5 ${getStatusColor(activity.status)}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{activity.title}</h4>
                      <span className="text-sm text-gray-400">{activity.timestamp}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <Eye className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.blog.totalViews.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Blog Views</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <Heart className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.blog.totalLikes.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Blog Likes</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.servers.totalMembers.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Server Members</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
