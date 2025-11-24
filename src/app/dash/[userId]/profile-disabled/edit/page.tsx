'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Upload,
  User, 
  Settings,
  Palette,
  Image,
  Music,
  Link,
  Save,
  X
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
  currentDecoration: any;
  stats: {
    blogPosts: number;
    decorations: number;
    uploads: number;
  };
}

export default function ProfileEditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Form data
  const [formData, setFormData] = useState({
    displayName: '',
    description: '',
    status: 'online',
    theme: 'default',
    avatar: '',
    banner: '',
    profile: {
      pageTitle: '',
      bio: '',
      bgType: 'color',
      bgValue: '#1a1a1a',
      audioUrl: '',
      customAvatar: '',
      customBanner: '',
      youtubeUrl: '',
      instagramUrl: '',
      discordUrl: '',
      theme: 'default'
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/profile/${params.userId}`);
        
        if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
          
          // Populate form data
          setFormData({
            displayName: profileData.displayName || '',
            description: profileData.description || '',
            status: profileData.status || 'online',
            theme: profileData.theme || 'default',
            avatar: profileData.avatar || '',
            banner: profileData.banner || '',
            profile: {
              pageTitle: profileData.profile?.pageTitle || '',
              bio: profileData.profile?.bio || '',
              bgType: profileData.profile?.bgType || 'color',
              bgValue: profileData.profile?.bgValue || '#1a1a1a',
              audioUrl: profileData.profile?.audioUrl || '',
              customAvatar: profileData.profile?.customAvatar || '',
              customBanner: profileData.profile?.customBanner || '',
              youtubeUrl: profileData.profile?.youtubeUrl || '',
              instagramUrl: profileData.profile?.instagramUrl || '',
              discordUrl: profileData.profile?.discordUrl || '',
              theme: profileData.profile?.theme || 'default'
            }
          });
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

  const handleFileUpload = async (file: File, type: 'avatar' | 'banner' | 'customAvatar' | 'customBanner') => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      if (response.ok) {
        const result = await response.json();
        
        if (type === 'avatar' || type === 'banner') {
          setFormData(prev => ({
            ...prev,
            [type]: result.url
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              [type]: result.url
            }
          }));
        }
        
        toast.success('File uploaded successfully');
      } else {
        toast.error('Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/profile/${params.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        router.push(`/dash/${params.userId}/profile`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push(`/dash/${params.userId}/profile`)}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'basic', label: 'Basic Info', icon: User },
          { id: 'appearance', label: 'Appearance', icon: Palette },
          { id: 'profile', label: 'Profile Page', icon: Settings },
          { id: 'social', label: 'Social Links', icon: Link }
        ].map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            className={`${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'border-gray-600 text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="status" className="text-gray-300">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="away">Away</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="invisible">Invisible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-gray-300">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={3}
                      placeholder="Tell others about yourself..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Appearance Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Avatar Upload */}
                    <div>
                      <Label className="text-gray-300">Avatar</Label>
                      <div className="mt-2 flex items-center gap-4">
                        {formData.avatar && (
                          <img
                            src={formData.avatar}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <Button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileUpload(file, 'avatar');
                            };
                            input.click();
                          }}
                          variant="outline"
                          className="border-gray-600 text-gray-400 hover:text-white"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Avatar
                        </Button>
                      </div>
                    </div>

                    {/* Banner Upload */}
                    <div>
                      <Label className="text-gray-300">Banner</Label>
                      <div className="mt-2">
                        {formData.banner && (
                          <div className="mb-2">
                            <img
                              src={formData.banner}
                              alt="Banner"
                              className="w-full h-24 rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <Button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileUpload(file, 'banner');
                            };
                            input.click();
                          }}
                          variant="outline"
                          className="border-gray-600 text-gray-400 hover:text-white"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Banner
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="theme" className="text-gray-300">Theme</Label>
                    <Select value={formData.theme} onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Profile Page Settings</h2>
                  
                  <div>
                    <Label htmlFor="pageTitle" className="text-gray-300">Page Title</Label>
                    <Input
                      id="pageTitle"
                      value={formData.profile.pageTitle}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        profile: { ...prev.profile, pageTitle: e.target.value }
                      }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="My Awesome Profile"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.profile.bio}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        profile: { ...prev.profile, bio: e.target.value }
                      }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={4}
                      placeholder="Write your bio here..."
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Background</Label>
                    <div className="mt-2 space-y-4">
                      <Select 
                        value={formData.profile.bgType} 
                        onValueChange={(value) => setFormData(prev => ({
                          ...prev,
                          profile: { ...prev.profile, bgType: value }
                        }))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="color">Solid Color</SelectItem>
                          <SelectItem value="gradient">Gradient</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>

                      {formData.profile.bgType === 'color' && (
                        <Input
                          type="color"
                          value={formData.profile.bgValue}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            profile: { ...prev.profile, bgValue: e.target.value }
                          }))}
                          className="bg-gray-700 border-gray-600 h-12"
                        />
                      )}

                      {formData.profile.bgType === 'gradient' && (
                        <Input
                          value={formData.profile.bgValue}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            profile: { ...prev.profile, bgValue: e.target.value }
                          }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Social Links</h2>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="youtubeUrl" className="text-gray-300">YouTube</Label>
                      <Input
                        id="youtubeUrl"
                        value={formData.profile.youtubeUrl}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          profile: { ...prev.profile, youtubeUrl: e.target.value }
                        }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="https://youtube.com/@username"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="instagramUrl" className="text-gray-300">Instagram</Label>
                      <Input
                        id="instagramUrl"
                        value={formData.profile.instagramUrl}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          profile: { ...prev.profile, instagramUrl: e.target.value }
                        }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="discordUrl" className="text-gray-300">Discord</Label>
                      <Input
                        id="discordUrl"
                        value={formData.profile.discordUrl}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          profile: { ...prev.profile, discordUrl: e.target.value }
                        }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="https://discord.gg/invite"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800/50 border-gray-700 sticky top-6">
            <CardHeader>
              <CardTitle className="text-white">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Avatar Preview */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={formData.avatar || '/api/placeholder/60/60'}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {profile.currentDecoration && (
                      <div className="absolute -inset-1">
                        <img
                          src={profile.currentDecoration.imageUrl}
                          alt="Decoration"
                          className="w-14 h-14 object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{formData.displayName || profile.username}</div>
                    <div className="text-sm text-gray-400">{formData.status}</div>
                  </div>
                </div>

                {/* Banner Preview */}
                {formData.banner && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={formData.banner}
                      alt="Banner"
                      className="w-full h-24 object-cover"
                    />
                  </div>
                )}

                {/* Description Preview */}
                {formData.description && (
                  <div>
                    <div className="text-sm font-medium text-gray-300 mb-1">Description</div>
                    <div className="text-sm text-gray-400">{formData.description}</div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">{profile.stats.blogPosts}</div>
                    <div className="text-xs text-gray-400">Posts</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{profile.stats.decorations}</div>
                    <div className="text-xs text-gray-400">Decorations</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{profile.stats.uploads}</div>
                    <div className="text-xs text-gray-400">Uploads</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
