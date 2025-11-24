'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Edit,
  Settings,
  Calendar,
  Youtube,
  Instagram,
  MessageCircle,
  User,
  Crown,
  Palette
} from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string | null;
  banner: string | null;
  status: string;
  description: string | null;
  theme: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  profile: {
    subdomain: string | null;
    pageTitle: string | null;
    bio: string | null;
    bgType: string | null;
    bgValue: string | null;
    audioUrl: string | null;
    customAvatar: string | null;
    customBanner: string | null;
    youtubeUrl: string | null;
    instagramUrl: string | null;
    discordUrl: string | null;
    theme: string | null;
  } | null;
  currentDecoration: {
    id: string;
    name: string;
    imageUrl: string;
    rarity: string;
    isAnimated: boolean;
  } | null;
  stats: {
    blogPosts: number;
    decorations: number;
    uploads: number;
  };
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Safely open external URLs in a new tab
  function safeOpen(url?: string | null) {
    if (!url) return;
    try {
      const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://example.com');
      // Only allow http(s)
      if (u.protocol === 'http:' || u.protocol === 'https:') {
        window.open(u.toString(), '_blank', 'noopener');
      }
    } catch {
      // ignore invalid URLs
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/profile/${params.userId}`);
        
        if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
        } else {
          toast.error('Failed to load profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.userId) {
      fetchProfile();
    }
  }, [params.userId]);

  const isOwnProfile = (session?.user as any)?.id === profile?.id || session?.user?.email === profile?.email;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-40 bg-white/10 rounded" />
            <div className="h-48 bg-white/10 rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-white/10 rounded" />
                <div className="h-32 bg-white/10 rounded" />
              </div>
              <div className="space-y-4">
                <div className="h-40 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    );
  }

  const backgroundStyle = profile.profile?.bgType === 'color' 
    ? { backgroundColor: profile.profile.bgValue || '#1a1a1a' }
    : profile.profile?.bgType === 'gradient'
    ? { background: profile.profile.bgValue || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    : profile.profile?.bgType === 'image' && profile.profile.bgValue
    ? { backgroundImage: `url(${profile.profile.bgValue})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' };

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => router.push(`/dash/${params.userId}`)}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            {isOwnProfile && (
              <Button
                onClick={() => router.push(`/dash/${params.userId}/profile/edit`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Profile Header */}
          <Card className="bg-gray-800/50 border-gray-700 mb-8">
            <CardContent className="p-0">
              {/* Banner */}
              <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg overflow-hidden">
                {(profile.profile?.customBanner || profile.banner) && (
                  <img
                    src={profile.profile?.customBanner || profile.banner || ''}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/20" />
              </div>
              
              {/* Profile Info */}
              <div className="relative px-6 pb-6">
                {/* Avatar */}
                <div className="absolute -top-16 left-6">
                  <div className="relative">
                    <img
                      src={(profile.profile?.customAvatar || profile.avatar) || '/api/placeholder/120/120'}
                      alt={profile.displayName}
                      className="w-32 h-32 rounded-full border-4 border-gray-800 object-cover bg-gray-700"
                    />
                    {profile.currentDecoration && (
                      <div className="absolute -inset-2">
                        <img
                          src={profile.currentDecoration.imageUrl}
                          alt="Decoration"
                          className={`w-36 h-36 object-cover ${profile.currentDecoration.isAnimated ? 'animate-pulse' : ''}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Profile Details */}
                <div className="pt-20">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{profile.displayName}</h1>
                    {profile.isAdmin && (
                      <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    <Badge className={`${
                      profile.status === 'online' ? 'bg-green-600/20 text-green-400 border-green-500/30' :
                      profile.status === 'away' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30' :
                      profile.status === 'busy' ? 'bg-red-600/20 text-red-400 border-red-500/30' :
                      'bg-gray-600/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {profile.status}
                    </Badge>
                  </div>
                  
                  <div className="text-gray-400 mb-4">@{profile.username}</div>
                  
                  {(profile.description || profile.profile?.bio) && (
                    <p className="text-gray-300 mb-4 max-w-2xl">
                      {profile.profile?.bio || profile.description}
                    </p>
                  )}
                  
                  {/* Social Links */}
                  <div className="flex gap-3 mb-4">
                    {profile.profile?.youtubeUrl && (
                      <Button
                        onClick={() => safeOpen(profile.profile?.youtubeUrl!)}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                      >
                        <Youtube className="h-4 w-4 mr-2" />
                        YouTube
                      </Button>
                    )}
                    {profile.profile?.instagramUrl && (
                      <Button
                        onClick={() => safeOpen(profile.profile?.instagramUrl!)}
                        variant="outline"
                        size="sm"
                        className="border-pink-600 text-pink-400 hover:bg-pink-600/20"
                      >
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </Button>
                    )}
                    {profile.profile?.discordUrl && (
                      <Button
                        onClick={() => safeOpen(profile.profile?.discordUrl!)}
                        variant="outline"
                        size="sm"
                        className="border-indigo-600 text-indigo-400 hover:bg-indigo-600/20"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Discord
                      </Button>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{profile.stats.blogPosts}</div>
                      <div className="text-sm text-gray-400">Blog Posts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{profile.stats.decorations}</div>
                      <div className="text-sm text-gray-400">Decorations</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{profile.stats.uploads}</div>
                      <div className="text-sm text-gray-400">Uploads</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {new Date(profile.createdAt).getFullYear()}
                      </div>
                      <div className="text-sm text-gray-400">Joined</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Blog Posts */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Recent Blog Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-400 text-center py-8">
                    Blog posts will appear here when implemented
                  </div>
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-400 text-center py-8">
                    Activity feed will appear here when implemented
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Details */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Member Since</div>
                    <div className="text-white">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Theme</div>
                    <div className="text-white capitalize">{profile.theme}</div>
                  </div>
                  
                  {profile.currentDecoration && (
                    <>
                      <Separator className="bg-gray-700" />
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Current Decoration</div>
                        <div className="flex items-center gap-2">
                          <img
                            src={profile.currentDecoration.imageUrl}
                            alt={profile.currentDecoration.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <div>
                            <div className="text-white text-sm">{profile.currentDecoration.name}</div>
                            <Badge className={`text-xs ${
                              profile.currentDecoration.rarity === 'legendary' ? 'bg-yellow-600/20 text-yellow-400' :
                              profile.currentDecoration.rarity === 'epic' ? 'bg-purple-600/20 text-purple-400' :
                              profile.currentDecoration.rarity === 'rare' ? 'bg-blue-600/20 text-blue-400' :
                              'bg-gray-600/20 text-gray-400'
                            }`}>
                              {profile.currentDecoration.rarity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              {isOwnProfile && (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => router.push(`/dash/${params.userId}/profile/edit`)}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      onClick={() => router.push(`/dash/${params.userId}/blog`)}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      My Blog Posts
                    </Button>
                    <Button
                      onClick={() => toast.info('Decoration shop coming soon!')}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-400 hover:text-white"
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Decorations
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
