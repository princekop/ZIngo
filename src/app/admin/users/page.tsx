'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  Shield,
  Ban,
  UserCheck,
  Mail,
  Calendar,
  Crown
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  status: 'active' | 'banned' | 'inactive';
  joinedAt: string;
  lastActive: string;
  serverCount: number;
  membershipTier?: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const usersData = await response.json();
          setUsers(usersData);
        } else {
          console.error('Failed to fetch users');
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">Manage users, permissions, and account status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Admins</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.isAdmin).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Banned</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.status === 'banned').length}
                </p>
              </div>
              <Ban className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{user.displayName}</h3>
                      {user.isAdmin && (
                        <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {user.membershipTier && (
                        <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">
                          <Crown className="h-3 w-3 mr-1" />
                          {user.membershipTier}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge 
                      className={`${
                        user.status === 'active' 
                          ? 'bg-green-600/20 text-green-400 border-green-500/30'
                          : user.status === 'banned'
                          ? 'bg-red-600/20 text-red-400 border-red-500/30'
                          : 'bg-gray-600/20 text-gray-400 border-gray-500/30'
                      }`}
                    >
                      {user.status}
                    </Badge>
                    <p className="text-gray-500 text-xs mt-1">
                      {user.serverCount} servers
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
