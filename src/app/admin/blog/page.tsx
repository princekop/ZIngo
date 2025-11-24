'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/RichTextEditor';
import GradientCustomizer from '@/components/GradientCustomizer';
import BlogCardCustomizer from '@/components/BlogCardCustomizer';
import AIContentGenerator from '@/components/AIContentGenerator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  User,
  FileText,
  BarChart3,
  Settings,
  Search,
  Filter,
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  Star,
  Palette,
  Save,
  Bot
} from 'lucide-react';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
}

interface BlogStats {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  publishedPosts: number;
  draftPosts: number;
}

export default function AdminBlogPage() {
  const { data: session } = useSession();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogStats, setBlogStats] = useState<BlogStats>({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    publishedPosts: 0,
    draftPosts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featured: false,
    status: 'draft' as 'draft' | 'published' | 'archived',
    cardStyle: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#374151',
      shadowIntensity: 20,
      shadowColor: '#000000',
      titleColor: '#ffffff',
      textColor: '#d1d5db',
      accentColor: '#3b82f6',
      hoverEffect: 'scale',
      animation: 'fadeIn',
      opacity: 95
    }
  });

  const categories = ['Technology', 'Guides', 'Psychology', 'Features', 'Security', 'Community', 'Updates'];

  // Fetch blog data from API
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch blog posts
        const postsResponse = await fetch('/api/blog/posts?status=all');
        const posts = postsResponse.ok ? await postsResponse.json() : [];
        
        // Calculate stats from fetched posts
        const stats: BlogStats = {
          totalPosts: posts.length,
          totalViews: posts.reduce((sum: number, post: any) => sum + (post.views || 0), 0),
          totalLikes: posts.reduce((sum: number, post: any) => sum + (post.likes || 0), 0),
          totalComments: posts.reduce((sum: number, post: any) => sum + (post.comments || 0), 0),
          publishedPosts: posts.filter((post: any) => post.status === 'PUBLISHED').length,
          draftPosts: posts.filter((post: any) => post.status === 'DRAFT').length
        };

        // Transform API data to match our interface
        const transformedPosts: BlogPost[] = posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || '',
          content: post.content,
          author: {
            name: post.author?.name || post.author?.displayName || 'Unknown Author',
            avatar: post.author?.avatar || '/api/placeholder/40/40'
          },
          publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          readTime: post.readTime || 5,
          category: typeof post.category === 'string' 
            ? post.category 
            : (typeof post.category === 'object' && post.category?.name) 
              ? post.category.name 
              : 'Uncategorized',
          tags: Array.isArray(post.tags) 
            ? post.tags.map((tag: any) => typeof tag === 'string' ? tag : (tag?.name || String(tag))) 
            : [],
          likes: post.likes || 0,
          comments: post.comments || 0,
          views: post.views || 0,
          featured: post.featured || false,
          status: post.status?.toLowerCase() || 'draft'
        }));

        setBlogPosts(transformedPosts);
        setBlogStats(stats);
      } catch (error) {
        console.error('Error fetching blog data:', error);
        // Set empty data on error
        setBlogPosts([]);
        setBlogStats({
          totalPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          publishedPosts: 0,
          draftPosts: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePost = async () => {
    try {
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()),
          featured: formData.featured,
          status: formData.status.toUpperCase(),
          cardStyle: formData.cardStyle
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create blog post');
      }

      const newPost = await response.json();
      
      // Transform the response to match our interface
      const transformedPost: BlogPost = {
        id: newPost.id,
        title: newPost.title,
        excerpt: newPost.excerpt || '',
        content: newPost.content,
        author: {
          name: newPost.author?.displayName || 'Admin',
          avatar: newPost.author?.avatar || '/api/placeholder/40/40'
        },
        publishedAt: newPost.publishedAt ? new Date(newPost.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        readTime: newPost.readTime || 5,
        category: newPost.category || 'Uncategorized',
        tags: newPost.tags || [],
        likes: newPost.likes || 0,
        comments: newPost.comments || 0,
        views: newPost.views || 0,
        featured: newPost.featured || false,
        status: newPost.status?.toLowerCase() || 'draft'
      };

      setBlogPosts(prev => [...prev, newPost]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Blog post created successfully!');
      // Refresh the blog posts list to ensure we have the latest data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error('Failed to create blog post. Please try again.');
    }
  };

  const handleEditPost = async () => {
    if (!editingPost) return;

    try {
      const response = await fetch(`/api/blog/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()),
          featured: formData.featured,
          status: formData.status.toUpperCase(),
          cardStyle: formData.cardStyle
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update blog post');
      }

      const updatedPost = await response.json();
      
      // Transform the response and update local state
      const transformedPost: BlogPost = {
        id: updatedPost.id,
        title: updatedPost.title,
        excerpt: updatedPost.excerpt || '',
        content: updatedPost.content,
        author: {
          name: updatedPost.author?.displayName || editingPost.author.name,
          avatar: updatedPost.author?.avatar || editingPost.author.avatar
        },
        publishedAt: updatedPost.publishedAt ? new Date(updatedPost.publishedAt).toISOString().split('T')[0] : editingPost.publishedAt,
        readTime: updatedPost.readTime || editingPost.readTime,
        category: updatedPost.category || formData.category,
        tags: updatedPost.tags || formData.tags.split(',').map(tag => tag.trim()),
        likes: updatedPost.likes || editingPost.likes,
        comments: updatedPost.comments || editingPost.comments,
        views: updatedPost.views || editingPost.views,
        featured: updatedPost.featured || formData.featured,
        status: updatedPost.status?.toLowerCase() || formData.status
      };

      const updatedPosts = blogPosts.map(post =>
        post.id === editingPost.id ? transformedPost : post
      );

      setBlogPosts(updatedPosts);
      setIsEditDialogOpen(false);
      setEditingPost(null);
      resetForm();
      toast.success('Blog post updated successfully!');
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error('Failed to update blog post. Please try again.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }

      setBlogPosts(blogPosts.filter(post => post.id !== postId));
      toast.success('Blog post deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post. Please try again.');
    }
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category || '',
      tags: post.tags.join(', '),
      featured: post.featured,
      status: post.status,
      cardStyle: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#374151',
        shadowIntensity: 20,
        shadowColor: '#000000',
        titleColor: '#ffffff',
        textColor: '#d1d5db',
        accentColor: '#3b82f6',
        hoverEffect: 'scale',
        animation: 'fadeIn',
        opacity: 95
      }
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      tags: '',
      featured: false,
      status: 'draft',
      cardStyle: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#374151',
        shadowIntensity: 20,
        shadowColor: '#000000',
        titleColor: '#ffffff',
        textColor: '#d1d5db',
        accentColor: '#3b82f6',
        hoverEffect: 'scale',
        animation: 'fadeIn',
        opacity: 95
      }
    });
  };

  const handleAIContentGenerated = (generatedContent: {
    title: string;
    excerpt: string;
    content: string;
    cardStyle: any;
    tags: string[];
    category: string;
  }) => {
    setFormData({
      ...formData,
      title: generatedContent.title,
      excerpt: generatedContent.excerpt,
      content: generatedContent.content,
      category: generatedContent.category,
      tags: generatedContent.tags.join(', '),
      cardStyle: generatedContent.cardStyle
    });
    
    // Automatically open the create dialog to show the generated content
    setIsCreateDialogOpen(true);
    toast.success('AI content applied! Create dialog opened with generated content.');
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You need to be logged in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Blog Management</h1>
            <p className="text-gray-400">Manage your blog posts, analytics, and content</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsAIGeneratorOpen(true)} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Generator
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="posts" className="data-[state=active]:bg-blue-600">
              <FileText className="h-4 w-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="customizer" className="data-[state=active]:bg-blue-600">
              <Palette className="h-4 w-4 mr-2" />
              Card Designer
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Posts</p>
                      <p className="text-2xl font-bold text-white">{blogStats.totalPosts}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Views</p>
                      <p className="text-2xl font-bold text-white">{blogStats.totalViews.toLocaleString()}</p>
                    </div>
                    <Eye className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Published</p>
                      <p className="text-2xl font-bold text-white">{blogStats.publishedPosts}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Drafts</p>
                      <p className="text-2xl font-bold text-white">{blogStats.draftPosts}</p>
                    </div>
                    <Edit className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            className={`${
                              post.status === 'published' 
                                ? 'bg-green-600/20 text-green-400 border-green-500/30'
                                : post.status === 'draft'
                                ? 'bg-orange-600/20 text-orange-400 border-orange-500/30'
                                : 'bg-gray-600/20 text-gray-400 border-gray-500/30'
                            }`}
                          >
                            {post.status}
                          </Badge>
                          <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                            {post.category || 'Uncategorized'}
                          </Badge>
                          {post.featured && (
                            <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                        <p className="text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {post.author.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.views}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(post)}
                          className="border-gray-600 text-gray-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePost(post.id)}
                          className="border-red-600 text-red-400 hover:text-red-300 hover:border-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Blog Analytics</CardTitle>
                <CardDescription>Overview of your blog performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-700/30 rounded-lg">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{blogStats.totalViews.toLocaleString()}</div>
                    <div className="text-gray-400">Total Views</div>
                  </div>
                  <div className="text-center p-6 bg-gray-700/30 rounded-lg">
                    <div className="text-3xl font-bold text-green-400 mb-2">{blogStats.totalLikes}</div>
                    <div className="text-gray-400">Total Likes</div>
                  </div>
                  <div className="text-center p-6 bg-gray-700/30 rounded-lg">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{blogStats.totalComments}</div>
                    <div className="text-gray-400">Total Comments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customizer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Blog Card Customizer */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="h-5 w-5 text-blue-400" />
                    Blog Card Designer
                  </CardTitle>
                  <CardDescription>
                    Create stunning, customized blog cards with gradients, animations, and effects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BlogCardCustomizer
                    value={formData.cardStyle}
                    onChange={(cardStyle) => setFormData({ ...formData, cardStyle })}
                  />
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Design Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
                      <h4 className="text-blue-400 font-medium mb-1">🎨 Color Harmony</h4>
                      <p className="text-gray-300 text-sm">Use complementary colors for better visual appeal. Try gradients with 2-3 colors max.</p>
                    </div>
                    
                    <div className="p-3 bg-green-600/10 border border-green-500/30 rounded-lg">
                      <h4 className="text-green-400 font-medium mb-1">✨ Subtle Effects</h4>
                      <p className="text-gray-300 text-sm">Keep hover effects subtle for better user experience. Scale and lift work great together.</p>
                    </div>
                    
                    <div className="p-3 bg-purple-600/10 border border-purple-500/30 rounded-lg">
                      <h4 className="text-purple-400 font-medium mb-1">🔤 Typography</h4>
                      <p className="text-gray-300 text-sm">Ensure good contrast between text and background. Use accent colors for highlights.</p>
                    </div>
                    
                    <div className="p-3 bg-orange-600/10 border border-orange-500/30 rounded-lg">
                      <h4 className="text-orange-400 font-medium mb-1">📱 Responsive</h4>
                      <p className="text-gray-300 text-sm">Test your designs on different screen sizes. Keep shadows moderate for mobile.</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-white font-medium mb-2">Popular Combinations:</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div>• Ocean Blue + Scale hover + Fade animation</div>
                      <div>• Sunset gradient + Glow effect + Slide animation</div>
                      <div>• Galaxy colors + Lift hover + Zoom animation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Blog Settings</CardTitle>
                <CardDescription>Configure your blog preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Blog settings will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Post Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto dialog-content">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new blog post.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="col-span-3 bg-gray-700 border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="excerpt" className="text-right">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="col-span-3 bg-gray-700 border-gray-600"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right mt-2">Content</Label>
                <div className="col-span-3">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="Write your blog post content here..."
                    className="min-h-96"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Comma separated tags"
                  className="col-span-3 bg-gray-700 border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Post Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto dialog-content">
            <DialogHeader>
              <DialogTitle>Edit Blog Post</DialogTitle>
              <DialogDescription>
                Update the blog post details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="col-span-3 bg-gray-700 border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-excerpt" className="text-right">Excerpt</Label>
                <Textarea
                  id="edit-excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="col-span-3 bg-gray-700 border-gray-600"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-content" className="text-right mt-2">Content</Label>
                <div className="col-span-3">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="Write your blog post content here..."
                    className="min-h-96"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-tags" className="text-right">Tags</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Comma separated tags"
                  className="col-span-3 bg-gray-700 border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditPost} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Update Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Content Generator */}
        <AIContentGenerator
          isOpen={isAIGeneratorOpen}
          onClose={() => setIsAIGeneratorOpen(false)}
          onContentGenerated={handleAIContentGenerated}
        />
      </div>
      
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-blue-600 {
          scrollbar-color: #2563eb #1f2937;
        }
        
        .scrollbar-track-gray-800 {
          scrollbar-color: #2563eb #1f2937;
        }
        
        /* Webkit scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 12px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 6px;
          transition: all 0.3s ease;
          border: 2px solid #1f2937;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          box-shadow: 0 0 15px rgba(37, 99, 235, 0.5);
        }
        
        @media (max-width: 768px) {
          .scrollbar-thin::-webkit-scrollbar {
            width: 8px;
          }
        }
        
        /* Dialog scrollbar */
        .dialog-content {
          scrollbar-width: thin;
          scrollbar-color: #2563eb #374151;
        }
        
        .dialog-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .dialog-content::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        
        .dialog-content::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        .dialog-content::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }
      `}</style>
    </div>
  );
}
