'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Users,
  Settings,
  BarChart3,
  Shield,
  Database,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Home
} from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    title: 'Blog Management',
    href: '/admin/blog',
    icon: FileText,
    description: 'Manage blog posts and content'
  },
  {
    title: 'Store Management',
    href: '/admin/store',
    icon: ShoppingBag,
    description: 'Manage products and orders'
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users and permissions'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'View detailed analytics'
  },
  {
    title: 'Security',
    href: '/admin/security',
    icon: Shield,
    description: 'Security settings and logs'
  },
  {
    title: 'Database',
    href: '/admin/database',
    icon: Database,
    description: 'Database management'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration'
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(3); // Mock notifications count

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=/admin');
      return;
    }

    // Check if user is admin
    const user = session.user as any;
    if (!user?.isAdmin) {
      router.push('/dash');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user as any;
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">You don't have admin privileges to access this area.</p>
          <Button onClick={() => router.push('/dash')} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-800/95 backdrop-blur-sm border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-gray-400">DarkByte Management</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-400">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar || '/api/placeholder/40/40'} />
              <AvatarFallback className="bg-blue-600 text-white">
                {user.displayName?.charAt(0) || user.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">
                {user.displayName || user.name}
              </div>
              <div className="text-sm text-gray-400 truncate">Administrator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <Home className="h-4 w-4" />
                <span>/</span>
                <span>Admin</span>
                {pathname !== '/admin' && (
                  <>
                    <span>/</span>
                    <span className="text-white capitalize">
                      {pathname.split('/').pop()?.replace('-', ' ')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg border border-gray-600">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none w-48"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative text-gray-400 hover:text-white">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || '/api/placeholder/32/32'} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {user.displayName?.charAt(0) || user.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/api/auth/signout')}
                  className="text-gray-400 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
