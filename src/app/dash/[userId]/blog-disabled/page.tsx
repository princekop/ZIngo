'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Filter,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Eye,
  ChevronUp
} from 'lucide-react';
import '@/styles/blog.css';

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
}

export default function BlogPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(6);
  const [scrollToTop, setScrollToTop] = useState(false);

  const handlePostClick = (postId: string) => {
    router.push(`/dash/${params.userId}/blog/${postId}`);
  };

  // Fetch blog data from API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/blog/posts?status=all');
        
        if (response.ok) {
          const posts = await response.json();
          
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
            featured: post.featured || false
          }));
          
          setBlogPosts(transformedPosts);
        } else {
          console.error('Failed to fetch blog posts');
          setBlogPosts([]); // Set empty array if API fails
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setBlogPosts([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setScrollToTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTopHandler = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const categories = ['All', 'Technology', 'Guides', 'Psychology', 'Features', 'Security'];
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handlePostsPerPageChange = (value: string) => {
    setPostsPerPage(parseInt(value));
    setCurrentPage(1);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 blog-container">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 shadow-2xl shadow-blue-500/25">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent mb-4">
            DarkByte Blog
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Insights, guides, and stories from the world of Discord community management
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 blog-fade-in blog-delay-200">
          <div className="relative flex-1 blog-search">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 transition-all duration-300"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Posts per page:</span>
            <select
              value={postsPerPage}
              onChange={(e) => handlePostsPerPageChange(e.target.value)}
              className="bg-gray-800/50 border-gray-700 text-white rounded px-2 py-1 text-sm"
            >
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="18">18</option>
              <option value="24">24</option>
            </select>
          </div>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && selectedCategory === 'All' && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredPosts.slice(0, 2).map((post, index) => (
                <Card 
                  key={post.id} 
                  className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-blue-500/50 blog-card blog-featured cursor-pointer blog-fade-in blog-delay-${300 + index * 100}`}
                  onClick={() => handlePostClick(post.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                        {post.category}
                      </Badge>
                      <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                        Featured
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {post.author.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime} min read
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {searchQuery ? `Search Results (${filteredPosts.length})` : 'Latest Articles'}
            </h2>
            {filteredPosts.length > 0 && (
              <div className="text-sm text-gray-400">
                Showing {startIndex + 1}-{Math.min(startIndex + postsPerPage, filteredPosts.length)} of {filteredPosts.length} posts
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPosts.map((post, index) => (
              <Card 
                key={post.id} 
                className={`bg-gray-800/50 border-gray-700 hover:border-blue-500/50 blog-card cursor-pointer blog-fade-in blog-delay-${100 + (index % 6) * 100}`}
                onClick={() => handlePostClick(post.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                      {post.category}
                    </Badge>
                    {post.featured && (
                      <Badge variant="outline" className="text-yellow-400 border-yellow-500/30 text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300 line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readTime} min
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-gray-400 hover:text-white"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handlePostClick(post.id);
                      }}
                    >
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                className={`${
                  currentPage === page
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredPosts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No articles found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search terms' : 'No articles available at the moment'}
            </p>
          </div>
        )}

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30 mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Get the latest articles, guides, and insights delivered straight to your inbox. 
              Join our community of Discord enthusiasts!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scroll to Top Button */}
      {scrollToTop && (
        <Button
          onClick={scrollToTopHandler}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-2xl transition-all duration-300 hover:scale-110"
          size="sm"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
