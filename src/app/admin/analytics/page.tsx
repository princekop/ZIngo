'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Server,
  Eye,
  Heart,
  MessageSquare,
  ShoppingBag,
  DollarSign,
  Activity,
  Calendar,
  Download
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalServers: number;
    totalRevenue: number;
    blogViews: number;
    blogPosts: number;
  };
  growth: {
    usersGrowth: number;
    serversGrowth: number;
    revenueGrowth: number;
    engagementGrowth: number;
  };
  topContent: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    type: 'blog' | 'store';
  }>;
  userActivity: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
    revenue: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
        if (response.ok) {
          const analyticsData = await response.json();
          setAnalytics(analyticsData);
        } else {
          console.error('Failed to fetch analytics');
          // Set empty data on error
          setAnalytics({
            overview: {
              totalUsers: 0,
              activeUsers: 0,
              totalServers: 0,
              totalRevenue: 0,
              blogViews: 0,
              blogPosts: 0
            },
            growth: {
              usersGrowth: 0,
              serversGrowth: 0,
              revenueGrowth: 0,
              engagementGrowth: 0
            },
            topContent: [],
            userActivity: []
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalytics({
          overview: {
            totalUsers: 0,
            activeUsers: 0,
            totalServers: 0,
            totalRevenue: 0,
            blogViews: 0,
            blogPosts: 0
          },
          growth: {
            usersGrowth: 0,
            serversGrowth: 0,
            revenueGrowth: 0,
            engagementGrowth: 0
          },
          topContent: [],
          userActivity: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
    
    // Set up real-time updates every 60 seconds for analytics
    const interval = setInterval(fetchAnalytics, 60000);
    
    return () => clearInterval(interval);
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{analytics.overview.totalUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">+{analytics.growth.usersGrowth}%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">{analytics.overview.activeUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">+{analytics.growth.engagementGrowth}%</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Servers</p>
                <p className="text-2xl font-bold text-white">{analytics.overview.totalServers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">+{analytics.growth.serversGrowth}%</span>
                </div>
              </div>
              <Server className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">₹{analytics.overview.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">+{analytics.growth.revenueGrowth}%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Blog Views</p>
                <p className="text-2xl font-bold text-white">{analytics.overview.blogViews.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">{analytics.overview.blogPosts} posts</p>
              </div>
              <Eye className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Engagement Rate</p>
                <p className="text-2xl font-bold text-white">68.4%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">+5.2%</span>
                </div>
              </div>
              <Heart className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              User Activity Trends
            </CardTitle>
            <CardDescription>Daily active users and new registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Chart visualization would be implemented here</p>
                <p className="text-sm">Using libraries like Chart.js or Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-400" />
              Revenue Analytics
            </CardTitle>
            <CardDescription>Daily revenue and growth trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Revenue chart would be implemented here</p>
                <p className="text-sm">Showing daily/weekly/monthly revenue trends</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Content */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top Performing Content</CardTitle>
          <CardDescription>Most viewed and engaged content across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topContent.map((content, index) => (
              <div key={content.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{content.title}</h3>
                    <Badge className={`${
                      content.type === 'blog' 
                        ? 'bg-green-600/20 text-green-400 border-green-500/30'
                        : 'bg-purple-600/20 text-purple-400 border-purple-500/30'
                    }`}>
                      {content.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {content.views.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {content.likes.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Daily Activity Summary</CardTitle>
          <CardDescription>Recent daily performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.userActivity.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">{new Date(day.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-400">Daily Summary</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-white font-medium">{day.activeUsers.toLocaleString()}</p>
                    <p className="text-gray-400">Active Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-400 font-medium">+{day.newUsers}</p>
                    <p className="text-gray-400">New Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-400 font-medium">₹{day.revenue.toLocaleString()}</p>
                    <p className="text-gray-400">Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
