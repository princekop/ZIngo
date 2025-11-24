'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Crown, Star, Gift, ShoppingBag, CreditCard, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import '@/styles/store.css';

interface MembershipTier {
  id: string;
  name: string;
  priceInINR: number;
  priceInUSD: number;
  description: string;
  features: string[];
}

interface UserMembership {
  id: string;
  status: string;
  expiresAt: string | null;
  tier: {
    name: string;
  };
}

export default function ByteStorePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        // Fetch membership tiers
        const tiersRes = await fetch('/api/store/tiers');
        if (tiersRes.ok) {
          const tiersData = await tiersRes.json();
          setMembershipTiers(tiersData);
        }

        // Fetch user's current membership
        const membershipRes = await fetch('/api/user/membership');
        if (membershipRes.ok) {
          const membershipData = await membershipRes.json();
          setUserMembership(membershipData);
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchStoreData();
    }
  }, [session]);

  // Setup intersection observer for elements
  useEffect(() => {
    if (!observerRef.current) return;

    const elements = document.querySelectorAll('.fade-in-section');
    elements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      elements.forEach((el) => {
        observerRef.current?.unobserve(el);
      });
    };
  }, [membershipTiers, userMembership]);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePurchase = async (tierId: string, tierName: string) => {
    setPurchaseLoading(tierId);
    try {
      const res = await fetch('/api/store/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId })
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`${tierName} membership activated! You received 2 boosts!`);
        // Refresh data
        window.location.reload();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchaseLoading(null);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-200/80 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden store-container will-change-transform">
      {/* Scroll Progress Indicator */}
      <div 
        className="scroll-progress fixed top-0 left-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 z-50 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400/20 rounded-full particle-float animate-delay-100"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-300/30 rounded-full particle-float animate-delay-300"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-amber-500/15 rounded-full particle-float animate-delay-500"></div>
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-amber-300/25 rounded-full particle-float animate-delay-700"></div>
      </div>
      
      {/* Leather texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-black/40 parallax-bg"></div>
      
      {/* Gold accent lines with shimmer */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-gold-shimmer"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-gold-shimmer"></div>
      
      <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8 relative z-10">
        <div className="space-y-8 md:space-y-12">
          {/* Header */}
          <div id="header" className="text-center fade-in-section animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-4 rounded-full bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 shadow-2xl shadow-amber-500/25 border-2 border-amber-400/30 animate-pulse-glow animate-float">
                <ShoppingBag className="h-8 w-8 text-black font-bold" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gold-gradient mb-4 tracking-wide animate-scale-in">
              Byte Store
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 mx-auto mb-6 rounded-full animate-gold-shimmer"></div>
            <p className="text-amber-100/90 text-xl font-medium animate-fade-in-up animate-delay-200">
              Premium Memberships • Exclusive Features • Server Boosts
            </p>
          </div>

          {/* Current Membership Status */}
          {userMembership && (
            <div id="membership-status" className="fade-in-section animate-slide-in-left">
              <Card className="bg-gradient-to-br from-amber-900/20 via-black/80 to-amber-900/20 border-2 border-amber-400/30 backdrop-blur-sm shadow-2xl shadow-amber-500/10 relative overflow-hidden glass-morphism card-hover-effect">
                {/* Leather texture */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-black/20"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent flex items-center gap-2">
                    <Crown className="h-7 w-7 text-amber-400 drop-shadow-lg animate-float" />
                    Active Membership
                  </CardTitle>
                </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <Badge className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black border-2 border-amber-400/50 text-lg px-4 py-2 mb-3 font-bold shadow-lg">
                      <Sparkles className="h-4 w-4 mr-1" />
                      {userMembership.tier.name}
                    </Badge>
                    <p className="text-amber-100/90 mb-2">
                      Status: <span className="text-amber-400 font-bold">{userMembership.status.toUpperCase()}</span>
                    </p>
                    {userMembership.expiresAt && (
                      <p className="text-amber-100/90">
                        Expires: <span className="text-amber-300 font-semibold">{new Date(userMembership.expiresAt).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-center bg-gradient-to-br from-amber-900/30 to-black/50 p-4 rounded-lg border border-amber-400/20">
                    <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent mb-1">2</div>
                    <div className="text-sm text-amber-200/80 font-medium">Boosts Included</div>
                  </div>
                </div>
              </CardContent>
              </Card>
            </div>
          )}

          {/* Membership Tiers */}
          <div id="membership-tiers" className="fade-in-section animate-fade-in-up animate-delay-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {membershipTiers.map((tier, index) => {
                const isCurrentTier = userMembership?.tier.name === tier.name;
                const isActive = userMembership?.status === 'active';
                
                return (
                  <Card 
                    key={tier.id} 
                    className={`relative overflow-hidden backdrop-blur-sm card-hover-effect glass-morphism will-change-transform gpu-accelerated ${
                      tier.name === 'Byte' 
                        ? 'bg-gradient-to-br from-amber-900/30 via-black/80 to-amber-900/30 border-2 border-amber-400/50 shadow-2xl shadow-amber-500/20 animate-pulse-glow' 
                        : 'bg-gradient-to-br from-gray-900/80 via-black/90 to-gray-900/80 border border-amber-400/20 hover:border-amber-400/40'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                  {/* Leather texture overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-black/10"></div>
                  
                  {tier.name === 'Byte' && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black text-xs font-bold px-3 py-1 rounded-bl-lg shadow-lg border-l border-b border-amber-400/30">
                      PREMIUM
                    </div>
                  )}
                  
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-2xl font-bold ${
                        tier.name === 'Byte' 
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent' 
                          : 'text-amber-100/90'
                      }`}>
                        {tier.name}
                      </CardTitle>
                      {tier.name === 'Byte' && (
                        <Zap className="h-8 w-8 text-amber-400 drop-shadow-lg" />
                      )}
                    </div>
                    <CardDescription className={
                      tier.name === 'Byte' 
                        ? 'text-amber-200/80 font-medium' 
                        : 'text-amber-100/60'
                    }>
                      {tier.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 relative z-10">
                    {/* Pricing */}
                    <div className="text-center bg-gradient-to-br from-black/30 to-amber-900/10 p-4 rounded-lg border border-amber-400/20">
                      <div className={`text-4xl font-bold mb-1 ${
                        tier.name === 'Byte' 
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent' 
                          : 'text-amber-100/90'
                      }`}>
                        ₹{tier.priceInINR}
                      </div>
                      <div className="text-sm text-amber-300/80 font-medium">
                        ${tier.priceInUSD} USD
                      </div>
                      <div className="text-xs text-amber-200/60 mt-1 font-medium">per month</div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className={`h-4 w-4 ${
                            tier.name === 'Byte' ? 'text-amber-400' : 'text-amber-300/70'
                          } drop-shadow-sm`} />
                          <span className={`text-sm font-medium ${
                            tier.name === 'Byte' ? 'text-amber-100/90' : 'text-amber-100/70'
                          }`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                      
                      {/* Boost indicator for Byte tier */}
                      {tier.name === 'Byte' && (
                        <div className="flex items-center gap-3 mt-4 p-3 bg-gradient-to-r from-amber-900/30 via-black/50 to-amber-900/30 rounded-lg border-2 border-amber-400/30 shadow-lg">
                          <Gift className="h-5 w-5 text-amber-400 drop-shadow-lg" />
                          <span className="text-sm text-amber-200 font-bold">
                            Includes 2 Server Boosts (₹20 value)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Purchase Button */}
                    <div className="pt-4">
                      {isCurrentTier && isActive ? (
                        <Button disabled className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black font-bold border-2 border-amber-400/50 shadow-lg">
                          <Crown className="h-4 w-4 mr-2" />
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handlePurchase(tier.id, tier.name)}
                          disabled={purchaseLoading === tier.id}
                          className={`w-full font-bold button-hover-effect will-change-transform ${
                            tier.name === 'Byte'
                              ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black border-2 border-amber-400/50 shadow-2xl shadow-amber-500/25 hover:shadow-amber-400/40 animate-pulse-glow'
                              : 'bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-amber-100 border border-amber-400/30 hover:border-amber-400/50 shadow-lg'
                          }`}
                        >
                          {purchaseLoading === tier.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Get {tier.name}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          </div>

          {/* Benefits Section */}
          <div id="benefits-section" className="fade-in-section animate-slide-in-right animate-delay-500">
            <Card className="bg-gradient-to-br from-amber-900/20 via-black/80 to-amber-900/20 border-2 border-amber-400/30 backdrop-blur-sm shadow-2xl shadow-amber-500/10 relative overflow-hidden glass-morphism card-hover-effect">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-400/10 via-transparent to-amber-600/10 animate-gold-shimmer"></div>
              </div>
              
              {/* Leather texture */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-black/20"></div>
              
              <CardHeader className="relative z-10">
                <CardTitle className="text-3xl text-gold-gradient flex items-center gap-3 justify-center">
                  <Star className="h-8 w-8 text-amber-400 drop-shadow-lg animate-float" />
                Why Choose Byte Premium?
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center bg-gradient-to-br from-amber-900/20 to-black/40 p-6 rounded-xl border border-amber-400/20 card-hover-effect group animate-fade-in-up animate-delay-100">
                  <div className="p-4 rounded-full bg-gradient-to-br from-amber-600/30 to-yellow-500/30 w-fit mx-auto mb-4 border border-amber-400/30 group-hover:animate-pulse-glow transition-all duration-300">
                    <Zap className="h-7 w-7 text-amber-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-bold text-amber-100 mb-3 text-lg">Server Boosts</h3>
                  <p className="text-sm text-amber-200/80 leading-relaxed">Get 2 powerful boosts to enhance any server with premium features</p>
                </div>
                
                <div className="text-center bg-gradient-to-br from-amber-900/20 to-black/40 p-6 rounded-xl border border-amber-400/20 card-hover-effect group animate-fade-in-up animate-delay-200">
                  <div className="p-4 rounded-full bg-gradient-to-br from-amber-600/30 to-yellow-500/30 w-fit mx-auto mb-4 border border-amber-400/30 group-hover:animate-pulse-glow transition-all duration-300">
                    <Crown className="h-7 w-7 text-amber-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-bold text-amber-100 mb-3 text-lg">Premium Features</h3>
                  <p className="text-sm text-amber-200/80 leading-relaxed">Access exclusive tools, customization options, and advanced features</p>
                </div>
                
                <div className="text-center bg-gradient-to-br from-amber-900/20 to-black/40 p-6 rounded-xl border border-amber-400/20 card-hover-effect group animate-fade-in-up animate-delay-300">
                  <div className="p-4 rounded-full bg-gradient-to-br from-amber-600/30 to-yellow-500/30 w-fit mx-auto mb-4 border border-amber-400/30 group-hover:animate-pulse-glow transition-all duration-300">
                    <Gift className="h-7 w-7 text-amber-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-bold text-amber-100 mb-3 text-lg">Great Value</h3>
                  <p className="text-sm text-amber-200/80 leading-relaxed">Premium features at an affordable price with incredible value</p>
                </div>
                
                <div className="text-center bg-gradient-to-br from-amber-900/20 to-black/40 p-6 rounded-xl border border-amber-400/20 card-hover-effect group animate-fade-in-up animate-delay-400">
                  <div className="p-4 rounded-full bg-gradient-to-br from-amber-600/30 to-yellow-500/30 w-fit mx-auto mb-4 border border-amber-400/30 group-hover:animate-pulse-glow transition-all duration-300">
                    <Sparkles className="h-7 w-7 text-amber-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-bold text-amber-100 mb-3 text-lg">Priority Support</h3>
                  <p className="text-sm text-amber-200/80 leading-relaxed">Get help faster with priority assistance from our expert team</p>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Testimonials Section */}
          <div id="testimonials" className="fade-in-section animate-fade-in-up animate-delay-600">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gold-gradient mb-4">What Our Members Say</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-yellow-400 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-amber-900/15 via-black/70 to-amber-900/15 border border-amber-400/20 glass-morphism card-hover-effect animate-slide-in-left animate-delay-100">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center text-black font-bold text-lg mr-4">
                      A
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-100">Alex Chen</h4>
                      <p className="text-amber-200/60 text-sm">Server Owner</p>
                    </div>
                  </div>
                  <p className="text-amber-200/80 italic leading-relaxed">
                    "The server boosts transformed my community. The premium features are incredible and worth every penny!"
                  </p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-4 w-4 text-amber-400 fill-current star-twinkle" 
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-900/15 via-black/70 to-amber-900/15 border border-amber-400/20 glass-morphism card-hover-effect animate-fade-in-up animate-delay-200">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center text-black font-bold text-lg mr-4">
                      S
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-100">Sarah Kim</h4>
                      <p className="text-amber-200/60 text-sm">Community Manager</p>
                    </div>
                  </div>
                  <p className="text-amber-200/80 italic leading-relaxed">
                    "Byte membership gave us the tools we needed to create an amazing experience for our members."
                  </p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-4 w-4 text-amber-400 fill-current star-twinkle" 
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-900/15 via-black/70 to-amber-900/15 border border-amber-400/20 glass-morphism card-hover-effect animate-slide-in-right animate-delay-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center text-black font-bold text-lg mr-4">
                      M
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-100">Mike Rodriguez</h4>
                      <p className="text-amber-200/60 text-sm">Gaming Community</p>
                    </div>
                  </div>
                  <p className="text-amber-200/80 italic leading-relaxed">
                    "The priority support is fantastic. Any issues get resolved quickly and professionally."
                  </p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-4 w-4 text-amber-400 fill-current star-twinkle" 
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <div id="cta" className="fade-in-section animate-scale-in animate-delay-700">
            <Card className="bg-gradient-to-br from-amber-900/30 via-black/80 to-amber-900/30 border-2 border-amber-400/40 glass-morphism relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 via-yellow-300/10 to-amber-400/5 animate-gold-shimmer"></div>
              <CardContent className="p-8 text-center relative z-10">
                <Crown className="h-16 w-16 text-amber-400 mx-auto mb-6 animate-float" />
                <h2 className="text-4xl font-bold text-gold-gradient mb-4">Ready to Upgrade?</h2>
                <p className="text-amber-200/90 text-lg mb-6 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of satisfied members who have transformed their servers with Byte Premium. 
                  Get instant access to all features and start boosting today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gold-gradient">₹99</div>
                    <div className="text-amber-200/70 text-sm">per month</div>
                  </div>
                  <div className="text-amber-300/60">•</div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-amber-200">2 Server Boosts</div>
                    <div className="text-amber-200/70 text-sm">₹20 value included</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
