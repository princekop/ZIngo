'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  User, 
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  featured: boolean;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Function to clean and format content
  const cleanContent = (content: string): string => {
    // Remove JSON formatting if present
    let cleaned = content;
    
    // Check if content contains JSON-like structure
    if (cleaned.includes('"title":') || cleaned.includes('"content":')) {
      // Try to extract just the HTML content from JSON
      try {
        // Look for content between quotes after "content":
        const contentMatch = cleaned.match(/"content":\s*"([^"]*(?:\\.[^"]*)*)"/);
        if (contentMatch) {
          cleaned = contentMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
        }
      } catch (e) {
        // If JSON parsing fails, clean up manually
        cleaned = cleaned
          .replace(/^\s*{\s*/, '') // Remove opening brace
          .replace(/\s*}\s*$/, '') // Remove closing brace
          .replace(/"[^"]*":\s*"/g, '') // Remove JSON keys
          .replace(/",\s*/g, '') // Remove JSON separators
          .replace(/\\"/g, '"') // Unescape quotes
          .replace(/\\n/g, '\n'); // Unescape newlines
      }
    }
    
    // Ensure proper HTML structure
    if (!cleaned.includes('<p>') && !cleaned.includes('<div>') && !cleaned.includes('<h')) {
      // Convert plain text to HTML paragraphs
      cleaned = cleaned
        .split('\n\n')
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => `<p>${paragraph}</p>`)
        .join('\n');
    }
    
    return cleaned;
  };

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/blog/posts/${params.postId}`);
        
        if (response.ok) {
          const post = await response.json();
          
          // Transform API data to match our interface
          const transformedPost: BlogPost = {
            id: post.id,
            title: post.title,
            content: post.content,
            author: {
              name: post.author?.displayName || post.author?.name || 'Unknown Author',
              avatar: post.author?.avatar || '/api/placeholder/60/60',
              bio: 'Community member at DarkByte'
            },
            publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            readTime: post.readTime || 5,
            category: post.category || 'General',
            tags: Array.isArray(post.tags) ? post.tags : [],
            likes: post.likes || 0,
            comments: post.comments || 0,
            views: post.views || 0,
            featured: post.featured || false
          };
          
          setBlogPost(transformedPost);
        } else {
          console.error('Failed to fetch blog post');
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPost();
  }, [params.postId]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    // In real app, this would make an API call
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In real app, this would make an API call
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blogPost?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg font-medium">Loading...</p>
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

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Post Not Found</h1>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => router.back()} 
          variant="ghost" 
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">
              {blogPost.category}
            </Badge>
            {blogPost.featured && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                Featured
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {blogPost.title}
          </h1>

          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                  {blogPost.author.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-medium">{blogPost.author.name}</div>
                  <div className="text-sm text-gray-400">Author</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(blogPost.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {blogPost.readTime} min read
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {blogPost.views.toLocaleString()} views
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={handleLike}
              variant="outline"
              className={`${
                isLiked 
                  ? 'bg-red-600/20 border-red-500/50 text-red-400' 
                  : 'border-gray-600 text-gray-400 hover:text-white'
              }`}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {blogPost.likes + (isLiked ? 1 : 0)}
            </Button>
            
            <Button
              onClick={handleBookmark}
              variant="outline"
              className={`${
                isBookmarked 
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                  : 'border-gray-600 text-gray-400 hover:text-white'
              }`}
            >
              <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Saved' : 'Save'}
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Button
              variant="outline"
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {blogPost.comments}
            </Button>
          </div>

          <Separator className="bg-gray-700" />
        </div>

        {/* Article Content */}
        <Card className="bg-gray-800/30 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: cleanContent(blogPost.content) }}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {blogPost.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-gray-700 text-gray-300 hover:bg-gray-600">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {blogPost.author.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">About {blogPost.author.name}</h3>
                <p className="text-gray-300 leading-relaxed">{blogPost.author.bio}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        <Card className="bg-gray-800/30 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Related Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer">
                <h4 className="font-semibold text-white mb-2">Server Boost Guide: Maximizing Your Community</h4>
                <p className="text-gray-400 text-sm">Learn the best practices for using server boosts effectively...</p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer">
                <h4 className="font-semibold text-white mb-2">The Psychology of Online Communities</h4>
                <p className="text-gray-400 text-sm">Understanding what makes Discord communities thrive...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
